import barba from '@barba/core';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  lenis,
  cleanupScroll,
} from './scroll-init';
import { createIcons, ALL_ICONS } from './icons';

const WEB3FORMS_KEY = 'YOUR_WEB3FORMS_KEY';

function typewriter(el: HTMLTextAreaElement, text: string, speed = 18): void {
  el.value = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      el.value += text[i++];
      el.scrollTop = el.scrollHeight;
      setTimeout(tick, speed);
    }
  };
  tick();
}

function bindEnquiryForm(wrap: HTMLElement): void {
  const form    = wrap.querySelector<HTMLFormElement>('.enquiry-form');
  const success = wrap.querySelector<HTMLElement>('.enquiry-success');
  const error   = wrap.querySelector<HTMLElement>('.enquiry-error');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector<HTMLButtonElement>('.enquiry-submit');
    if (btn) btn.disabled = true;
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(form),
      });
      if (res.ok) {
        form.style.display = 'none';
        if (success) success.style.display = 'flex';
      } else {
        throw new Error('submit failed');
      }
    } catch {
      if (btn) btn.disabled = false;
      if (error) error.style.display = 'flex';
    }
  });

  wrap.querySelector<HTMLElement>('.enquiry-retry')?.addEventListener('click', () => {
    if (error) error.style.display = 'none';
    const btn = form.querySelector<HTMLButtonElement>('.enquiry-submit');
    if (btn) btn.disabled = false;
  });
}

function initContactParams(container: HTMLElement): void {
  const params  = new URLSearchParams(window.location.search);
  const course  = params.get('course');
  const partner = params.get('partner');
  const service = params.get('service');
  const intent  = params.get('intent');

  const heading = container.querySelector<HTMLElement>('#contact-form-heading');
  const headingMap: Record<string, string> = {
    developer: 'Applying for a Developer Cohort',
    learn:     'Enquiring About Our Programmes',
    partner:   'Exploring a Partnership',
    general:   'Start a Conversation',
  };
  if (heading) {
    if (course)                          heading.textContent = `Enquiring About: ${course}`;
    else if (intent && headingMap[intent]) heading.textContent = headingMap[intent];
  }

  const form = container.querySelector<HTMLFormElement>('#contact-page-form form');
  if (form) {
    const set = (name: string, val: string | null) => {
      if (!val) return;
      const el = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if (el) el.value = val;
    };
    set('course', course);
    set('partner', partner);
    set('service', service);
    set('intent', intent);

    const msg = form.querySelector<HTMLTextAreaElement>('[name="message"]');
    if (msg && !msg.value.trim()) {
      let message = '';
      if (course)                    message = `Hi Momentum, I'm interested in ${course}${partner ? ` via ${partner}` : ''}.`;
      else if (intent === 'developer') message = "Hi Momentum, I'm a developer interested in joining your next cohort.";
      else if (intent === 'partner')   message = "Hi Momentum, we're interested in partnering with Momentum Collective.";
      else if (service)                message = `Hi Momentum, I'm enquiring about your ${service} service.`;
      if (message) {
        msg.value = message;
        msg.dataset.typewriter = message; // consumed by after-hook onComplete for animation
      }
    }
  }

  const wrap = container.querySelector<HTMLElement>('#contact-page-form');
  if (wrap) bindEnquiryForm(wrap);

}

function getOverlay(): HTMLElement {
  const el = document.querySelector<HTMLElement>('#transition-overlay');
  if (!el) throw new Error('Missing #transition-overlay element');
  return el;
}

function updateNavLinks(path?: string): void {
  const currentPath = (path || window.location.pathname).replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href')?.replace(/\/$/, '') || '/';
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function initPage(container: HTMLElement): void {
  createIcons({ icons: ALL_ICONS });

  cleanupScroll();
  ScrollTrigger.refresh();

  if (container.querySelector('.marquee-track')) {
    import('./marquee').then(({ initMarquee }) => {
      initMarquee();
    });
  }

  // Update relative timestamps on every page transition
  container.querySelectorAll<HTMLElement>('time[data-reltime]').forEach((el) => {
    const iso = el.getAttribute('datetime');
    if (!iso) return;
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = new Date(iso).getTime() - Date.now();
    const abs = Math.abs(diff);
    const sign = diff < 0 ? -1 : 1;
    let label: string;
    if (abs < 60_000)           label = 'just now';
    else if (abs < 3_600_000)   label = rtf.format(sign * Math.round(abs / 60_000), 'minute');
    else if (abs < 86_400_000)  label = rtf.format(sign * Math.round(abs / 3_600_000), 'hour');
    else if (abs < 604_800_000) label = rtf.format(sign * Math.round(abs / 86_400_000), 'day');
    else if (abs < 2_592_000_000) label = rtf.format(sign * Math.round(abs / 604_800_000), 'week');
    else if (abs < 31_536_000_000) label = rtf.format(sign * Math.round(abs / 2_592_000_000), 'month');
    else                        label = rtf.format(sign * Math.round(abs / 31_536_000_000), 'year');
    el.textContent = label;
  });

  // Re-bind course popup handlers on every page transition
  const coursePopupOverlay = container.querySelector<HTMLElement>('#course-popup-overlay');
  const coursePopupBody = container.querySelector<HTMLElement>('#course-popup-body');
  const coursePopupClose = container.querySelector<HTMLElement>('#course-popup-close');

  if (coursePopupOverlay && coursePopupBody && coursePopupClose) {
    const courseData: Record<string, { title: string; meta: string; partner: 'panoramic' | 'hedera'; courses: { name: string; desc: string }[]; ctaText?: string; ctaLink?: string }> = {
      governance: {
        title: 'Business Governance',
        meta: '5 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About Business Governance',
        ctaLink: '/contact?course=Business+Governance&partner=Panoramic+Synergy',
        courses: [
          { name: 'Corporate Governance (ISO 37000)', desc: 'Equip leaders with principles of effective, ethical, and transparent corporate governance.' },
          { name: 'Enterprise Risk Management (ISO 31000, ISO 31050 & COSO)', desc: 'Transform risk from a compliance function into a strategic performance enabler.' },
          { name: 'Compliance Management (ISO 37301)', desc: 'Build robust compliance frameworks that minimise risk and enhance reputation.' },
          { name: 'Anti-Bribery and Whistleblowing (ISO 37001 & ISO 37002)', desc: 'Design systems that detect, prevent, and respond to unethical conduct.' },
          { name: 'Fraud Control and Digital Forensics (ISO 37003 & ISO 27037)', desc: 'Build expertise in detecting, investigating, and mitigating modern fraud threats.' },
        ],
      },
      it: {
        title: 'IT Governance & Management',
        meta: '5 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About IT Governance & Management',
        ctaLink: '/contact?course=IT+Governance+%26+Management&partner=Panoramic+Synergy',
        courses: [
          { name: 'IT Governance (ISO 38500 and COBIT)', desc: 'Design governance structures that align technology with business strategy.' },
          { name: 'IT Service Management (ISO 20000 and ITIL v4)', desc: 'Plan, deliver, and continuously improve IT services following global best practices.' },
          { name: 'Enterprise Architecture & Digital Transformation (ISO 42010)', desc: 'Design and optimise enterprise architectures using TOGAF and ISO 42010 frameworks.' },
          { name: 'Business Continuity (ISO 22301, BCI GPG and DRII PPF)', desc: 'Anticipate, respond to, and recover from disruptive events with confidence.' },
          { name: 'Agile Transformation (ISO 24587, SCRUM and IIBA BABOK)', desc: 'Evolve beyond traditional project models toward an agile, adaptable culture.' },
        ],
      },
      security: {
        title: 'Information & Cyber Security',
        meta: '5 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About Information & Cyber Security',
        ctaLink: '/contact?course=Information+%26+Cyber+Security&partner=Panoramic+Synergy',
        courses: [
          { name: 'Information Security Management (ISO 27001 and CIS Controls)', desc: 'Design and manage an effective Information Security Management System.' },
          { name: 'Cybersecurity Management (ISO 27032 and NIST CSF)', desc: 'Establish holistic cybersecurity programmes aligned with global frameworks.' },
          { name: 'Cloud Security (ISO 27017 and CSA Security Guidance)', desc: 'Secure cloud environments while maximising efficiency and innovation.' },
          { name: 'Information Risk Management (ISO 27005 and NIST 800-37/39)', desc: 'Identify, assess, and treat information security risks systematically.' },
          { name: 'Privacy, Data Protection & Payment Security (ISO 29100, ISO 27701 and PCI DSS)', desc: 'Manage privacy, protect personal data, and secure payment systems.' },
        ],
      },
      ai: {
        title: 'Artificial Intelligence',
        meta: '9 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About AI Courses',
        ctaLink: '/contact?course=Artificial+Intelligence&partner=Panoramic+Synergy',
        courses: [
          { name: 'Qualified AI Foundation (QAIF)', desc: 'Responsible and effective use of generative AI tools for daily business productivity.' },
          { name: 'Qualified AI Associate (QAIA)', desc: 'Apply AI solutions across HR, Finance, Supply Chain, and Project Management.' },
          { name: 'Qualified AI Specialist (QAIS)', desc: 'Advanced AI principles, ethics, and trustworthy AI practices (ISO 22989, ISO 24368).' },
          { name: 'Qualified AI ML Practitioner (QAIMLP)', desc: 'Machine learning principles with a focus on data quality, bias mitigation, and transparency.' },
          { name: 'Qualified AI Practitioner (QAIP)', desc: 'Implement and manage AI projects throughout their full lifecycle (ISO 5338, ISO 42005).' },
          { name: 'Qualified AI Cybersecurity Practitioner (QAICP)', desc: 'Protect AI systems against emerging cybersecurity threats (ISO 27090, NIST AI RMF).' },
          { name: 'Qualified AI Management System Lead Implementer (QAIMS-LI)', desc: 'Lead the establishment of AI Management Systems aligned with ISO 42001.' },
          { name: 'Qualified AI Management System Lead Auditor (QAIMS-LA)', desc: 'Audit AI Management Systems effectively and ensure compliance with ISO 42001.' },
          { name: 'Qualified AI Executive (QAIE)', desc: 'Empower executives to drive strategic AI adoption, governance, and culture.' },
        ],
      },
      hse: {
        title: 'Quality & HSE Management',
        meta: '5 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About Quality & HSE Management',
        ctaLink: '/contact?course=Quality+%26+HSE+Management&partner=Panoramic+Synergy',
        courses: [
          { name: 'Quality Management (ISO 9001 and Lean Six Sigma)', desc: 'Drive operational excellence through quality standards and process improvement methodologies.' },
          { name: 'Health and Safety (ISO 45001)', desc: 'Design and maintain an effective Occupational Health and Safety Management System.' },
          { name: 'Environmental Management (ISO 14001)', desc: 'Manage environmental responsibilities and minimise organisational impact systematically.' },
          { name: 'Project Management (ISO 21502, PRINCE2 and PMI PMP)', desc: 'Lead successful projects using globally recognised frameworks for scope, time, and cost.' },
          { name: 'Innovation Management (ISO 56001)', desc: 'Design and implement innovation management systems that drive creativity and growth.' },
        ],
      },
      sustainability: {
        title: 'Sustainability',
        meta: '5 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About Sustainability Courses',
        ctaLink: '/contact?course=Sustainability&partner=Panoramic+Synergy',
        courses: [
          { name: 'Environment, Social and Governance – ESG (ISO IWA 48)', desc: 'Design, implement, and report ESG strategies for sustainable and ethical performance.' },
          { name: 'Sustainable Development Goals (ISO 53001 and ISO 53002)', desc: 'Align business strategy and operations with the UN Sustainable Development Goals.' },
          { name: 'Climate Adaptation & Greenhouse Gases (ISO 14090 and ISO 14064)', desc: 'Assess climate risks, plan adaptation strategies, and measure greenhouse gas emissions.' },
          { name: 'Asset Management (ISO 55001)', desc: 'Manage physical, financial, and intellectual assets efficiently across their lifecycle.' },
          { name: 'Facility Management (ISO 41001)', desc: 'Establish and manage efficient, safe, and sustainable facilities in line with global standards.' },
        ],
      },
      hr: {
        title: 'Human Resource Management',
        meta: '5 Courses · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About HR Management Courses',
        ctaLink: '/contact?course=Human+Resource+Management&partner=Panoramic+Synergy',
        courses: [
          { name: 'Employee Engagement and Recruitment (ISO 23326 and ISO 30405)', desc: 'Attract, select, and retain top talent using evidence-based approaches.' },
          { name: 'Human Governance and Workforce Planning (ISO 30408 and ISO 30409)', desc: 'Design effective workforce governance systems and long-term planning structures.' },
          { name: 'Learning, Development and Knowledge Management (ISO 30422, ISO 30437 and ISO 30401)', desc: 'Build learning and knowledge management systems that drive innovation and performance.' },
          { name: 'Reporting, Diversity and Inclusion (ISO 30414 and ISO 30415)', desc: 'Build inclusive, equitable workplaces guided by ISO diversity and reporting standards.' },
          { name: 'Metrics Management (ISO 30403, ISO 30406 and ISO 30428)', desc: 'Measure and optimise workforce performance using globally recognised HR analytics.' },
        ],
      },
      smp: {
        title: 'Business School — SMP',
        meta: '5 Modules · Panoramic Synergy',
        partner: 'panoramic',
        ctaText: 'Enquire About the SMARTER Manager Program',
        ctaLink: '/contact?course=Business+School+SMP&partner=Panoramic+Synergy',
        courses: [
          { name: 'Strategy & Governance', desc: 'Master strategic thinking and governance frameworks to drive sustainable organisational performance.' },
          { name: 'Leadership Excellence', desc: 'Develop transformational leaders who inspire teams and foster a culture of accountability.' },
          { name: 'Growth, Marketing & Customer Value', desc: 'Create market-driven strategies that attract customers and fuel sustainable business growth.' },
          { name: 'Operations, Projects & Supply Excellence', desc: 'Optimise operational performance, manage projects efficiently, and build resilient supply systems.' },
          { name: 'People, Finance and Digital Transformation', desc: 'Lead digital, financial, and people transformation initiatives in a fast-evolving business world.' },
        ],
      },
      'hedera-m1': {
        title: 'Module 1: Introduction to Web3 & Hedera',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Introduction to Web3 & Hedera',
        ctaLink: '/contact?course=Introduction+to+Web3+%26+Hedera&partner=Hedera+Academy',
        courses: [
          { name: 'Decentralised Ledger Technology Fundamentals', desc: 'Understand the foundational principles of DLT and how it underpins Web3 and blockchain ecosystems.' },
          { name: 'Web3 and Hedera Concepts', desc: 'Explore core Web3 principles and how Hedera\'s architecture and governance model differ from traditional blockchains.' },
          { name: 'Hedera Governing Council', desc: 'Learn how Hedera\'s unique council-based governance structure ensures decentralisation and enterprise trust.' },
          { name: 'Network Growth Across Africa and Beyond', desc: 'Discover how the Hedera network is expanding across 20+ countries, with a focus on African markets.' },
        ],
      },
      'hedera-m2': {
        title: 'Module 2: Hedera Network Architecture',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Hedera Network Architecture',
        ctaLink: '/contact?course=Hedera+Network+Architecture&partner=Hedera+Academy',
        courses: [
          { name: 'Network Overview & Nodes', desc: 'Understand the roles of consensus nodes and mirror nodes within the Hedera network.' },
          { name: 'Hedera Core Services', desc: 'Explore the three core services: Hedera Consensus Service, Token Service, and Smart Contract Service.' },
          { name: 'Mirror Node API & Network Explorer', desc: 'Query the Hedera network using the Mirror Node REST API and interpret data via the Network Explorer.' },
          { name: 'Lab: Set Up a TestNet Account', desc: 'Hands-on lab to create and configure your first Hedera TestNet account and explore the developer portal.' },
        ],
      },
      'hedera-m3': {
        title: 'Module 3: Hedera Core Concepts',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Hedera Core Concepts',
        ctaLink: '/contact?course=Hedera+Core+Concepts&partner=Hedera+Academy',
        courses: [
          { name: 'Crypto Economy & Accounts', desc: 'Learn how HBAR, Hedera\'s native currency, powers the network economy and how accounts are structured.' },
          { name: 'Keys, Signatures & Transactions', desc: 'Understand how cryptographic keys and signatures authorise transactions on the Hedera ledger.' },
          { name: 'Scheduled Transactions & Queries', desc: 'Explore Hedera\'s scheduled transaction model and how to query ledger state and history.' },
          { name: 'Hedera Improvement Proposals (HIPs)', desc: 'Learn how the HIP process drives protocol evolution and community-led improvements to the network.' },
        ],
      },
      'hedera-m4': {
        title: 'Module 4: Hedera Developer Fundamentals',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Hedera Developer Fundamentals',
        ctaLink: '/contact?course=Hedera+Developer+Fundamentals&partner=Hedera+Academy',
        courses: [
          { name: 'SDKs & Developer Tools', desc: 'Get acquainted with official Hedera SDKs (JavaScript, Java, Go) and the broader developer tooling ecosystem.' },
          { name: 'Lab: Environment Setup & Hedera Client', desc: 'Configure your development environment and initialise a Hedera client connected to TestNet.' },
          { name: 'Lab: Create an Account', desc: 'Programmatically create Hedera accounts and manage keys using the SDK.' },
          { name: 'Lab: Transfer HBAR & Query Ledger Data', desc: 'Execute HBAR transfers between accounts and query transaction records from the ledger.' },
        ],
      },
      'hedera-m5': {
        title: 'Module 5: Local Network Setup',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Local Network Setup',
        ctaLink: '/contact?course=Local+Network+Setup&partner=Hedera+Academy',
        courses: [
          { name: 'Local Development Environment Architecture', desc: 'Understand the components required to run a local Hedera network for rapid, offline development.' },
          { name: 'Lab: Local Network Setup', desc: 'Step-by-step lab to configure and run a fully functional local Hedera network on your machine.' },
        ],
      },
      'hedera-m6': {
        title: 'Module 6: Hedera Consensus Service',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Hedera Consensus Service',
        ctaLink: '/contact?course=Hedera+Consensus+Service&partner=Hedera+Academy',
        courses: [
          { name: 'HCS Deep-Dive', desc: 'A comprehensive study of the Hedera Consensus Service — its architecture, throughput, and finality guarantees.' },
          { name: 'Tamper-Proof Messaging & Audit Logs', desc: 'Explore real-world HCS use cases including immutable messaging streams and verifiable audit trail systems.' },
          { name: 'Lab: HCS Implementation', desc: 'Build and submit messages to an HCS topic and verify ordered, timestamped consensus records.' },
        ],
      },
      'hedera-m7': {
        title: 'Module 7: Hedera Token Service',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Hedera Token Service',
        ctaLink: '/contact?course=Hedera+Token+Service&partner=Hedera+Academy',
        courses: [
          { name: 'Fungible Tokens on Hedera', desc: 'Design and issue fungible tokens using HTS — covering supply controls, KYC flags, and freeze functionality.' },
          { name: 'Non-Fungible Tokens (NFTs)', desc: 'Mint and manage NFTs on Hedera, including metadata standards and royalty configurations.' },
          { name: 'Lab: Creating Fungible Tokens', desc: 'Hands-on creation and management of a fungible token using the Hedera Token Service.' },
          { name: 'Lab: Creating Non-Fungible Tokens', desc: 'Mint an NFT collection on Hedera TestNet and transfer tokens between accounts.' },
        ],
      },
      'hedera-m8': {
        title: 'Module 8: dApp Workshop',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for the dApp Workshop',
        ctaLink: '/contact?course=dApp+Workshop&partner=Hedera+Academy',
        courses: [
          { name: 'Decentralised Application Architecture', desc: 'Learn the anatomy of a dApp — frontend, wallet integration, and Hedera backend services.' },
          { name: 'Deploying Your First dApp on Hedera', desc: 'Walk through the full deployment lifecycle of a decentralised application on the Hedera network.' },
          { name: 'Lab: Deploy Your First dApp', desc: 'Build and deploy a working dApp on Hedera TestNet, integrating with wallet and consensus services.' },
        ],
      },
      'hedera-m9': {
        title: 'Module 9: Hedera Smart Contract Service',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Hedera Smart Contract Service',
        ctaLink: '/contact?course=Hedera+Smart+Contract+Service&partner=Hedera+Academy',
        courses: [
          { name: 'Smart Contracts on Hedera', desc: 'Understand how Hedera\'s EVM-compatible Smart Contract Service enables Solidity development with added performance.' },
          { name: 'Interoperability with EVM Tools', desc: 'Leverage familiar Ethereum tooling (Hardhat, Ethers.js) alongside Hedera\'s SDK for hybrid dApp development.' },
          { name: 'Lab: Smart Contract with Solidity', desc: 'Write, compile, and deploy a Solidity smart contract to Hedera TestNet using the HSCS.' },
          { name: 'Lab: Smart Contract App with MetaMask & Ethers JS', desc: 'Build a front-end application that interacts with your deployed smart contract via MetaMask and Ethers.js.' },
        ],
      },
      'hedera-m10': {
        title: 'Module 10: JSON-RPC Relay',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for JSON-RPC Relay',
        ctaLink: '/contact?course=JSON-RPC+Relay&partner=Hedera+Academy',
        courses: [
          { name: 'JSON-RPC Architecture on Hedera', desc: 'Understand how the Hedera JSON-RPC relay bridges EVM-compatible tools to native Hedera services.' },
          { name: 'RPC Relay Configuration', desc: 'Configure and run a JSON-RPC relay node to enable Ethereum-style RPC connectivity to Hedera.' },
          { name: 'Lab: RPC Connectivity Implementation', desc: 'Connect Ethereum developer tools to Hedera TestNet via the JSON-RPC relay and execute transactions.' },
        ],
      },
      'hedera-m11': {
        title: 'Module 11: Interoperability',
        meta: 'Hedera Academy',
        partner: 'hedera',
        ctaText: 'Register for Interoperability',
        ctaLink: '/contact?course=Hedera+Interoperability&partner=Hedera+Academy',
        courses: [
          { name: 'Token Association on Hedera', desc: 'Learn the token association model that governs how accounts opt-in to receive HTS tokens.' },
          { name: 'MetaMask Integration', desc: 'Configure MetaMask to interact with Hedera\'s JSON-RPC relay and manage accounts across ecosystems.' },
          { name: 'Lab: Token Associator Using MetaMask', desc: 'Build a UI that allows users to associate HTS tokens with their Hedera account via MetaMask.' },
          { name: 'Lab: Complex Smart Contract App (Counter with Parts Inventory)', desc: 'Develop a multi-component smart contract application integrating state management and inventory tracking on Hedera.' },
        ],
      },
    };

    type CourseEntry = { title: string; meta: string; partner: 'panoramic' | 'hedera'; courses: { name: string; desc: string }[]; ctaText?: string; ctaLink?: string };

    const renderStep1 = (data: CourseEntry): string => {
      const items = data.partner === 'panoramic'
        ? data.courses.map(c =>
            `<li class="card-course-item js-popup-enquire-specific" data-course="${c.name}" role="button" tabindex="0">` +
              `<div class="card-course-item-content">` +
                `<div class="card-course-item-header">` +
                  `<span class="card-course-list-name">${c.name}</span>` +
                  `<span class="card-course-item-cta" aria-hidden="true">Enquire →</span>` +
                `</div>` +
                `<span class="card-course-list-desc">${c.desc}</span>` +
              `</div>` +
            `</li>`
          ).join('')
        : data.courses.map(c =>
            `<li>` +
              `<span class="card-course-list-name">${c.name}</span>` +
              `<span class="card-course-list-desc">${c.desc}</span>` +
            `</li>`
          ).join('');
      return (
        `<h3 class="course-popup-title">${data.title}</h3>` +
        `<p class="course-popup-meta">${data.meta}</p>` +
        `<ul class="card-course-list">${items}</ul>` +
        `<button class="btn btn-primary course-popup-cta js-popup-enquire">` +
          `${data.ctaText ?? 'Enquire About Enrolment'}` +
        `</button>`
      );
    };

    const renderStep2 = (data: CourseEntry, specificCourse?: string): string => {
      const partnerName = data.meta.includes(' · ')
        ? data.meta.split(' · ').pop()!
        : data.meta;
      const courseName  = specificCourse ?? data.title;
      const defaultMsg  = `Hi Momentum, I'm interested in ${courseName} via ${partnerName}.`;
      return (
        `<button class="course-popup-back js-popup-back">← Back</button>` +
        `<h3 class="course-popup-title">Register Your Interest</h3>` +
        `<p class="course-popup-meta">${courseName} · ${partnerName}</p>` +
        `<div class="enquiry-form-wrap" id="popup-form-wrap">` +
          `<form class="enquiry-form enquiry-form--compact">` +
            `<input type="hidden" name="access_key"  value="${WEB3FORMS_KEY}" />` +
            `<input type="hidden" name="subject"     value="Course Enquiry — ${courseName}" />` +
            `<input type="hidden" name="from_name"   value="Momentum Website" />` +
            `<input type="hidden" name="course"      value="${courseName}" />` +
            `<input type="hidden" name="partner"     value="${partnerName}" />` +
            `<input type="hidden" name="source"      value="/courses" />` +
            `<input type="checkbox" name="botcheck"  style="display:none" tabindex="-1" />` +
            `<input type="text"  name="name"  class="enquiry-input" placeholder="Your name"       required />` +
            `<input type="email" name="email" class="enquiry-input" placeholder="your@email.com"  required />` +
            `<textarea name="message" class="enquiry-textarea" rows="5">${defaultMsg}</textarea>` +
            `<button type="submit" class="btn btn-primary enquiry-submit">Send Enquiry</button>` +
          `</form>` +
          `<div class="enquiry-success" style="display:none">` +
            `<i data-lucide="check-circle-2"></i>` +
            `<p>We've received your enquiry about <strong>${courseName}</strong>. We'll be in touch.</p>` +
          `</div>` +
          `<div class="enquiry-error" style="display:none">` +
            `<p>Something went wrong. Please try again.</p>` +
            `<button class="btn btn-outline enquiry-retry">Retry</button>` +
          `</div>` +
        `</div>`
      );
    };

    let activeCategory = '';

    const openPopup = (categoryKey: string, directToEnquiry = false) => {
      const data = courseData[categoryKey];
      if (!data) return;
      activeCategory = categoryKey;
      if (directToEnquiry) {
        coursePopupBody.innerHTML = renderStep2(data);
        createIcons({ icons: ALL_ICONS });
        const wrap = coursePopupBody.querySelector<HTMLElement>('#popup-form-wrap');
        if (wrap) bindEnquiryForm(wrap);
        const ta = coursePopupBody.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
        if (ta) { const text = ta.value; ta.value = ''; setTimeout(() => typewriter(ta, text), 150); }
      } else {
        coursePopupBody.innerHTML = renderStep1(data);
      }
      coursePopupOverlay.classList.add('is-open');
      coursePopupOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      coursePopupClose.focus();
    };

    const closePopup = () => {
      coursePopupOverlay.classList.remove('is-open');
      coursePopupOverlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      activeCategory = '';
    };

    // Event delegation for popup step switching
    coursePopupBody.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      // Per-course individual enquiry button
      if (target.closest('.js-popup-enquire-specific')) {
        const btn = target.closest<HTMLElement>('.js-popup-enquire-specific');
        const specificCourse = btn?.dataset.course ?? '';
        const data = courseData[activeCategory];
        if (!data) return;
        coursePopupBody.innerHTML = renderStep2(data, specificCourse);
        createIcons({ icons: ALL_ICONS });
        const wrap = coursePopupBody.querySelector<HTMLElement>('#popup-form-wrap');
        if (wrap) bindEnquiryForm(wrap);
        const ta = coursePopupBody.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
        if (ta) { const text = ta.value; ta.value = ''; setTimeout(() => typewriter(ta, text), 150); }
        return;
      }

      // Category-level enquiry CTA
      if (target.closest('.js-popup-enquire')) {
        const data = courseData[activeCategory];
        if (!data) return;
        coursePopupBody.innerHTML = renderStep2(data);
        createIcons({ icons: ALL_ICONS });
        const wrap = coursePopupBody.querySelector<HTMLElement>('#popup-form-wrap');
        if (wrap) bindEnquiryForm(wrap);
        const ta = coursePopupBody.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
        if (ta) { const text = ta.value; ta.value = ''; setTimeout(() => typewriter(ta, text), 150); }
        return;
      }

      if (target.closest('.js-popup-back')) {
        const data = courseData[activeCategory];
        if (data) coursePopupBody.innerHTML = renderStep1(data);
      }
    });

    container.querySelectorAll<HTMLElement>('.course-popup-trigger').forEach(btn => {
      btn.addEventListener('click', () => openPopup(btn.dataset.category ?? ''));
    });

    container.querySelectorAll<HTMLElement>('.course-enquire-direct').forEach(btn => {
      btn.addEventListener('click', () => openPopup(btn.dataset.category ?? '', true));
    });

    coursePopupClose.addEventListener('click', closePopup);

    coursePopupOverlay.addEventListener('click', (e) => {
      if (e.target === coursePopupOverlay) closePopup();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && coursePopupOverlay.classList.contains('is-open')) closePopup();
    });
  }

  // Init contact page form and URL param pre-filling
  if (container.querySelector('#contact-page-form')) {
    initContactParams(container);
  }

  // Re-bind intent card handlers on every page transition
  const intentCards = container.querySelectorAll<HTMLElement>('.intent-card');
  if (intentCards.length > 0) {
    const stickyBar = container.querySelector<HTMLElement>('#intent-sticky');
    const stickyLabel = container.querySelector<HTMLElement>('#intent-sticky-label');
    const stickyCta = container.querySelector<HTMLAnchorElement>('#intent-sticky-cta');
    const stickyCtaText = container.querySelector<HTMLElement>('#intent-sticky-cta-text');
    const stickyClose = container.querySelector<HTMLElement>('#intent-sticky-close');

    const intentMessages: Record<string, { label: string; cta: string }> = {
      developer: { label: 'Ready to join a cohort?', cta: 'Apply now' },
      train: { label: 'Ready to train your team?', cta: 'Enquire about cohorts' },
      hackathon: { label: 'Interested in joining a hackathon?', cta: 'Register your interest' },
      partner: { label: 'Ready to partner with us?', cta: 'Start a conversation' },
    };

    intentCards.forEach((card) => {
      card.addEventListener('click', () => {
        intentCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        const intent = card.dataset.intent ?? '';
        const msg = intentMessages[intent];


        if (stickyLabel && msg) stickyLabel.textContent = msg.label;
        if (stickyCtaText && msg) stickyCtaText.textContent = msg.cta;
        if (stickyCta) {
          const intentLinks: Record<string, string> = {
            developer: '/contact?intent=developer&service=cohorts#contact-form-section',
            train:     '/contact?intent=learn&service=masterclasses#contact-form-section',
            partner:   '/contact?intent=partner#contact-form-section',
          };
          stickyCta.href = intentLinks[intent] ?? '/contact#contact-form-section';
        }
        stickyBar?.classList.add('visible');
        stickyBar?.removeAttribute('aria-hidden');
      });
    });

    stickyClose?.addEventListener('click', () => {
      stickyBar?.classList.remove('visible');
      stickyBar?.setAttribute('aria-hidden', 'true');
      intentCards.forEach((c) => c.classList.remove('active'));
    });
  }
}

// Capture hash from clicked links before Barba strips it from history.pushState
let pendingScrollHash = '';
document.addEventListener(
  'click',
  (e) => {
    const anchor = (e.target as Element)?.closest<HTMLAnchorElement>('a[href]');
    if (!anchor) return;
    try {
      const url = new URL(anchor.href, window.location.href);
      if (url.origin === window.location.origin && url.hash) {
        pendingScrollHash = url.hash;
      }
    } catch {
      /* ignore */
    }
  },
  true,
);

barba.init({
  transitions: [
    {
      name: 'kente-wipe',

      once({ next }) {
        lenis.start();
        updateNavLinks();
        initPage(next.container);
      },

      leave(data: any) {
        const overlay = getOverlay();
        lenis.stop();

        return new Promise<void>((resolve) => {
          gsap
            .timeline({ onComplete: resolve })
            .to(overlay, {
              clipPath: 'inset(0 0% 0 0)',
              duration: 0.6,
              ease: 'power4.inOut',
            })
            .call(() => {
              if (data.next?.url?.path) {
                updateNavLinks(data.next.url.path);
              }
            })
            .to(
              data.current.container,
              { opacity: 0, duration: 0.1 },
              '-=0.1',
            );
        });
      },

      enter({ next }) {
        const overlay = getOverlay();

        window.scrollTo(0, 0);
        lenis.scrollTo(0, { immediate: true });

        return new Promise<void>((resolve) => {
          gsap
            .timeline({ onComplete: resolve })
            .set(next.container, { opacity: 1 })
            .to(overlay, {
              clipPath: 'inset(0 100% 0 0)',
              duration: 0.6,
              ease: 'power4.inOut',
            });
        });
      },

      after({ next }) {
        lenis.start();
        initPage(next.container);

        // Use pendingScrollHash because Barba strips the hash from history.pushState,
        // making window.location.hash empty by the time `after` fires.
        if (pendingScrollHash) {
          const hash = pendingScrollHash;
          pendingScrollHash = '';
          setTimeout(() => {
            const target = document.querySelector<HTMLElement>(hash);
            if (target) {
              lenis.scrollTo(target, {
                offset: -80,
                onComplete: () => {
                  // Typewriter animation for pre-filled form message
                  const ta = document.querySelector<HTMLTextAreaElement>('[data-typewriter]');
                  if (ta) {
                    const text = ta.dataset.typewriter ?? '';
                    delete ta.dataset.typewriter;
                    typewriter(ta, text);
                  }
                },
              });
            }
          }, 300);
        }
      },
    },
  ],
});

# Astro Migration Guide - Momentum Collective

## Migration Summary

Your static HTML website has been successfully migrated to **Astro** while preserving all content, structure, and functionality.

## What Was Migrated

### ✅ Pages Converted to Astro
- `home.html` → `src/pages/index.astro` (Homepage at `/`)
- `about.html` → `src/pages/about.astro` (About page at `/about`)
- `apps.html` → `src/pages/apps.astro` (Apps page at `/apps`)
- `services.html` → `src/pages/services.astro` (Services page at `/services`)
- `contact.html` → `src/pages/contact.astro` (Contact page at `/contact`)

### ✅ Static Assets Preserved
- `immuno.html` → `public/immuno.html` (Accessible at `/immuno.html`)
- `fm-index.html` → `public/fm-index.html` (Accessible at `/fm-index.html`)
- `styles.css` → `public/styles.css`
- `script.js` → `public/script.js`
- `assets/` → `public/assets/`

### ✅ Components Created
- `src/layouts/BaseLayout.astro` - Shared layout with navbar and footer

## Project Structure

```
astro-site/
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro      # Reusable layout with nav & footer
│   └── pages/
│       ├── index.astro            # Homepage
│       ├── about.astro            # About page
│       ├── apps.astro             # Apps page
│       ├── services.astro         # Services page
│       └── contact.astro          # Contact page
├── public/
│   ├── assets/                    # Images and Bootstrap files
│   ├── styles.css                 # Global styles
│   ├── script.js                  # Client-side JavaScript
│   ├── immuno.html               # Immuno app landing page
│   └── fm-index.html             # FreshMarikiti landing page
└── package.json
```

## Key Changes

### 1. **Routing**
Astro uses file-based routing:
- Old: `home.html` → New: `/` (index.astro)
- Old: `about.html` → New: `/about` (about.astro)
- Old: `apps.html` → New: `/apps` (apps.astro)

### 2. **Navigation Links**
All internal links have been updated from `.html` extensions to clean URLs:
- `home.html` → `/`
- `about.html` → `/about`
- `apps.html` → `/apps`

### 3. **Asset Paths**
All asset paths now use absolute paths from the public directory:
- Old: `assets/logo.png`
- New: `/assets/logo.png`

### 4. **Shared Layout**
The navbar and footer have been extracted into `BaseLayout.astro`, eliminating code duplication across pages.

## Running the Project

### Development Server
```bash
cd astro-site
bun run dev
```
Visit: http://localhost:4321

### Build for Production
```bash
cd astro-site
bun run build
```
Output: `dist/` directory with optimized static files

### Preview Production Build
```bash
cd astro-site
bun run preview
```

## Benefits of Astro Migration

### 🚀 Performance
- **Zero JavaScript by default** - Only loads what's needed
- **Static Site Generation (SSG)** - Fast page loads
- **Optimized builds** - Smaller bundle sizes

### 🛠️ Developer Experience
- **Component-based** - Reusable layouts and components
- **Hot Module Replacement (HMR)** - Instant updates during development
- **TypeScript support** - Better type safety
- **Modern tooling** - Built-in optimization

### 📦 Maintainability
- **DRY principle** - Shared layout eliminates duplication
- **Easy updates** - Change navbar/footer once, applies everywhere
- **Scalability** - Add new pages easily

### 🎨 Flexibility
- **Keep existing CSS** - Your styles.css works as-is
- **Keep existing JS** - Your script.js works unchanged
- **Gradual enhancement** - Can add React, Vue, etc. later if needed

## Next Steps (Optional Enhancements)

### 1. Component Extraction
Consider extracting repeated elements into components:
```astro
// src/components/AppCard.astro
---
interface Props {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  link: string;
}
---
```

### 2. Image Optimization
Use Astro's built-in image optimization:
```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/logo.png';
---
<Image src={logo} alt="Logo" />
```

### 3. SEO Enhancements
Add structured data, sitemaps, and RSS feeds using Astro integrations.

### 4. Add Frameworks (Optional)
If needed, add React, Vue, or other frameworks:
```bash
bun astro add react
```

## Deployment

### Vercel
```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel
```

### Netlify
```bash
# Build command: bun run build
# Publish directory: dist
```

### GitHub Pages
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

## Troubleshooting

### Issue: Styles not loading
**Solution**: Ensure all CSS paths in BaseLayout.astro start with `/`

### Issue: Images not showing
**Solution**: Move images to `public/assets/` and reference as `/assets/image.png`

### Issue: JavaScript not working
**Solution**: Check that script.js is in `public/` and loaded in BaseLayout.astro

## Reverting to Original

Your original HTML files are still in the parent directory:
```bash
cd /home/ngash/Documents/momentum/Momentum-Collective
# Original files: home.html, about.html, etc.
```

## Support

- **Astro Docs**: https://docs.astro.build
- **Astro Discord**: https://astro.build/chat
- **Migration Issues**: Check the Astro migration guide

---

**Migration completed successfully!** 🎉

All your content, styling, and functionality has been preserved while gaining the benefits of a modern static site framework.

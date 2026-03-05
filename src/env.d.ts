/// <reference types="astro/client" />

declare module '@barba/core' {
  interface TransitionData {
    current: {
      container: HTMLElement;
      namespace: string;
    };
    next: {
      container: HTMLElement;
      namespace: string;
    };
    trigger?: Element;
  }

  interface TransitionHooks {
    name?: string;
    from?: { namespace?: string | string[] };
    to?: { namespace?: string | string[] };
    once?: (data: TransitionData) => void | Promise<void>;
    leave?: (data: TransitionData) => void | Promise<void>;
    enter?: (data: TransitionData) => void | Promise<void>;
    after?: (data: TransitionData) => void | Promise<void>;
    before?: (data: TransitionData) => void | Promise<void>;
    afterEnter?: (data: TransitionData) => void | Promise<void>;
  }

  interface View {
    namespace: string;
    beforeEnter?: (data: TransitionData) => void | Promise<void>;
    afterEnter?: (data: TransitionData) => void | Promise<void>;
    beforeLeave?: (data: TransitionData) => void | Promise<void>;
    afterLeave?: (data: TransitionData) => void | Promise<void>;
  }

  interface BarbaConfig {
    transitions: TransitionHooks[];
    views?: View[];
    prefetchIgnore?: boolean;
  }

  function init(config: BarbaConfig): void;
}

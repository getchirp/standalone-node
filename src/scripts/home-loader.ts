let homeLoad: Promise<void> | undefined;

const loadHome = () => {
  homeLoad ??= import('./home').then(({ initHome }) => initHome());
  return homeLoad;
};

const scheduleHome = () => {
  const idleWindow = window as typeof window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  let started = false;
  let idleHandle: number | undefined;
  let fallbackHandle: number | undefined;
  let observer: IntersectionObserver | undefined;

  const interactionEvents = ['pointerdown', 'keydown', 'focusin'] as const;
  const cleanup = () => {
    observer?.disconnect();
    interactionEvents.forEach((eventName) => {
      document.removeEventListener(eventName, start, true);
    });
    if (idleHandle !== undefined && idleWindow.cancelIdleCallback) {
      idleWindow.cancelIdleCallback(idleHandle);
    }
    if (fallbackHandle !== undefined) window.clearTimeout(fallbackHandle);
  };
  const start = () => {
    if (started) return;
    started = true;
    cleanup();
    void loadHome();
  };

  interactionEvents.forEach((eventName) => {
    document.addEventListener(eventName, start, true);
  });

  const watchTargets = document.querySelectorAll<HTMLElement>(
    '[data-interactive], [data-terminal-output], [data-home-song]'
  );
  if ('IntersectionObserver' in window && watchTargets.length) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) start();
    }, { rootMargin: '256px' });
    watchTargets.forEach((target) => observer?.observe(target));
  }

  if (idleWindow.requestIdleCallback) {
    idleHandle = idleWindow.requestIdleCallback(start, { timeout: 1500 });
  } else {
    fallbackHandle = window.setTimeout(start, 1500);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleHome, { once: true });
} else {
  scheduleHome();
}

export {};

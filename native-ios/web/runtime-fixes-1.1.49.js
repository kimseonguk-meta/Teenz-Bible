(() => {
  'use strict';

  const PATCH_VERSION = '1.1.49';
  const BIBLE_AI_ENDPOINT = 'https://teenzbible.manus.space/api/bible-ai';
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  const isNativePlatform = () => {
    try {
      return Boolean(window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform());
    } catch {
      return false;
    }
  };

  // Firebase Hosting is a static SPA host. A relative /api/bible-ai POST returns index.html
  // with HTTP 200 rather than an AI JSON response. Route only this web request to the live API.
  if (originalFetch) {
    window.fetch = function teenzBiblePatchedFetch(input, init) {
      const rawUrl = typeof input === 'string' ? input : input && input.url;
      let url;
      try {
        url = rawUrl ? new URL(rawUrl, window.location.href) : null;
      } catch {
        url = null;
      }
      const isBibleAiRequest = url && url.pathname === '/api/bible-ai';
      if (isBibleAiRequest) {
        return originalFetch(BIBLE_AI_ENDPOINT, init).then((response) => {
          const contentType = response.headers.get('content-type') || '';
          if (!response.ok || !contentType.includes('application/json')) {
            throw new Error(`Bible AI endpoint returned ${response.status} ${contentType || 'without JSON'}`);
          }
          return response;
        });
      }
      return originalFetch(input, init);
    };
  }

  const updateViewportState = () => {
    const width = Math.round(window.visualViewport ? window.visualViewport.width : window.innerWidth);
    document.documentElement.style.setProperty('--tb-visual-viewport-width', `${width}px`);
    // Leaflet and other viewport-sensitive components re-measure after iOS URL bar and rotation changes.
    window.dispatchEvent(new Event('resize'));
    if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
      window.scrollTo(0, window.scrollY);
    }
  };

  let resizeTimer;
  const scheduleViewportUpdate = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(updateViewportState, 80);
  };

  document.addEventListener('DOMContentLoaded', () => {
    updateViewportState();
    window.setTimeout(updateViewportState, 350);
  }, { once: true });
  window.addEventListener('orientationchange', () => {
    scheduleViewportUpdate();
    window.setTimeout(updateViewportState, 380);
  }, { passive: true });
  window.addEventListener('resize', scheduleViewportUpdate, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', scheduleViewportUpdate, { passive: true });
    window.visualViewport.addEventListener('scroll', scheduleViewportUpdate, { passive: true });
  }

  window.__TEENZ_BIBLE_RUNTIME_FIXES__ = {
    version: PATCH_VERSION,
    bibleAiEndpoint: BIBLE_AI_ENDPOINT,
    enabledAt: Date.now(),
    crewMembershipFlow: 'verified-before-complete',
  };
})();

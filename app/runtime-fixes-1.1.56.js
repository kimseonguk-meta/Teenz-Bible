(() => {
  'use strict';

  const PATCH_VERSION = '1.1.56';
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

  const upsertCenteredHeaderTitle = (container, pageName, className) => {
    if (!container) return;
    container.classList.add(className);
    let title = container.querySelector(':scope > .tb-centered-header-title');
    if (!title) {
      title = document.createElement('div');
      title.className = 'tb-centered-header-title';
      title.setAttribute('aria-hidden', 'true');
      container.appendChild(title);
    }
    title.innerHTML = '<span class="tb-centered-header-title__eyebrow">TEENZ BIBLE</span><span class="tb-centered-header-title__name"></span>';
    title.querySelector('.tb-centered-header-title__name').textContent = pageName;
  };

  const upsertBibleReadingEntry = (biblePage) => {
    if (!biblePage || biblePage.querySelector(':scope > .tb-bible-reading-entry')) return;
    const entry = document.createElement('button');
    entry.type = 'button';
    entry.className = 'tb-bible-reading-entry';
    entry.setAttribute('aria-label', 'Continue reading the Bible');
    entry.innerHTML = '<span class="tb-bible-reading-entry__icon">✦</span><span class="tb-bible-reading-entry__copy"><span class="tb-bible-reading-entry__eyebrow">READ THE BIBLE</span><span class="tb-bible-reading-entry__title">Continue Reading</span><span class="tb-bible-reading-entry__hint">Choose your next book and chapter</span></span><span class="tb-bible-reading-entry__arrow">›</span>';
    entry.addEventListener('click', () => {
      const firstBook = biblePage.querySelector('[data-loc="client/src/pages/Bible.tsx:388"]');
      if (firstBook instanceof HTMLElement) firstBook.click();
    });
    const testamentTabs = biblePage.querySelector('[data-loc="client/src/pages/Bible.tsx:314"]');
    if (testamentTabs) biblePage.insertBefore(entry, testamentTabs);
  };

  const markDesignSurface = (selector, className) => {
    const element = document.querySelector(selector);
    if (element) element.classList.add(className);
  };

  const restoreHomeContent = () => {
    const primaryReading = document.querySelector('[data-loc="client/src/pages/Home.tsx:312"]');
    if (primaryReading) primaryReading.classList.add('tb-home-primary-reading');

    const memeCard = document.querySelector('[data-loc="client/src/pages/Home.tsx:419"]');
    if (memeCard) memeCard.classList.add('tb-home-meme-surface');

    const mapLabel = document.querySelector('[data-loc="client/src/pages/Home.tsx:535"]');
    if (mapLabel) {
      mapLabel.textContent = 'BIBLE MAP · NEW LOCATION';
      const mapCard = mapLabel.closest('.card-a, .card-b, .card-c, .card-d');
      if (mapCard) mapCard.classList.add('tb-home-map-surface');
    }
  };

  const simplifyBibleAiHeader = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiHeader = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:510"]');
    if (!aiRoot || !aiHeader) return;
    aiRoot.classList.add('tb-ai-screen');
    aiHeader.classList.add('tb-ai-header');
    let title = aiHeader.querySelector(':scope > .tb-ai-shared-title');
    if (!title) {
      title = document.createElement('div');
      title.className = 'tb-ai-shared-title';
      title.setAttribute('aria-hidden', 'true');
      aiHeader.appendChild(title);
    }
    title.innerHTML = '<span class="tb-ai-shared-title__eyebrow">TEENZ BIBLE</span><span class="tb-ai-shared-title__name">Bible AI</span>';
  };

  const applyRankingAndStoreChrome = () => {
    const rankingPage = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:752"]');
    const rankingHeader = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:766"]');
    if (rankingPage) rankingPage.classList.add('tb-approved-ranking');
    if (rankingHeader) upsertCenteredHeaderTitle(rankingHeader, 'Ranking', 'tb-centered-ranking-header');

    const crewHub = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:956"]');
    if (crewHub) {
      crewHub.classList.add('tb-ranking-crew-hub');
      const heading = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:959"]');
      const copy = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:960"]');
      const create = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:962"]');
      const join = crewHub.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:966"]');
      if (heading) heading.textContent = 'Crew Hub';
      if (copy) copy.textContent = 'Create a crew or join another with an invite code.';
      if (create) create.textContent = 'Create Crew';
      if (join) join.textContent = 'Join Crew';
    }

    const storePage = document.querySelector('[data-loc="client/src/pages/Store.tsx:409"]');
    const storeHeader = document.querySelector('[data-loc="client/src/pages/Store.tsx:412"]');
    if (storePage) storePage.classList.add('tb-approved-store');
    if (storeHeader) upsertCenteredHeaderTitle(storeHeader, 'Store', 'tb-centered-store-header');
  };

  const applyCenteredHeaders = () => {
    const homeHeader = document.querySelector('[data-loc="client/src/pages/Home.tsx:263"]');
    upsertCenteredHeaderTitle(homeHeader, 'Home', 'tb-centered-home-header');

    const profileHeader = document.querySelector('[data-loc="client/src/pages/Profile.tsx:617"]');
    upsertCenteredHeaderTitle(profileHeader, 'Profile', 'tb-centered-profile-header');

    const biblePage = document.querySelector('[data-loc="client/src/pages/Bible.tsx:310"]');
    if (biblePage && !biblePage.querySelector(':scope > .tb-centered-page-header')) {
      const title = document.createElement('div');
      title.className = 'tb-centered-page-header';
      title.setAttribute('aria-label', 'Bible');
      title.innerHTML = '<span class="tb-centered-page-header__eyebrow">TEENZ BIBLE</span><span class="tb-centered-page-header__name">Bible</span>';
      biblePage.prepend(title);
    }
    upsertBibleReadingEntry(biblePage);

    markDesignSurface('[data-loc="client/src/pages/Home.tsx:218"]', 'tb-approved-home');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:231"]', 'tb-home-backup-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:312"]', 'tb-home-primary-reading');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:355"]', 'tb-home-ai-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:378"]', 'tb-home-progress-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:419"]', 'tb-home-editorial-surface');
    restoreHomeContent();
    simplifyBibleAiHeader();
    applyRankingAndStoreChrome();

    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:310"]', 'tb-approved-bible');
    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:314"]', 'tb-bible-mode-tabs');
    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:340"]', 'tb-bible-progress-surface');
    markDesignSurface('[data-loc="client/src/pages/Bible.tsx:368"]', 'tb-bible-catalogue-section');

    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:569"]', 'tb-approved-profile');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:628"]', 'tb-profile-identity-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1283"]', 'tb-profile-week-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1333"]', 'tb-profile-badges-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1459"]', 'tb-profile-goal-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1495"]', 'tb-profile-crew-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1542"]', 'tb-profile-reminder-surface');
    markDesignSurface('[data-loc="client/src/pages/Profile.tsx:1712"]', 'tb-profile-settings-surface');
  };

  let centeredHeaderTimer;
  const scheduleCenteredHeaders = () => {
    window.clearTimeout(centeredHeaderTimer);
    centeredHeaderTimer = window.setTimeout(applyCenteredHeaders, 32);
  };

  const installCenteredHeaders = () => {
    applyCenteredHeaders();
    const root = document.getElementById('root');
    if (root && !root.__tbCenteredHeaderObserver) {
      const observer = new MutationObserver(scheduleCenteredHeaders);
      observer.observe(root, { childList: true, subtree: true });
      root.__tbCenteredHeaderObserver = observer;
    }
    window.addEventListener('popstate', scheduleCenteredHeaders, { passive: true });
  };

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
    installCenteredHeaders();
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
    centeredHeaders: 'all-five-main-screens',
    approvedDesignSurfaces: 'home-bible-profile-ranking-store',
    homeContent: 'meme-and-map-restored',
    bibleAiHeader: 'shared-compact',
    rankingCrewHub: 'always-accessible',
  };
})();

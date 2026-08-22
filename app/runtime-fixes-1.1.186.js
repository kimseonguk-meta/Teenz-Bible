(() => {
  'use strict';

  const PATCH_VERSION = '1.1.186';
  const BIBLE_AI_ENDPOINT = 'https://teenzbible.manus.space/api/bible-ai';
  const originalFetch = window.fetch ? window.fetch.bind(window) : null;

  // React 19 can occasionally ask the browser to remove a stale non-Node during
  // an animated route teardown. Ignore only that invalid argument; all real DOM
  // node removals still use the native implementation unchanged.
  const nativeRemoveChild = Node.prototype.removeChild;
  if (!Node.prototype.__teenzBibleSafeRemoveChild) {
    const safeRemoveChild = function safeRemoveChild(child) {
      if (!child || typeof child.nodeType !== 'number') return child;
      if (child.parentNode !== this) return child;
      return nativeRemoveChild.call(this, child);
    };
    Object.defineProperty(Node.prototype, '__teenzBibleSafeRemoveChild', { value: true, configurable: false });
    Node.prototype.removeChild = safeRemoveChild;
  }

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

  // Theme feature retired in 1.1.172. Normalize old local state before the
  // React core starts so a previously equipped color theme can never reappear.
  const retireThemeFeature = () => {
    try {
      const equipped = JSON.parse(localStorage.getItem('teensBibleEquipped') || '{}');
      localStorage.setItem('teensBibleEquipped', JSON.stringify({ ...equipped, theme: 'theme_original' }));
      localStorage.removeItem('teensBibleActiveTheme');
      const inventory = JSON.parse(localStorage.getItem('teensBibleInventory') || '{}');
      if (Array.isArray(inventory.ownedItems)) {
        inventory.ownedItems = inventory.ownedItems.filter((item) => !/^theme_/.test(String(item)));
        localStorage.setItem('teensBibleInventory', JSON.stringify(inventory));
      }
    } catch (_) { /* Never block app startup on malformed legacy storage. */ }
    document.getElementById('teenz-theme-visual-bridge')?.remove();
    document.getElementById('teenz-theme-page-scheme')?.remove();
  };
  const scrubRetiredThemeStorage = () => {
    try {
      const inventory = JSON.parse(localStorage.getItem('teensBibleInventory') || '{}');
      if (Array.isArray(inventory.ownedItems)) {
        const cleaned = inventory.ownedItems.filter((item) => !/^theme_/.test(String(item)));
        if (cleaned.length !== inventory.ownedItems.length) {
          inventory.ownedItems = cleaned;
          localStorage.setItem('teensBibleInventory', JSON.stringify(inventory));
        }
      }
      const equipped = JSON.parse(localStorage.getItem('teensBibleEquipped') || '{}');
      if (equipped.theme !== 'theme_original') localStorage.setItem('teensBibleEquipped', JSON.stringify({ ...equipped, theme: 'theme_original' }));
      localStorage.removeItem('teensBibleActiveTheme');
    } catch (_) {}
  };
  retireThemeFeature();
  scrubRetiredThemeStorage();
  window.addEventListener('teensBibleDataChanged', scrubRetiredThemeStorage);
  window.addEventListener('sync-restored', scrubRetiredThemeStorage);

  // One-time repair for Crews created before 1.1.78: Ranking could retain an older class Crew
  // (such as 12C) in its persistent selection state after the new custom Crew was saved.
  const repairExistingCrewSelection = () => {
    const migrationKey = 'teenzBibleCrewSelectionMigration179';
    if (localStorage.getItem(migrationKey) === 'done') return;
    try {
      const groups = JSON.parse(localStorage.getItem('teensBibleGroups') || '[]');
      const createdCrew = groups
        .filter((group) => group?.role === 'admin' && /^CRW/i.test(group.groupCode || ''))
        .sort((left, right) => Number(right.joinedAt || 0) - Number(left.joinedAt || 0))[0];
      if (createdCrew?.groupCode) {
        localStorage.setItem('teensBibleRankingCrew', createdCrew.groupCode);
        localStorage.setItem('teensBibleLastRankingCrew', createdCrew.groupCode);
      }
    } catch (_) { /* Preserve existing Ranking selection if local storage is malformed. */ }
    localStorage.setItem(migrationKey, 'done');
  };
  repairExistingCrewSelection();

  // Never remove React-owned nodes from the DOM. React must reconcile and unmount
  // these nodes itself; direct removal causes "parameter 1 is not of type Node"
  // during route changes (notably Bible and Bible Map).
  const hideReactOwnedNode = (node) => {
    if (!(node instanceof HTMLElement)) return;
    node.classList.add('tb-react-hidden-node');
    node.setAttribute('aria-hidden', 'true');
  };
  const removePageHeader = (container) => {
    if (!container) return;
    container.classList.add('tb-page-header-removed');
    container.querySelectorAll(':scope > .tb-centered-header-title, :scope > .tb-ai-shared-title').forEach(hideReactOwnedNode);
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
      // Preserve React's child text nodes; changing textContent would delete them
      // and make the next route reconciliation throw a DOM Node TypeError.
      mapLabel.classList.add('tb-home-map-label');
      const mapCard = mapLabel.closest('.card-a, .card-b, .card-c, .card-d');
      if (mapCard) mapCard.classList.add('tb-home-map-surface');
    }
  };

  const simplifyBibleAiHeader = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiHeader = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:510"]');
    if (!aiRoot || !aiHeader) return;
    aiRoot.classList.add('tb-ai-screen');
    aiHeader.classList.remove('tb-page-header-removed');
    aiHeader.classList.add('tb-ai-modern-header');
  };

  const applyRankingAndStoreChrome = () => {
    const rankingPage = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:752"]');
    const rankingHeader = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:766"]');
    if (rankingPage) rankingPage.classList.add('tb-approved-ranking');
    removePageHeader(rankingHeader);

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
    removePageHeader(storeHeader);
  };

  const ONBOARDING_VALUES_KEY = 'teenzBibleOnboardingValuesSeen';
  const FIRST60_STATE_KEY = 'teenzBibleFirst60State';
  const getFirst60State = () => { try { return JSON.parse(localStorage.getItem(FIRST60_STATE_KEY) || '{}'); } catch { return {}; } };
  const setFirst60State = (patch) => localStorage.setItem(FIRST60_STATE_KEY, JSON.stringify({ ...getFirst60State(), ...patch }));

  const openOneMinuteReflection = () => {
    document.getElementById('tb-one-minute-reflection')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'tb-one-minute-reflection';
    overlay.className = 'tb-reflection-overlay';
    overlay.innerHTML = '<section class="tb-reflection-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-reflection-title" tabindex="-1"><div class="tb-reflection-icon" aria-hidden="true">📖</div><div class="tb-reflection-eyebrow">1-MINUTE REFLECTION</div><h2 id="tb-reflection-title">God’s love for the world</h2><p class="tb-reflection-reference">John 3:16–17</p><p class="tb-reflection-copy">Start with a short moment of Scripture and reflection. When you are ready, choose a full chapter and keep growing.</p><div class="tb-reflection-actions"><button type="button" data-tb-reflection-bible>Choose a full chapter</button><button type="button" data-tb-reflection-ai>Ask Bible AI</button></div><button type="button" class="tb-reflection-close" data-tb-reflection-close>Not now</button></section>';
    const close = () => overlay.remove();
    document.body.appendChild(overlay);
    overlay.querySelector('[data-tb-reflection-close]')?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    overlay.querySelector('[data-tb-reflection-bible]')?.addEventListener('click', () => { setFirst60State({ reflection: true, bible: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Bible')?.click(); });
    overlay.querySelector('[data-tb-reflection-ai]')?.addEventListener('click', () => { setFirst60State({ reflection: true, ai: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.includes('Bible AI'))?.click(); });
    overlay.querySelector('.tb-reflection-dialog')?.focus();
  };

  const applyOnboardingGuidanceExperience = () => {
    if (!localStorage.getItem('teensBibleProfile') && !localStorage.getItem(ONBOARDING_VALUES_KEY) && !document.getElementById('tb-onboarding-values-intro')) {
      const overlay = document.createElement('div');
      overlay.id = 'tb-onboarding-values-intro';
      overlay.className = 'tb-values-overlay';
      overlay.innerHTML = '<section class="tb-values-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-values-title" tabindex="-1"><div class="tb-values-crown" aria-hidden="true">✦</div><div class="tb-values-eyebrow">WELCOME TO TEENZ BIBLE</div><h2 id="tb-values-title">Grow closer to God,<br>one chapter at a time.</h2><div class="tb-values-list"><article><span aria-hidden="true">📖</span><div><strong>Read the Bible</strong><p>Short, guided chapters made for your day.</p></div></article><article><span aria-hidden="true">✨</span><div><strong>Ask Bible AI</strong><p>Get clear help when a passage feels confusing.</p></div></article><article><span aria-hidden="true">👥</span><div><strong>Grow with your Crew</strong><p>Read, encourage, and grow together.</p></div></article></div><button type="button" class="tb-values-primary" data-tb-values-continue>Let’s Go</button><button type="button" class="tb-values-skip" data-tb-values-skip>Skip for now</button></section>';
      const dismiss = () => { localStorage.setItem(ONBOARDING_VALUES_KEY, '1'); overlay.remove(); };
      document.body.appendChild(overlay);
      overlay.querySelector('[data-tb-values-continue]')?.addEventListener('click', dismiss);
      overlay.querySelector('[data-tb-values-skip]')?.addEventListener('click', dismiss);
      overlay.querySelector('.tb-values-dialog')?.focus();
    }

    const nasumButton = Array.from(document.querySelectorAll('button')).find((button) => /nasum teenz/i.test(button.innerText));
    const membershipHost = nasumButton?.parentElement?.parentElement;
    if (membershipHost && !membershipHost.querySelector('.tb-membership-why')) {
      const copy = document.createElement('p'); copy.className = 'tb-membership-why'; copy.textContent = 'Choose how you would like to grow. You can join or create more crews later.'; membershipHost.insertBefore(copy, nasumButton.parentElement || nasumButton);
    }

    const classSelect = document.querySelector('select');
    const classHost = classSelect?.parentElement?.parentElement;
    if (classHost && !classHost.querySelector('.tb-class-crew-explainer')) {
      const copy = document.createElement('p'); copy.className = 'tb-class-crew-explainer'; copy.innerHTML = '<strong>Your class becomes your first Crew.</strong><span>You can join or create more crews later.</span>'; classHost.insertBefore(copy, classSelect.parentElement || classSelect);
    }

    const reading = document.querySelector('[data-loc="client/src/pages/Home.tsx:312"]') || Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Start Reading →');
    const onboardingUiActive = Array.from(document.querySelectorAll('[data-loc*="Onboarding"]')).some((element) => {
      const style = window.getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number.parseFloat(style.opacity || '1') > 0.01 && rect.width > 0 && rect.height > 0;
    });
    const first60State = getFirst60State();
    if (onboardingUiActive) document.getElementById('tb-first60-overlay')?.remove();
    if (localStorage.getItem('teensBibleOnboardingDone') === 'true' && !onboardingUiActive && reading && !first60State.dismissed && !document.getElementById('tb-first60-overlay')) {
      const overlay = document.createElement('div');
      overlay.id = 'tb-first60-overlay';
      overlay.className = 'tb-first60-overlay';
      overlay.innerHTML = `<section class="tb-first60-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-first60-title" tabindex="-1"><div class="tb-first60-medallion" aria-hidden="true">✦</div><div class="tb-values-eyebrow">YOUR FIRST 60 SECONDS</div><h2 id="tb-first60-title">Start small. Keep growing.</h2><button type="button" data-tb-first60-reflection><i>①</i><span><b>Open a 1-minute reflection</b><small>John 3:16–17 · God’s love for the world</small></span><em>${first60State.reflection ? '✓' : '›'}</em></button><button type="button" data-tb-first60-bible><i>②</i><span><b>Choose your first chapter</b><small>Your streak starts when you complete it.</small></span><em>${first60State.bible ? '✓' : '›'}</em></button><button type="button" data-tb-first60-ai><i>③</i><span><b>Ask Bible AI a question</b><small>Get help when a passage feels confusing.</small></span><em>${first60State.ai ? '✓' : '›'}</em></button><button type="button" class="tb-first60-later" data-tb-first60-later>Maybe later</button></section>`;
      const close = (dismissed = false) => { if (dismissed) setFirst60State({ dismissed: true }); overlay.remove(); };
      document.body.appendChild(overlay);
      overlay.querySelector('[data-tb-first60-later]')?.addEventListener('click', () => close(true));
      overlay.querySelector('[data-tb-first60-reflection]')?.addEventListener('click', () => { setFirst60State({ reflection: true }); close(); openOneMinuteReflection(); });
      overlay.querySelector('[data-tb-first60-bible]')?.addEventListener('click', () => { setFirst60State({ bible: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === 'Bible')?.click(); });
      overlay.querySelector('[data-tb-first60-ai]')?.addEventListener('click', () => { setFirst60State({ ai: true }); close(); Array.from(document.querySelectorAll('button')).find((button) => button.innerText.includes('Bible AI'))?.click(); });
      overlay.querySelector('.tb-first60-dialog')?.focus();
    }

    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiHeader = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:510"]');
    const aiInput = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    if (aiRoot && aiInput) {
      const guide = document.querySelector('.tb-ai-start-guide') || document.createElement('div');
      guide.className = 'tb-ai-start-guide';
      guide.innerHTML = '<strong>NOT SURE WHERE TO BEGIN?</strong><span>Choose a question below or ask anything about the Bible.</span>';
      const intro = aiRoot.querySelector('[data-loc="client/src/pages/BibleAI.tsx:577"]');
      if (aiHeader) aiHeader.insertAdjacentElement('afterend', guide);
      else if (intro) intro.insertAdjacentElement('beforebegin', guide);
      else aiRoot.insertBefore(guide, aiRoot.firstChild);
      const messageRows = Array.from(aiRoot.querySelectorAll('[data-loc="client/src/pages/BibleAI.tsx:598"]'));
      const hasUserMessage = messageRows.some((row) => String(row.className || '').includes('justify-end'));
      aiRoot.classList.toggle('tb-ai-empty-screen', !hasUserMessage);
    }
  };

  const applyNewUserExperienceImprovements = () => {
    const welcomeStart = document.querySelector('[data-loc="client/src/components/Onboarding.tsx:847"]');
    const existingExplore = document.getElementById('tb-onboarding-explore-home');
    if (welcomeStart && !existingExplore) {
      const explore = document.createElement('button');
      explore.id = 'tb-onboarding-explore-home';
      explore.type = 'button';
      explore.className = 'tb-onboarding-explore-home';
      explore.innerHTML = '<strong>Explore Home</strong><span>You can begin reading anytime from Home.</span>';
      explore.setAttribute('aria-label', 'Close welcome reward and explore Home');
      explore.addEventListener('click', () => welcomeStart.click());
      document.body.appendChild(explore);
    } else if (!welcomeStart && existingExplore) {
      existingExplore.remove();
    }

    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiComposer = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    if (aiComposer) {
      const koreanQuickQuestions = ['예수님이 누구야?', '은혜가 뭐야?', '요한계시록이 뭘 내용이야?', '삼위일체가 뭐야?', '예수님이 왜 죽으셨어?', '성경을 누가 썼어?', '세례가 뭐야?', '십계명이 뭐야?', '성령님이 누구야?', '기도가 뭐야?', '천국은 어떤 곳이야?', '다윗 왕이 누구야?', '죄가 뭐야?', '모세가 누구야?'];
      Array.from(document.querySelectorAll('button')).forEach((button) => {
        if (koreanQuickQuestions.includes(button.innerText.trim())) button.hidden = true;
      });
      const aiText = document.body?.innerText || aiRoot.innerText || '';
      let source = document.querySelector('.tb-ai-source-strip');
      if (aiText.includes('John 3:16') && aiText.includes('eternal life') && !source) {
        source = document.createElement('a');
        source.className = 'tb-ai-source-strip';
        source.href = '/bible/john';
        source.textContent = 'Read in context · John 3:16–17';
        source.setAttribute('aria-label', 'Read John chapter 3 in context');
        const composer = aiComposer.parentElement;
        if (composer) composer.insertAdjacentElement('beforebegin', source); else document.body.appendChild(source);
      }
    }

    const storePage = document.querySelector('[data-loc="client/src/pages/Store.tsx:409"]');
    const starterGoalShownKey = 'teenzBibleStarterGoalShown';
    if (storePage && !localStorage.getItem(starterGoalShownKey) && !storePage.querySelector('.tb-store-starter-guide')) {
      const guide = document.createElement('div');
      guide.className = 'tb-store-starter-guide';
      guide.innerHTML = '<strong>STARTER GOAL</strong><span>Read your first chapter to begin building your collection.</span>';
      const header = document.querySelector('[data-loc="client/src/pages/Store.tsx:412"]');
      if (header) {
        header.insertAdjacentElement('afterend', guide);
        localStorage.setItem(starterGoalShownKey, '1');
      }
    } else if (localStorage.getItem(starterGoalShownKey)) {
      storePage?.querySelectorAll('.tb-store-starter-guide').forEach((guide) => guide.remove());
    }

    const crewHub = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:956"]');
    const crewCopy = crewHub?.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:960"]');
    if (crewCopy) crewCopy.textContent = '1. Create or join a crew. 2. Share the invite code. 3. Switch crews anytime from Profile.';

    const rankingPage = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:752"]');
    if (rankingPage) {
      const seen = new Set();
      const duplicateSpecs = [
        { nickname: 'Klara', xp: '345 XP', chapters: '31 Chapters' },
        { nickname: 'Kenz', xp: '15 XP', chapters: '0 Chapters' },
      ];
      duplicateSpecs.forEach(({ nickname, xp, chapters }) => {
        Array.from(rankingPage.querySelectorAll('*')).filter((node) => node instanceof HTMLElement && node.textContent?.trim() === nickname).forEach((nameNode) => {
          let card = nameNode.parentElement;
          while (card && card !== rankingPage) {
            const text = (card.innerText || '').replace(/\s+/g, ' ');
            const compactEnough = card.querySelectorAll('*').length <= 28;
            if (compactEnough && text.includes(nickname) && text.includes(xp) && text.includes(chapters)) break;
            card = card.parentElement;
          }
          if (!card || card === rankingPage) return;
          const signature = `${nickname}-${xp}-${chapters}`;
          if (seen.has(signature)) {
            card.hidden = true;
            card.setAttribute('aria-hidden', 'true');
            card.dataset.tbRankingDuplicate = 'true';
          } else seen.add(signature);
        });
      });
    }
  };

  const normalizeModalViewports = () => {
    const crewModalPattern = /(?:My Crews|Join Crew|Create Crew|Join or create a crew)/i;
    const rankingMemberModalLoc = 'client/src/pages/Leaderboard.tsx:117';
    Array.from(document.querySelectorAll('.fixed.inset-0')).forEach((overlay) => {
      const isCrewModal = crewModalPattern.test(overlay.innerText || '');
      const isRankingMemberModal = overlay.getAttribute('data-loc') === rankingMemberModalLoc;
      if (!isCrewModal && !isRankingMemberModal) return;
      overlay.classList.add('tb-modal-viewport-safe');
      if (isCrewModal) overlay.classList.add('tb-crew-modal-viewport');
      if (isRankingMemberModal) overlay.classList.add('tb-ranking-member-modal-viewport');
      // Keep the overlay inside the React root. Reparenting a React-managed
      // subtree to body breaks React's delegated event path on mobile.
    });
  };

  // Crew creation is intentionally rendered here rather than delegated to Profile.
  // This avoids SPA route timing and presents one stable flow on Android and iOS.
  const openRankingCrewCreator = () => {
    document.getElementById('tb-ranking-crew-creator')?.remove();
    const overlay = document.createElement('div');
    overlay.id = 'tb-ranking-crew-creator';
    overlay.className = 'tb-ranking-crew-creator';
    overlay.innerHTML = '<section class="tb-ranking-crew-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-ranking-crew-title" tabindex="-1"><button type="button" class="tb-ranking-crew-close" aria-label="Close">×</button><div class="tb-ranking-crew-eyebrow">CREW HUB</div><h2 id="tb-ranking-crew-title">Create Your Crew</h2><p>Give your crew a name, then invite friends to read and grow together.</p><label>CREW NAME<input type="text" maxlength="30" placeholder="e.g. Bible Crew 2026" data-tb-crew-name></label><div class="tb-ranking-crew-visibility"><button type="button" data-visibility="open" class="is-selected">🌍 Open<span>Anyone can find and join</span></button><button type="button" data-visibility="closed">🔒 Closed<span>Invite code required</span></button></div><p class="tb-ranking-crew-error" aria-live="polite" data-tb-crew-error></p><button type="button" class="tb-ranking-crew-submit" data-tb-crew-submit>Create Crew</button></section>';
    const close = () => overlay.remove();
    const nameInput = overlay.querySelector('[data-tb-crew-name]');
    const error = overlay.querySelector('[data-tb-crew-error]');
    const submit = overlay.querySelector('[data-tb-crew-submit]');
    let visibility = 'open';
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    overlay.querySelector('.tb-ranking-crew-close')?.addEventListener('click', close);
    overlay.querySelectorAll('[data-visibility]').forEach((button) => button.addEventListener('click', () => {
      visibility = button.getAttribute('data-visibility') || 'open';
      overlay.querySelectorAll('[data-visibility]').forEach((candidate) => candidate.classList.toggle('is-selected', candidate === button));
    }));
    submit?.addEventListener('click', async () => {
      const name = nameInput?.value.trim() || '';
      if (name.length < 2) { error.textContent = 'Crew name must be at least 2 characters.'; return; }
      submit.disabled = true;
      submit.textContent = 'Creating…';
      error.textContent = '';
      try {
        // The Android Web SDK write could remain pending even when the device was online.
        // Use the same authenticated Firebase database, but make one bounded REST request instead.
        const core = await import('/assets/index-GemFix1184.js');
        const auth = typeof core.H === 'function' ? core.H() : null;
        const user = auth?.currentUser;
        if (!user) throw new Error('Your account is still connecting. Please wait a moment and try again.');
        submit.textContent = 'Checking account…';
        const token = await user.getIdToken();
        const database = 'https://teens-bible-94271-default-rtdb.firebaseio.com';
        const withTimeout = async (url, options, milliseconds = 12000) => {
          const controller = new AbortController();
          const timer = window.setTimeout(() => controller.abort(), milliseconds);
          try { return await fetch(url, { ...options, signal: controller.signal }); }
          finally { window.clearTimeout(timer); }
        };
        const existingResponse = await withTimeout(`${database}/userGroups/${encodeURIComponent(user.uid)}.json?auth=${encodeURIComponent(token)}`, { headers: { Accept: 'application/json' } });
        if (!existingResponse.ok) throw new Error('Could not check your Crew memberships. Please try again.');
        const existingGroups = await existingResponse.json() || {};
        if (Object.keys(existingGroups).length >= 10) throw new Error('You can join up to 10 crews maximum.');
        const code = `CRW${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`.slice(0, 20);
        const profile = JSON.parse(localStorage.getItem('teensBibleProfile') || '{}');
        const bible = JSON.parse(localStorage.getItem('teensBible') || '{}');
        let chaptersRead = 0;
        for (let index = 0; index < localStorage.length; index += 1) {
          const key = localStorage.key(index);
          if (!key?.startsWith('chaptersRead_')) continue;
          try { chaptersRead += JSON.parse(localStorage.getItem(key) || '[]').length; } catch (_) { /* ignore malformed local chapter cache */ }
        }
        const now = Date.now();
        const crew = { name, groupCode: code, createdBy: user.uid, createdAt: now, inviteCode: code, isPrebuilt: false, memberCount: 1, visibility };
        const member = { nickname: profile.nickname || 'Anonymous', avatar: profile.avatar || '😎', groupCode: code, xp: Number(localStorage.getItem('totalXP') || 0), streak: bible.streak || 0, chaptersRead, quizTotal: bible.stats?.quizTotal || 0, quizCorrect: bible.stats?.quizCorrect || 0, joinedAt: profile.joinedAt || now, isNasumMember: profile.isNasumMember || false, lastActive: now, updatedAt: now };
        submit.textContent = 'Saving Crew…';
        const patch = {
          [`groupMeta/${code}`]: crew,
          [`groups/${code}/members/${user.uid}`]: member,
          [`userGroups/${user.uid}/${code}`]: { joinedAt: now, role: 'admin' },
        };
        const saveResponse = await withTimeout(`${database}/.json?auth=${encodeURIComponent(token)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) }, 15000);
        if (!saveResponse.ok) {
          const detail = await saveResponse.text();
          throw new Error(saveResponse.status === 401 || saveResponse.status === 403 ? 'Firebase did not permit this Crew creation. Please sign in again and retry.' : `Crew could not be saved (${saveResponse.status}). ${detail.slice(0, 80)}`);
        }
        const savedGroups = JSON.parse(localStorage.getItem('teensBibleGroups') || '[]');
        if (!savedGroups.some((group) => group.groupCode === code)) savedGroups.push({ groupCode: code, name, joinedAt: now, role: 'admin' });
        localStorage.setItem('teensBibleGroups', JSON.stringify(savedGroups));
        // Ranking restores `teensBibleLastRankingCrew` after it consumes the one-time key.
        // Update both keys so a previous Crew selection (for example 12C) cannot overwrite the new Crew.
        localStorage.setItem('teensBibleRankingCrew', code);
        localStorage.setItem('teensBibleLastRankingCrew', code);
        window.dispatchEvent(new CustomEvent('teensBibleGroupsRestored', { detail: savedGroups }));
        window.dispatchEvent(new CustomEvent('teensBibleDataChanged'));
        const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
        overlay.querySelector('.tb-ranking-crew-dialog').innerHTML = `<div class="tb-ranking-crew-eyebrow">CREW CREATED</div><h2>${escapeHtml(crew.name)}</h2><p>Your invite code is <strong>${escapeHtml(crew.inviteCode)}</strong>.</p><button type="button" class="tb-ranking-crew-submit" data-tb-crew-done>View My Crew</button>`;
        overlay.querySelector('[data-tb-crew-done]')?.addEventListener('click', () => { window.location.assign('/leaderboard'); });
      } catch (caught) {
        error.textContent = caught?.message || 'Could not create the crew. Please try again.';
        submit.disabled = false;
        submit.textContent = 'Create Crew';
      }
    });
    document.body.appendChild(overlay);
    window.setTimeout(() => nameInput?.focus(), 40);
  };

  const installCrewComposerEntryPoint = () => {
    if (window.location.pathname !== '/leaderboard') return;
    const createJoin = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:962"]') || Array.from(document.querySelectorAll('a, button')).find((candidate) => candidate.textContent.trim() === 'Create Crew');
    if (!createJoin || createJoin.dataset.tbCrewComposerPatched === 'true') return;
    createJoin.dataset.tbCrewComposerPatched = 'true';
    createJoin.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openRankingCrewCreator(); }, true);
  };

  const applyCenteredHeaders = () => {
    const homeHeader = document.querySelector('[data-loc="client/src/pages/Home.tsx:263"]');
    removePageHeader(homeHeader);

    const profileHeader = document.querySelector('[data-loc="client/src/pages/Profile.tsx:617"]');
    removePageHeader(profileHeader);

    const biblePage = document.querySelector('[data-loc="client/src/pages/Bible.tsx:310"]');
    hideReactOwnedNode(biblePage?.querySelector(':scope > .tb-centered-page-header'));
    // Do not insert runtime-created children into the React-owned Bible page.
    // The Bible catalogue is already rendered by React; this avoids route teardown
    // failures caused by React reconciling around an injected button.


    markDesignSurface('[data-loc="client/src/pages/Home.tsx:218"]', 'tb-approved-home');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:231"]', 'tb-home-backup-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:312"]', 'tb-home-primary-reading');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:355"]', 'tb-home-ai-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:378"]', 'tb-home-progress-surface');
    markDesignSurface('[data-loc="client/src/pages/Home.tsx:419"]', 'tb-home-editorial-surface');
    restoreHomeContent();
    simplifyBibleAiHeader();
    applyRankingAndStoreChrome();
    applyNewUserExperienceImprovements();
    applyOnboardingGuidanceExperience();
    installCrewComposerEntryPoint();
    normalizeModalViewports();

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
    [280, 900, 1800, 3600, 6500].forEach((delay) => window.setTimeout(applyCenteredHeaders, delay));
    let onboardingPasses = 0;
    const onboardingAssistTimer = window.setInterval(() => {
      applyCenteredHeaders();
      onboardingPasses += 1;
      if (onboardingPasses >= 45) window.clearInterval(onboardingAssistTimer);
    }, 700);
    const root = document.getElementById('root');
    if (root && !root.__tbCenteredHeaderObserver) {
      const observer = new MutationObserver(scheduleCenteredHeaders);
      observer.observe(root, { childList: true, subtree: true });
      root.__tbCenteredHeaderObserver = observer;
    }
    window.addEventListener('popstate', scheduleCenteredHeaders, { passive: true });
  };

  // 1.1.172: ProfilePhotoPrompt is retired at the App render site and also
  // removed defensively if an older cached chunk recreates it in a portal.
  const removeRetiredProfilePhotoPrompt = () => {
    const root = document.getElementById('root');
    const nodes = Array.from(document.querySelectorAll('[data-loc*="ProfilePhotoPrompt"], [role="dialog"], h1, h2, h3, p'));
    nodes.forEach((node) => {
      const text = (node.innerText || node.textContent || '').replace(/\s+/g, ' ').trim();
      if (!/reveal\s+thy\s+visage|show\s+off\s+your\s+style|upload\s+a\s+photo.*friends\s+can\s+recognize/i.test(text)) return;
      const modal = node.closest('[data-loc*="ProfilePhotoPrompt"], [role="dialog"], .fixed.inset-0') || node;
      if (modal && modal !== document.body && modal !== root) {
        modal.classList.add('tb-react-hidden-node');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
    if (root && !root.__tbRetiredProfilePromptObserver) {
      const observer = new MutationObserver(() => {
        if (!root.__tbRemovingRetiredPrompt) {
          root.__tbRemovingRetiredPrompt = true;
          removeRetiredProfilePhotoPrompt();
          root.__tbRemovingRetiredPrompt = false;
        }
      });
      observer.observe(root, { childList: true, subtree: true });
      root.__tbRetiredProfilePromptObserver = observer;
    }
  };
  // Store navigation is button-only. A horizontal finger movement over an item
  // must not be interpreted as navigation to an adjacent Store tab or route.
  const installStoreHorizontalSwipeGuard = () => {
    if (window.__TB_STORE_HORIZONTAL_SWIPE_GUARD__) return;
    window.__TB_STORE_HORIZONTAL_SWIPE_GUARD__ = true;
    let start = null;
    let blocked = false;
    const getStorePage = (target) => {
      if (!(target instanceof Element)) return null;
      return target.closest('[data-loc="client/src/pages/Store.tsx:409"]');
    };
    document.addEventListener('touchstart', (event) => {
      const store = getStorePage(event.target);
      const touch = event.touches && event.touches[0];
      start = store && touch ? { store, x: touch.clientX, y: touch.clientY } : null;
      blocked = false;
    }, { capture: true, passive: true });
    document.addEventListener('touchmove', (event) => {
      if (!start || !start.store || !event.touches || !event.touches[0]) return;
      const touch = event.touches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.15) {
        blocked = true;
        event.preventDefault();
        event.stopPropagation();
      }
    }, { capture: true, passive: false });
    document.addEventListener('touchend', (event) => {
      if (blocked) { event.preventDefault(); event.stopPropagation(); }
      start = null; blocked = false;
    }, { capture: true, passive: false });
    document.addEventListener('touchcancel', (event) => {
      if (blocked) { event.preventDefault(); event.stopPropagation(); }
      start = null; blocked = false;
    }, { capture: true, passive: false });
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

  const SOCIAL_CONFLICT_EVENT = 'teenzBibleSocialLinkConflict';
  const SOCIAL_RETRY_EVENT = 'teenzBibleSocialLinkRetry';

  const dismissSocialAccountConflict = () => {
    document.getElementById('tb-social-account-conflict')?.remove();
  };

  const showSocialAccountConflict = (detail = {}) => {
    dismissSocialAccountConflict();
    const provider = detail.provider === 'apple' ? 'apple' : 'google';
    const providerName = provider === 'apple' ? 'Apple' : 'Google';
    const overlay = document.createElement('div');
    overlay.id = 'tb-social-account-conflict';
    overlay.className = 'tb-social-conflict-overlay';
    overlay.setAttribute('role', 'presentation');
    overlay.innerHTML = `
      <section class="tb-social-conflict-dialog" role="dialog" aria-modal="true" aria-labelledby="tb-social-conflict-title" aria-describedby="tb-social-conflict-copy" tabindex="-1">
        <div class="tb-social-conflict-icon" aria-hidden="true">🔒</div>
        <div class="tb-social-conflict-eyebrow">ACCOUNT SAFETY</div>
        <h2 id="tb-social-conflict-title">This ${providerName} Account Is Already in Use</h2>
        <p id="tb-social-conflict-copy">This ${providerName} account is already linked to another Teenz Bible account.</p>
        <p class="tb-social-conflict-safe"><strong>Your current progress is safe.</strong><span>Your XP, Gems, reading history, and crew memberships have not been changed.</span></p>
        <p class="tb-social-conflict-reason">To protect both accounts, we did not merge any data automatically.</p>
        <div class="tb-social-conflict-actions">
          <button type="button" class="tb-social-conflict-primary" data-tb-social-conflict-dismiss>Keep Using This Account</button>
          <button type="button" class="tb-social-conflict-secondary" data-tb-social-conflict-retry>Choose Another ${providerName} Account</button>
        </div>
        <button type="button" class="tb-social-conflict-help" aria-expanded="false" data-tb-social-conflict-help>Is this your existing account? <span>Learn more</span></button>
        <div class="tb-social-conflict-more" hidden>
          <p>The ${providerName} account you selected was used with another Teenz Bible account before. Automatically merging two accounts could mix up or replace XP, Gems, reading history, or crew memberships.</p>
          <p>Your current progress has been kept exactly as it is. You can safely choose another account or keep using this account.</p>
        </div>
      </section>`;
    document.body.appendChild(overlay);

    const dialog = overlay.querySelector('.tb-social-conflict-dialog');
    const close = () => dismissSocialAccountConflict();
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    overlay.querySelector('[data-tb-social-conflict-dismiss]')?.addEventListener('click', close);
    overlay.querySelector('[data-tb-social-conflict-retry]')?.addEventListener('click', () => {
      close();
      window.dispatchEvent(new CustomEvent(SOCIAL_RETRY_EVENT, { detail: { provider } }));
      window.setTimeout(() => {
        const target = Array.from(document.querySelectorAll('button')).find((button) => button.innerText.trim() === providerName);
        target?.click();
      }, 0);
    });
    overlay.querySelector('[data-tb-social-conflict-help]')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const more = overlay.querySelector('.tb-social-conflict-more');
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      more.hidden = expanded;
    });
    dialog?.focus();
  };

  window.addEventListener(SOCIAL_CONFLICT_EVENT, (event) => showSocialAccountConflict(event.detail || {}));
  window.__TEENZ_BIBLE_SHOW_SOCIAL_CONFLICT__ = showSocialAccountConflict;

  window.__TEENZ_BIBLE_APPLY_ONBOARDING_GUIDANCE__ = applyOnboardingGuidanceExperience;
  let independentOnboardingPasses = 0;
  const independentOnboardingTimer = window.setInterval(() => {
    applyNewUserExperienceImprovements();
    applyOnboardingGuidanceExperience();
    independentOnboardingPasses += 1;
    if (independentOnboardingPasses >= 45) window.clearInterval(independentOnboardingTimer);
  }, 700);

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

  const getLocalCrewRecords = () => {
    try {
      const groups = JSON.parse(localStorage.getItem('teensBibleGroups') || '[]');
      return Array.isArray(groups) ? groups.filter((group) => group?.groupCode) : [];
    } catch (_) { return []; }
  };

  const openCrewPicker = async () => {
    document.getElementById('tb-crew-picker')?.remove();
    const records = getLocalCrewRecords();
    const current = localStorage.getItem('teensBibleLastRankingCrew') || localStorage.getItem('teensBibleRankingCrew');
    const overlay = document.createElement('div');
    overlay.id = 'tb-crew-picker';
    overlay.className = 'tb-crew-picker';
    overlay.innerHTML = '<section class="tb-crew-picker__dialog" role="dialog" aria-modal="true" aria-labelledby="tb-crew-picker-title"><button type="button" class="tb-crew-picker__close" aria-label="Close">×</button><div class="tb-crew-picker__eyebrow">RANKING CREW</div><h2 id="tb-crew-picker-title">Choose a Crew</h2><p class="tb-crew-picker__hint">Your ranking updates when you choose a Crew.</p><div class="tb-crew-picker__list"><div class="tb-crew-picker__loading">Loading your Crews…</div></div></section>';
    document.body.appendChild(overlay);
    const close = () => overlay.remove();
    overlay.querySelector('.tb-crew-picker__close')?.addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    try {
      // Realtime Database rules require the signed-in member's token to read group metadata.
      // Without it, the earlier picker fell back to the opaque CRW… code.
      let token = '';
      try {
        const core = await import('/assets/index-GemFix1184.js');
        const auth = typeof core.H === 'function' ? core.H() : null;
        token = await auth?.currentUser?.getIdToken() || '';
      } catch (_) { /* A cached local name remains a safe fallback. */ }
      const names = await Promise.all(records.map(async (record) => {
        try {
          const endpoint = `https://teens-bible-94271-default-rtdb.firebaseio.com/groupMeta/${encodeURIComponent(record.groupCode)}.json${token ? `?auth=${encodeURIComponent(token)}` : ''}`;
          const response = await fetch(endpoint, { headers: { Accept: 'application/json' } });
          const meta = response.ok ? await response.json() : null;
          return { ...record, name: meta?.name || record.name || record.groupCode };
        } catch (_) { return { ...record, name: record.name || record.groupCode }; }
      }));
      const list = overlay.querySelector('.tb-crew-picker__list');
      if (!names.length) { list.innerHTML = '<div class="tb-crew-picker__empty">No Crews found yet.</div>'; return; }
      const safe = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
      list.innerHTML = names.map((crew) => `<button type="button" class="tb-crew-picker__option${crew.groupCode === current ? ' is-selected' : ''}" data-crew-code="${safe(crew.groupCode).replace(/[^a-zA-Z0-9_-]/g, '')}"><span class="tb-crew-picker__icon">⚔️</span><span><strong>${safe(crew.name)}</strong><small>${crew.role === 'admin' ? 'Admin' : 'Member'}</small></span><span class="tb-crew-picker__check">${crew.groupCode === current ? '✓' : '›'}</span></button>`).join('');
      list.querySelectorAll('[data-crew-code]').forEach((button) => button.addEventListener('click', () => {
        const code = button.getAttribute('data-crew-code');
        localStorage.setItem('teensBibleRankingCrew', code);
        localStorage.setItem('teensBibleLastRankingCrew', code);
        close();
        window.location.reload();
      }));
    } catch (_) {
      overlay.querySelector('.tb-crew-picker__list').innerHTML = '<div class="tb-crew-picker__empty">Could not load your Crews. Please try again.</div>';
    }
  };

  const installCrewPicker = () => {
    const trigger = document.querySelector('[data-loc="client/src/pages/Leaderboard.tsx:876"]')
      || Array.from(document.querySelectorAll('[data-loc*="Leaderboard"], button, [role="button"], a'))
        .filter((element) => /VIEWING CREW|Choose a Crew/i.test(element.textContent || ''))
        .sort((left, right) => (left.textContent || '').length - (right.textContent || '').length)[0];
    if (!trigger || trigger.dataset.tbCrewPickerAttached === '1') return;
    trigger.dataset.tbCrewPickerAttached = '1';
    trigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); openCrewPicker(); }, true);
  };

  const simplifyRankingMobile = () => {
    if (window.innerWidth > 430) return;
    const copy = Array.from(document.querySelectorAll('*')).find((element) => element.children.length === 0 && /1\. Create or join a crew/i.test(element.textContent || ''));
    if (copy) copy.textContent = 'Create or join a Crew, then switch from Viewing Crew.';
    const inviteCopy = Array.from(document.querySelectorAll('*')).find((element) => element.children.length === 0 && /Invite friends to fill the podium/i.test(element.textContent || ''));
    inviteCopy?.closest('.rounded-2xl, .neon-card')?.classList.add('tb-ranking-secondary-invite');
    const summonCopy = Array.from(document.querySelectorAll('*')).find((element) => element.children.length === 0 && /SUMMON ALLIES TO THY GUILD/i.test(element.textContent || ''));
    summonCopy?.closest('.rounded-2xl, .neon-card')?.classList.add('tb-ranking-secondary-invite');
  };


  /* v1.1.89 — delivered Cheer inbox and compact Bible AI composer */
  const TEENZ_DB_URL = 'https://teens-bible-94271-default-rtdb.firebaseio.com';
  const CHEER_WINDOW_MS = 24 * 60 * 60 * 1000;
  let cachedTeenzSession = null;
  let cheerInboxBusy = false;

  const readStoredFirebaseSession = () => {
    const candidates = [];
    try {
      Object.keys(localStorage).filter((key) => key.startsWith('firebase:authUser:')).forEach((key) => {
        candidates.push(localStorage.getItem(key));
      });
    } catch (_) {}
    for (const raw of candidates) {
      try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw;
        const uid = value?.uid;
        const token = value?.stsTokenManager?.accessToken;
        if (uid && token) return { uid, token, name: value?.displayName || value?.email?.split('@')[0] || 'A friend' };
      } catch (_) {}
    }
    return null;
  };

  const readIndexedDbFirebaseSession = () => new Promise((resolve) => {
    if (!window.indexedDB) { resolve(null); return; }
    let request;
    try { request = indexedDB.open('firebaseLocalStorageDb'); } catch (_) { resolve(null); return; }
    request.onerror = () => resolve(null);
    request.onsuccess = () => {
      try {
        const db = request.result;
        if (!db.objectStoreNames.contains('firebaseLocalStorage')) { resolve(null); return; }
        const tx = db.transaction('firebaseLocalStorage', 'readonly');
        const all = tx.objectStore('firebaseLocalStorage').getAll();
        all.onerror = () => resolve(null);
        all.onsuccess = () => {
          for (const entry of all.result || []) {
            const value = entry?.value || entry;
            const uid = value?.uid;
            const token = value?.stsTokenManager?.accessToken;
            if (uid && token) { resolve({ uid, token, name: value?.displayName || value?.email?.split('@')[0] || 'A friend' }); return; }
          }
          resolve(null);
        };
      } catch (_) { resolve(null); }
    };
  });

  const readLiveFirebaseSession = async () => {
    try {
      const core = await import('/assets/index-GemFix1184.js');
      const auth = typeof core.H === 'function' ? core.H() : null;
      const user = auth?.currentUser;
      if (!user) return null;
      const token = await user.getIdToken(true);
      if (!token) return null;
      return { uid: user.uid, token, name: user.displayName || user.email?.split('@')[0] || 'A friend' };
    } catch (_) {
      return null;
    }
  };
  const getTeenzSession = async () => {
    const live = await readLiveFirebaseSession();
    if (live?.uid && live?.token) {
      cachedTeenzSession = live;
      return live;
    }
    if (cachedTeenzSession?.uid && cachedTeenzSession?.token) return cachedTeenzSession;
    cachedTeenzSession = readStoredFirebaseSession() || await readIndexedDbFirebaseSession();
    return cachedTeenzSession;
  };

  const resolveAccountDeleteIdentity = async (session) => {
    const isUsableName = (value) => {
      const text = String(value || '').trim();
      return Boolean(text) && text.toLowerCase() !== 'a friend';
    };
    try {
      const storedProfile = JSON.parse(localStorage.getItem('teensBibleProfile') || '{}');
      const localName = storedProfile?.nickname || storedProfile?.name || storedProfile?.displayName;
      if (isUsableName(localName)) return localName;
    } catch (_) {}
    return isUsableName(session?.name) ? session.name : 'Your Teenz Bible account';
  };

  const tbFetchJson = async (path, token, options = {}) => {
    const separator = path.includes('?') ? '&' : '?';
    const response = await fetch(`${TEENZ_DB_URL}/${path}${separator}auth=${encodeURIComponent(token)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options,
    });
    if (!response.ok) throw new Error(`Firebase request failed (${response.status})`);
    return response.status === 204 ? null : response.json();
  };

  const ACCOUNT_DELETE_ENDPOINT = 'https://deleteownaccount-wbv5lkcdqa-uc.a.run.app';
  const ACCOUNT_DELETE_TYPED_CONFIRMATION = 'DELETE';
  const ACCOUNT_DELETE_SERVER_CONFIRMATION = 'DELETE MY ACCOUNT';
  const blockedUidCache = new Set();

  const escapeHtml = (value) => String(value || '').replace(/[&<'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

  const clearTeenzLocalAccountData = () => {
    try {
      const removable = [];
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index) || '';
        if (key.startsWith('teensBible') || key.startsWith('firebase:authUser:') || key === 'playerName' || key === 'totalXP' || key === 'lastRead') removable.push(key);
      }
      removable.forEach((key) => localStorage.removeItem(key));
    } catch (_) {}
  };

  const signOutAfterAccountDeletion = async () => {
    try {
      const core = await import('/assets/index-GemFix1184.js');
      const auth = typeof core.H === 'function' ? core.H() : null;
      await auth?.signOut?.();
    } catch (_) {}
    try {
      await window.Capacitor?.Plugins?.FirebaseAuthentication?.signOut?.();
    } catch (_) {}
    clearTeenzLocalAccountData();
    cachedTeenzSession = null;
  };

  const closeSecureAccountDeleteDialog = () => document.getElementById('tb-secure-account-delete')?.remove();

  const performSecureAccountDeletion = async (button, status) => {
    const session = await getTeenzSession();
    if (!session?.token) throw new Error('authentication_required');
    button.disabled = true;
    button.textContent = 'DELETING ACCOUNT…';
    status.textContent = 'Deleting your account and associated Teenz Bible data…';
    status.className = 'tb-account-delete-status is-working';
    const response = await fetch(ACCOUNT_DELETE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.token}`,
      },
      body: JSON.stringify({ confirmation: ACCOUNT_DELETE_SERVER_CONFIRMATION }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      const error = new Error(payload?.message || 'Account deletion could not be completed.');
      error.code = payload?.code || `http_${response.status}`;
      throw error;
    }
    status.textContent = 'Account deleted. Returning to the welcome screen…';
    status.className = 'tb-account-delete-status is-success';
    await signOutAfterAccountDeletion();
    window.setTimeout(() => { window.location.assign('/'); }, 850);
  };

  const openSecureAccountDeleteDialog = async () => {
    if (document.getElementById('tb-secure-account-delete')) return;
    const session = await getTeenzSession();
    const accountIdentity = await resolveAccountDeleteIdentity(session);
    const dialog = document.createElement('div');
    dialog.id = 'tb-secure-account-delete';
    dialog.className = 'tb-secure-account-delete';
    dialog.innerHTML = `
      <section class="tb-secure-account-delete__card" role="dialog" aria-modal="true" aria-labelledby="tb-delete-title">
        <p class="tb-secure-account-delete__eyebrow">PERMANENT ACTION</p>
        <h2 id="tb-delete-title">Delete your account?</h2>
        <p class="tb-secure-account-delete__identity">${escapeHtml(accountIdentity)}</p>
        <p class="tb-secure-account-delete__copy">This permanently removes your Teenz Bible profile, reading progress, cheers, Crew membership, and sign-in account. This cannot be undone.</p>
        <label class="tb-secure-account-delete__ack"><input type="checkbox" data-tb-delete-ack> <span>I understand this cannot be reversed.</span></label>
        <label class="tb-secure-account-delete__typed"><span>Type <b>DELETE</b> to continue</span><input data-tb-delete-typed autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="DELETE"></label>
        <p class="tb-secure-account-delete__hint">For your protection, you must have signed in within the last 10 minutes. Otherwise, sign out, sign in again, and retry.</p>
        <p class="tb-account-delete-status" aria-live="polite"></p>
        <div class="tb-secure-account-delete__actions"><button type="button" data-tb-delete-cancel>Keep my account</button><button type="button" data-tb-delete-confirm disabled>Delete permanently</button></div>
      </section>`;
    document.body.appendChild(dialog);

    const typed = dialog.querySelector('[data-tb-delete-typed]');
    const acknowledgement = dialog.querySelector('[data-tb-delete-ack]');
    const confirm = dialog.querySelector('[data-tb-delete-confirm]');
    const status = dialog.querySelector('.tb-account-delete-status');
    const syncConfirmationState = () => {
      const typedDelete = typed?.value.trim().toUpperCase() === ACCOUNT_DELETE_TYPED_CONFIRMATION;
      const acknowledged = Boolean(acknowledgement?.checked);
      const ready = typedDelete && acknowledged;
      confirm.disabled = !ready;
      confirm.textContent = ready ? 'Delete permanently' : (acknowledged ? 'Type DELETE above' : 'Tick acknowledgement above');
      if (typedDelete && !acknowledged) {
        status.textContent = 'One step left: tick the acknowledgement checkbox to unlock deletion.';
        status.className = 'tb-account-delete-status is-working';
      } else if (acknowledged && !typedDelete && typed?.value.trim()) {
        status.textContent = 'Type DELETE exactly to unlock deletion.';
        status.className = 'tb-account-delete-status is-working';
      } else if (ready) {
        status.textContent = 'All confirmations are complete. You may now delete this account.';
        status.className = 'tb-account-delete-status is-success';
      } else {
        status.textContent = '';
        status.className = 'tb-account-delete-status';
      }
    };
    typed?.addEventListener('input', syncConfirmationState);
    acknowledgement?.addEventListener('change', syncConfirmationState);
    syncConfirmationState();
    dialog.querySelector('[data-tb-delete-cancel]')?.addEventListener('click', closeSecureAccountDeleteDialog);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeSecureAccountDeleteDialog(); });
    confirm?.addEventListener('click', () => {
      performSecureAccountDeletion(confirm, status).catch((error) => {
        console.warn('[Teenz Bible] Account deletion failed:', error);
        const isRecentLogin = error?.code === 'recent_sign_in_required';
        status.textContent = isRecentLogin
          ? 'For your protection, sign out, sign in again, then retry account deletion.'
          : 'We could not delete your account yet. Nothing is confirmed as deleted. Please retry or contact support.';
        status.className = 'tb-account-delete-status is-error';
        confirm.disabled = false;
        confirm.textContent = 'Delete permanently';
      });
    });
  };

  const installAccountDangerActionPresentation = () => {
    const action = document.querySelector('[data-loc="client/src/pages/Profile.tsx:1931"]');
    if (!(action instanceof HTMLButtonElement)) return;
    const row = action.parentElement;
    row?.classList.add('tb-account-danger-row');
    row?.querySelector('[data-loc="client/src/pages/Profile.tsx:1930"]')?.classList.add('tb-account-danger-separator');
    row?.querySelector('[data-loc="client/src/pages/Profile.tsx:1929"]')?.classList.add('tb-reset-progress-action');
    action.classList.add('tb-account-danger-action');
    action.setAttribute('aria-label', 'Delete account permanently');
    if (action.dataset.tbDangerActionPresented !== '1') {
      action.dataset.tbDangerActionPresented = '1';
      action.innerHTML = '<span class="tb-account-danger-action__icon" aria-hidden="true">⚠</span><span class="tb-account-danger-action__copy"><strong>Delete Account</strong><small>Permanent action</small></span>';
    }
  };

  const installSecureAccountDeletion = () => {
    if (document.documentElement.dataset.tbSecureDeleteInstalled === '1') return;
    document.documentElement.dataset.tbSecureDeleteInstalled = '1';
    const interceptDelete = (event) => {
      const action = event.target instanceof Element ? event.target.closest('[data-loc="client/src/pages/Profile.tsx:1913"], [data-loc="client/src/pages/Profile.tsx:1931"]') : null;
      if (!action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      void openSecureAccountDeleteDialog();
    };
    document.addEventListener('click', interceptDelete, true);
    document.addEventListener('touchend', interceptDelete, true);
  };

  const loadBlockedUids = async () => {
    const session = await getTeenzSession();
    if (!session?.uid || !session?.token) return blockedUidCache;
    try {
      const blocked = await tbFetchJson(`blocks/${encodeURIComponent(session.uid)}.json`, session.token) || {};
      blockedUidCache.clear();
      Object.keys(blocked).forEach((uid) => blockedUidCache.add(uid));
    } catch (_) {}
    return blockedUidCache;
  };

  const blockRankingMember = async (targetUid, targetName) => {
    const session = await getTeenzSession();
    if (!session?.uid || !session?.token || !targetUid) throw new Error('Sign in is required.');
    if (targetUid === session.uid) throw new Error('You cannot block yourself.');
    await tbFetchJson(`blocks/${encodeURIComponent(session.uid)}/${encodeURIComponent(targetUid)}.json`, session.token, {
      method: 'PUT',
      body: JSON.stringify({ uid: targetUid, name: targetName || 'Member', blockedAt: Date.now() }),
    });
    blockedUidCache.add(targetUid);
  };

  const reportRankingMember = async (targetUid, targetName, reason, details) => {
    const session = await getTeenzSession();
    if (!session?.uid || !session?.token || !targetUid) throw new Error('Sign in is required.');
    await tbFetchJson('safetyReports.json', session.token, {
      method: 'POST',
      body: JSON.stringify({
        reporterUid: session.uid,
        reporterName: session.name || 'Member',
        reportedUid: targetUid,
        reportedName: targetName || 'Member',
        reason,
        details: String(details || '').slice(0, 500),
        createdAt: Date.now(),
        status: 'open',
      }),
    });
  };

  const closeSafetyReportDialog = () => document.getElementById('tb-safety-report-dialog')?.remove();

  const openSafetyReportDialog = (targetUid, targetName) => {
    if (document.getElementById('tb-safety-report-dialog')) return;
    const dialog = document.createElement('div');
    dialog.id = 'tb-safety-report-dialog';
    dialog.className = 'tb-safety-report-dialog';
    dialog.innerHTML = `<section class="tb-safety-report-dialog__card" role="dialog" aria-modal="true"><p class="tb-safety-report-dialog__eyebrow">SAFETY REPORT</p><h2>Report ${escapeHtml(targetName || 'member')}?</h2><p>Tell us why this member should be reviewed. The report is private.</p><label>Reason<select data-tb-report-reason><option>Inappropriate name or profile</option><option>Harassment or bullying</option><option>Spam or impersonation</option><option>Other concern</option></select></label><label>Optional details<textarea data-tb-report-details maxlength="500" placeholder="What happened?"></textarea></label><p class="tb-report-status" aria-live="polite"></p><div class="tb-safety-report-dialog__actions"><button type="button" data-tb-report-cancel>Cancel</button><button type="button" data-tb-report-submit>Send report</button></div></section>`;
    document.body.appendChild(dialog);
    const status = dialog.querySelector('.tb-report-status');
    dialog.querySelector('[data-tb-report-cancel]')?.addEventListener('click', closeSafetyReportDialog);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeSafetyReportDialog(); });
    dialog.querySelector('[data-tb-report-submit]')?.addEventListener('click', (event) => {
      const submit = event.currentTarget;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      const reason = dialog.querySelector('[data-tb-report-reason]')?.value || 'Other concern';
      const details = dialog.querySelector('[data-tb-report-details]')?.value || '';
      reportRankingMember(targetUid, targetName, reason, details).then(() => {
        status.textContent = 'Thank you. Your report was sent for review.';
        status.className = 'tb-report-status is-success';
        window.setTimeout(closeSafetyReportDialog, 900);
      }).catch(() => {
        status.textContent = 'We could not send that report yet. Please try again.';
        status.className = 'tb-report-status is-error';
        submit.disabled = false;
        submit.textContent = 'Send report';
      });
    });
  };

  const showCheerFeedback = (message, state = 'success') => {
    document.getElementById('tb-cheer-feedback')?.remove();
    const feedback = document.createElement('div');
    feedback.id = 'tb-cheer-feedback';
    feedback.className = `tb-cheer-feedback is-${state}`;
    feedback.textContent = message;
    document.body.appendChild(feedback);
    window.setTimeout(() => feedback.remove(), 2600);
  };

  const closeRankingMemberModal = (modal) => {
    const closeButton = modal?.querySelector('[data-tb-ranking-close]');
    if (closeButton && !closeButton.dataset.tbRuntimeBypass) {
      closeButton.dataset.tbRuntimeBypass = '1';
      closeButton.click();
      window.setTimeout(() => { delete closeButton.dataset.tbRuntimeBypass; }, 0);
      return;
    }
    modal?.remove();
  };

  const sendDeliveredCheer = async (button) => {
    const recipientUid = button.dataset.tbMemberUid;
    const recipientName = button.dataset.tbMemberName || 'this friend';
    const session = await getTeenzSession();
    if (!recipientUid || !session?.uid || !session?.token) throw new Error('Sign in is required before sending a Cheer.');
    if (recipientUid === session.uid) throw new Error('You cannot cheer for yourself.');
    await loadBlockedUids();
    if (blockedUidCache.has(recipientUid)) throw new Error('You blocked this member. Unblock them before sending a Cheer.');

    const path = `notifications/${encodeURIComponent(recipientUid)}/encouragements/${encodeURIComponent(session.uid)}.json`;
    const existing = await tbFetchJson(path, session.token);
    const now = Date.now();
    if (existing?.createdAt && now - Number(existing.createdAt) < CHEER_WINDOW_MS) {
      const hours = Math.max(1, Math.ceil((CHEER_WINDOW_MS - (now - Number(existing.createdAt))) / 3600000));
      return { status: 'limited', recipientName, hours };
    }

    let senderName = session.name || 'A friend';
    try {
      const publicProfile = await tbFetchJson(`users/${encodeURIComponent(session.uid)}.json`, session.token);
      senderName = publicProfile?.nickname || senderName;
    } catch (_) {}

    await tbFetchJson(path, session.token, {
      method: 'PUT',
      body: JSON.stringify({
        type: 'cheer',
        senderUid: session.uid,
        senderName,
        recipientUid,
        createdAt: now,
        readAt: null,
      }),
    });
    return { status: 'sent', recipientName };
  };

  const installRankingMemberActions = () => {
    const modal = document.querySelector('[data-tb-ranking-member-modal="1"]');
    if (!modal || modal.dataset.tbDeliveredActionsInstalled === '1') return;
    modal.dataset.tbDeliveredActionsInstalled = '1';

    const interceptClick = (event) => {
      const action = event.target instanceof Element ? event.target.closest('[data-tb-ranking-close], [data-tb-cheer]') : null;
      if (!action || action.dataset.tbRuntimeBypass === '1') return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const parentModal = action.closest('[data-tb-ranking-member-modal="1"]');
      if (action.matches('[data-tb-ranking-close]')) {
        closeRankingMemberModal(parentModal);
        return;
      }
      if (action.dataset.tbSending === '1') return;
      action.dataset.tbSending = '1';
      action.setAttribute('aria-busy', 'true');
      const originalText = action.textContent;
      action.textContent = 'SENDING…';
      sendDeliveredCheer(action).then((result) => {
        if (result.status === 'limited') {
          showCheerFeedback(`You already cheered for ${result.recipientName}. Try again in ${result.hours}h.`, 'info');
        } else {
          showCheerFeedback(`Sent! ${result.recipientName} will see your encouragement.`, 'success');
          window.setTimeout(() => closeRankingMemberModal(parentModal), 700);
        }
      }).catch((error) => {
        console.warn('[Teenz Bible] Cheer was not sent:', error);
        const message = /401|unauthorized|sign in is required/i.test(error?.message || '')
          ? 'Your session needs a refresh. Please close and reopen Teenz Bible, then try again.'
          : 'We could not send your Cheer right now. Please try again.';
        showCheerFeedback(message, 'error');
      }).finally(() => {
        action.dataset.tbSending = '0';
        action.removeAttribute('aria-busy');
        action.textContent = originalText || '⚔️ CHEER';
      });
    };
    modal.addEventListener('click', interceptClick, true);
    modal.addEventListener('touchend', interceptClick, true);
  };

  const formatCheerTime = (createdAt) => {
    const elapsed = Math.max(0, Date.now() - Number(createdAt || Date.now()));
    const minutes = Math.floor(elapsed / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const launchCheerConfetti = (anchor) => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || document.getElementById('tb-cheer-confetti')) return;
    const layer = document.createElement('div');
    layer.id = 'tb-cheer-confetti';
    layer.setAttribute('aria-hidden', 'true');
    const colors = ['#fae17a', '#f6bc43', '#fff7e1', '#a6e3bb', '#d79cff'];
    for (let index = 0; index < 20; index += 1) {
      const piece = document.createElement('i');
      piece.className = 'tb-cheer-confetti__piece';
      piece.style.setProperty('--x', `${8 + Math.random() * 84}%`);
      piece.style.setProperty('--delay', `${Math.random() * 180}ms`);
      piece.style.setProperty('--spin', `${-220 + Math.random() * 440}deg`);
      piece.style.setProperty('--color', colors[index % colors.length]);
      layer.appendChild(piece);
    }
    (anchor || document.body).appendChild(layer);
    window.setTimeout(() => layer.remove(), 2100);
  };

  const renderCheerInbox = async () => {
    const profilePage = Array.from(document.querySelectorAll('.tb-page')).find((page) => page.querySelector('[data-loc*="Profile.tsx"]'));
    if (!profilePage || cheerInboxBusy) return;
    const session = await getTeenzSession();
    if (!session?.uid || !session?.token) return;
    cheerInboxBusy = true;
    try {
      const events = await tbFetchJson(`notifications/${encodeURIComponent(session.uid)}/encouragements.json`, session.token) || {};
      const recent = Object.entries(events).map(([id, event]) => ({ ...event, _id: id })).filter((event) => event?.type === 'cheer').sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0)).slice(0, 3);
      const existing = profilePage.querySelector('#tb-cheer-inbox');
      if (!recent.length) { existing?.remove(); return; }

      const card = existing || document.createElement('section');
      const newest = recent[0];
      const seenKey = `tb-cheer-last-seen:${session.uid}`;
      const lastSeen = window.localStorage.getItem(seenKey);
      const isNew = Boolean(newest?._id && newest._id !== lastSeen);
      if (newest?._id) window.localStorage.setItem(seenKey, newest._id);

      card.id = 'tb-cheer-inbox';
      card.className = `tb-cheer-inbox${isNew ? ' is-new' : ''}`;
      card.innerHTML = `<div class="tb-cheer-inbox__head"><span>⚔️ ENCOURAGEMENTS</span><b>${recent.length} NEW</b></div><div class="tb-cheer-inbox__list">${recent.map((event) => `<article class="tb-cheer-inbox__item"><div class="tb-cheer-inbox__avatar" aria-hidden="true">⚔️</div><div class="tb-cheer-inbox__copy"><strong>${escapeHtml(event.senderName || 'A friend')}</strong><p>cheered for you <span>· Keep growing!</span></p><time>${formatCheerTime(event.createdAt)}</time></div><div class="tb-cheer-inbox__seal" aria-hidden="true">✦</div></article>`).join('')}</div>`;

      if (!existing) {
        const header = profilePage.querySelector('.tb-centered-profile-header');
        if (header) header.insertAdjacentElement('afterend', card); else profilePage.insertBefore(card, profilePage.firstElementChild);
      }
      if (isNew) {
        launchCheerConfetti(card);
        window.setTimeout(() => card.classList.remove('is-new'), 1200);
      }
    } catch (error) {
      console.warn('[Teenz Bible] Cheer inbox unavailable:', error);
    } finally {
      cheerInboxBusy = false;
    }
  };

  /* v1.1.91 — direct portal actions for the Ranking member modal */
  const getRankingMemberModal = () => document.querySelector('[data-tb-ranking-member-modal="1"]')
    || Array.from(document.querySelectorAll('.fixed.inset-0')).find((overlay) => /CHEER/i.test(overlay.textContent || '') && /CLOSE/i.test(overlay.textContent || ''));

  const removeRankingActionPortal = () => document.getElementById('tb-ranking-action-portal')?.remove();

  // iPad can treat a transformed app shell as the containing block for fixed
  // React overlays. Preserve React ownership, but cancel that offset so the
  // member card is centered in the physical viewport rather than pushed aside.
  const stabilizeRankingMemberModalForViewport = (modal) => {
    if (!modal) return;
    modal.classList.add('tb-modal-viewport-safe', 'tb-ranking-member-modal-viewport');
    for (let node = modal.parentElement; node && node !== document.body; node = node.parentElement) {
      const computed = window.getComputedStyle(node);
      if (computed.transform !== 'none' || computed.perspective !== 'none' || computed.filter !== 'none') {
        node.style.setProperty('transform', 'none', 'important');
        node.style.setProperty('perspective', 'none', 'important');
        node.style.setProperty('filter', 'none', 'important');
      }
    }
    modal.style.setProperty('position', 'fixed', 'important');
    modal.style.setProperty('inset', '0', 'important');
    modal.style.setProperty('right', 'auto', 'important');
    modal.style.setProperty('bottom', 'auto', 'important');
    modal.style.setProperty('transform', 'none', 'important');
    const rect = modal.getBoundingClientRect();
    modal.style.setProperty('left', `${-rect.x}px`, 'important');
    modal.style.setProperty('top', `${-rect.y}px`, 'important');
    modal.style.setProperty('width', `${window.innerWidth}px`, 'important');
    modal.style.setProperty('height', `${window.innerHeight}px`, 'important');
  };

  const installRankingActionPortal = () => {
    const modal = getRankingMemberModal();
    if (!modal) { removeRankingActionPortal(); return; }
    stabilizeRankingMemberModalForViewport(modal);
    if (document.getElementById('tb-ranking-action-portal')) return;

    const nativeCheer = modal.querySelector('[data-tb-cheer]') || Array.from(modal.querySelectorAll('button')).find((button) => /CHEER/i.test(button.textContent || ''));
    const targetUid = nativeCheer?.dataset.tbMemberUid || '';
    const targetName = nativeCheer?.dataset.tbMemberName || modal.querySelector('h3')?.textContent?.trim() || 'this friend';

    const portal = document.createElement('div');
    portal.id = 'tb-ranking-action-portal';
    portal.className = 'tb-ranking-action-portal';
    portal.innerHTML = '<div class="tb-ranking-action-portal__heading"><span>MEMBER ACTIONS</span><button type="button" data-tb-portal-close aria-label="Close member profile">✕</button></div><button type="button" class="tb-ranking-action-portal__cheer" data-tb-portal-cheer>⚔️ <span>CHEER</span><small>Send encouragement</small></button><div class="tb-ranking-action-portal__secondary"><button type="button" data-tb-portal-close>Close</button><button type="button" data-tb-portal-report>Report</button><button type="button" data-tb-portal-block>Block</button></div>';
    document.body.appendChild(portal);

    const close = () => {
      const liveModal = getRankingMemberModal();
      liveModal?.remove();
      removeRankingActionPortal();
    };
    portal.querySelectorAll('[data-tb-portal-close]').forEach((button) => button.addEventListener('click', close, { passive: true }));
    portal.querySelector('[data-tb-portal-report]')?.addEventListener('click', () => {
      if (!targetUid) { showCheerFeedback('Could not identify this member. Please reopen the profile.', 'error'); return; }
      openSafetyReportDialog(targetUid, targetName);
    });
    portal.querySelector('[data-tb-portal-block]')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (!targetUid) { showCheerFeedback('Could not identify this member. Please reopen the profile.', 'error'); return; }
      if (!window.confirm(`Block ${targetName}? You will no longer be able to send Cheers to this member.`)) return;
      button.disabled = true;
      button.textContent = 'Blocking…';
      try {
        await blockRankingMember(targetUid, targetName);
        showCheerFeedback(`${targetName} is blocked.`, 'success');
        close();
      } catch (_) {
        button.disabled = false;
        button.textContent = 'Block';
        showCheerFeedback('We could not block this member yet. Please try again.', 'error');
      }
    });
    portal.querySelector('[data-tb-portal-cheer]')?.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (!targetUid) { showCheerFeedback('Could not identify this member. Please close and reopen the profile.', 'error'); return; }
      if (button.dataset.tbSending === '1') return;
      button.dataset.tbSending = '1';
      button.textContent = 'Sending…';
      try {
        const result = await sendDeliveredCheer({ dataset: { tbMemberUid: targetUid, tbMemberName: targetName } });
        if (result.status === 'limited') {
          showCheerFeedback(`You already cheered for ${result.recipientName}. Try again in ${result.hours}h.`, 'info');
        } else {
          showCheerFeedback(`Sent! ${result.recipientName} will see your encouragement.`, 'success');
          window.setTimeout(close, 700);
        }
      } catch (error) {
        console.warn('[Teenz Bible] Portal Cheer was not sent:', error);
        const message = /401|unauthorized|sign in is required/i.test(error?.message || '')
          ? 'Your session needs a refresh. Please close and reopen Teenz Bible, then try again.'
          : 'We could not send your Cheer right now. Please try again.';
        showCheerFeedback(message, 'error');
      } finally {
        button.dataset.tbSending = '0';
        button.textContent = '⚔️ Cheer';
      }
    });
  };

  const installModernBibleAiHeader = () => {
    const header = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:510"]');
    if (!header) return;
    const shellWidth = header.getBoundingClientRect().width || window.innerWidth;
    if (shellWidth > 640) return;
    const actions = header?.querySelector('[data-loc="client/src/pages/BibleAI.tsx:534"]');
    if (!header || !actions) return;
    header.classList.add('tb-ai-modern-header');
    let more = actions.querySelector('.tb-ai-more-actions');
    let popover = document.getElementById('tb-ai-actions-popover');
    if (!more) {
      more = document.createElement('button');
      more.type = 'button';
      more.className = 'tb-ai-more-actions';
      more.setAttribute('aria-label', 'More Bible AI actions');
      more.setAttribute('aria-expanded', 'false');
      more.textContent = '•••';
      actions.insertBefore(more, actions.querySelector('[data-loc="client/src/pages/BibleAI.tsx:565"]') || null);
    }
    if (!popover) {
      popover = document.createElement('div');
      popover.id = 'tb-ai-actions-popover';
      popover.className = 'tb-ai-actions-popover';
      popover.setAttribute('role', 'menu');
      popover.innerHTML = '<button type="button" data-proxy-loc="client/src/pages/BibleAI.tsx:537" role="menuitem">Export</button><button type="button" data-proxy-loc="client/src/pages/BibleAI.tsx:547" role="menuitem">Threads</button><button type="button" data-proxy-loc="client/src/pages/BibleAI.tsx:556" role="menuitem">New Thread</button>';
      document.body.appendChild(popover);
    }
    popover.querySelectorAll('[data-proxy-loc]').forEach((proxy) => {
      if (proxy.dataset.bound === 'true') return;
      proxy.dataset.bound = 'true';
      proxy.addEventListener('click', () => {
        const target = header.querySelector(`[data-loc="${proxy.getAttribute('data-proxy-loc')}"]`);
        popover.classList.remove('is-open');
        more.setAttribute('aria-expanded', 'false');
        target?.click();
      });
    });
    if (more.dataset.bound !== 'true') {
      more.dataset.bound = 'true';
      more.addEventListener('click', (event) => {
        event.stopPropagation();
        const open = popover.classList.toggle('is-open');
        more.setAttribute('aria-expanded', String(open));
      });
    }
    if (popover.dataset.outsideBound !== 'true') {
      popover.dataset.outsideBound = 'true';
      document.addEventListener('pointerdown', (event) => {
        if (!popover.contains(event.target) && event.target !== more) {
          popover.classList.remove('is-open');
          more.setAttribute('aria-expanded', 'false');
        }
      }, true);
    }
  };

  const installBibleAiBackBridge = (header) => {
    const back = header?.querySelector('[data-loc="client/src/pages/BibleAI.tsx:515"]');
    if (!back || back.dataset.tbBackBridgeBound === 'true') return;
    back.dataset.tbBackBridgeBound = 'true';
    let lastNavigation = 0;
    const goHome = (event) => {
      if (Date.now() - lastNavigation < 500) return;
      lastNavigation = Date.now();
      event.preventDefault();
      event.stopImmediatePropagation();
      if (location.pathname === '/') return;
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
    back.addEventListener('click', goHome, true);
    back.addEventListener('touchend', goHome, { capture: true, passive: false });
  };

  const installBibleAiFollowupSuggestions = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const messages = aiRoot?.querySelector('[data-loc="client/src/pages/BibleAI.tsx:596"]');
    const strip = aiRoot?.querySelector('[data-loc="client/src/pages/BibleAI.tsx:655"]');
    if (!messages || !strip) return;
    strip.classList.add('tb-ai-followup-strip');
    const update = () => {
      const answerBubbles = Array.from(messages.querySelectorAll('.ai-bubble-ai')).filter((node) => !/Got questions about the Bible|Ask me anything|temporarily unavailable|could not answer/i.test(node.textContent || ''));
      const answered = answerBubbles.length > 0;
      strip.classList.toggle('tb-ai-followup-hidden', !answered);
      strip.classList.toggle('tb-ai-followup-visible', answered);
      if (!answered) return;
      const questions = ['What does that mean for me?', 'Can you explain it more simply?', 'What Bible verse connects to this?'];
      Array.from(strip.querySelectorAll('[data-loc="client/src/pages/BibleAI.tsx:666"]')).slice(0, 3).forEach((button, index) => { button.textContent = questions[index]; });
      strip.querySelector('[data-loc="client/src/pages/BibleAI.tsx:680"]')?.classList.add('tb-ai-followup-refresh');
    };
    update();
    if (messages.dataset.tbFollowupObserverBound !== 'true') {
      messages.dataset.tbFollowupObserverBound = 'true';
      new MutationObserver(update).observe(messages, { childList: true, subtree: true, characterData: true });
    }
  };

  const applyCompactBibleAi = () => {
    const aiRoot = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:503"]');
    const aiInput = document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:729"]');
    const existingBack = document.querySelector('.tb-ai-direct-back');
    if (!aiRoot) { existingBack?.remove(); return; }
    aiRoot.classList.add('tb-ai-screen', 'tb-ai-compact-layout');
    installModernBibleAiHeader();
    installBibleAiBackBridge(document.querySelector('[data-loc="client/src/pages/BibleAI.tsx:510"]'));
    installBibleAiFollowupSuggestions();
    if (aiInput?.parentElement) aiInput.parentElement.classList.add('tb-ai-compact-composer');
    const source = document.querySelector('.tb-ai-source-strip');
    if (source) {
      source.classList.add('tb-ai-compact-context');
      source.textContent = 'Read John 3 in context';
    }
    if (existingBack) existingBack.remove();
  };

  let profilePhotoNudgeObserver = null;
  const removeBlockingProfilePhotoNudge = () => {
    const candidates = Array.from(document.querySelectorAll('[role="dialog"], .fixed.inset-0, [class*="fixed"][class*="inset-0"]'));
    candidates.forEach((node) => {
      const text = (node.innerText || '').replace(/\s+/g, ' ').trim();
      if (/Add a Profile Photo!/i.test(text) && /Let's go|Maybe later/i.test(text)) {
        const overlay = node.closest('[role="dialog"], .fixed.inset-0, [class*="fixed"][class*="inset-0"]') || node;
        overlay.remove();
        clearPhotoModalIsolation();
      }
    });
  };

  const ensureProfilePhotoNudgeGuard = () => {
    removeBlockingProfilePhotoNudge();
    if (profilePhotoNudgeObserver || !document.body) return;
    profilePhotoNudgeObserver = new MutationObserver(() => removeBlockingProfilePhotoNudge());
    profilePhotoNudgeObserver.observe(document.body, { childList: true, subtree: true });
  };

  const PHOTO_MODAL_BACKGROUND_CLASS = 'tb-photo-modal-background-hidden';
  const clearPhotoModalIsolation = () => {
    document.body?.classList.remove('tb-photo-modal-open');
    document.querySelectorAll(`.${PHOTO_MODAL_BACKGROUND_CLASS}`).forEach((node) => node.classList.remove(PHOTO_MODAL_BACKGROUND_CLASS));
  };
  const isolatePhotoModalForeground = (photoOverlay) => {
    const profileRoot = document.querySelector('[data-loc="client/src/pages/Profile.tsx:569"]');
    const bottomNavigation = document.querySelector('nav.fixed.bottom-0');
    if (!profileRoot || !photoOverlay) {
      clearPhotoModalIsolation();
      return;
    }
    document.body.classList.add('tb-photo-modal-open');
    Array.from(profileRoot.children).forEach((child) => {
      child.classList.toggle(PHOTO_MODAL_BACKGROUND_CLASS, !child.contains(photoOverlay));
    });
    bottomNavigation?.classList.add(PHOTO_MODAL_BACKGROUND_CLASS);
  };

  const makeNativePhotoInputsActivatable = () => {
    if (!isNativePlatform()) return;
    // WKWebView can ignore a React-triggered click on an input that is
    // `display:none`. Keep the existing React change handler, but make its two
    // file inputs minimally present and transparent while the sheet is open.
    ['client/src/pages/Profile.tsx:1101', 'client/src/pages/Profile.tsx:1120'].forEach((loc) => {
      const input = document.querySelector(`[data-loc="${loc}"]`);
      if (!(input instanceof HTMLInputElement)) return;
      input.classList.remove('hidden');
      input.style.setProperty('position', 'absolute', 'important');
      input.style.setProperty('width', '1px', 'important');
      input.style.setProperty('height', '1px', 'important');
      input.style.setProperty('min-width', '1px', 'important');
      input.style.setProperty('min-height', '1px', 'important');
      input.style.setProperty('opacity', '0.001', 'important');
      input.style.setProperty('pointer-events', 'none', 'important');
      input.style.setProperty('overflow', 'hidden', 'important');
    });
  };

  let profilePhotoUserIntentUntil = 0;
  const installProfilePhotoIntentBridge = () => {
    const avatar = document.querySelector('[data-loc="client/src/pages/Profile.tsx:697"]');
    if (!avatar || avatar.dataset.tbPhotoIntentBound === 'true') return;
    avatar.dataset.tbPhotoIntentBound = 'true';
    const remember = () => { profilePhotoUserIntentUntil = Date.now() + 60000; };
    avatar.addEventListener('pointerdown', remember, true);
    avatar.addEventListener('touchstart', remember, true);
    avatar.addEventListener('click', remember, true);
  };

  const installDirectProfilePhotoChooser = () => {
    // Do not intercept the avatar action. Profile.tsx still owns camera/gallery
    // behavior; we only distinguish an intentional avatar gesture from a stale
    // React overlay restored by an iPad WebView session.
    ensureProfilePhotoNudgeGuard();
    installProfilePhotoIntentBridge();
    makeNativePhotoInputsActivatable();
    const avatar = document.querySelector('[data-loc="client/src/pages/Profile.tsx:697"]');
    if (avatar) {
      avatar.style.setProperty('position', 'relative', 'important');
      avatar.style.setProperty('z-index', '2147483646', 'important');
    }
    const photoOverlay = document.querySelector('[data-loc="client/src/pages/Profile.tsx:907"]');
    const photoDialog = document.querySelector('[data-loc="client/src/pages/Profile.tsx:914"]');
    const userInitiated = Date.now() < profilePhotoUserIntentUntil;
    if (photoOverlay && photoDialog && userInitiated) {
      photoOverlay.classList.add('tb-photo-modal-overlay');
      photoDialog.classList.add('tb-photo-modal-sheet');
      photoDialog.querySelectorAll('button').forEach((button) => {
        const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
        if (/Take Photo/i.test(text)) button.classList.add('tb-photo-option-camera');
        else if (/Choose from Gallery/i.test(text)) button.classList.add('tb-photo-option-gallery');
        else if (/Cancel/i.test(text)) button.classList.add('tb-photo-cancel');
        else if (button.querySelector('img')) button.classList.add('tb-photo-avatar-option');
      });
      const avatarButtons = Array.from(photoDialog.querySelectorAll('button')).filter((button) => button.classList.contains('tb-photo-avatar-option'));
      avatarButtons[0]?.parentElement?.classList.add('tb-photo-avatar-grid');
      isolatePhotoModalForeground(photoOverlay);
      for (let node = photoOverlay.parentElement; node && node !== document.body; node = node.parentElement) {
        const computed = window.getComputedStyle(node);
        if (computed.transform !== 'none' || computed.perspective !== 'none' || computed.filter !== 'none') {
          node.style.setProperty('transform', 'none', 'important');
          node.style.setProperty('perspective', 'none', 'important');
          node.style.setProperty('filter', 'none', 'important');
        }
      }
      photoOverlay.style.setProperty('position', 'fixed', 'important');
      photoOverlay.style.setProperty('inset', '0', 'important');
      photoOverlay.style.setProperty('width', '100vw', 'important');
      photoOverlay.style.setProperty('height', '100dvh', 'important');
      photoOverlay.style.setProperty('display', 'flex', 'important');
      photoOverlay.style.setProperty('align-items', 'center', 'important');
      photoOverlay.style.setProperty('justify-content', 'center', 'important');
      photoOverlay.style.setProperty('padding', '16px', 'important');
      photoOverlay.style.setProperty('box-sizing', 'border-box', 'important');
      const shellCandidate = Array.from(document.querySelectorAll('.tb-page')).map((node) => ({ node, rect: node.getBoundingClientRect() })).find(({ rect }) => rect.width > 0 && rect.width <= 600);
      const shellRect = shellCandidate?.rect;
      const shellWidth = shellRect?.width || Math.min(480, window.innerWidth || 480);
      const desiredShellLeft = shellRect?.left ?? Math.max(0, ((window.innerWidth || shellWidth) - shellWidth) / 2);
      const overlayBeforePosition = photoOverlay.getBoundingClientRect();
      photoOverlay.style.setProperty('width', `${shellWidth}px`, 'important');
      photoOverlay.style.setProperty('left', `${desiredShellLeft - overlayBeforePosition.left}px`, 'important');
      photoOverlay.style.setProperty('right', 'auto', 'important');
      photoOverlay.style.setProperty('top', `${-overlayBeforePosition.top}px`, 'important');
      photoOverlay.style.setProperty('bottom', 'auto', 'important');
      photoOverlay.style.setProperty('height', '100dvh', 'important');
      photoDialog.style.setProperty('position', 'relative', 'important');
      photoDialog.style.setProperty('inset', 'auto', 'important');
      photoDialog.style.setProperty('width', 'min(calc(100vw - 32px), 432px)', 'important');
      photoDialog.style.setProperty('max-width', '432px', 'important');
      photoDialog.style.setProperty('max-height', 'calc(100dvh - 32px)', 'important');
      photoDialog.style.setProperty('margin', '0', 'important');
      photoDialog.style.setProperty('transform', 'none', 'important');
      photoDialog.style.setProperty('top', '0px', 'important');
      photoDialog.style.setProperty('animation', 'none', 'important');
      photoDialog.style.setProperty('overflow-y', 'auto', 'important');
      photoDialog.style.setProperty('background', 'linear-gradient(180deg, #2a1b10 0%, #17100b 100%)', 'important');
      const dialogBeforeCenter = photoDialog.getBoundingClientRect();
      const dialogCssLeft = parseFloat(window.getComputedStyle(photoDialog).left) || 0;
      const dialogBaseLeft = dialogBeforeCenter.left - dialogCssLeft;
      const desiredDialogLeft = desiredShellLeft + Math.max(0, (shellWidth - dialogBeforeCenter.width) / 2);
      photoDialog.style.setProperty('left', `${desiredDialogLeft - dialogBaseLeft}px`, 'important');
      const repositionPhotoDialog = () => {
        if (!photoDialog.isConnected) return;
        const liveShell = Array.from(document.querySelectorAll('.tb-page')).map((node) => ({ node, rect: node.getBoundingClientRect() })).find(({ rect }) => rect.width > 0 && rect.width <= 600)?.rect;
        if (!liveShell) return;
        const liveBase = photoDialog.getBoundingClientRect();
        const liveCssLeft = parseFloat(window.getComputedStyle(photoDialog).left) || 0;
        const liveBaseLeft = liveBase.left - liveCssLeft;
        const liveDesired = liveShell.left + Math.max(0, (liveShell.width - liveBase.width) / 2);
        photoDialog.style.setProperty('left', `${liveDesired - liveBaseLeft}px`, 'important');
      };
      requestAnimationFrame(repositionPhotoDialog);
      window.setTimeout(repositionPhotoDialog, 80);
    } else if (photoOverlay) {
      photoOverlay.classList.remove('tb-photo-modal-overlay');
      photoDialog?.classList.remove('tb-photo-modal-sheet');
      // No recent avatar gesture: this is an orphaned or automatic sheet.
      photoOverlay.classList.add('tb-react-hidden-node');
      photoOverlay.setAttribute('aria-hidden', 'true');
      clearPhotoModalIsolation();
    } else {
      clearPhotoModalIsolation();
    }
    const pet = document.querySelector('[data-loc="client/src/pages/Profile.tsx:795"]');
    if (pet) {
      pet.style.setProperty('pointer-events', 'none', 'important');
      pet.querySelectorAll('*').forEach((node) => node.style.setProperty('pointer-events', 'none', 'important'));
    }
  };
  const installProfileCrewActionBridges = () => {
    // Do not intercept any Crew button or close event. Profile.tsx owns all
    // state transitions; only keep the mobile form layout correction here.
    const modal = Array.from(document.querySelectorAll('[role="dialog"], .fixed.inset-0')).find((node) => /My Crews/i.test(node.innerText || '') && /Join Crew/i.test(node.innerText || ''));
    if (!modal) return;
    const crewFormField = modal.querySelector('input[placeholder="Enter invite code"], input[placeholder="e.g. Bible Crew 2026"]');
    const crewFormPanel = crewFormField?.closest('div.p-3.rounded-xl');
    crewFormPanel?.classList.add('tb-crew-form-panel');
  };

  const normalizeOnboardingClassDropdown = () => {
    const select = document.querySelector('[data-loc="client/src/components/Onboarding.tsx:558"]');
    if (!select) return;
    const placeholder = select.querySelector('option[value=""]');
    if (placeholder) placeholder.textContent = '-- Select Class --';
    select.querySelectorAll('optgroup').forEach((group) => {
      const raw = String(group.getAttribute('label') || group.label || '').trim();
      if (!raw) return;
      const year = raw.match(/^(\d{4})\s*년생$/);
      const label = year ? `Born in ${year[1]}` : raw.replace(/\s*년생/g, '').trim();
      if (label && label !== raw) {
        group.setAttribute('label', label);
        group.label = label;
      }
    });
  };

  const getReactClickHandler = (element) => {
    if (!(element instanceof Element)) return null;
    const key = Object.keys(element).find((name) => name.startsWith('__reactProps$'));
    return key && typeof element[key]?.onClick === 'function' ? element[key].onClick : null;
  };
  const hideReactOwnedOverlay = (node) => {
    if (!(node instanceof Element)) return;
    node.classList.add('tb-react-hidden-node');
    node.setAttribute('aria-hidden', 'true');
    node.style.setProperty('pointer-events', 'none', 'important');
  };
  const findFixedOverlayAncestor = (node) => {
    let current = node instanceof Element ? node : null;
    for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
      const classes = String(current.className || '');
      if (/\bfixed\b/.test(classes) && /\binset-0\b/.test(classes)) return current;
    }
    return node?.parentElement?.parentElement || null;
  };
  const installReadingGateCloseBridge = () => {
    const closeButton = document.querySelector('[data-loc="client/src/pages/Bible.tsx:2640"]');
    if (!(closeButton instanceof HTMLButtonElement) || closeButton.dataset.tbReadingGateCloseFix === '1') return;
    closeButton.dataset.tbReadingGateCloseFix = '1';
    let lastHandledAt = 0;
    const handleClose = (event) => {
      const now = Date.now();
      if (now - lastHandledAt < 450) return;
      lastHandledAt = now;
      event.preventDefault();
      event.stopImmediatePropagation();
      const reactHandler = getReactClickHandler(closeButton);
      try { reactHandler?.({ preventDefault() {}, stopPropagation() {} }); } catch (error) { console.warn('[Teenz Bible] Reading gate close bridge:', error); }
      const overlay = findFixedOverlayAncestor(closeButton);
      window.setTimeout(() => hideReactOwnedOverlay(overlay), 380);
    };
    closeButton.addEventListener('click', handleClose, true);
    closeButton.addEventListener('touchend', handleClose, true);
  };
  const installHomeBackupDismissBridge = () => {
    const card = document.querySelector('[data-loc="client/src/pages/Home.tsx:231"].tb-home-backup-surface') || document.querySelector('.tb-home-backup-surface');
    const closeButton = card?.querySelector('[data-loc="client/src/pages/Home.tsx:257"]');
    if (!(card instanceof Element) || !(closeButton instanceof HTMLButtonElement)) return;
    if (localStorage.getItem('teenzBibleBackupCardDismissed') === 'true') hideReactOwnedOverlay(card);
    if (closeButton.dataset.tbBackupDismissFix === '1') return;
    closeButton.dataset.tbBackupDismissFix = '1';
    const dismiss = (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      localStorage.setItem('teenzBibleBackupCardDismissed', 'true');
      hideReactOwnedOverlay(card);
    };
    closeButton.addEventListener('click', dismiss, true);
    closeButton.addEventListener('touchend', dismiss, true);
  };
  const installHomeBackupCardPresentation = () => {
    const card = document.querySelector('.tb-home-backup-surface');
    if (!(card instanceof HTMLElement)) return;
    card.style.setProperty('background-color', 'rgba(43, 83, 64, .78)', 'important');
    card.style.setProperty('background-blend-mode', 'multiply', 'important');
    card.style.setProperty('border', '1px solid rgba(150, 190, 160, .42)', 'important');
    card.style.setProperty('box-shadow', '0 7px 18px rgba(0, 0, 0, .28), inset 0 1px rgba(232, 244, 225, .08)', 'important');
    const closeButton = card.querySelector('[data-loc="client/src/pages/Home.tsx:257"]');
    if (!(closeButton instanceof HTMLButtonElement)) return;
    closeButton.textContent = '×';
    closeButton.style.setProperty('width', '34px', 'important');
    closeButton.style.setProperty('height', '34px', 'important');
    closeButton.style.setProperty('min-width', '34px', 'important');
    closeButton.style.setProperty('margin', '0 -1px 0 0', 'important');
    closeButton.style.setProperty('padding', '0', 'important');
    closeButton.style.setProperty('border', '1px solid rgba(215, 234, 205, .28)', 'important');
    closeButton.style.setProperty('border-radius', '50%', 'important');
    closeButton.style.setProperty('background', 'rgba(8, 16, 13, .20)', 'important');
    closeButton.style.setProperty('box-shadow', 'none', 'important');
    closeButton.style.setProperty('color', 'rgba(220, 235, 215, .72)', 'important');
    closeButton.style.setProperty('text-shadow', 'none', 'important');
    closeButton.style.setProperty('font-family', 'Arial, sans-serif', 'important');
    closeButton.style.setProperty('font-size', '14px', 'important');
    closeButton.style.setProperty('font-weight', '400', 'important');
    closeButton.style.setProperty('line-height', '1', 'important');
  };
  const resetProgressLocalState = () => {
    const exactKeys = new Set([
      'lastReadChapter', 'lastReadBook', 'lastReadChapterIdx', 'totalXP', 'teensBible',
      'teensBibleDailyStreak', 'teensBibleBookmarks', 'teensBibleInventory', 'teensBibleEquipped',
      'teensBiblePetState', 'bibleAI_threads', 'bibleAI_activeThread', 'teensBibleOnboardingDone',
      'teensBibleFirst60State', 'teensBibleStarterGoalShown', 'teensBibleWelcomeBonusClaimed',
    ]);
    Object.keys(localStorage).filter((key) => exactKeys.has(key) || /^chaptersRead_/.test(key)).forEach((key) => localStorage.removeItem(key));
  };
  const closeProgressResetDialog = () => document.getElementById('tb-progress-reset-dialog')?.remove();
  const openProgressResetDialog = () => {
    if (document.getElementById('tb-progress-reset-dialog')) return;
    const dialog = document.createElement('div');
    dialog.id = 'tb-progress-reset-dialog';
    dialog.className = 'tb-progress-reset-dialog';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.innerHTML = '<div class="tb-progress-reset-dialog__panel"><div class="tb-progress-reset-dialog__icon" aria-hidden="true">↺</div><h2>Reset your progress?</h2><p>This clears your reading history, XP, Gems, bookmarks, items, and Bible AI threads on this device. Your sign-in and Crew membership stay safe.</p><div class="tb-progress-reset-dialog__actions"><button type="button" data-tb-reset-cancel>Cancel</button><button type="button" data-tb-reset-confirm>Reset everything</button></div><p class="tb-progress-reset-dialog__status" aria-live="polite"></p></div>';
    document.body.appendChild(dialog);
    const cancel = dialog.querySelector('[data-tb-reset-cancel]');
    const confirm = dialog.querySelector('[data-tb-reset-confirm]');
    const status = dialog.querySelector('.tb-progress-reset-dialog__status');
    cancel?.addEventListener('click', closeProgressResetDialog);
    dialog.addEventListener('click', (event) => { if (event.target === dialog) closeProgressResetDialog(); });
    confirm?.addEventListener('click', () => {
      if (confirm.disabled) return;
      confirm.disabled = true;
      confirm.textContent = 'Resetting…';
      if (status) status.textContent = 'Saving your choice…';
      const originalButton = document.querySelector('[data-loc="client/src/pages/Profile.tsx:1929"]');
      const originalHandler = getReactClickHandler(originalButton);
      try { originalHandler?.({ preventDefault() {}, stopPropagation() {} }); } catch (_) {}
      let attempts = 0;
      const finish = () => {
        resetProgressLocalState();
        closeProgressResetDialog();
        window.location.reload();
      };
      const tryOriginalConfirmation = () => {
        const resetConfirmation = [...document.querySelectorAll('button')].find((button) => /Yes, Reset Everything/i.test(button.textContent || ''));
        if (resetConfirmation) {
          const handler = getReactClickHandler(resetConfirmation);
          try { handler?.({ preventDefault() {}, stopPropagation() {} }); } catch (_) {}
          window.setTimeout(finish, 900);
          return;
        }
        attempts += 1;
        if (attempts < 8) window.setTimeout(tryOriginalConfirmation, 100);
        else finish();
      };
      tryOriginalConfirmation();
    });
  };
  const installResetProgressBridge = () => {
    if (document.documentElement.dataset.tbResetProgressBridge === '1') return;
    document.documentElement.dataset.tbResetProgressBridge = '1';
    const intercept = (event) => {
      const action = event.target instanceof Element ? event.target.closest('[data-loc="client/src/pages/Profile.tsx:1929"], [data-loc="client/src/pages/Profile.tsx:1901"]') : null;
      if (!action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openProgressResetDialog();
    };
    document.addEventListener('click', intercept, true);
    document.addEventListener('touchend', intercept, true);
  };
  let directPhotoPasses = 0;
  const directPhotoTimer = window.setInterval(() => {
    installAccountDangerActionPresentation();
    installSecureAccountDeletion();
    installResetProgressBridge();
    installReadingGateCloseBridge();
    installHomeBackupDismissBridge();
    installHomeBackupCardPresentation();
    ensureProfilePhotoNudgeGuard();
    normalizeOnboardingClassDropdown();
    installDirectProfilePhotoChooser();
    installProfileCrewActionBridges();
    directPhotoPasses += 1;
  }, 250);

  let criticalUiPasses = 0;
  const criticalUiTimer = window.setInterval(() => {
    try { installResetProgressBridge(); } catch (error) { console.warn('[Teenz Bible] Reset bridge:', error); }
    try { installReadingGateCloseBridge(); } catch (error) { console.warn('[Teenz Bible] Reading gate bridge:', error); }
    try { installHomeBackupDismissBridge(); } catch (error) { console.warn('[Teenz Bible] Backup dismiss bridge:', error); }
    try { installHomeBackupCardPresentation(); } catch (error) { console.warn('[Teenz Bible] Backup presentation bridge:', error); }
    criticalUiPasses += 1;
    if (criticalUiPasses >= 120) window.clearInterval(criticalUiTimer);
  }, 250);
  try { installHomeBackupDismissBridge(); } catch (_) {}
  try { installHomeBackupCardPresentation(); } catch (_) {}
  let deliveredUiPasses = 0;
  const deliveredUiTimer = window.setInterval(() => {
    installRankingMemberActions();
    installRankingActionPortal();
    applyCompactBibleAi();
    removeRetiredProfilePhotoPrompt();
    installStoreHorizontalSwipeGuard();
    if (deliveredUiPasses % 8 === 0) { void renderCheerInbox(); void loadBlockedUids(); }
    deliveredUiPasses += 1;
  }, 500);

  let rankingPolishPasses = 0;
  const rankingPolishTimer = window.setInterval(() => {
    installCrewPicker();
    simplifyRankingMobile();
    rankingPolishPasses += 1;
    if (rankingPolishPasses >= 45) window.clearInterval(rankingPolishTimer);
  }, 500);

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
    socialAccountConflictUi: 'english-safe-retry-modal',
    newUserExperience: 'onboarding-ai-store-crew-and-ranking-improvements',
    onboardingGuidance: 'values-first60-reflection-and-crew-context',
    popupViewportSafety: 'crew-and-ranking-member-overlays-body-anchored',
    crewComposerEntryPoint: 'ranking-create-join-opens-profile-composer',
    rankingCrewPicker: 'body-anchored-visible-selection',
    rankingMobileDensity: 'secondary-invite-collapsed',
    deliveredCheerInbox: 'authenticated-recipient-visible',
    bibleAiComposer: 'compact-mobile-fixed-bar',
    rankingCrewPicker: 'body-anchored-visible-selection',
    rankingMobileDensity: 'secondary-invite-collapsed',
  };

  // Theme visual bridges were retired with the Theme feature in 1.1.172.

  // Preload the Store module after the main core has fully evaluated.
  // Store imports shared exports from the core; preloading after window load avoids
  // the first-navigation circular-initialization race seen on slower mobile Chrome.
  const preloadStoreModule = () => {
    if (window.__TEENZ_STORE_PREFETCH__) return window.__TEENZ_STORE_PREFETCH__;
    window.__TEENZ_STORE_PREFETCH__ = import('/assets/Store-GemFix1184.js')
      .then(() => true)
      .catch((error) => {
        console.warn('[Teenz Bible] Store preload deferred:', error);
        return false;
      });
    return window.__TEENZ_STORE_PREFETCH__;
  };
  if (document.readyState === 'complete') {
    window.setTimeout(preloadStoreModule, 250);
  } else {
    window.addEventListener('load', () => window.setTimeout(preloadStoreModule, 250), { once: true });
  }
  document.addEventListener('pointerdown', (event) => {
    const target = event.target instanceof Element ? event.target.closest('button') : null;
    if (target?.textContent?.trim() === 'Store') void preloadStoreModule();
  }, true);

  // Firebase-hosted manual OTA bridge. The native shell intentionally uses autoUpdate=off,
  // so this bridge checks our public manifest, downloads a verified bundle, and queues
  // it for the next app restart. It is a no-op in the ordinary browser PWA.
  const FIREBASE_OTA_MANIFEST = 'https://teens-bible-94271.web.app/ota/latest.json';
  const checkFirebaseNativeUpdate = async () => {
    if (!isNativePlatform()) return;
    const updater = window.Capacitor?.Plugins?.CapacitorUpdater;
    if (!updater || !originalFetch) return;
    try {
      await updater.notifyAppReady?.();
      const response = await originalFetch(FIREBASE_OTA_MANIFEST, { cache: 'no-store' });
      if (!response.ok) return;
      const manifest = await response.json();
      const version = String(manifest?.version || '');
      const url = String(manifest?.url || '');
      if (!version || !url) return;
      const current = await updater.current?.();
      const activeVersion = String(current?.bundle?.version || '');
      if (activeVersion === version) return;
      const bundle = await updater.download({
        url,
        version,
        checksum: manifest?.checksum || undefined,
      });
      if (bundle?.id) await updater.next({ id: bundle.id });
    } catch (error) {
      console.warn('[Teenz Bible] Firebase OTA check skipped:', error);
    }
  };
  if (originalFetch) void checkFirebaseNativeUpdate();
})();

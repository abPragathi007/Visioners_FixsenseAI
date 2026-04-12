/* ═══════════════════════════════════════════════════════════
   APP BOOTSTRAP — Bike Health AI
   Main entry point — initializes everything
   ═══════════════════════════════════════════════════════════ */

function getNavTabForScreen(screenId) {
  const map = {
    home: 'home',
    diagnose: 'diagnose',
    loading: 'diagnose',
    results: 'diagnose',
    history: 'history',
    tips: 'tips',
    profile: 'profile',
    'add-vehicle': 'home',
    splash: null,
  };
  return map[screenId] !== undefined ? map[screenId] : 'home';
}

function isOverlayScreenOpen() {
  return ['screen-emergency', 'screen-fleet', 'screen-pretrip'].some(id => {
    const el = document.getElementById(id);
    return el && el.classList.contains('active');
  });
}

function shouldShowMainNav() {
  if (State.currentScreen === 'splash') return false;
  if (isOverlayScreenOpen()) return false;
  return true;
}

function handleNavAction(tabId) {
  // Stop ESP32 live timer when leaving the home screen
  if (State.currentScreen === 'home' && tabId !== 'home') {
    if (typeof esp32StopLive === 'function') esp32StopLive();
  }
  switch (tabId) {
    case 'home':
      navigateTo('home', 'left');
      renderHomeScreen();
      break;
    case 'diagnose':
      startDiagnose(null);
      break;
    case 'history':
      navigateTo('history', 'right');
      renderHistoryScreen();
      break;
    case 'tips':
      navigateTo('tips', 'right');
      renderTipsScreen();
      break;
    case 'profile':
      navigateTo('profile', 'right');
      renderProfileScreen();
      break;
    default:
      break;
  }
}

function buildNavButtonsHtml(activeTab) {
  const items = [
    { id: 'home', icon: Icons.home, label: t('navHome') },
    { id: 'diagnose', icon: Icons.diagnose, label: t('navDiagnose') },
    { id: 'history', icon: Icons.history, label: t('navHistory') },
    { id: 'tips', icon: Icons.tips, label: t('navTips') },
    { id: 'profile', icon: Icons.profile, label: t('navProfile') },
  ];
  return items.map(item => `
    <button type="button" class="nav-item ${item.id === activeTab ? 'active' : ''}"
      data-nav-tab="${item.id}"
      aria-label="${item.label}"
      aria-current="${item.id === activeTab ? 'page' : 'false'}">
      ${item.icon}
      <span>${item.label}</span>
    </button>
  `).join('');
}

function syncBottomNav() {
  const bottom = document.getElementById('app-bottom-nav');
  const top = document.getElementById('app-top-nav');
  const show = shouldShowMainNav();
  const activeTab = getNavTabForScreen(State.currentScreen) || 'home';

  if (bottom) {
    bottom.style.display = show ? 'flex' : 'none';
    bottom.innerHTML = buildNavButtonsHtml(activeTab);
    bottom.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  if (top) {
    top.style.display = show ? 'flex' : 'none';
    top.innerHTML = `
      <div class="topnav-brand">🛡️ RideRaksha</div>
      <div class="topnav-controls">
        <button type="button" class="topnav-icon-btn" onclick="topnavToggleTheme()" title="${State.darkMode ? 'Switch to Light' : 'Switch to Dark'}">
          ${State.darkMode ? '☀️' : '🌙'}
        </button>
        <button type="button" class="topnav-icon-btn topnav-lang-btn" onclick="topnavCycleLang()" title="Change language">
          ${State.language === 'en' ? '🇬🇧 EN' : State.language === 'hi' ? '🇮🇳 HI' : '🇮🇳 KN'}
        </button>
      </div>
      <div class="topnav-tabs">
        ${['home', 'diagnose', 'history', 'tips', 'profile'].map(id => `
          <button type="button" class="topnav-tab ${id === activeTab ? 'active' : ''}" data-nav-tab="${id}">
            ${id === 'home' ? t('navHome') : id === 'diagnose' ? t('navDiagnose') : id === 'history' ? t('navHistory') : id === 'tips' ? t('navTips') : t('navProfile')}
          </button>
        `).join('')}
      </div>
    `;
    top.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  document.body.classList.toggle('nav-main-visible', show);
}

window.syncBottomNav = syncBottomNav;

/* ── Top-nav quick controls ── */
function topnavToggleTheme() {
  State.darkMode = !State.darkMode;
  applyThemeToDocument();
  saveState();
  syncBottomNav();          // re-render icon
  refreshCurrentScreen();   // re-render active screen (profile toggle stays in sync)
}

function topnavCycleLang() {
  const order = ['en', 'hi', 'kn'];
  const next = order[(order.indexOf(State.language) + 1) % order.length];
  State.language = next;
  saveState();
  applyDocumentLocale();
  syncBottomNav();
  refreshCurrentScreen();
  showToast(t('languageUpdated'));
}

function topnavShowLangMenu() {
  showLanguageModal();
}

function mountGlobalNav() {
  const bottom = document.getElementById('app-bottom-nav');
  const top    = document.getElementById('app-top-nav');

  // Use a single permanent listener on the static containers.
  // Works even after syncBottomNav rebuilds innerHTML.
  [bottom, top].forEach(root => {
    if (!root || root.dataset.navBound) return;
    root.dataset.navBound = '1';
    root.addEventListener('click', e => {
      const btn = e.target.closest('[data-nav-tab]');
      if (!btn) return;
      e.preventDefault();
      e.stopPropagation();
      handleNavAction(btn.getAttribute('data-nav-tab'));
    });
  });
}

function refreshCurrentScreen() {
  switch (State.currentScreen) {
    case 'home': renderHomeScreen(); break;
    case 'diagnose': renderDiagnoseScreen(); break;
    case 'loading': renderLoadingScreen(); break;
    case 'results': renderResultsScreen(); break;
    case 'history': renderHistoryScreen(); break;
    case 'tips': renderTipsScreen(); break;
    case 'profile': renderProfileScreen(); break;
    case 'add-vehicle': renderAddVehicleScreen(); break;
    case 'splash': renderSplashScreen(); break;
    default: break;
  }
  if (typeof window.refreshAiChatLabels === 'function') window.refreshAiChatLabels();
}

function setDarkModeFromUi(checked) {
  State.darkMode = !!checked;
  applyThemeToDocument();
  saveState();
  renderProfileScreen();
}

// ── App Initialization ──
function initApp() {
  const hadSaved = !!localStorage.getItem('bikeHealthAI');
  loadState();
  applyThemeToDocument();
  applyDocumentLocale();

  initSeedData();
  if (!hadSaved && State.vehicles.length) saveState();

  mountGlobalNav();

  const hasSeenOnboarding = State.vehicles.length > 0 || State.language !== 'en';

  if (hasSeenOnboarding) {
    document.getElementById('screen-splash').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    State.currentScreen = 'home';
    renderHomeScreen();
  } else {
    renderSplashScreen();
  }

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then((registration) => {
      registration.update();

      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      let refreshed = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshed) return;
        refreshed = true;
        window.location.reload();
      });
    }).catch(() => {
      // Service worker not critical
    });
  }

  syncBottomNav();

  if (typeof window.initAiChat === 'function') window.initAiChat();
}

// ── Keyboard Navigation ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (document.getElementById('screen-emergency')?.classList.contains('active')) {
      if (typeof hideEmergency === 'function') hideEmergency();
      else document.getElementById('screen-emergency').classList.remove('active');
    }
    document.getElementById('screen-pretrip')?.classList.remove('active');
    document.getElementById('screen-fleet')?.classList.remove('active');
    document.getElementById('api-key-modal')?.remove();
    document.getElementById('lang-modal')?.remove();
    document.getElementById('add-vehicle-modal')?.remove();
    document.getElementById('ai-chat-panel')?.classList.remove('open');
    syncBottomNav();
  }
});

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', initApp);

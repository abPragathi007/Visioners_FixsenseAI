/* ═══════════════════════════════════════════════════════════
   APP BOOTSTRAP — Bike Health AI
   Main entry point — initializes everything
   ═══════════════════════════════════════════════════════════ */

// ── Bottom Nav Renderer (shared across screens) ──
function renderBottomNav(active) {
  const isHi = State.language === 'hi';
  const navItems = [
    { id: 'home',    icon: Icons.home,     label: isHi ? 'होम' : 'Home',     action: 'navigateTo("home","left"); renderHomeScreen();' },
    { id: 'diagnose',icon: Icons.diagnose, label: isHi ? 'जांचें' : 'Diagnose', action: 'startDiagnose(null)' },
    { id: 'history', icon: Icons.history,  label: isHi ? 'इतिहास' : 'History',  action: 'navigateTo("history","right"); renderHistoryScreen();' },
    { id: 'tips',    icon: Icons.tips,     label: isHi ? 'सुझाव' : 'Tips',      action: 'navigateTo("tips","right"); renderTipsScreen();' },
    { id: 'profile', icon: Icons.profile,  label: isHi ? 'प्रोफ़ाइल' : 'Profile', action: 'navigateTo("profile","right"); renderProfileScreen();' },
  ];

  return `
    <nav class="bottom-nav" role="navigation" aria-label="Main navigation">
      ${navItems.map(item => `
        <button class="nav-item ${item.id === active ? 'active' : ''}"
          onclick="${item.action}"
          aria-label="${item.label}"
          id="nav-${item.id}">
          ${item.icon}
          <span>${item.label}</span>
        </button>
      `).join('')}
    </nav>
  `;
}

// ── App Initialization ──
function initApp() {
  // Load persisted state
  loadState();

  // Initialize seed data if first run
  initSeedData();

  // Determine starting screen
  const hasSeenOnboarding = State.vehicles.length > 0 || State.language !== 'en';

  if (hasSeenOnboarding) {
    // Skip splash, go to home
    document.getElementById('screen-splash').classList.remove('active');
    document.getElementById('screen-home').classList.add('active');
    State.currentScreen = 'home';
    renderHomeScreen();
  } else {
    // Show onboarding
    renderSplashScreen();
  }

  // Register service worker for offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Service worker not critical
    });
  }
}

// ── Keyboard Navigation ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // Close any overlays
    document.getElementById('screen-emergency')?.classList.remove('active');
    document.getElementById('screen-pretrip')?.classList.remove('active');
    document.getElementById('screen-fleet')?.classList.remove('active');
    document.getElementById('api-key-modal')?.remove();
    document.getElementById('lang-modal')?.remove();
  }
});

// ── Prevent scroll bounce on mobile ──
document.addEventListener('touchmove', (e) => {
  if (e.target === document.body) e.preventDefault();
}, { passive: false });

// ── Bootstrap ──
document.addEventListener('DOMContentLoaded', initApp);

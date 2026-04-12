/**
 * Preservation Property Tests — Task 2
 *
 * Property 2: Preservation — Non-Buggy Back Navigation Is Unchanged
 *
 * These tests MUST PASS on unfixed code.
 * They establish the baseline behavior that the fix must not break:
 * when navHistoryTop is NOT 'diagnose', back navigation works correctly.
 *
 * Validates: Requirements 3.1, 3.2, 3.4, 3.5
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildDOM() {
  return new JSDOM(`<!DOCTYPE html>
<html>
<body>
  <div id="screen-home"></div>
  <div id="screen-diagnose"></div>
  <div id="screen-history"></div>
  <div id="screen-profile"></div>
  <div id="screen-tips"></div>
  <div id="app-bottom-nav"></div>
  <div id="app-top-nav"></div>
</body>
</html>`, { runScripts: 'dangerously', url: 'http://localhost/' });
}

function evalInWindow(win, filePath) {
  const code = readFileSync(resolve(process.cwd(), filePath), 'utf8');
  win.eval(code);
}

function bootstrapGlobals(win) {
  win.eval(`
    window.State = {
      currentScreen: 'home',
      navHistory: [],
      language: 'en',
      darkMode: true,
      mechanicMode: false,
      streak: 0,
      lastCheckDate: null,
      vehicles: [],
      selectedVehicle: null,
      diagnoseInputs: {
        vehicleId: null,
        engineTemp: 85,
        oilLevel: 60,
        batteryVolt: 12.6,
        kmSinceService: 1500,
        cngPressure: 160,
        symptoms: '',
        idontknow: {},
      },
      results: null,
      diagnoseHistory: [],
      claudeApiKey: '',
      editingVehicle: null,
    };

    window.I18N = { en: {}, hi: {}, kn: {} };
    window.TRANSLATIONS = {};
    window.t = function(key) { return key; };
    window.tr = function(en) { return en; };
    window.escapeHtml = function(s) { return String(s || ''); };

    window.Icons = {
      back: '<svg></svg>',
      home: '<svg></svg>',
      diagnose: '<svg></svg>',
      history: '<svg></svg>',
      tips: '<svg></svg>',
      profile: '<svg></svg>',
      mic: '<svg></svg>',
      share: '<svg></svg>',
      map: '<svg></svg>',
      arrow: '<svg></svg>',
    };

    window.TIPS_ARTICLES = [];
    window.TIPS_CATEGORIES = ['All'];
    window.SYMPTOM_TAGS = [];
    window.THRESHOLDS = {
      engineTemp: { normal: 95, warning: 105 },
      oilLevel: { normal: 40, critical: 25 },
      battery: { normal: 12.4, critical: 12.0 },
      kmService: { oil: 3000, fuelFilter: 5000 },
      cngPressure: { normal: 150, critical: 120 },
    };

    window.saveState = function() {};
    window.loadState = function() {};
    window.applyThemeToDocument = function() {};
    window.applyDocumentLocale = function() {};
    window.syncBottomNav = function() {};
    window.showToast = function() {};
    window.initSeedData = function() {};
    window.initApp = function() {};
    window.esp32StopLive = function() {};
    window.startDiagnose = function() {};
    window.refreshAiChatLabels = function() {};

    // Real render stubs for screens we need to observe
    window.renderHomeScreen = function() {
      var el = document.getElementById('screen-home');
      if (el) el.innerHTML = '<div class="home-content">Home Screen Content</div>';
    };
    window.renderHistoryScreen = function() {
      var el = document.getElementById('screen-history');
      if (el) el.innerHTML = '<div class="history-content">History Screen Content</div>';
    };
    window.renderLoadingScreen = function() {};
    window.renderResultsScreen = function() {};
    window.renderAddVehicleScreen = function() {};
    window.renderSplashScreen = function() {};

    window.goBack = function() {
      if (State.navHistory.length === 0) return;
      var prev = State.navHistory.pop();
      var current = document.getElementById('screen-' + State.currentScreen);
      var prevScreen = document.getElementById('screen-' + prev);
      if (current) current.classList.remove('active');
      if (prevScreen) {
        prevScreen.classList.add('active');
      }
      State.currentScreen = prev;
      if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
    };

    window.refreshCurrentScreen = function() {
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
    };

    window.navigateTo = function(screenId) {
      var current = document.getElementById('screen-' + State.currentScreen);
      var next = document.getElementById('screen-' + screenId);
      if (!next) return;
      if (current) current.classList.remove('active');
      next.classList.add('active');
      State.navHistory.push(State.currentScreen);
      State.currentScreen = screenId;
    };
  `);

  evalInWindow(win, 'js/screens/diagnose.js');
  evalInWindow(win, 'js/screens/profile.js');
  evalInWindow(win, 'js/screens/tips.js');
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('Preservation — non-buggy back navigation is unchanged on unfixed code', () => {
  let win;
  let doc;

  beforeEach(() => {
    const dom = buildDOM();
    win = dom.window;
    doc = win.document;

    bootstrapGlobals(win);

    win.State.navHistory = [];
    win.State.currentScreen = 'home';
    win.State.language = 'en';
    win.State.vehicles = [];
    win.State.diagnoseInputs = {
      vehicleId: null,
      engineTemp: 85,
      oilLevel: 60,
      batteryVolt: 12.6,
      kmSinceService: 1500,
      cngPressure: 160,
      symptoms: '',
      idontknow: {},
    };

    doc.getElementById('screen-home').classList.add('active');
  });

  /**
   * Preservation Case 1
   *
   * Back from Profile with navHistoryTop = 'home'
   * → #screen-home is active and contains Home content
   *
   * This is the normal happy path. On unfixed code the back button calls
   * `goBack(); renderHomeScreen();` — goBack() activates #screen-home and
   * renderHomeScreen() writes Home content into it. Both steps agree, so
   * this works correctly on unfixed code and must continue to work after fix.
   */
  it('back from Profile with navHistoryTop="home" → #screen-home is active with Home content', () => {
    // Arrange
    win.State.navHistory = ['home'];
    win.State.currentScreen = 'profile';
    doc.getElementById('screen-home').classList.remove('active');
    doc.getElementById('screen-profile').classList.add('active');
    win.renderProfileScreen();

    // Act: click back button
    const backBtn = doc.querySelector('#screen-profile .back-btn');
    expect(backBtn, 'back button should exist in profile screen').toBeTruthy();
    backBtn.click();

    // Assert: #screen-home is active
    const homeEl = doc.getElementById('screen-home');
    expect(
      homeEl.classList.contains('active'),
      `Expected #screen-home to be active. State.currentScreen = "${win.State.currentScreen}"`
    ).toBe(true);

    // Assert: #screen-home contains Home content
    expect(
      homeEl.innerHTML.includes('home-content') || homeEl.innerHTML.includes('Home Screen'),
      `Expected #screen-home to contain Home content.\nActual innerHTML: "${homeEl.innerHTML.substring(0, 200)}"`
    ).toBe(true);

    // Assert: #screen-profile is NOT active
    expect(
      doc.getElementById('screen-profile').classList.contains('active'),
      'Expected #screen-profile to NOT be active after back press'
    ).toBe(false);
  });

  /**
   * Preservation Case 2
   *
   * Back from Tips with navHistoryTop = 'home'
   * → #screen-home is active and contains Home content
   *
   * Same as Case 1 but from Tips. On unfixed code `goBack(); renderHomeScreen();`
   * both agree on home, so this works correctly and must be preserved.
   */
  it('back from Tips with navHistoryTop="home" → #screen-home is active with Home content', () => {
    // Arrange
    win.State.navHistory = ['home'];
    win.State.currentScreen = 'tips';
    doc.getElementById('screen-home').classList.remove('active');
    doc.getElementById('screen-tips').classList.add('active');
    win.renderTipsScreen();

    // Act: click back button
    const backBtn = doc.querySelector('#screen-tips .back-btn');
    expect(backBtn, 'back button should exist in tips screen').toBeTruthy();
    backBtn.click();

    // Assert: #screen-home is active
    const homeEl = doc.getElementById('screen-home');
    expect(
      homeEl.classList.contains('active'),
      `Expected #screen-home to be active. State.currentScreen = "${win.State.currentScreen}"`
    ).toBe(true);

    // Assert: #screen-home contains Home content
    expect(
      homeEl.innerHTML.includes('home-content') || homeEl.innerHTML.includes('Home Screen'),
      `Expected #screen-home to contain Home content.\nActual innerHTML: "${homeEl.innerHTML.substring(0, 200)}"`
    ).toBe(true);

    // Assert: #screen-tips is NOT active
    expect(
      doc.getElementById('screen-tips').classList.contains('active'),
      'Expected #screen-tips to NOT be active after back press'
    ).toBe(false);
  });

  /**
   * Preservation Case 3
   *
   * Back from Profile with navHistoryTop = 'history'
   * → #screen-history is active
   *
   * On unfixed code: goBack() activates #screen-history (correct), then
   * renderHomeScreen() writes into #screen-home (wrong screen, but #screen-history
   * is still active). The activation is correct even on unfixed code because
   * goBack() handles it. The only issue on unfixed code is that #screen-home
   * gets re-rendered unnecessarily — but #screen-history is still active.
   * This test verifies the activation is correct.
   */
  it('back from Profile with navHistoryTop="history" → #screen-history is active', () => {
    // Arrange
    win.State.navHistory = ['history'];
    win.State.currentScreen = 'profile';
    doc.getElementById('screen-home').classList.remove('active');
    doc.getElementById('screen-history').classList.add('active');
    doc.getElementById('screen-profile').classList.add('active');
    // Simulate arriving at profile from history
    doc.getElementById('screen-history').classList.remove('active');
    win.renderProfileScreen();

    // Act: click back button
    const backBtn = doc.querySelector('#screen-profile .back-btn');
    expect(backBtn, 'back button should exist in profile screen').toBeTruthy();
    backBtn.click();

    // Assert: #screen-history is active
    const historyEl = doc.getElementById('screen-history');
    expect(
      historyEl.classList.contains('active'),
      `Expected #screen-history to be active. State.currentScreen = "${win.State.currentScreen}"`
    ).toBe(true);

    // Assert: #screen-profile is NOT active
    expect(
      doc.getElementById('screen-profile').classList.contains('active'),
      'Expected #screen-profile to NOT be active after back press'
    ).toBe(false);
  });

  /**
   * Preservation Case 4
   *
   * Back press with empty navHistory → no crash, no screen change
   *
   * goBack() returns early when navHistory is empty. The current screen
   * stays active. This must not throw and must not change any screen state.
   */
  it('back press with empty navHistory → no crash, no screen change', () => {
    // Arrange: profile is current screen, history is empty
    win.State.navHistory = [];
    win.State.currentScreen = 'profile';
    doc.getElementById('screen-home').classList.remove('active');
    doc.getElementById('screen-profile').classList.add('active');
    win.renderProfileScreen();

    const backBtn = doc.querySelector('#screen-profile .back-btn');
    expect(backBtn, 'back button should exist in profile screen').toBeTruthy();

    // Act: click back — should not throw
    expect(() => backBtn.click()).not.toThrow();

    // Assert: State.currentScreen is unchanged (goBack() returned early)
    // On unfixed code: goBack() returns early (navHistory empty), then
    // renderHomeScreen() writes into #screen-home. #screen-profile stays active
    // because goBack() did nothing. currentScreen stays 'profile'.
    expect(
      win.State.currentScreen,
      'State.currentScreen should remain "profile" when navHistory is empty'
    ).toBe('profile');

    // Assert: #screen-profile is still active
    expect(
      doc.getElementById('screen-profile').classList.contains('active'),
      'Expected #screen-profile to remain active when navHistory is empty'
    ).toBe(true);
  });
});

/**
 * Bug Condition Exploration Tests — Task 1
 *
 * These tests MUST FAIL on unfixed code.
 * Failure confirms the bug exists: back-button in Profile/Tips
 * activates #screen-diagnose but renders Home content instead of
 * re-rendering the Diagnose form.
 *
 * Validates: Requirements 1.3, 1.4, 2.3, 2.4
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
  // 1. Set up all stubs and globals FIRST (before any source files)
  win.eval(`
    // State must be on window so all source files share the same reference
    window.State = {
      currentScreen: 'home',
      navHistory: [],
      language: 'en',
      darkMode: true,
      mechanicMode: false,
      streak: 0,
      lastCheckDate: null,
      vehicles: [{ id: 'v1', type: 'bike', emoji: '🏍️', nickname: 'My Splendor', number: 'KA-01-MM-1234', image: null, brand: 'Hero', model: 'Splendor Plus', year: 2021, cc: 100, lastService: '2026-01-10', odometer: 18500, lastDiagnosis: null }],
      selectedVehicle: null,
      diagnoseInputs: {
        vehicleId: 'v1',
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

    // i18n stub
    window.I18N = { en: {}, hi: {}, kn: {} };
    window.TRANSLATIONS = {};
    window.t = function(key) { return key; };
    window.tr = function(en) { return en; };
    window.escapeHtml = function(s) { return String(s || ''); };

    // Icons stub
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

    // Data stubs
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

    // Function stubs
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

    // Screen render stubs (only the ones we don't load)
    window.renderHomeScreen = function() {
      var el = document.getElementById('screen-home');
      if (el) el.innerHTML = '<div class="home-content">Home Screen</div>';
    };
    window.renderHistoryScreen = function() {};
    window.renderLoadingScreen = function() {};
    window.renderResultsScreen = function() {};
    window.renderAddVehicleScreen = function() {};
    window.renderSplashScreen = function() {};

    // goBack — copied from state.js logic, operates on window.State
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

    // refreshCurrentScreen — copied from app.js logic
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

    // navigateTo stub
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

  // 2. Load only the screen files we need (they reference window globals)
  evalInWindow(win, 'js/screens/diagnose.js');
  evalInWindow(win, 'js/screens/profile.js');
  evalInWindow(win, 'js/screens/tips.js');
}

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('Bug Condition Exploration — back from Profile/Tips when navHistory top is diagnose', () => {
  let win;
  let doc;

  beforeEach(() => {
    const dom = buildDOM();
    win = dom.window;
    doc = win.document;

    bootstrapGlobals(win);

    // Reset State to a clean baseline
    win.State.navHistory = [];
    win.State.currentScreen = 'home';
    win.State.language = 'en';
    win.State.vehicles = [{ id: 'v1', type: 'bike', emoji: '🏍️', nickname: 'My Splendor', number: 'KA-01', image: null, brand: 'Hero', model: 'Splendor Plus', year: 2021, cc: 100, lastService: '2026-01-10', odometer: 18500, lastDiagnosis: null }];
    win.State.diagnoseInputs = {
      vehicleId: 'v1',
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
   * Test Case A
   *
   * Scenario: user was on Diagnose, navigated to Profile via bottom nav,
   * then presses the back button.
   *
   * On UNFIXED code this FAILS because:
   *   The back button onclick is `goBack(); renderHomeScreen();`
   *   goBack() activates #screen-diagnose (correct), but renderHomeScreen()
   *   writes into #screen-home — leaving #screen-diagnose visible with stale
   *   HTML from the prior renderProfileScreen() call, never re-rendering
   *   the Diagnose form.
   *
   * Counterexample: #screen-diagnose is .active but its innerHTML contains
   * Profile settings HTML (profile-hero, setting-group, etc.) NOT Diagnose
   * form HTML.
   */
  it('Test Case A: back from Profile with navHistory=["diagnose"] should show Diagnose form in #screen-diagnose', () => {
    // Arrange: simulate arriving at Profile from Diagnose via bottom nav.
    // NOTE: We do NOT pre-render #screen-diagnose — it starts empty.
    // On UNFIXED code: goBack() activates #screen-diagnose, then renderHomeScreen()
    // writes into #screen-home. #screen-diagnose remains empty (no Diagnose form).
    // On FIXED code: goBack() activates #screen-diagnose, then refreshCurrentScreen()
    // calls renderDiagnoseScreen() which writes Diagnose form into #screen-diagnose.
    win.State.navHistory = ['diagnose'];
    win.State.currentScreen = 'profile';
    doc.getElementById('screen-home').classList.remove('active');
    doc.getElementById('screen-profile').classList.add('active');
    win.renderProfileScreen();

    // Act: click the back button in the profile screen
    const backBtn = doc.querySelector('#screen-profile .back-btn');
    expect(backBtn, 'back button should exist in profile screen').toBeTruthy();
    backBtn.click();

    // Assert: #screen-diagnose should be active
    const diagnoseEl = doc.getElementById('screen-diagnose');
    expect(
      diagnoseEl.classList.contains('active'),
      `Expected #screen-diagnose to have class 'active' after back press. ` +
      `State.currentScreen = "${win.State.currentScreen}"`
    ).toBe(true);

    // Assert: #screen-diagnose should contain Diagnose form markup
    const diagnoseHTML = diagnoseEl.innerHTML;
    const hasDiagnoseContent =
      diagnoseHTML.includes('screen-diag-wrap') ||
      diagnoseHTML.includes('slider-engineTemp') ||
      diagnoseHTML.includes('Diagnose Vehicle') ||
      diagnoseHTML.includes('diagnose-cta-wrapper') ||
      diagnoseHTML.includes('startAiDiagnosis') ||
      diagnoseHTML.includes('diag-start-btn') ||
      diagnoseHTML.includes('Start AI Diagnosis') ||
      diagnoseHTML.includes('AI Diagnosis');

    expect(
      hasDiagnoseContent,
      `Expected #screen-diagnose to contain Diagnose form HTML after back press.\n` +
      `Actual innerHTML (first 400 chars): "${diagnoseHTML.substring(0, 400)}"\n` +
      `COUNTEREXAMPLE: #screen-diagnose is .active but does NOT contain Diagnose form markup — confirms the bug.`
    ).toBe(true);

    // Assert: #screen-diagnose should NOT contain Profile HTML
    const hasProfileContent =
      diagnoseHTML.includes('profile-hero') ||
      diagnoseHTML.includes('setting-group') ||
      diagnoseHTML.includes('profile-content');

    expect(
      hasProfileContent,
      `Expected #screen-diagnose NOT to contain Profile HTML.\n` +
      `COUNTEREXAMPLE: Profile HTML leaked into #screen-diagnose — confirms the bug.`
    ).toBe(false);
  });

  /**
   * Test Case B
   *
   * Scenario: user was on Diagnose, navigated to Tips via bottom nav,
   * then presses the back button.
   *
   * On UNFIXED code this FAILS for the same reason as Test Case A.
   *
   * Counterexample: #screen-diagnose is .active but its innerHTML contains
   * Tips HTML (tips-hero, category-pills, etc.) NOT Diagnose form HTML.
   */
  it('Test Case B: back from Tips with navHistory=["diagnose"] should show Diagnose form in #screen-diagnose', () => {
    // Arrange: simulate arriving at Tips from Diagnose via bottom nav.
    // NOTE: We do NOT pre-render #screen-diagnose — it starts empty.
    // On UNFIXED code: goBack() activates #screen-diagnose, then renderHomeScreen()
    // writes into #screen-home. #screen-diagnose remains empty (no Diagnose form).
    // On FIXED code: goBack() activates #screen-diagnose, then refreshCurrentScreen()
    // calls renderDiagnoseScreen() which writes Diagnose form into #screen-diagnose.
    win.State.navHistory = ['diagnose'];
    win.State.currentScreen = 'tips';
    doc.getElementById('screen-home').classList.remove('active');
    doc.getElementById('screen-tips').classList.add('active');
    win.renderTipsScreen();

    // Act: click the back button in the tips screen
    const backBtn = doc.querySelector('#screen-tips .back-btn');
    expect(backBtn, 'back button should exist in tips screen').toBeTruthy();
    backBtn.click();

    // Assert: #screen-diagnose should be active
    const diagnoseEl = doc.getElementById('screen-diagnose');
    expect(
      diagnoseEl.classList.contains('active'),
      `Expected #screen-diagnose to have class 'active' after back press. ` +
      `State.currentScreen = "${win.State.currentScreen}"`
    ).toBe(true);

    // Assert: #screen-diagnose should contain Diagnose form markup
    const diagnoseHTML = diagnoseEl.innerHTML;
    const hasDiagnoseContent =
      diagnoseHTML.includes('screen-diag-wrap') ||
      diagnoseHTML.includes('slider-engineTemp') ||
      diagnoseHTML.includes('Diagnose Vehicle') ||
      diagnoseHTML.includes('diagnose-cta-wrapper') ||
      diagnoseHTML.includes('startAiDiagnosis') ||
      diagnoseHTML.includes('diag-start-btn') ||
      diagnoseHTML.includes('Start AI Diagnosis') ||
      diagnoseHTML.includes('AI Diagnosis');

    expect(
      hasDiagnoseContent,
      `Expected #screen-diagnose to contain Diagnose form HTML after back press.\n` +
      `Actual innerHTML (first 400 chars): "${diagnoseHTML.substring(0, 400)}"\n` +
      `COUNTEREXAMPLE: #screen-diagnose is .active but does NOT contain Diagnose form markup — confirms the bug.`
    ).toBe(true);

    // Assert: #screen-diagnose should NOT contain Tips HTML
    const hasTipsContent =
      diagnoseHTML.includes('tips-hero') ||
      diagnoseHTML.includes('category-pills') ||
      diagnoseHTML.includes('tips-content');

    expect(
      hasTipsContent,
      `Expected #screen-diagnose NOT to contain Tips HTML.\n` +
      `COUNTEREXAMPLE: Tips HTML leaked into #screen-diagnose — confirms the bug.`
    ).toBe(false);
  });
});

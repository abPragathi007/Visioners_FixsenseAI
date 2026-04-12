/* ═══════════════════════════════════════════════════════════
   STATE MANAGEMENT — Bike Health AI
   ═══════════════════════════════════════════════════════════ */
const State = {
  // Current navigation
  currentScreen: 'splash',
  navHistory: [],

  // User preferences
  language: 'en',
  darkMode: true,
  mechanicMode: false, // false = plain language, true = technical

  // Streak
  streak: 3,
  lastCheckDate: null,

  // Vehicles
  vehicles: [],
  selectedVehicle: null,

  // Diagnose session
  diagnoseInputs: {
    vehicleId: null,
    engineTemp: 85,
    oilLevel: 60,
    batteryVolt: 12.6,
    kmSinceService: 1500,
    cngPressure: 160,
    symptoms: '',
    idontknow: { temp: false, oil: false, battery: false, km: false },
  },

  // AI Results
  results: null,

  // History
  diagnoseHistory: [],

  // API Key
  claudeApiKey: '',

  // Vehicle being edited
  editingVehicle: null,
};

// ── Persistence ──
function saveState() {
  const persist = {
    language: State.language,
    vehicles: State.vehicles,
    diagnoseHistory: State.diagnoseHistory,
    claudeApiKey: State.claudeApiKey,
    streak: State.streak,
    lastCheckDate: State.lastCheckDate,
    mechanicMode: State.mechanicMode,
  };
  localStorage.setItem('bikeHealthAI', JSON.stringify(persist));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem('bikeHealthAI') || '{}');
    if (saved.language) State.language = saved.language;
    if (saved.vehicles) State.vehicles = saved.vehicles;
    if (saved.diagnoseHistory) State.diagnoseHistory = saved.diagnoseHistory;
    if (saved.claudeApiKey) State.claudeApiKey = saved.claudeApiKey;
    if (saved.streak != null) State.streak = saved.streak;
    if (saved.lastCheckDate) State.lastCheckDate = saved.lastCheckDate;
    if (saved.mechanicMode != null) State.mechanicMode = saved.mechanicMode;
  } catch(e) { console.warn('Could not load state', e); }
}

// ── Navigation ──
function navigateTo(screenId, direction = 'right') {
  const current = document.getElementById(`screen-${State.currentScreen}`);
  const next = document.getElementById(`screen-${screenId}`);

  if (!next) return;

  // Hide current
  if (current) {
    current.classList.remove('active');
  }

  // Show next
  next.classList.add('active');
  next.classList.remove('slide-in-right', 'slide-in-left', 'fade-in', 'slide-up');

  // Animate based on direction
  void next.offsetWidth; // force reflow
  if (direction === 'right') next.classList.add('slide-in-right');
  else if (direction === 'left') next.classList.add('slide-in-left');
  else if (direction === 'up') next.classList.add('slide-up');
  else next.classList.add('fade-in');

  State.navHistory.push(State.currentScreen);
  State.currentScreen = screenId;

  // Scroll to top
  next.scrollTop = 0;
}

function goBack() {
  if (State.navHistory.length === 0) return;
  const prev = State.navHistory.pop();
  const current = document.getElementById(`screen-${State.currentScreen}`);
  const prevScreen = document.getElementById(`screen-${prev}`);

  if (current) current.classList.remove('active');
  if (prevScreen) {
    prevScreen.classList.add('active');
    prevScreen.classList.remove('slide-in-right', 'slide-in-left', 'fade-in', 'slide-up');
    void prevScreen.offsetWidth;
    prevScreen.classList.add('slide-in-left');
  }

  State.currentScreen = prev;
}

// ── Toast ──
function showToast(message, duration = 3000) {
  let toast = document.getElementById('global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

// ── i18n ──
const I18N = {
  en: {
    appName: 'Bike Health AI',
    diagnose: 'Diagnose',
    history: 'History',
    tips: 'Tips & Learn',
    profile: 'Profile',
    home: 'Home',
    healthScore: 'Health Score',
    fixToday: 'Fix Today',
    withinWeek: 'Within 1 Week',
    monitor: 'Monitor',
    findMechanic: 'Find Mechanic',
    shareReport: 'Share Report',
    noIssues: 'No issues found! Your vehicle is in great shape.',
    analyzing: 'Analyzing your vehicle...',
    checkingThresholds: 'Checking 11 fault thresholds...',
    calculatingScore: 'Calculating health score...',
    generatingReport: 'Generating your report...',
  },
  hi: {
    appName: 'बाइक हेल्थ AI',
    diagnose: 'जांचें',
    history: 'इतिहास',
    tips: 'सुझाव',
    profile: 'प्रोफ़ाइल',
    home: 'होम',
    healthScore: 'स्वास्थ्य स्कोर',
    fixToday: 'आज ठीक करें',
    withinWeek: '1 सप्ताह में',
    monitor: 'निगरानी रखें',
    findMechanic: 'मैकेनिक खोजें',
    shareReport: 'रिपोर्ट शेयर करें',
    noIssues: 'कोई समस्या नहीं! आपका वाहन बिल्कुल ठीक है।',
    analyzing: 'आपके वाहन की जांच हो रही है...',
    checkingThresholds: '11 खराबी मापदंड जांचे जा रहे हैं...',
    calculatingScore: 'स्वास्थ्य स्कोर गणना हो रही है...',
    generatingReport: 'आपकी रिपोर्ट तैयार हो रही है...',
  }
};

function t(key) {
  return (I18N[State.language] && I18N[State.language][key]) || I18N.en[key] || key;
}

// ── SVG Icons ──
const Icons = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  diagnose: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  tips: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  mic: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
};

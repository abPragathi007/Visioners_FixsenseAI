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
    darkMode: State.darkMode,
    vehicles: State.vehicles,
    diagnoseHistory: State.diagnoseHistory,
    claudeApiKey: State.claudeApiKey,
    streak: State.streak,
    lastCheckDate: State.lastCheckDate,
    mechanicMode: State.mechanicMode,
  };
  localStorage.setItem('bikeHealthAI', JSON.stringify(persist));
}

function migrateLegacyStorage() {
  try {
    const legacyLangRaw = localStorage.getItem('bikeHealthAI_lang');
    if (legacyLangRaw) {
      const lang = JSON.parse(legacyLangRaw);
      if (typeof lang === 'string') State.language = lang;
    }
    const legacyThemeRaw = localStorage.getItem('bikeHealthAI_theme');
    if (legacyThemeRaw) {
      const th = JSON.parse(legacyThemeRaw);
      if (th === 'light') State.darkMode = false;
      else if (th === 'dark') State.darkMode = true;
    }
  } catch (e) {
    console.warn('Legacy key migration skipped', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem('bikeHealthAI');
    if (!raw) {
      migrateLegacyStorage();
      if (!['en', 'hi', 'kn'].includes(State.language)) State.language = 'en';
      return;
    }
    const saved = JSON.parse(raw);
    if (saved.language) State.language = saved.language;
    if (!['en', 'hi', 'kn'].includes(State.language)) State.language = 'en';
    if (saved.darkMode != null) State.darkMode = saved.darkMode;
    if (saved.vehicles) {
      State.vehicles = saved.vehicles.map(v => ({
        ...v,
        number: v.number != null ? String(v.number) : '',
        image: v.image || null,
      }));
    }
    if (saved.diagnoseHistory) State.diagnoseHistory = saved.diagnoseHistory;
    if (saved.claudeApiKey) State.claudeApiKey = saved.claudeApiKey;
    if (saved.streak != null) State.streak = saved.streak;
    if (saved.lastCheckDate) State.lastCheckDate = saved.lastCheckDate;
    if (saved.mechanicMode != null) State.mechanicMode = saved.mechanicMode;
  } catch (e) {
    console.warn('Could not load state', e);
  }
}

function applyDocumentLocale() {
  const map = { en: 'en', hi: 'hi', kn: 'kn' };
  document.documentElement.lang = map[State.language] || 'en';
}

function applyThemeToDocument() {
  document.documentElement.setAttribute('data-theme', State.darkMode ? 'dark' : 'light');
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

  queueMicrotask(() => {
    if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
  });
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

  queueMicrotask(() => {
    if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
  });
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
    navHome: 'Home',
    navDiagnose: 'Diagnose',
    navHistory: 'History',
    navTips: 'Tips',
    navProfile: 'Profile',
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
    yourVehicles: 'Your Vehicles',
    myVehicles: 'My Vehicles',
    addVehicle: 'Add Vehicle',
    vehicleReg: 'Registration number',
    vehiclePhoto: 'Photo',
    aiAssistant: 'AI Assistant',
    chatPlaceholder: 'Ask anything about your bike...',
    emergencyGuide: 'Emergency Guide',
    issueType: 'Issue type',
    offlineGuide: 'Offline guide',
    profileSettings: 'Profile & Settings',
    myAccount: 'My Account',
    memberTag: 'Bike Health AI Member',
    badgesEarned: 'Badges Earned',
    firstCheck: 'First Check',
    weekStreak4: '4 Week Streak',
    weekStreak12: '12 Weeks',
    fleetMaster: 'Fleet Master',
    aiSettings: 'AI Settings',
    mechanicMode: 'Mechanic Mode',
    mechanicDesc: 'Technical output for professionals',
    preferences: 'Preferences',
    language: 'Language',
    serviceReminders: 'Service Reminders',
    remind30: 'Notify every 30 days',
    darkMode: 'Dark Mode',
    themeDesc: 'Light or dark theme',
    dataPrivacy: 'Data & Privacy',
    exportCsv: 'Export as CSV',
    exportDesc: 'Download all diagnosis history',
    clearAll: 'Clear All Data',
    clearDesc: 'Remove all vehicles and history',
    langEnglish: 'English',
    langHindi: 'हिंदी',
    langKannada: 'ಕನ್ನಡ',
    selectLanguage: 'Select Language',
    cancel: 'Cancel',
    languageUpdated: 'Language updated!',
  },
  hi: {
    appName: 'बाइक हेल्थ AI',
    navHome: 'होम',
    navDiagnose: 'जांचें',
    navHistory: 'इतिहास',
    navTips: 'सुझाव',
    navProfile: 'प्रोफ़ाइल',
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
    yourVehicles: 'आपकी गाड़ियां',
    myVehicles: 'मेरी गाड़ियां',
    addVehicle: 'गाड़ी जोड़ें',
    vehicleReg: 'पंजीकरण संख्या',
    vehiclePhoto: 'फोटो',
    aiAssistant: 'AI सहायक',
    chatPlaceholder: 'अपनी बाइक के बारे में पूछें...',
    emergencyGuide: 'आपातकालीन मार्गदर्शन',
    issueType: 'समस्या प्रकार',
    offlineGuide: 'ऑफ़लाइन गाइड',
    profileSettings: 'प्रोफ़ाइल और सेटिंग्स',
    myAccount: 'मेरा खाता',
    memberTag: 'Bike Health AI उपयोगकर्ता',
    badgesEarned: 'बैज',
    firstCheck: 'पहली जांच',
    weekStreak4: '4 हफ्ते',
    weekStreak12: '12 हफ्ते',
    fleetMaster: 'फ्लीट मास्टर',
    aiSettings: 'AI सेटिंग्स',
    mechanicMode: 'मैकेनिक मोड',
    mechanicDesc: 'तकनीकी भाषा में परिणाम',
    preferences: 'प्राथमिकताएं',
    language: 'भाषा',
    serviceReminders: 'सर्विस रिमाइंडर',
    remind30: 'हर 30 दिन पर याद दिलाएं',
    darkMode: 'डार्क मोड',
    themeDesc: 'लाइट या डार्क थीम',
    dataPrivacy: 'डेटा और गोपनीयता',
    exportCsv: 'CSV एक्सपोर्ट',
    exportDesc: 'पूरा इतिहास डाउनलोड करें',
    clearAll: 'सारा डेटा मिटाएं',
    clearDesc: 'इतिहास और गाड़ियां हटाएं',
    langEnglish: 'English',
    langHindi: 'हिंदी',
    langKannada: 'ಕನ್ನಡ',
    selectLanguage: 'भाषा चुनें',
    cancel: 'रद्द करें',
    languageUpdated: 'भाषा अपडेट हो गई!',
  },
  kn: {
    appName: 'ಬೈಕ್ ಹೆಲ್ತ್ AI',
    navHome: 'ಮುಖಪುಟ',
    navDiagnose: 'ಪರಿಶೀಲನೆ',
    navHistory: 'ಇತಿಹಾಸ',
    navTips: 'ಸಲಹೆಗಳು',
    navProfile: 'ಪ್ರೊಫೈಲ್',
    diagnose: 'ಪರಿಶೀಲನೆ',
    history: 'ಇತಿಹಾಸ',
    tips: 'ಸಲಹೆಗಳು ಮತ್ತು ಕಲಿಕೆ',
    profile: 'ಪ್ರೊಫೈಲ್',
    home: 'ಮುಖಪುಟ',
    healthScore: 'ಆರೋಗ್ಯ ಅಂಕ',
    fixToday: 'ಇಂದು ಸರಿಪಡಿಸಿ',
    withinWeek: '1 ವಾರದೊಳಗೆ',
    monitor: 'ಮೇಲ್ವಿಚಾರಣೆ',
    findMechanic: 'ಮೆಕ್ಯಾನಿಕ್ ಹುಡುಕಿ',
    shareReport: 'ವರದಿ ಹಂಚಿಕೊಳ್ಳಿ',
    noIssues: 'ಯಾವುದೇ ಸಮಸ್ಯೆ ಇಲ್ಲ! ನಿಮ್ಮ ವಾಹನ ಚೆನ್ನಾಗಿದೆ.',
    analyzing: 'ನಿಮ್ಮ ವಾಹನವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...',
    checkingThresholds: '11 ದೋಷ ಮಾನದಂಡಗಳನ್ನು ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...',
    calculatingScore: 'ಆರೋಗ್ಯ ಅಂಕ ಲೆಕ್ಕಹಾಕಲಾಗುತ್ತಿದೆ...',
    generatingReport: 'ನಿಮ್ಮ ವರದಿ ತಯಾರಾಗುತ್ತಿದೆ...',
    yourVehicles: 'ನಿಮ್ಮ ವಾಹನಗಳು',
    myVehicles: 'ನನ್ನ ವಾಹನಗಳು',
    addVehicle: 'ವಾಹನ ಸೇರಿಸಿ',
    vehicleReg: 'ನೋಂದಣಿ ಸಂಖ್ಯೆ',
    vehiclePhoto: 'ಫೋಟೋ',
    aiAssistant: 'AI ಸಹಾಯಕ',
    chatPlaceholder: 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ ಕೇಳಿ...',
    emergencyGuide: 'ತುರ್ತು ಮಾರ್ಗದರ್ಶನ',
    issueType: 'ಸಮಸ್ಯೆ ಪ್ರಕಾರ',
    offlineGuide: 'ಆಫ್‌ಲೈನ್ ಮಾರ್ಗದರ್ಶನ',
    profileSettings: 'ಪ್ರೊಫೈಲ್ ಮತ್ತು ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    myAccount: 'ನನ್ನ ಖಾತೆ',
    memberTag: 'Bike Health AI ಸದಸ್ಯ',
    badgesEarned: 'ಬ್ಯಾಡ್ಜ್‌ಗಳು',
    firstCheck: 'ಮೊದಲ ಪರಿಶೀಲನೆ',
    weekStreak4: '4 ವಾರಗಳ ಸ್ಟ್ರೀಕ್',
    weekStreak12: '12 ವಾರಗಳು',
    fleetMaster: 'ಫ್ಲೀಟ್ ಮಾಸ್ಟರ್',
    aiSettings: 'AI ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    mechanicMode: 'ಮೆಕ್ಯಾನಿಕ್ ಮೋಡ್',
    mechanicDesc: 'ತಾಂತ್ರಿಕ ಔಟ್‌ಪುಟ್',
    preferences: 'ಆದ್ಯತೆಗಳು',
    language: 'ಭಾಷೆ',
    serviceReminders: 'ಸರ್ವಿಸ್ ಜ್ಞಾಪನೆಗಳು',
    remind30: 'ಪ್ರತಿ 30 ದಿನಗಳಿಗೆ',
    darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    themeDesc: 'ಲೈಟ್ ಅಥವಾ ಡಾರ್ಕ್ ಥೀಮ್',
    dataPrivacy: 'ಡೇಟಾ ಮತ್ತು ಗೌಪ್ಯತೆ',
    exportCsv: 'CSV ರಫ್ತು',
    exportDesc: 'ಎಲ್ಲಾ ಇತಿಹಾಸ ಡೌನ್‌ಲೋಡ್',
    clearAll: 'ಎಲ್ಲಾ ಡೇಟಾ ಅಳಿಸಿ',
    clearDesc: 'ವಾಹನಗಳು ಮತ್ತು ಇತಿಹಾಸ ತೆಗೆದುಹಾಕಿ',
    langEnglish: 'English',
    langHindi: 'हिंदी',
    langKannada: 'ಕನ್ನಡ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    cancel: 'ರದ್ದು',
    languageUpdated: 'ಭಾಷೆ ನವೀಕರಿಸಲಾಗಿದೆ!',
  }
};

function t(key) {
  const lang = ['en', 'hi', 'kn'].includes(State.language) ? State.language : 'en';
  if (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[lang] && TRANSLATIONS[lang][key] != null) {
    return TRANSLATIONS[lang][key];
  }
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** English / Hindi / Kannada short strings for gradual migration */
function tr(en, hi, kn) {
  const k = kn != null ? kn : en;
  if (State.language === 'hi') return hi;
  if (State.language === 'kn') return k;
  return en;
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

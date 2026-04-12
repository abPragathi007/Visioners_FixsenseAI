/* ═══════════════════════════════════════════════════════════
   SCREEN 1 · SPLASH / ONBOARDING
   ═══════════════════════════════════════════════════════════ */
let currentSlide = 0;
let selectedLang = 'en';

const SLIDES = [
  {
    emoji: '🔧',
    headline: 'Know Your Bike\'s Health <span class="gradient-text">Instantly</span>',
    desc: 'Enter 4 simple readings and get a full health report in seconds. No mechanical knowledge needed.',
    stats: [
      { number: '11', label: 'Problems Detected' },
      { number: '3', label: 'Vehicle Types' },
      { number: '₹', label: 'Cost Estimates' },
    ],
  },
  {
    emoji: '🛺',
    headline: 'Built for <span class="gradient-text">Indian Roads</span>',
    desc: 'From Hero Splendors to CNG auto rickshaws — Bike Health AI speaks your language and knows your vehicle.',
    stats: [
      { number: '350M+', label: 'Two-Wheelers' },
      { number: 'Hindi', label: 'Full Support' },
      { number: '0', label: 'Hardware Needed' },
    ],
  },
  {
    emoji: '🤖',
    headline: 'AI That <span class="gradient-text">Saves Money</span>',
    desc: 'Fix small problems before they become expensive breakdowns. Every auto owner needs this.',
    stats: [
      { number: '₹500', label: 'Avg. Savings/Month' },
      { number: '30s', label: 'Diagnosis Time' },
      { number: 'Free', label: 'To Use' },
    ],
  },
];

function renderSplashScreen() {
  const el = document.getElementById('screen-splash');

  el.innerHTML = `
    <div class="splash-bg"></div>
    <div class="splash-grid"></div>
    <div class="onboarding-phase" id="onboarding-phase">
      ${renderLangSelector()}
    </div>
  `;

  bindLangButtons();
}

function renderLangSelector() {
  const langs = [
    { code: 'en', native: 'English', en: 'English' },
    { code: 'hi', native: 'हिंदी', en: 'Hindi' },
    { code: 'ta', native: 'தமிழ்', en: 'Tamil' },
    { code: 'te', native: 'తెలుగు', en: 'Telugu' },
    { code: 'kn', native: 'ಕನ್ನಡ', en: 'Kannada' },
    { code: 'mr', native: 'मराठी', en: 'Marathi' },
  ];

  return `
    <div class="lang-selector-screen" id="lang-selector">
      <div class="app-logo">
        <div class="logo-icon">🏍️</div>
        <div class="app-name">Bike Health AI</div>
        <div class="app-tagline">Smart maintenance for Indian two-wheelers</div>
      </div>
      <div class="lang-title">Choose your language / भाषा चुनें</div>
      <div class="lang-grid">
        ${langs.map(l => `
          <button class="lang-btn ${l.code === 'en' ? 'selected' : ''}" data-lang="${l.code}">
            <span class="lang-native">${l.native}</span>
            <span class="lang-en">${l.en}</span>
          </button>
        `).join('')}
      </div>
      <button class="btn btn-primary btn-full" onclick="startCarousel()" style="margin-top:8px">
        Continue →
      </button>
      <p class="text-center text-xs text-muted mt-2">You can change this anytime in Settings</p>
    </div>
  `;
}

function bindLangButtons() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedLang = btn.dataset.lang;
    });
  });
}

function startCarousel() {
  State.language = selectedLang;
  currentSlide = 0;
  renderCarouselSlide(0);
}

function renderCarouselSlide(index) {
  const phase = document.getElementById('onboarding-phase');
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  phase.innerHTML = `
    <div class="carousel-screen">
      <div class="slide-content">
        <div class="slide-illustration">${slide.emoji}</div>
        <h2 class="slide-headline">${slide.headline}</h2>
        <p class="slide-desc">${slide.desc}</p>
        <div class="slide-stats">
          ${slide.stats.map(s => `
            <div class="stat-item">
              <div class="stat-number">${s.number}</div>
              <div class="stat-label">${s.label}</div>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="carousel-dots">
        ${SLIDES.map((_, i) => `<div class="carousel-dot ${i === index ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('')}
      </div>
      <div class="carousel-actions">
        ${isLast
          ? `<button class="btn btn-primary btn-full btn-lg" onclick="finishOnboarding()">✨ Get Started — It's Free</button>`
          : `<button class="btn btn-primary btn-full btn-lg" onclick="nextSlide()">Next →</button>
             <button class="btn btn-ghost btn-full" onclick="finishOnboarding()">Skip</button>`
        }
      </div>
    </div>
  `;
}

function nextSlide() {
  if (currentSlide < SLIDES.length - 1) {
    currentSlide++;
    renderCarouselSlide(currentSlide);
  }
}

function goToSlide(i) {
  currentSlide = i;
  renderCarouselSlide(i);
}

function finishOnboarding() {
  saveState();
  navigateTo('home', 'right');
  renderHomeScreen();
}

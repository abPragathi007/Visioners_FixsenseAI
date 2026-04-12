/* ═══════════════════════════════════════════════════════════
   SCREEN 5 · LOADING
   ═══════════════════════════════════════════════════════════ */
let loadingInterval = null;

const LOADING_STATUSES = [
  'Checking engine temperature threshold...',
  'Analyzing oil level...',
  'Testing battery voltage...',
  'Reviewing service history...',
  'Cross-checking symptom data...',
  'Calculating health score...',
  'Generating personalized tips...',
  'Preparing your report...',
];

const LOADING_STATUSES_HI = [
  'इंजन तापमान जांचा जा रहा है...',
  'ऑयल लेवल का विश्लेषण हो रहा है...',
  'बैटरी वोल्टेज टेस्ट हो रही है...',
  'सर्विस इतिहास की जांच हो रही है...',
  'लक्षणों की तुलना हो रही है...',
  'स्वास्थ्य स्कोर गणना हो रही है...',
  'व्यक्तिगत सुझाव बनाए जा रहे हैं...',
  'रिपोर्ट तैयार हो रही है...',
];

function renderLoadingScreen() {
  const el = document.getElementById('screen-loading');
  const isHi = State.language === 'hi';
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId) || State.vehicles[0];
  const tipIdx = Math.floor(Math.random() * DID_YOU_KNOW.length);

  el.innerHTML = `
    <div class="loading-bg"></div>
    <div class="loading-content slide-up">
      <div class="loading-icon-wrapper">
        <span class="loading-icon-inner">${vehicle?.emoji || '🏍️'}</span>
      </div>
      <h2 class="loading-title">${isHi ? 'AI विश्लेषण' : 'AI Analysis'}</h2>
      <p class="loading-subtitle">${isHi ? 'आपकी गाड़ी की जांच हो रही है...' : 'Analyzing your vehicle data...'}</p>

      <div class="loading-status" id="loading-status">
        ${isHi ? LOADING_STATUSES_HI[0] : LOADING_STATUSES[0]}
      </div>

      <div class="loading-progress">
        <div class="loading-progress-bar" id="loading-bar"></div>
      </div>

      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>

      <div class="did-you-know" style="margin-top: 32px;">
        <div class="dyk-label">💡 Did You Know?</div>
        <div class="dyk-text">${DID_YOU_KNOW[tipIdx]}</div>
      </div>
    </div>
  `;

  startLoadingAnimation();

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function startLoadingAnimation() {
  const statuses = State.language === 'hi' ? LOADING_STATUSES_HI : LOADING_STATUSES;
  let step = 0;
  const totalSteps = statuses.length;

  if (loadingInterval) clearInterval(loadingInterval);

  loadingInterval = setInterval(() => {
    step++;
    const progress = Math.min((step / totalSteps) * 100, 95);

    const statusEl = document.getElementById('loading-status');
    const barEl = document.getElementById('loading-bar');

    if (statusEl && step < statuses.length) {
      statusEl.style.opacity = '0';
      setTimeout(() => {
        if (statusEl) {
          statusEl.textContent = statuses[step];
          statusEl.style.opacity = '1';
          statusEl.style.transition = 'opacity 0.3s ease';
        }
      }, 150);
    }

    if (barEl) {
      barEl.style.width = progress + '%';
    }

    if (step >= totalSteps) {
      clearInterval(loadingInterval);
      if (barEl) barEl.style.width = '100%';
    }
  }, 600);
}

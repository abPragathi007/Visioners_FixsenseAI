/* ═══════════════════════════════════════════════════════════
   SCREEN 4 · DIAGNOSE FORM
   ═══════════════════════════════════════════════════════════ */
let activeSymptoms = new Set();
let isListening = false;

function renderDiagnoseScreen() {
  const el = document.getElementById('screen-diagnose');
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId) || State.vehicles[0];
  const isAuto = vehicle?.type === 'auto';
  const isHi = State.language === 'hi';
  activeSymptoms = new Set();

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack()">${Icons.back}</div>
      <div style="flex: 1;">
        <div class="page-title">${isHi ? 'वाहन जांचें' : 'Diagnose Vehicle'}</div>
        <div class="text-xs text-muted">${vehicle ? `${vehicle.nickname} · ${vehicle.brand} ${vehicle.model}` : 'Select vehicle'}</div>
      </div>
    </div>

    <!-- Vehicle Selector -->
    ${State.vehicles.length > 1 ? `
    <div style="padding: 12px 20px 0; overflow-x: auto; display: flex; gap: 8px; scrollbar-width: none;">
      ${State.vehicles.map(v => `
        <div class="chip ${v.id === State.diagnoseInputs.vehicleId ? 'active' : ''}"
          onclick="switchVehicle('${v.id}')">
          ${v.emoji} ${v.nickname}
        </div>
      `).join('')}
    </div>` : ''}

    <div class="diagnose-content">
      <!-- Engine Temperature -->
      ${renderSlider({
        id: 'engineTemp',
        label: isHi ? 'इंजन तापमान' : 'Engine Temperature',
        unit: '°C',
        min: 40, max: 140,
        value: State.diagnoseInputs.engineTemp,
        safeEnd: 65, warnEnd: 78,
        thresholds: { normal: 95, warn: 105 },
        normalLabel: '<95°C Normal',
        criticalLabel: '>105°C Critical',
      })}

      <!-- Oil Level -->
      ${renderSlider({
        id: 'oilLevel',
        label: isHi ? 'इंजन ऑयल लेवल' : 'Engine Oil Level',
        unit: '%',
        min: 0, max: 100,
        value: State.diagnoseInputs.oilLevel,
        safeEnd: 45, warnEnd: 72,
        thresholds: { normal: 40, warn: 30, inverted: true },
        normalLabel: '>40% Good',
        criticalLabel: '<25% Critical',
        inverted: true,
      })}

      <!-- Battery Voltage -->
      ${renderSlider({
        id: 'batteryVolt',
        label: isHi ? 'बैटरी वोल्टेज' : 'Battery Voltage',
        unit: 'V',
        min: 10, max: 15,
        step: 0.1,
        value: State.diagnoseInputs.batteryVolt,
        safeEnd: 55, warnEnd: 75,
        thresholds: { normal: 12.4, warn: 12.2, inverted: true },
        normalLabel: '>12.4V Good',
        criticalLabel: '<12.0V Dead',
        inverted: true,
      })}

      <!-- Km Since Service -->
      ${renderSlider({
        id: 'kmSinceService',
        label: isHi ? 'अंतिम सर्विस के बाद km' : 'Km Since Last Service',
        unit: ' km',
        min: 0, max: 8000,
        step: 100,
        value: State.diagnoseInputs.kmSinceService,
        safeEnd: 37, warnEnd: 62,
        thresholds: { normal: 3000, warn: 4000 },
        normalLabel: '<3000 Fresh',
        criticalLabel: '>5000 Overdue',
      })}

      <!-- CNG Pressure (Auto only) -->
      ${isAuto ? `
      <div class="cng-section">
        <div class="cng-title">🔵 CNG (Auto Rickshaw)</div>
        ${renderSlider({
          id: 'cngPressure',
          label: isHi ? 'CNG प्रेशर' : 'CNG Pressure',
          unit: ' PSI',
          min: 0, max: 250,
          step: 5,
          value: State.diagnoseInputs.cngPressure,
          safeEnd: 62, warnEnd: 78,
          thresholds: { normal: 150, warn: 140, inverted: true },
          normalLabel: '>150 Good',
          criticalLabel: '<120 Refuel',
          inverted: true,
          noBorder: true,
        })}
      </div>` : ''}

      <!-- Symptoms -->
      <div class="form-group">
        <label class="label" style="margin-bottom: 12px;">
          ${isHi ? 'लक्षण / समस्या बताएं' : 'Describe Symptoms'}
          <span style="font-weight: 400; color: var(--text-muted); font-size: 0.72rem; text-transform: none; margin-left: 4px;">(Optional)</span>
        </label>
        <div class="symptom-tags" id="symptom-tags">
          ${SYMPTOM_TAGS.map(tag => `
            <div class="chip" data-symptom="${tag.label}" onclick="toggleSymptom(this, '${tag.label}')">
              ${tag.emoji} ${tag.label}
            </div>
          `).join('')}
        </div>
        <div class="textarea-wrapper" style="margin-top: 12px;">
          <textarea class="input-field" id="symptom-text" rows="3"
            placeholder="${isHi ? 'जैसे: गाड़ी स्टार्ट नहीं होती, धुआं आ रहा है...' : 'e.g. Hard to start, making noise, bad mileage...'}"
          ></textarea>
          <button class="voice-btn" id="voice-btn" onclick="toggleVoiceInput()" title="Voice Input">
            ${Icons.mic}
          </button>
        </div>
        <div id="voice-status" style="font-size: 0.75rem; color: var(--brand-orange); margin-top: 4px; min-height: 16px;"></div>
      </div>

      <!-- "I don't know" info -->
      <div class="card-glass" style="padding: 12px 14px; margin-bottom: 20px;">
        <div style="font-size: 0.78rem; color: var(--text-secondary); display: flex; gap: 8px; align-items: flex-start;">
          <span>💡</span>
          <span>${isHi ? 'रीडिंग नहीं पता? कोई बात नहीं — बस गाड़ी के लक्षण ऊपर बताएं और हम अनुमान लगाएंगे।'
            : 'Don\'t know the exact readings? No problem — just describe your symptoms above and our AI will infer the diagnosis.'}</span>
        </div>
      </div>
    </div>

    <!-- Fixed CTA -->
    <div class="diagnose-cta-wrapper">
      <button class="btn btn-primary btn-full btn-lg" onclick="submitDiagnosis()">
        🔍 ${isHi ? 'रिपोर्ट बनाएं' : 'Get Health Report'}
      </button>
    </div>
  `;

  // Bind slider events
  bindSliders();
}

function renderSlider({ id, label, unit, min, max, step = 1, value, safeEnd, warnEnd,
  thresholds, normalLabel, criticalLabel, inverted = false, noBorder = false }) {
  const isHi = State.language === 'hi';
  const statusClass = getSliderStatus(value, thresholds, inverted);

  return `
    <div class="form-group" ${noBorder ? '' : 'style="padding-bottom: 4px; border-bottom: 1px solid var(--border-subtle);"'}>
      <div class="slider-label-row">
        <span class="slider-label-text">${label}</span>
        <span class="slider-value-display ${statusClass}" id="display-${id}">${value}${unit}</span>
      </div>
      <div style="position: relative;">
        <input type="range" id="slider-${id}"
          min="${min}" max="${max}" step="${step}" value="${value}"
          style="background: linear-gradient(to right,
            #22C55E 0%, #22C55E ${safeEnd}%,
            #FFBB44 ${safeEnd}%, #FFBB44 ${warnEnd}%,
            #EF4444 ${warnEnd}%, #EF4444 100%
          );"
        />
      </div>
      <div class="slider-range-labels">
        <span>${normalLabel}</span>
        <span>${criticalLabel}</span>
      </div>
      <div class="idontknow-row">
        <span class="idontknow-label">${isHi ? 'पता नहीं / अनुमान लगाएं' : 'I don\'t know — let AI infer'}</span>
        <label class="toggle-switch">
          <input type="checkbox" id="idk-${id}" onchange="toggleIdontKnow('${id}', this.checked)">
          <span class="slider"></span>
        </label>
      </div>
    </div>
  `;
}

function getSliderStatus(value, thresholds, inverted) {
  if (!thresholds) return '';
  if (inverted) {
    if (value < thresholds.warn || value <= 12.0 || value <= 25) return 'critical';
    if (value < thresholds.normal) return 'warning';
    return 'normal';
  }
  if (value > (thresholds.warn || thresholds.normal * 1.1)) return 'critical';
  if (value > thresholds.normal) return 'warning';
  return 'normal';
}

function bindSliders() {
  const sliderIds = ['engineTemp', 'oilLevel', 'batteryVolt', 'kmSinceService', 'cngPressure'];
  const units = { engineTemp: '°C', oilLevel: '%', batteryVolt: 'V', kmSinceService: ' km', cngPressure: ' PSI' };

  sliderIds.forEach(id => {
    const slider = document.getElementById(`slider-${id}`);
    if (!slider) return;

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      State.diagnoseInputs[id] = val;

      const display = document.getElementById(`display-${id}`);
      if (display) {
        display.textContent = val + units[id];
        // Update color class
        display.className = 'slider-value-display ' + getSliderStatusForId(id, val);
      }
    });
  });
}

function getSliderStatusForId(id, value) {
  const T = THRESHOLDS;
  switch(id) {
    case 'engineTemp':
      return value > T.engineTemp.warning ? 'critical' : value > T.engineTemp.normal ? 'warning' : 'normal';
    case 'oilLevel':
      return value < T.oilLevel.critical ? 'critical' : value < T.oilLevel.normal ? 'warning' : 'normal';
    case 'batteryVolt':
      return value < T.battery.critical ? 'critical' : value < T.battery.normal ? 'warning' : 'normal';
    case 'kmSinceService':
      return value > T.kmService.fuelFilter ? 'critical' : value > T.kmService.oil ? 'warning' : 'normal';
    case 'cngPressure':
      return value < T.cngPressure.critical ? 'critical' : value < T.cngPressure.normal ? 'warning' : 'normal';
    default: return '';
  }
}

function toggleIdontKnow(id, checked) {
  State.diagnoseInputs.idontknow[id] = checked;
  const slider = document.getElementById(`slider-${id}`);
  if (slider) {
    slider.disabled = checked;
    slider.style.opacity = checked ? '0.4' : '1';
  }
  const display = document.getElementById(`display-${id}`);
  if (display && checked) {
    display.textContent = '?';
    display.className = 'slider-value-display';
  }
}

function toggleSymptom(el, symptom) {
  if (activeSymptoms.has(symptom)) {
    activeSymptoms.delete(symptom);
    el.classList.remove('active');
  } else {
    activeSymptoms.add(symptom);
    el.classList.add('active');
  }
  // Update text area
  const textarea = document.getElementById('symptom-text');
  if (textarea) {
    const manual = textarea.value.split('\n').filter(l => !SYMPTOM_TAGS.map(t => t.label).some(s => l.includes(s))).join('\n');
    const tags = Array.from(activeSymptoms).join(', ');
    textarea.value = (manual + (manual && tags ? '. ' : '') + tags).trim();
    State.diagnoseInputs.symptoms = textarea.value;
  }
}

function toggleVoiceInput() {
  const btn = document.getElementById('voice-btn');
  const status = document.getElementById('voice-status');

  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice input not supported in this browser');
    return;
  }

  if (isListening) {
    window._recognition?.stop();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SpeechRecognition();
  window._recognition = rec;

  rec.lang = State.language === 'hi' ? 'hi-IN' : 'en-IN';
  rec.interimResults = true;
  rec.continuous = false;

  rec.onstart = () => {
    isListening = true;
    btn.classList.add('active');
    if (status) status.textContent = State.language === 'hi' ? '🎤 सुन रहा हूं...' : '🎤 Listening...';
  };

  rec.onresult = (e) => {
    const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
    const textarea = document.getElementById('symptom-text');
    if (textarea) {
      textarea.value = transcript;
      State.diagnoseInputs.symptoms = transcript;
    }
  };

  rec.onend = () => {
    isListening = false;
    btn.classList.remove('active');
    if (status) status.textContent = '';
  };

  rec.start();
}

function switchVehicle(id) {
  State.diagnoseInputs.vehicleId = id;
  renderDiagnoseScreen();
}

async function submitDiagnosis() {
  // Capture symptom text
  const textarea = document.getElementById('symptom-text');
  if (textarea) State.diagnoseInputs.symptoms = textarea.value;

  // Navigate to loading
  navigateTo('loading', 'right');
  renderLoadingScreen();

  try {
    const result = await runDiagnosis();
    State.results = result;
    navigateTo('results', 'right');
    renderResultsScreen();
  } catch (err) {
    showToast('Error running diagnosis. Using local analysis.');
    const result = localAnalysis(State.diagnoseInputs,
      State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId),
      State.language);
    State.results = result;
    navigateTo('results', 'right');
    renderResultsScreen();
  }
}

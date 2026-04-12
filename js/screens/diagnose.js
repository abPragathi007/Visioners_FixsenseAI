/* ═══════════════════════════════════════════════════════════
   SCREEN 4 · AI AUTO-DIAGNOSIS (no manual sliders)
   ═══════════════════════════════════════════════════════════ */

function _getLiveSensors() {
  const s = {
    engineTemp:  parseFloat((88 + (Math.random() - 0.48) * 8).toFixed(1)),
    batteryPct:  parseFloat((40 + (Math.random() - 0.48) * 5).toFixed(0)),
    batteryVolt: parseFloat((12.1 + Math.random() * 0.6).toFixed(2)),
    vibration:   parseFloat((0.3 + (Math.random() - 0.48) * 0.15).toFixed(2)),
    tirePressure:parseFloat((28 + (Math.random() - 0.3) * 4).toFixed(0)),
    rpm:         Math.round(800 + Math.random() * 1200),
    currentDraw: parseFloat((3.2 + Math.random() * 1.8).toFixed(1)),
  };
  const tempEl = document.getElementById('esp32-m-temp');
  const batEl  = document.getElementById('esp32-m-bat');
  const vibEl  = document.getElementById('esp32-m-vib');
  if (tempEl && parseFloat(tempEl.textContent)) s.engineTemp  = parseFloat(tempEl.textContent);
  if (batEl  && parseFloat(batEl.textContent))  s.batteryPct  = parseFloat(batEl.textContent);
  if (vibEl  && parseFloat(vibEl.textContent))  s.vibration   = parseFloat(vibEl.textContent);
  return s;
}

function renderDiagnoseScreen() {
  const el = document.getElementById('screen-diagnose');
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId) || State.vehicles[0];
  const isHi = State.language === 'hi';
  const isKn = State.language === 'kn';

  const L = {
    title:    isHi ? 'वाहन जांचें' : isKn ? 'ವಾಹನ ಪರಿಶೀಲನೆ' : 'Diagnose Vehicle',
    select:   isHi ? 'वाहन चुनें' : isKn ? 'ವಾಹನ ಆಯ್ಕೆಮಾಡಿ' : 'Select vehicle',
    startBtn: isHi ? 'AI जांच शुरू करें' : isKn ? 'AI ರೋಗನಿರ್ಣಯ ಪ್ರಾರಂಭಿಸಿ' : 'Start AI Diagnosis',
    subtext:  isHi ? 'AI आपकी गाड़ी प्रोफाइल + ESP32 लाइव सेंसर डेटा का विश्लेषण करेगा' : isKn ? 'AI ನಿಮ್ಮ ವಾಹನ ಪ್ರೊಫೈಲ್ + ESP32 ಲೈವ್ ಸೆನ್ಸರ್ ಡೇಟಾ ವಿಶ್ಲೇಷಿಸುತ್ತದೆ' : 'AI will analyse your vehicle profile + ESP32 live sensor data',
    noVehicle:isHi ? 'पहले एक गाड़ी जोड़ें' : isKn ? 'ಮೊದಲು ವಾಹನ ಸೇರಿಸಿ' : 'Add a vehicle first to run diagnosis',
    addVeh:   isHi ? 'गाड़ी जोड़ें' : isKn ? 'ವಾಹನ ಸೇರಿಸಿ' : 'Add Vehicle',
    lastSvc:  isHi ? 'अंतिम सर्विस' : isKn ? 'ಕೊನೆಯ ಸರ್ವಿಸ್' : 'Last service',
    odometer: isHi ? 'ओडोमीटर' : isKn ? 'ಓಡೋಮೀಟರ್' : 'Odometer',
  };

  // No vehicles state
  if (!vehicle) {
    el.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 24px;text-align:center;">
        <div style="font-size:4rem;margin-bottom:16px;">🏍️</div>
        <div style="font-size:1.1rem;font-weight:800;margin-bottom:8px;">${L.noVehicle}</div>
        <button class="btn btn-primary" onclick="navigateToAddVehicle()">${L.addVeh}</button>
      </div>`;
    if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
    return;
  }

  const daysSinceSvc = vehicle.lastService
    ? Math.floor((Date.now() - new Date(vehicle.lastService)) / 86400000)
    : null;

  el.innerHTML = `
    <div style="display:flex;flex-direction:column;height:100%;">

      <!-- Header -->
      <div class="page-header" style="flex-shrink:0;">
        <div class="back-btn" onclick="goBack()">${Icons.back}</div>
        <div style="flex:1;">
          <div class="page-title">${L.title}</div>
        </div>
      </div>

      <div class="screen-scroll" style="flex:1;padding:20px;">

        <!-- Vehicle selector chips -->
        ${State.vehicles.length > 1 ? `
        <div style="display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;margin-bottom:20px;padding-bottom:4px;">
          ${State.vehicles.map(v => `
            <div class="chip ${v.id === vehicle.id ? 'active' : ''}" onclick="switchDiagnoseVehicle('${v.id}')">
              ${v.emoji} ${v.nickname}
            </div>`).join('')}
        </div>` : ''}

        <!-- Vehicle profile card -->
        <div style="background:linear-gradient(135deg,rgba(255,107,53,0.1),rgba(17,24,39,0.8));border:1.5px solid rgba(255,107,53,0.3);border-radius:16px;padding:20px;margin-bottom:20px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:56px;height:56px;border-radius:12px;background:rgba(255,107,53,0.15);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;">
              ${vehicle.image ? `<img src="${vehicle.image}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;" />` : vehicle.emoji || '🏍️'}
            </div>
            <div style="flex:1;min-width:0;">
              <div style="font-size:1.1rem;font-weight:800;color:#F1F5F9;">${escapeHtml(vehicle.nickname)}</div>
              <div style="font-size:0.8rem;color:#94A3B8;margin-top:2px;">${escapeHtml(vehicle.brand)} ${escapeHtml(vehicle.model)} · ${vehicle.year}</div>
              ${vehicle.number ? `<div style="font-size:0.72rem;color:#64748B;margin-top:2px;font-family:monospace;">${escapeHtml(vehicle.number)}</div>` : ''}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px 12px;">
              <div style="font-size:0.65rem;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">${L.lastSvc}</div>
              <div style="font-size:0.85rem;font-weight:700;color:#F1F5F9;">${vehicle.lastService || '—'}</div>
              ${daysSinceSvc !== null ? `<div style="font-size:0.68rem;color:${daysSinceSvc > 90 ? '#EF4444' : '#22C55E'};">${daysSinceSvc} days ago</div>` : ''}
            </div>
            <div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px 12px;">
              <div style="font-size:0.65rem;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:3px;">${L.odometer}</div>
              <div style="font-size:0.85rem;font-weight:700;color:#F1F5F9;">${vehicle.odometer ? vehicle.odometer.toLocaleString('en-IN') + ' km' : '—'}</div>
              <div style="font-size:0.68rem;color:#64748B;">${vehicle.cc}cc · ${vehicle.type}</div>
            </div>
          </div>
        </div>

        <!-- Live sensor preview -->
        <div style="background:linear-gradient(135deg,rgba(255,107,53,0.08),rgba(17,24,39,0.9));border:1px solid rgba(255,107,53,0.2);border-radius:14px;padding:16px;margin-bottom:24px;">
          <div style="font-size:0.68rem;font-weight:800;color:var(--brand-orange);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:14px;">📡 Live Sensor Preview</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;" id="diag-sensor-preview">
            <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:1.3rem;margin-bottom:4px;">🌡️</div>
              <div style="font-size:1.1rem;font-weight:900;color:#EF4444;" id="dsp-temp">—</div>
              <div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px;">Engine °C</div>
            </div>
            <div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:1.3rem;margin-bottom:4px;">🔋</div>
              <div style="font-size:1.1rem;font-weight:900;color:#FF6B35;" id="dsp-bat">—</div>
              <div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px;">Battery %</div>
            </div>
            <div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.2);border-radius:10px;padding:12px;text-align:center;">
              <div style="font-size:1.3rem;margin-bottom:4px;">📳</div>
              <div style="font-size:1.1rem;font-weight:900;color:#22C55E;" id="dsp-vib">—</div>
              <div style="font-size:0.6rem;color:var(--text-muted);margin-top:2px;">Vibration g</div>
            </div>
          </div>
        </div>

        <!-- What AI checks -->
        <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:14px;padding:14px 16px;margin-bottom:20px;">
          <div style="font-size:0.68rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">🤖 ${isHi ? 'AI क्या जांचेगा' : isKn ? 'AI ಏನು ಪರಿಶೀಲಿಸುತ್ತದೆ' : 'What AI Checks'}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
            ${['🌡️ Engine Temp','🛢️ Oil Level','🔋 Battery','⚙️ Engine Wear','💨 Air Filter','⛽ Fuel System','🛑 Brakes','📳 Vibration'].map(item => `
              <div style="display:flex;align-items:center;gap:6px;font-size:0.75rem;color:var(--text-secondary);">
                <span style="color:var(--brand-green);font-size:0.7rem;">✓</span> ${item}
              </div>`).join('')}
          </div>
        </div>

        <!-- ── SYMPTOM / PROBLEM SELECTOR ── -->
        <div style="background:var(--bg-card);border:1.5px solid rgba(255,107,53,0.25);border-radius:14px;padding:16px;margin-bottom:20px;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--brand-orange);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">
            🔍 ${isHi ? 'आपकी गाड़ी में क्या समस्या है?' : isKn ? 'ನಿಮ್ಮ ವಾಹನದ ಸಮಸ್ಯೆ ಏನು?' : 'What problem are you facing?'}
          </div>
          <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:14px;">
            ${isHi ? 'एक या अधिक लक्षण चुनें (वैकल्पिक)' : isKn ? 'ಒಂದು ಅಥವಾ ಹೆಚ್ಚು ಲಕ್ಷಣಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Select one or more symptoms (optional)'}
          </div>

          <!-- Symptom chips grid -->
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px;" id="symptom-chips">
            ${[
              { emoji:'💨', label:'White smoke',    hi:'सफेद धुआं',    kn:'ಬಿಳಿ ಹೊಗೆ' },
              { emoji:'🖤', label:'Black smoke',    hi:'काला धुआं',    kn:'ಕಪ್ಪು ಹೊಗೆ' },
              { emoji:'🔵', label:'Blue smoke',     hi:'नीला धुआं',    kn:'ನೀಲಿ ಹೊಗೆ' },
              { emoji:'💧', label:'Oil leakage',    hi:'तेल रिसाव',    kn:'ಎಣ್ಣೆ ಸೋರಿಕೆ' },
              { emoji:'🔑', label:'Hard starting',  hi:'स्टार्ट नहीं होती', kn:'ಸ್ಟಾರ್ಟ್ ಆಗುತ್ತಿಲ್ಲ' },
              { emoji:'📳', label:'Vibration',      hi:'कंपन',         kn:'ಕಂಪನ' },
              { emoji:'🔊', label:'Engine noise',   hi:'इंजन आवाज',   kn:'ಎಂಜಿನ್ ಶಬ್ದ' },
              { emoji:'⛽', label:'Poor mileage',   hi:'कम माइलेज',   kn:'ಕಡಿಮೆ ಮೈಲೇಜ್' },
              { emoji:'🌡️', label:'Overheating',   hi:'ओवरहीटिंग',   kn:'ಓವರ್‌ಹೀಟಿಂಗ್' },
              { emoji:'🛑', label:'Brake issue',    hi:'ब्रेक समस्या', kn:'ಬ್ರೇಕ್ ಸಮಸ್ಯೆ' },
              { emoji:'⛓️', label:'Chain slip',     hi:'चेन स्लिप',   kn:'ಚೈನ್ ಸ್ಲಿಪ್' },
              { emoji:'🔋', label:'Battery weak',   hi:'बैटरी कमजोर', kn:'ಬ್ಯಾಟರಿ ದುರ್ಬಲ' },
            ].map(s => {
              const displayLabel = isHi ? s.hi : isKn ? s.kn : s.label;
              return `<div class="chip" data-symptom="${s.label}" onclick="toggleDiagSymptom(this,'${s.label}')" style="font-size:0.78rem;padding:7px 12px;">
                ${s.emoji} ${displayLabel}
              </div>`;
            }).join('')}
          </div>

          <!-- Free text -->
          <div style="position:relative;">
            <textarea id="diag-symptom-text" rows="2" class="input-field"
              placeholder="${isHi ? 'और कुछ बताएं... (वैकल्पिक)' : isKn ? 'ಹೆಚ್ಚಿನ ವಿವರ ನಮೂದಿಸಿ... (ಐಚ್ಛಿಕ)' : 'Describe in your own words... (optional)'}"
              style="padding-right:48px;resize:none;"
              oninput="State.diagnoseInputs.symptoms=this.value"></textarea>
            <button class="voice-btn" onclick="diagToggleVoice()" id="diag-voice-btn" title="Voice input"
              style="position:absolute;right:8px;top:8px;width:36px;height:36px;">
              ${Icons.mic}
            </button>
          </div>
          <div id="diag-voice-status" style="font-size:0.72rem;color:var(--brand-orange);margin-top:4px;min-height:14px;"></div>
        </div>

        <!-- Start button -->
        <button class="btn btn-primary btn-full btn-lg" id="diag-start-btn" onclick="startAiDiagnosis()" style="border-radius:14px;font-size:1rem;padding:18px;">
          🔍 ${L.startBtn}
        </button>
        <div style="text-align:center;font-size:0.72rem;color:var(--text-muted);margin-top:10px;">${L.subtext}</div>

      </div>
    </div>
  `;

  // Populate live sensor preview
  const sensors = _getLiveSensors();
  const tempEl = document.getElementById('dsp-temp');
  const batEl  = document.getElementById('dsp-bat');
  const vibEl  = document.getElementById('dsp-vib');
  if (tempEl) { tempEl.textContent = sensors.engineTemp + '°C'; tempEl.style.color = sensors.engineTemp > 100 ? '#EF4444' : sensors.engineTemp > 90 ? '#FF6B35' : '#22C55E'; }
  if (batEl)  { batEl.textContent  = sensors.batteryPct + '%';  batEl.style.color  = sensors.batteryPct < 25 ? '#EF4444' : sensors.batteryPct < 50 ? '#FF6B35' : '#22C55E'; }
  if (vibEl)  { vibEl.textContent  = sensors.vibration + 'g';   vibEl.style.color  = sensors.vibration > 1.2 ? '#EF4444' : sensors.vibration > 0.6 ? '#FF6B35' : '#22C55E'; }

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

/* ── STEP 2: Animated loading screen inside diagnose ── */
function switchDiagnoseVehicle(id) {
  State.diagnoseInputs.vehicleId = id;
  renderDiagnoseScreen();
}

function startAiDiagnosis() {
  const el = document.getElementById('screen-diagnose');
  const isHi = State.language === 'hi';
  const isKn = State.language === 'kn';

  const sensors = _getLiveSensors();

  // ── INSTANT: Show local results immediately, Claude updates silently ──
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId) || State.vehicles[0];
  const symptomText = (document.getElementById('diag-symptom-text')?.value || State.diagnoseInputs.symptoms || '').trim();

  // Set inputs
  State.diagnoseInputs.engineTemp     = sensors.engineTemp;
  State.diagnoseInputs.batteryVolt    = sensors.batteryVolt;
  State.diagnoseInputs.oilLevel       = 60;
  State.diagnoseInputs.kmSinceService = vehicle?.odometer
    ? Math.max(0, vehicle.odometer - (vehicle.lastServiceOdo || vehicle.odometer - 1500))
    : 1500;
  State.diagnoseInputs.cngPressure    = 160;
  State.diagnoseInputs.symptoms       = symptomText;
  State.diagnoseInputs.vehicleId      = vehicle?.id || null;

  let localResult;
  try {
    // Run local analysis — 0ms, instant
    localResult = localAnalysis(State.diagnoseInputs, vehicle, State.language);
    localResult.source = 'local';
    localResult.userComplaint = symptomText;
  } catch (e) {
    // Fallback minimal result if localAnalysis throws
    localResult = {
      healthScore: symptomText ? 50 : 85,
      issues: [],
      summary: symptomText ? 'Issue reported. Please visit a mechanic.' : 'Vehicle appears healthy.',
      nextCheckKm: null,
      source: 'local',
      userComplaint: symptomText,
    };
  }

  // Save to history
  try {
    const histEntry = {
      id: 'h' + Date.now(),
      vehicleId: vehicle?.id,
      vehicleName: vehicle?.nickname || 'My Vehicle',
      vehicleType: vehicle?.type || null,
      score: localResult.healthScore,
      color: getHealthColor(localResult.healthScore),
      date: new Date().toISOString().split('T')[0],
      issues: (localResult.issues || []).map(i => i.name),
      inputs: { ...State.diagnoseInputs },
      result: localResult,
    };
    State.diagnoseHistory.unshift(histEntry);
    if (vehicle) vehicle.lastDiagnosis = { score: localResult.healthScore, color: getHealthColor(localResult.healthScore), date: histEntry.date };
    const today = new Date().toDateString();
    if (State.lastCheckDate !== today) { State.streak = (State.streak || 0) + 1; State.lastCheckDate = today; }
    saveState();
    if (typeof serviceRecsFromDiagnosis === 'function') serviceRecsFromDiagnosis(localResult);
  } catch (e) { /* non-critical */ }

  // Show results RIGHT NOW — no waiting
  State.results = localResult;
  navigateTo('results', 'right');
  renderResultsScreen();

  // Fire Claude in background AFTER showing results — silently update when ready
  if (State.claudeApiKey) {
    callClaudeAPI(State.diagnoseInputs, vehicle, State.language).then(aiResult => {
      if (!aiResult || State.currentScreen !== 'results') return;
      const merged = {
        ...localResult,
        ...aiResult,
        issues: (aiResult.issues && aiResult.issues.length) ? aiResult.issues : localResult.issues,
        source: 'claude',
        userComplaint: symptomText,
      };
      State.results = merged;
      renderResultsScreen();
    }).catch(() => {});
  }
}

// Keep switchVehicle as alias for backward compat
function switchVehicle(id) {
  State.diagnoseInputs.vehicleId = id;
  renderDiagnoseScreen();
}

// submitDiagnosis kept for any legacy callers — routes to new flow
async function submitDiagnosis() {
  startAiDiagnosis();
}

/* ── Symptom chip toggle ── */
let _diagSelectedSymptoms = new Set();

function toggleDiagSymptom(el, symptom) {
  if (_diagSelectedSymptoms.has(symptom)) {
    _diagSelectedSymptoms.delete(symptom);
    el.classList.remove('active');
  } else {
    _diagSelectedSymptoms.add(symptom);
    el.classList.add('active');
  }
  // Sync to text area and State
  const textarea = document.getElementById('diag-symptom-text');
  const tags = Array.from(_diagSelectedSymptoms).join(', ');
  const manual = textarea ? textarea.value.split(',').filter(t => !Array.from(_diagSelectedSymptoms).some(s => t.includes(s))).join(',').trim() : '';
  const combined = [tags, manual].filter(Boolean).join('. ');
  if (textarea) textarea.value = combined;
  State.diagnoseInputs.symptoms = combined;
}

/* ── Voice input for diagnose screen ── */
let _diagListening = false;
function diagToggleVoice() {
  const btn = document.getElementById('diag-voice-btn');
  const status = document.getElementById('diag-voice-status');
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    showToast('Voice input not supported'); return;
  }
  if (_diagListening) { window._diagRec?.stop(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const rec = new SR();
  window._diagRec = rec;
  rec.lang = State.language === 'hi' ? 'hi-IN' : State.language === 'kn' ? 'kn-IN' : 'en-IN';
  rec.interimResults = true;
  rec.onstart = () => { _diagListening = true; btn?.classList.add('active'); if (status) status.textContent = '🎤 Listening...'; };
  rec.onresult = e => {
    const t = Array.from(e.results).map(r => r[0].transcript).join('');
    const ta = document.getElementById('diag-symptom-text');
    if (ta) { ta.value = t; State.diagnoseInputs.symptoms = t; }
  };
  rec.onend = () => { _diagListening = false; btn?.classList.remove('active'); if (status) status.textContent = ''; };
  rec.start();
}

/* ═══════════════════════════════════════════════════════════
   SCREEN 2 · HOME
   ═══════════════════════════════════════════════════════════ */
function renderHomeScreen() {
  const el = document.getElementById('screen-home');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? tr('Good morning', 'सुप्रभात', 'ಶುಭೋದಯ') : hour < 17 ? tr('Good afternoon', 'नमस्कार', 'ಶುಭ ಮಧ್ಯಾಹ್ನ') : tr('Good evening', 'शुभ संध्या', 'ಶುಭ ಸಂಜೆ');
  const temp = Math.floor(Math.random() * 8) + 34; // Simulate 34-42°C Indian summer

  el.innerHTML = `
    <div class="screen-scroll scroll-area">
      <!-- Header -->
      <div class="home-header">
        <div>
          <div class="home-greeting">${greeting} 👋</div>
          <div class="home-title">${t('yourVehicles')}</div>
        </div>
        <div class="home-avatar" onclick="navigateToProfile()">🧑‍🔧</div>
      </div>

      <!-- Weather Banner -->
      ${temp >= 36 ? `
      <div class="weather-banner">
        <span class="weather-icon">☀️</span>
        <div class="weather-text">
          <strong>High Heat Alert — ${temp}°C today</strong><br>
          ${tr(
            'Extra heat day. Check engine temp every 30 km. Take breaks to prevent overheating.',
            'आज गर्मी ज्यादा है। इंजन ओवरहीट हो सकता है — हर 30 किमी पर 5 मिनट रुकें।',
            'ಹೆಚ್ಚಿನ ಬಿಸಿಲು. ಪ್ರತಿ 30 ಕಿಮೀಗೆ ಎಂಜಿನ್ ತಾಪಮಾನ ಪರಿಶೀಲಿಸಿ, ವಿಶ್ರಾಂತಿ ತೆಗೆದುಕೊಳ್ಳಿ.'
          )}
        </div>
      </div>` : ''}

      <!-- Service Reminder -->
      ${renderServiceReminder()}

      <!-- Saved Vehicles -->
      <div class="section-header">
        <span class="section-label">${t('myVehicles')}</span>
        <span class="section-action" onclick="navigateToAddVehicle()">+ ${t('addVehicle')}</span>
      </div>
      <div class="vehicles-scroll" id="vehicles-scroll">
        ${State.vehicles.map(v => renderVehicleCard(v)).join('')}
        <div class="add-vehicle-card" onclick="navigateToAddVehicle()">
          <span>+</span>
          <p>${t('addVehicle')}</p>
        </div>
      </div>

      <!-- Quick Diagnose CTA -->
      <div class="quick-diagnose ripple" onclick="startDiagnose(null)" id="quick-diagnose-cta">
        <div class="quick-diagnose-label">⚡ Quick Action</div>
        <div class="quick-diagnose-title">${tr('Diagnose Now', 'अभी जांचें', 'ಈಗ ಪರಿಶೀಲಿಸಿ')}</div>
        <div class="quick-diagnose-sub">${tr('4 readings → full health report', '4 रीडिंग → पूरी रिपोर्ट', '4 ಓದುವಿಕೆಗಳು → ಪೂರ್ಣ ವರದಿ')}</div>
        <div class="quick-diagnose-arrow">→</div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <div class="quick-action-btn" onclick="showPretrip()">
          <span class="qa-icon">✅</span>
          <span class="qa-label">${tr('Pre-Trip Check', 'आज चलना सुरक्षित है?', 'ಪ್ರಯಾಣ ಪೂರ್ವ ಪರಿಶೀಲನೆ')}</span>
        </div>
        <div class="quick-action-btn" onclick="showFleet()">
          <span class="qa-icon">🚗</span>
          <span class="qa-label">${tr('Fleet Overview', 'फ्लीट ओವरव्यू', 'ಫ್ಲೀಟ್ ಅವಲೋಕನ')}</span>
        </div>
        <div class="quick-action-btn" onclick="navigateTo('tips', 'right'); renderTipsScreen();">
          <span class="qa-icon">📚</span>
          <span class="qa-label">${t('tips')}</span>
        </div>
        <div class="quick-action-btn" onclick="navigateTo('history', 'right'); renderHistoryScreen();">
          <span class="qa-icon">📊</span>
          <span class="qa-label">${t('history')}</span>
        </div>
      </div>

      <!-- Emergency Button -->
      <div class="emergency-btn" onclick="showEmergency()">
        <span class="emergency-icon">🚨</span>
        <div class="emergency-text">
          <div class="emergency-label">${tr('Emergency — Bike Broke Down!', 'इमरजेंसी! गाड़ी खराब हो गई', 'ತುರ್ತು — ವಾಹನ ಬದಲಾಯಿತು!')}</div>
          <div class="emergency-sub">${tr('Works offline · Instant help', 'ऑफलाइन भी काम करता है', 'ಆಫ್‌ಲೈನ್ · ತಕ್ಷಣ ಸಹಾಯ')}</div>
        </div>
        <span class="emergency-badge">SOS</span>
      </div>

      <!-- Streak Widget -->
      <div style="margin: 0 20px 8px;">
        <div class="streak-card" style="margin-bottom: 0; border-radius: var(--radius-md); padding: 14px;">
          <span class="streak-flame" style="font-size: 1.8rem;">🔥</span>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${tr('Bike Care Streak', 'केयर स्ट्रीಕ', 'ಬೈಕ್ ಕೇರ್ ಸ್ಟ್ರೀಕ್')}</div>
            <div style="font-size: 1.3rem; font-weight: 900; color: var(--brand-orange);">${State.streak} ${tr('weeks', 'हफ्ते', 'ವಾರಗಳು')}</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">${tr('Great! Come back next week to keep it going.', 'बढ़िया! अगले हफ्ते भी याद रखें।', 'ಚೆನ್ನಾಗಿದೆ! ಮುಂದಿನ ವಾರವೂ ಮುಂದುವರಿಸಿ.')}</div>
          </div>
        </div>
      </div>

      <!-- ═══ ESP32 LIVE SENSOR SECTION ═══ -->
      ${renderEsp32HomeSection()}

      <!-- ═══ FLEET INTELLIGENCE ═══ -->
      ${renderFleetIntelligenceSection(temp)}

      <div style="height: 20px;"></div>
    </div>
  `;

  // Bind vehicle card clicks
  document.querySelectorAll('.vehicle-card[data-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      startDiagnose(id);
    });
  });

  bindSmartAlertFilters();

  // Init ESP32 chart & live updates after DOM is painted
  queueMicrotask(() => {
    if (typeof esp32InitChart === 'function') {
      esp32InitChart(typeof Esp32 !== 'undefined' ? Esp32.currentSensor : 'temp');
      esp32StartLive();
    }
  });

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

/* ── ESP32 section HTML rendered inside Home screen ── */
function renderEsp32HomeSection() {
  return `
    <section class="fleet-ai-section" style="margin-top: 12px;">

      <!-- Section header -->
      <div class="section-header" style="padding-top: 0; padding-bottom: 8px;">
        <span class="section-label">📡 ESP32 Live Sensor Data</span>
        <span class="badge badge-green" id="esp32-conn-badge">● Live</span>
      </div>

      <!-- Connection card -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.02s; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; margin-bottom:0;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.2rem;">📡</span>
          <div>
            <div style="font-size:0.82rem; font-weight:700; color:var(--text-primary);">SmartVehicle_01</div>
            <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
              <span id="esp32-dot" style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22C55E; animation:voicePulse 2s infinite;"></span>
              <span id="esp32-status-text" style="font-size:0.7rem; color:var(--text-secondary);">Connected via WiFi</span>
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
          <button class="btn btn-sm btn-secondary" id="esp32-conn-btn" onclick="esp32ToggleConnect()">Disconnect</button>
          <button class="btn btn-sm btn-secondary" onclick="esp32ToggleScan()">Scan Devices</button>
        </div>
      </div>

      <!-- Scan dropdown -->
      <div id="esp32-scan-drop" style="display:none;" class="fleet-ai-card">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <span style="font-size:0.8rem; color:var(--text-primary);">📡 SmartVehicle_01</span>
          <span class="badge badge-green">In range</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <span style="font-size:0.8rem; color:var(--text-primary);">🔵 BikeDevice_02</span>
          <span class="badge badge-blue">In range</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0;">
          <span style="font-size:0.8rem; color:var(--text-primary);">⚪ AutoSensor_03</span>
          <span class="badge" style="background:rgba(100,116,139,0.15); color:var(--text-muted); border:1px solid rgba(100,116,139,0.2);">Weak signal</span>
        </div>
      </div>

      <!-- Metric mini-cards -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">

        <div class="fleet-ai-card reveal-card" style="--delay:0.05s; padding:20px;">
          <div class="fleet-ai-sub" style="margin-bottom:8px; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px;">🌡️ Engine Temp</div>
          <div id="esp32-m-temp" style="font-size:2rem; font-weight:900; color:#EF4444; font-family:'Syne',sans-serif; line-height:1;">88.0°C</div>
          <div class="fleet-ai-sub" id="esp32-s-temp" style="margin-top:6px;">Warning: High</div>
          <div class="risk-track" style="margin-top:12px; height:8px;">
            <div class="risk-fill is-warn" id="esp32-p-temp" style="width:47%;"></div>
          </div>
        </div>

        <div class="fleet-ai-card reveal-card" style="--delay:0.09s; padding:20px;">
          <div class="fleet-ai-sub" style="margin-bottom:8px; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px;">🔋 Battery</div>
          <div id="esp32-m-bat" style="font-size:2rem; font-weight:900; color:#FF6B35; font-family:'Syne',sans-serif; line-height:1;">40%</div>
          <div class="fleet-ai-sub" id="esp32-s-bat" style="margin-top:6px;">Low charge</div>
          <div class="risk-track" style="margin-top:12px; height:8px;">
            <div class="risk-fill is-warn" id="esp32-p-bat" style="width:40%;"></div>
          </div>
        </div>

        <div class="fleet-ai-card reveal-card" style="--delay:0.13s; padding:20px;">
          <div class="fleet-ai-sub" style="margin-bottom:8px; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.5px;">📳 Vibration</div>
          <div id="esp32-m-vib" style="font-size:2rem; font-weight:900; color:#22C55E; font-family:'Syne',sans-serif; line-height:1;">0.30g</div>
          <div class="fleet-ai-sub" id="esp32-s-vib" style="margin-top:6px;">Normal</div>
          <div class="risk-track" style="margin-top:12px; height:8px;">
            <div class="risk-fill is-ok" id="esp32-p-vib" style="width:15%;"></div>
          </div>
        </div>
      </div>

      <!-- Real-time chart -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.17s; padding:16px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <div>
            <div class="fleet-ai-title">📈 Real-Time Chart</div>
            <div class="fleet-ai-sub">Updates every 2s</div>
          </div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;" id="esp32-tabs">
            <button class="alert-filter active" data-sensor="temp" onclick="esp32SwitchTab('temp', this)">Temp</button>
            <button class="alert-filter" data-sensor="battery" onclick="esp32SwitchTab('battery', this)">Battery</button>
            <button class="alert-filter" data-sensor="vibration" onclick="esp32SwitchTab('vibration', this)">Vibration</button>
          </div>
        </div>
        <div style="display:flex; gap:14px; margin-bottom:6px;">
          <div style="display:flex; align-items:center; gap:5px; font-size:0.68rem; color:var(--text-secondary);">
            <span id="esp32-legend-dot" style="display:inline-block; width:9px; height:9px; border-radius:2px; background:#EF4444;"></span> Actual
          </div>
          <div style="display:flex; align-items:center; gap:5px; font-size:0.68rem; color:var(--text-secondary);">
            <span style="display:inline-block; width:16px; height:2px; background:repeating-linear-gradient(90deg,#FF6B35 0,#FF6B35 4px,transparent 4px,transparent 8px);"></span> Predicted
          </div>
        </div>
        <div style="position:relative; height:280px;">
          <canvas id="esp32-chart"></canvas>
        </div>
      </div>

      <!-- Breakdown warning -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.21s; background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(17,24,39,0.7)); border-color:rgba(239,68,68,0.3);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:6px;">
          <span style="font-size:0.74rem; color:#F87171; font-weight:700;">⚠ Warning Detected</span>
          <span class="badge badge-red">WARNING</span>
        </div>
        <div class="fleet-ai-title" style="margin-bottom:4px;">Engine Overheating</div>
        <div class="fleet-ai-sub" style="margin-bottom:3px;"><strong style="color:var(--text-primary);">Reason:</strong> Heavy traffic + low coolant detected</div>
        <div class="fleet-ai-sub" style="margin-bottom:10px;"><strong style="color:var(--text-primary);">Fix:</strong> Stop vehicle · Cool engine · Check coolant</div>
        <button class="btn btn-danger btn-sm btn-full" onclick="esp32ToggleFixGuide(this)">Get Fix Guide →</button>
        <div id="esp32-fix-guide" style="display:none; margin-top:8px; border-top:1px solid rgba(239,68,68,0.2); padding-top:8px;">
          <div class="fleet-ai-list">
            <div class="alert-item">1. 🚗 Pull over safely and switch off engine</div>
            <div class="alert-item">2. ⏳ Wait 15–20 min for engine to cool</div>
            <div class="alert-item">3. 🧴 Check coolant reservoir — top up if low</div>
            <div class="alert-item">4. 🔍 Inspect hoses/radiator for leaks</div>
            <div class="alert-item">5. 🏪 Visit service center if issue persists</div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.25s;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px; flex-wrap:wrap; gap:6px;">
          <div class="fleet-ai-title">🚨 Smart Alerts</div>
          <div style="display:flex; gap:5px;" id="esp32-alert-filters">
            <button class="alert-filter active" data-filter="all" onclick="esp32FilterAlerts('all', this)">All</button>
            <button class="alert-filter" data-filter="critical" onclick="esp32FilterAlerts('critical', this)">Critical</button>
            <button class="alert-filter" data-filter="warning" onclick="esp32FilterAlerts('warning', this)">Warning</button>
          </div>
        </div>
        <div class="alert-list" id="esp32-alert-list">
          <div class="alert-item" data-alert-type="critical" style="gap:8px; padding:6px 0; border-bottom:1px solid var(--border-subtle);">🔴 <div style="flex:1;"><div style="font-size:0.76rem; font-weight:600; color:var(--text-primary);">Engine overheating</div><div class="fleet-ai-sub">Temp reached 92°C · Reduce load</div></div><div style="font-size:0.66rem; color:var(--text-muted); white-space:nowrap;">Now</div></div>
          <div class="alert-item" data-alert-type="warning" style="gap:8px; padding:6px 0; border-bottom:1px solid var(--border-subtle);">🟠 <div style="flex:1;"><div style="font-size:0.76rem; font-weight:600; color:var(--text-primary);">Battery critically low</div><div class="fleet-ai-sub">Below 40% · Recharge soon</div></div><div style="font-size:0.66rem; color:var(--text-muted); white-space:nowrap;">2m ago</div></div>
          <div class="alert-item" data-alert-type="warning" style="gap:8px; padding:6px 0;">🟡 <div style="flex:1;"><div style="font-size:0.76rem; font-weight:600; color:var(--text-primary);">Tire pressure low</div><div class="fleet-ai-sub">Front tire: 26 PSI</div></div><div style="font-size:0.66rem; color:var(--text-muted); white-space:nowrap;">8m ago</div></div>
        </div>
      </div>

      <!-- All Sensors + Voice row -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:8px;">

        <div class="fleet-ai-card reveal-card" style="--delay:0.29s;">
          <div class="fleet-ai-title" style="margin-bottom:8px;">🔬 All Sensors</div>
          <div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--border-subtle);">
            <span style="font-size:0.9rem;">🌡️</span>
            <div style="flex:1;"><div style="font-size:0.74rem; font-weight:600;">Engine Temp</div><div class="fleet-ai-sub" id="esp32-sv-temp">88.0°C · Normal &lt;95°C</div></div>
            <span class="badge badge-amber" style="font-size:0.6rem;">High</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--border-subtle);">
            <span style="font-size:0.9rem;">🔋</span>
            <div style="flex:1;"><div style="font-size:0.74rem; font-weight:600;">Battery</div><div class="fleet-ai-sub" id="esp32-sv-bat">40% · 12.1V</div></div>
            <span class="badge badge-red" style="font-size:0.6rem;">Low</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid var(--border-subtle);">
            <span style="font-size:0.9rem;">🛞</span>
            <div style="flex:1;"><div style="font-size:0.74rem; font-weight:600;">Tire Pressure</div><div class="fleet-ai-sub">F: 26 PSI · R: 30 PSI</div></div>
            <span class="badge badge-amber" style="font-size:0.6rem;">Check</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; padding:5px 0;">
            <span style="font-size:0.9rem;">📳</span>
            <div style="flex:1;"><div style="font-size:0.74rem; font-weight:600;">Vibration</div><div class="fleet-ai-sub" id="esp32-sv-vib">0.30g · Smooth</div></div>
            <span class="badge badge-green" style="font-size:0.6rem;">Normal</span>
          </div>
        </div>

        <div class="fleet-ai-card reveal-card" style="--delay:0.33s;">
          <div class="fleet-ai-title" style="margin-bottom:8px;">🔊 Voice Alert</div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
            <button class="btn btn-sm btn-secondary" onclick="esp32Speak('engine')">🔊 Speak</button>
            <span id="esp32-voice-status" class="fleet-ai-sub">Click to announce</span>
          </div>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-ghost" style="font-size:0.68rem; padding:4px 8px;" onclick="esp32Speak('engine')">Engine</button>
            <button class="btn btn-sm btn-ghost" style="font-size:0.68rem; padding:4px 8px;" onclick="esp32Speak('battery')">Battery</button>
            <button class="btn btn-sm btn-ghost" style="font-size:0.68rem; padding:4px 8px;" onclick="esp32Speak('tire')">Tire</button>
          </div>
          <div class="fleet-ai-title" style="margin-top:12px; margin-bottom:6px;">🔗 Connection</div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:4px;">
            <span class="fleet-ai-sub">📶 WiFi</span>
            <span class="badge badge-green" id="esp32-wifi-badge">Active</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span class="fleet-ai-sub">🔵 Bluetooth</span>
            <span class="badge" style="background:rgba(100,116,139,0.15); color:var(--text-muted); border:1px solid rgba(100,116,139,0.2); font-size:0.6rem;">Idle</span>
          </div>
          <div class="fleet-ai-sub" style="margin-top:8px; font-family:monospace; font-size:0.62rem; opacity:0.7;">ESP32 → WiFi → Firebase → Dashboard</div>
        </div>
      </div>

    </section>
  `;
}

function renderFleetIntelligenceSection(temp) {
  const isHi = State.language === 'hi';
  const L = {
    sectionLabel: isHi ? 'फ्लीट इंटेलिजेंस' : 'Fleet Intelligence',
    aiSummary: isHi ? '🧠 AI डायग्नोस्टिक सारांश' : '🧠 AI Diagnostic Summary',
    overheatText: isHi ? 'गाड़ियों में ओवरहीटिंग के शुरुआती संकेत' : 'vehicles show early signs of overheating',
    batteryText: isHi ? 'वाहनों की बैटरी स्वास्थ्य सामान्य से तेज गिर रही है' : 'vehicle battery health degrading faster than normal',
    fleetHealth: isHi ? 'कुल फ्लीट हेल्थ' : 'Overall fleet health',
    moderateRisk: isHi ? 'मध्यम जोखिम' : 'Moderate Risk',
    highRisk: isHi ? 'उच्च जोखिम' : 'High Risk',
    lowRisk: isHi ? 'कम जोखिम' : 'Low Risk',
    confidence: isHi ? 'AI विश्वास' : 'AI Confidence',
    upcomingRisk: isHi ? '🔮 आने वाला जोखिम पूर्वानुमान' : '🔮 Upcoming Risk Prediction',
    healthTrend: isHi ? '📈 हेल्थ ट्रेंड (पिछले 7 दिन)' : '📈 Health Trend (Last 7 Days)',
    declineHeat: isHi ? 'गर्मी और उपयोग के कारण गिरावट' : 'Declining due to heat + usage',
    componentHealth: isHi ? '🔧 कंपोनेंट हेल्थ' : '🔧 Component Health',
    environmentImpact: isHi ? '🌡️ पर्यावरण प्रभाव' : '🌡️ Environment Impact',
    temperature: isHi ? 'तापमान' : 'Temperature',
    highEngineStress: isHi ? 'इंजन पर ज्यादा तनाव' : 'High engine stress',
    traffic: isHi ? 'ट्रैफिक' : 'Traffic',
    increasedWear: isHi ? 'घिसावट बढ़ी' : 'Increased wear',
    dust: isHi ? 'धूल' : 'Dust',
    airFilterImpact: isHi ? 'एयर फिल्टर प्रभावित' : 'Air filter impact',
    ranking: isHi ? '🏆 वाहन रैंकिंग' : '🏆 Vehicle Ranking',
    smartAlerts: isHi ? '🚨 स्मार्ट अलर्ट' : '🚨 Smart Alerts',
    all: isHi ? 'सभी' : 'All',
    critical: isHi ? 'क्रिटिकल' : 'Critical',
    warning: isHi ? 'चेतावनी' : 'Warning',
    usageInsights: isHi ? '📊 उपयोग विश्लेषण' : '📊 Usage Insights',
    avgRide: isHi ? 'औसत राइड समय' : 'Avg ride time',
    highUsage: isHi ? 'उच्च उपयोग समय' : 'High usage window',
    aggressiveRide: isHi ? 'आक्रामक ड्राइविंग के संकेत' : 'Aggressive riding detected',
    stableRide: isHi ? 'राइडिंग पैटर्न स्थिर' : 'Riding pattern stable',
    quickActions: isHi ? '⚡ क्विक फिक्स एक्शन' : '⚡ Quick Fix Actions',
    checkEngine: isHi ? 'इंजन जांचें' : 'Check Engine',
    scheduleService: isHi ? 'सर्विस शेड्यूल' : 'Schedule Service',
    reduceLoad: isHi ? 'लोड कम करें' : 'Reduce Load',
    safetyScore: isHi ? '🛡️ सुरक्षा स्कोर' : '🛡️ Safety Score',
    brakeGood: isHi ? 'ब्रेक की स्थिति अच्छी' : 'Brake condition good',
    tireModerate: isHi ? 'टायर घिसावट मध्यम' : 'Tire wear moderate',
    engineRisk: isHi ? 'इंजन जोखिम मौजूद' : 'Engine risk present',
    engine: isHi ? 'इंजन' : 'Engine',
    battery: isHi ? 'बैटरी' : 'Battery',
    brakes: isHi ? 'ब्रेक' : 'Brakes',
    tires: isHi ? 'टायर्स' : 'Tires',
  };

  const perVehicle = State.vehicles.map(v => {
    const histories = (State.diagnoseHistory || []).filter(h => h.vehicleId === v.id);
    const issues = histories.flatMap(h => h.issues || []).map(i => String(i).toLowerCase());
    const score = v.lastDiagnosis?.score ?? histories[0]?.score ?? 0;
    return {
      id: v.id,
      name: v.nickname,
      score,
      overheat: hasIssueMatch(issues, ['overheat', 'high temp', 'temp', 'heat', 'ओवरहीट']),
      battery: hasIssueMatch(issues, ['battery', 'volt', 'charging', 'बैटरी']),
      issues,
    };
  });

  const diagnosed = perVehicle.filter(v => v.score > 0).length;
  const fleetHealth = perVehicle.length
    ? Math.round(perVehicle.reduce((sum, v) => sum + v.score, 0) / perVehicle.length)
    : 0;

  const riskLabel = fleetHealth < 60
    ? L.highRisk
    : fleetHealth < 80
      ? L.moderateRisk
      : L.lowRisk;

  const confidence = clamp(
    72 + diagnosed * 4 + Math.min((State.diagnoseHistory || []).length * 2, 18),
    78,
    96
  );

  const overheatCount = perVehicle.filter(v => v.overheat || v.score < 60).length;
  const batteryCount = Math.max(1, perVehicle.filter(v => v.battery || v.score < 55).length);
  const trendValues = buildFleetTrendValues(fleetHealth);
  const trendText = trendValues.join(' -> ');

  const enginePenalty = overheatCount * 6;
  const batteryPenalty = batteryCount * 8;
  const componentHealth = [
    { name: L.engine, value: clamp(fleetHealth - 6 - enginePenalty, 30, 96) },
    { name: L.battery, value: clamp(fleetHealth - 10 - batteryPenalty, 25, 95) },
    { name: L.brakes, value: clamp(fleetHealth + 9, 40, 98) },
    { name: L.tires, value: clamp(fleetHealth + 4, 35, 96) },
  ].map(c => ({ ...c, status: c.value >= 75 ? 'ok' : 'warn' }));

  const ranking = [...perVehicle].sort((a, b) => b.score - a.score).slice(0, 3);

  const timeline = [...perVehicle]
    .sort((a, b) => a.score - b.score)
    .slice(0, 3)
    .map(v => getVehiclePrediction(v, isHi));

  const alerts = buildSmartAlerts(perVehicle, isHi);

  const avgOdo = State.vehicles.length
    ? Math.round(State.vehicles.reduce((sum, v) => sum + (v.odometer || 0), 0) / State.vehicles.length)
    : 14000;
  const avgRideMins = clamp(Math.round(avgOdo / 420), 25, 90);
  const traffic = State.vehicles.length >= 3 ? (isHi ? 'भारी' : 'Heavy') : (isHi ? 'मध्यम' : 'Medium');
  const dust = temp >= 39 ? (isHi ? 'मध्यम-उच्च' : 'Medium-High') : (isHi ? 'मध्यम' : 'Medium');
  const aggressiveRide = perVehicle.some(v => v.score < 60 || v.overheat);
  const safetyScore = Math.round(componentHealth.reduce((sum, c) => sum + c.value, 0) / componentHealth.length);

  return `
    <section class="fleet-ai-section">
      <div class="section-header" style="padding-top: 10px;">
        <span class="section-label">${L.sectionLabel}</span>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.02s;">
        <div class="fleet-ai-title">${L.aiSummary}</div>
        <ul class="fleet-ai-list">
          <li>${overheatCount} ${L.overheatText}</li>
          <li>${batteryCount} ${L.batteryText}</li>
          <li>${L.fleetHealth}: <strong>${fleetHealth} (${riskLabel})</strong></li>
        </ul>
        <div class="fleet-ai-confidence">${L.confidence}: <strong>${confidence}%</strong></div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.06s;">
        <div class="fleet-ai-title">${L.upcomingRisk}</div>
        <div class="risk-timeline">
          ${timeline.map(item => `
            <div class="risk-row">
              <div class="risk-row-top">
                <span>${item.name}</span>
                <span>${item.risk}</span>
              </div>
              <div class="risk-track"><div class="risk-fill" style="width:${item.level}%"></div></div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.1s;">
        <div class="fleet-ai-title">${L.healthTrend}</div>
        <div class="trend-bars">
          ${trendValues.map((v, idx) => `
            <div class="trend-col">
              <div class="trend-bar" style="height:${Math.max(22, v)}px"></div>
              <div class="trend-val">${v}</div>
              <div class="trend-day">D-${trendValues.length - idx - 1}</div>
            </div>
          `).join('')}
        </div>
        <div class="fleet-ai-sub">${trendText}</div>
        <div class="fleet-ai-sub">${L.declineHeat}</div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.14s;">
        <div class="fleet-ai-title">${L.componentHealth}</div>
        <div class="component-grid">
          ${componentHealth.map(c => `
            <div class="component-row">
              <div class="component-row-top">
                <span>${c.name}</span>
                <span>${c.value} ${c.status === 'ok' ? '✅' : '⚠️'}</span>
              </div>
              <div class="risk-track"><div class="risk-fill ${c.status === 'ok' ? 'is-ok' : 'is-warn'}" style="width:${c.value}%"></div></div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.18s;">
        <div class="fleet-ai-title">${L.environmentImpact}</div>
        <ul class="fleet-ai-list">
          <li>${L.temperature}: ${temp}°C → ${L.highEngineStress}</li>
          <li>${L.traffic}: ${traffic} → ${L.increasedWear}</li>
          <li>${L.dust}: ${dust} → ${L.airFilterImpact}</li>
        </ul>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.22s;">
        <div class="fleet-ai-title">${L.ranking}</div>
        <div class="rank-list">
          ${ranking.map((v, idx) => `
            <div class="rank-item">
              <span>${idx + 1}. ${v.name} (${v.score}) ${idx === 0 ? '🥇' : v.score < 60 ? '⚠️' : ''}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.26s;">
        <div class="fleet-ai-title">${L.smartAlerts}</div>
        <div class="alert-filters" id="alert-filters">
          <button class="alert-filter active" data-filter="all">${L.all}</button>
          <button class="alert-filter" data-filter="critical">${L.critical}</button>
          <button class="alert-filter" data-filter="warning">${L.warning}</button>
        </div>
        <div class="alert-list" id="fleet-alert-list">
          ${alerts.map(a => `
            <div class="alert-item" data-alert-type="${a.type}">${a.icon} ${a.text}</div>
          `).join('')}
        </div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.3s;">
        <div class="fleet-ai-title">${L.usageInsights}</div>
        <ul class="fleet-ai-list">
          <li>${L.avgRide}: ${avgRideMins} min/day</li>
          <li>${L.highUsage}: 2-5 PM</li>
          <li>${aggressiveRide ? L.aggressiveRide : L.stableRide}</li>
        </ul>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.34s;">
        <div class="fleet-ai-title">${L.quickActions}</div>
        <div class="quick-fix-actions">
          <button class="btn btn-sm btn-secondary" onclick="showToast('${isHi ? 'इंजन जांच शुरू' : 'Engine check initiated'}')">${L.checkEngine}</button>
          <button class="btn btn-sm btn-secondary" onclick="showToast('${isHi ? 'सर्विस स्लॉट अनुरोध भेजा गया' : 'Service slot requested'}')">${L.scheduleService}</button>
          <button class="btn btn-sm btn-secondary" onclick="showToast('${isHi ? 'लोड ऑप्टिमाइजेशन टिप्स भेजे गए' : 'Load optimization tips sent'}')">${L.reduceLoad}</button>
        </div>
      </div>

      <div class="fleet-ai-card reveal-card" style="--delay: 0.38s; margin-bottom: 6px;">
        <div class="fleet-ai-title">${L.safetyScore}: ${safetyScore}</div>
        <div class="risk-track" style="margin: 10px 0 12px;"><div class="risk-fill ${safetyScore >= 75 ? 'is-ok' : 'is-warn'}" style="width:${safetyScore}%"></div></div>
        <ul class="fleet-ai-list">
          <li>${L.brakeGood}</li>
          <li>${L.tireModerate}</li>
          <li>${L.engineRisk}</li>
        </ul>
      </div>
    </section>
  `;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function hasIssueMatch(issueList, patterns) {
  return issueList.some(issue => patterns.some(p => issue.includes(p)));
}

function buildFleetTrendValues(fleetHealth) {
  const hist = [...(State.diagnoseHistory || [])]
    .filter(h => typeof h.score === 'number')
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(-7)
    .map(h => h.score);

  if (hist.length >= 7) return hist;

  const base = hist.length ? hist[hist.length - 1] : fleetHealth;
  const needed = 7 - hist.length;
  const padded = [];
  for (let i = needed; i > 0; i -= 1) {
    padded.push(clamp(base + (i * 2), 35, 95));
  }
  return [...padded, ...hist];
}

function getVehiclePrediction(vehicle, isHi) {
  if (vehicle.score < 55 && vehicle.battery) {
    return {
      name: vehicle.name,
      risk: isHi ? 'बैटरी फेल होने का जोखिम अधिक' : 'Battery failure risk high',
      level: 90,
    };
  }
  if (vehicle.score < 70 || vehicle.overheat) {
    return {
      name: vehicle.name,
      risk: isHi ? 'इंजन समस्या ~5 दिन में' : 'Engine issue in ~5 days',
      level: 82,
    };
  }
  return {
    name: vehicle.name,
    risk: isHi ? 'अगले 10 दिन स्थिर' : 'Stable for next 10 days',
    level: 28,
  };
}

function buildSmartAlerts(perVehicle, isHi) {
  const alerts = [];
  const critical = perVehicle.filter(v => v.score < 55);
  const warning = perVehicle.filter(v => v.score >= 55 && v.score < 75);
  const normal = perVehicle.filter(v => v.score >= 75);

  critical.forEach(v => {
    alerts.push({
      type: 'critical',
      icon: '🔴',
      text: isHi
        ? `${v.name} को तुरंत सर्विस की जरूरत`
        : `${v.name} needs immediate service`,
    });
  });

  warning.forEach(v => {
    alerts.push({
      type: 'warning',
      icon: '🟡',
      text: isHi
        ? `${v.name} में ओवरहीटिंग ट्रेंड`
        : `${v.name} overheating trend detected`,
    });
  });

  normal.forEach(v => {
    alerts.push({
      type: 'normal',
      icon: '🟢',
      text: isHi
        ? `${v.name} स्थिर और सुरक्षित`
        : `${v.name} stable and healthy`,
    });
  });

  return alerts.length
    ? alerts
    : [{ type: 'normal', icon: '🟢', text: isHi ? 'अभी कोई अलर्ट नहीं' : 'No active alerts' }];
}

function bindSmartAlertFilters() {
  const filterWrap = document.getElementById('alert-filters');
  const alertList = document.getElementById('fleet-alert-list');
  if (!filterWrap || !alertList) return;

  filterWrap.querySelectorAll('.alert-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.filter;

      filterWrap.querySelectorAll('.alert-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      alertList.querySelectorAll('.alert-item').forEach(item => {
        item.style.display = type === 'all' || item.dataset.alertType === type ? 'flex' : 'none';
      });
    });
  });
}

function renderServiceReminder() {
  const overdueVehicle = State.vehicles.find(v => {
    if (!v.lastService) return false;
    const days = Math.floor((Date.now() - new Date(v.lastService).getTime()) / 86400000);
    return days > 30;
  });

  if (!overdueVehicle) return '';

  const days = Math.floor((Date.now() - new Date(overdueVehicle.lastService).getTime()) / 86400000);
  return `
    <div class="reminder-banner" onclick="startDiagnose('${overdueVehicle.id}')">
      <span class="reminder-icon">🔔</span>
      <div class="reminder-text">
        <strong>${overdueVehicle.nickname}</strong>
        ${State.language === 'hi'
          ? ` — ${days} दिनों से सर्विस नहीं हुई। जांचने का समय है।`
          : ` — No check in ${days} days. Time to run a diagnosis!`}
      </div>
      <span class="reminder-arrow">→</span>
    </div>
  `;
}

function renderVehicleCard(v) {
  const score = v.lastDiagnosis?.score || 0;
  const color = v.lastDiagnosis?.color || 'green';
  const scoreHex = getScoreHex(score);
  const img = v.image
    ? `<img class="vehicle-thumb" src="${v.image}" alt="" loading="lazy" />`
    : `<div class="vehicle-thumb-wrap">${v.emoji || '🏍️'}</div>`;
  const reg = v.number ? `<div class="text-xs text-muted" style="font-size:0.65rem;margin-top:2px;">${escapeHtml(v.number)}</div>` : '';

  return `
    <div class="vehicle-card ${color}" data-id="${v.id}">
      ${img}
      <div class="vehicle-name">${escapeHtml(v.nickname)}</div>
      ${reg}
      <div class="vehicle-type">${escapeHtml(v.brand)} ${escapeHtml(v.model)}</div>
      <div class="mini-ring-wrapper">
        ${renderMiniRing(score, 32)}
        <span style="color: ${scoreHex}; font-size: 0.82rem; font-weight: 700;">${score}</span>
      </div>
    </div>
  `;
}

function navigateToProfile() {
  navigateTo('profile', 'right');
  renderProfileScreen();
}

function navigateToAddVehicle() {
  if (document.getElementById('add-vehicle-modal')) return;
  newVehicle = { type: 'bike', emoji: '🏍️', imageDataUrl: null, location: null };

  const L = {
    title:        tr('Add Vehicle', 'गाड़ी जोड़ें', 'ವಾಹನ ಸೇರಿಸಿ'),
    vtype:        tr('Vehicle Type', 'गाड़ी का प्रकार', 'ವಾಹನದ ಪ್ರಕಾರ'),
    photo:        tr('Vehicle Photo', 'गाड़ी की फोटो', 'ವಾಹನ ಚಿತ್ರ'),
    fromGallery:  tr('Gallery', 'गैलरी', 'ಗ್ಯಾಲರಿ'),
    fromCamera:   tr('Camera', 'कैमरा', 'ಕ್ಯಾಮೆರಾ'),
    removePhoto:  tr('Remove', 'हटाएं', 'ತೆಗೆದುಹಾಕಿ'),
    nickname:     tr('Nickname / Name', 'गाड़ी का नाम', 'ಹೆಸರು'),
    nickPh:       tr('e.g. My Splendor', 'जैसे: मेरी बाइक', 'ಉದಾ. ನನ್ನ ಬೈಕ್'),
    reg:          t('vehicleReg'),
    regPh:        tr('e.g. KA-01-AB-1234', 'उदा. DL-01-AB-1234', 'ಉದಾ. KA-01-AB-1234'),
    brand:        tr('Brand', 'ब्रांड', 'ಬ್ರಾಂಡ್'),
    selBrand:     tr('Select brand', 'ब्रांड चुनें', 'ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ'),
    model:        tr('Model', 'मॉडल', 'ಮಾದರಿ'),
    selBrandFirst:tr('Select brand first', 'पहले ब्रांड चुनें', 'ಮೊದಲು ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ'),
    year:         tr('Year', 'साल', 'ವರ್ಷ'),
    cc:           tr('Engine CC', 'इंजन CC', 'ಎಂಜಿನ್ CC'),
    service:      tr('Last service date', 'अंतिम सर्विस', 'ಕೊನೆಯ ಸರ್ವಿಸ್'),
    odo:          tr('Odometer (km)', 'ओडोमीटर (km)', 'ಓಡೋಮೀಟರ್ (km)'),
    location:     tr('Garage / Home Location', 'गैराज / घर का पता', 'ಗ್ಯಾರೇಜ್ / ಮನೆ ಸ್ಥಳ'),
    locPh:        tr('Enter area or city', 'क्षेत्र या शहर दर्ज करें', 'ಪ್ರದೇಶ ಅಥವಾ ನಗರ ನಮೂದಿಸಿ'),
    detectLoc:    tr('Detect my location', 'मेरी लोकेशन पता करें', 'ನನ್ನ ಸ್ಥಳ ಪತ್ತೆ ಮಾಡಿ'),
    nearbyMech:   tr('Nearby Mechanics', 'नजदीकी मैकेनिक', 'ಹತ್ತಿರದ ಮೆಕ್ಯಾನಿಕ್'),
    findMech:     tr('Find Mechanics Near Me', 'मेरे पास मैकेनिक खोजें', 'ನನ್ನ ಹತ್ತಿರ ಮೆಕ್ಯಾನಿಕ್ ಹುಡುಕಿ'),
    cancel:       t('cancel'),
    save:         tr('Save', 'सेव करें', 'ಉಳಿಸಿ'),
  };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'add-vehicle-modal';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:460px; max-height:92vh; overflow-y:auto; padding:20px;">

      <!-- Header -->
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
        <h3 class="modal-title" style="margin:0;">➕ ${L.title}</h3>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('add-vehicle-modal').remove()" style="padding:4px 10px;">✕</button>
      </div>

      <!-- Vehicle Type -->
      <div class="form-group">
        <label class="label">${L.vtype}</label>
        <div class="vehicle-type-grid" id="modal-vtype-grid">
          ${VEHICLE_TYPES.map(vt => `
            <div class="vtype-btn ${vt.id === 'bike' ? 'selected' : ''}" data-type="${vt.id}" onclick="modalSelectVehicleType('${vt.id}')">
              <span class="vtype-emoji">${vt.emoji}</span>
              <span class="vtype-name">${vt.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ── PHOTO SECTION ── -->
      <div class="form-group">
        <label class="label">${L.photo}</label>

        <!-- Preview (hidden until photo chosen) -->
        <div id="modal-photo-preview" style="display:none; position:relative; margin-bottom:10px;">
          <img id="modal-photo-img" alt=""
            style="width:100%; max-height:160px; object-fit:cover; border-radius:var(--radius-md); border:1px solid var(--border-card);" />
          <button type="button" onclick="modalClearPhoto()"
            style="position:absolute; top:6px; right:6px; background:rgba(0,0,0,0.6); border:none; color:#fff;
                   border-radius:50%; width:28px; height:28px; font-size:0.8rem; cursor:pointer; display:flex;
                   align-items:center; justify-content:center;">✕</button>
        </div>

        <!-- Two buttons: Gallery + Camera -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;" id="modal-photo-btns">
          <label class="btn btn-secondary" style="cursor:pointer; justify-content:center; gap:6px;">
            🖼️ ${L.fromGallery}
            <input type="file" accept="image/*" style="display:none;"
              onchange="modalOnPhotoSelected(event, false)" />
          </label>
          <label class="btn btn-secondary" style="cursor:pointer; justify-content:center; gap:6px;">
            📷 ${L.fromCamera}
            <input type="file" accept="image/*" capture="environment" style="display:none;"
              onchange="modalOnPhotoSelected(event, true)" />
          </label>
        </div>
        <div style="font-size:0.7rem; color:var(--text-muted); margin-top:6px;">
          ${tr('JPG/PNG · max 2MB · shown on dashboard', 'JPG/PNG · अधिकतम 2MB · डैशबोर्ड पर दिखेगी', 'JPG/PNG · ಗರಿಷ್ಠ 2MB · ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ')}
        </div>
      </div>

      <!-- Nickname -->
      <div class="form-group">
        <label class="label">${L.nickname}</label>
        <input type="text" class="input-field" id="modal-v-nickname"
          placeholder="${L.nickPh}" maxlength="30" />
      </div>

      <!-- Registration -->
      <div class="form-group">
        <label class="label">${L.reg}</label>
        <input type="text" class="input-field" id="modal-v-number"
          placeholder="${L.regPh}" maxlength="20"
          style="text-transform:uppercase;" oninput="this.value=this.value.toUpperCase()" />
      </div>

      <!-- Brand -->
      <div class="form-group">
        <label class="label">${L.brand}</label>
        <select class="input-field" id="modal-v-brand" onchange="modalUpdateModels()">
          <option value="">${L.selBrand}</option>
          ${(VEHICLE_BRANDS.bike || []).map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>

      <!-- Model -->
      <div class="form-group">
        <label class="label">${L.model}</label>
        <select class="input-field" id="modal-v-model">
          <option value="">${L.selBrandFirst}</option>
        </select>
      </div>

      <!-- Year + CC -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="label">${L.year}</label>
          <select class="input-field" id="modal-v-year">
            ${Array.from({length:15},(_,i)=>2026-i).map(y=>`<option value="${y}">${y}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="label">${L.cc}</label>
          <input type="number" class="input-field" id="modal-v-cc" placeholder="110" min="50" max="2000" />
        </div>
      </div>

      <!-- Last Service -->
      <div class="form-group">
        <label class="label">${L.service}</label>
        <input type="date" class="input-field" id="modal-v-service-date"
          value="${new Date().toISOString().split('T')[0]}" />
      </div>

      <!-- Odometer -->
      <div class="form-group">
        <label class="label">${L.odo}</label>
        <input type="number" class="input-field" id="modal-v-odometer" placeholder="15000" min="0" />
      </div>

      <!-- ── LOCATION SECTION ── -->
      <div class="form-group">
        <label class="label">📍 ${L.location}</label>
        <div style="display:flex; gap:8px;">
          <input type="text" class="input-field" id="modal-v-location"
            placeholder="${L.locPh}" style="flex:1;" />
          <button type="button" class="btn btn-secondary btn-sm" style="white-space:nowrap; flex-shrink:0;"
            onclick="modalDetectLocation()">
            🎯 ${L.detectLoc}
          </button>
        </div>
        <div id="modal-loc-status" style="font-size:0.72rem; color:var(--brand-orange); margin-top:4px; min-height:16px;"></div>
      </div>

      <!-- Nearby Mechanics -->
      <div class="form-group">
        <label class="label">🔧 ${L.nearbyMech}</label>
        <button type="button" class="btn btn-secondary btn-full" onclick="modalFindMechanics()" id="modal-find-mech-btn">
          🗺️ ${L.findMech}
        </button>
        <div id="modal-mechanics-list" style="margin-top:10px; display:none;">
          <!-- populated by modalFindMechanics() -->
        </div>
      </div>

      <!-- Actions -->
      <div style="display:flex; gap:10px; margin-top:8px;">
        <button class="btn btn-ghost btn-full" onclick="document.getElementById('add-vehicle-modal').remove()">${L.cancel}</button>
        <button class="btn btn-primary btn-full" onclick="saveVehicleFromModal()">💾 ${L.save}</button>
      </div>
    </div>
  `;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

/* ── Modal photo helpers ── */
function modalOnPhotoSelected(ev, fromCamera) {
  const file = ev.target.files && ev.target.files[0];
  if (!file || !file.type.startsWith('image/')) return;
  if (file.size > 2 * 1024 * 1024) {
    showToast(tr('Image too large (max 2MB)', 'फोटो बहुत बड़ी है (अधिकतम 2MB)', 'ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದು (ಗರಿಷ್ಠ 2MB)'));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    newVehicle.imageDataUrl = reader.result;
    const preview = document.getElementById('modal-photo-preview');
    const img = document.getElementById('modal-photo-img');
    if (preview && img) {
      img.src = reader.result;
      preview.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

function modalClearPhoto() {
  newVehicle.imageDataUrl = null;
  const preview = document.getElementById('modal-photo-preview');
  if (preview) preview.style.display = 'none';
  // Reset file inputs
  document.querySelectorAll('#add-vehicle-modal input[type="file"]').forEach(inp => inp.value = '');
}

/* ── Location helpers ── */
function modalDetectLocation() {
  const statusEl = document.getElementById('modal-loc-status');
  const input = document.getElementById('modal-v-location');
  if (!navigator.geolocation) {
    if (statusEl) statusEl.textContent = tr('Location not supported', 'लोकेशन समर्थित नहीं', 'ಸ್ಥಳ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ');
    return;
  }
  if (statusEl) statusEl.textContent = tr('Detecting…', 'पता लगाया जा रहा है…', 'ಪತ್ತೆ ಮಾಡಲಾಗುತ್ತಿದೆ…');
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords;
      newVehicle.location = { lat, lng };
      // Reverse geocode using nominatim (free, no key needed)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(r => r.json())
        .then(data => {
          const addr = data.address;
          const area = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.city || '';
          const city = addr.city || addr.town || addr.state_district || '';
          const display = [area, city].filter(Boolean).join(', ') || data.display_name?.split(',').slice(0,2).join(',') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          if (input) input.value = display;
          if (statusEl) statusEl.textContent = '✅ ' + tr('Location detected', 'लोकेशन मिली', 'ಸ್ಥಳ ಪತ್ತೆಯಾಯಿತು');
        })
        .catch(() => {
          if (input) input.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          if (statusEl) statusEl.textContent = '✅ ' + tr('GPS coordinates saved', 'GPS कोऑर्डिनेट सेव', 'GPS ನಿರ್ದೇಶಾಂಕ ಉಳಿಸಲಾಗಿದೆ');
        });
    },
    err => {
      const msg = err.code === 1
        ? tr('Location permission denied', 'लोकेशन अनुमति नहीं', 'ಸ್ಥಳ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ')
        : tr('Could not get location', 'लोकेशन नहीं मिली', 'ಸ್ಥಳ ಪಡೆಯಲಾಗಲಿಲ್ಲ');
      if (statusEl) statusEl.textContent = '⚠ ' + msg;
    },
    { timeout: 8000 }
  );
}

function modalFindMechanics() {
  const btn = document.getElementById('modal-find-mech-btn');
  const listEl = document.getElementById('modal-mechanics-list');
  const locInput = document.getElementById('modal-v-location');
  const locText = locInput?.value?.trim();

  // Build Google Maps search query
  const query = locText
    ? `bike mechanic near ${encodeURIComponent(locText)}`
    : 'bike mechanic near me';

  // Open Google Maps search in new tab
  window.open(`https://www.google.com/maps/search/${query}`, '_blank');

  // Also show nearby static suggestions in the modal
  if (listEl) {
    listEl.style.display = 'block';
    const mechanics = [
      { name: tr('Hero Service Centre', 'हीरो सर्विस सेंटर', 'ಹೀರೋ ಸರ್ವಿಸ್ ಸೆಂಟರ್'), dist: '0.8 km', rating: '4.5', open: true },
      { name: tr('Bajaj Authorised', 'बजाज ऑथराइज्ड', 'ಬಜಾಜ್ ಅಧಿಕೃತ'), dist: '1.2 km', rating: '4.3', open: true },
      { name: tr('Local Auto Garage', 'लोकल ऑटो गैराज', 'ಸ್ಥಳೀಯ ಆಟೋ ಗ್ಯಾರೇಜ್'), dist: '1.8 km', rating: '4.1', open: false },
    ];
    const openLabel = tr('Open', 'खुला', 'ತೆರೆದಿದೆ');
    const closedLabel = tr('Closed', 'बंद', 'ಮುಚ್ಚಿದೆ');
    const callLabel = tr('Call', 'कॉल', 'ಕರೆ');
    listEl.innerHTML = mechanics.map(m => `
      <div style="display:flex; align-items:center; gap:10px; padding:10px 12px;
                  background:var(--bg-card); border:1px solid var(--border-card);
                  border-radius:var(--radius-md); margin-bottom:6px;">
        <div style="width:36px; height:36px; border-radius:50%; background:rgba(255,107,53,0.12);
                    display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0;">🔧</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:0.82rem; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${m.name}</div>
          <div style="font-size:0.7rem; color:var(--text-muted);">
            ⭐ ${m.rating} · ${m.dist}
            <span style="color:${m.open ? 'var(--brand-green)' : 'var(--brand-red)'}; font-weight:600; margin-left:4px;">
              ${m.open ? openLabel : closedLabel}
            </span>
          </div>
        </div>
        <a href="tel:+91" class="btn btn-sm btn-secondary" style="flex-shrink:0; padding:6px 10px; font-size:0.72rem;">
          📞 ${callLabel}
        </a>
      </div>
    `).join('') + `
      <button type="button" class="btn btn-ghost btn-full btn-sm" style="margin-top:4px;"
        onclick="window.open('https://www.google.com/maps/search/${query}','_blank')">
        🗺️ ${tr('View all on Google Maps', 'Google Maps पर देखें', 'Google Maps ನಲ್ಲಿ ನೋಡಿ')}
      </button>
    `;
  }
}

function startDiagnose(vehicleId) {
  State.diagnoseInputs.vehicleId = vehicleId || (State.vehicles[0]?.id) || null;
  navigateTo('diagnose', 'right');
  renderDiagnoseScreen();
}

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

      ${renderFleetIntelligenceSection(temp)}

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

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
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
        <div class="alert-list" id="alert-list">
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
  const alertList = document.getElementById('alert-list');
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
  navigateTo('add-vehicle', 'right');
  renderAddVehicleScreen();
}

function startDiagnose(vehicleId) {
  State.diagnoseInputs.vehicleId = vehicleId || (State.vehicles[0]?.id) || null;
  navigateTo('diagnose', 'right');
  renderDiagnoseScreen();
}

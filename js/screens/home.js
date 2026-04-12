/* ═══════════════════════════════════════════════════════════
   SCREEN 2 · HOME
   ═══════════════════════════════════════════════════════════ */
function renderHomeScreen() {
  const el = document.getElementById('screen-home');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const temp = Math.floor(Math.random() * 8) + 34; // Simulate 34-42°C Indian summer

  el.innerHTML = `
    <div class="scroll-area" style="padding-bottom: 80px;">
      <!-- Header -->
      <div class="home-header">
        <div>
          <div class="home-greeting">${greeting} 👋</div>
          <div class="home-title">${State.language === 'hi' ? 'आपकी गाड़ियां' : 'Your Vehicles'}</div>
        </div>
        <div class="home-avatar" onclick="navigateToProfile()">🧑‍🔧</div>
      </div>

      <!-- Weather Banner -->
      ${temp >= 36 ? `
      <div class="weather-banner">
        <span class="weather-icon">☀️</span>
        <div class="weather-text">
          <strong>High Heat Alert — ${temp}°C today</strong><br>
          ${State.language === 'hi'
            ? 'आज गर्मी ज्यादा है। इंजन ओवरहीट हो सकता है — हर 30 किमी पर 5 मिनट रुकें।'
            : 'Extra heat day. Check engine temp every 30 km. Take breaks to prevent overheating.'}
        </div>
      </div>` : ''}

      <!-- Service Reminder -->
      ${renderServiceReminder()}

      <!-- Saved Vehicles -->
      <div class="section-header">
        <span class="section-label">${State.language === 'hi' ? 'आपकी गाड़ियां' : 'My Vehicles'}</span>
        <span class="section-action" onclick="navigateToAddVehicle()">+ Add</span>
      </div>
      <div class="vehicles-scroll" id="vehicles-scroll">
        ${State.vehicles.map(v => renderVehicleCard(v)).join('')}
        <div class="add-vehicle-card" onclick="navigateToAddVehicle()">
          <span>+</span>
          <p>${State.language === 'hi' ? 'गाड़ी जोड़ें' : 'Add Vehicle'}</p>
        </div>
      </div>

      <!-- Quick Diagnose CTA -->
      <div class="quick-diagnose ripple" onclick="startDiagnose(null)" id="quick-diagnose-cta">
        <div class="quick-diagnose-label">⚡ Quick Action</div>
        <div class="quick-diagnose-title">${State.language === 'hi' ? 'अभी जांचें' : 'Diagnose Now'}</div>
        <div class="quick-diagnose-sub">${State.language === 'hi' ? '4 रीडिंग → पूरी रिपोर्ट' : '4 readings → full health report'}</div>
        <div class="quick-diagnose-arrow">→</div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <div class="quick-action-btn" onclick="showPretrip()">
          <span class="qa-icon">✅</span>
          <span class="qa-label">${State.language === 'hi' ? 'आज चलना सुरक्षित है?' : 'Pre-Trip Check'}</span>
        </div>
        <div class="quick-action-btn" onclick="showFleet()">
          <span class="qa-icon">🚗</span>
          <span class="qa-label">${State.language === 'hi' ? 'फ्लीट ओवरव्यू' : 'Fleet Overview'}</span>
        </div>
        <div class="quick-action-btn" onclick="navigateTo('tips', 'right'); renderTipsScreen();">
          <span class="qa-icon">📚</span>
          <span class="qa-label">${State.language === 'hi' ? 'सुझाव & जानकारी' : 'Tips & Learn'}</span>
        </div>
        <div class="quick-action-btn" onclick="navigateTo('history', 'right'); renderHistoryScreen();">
          <span class="qa-icon">📊</span>
          <span class="qa-label">${State.language === 'hi' ? 'पिछली जांचें' : 'View History'}</span>
        </div>
      </div>

      <!-- Emergency Button -->
      <div class="emergency-btn" onclick="showEmergency()">
        <span class="emergency-icon">🚨</span>
        <div class="emergency-text">
          <div class="emergency-label">${State.language === 'hi' ? 'इमरजेंसी! गाड़ी खराब हो गई' : 'Emergency — Bike Broke Down!'}</div>
          <div class="emergency-sub">${State.language === 'hi' ? 'ऑफलाइन भी काम करता है' : 'Works offline · Instant help'}</div>
        </div>
        <span class="emergency-badge">SOS</span>
      </div>

      <!-- Streak Widget -->
      <div style="margin: 0 20px 8px;">
        <div class="streak-card" style="margin-bottom: 0; border-radius: var(--radius-md); padding: 14px;">
          <span class="streak-flame" style="font-size: 1.8rem;">🔥</span>
          <div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${State.language === 'hi' ? 'केयर स्ट्रीक' : 'Bike Care Streak'}</div>
            <div style="font-size: 1.3rem; font-weight: 900; color: var(--brand-orange);">${State.streak} weeks</div>
            <div style="font-size: 0.72rem; color: var(--text-secondary);">${State.language === 'hi' ? 'बढ़िया! अगले हफ्ते भी याद रखें।' : 'Great! Come back next week to keep it going.'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Nav -->
    ${renderBottomNav('home')}
  `;

  // Bind vehicle card clicks
  document.querySelectorAll('.vehicle-card[data-id]').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      startDiagnose(id);
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

  return `
    <div class="vehicle-card ${color}" data-id="${v.id}">
      <div class="vehicle-emoji">${v.emoji}</div>
      <div class="vehicle-name">${v.nickname}</div>
      <div class="vehicle-type">${v.brand} ${v.model}</div>
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

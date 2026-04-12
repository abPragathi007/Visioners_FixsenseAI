/* ═══════════════════════════════════════════════════════════
   SCREEN 6 · RESULTS
   ═══════════════════════════════════════════════════════════ */
let hindiMode = false;

function renderResultsScreen() {
  const el = document.getElementById('screen-results');
  const result = State.results;
  if (!result) return;

  hindiMode = State.language === 'hi';
  const score = result.healthScore;
  const color = getHealthColor(score);
  const colorHex = getScoreHex(score);
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId);
  const isHi = State.language === 'hi';

  el.innerHTML = `
    <!-- Header -->
    <div class="results-header">
      <div style="padding: 4px 0 12px; display: flex; align-items: center; justify-content: space-between;">
        <div class="back-btn" onclick="goBack()">${Icons.back}</div>
        <div class="text-sm text-muted" style="font-weight: 600;">${vehicle?.nickname || 'My Vehicle'}</div>
        <div style="width: 40px;"></div>
      </div>

      <!-- Health Score Ring -->
      <div class="health-ring-wrapper ${color === 'green' ? 'score-glow-green' : color === 'amber' ? 'score-glow-amber' : 'score-glow-red'}">
        <svg class="health-ring-svg" viewBox="0 0 180 180">
          <circle class="health-ring-bg" cx="90" cy="90" r="76"/>
          <circle class="health-ring-track" cx="90" cy="90" r="76"
            id="ring-track"
            stroke="${colorHex}"
            stroke-dasharray="0 477.52"
            stroke-dashoffset="0"
          />
        </svg>
        <div class="health-ring-center">
          <div class="health-score-number" style="color: ${colorHex};" id="score-counter">0</div>
          <div class="health-score-label">${isHi ? 'स्कोर' : 'Health Score'}</div>
        </div>
      </div>

      <h2 class="health-verdict" style="color: ${colorHex};">${getHealthLabel(score, isHi ? 'hi' : 'en')}</h2>
      <p class="health-sub" id="result-summary">${result.summary || ''}</p>

      <!-- AI Source Badge -->
      <div style="margin-top: 8px;">
        ${result.source === 'claude'
          ? '<span class="badge badge-blue">✨ Claude AI Analysis</span>'
          : '<span class="badge badge-green">⚡ Instant Local Analysis</span>'}
      </div>

      <!-- Action Buttons -->
      <div class="results-actions">
        <button class="btn btn-secondary btn-sm" onclick="openMechanicFinder()">
          ${Icons.map} ${isHi ? 'मैकेनिक' : 'Mechanic'}
        </button>
        <button class="btn btn-secondary btn-sm" onclick="shareReport()">
          ${Icons.share} ${isHi ? 'शेयर' : 'Share'}
        </button>
        <button class="btn btn-ghost btn-sm" onclick="diagnoseAgain()">
          🔄 ${isHi ? 'दोबारा' : 'Diagnose Again'}
        </button>
      </div>
    </div>

    <div class="results-content">
      <!-- Hindi Toggle -->
      <div class="hindi-toggle-row">
        <div>
          <div class="text-sm font-semibold">हिंदी में देखें</div>
          <div class="text-xs text-muted">View results in Hindi</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" id="hindi-toggle" ${hindiMode ? 'checked' : ''} onchange="toggleHindi(this.checked)">
          <span class="slider"></span>
        </label>
      </div>

      <!-- Issues -->
      <div class="section-title">${isHi ? 'मिली समस्याएं' : 'Detected Issues'} (${result.issues?.length || 0})</div>

      ${result.issues?.length === 0
        ? `<div class="card" style="text-align: center; padding: 24px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">✅</div>
            <h3 style="color: var(--brand-green); margin-bottom: 8px;">${isHi ? 'बिल्कुल ठीक है!' : 'No Issues Found!'}</h3>
            <p class="text-sm text-secondary">${isHi ? 'आपकी गाड़ी बढ़िया हालत में है। नियमित सर्विस जारी रखें।' : 'Your vehicle is in great shape. Keep up with regular maintenance!'}</p>
           </div>`
        : (result.issues || []).map(issue => renderIssueCard(issue, isHi)).join('')
      }

      <!-- Smoke Color Guide -->
      <div class="smoke-guide">
        <div class="smoke-guide-title">🔍 ${isHi ? 'धुएं का रंग गाइड' : 'Smoke Color Guide'}</div>
        <div class="smoke-items">
          <div class="smoke-item white">
            <span class="smoke-emoji">💨</span>
            <div class="smoke-color">${isHi ? 'सफेद' : 'White'}</div>
            <div class="smoke-meaning">${isHi ? 'कूलेंट लीक' : 'Coolant leak'}</div>
          </div>
          <div class="smoke-item black">
            <span class="smoke-emoji">🖤</span>
            <div class="smoke-color">${isHi ? 'काला' : 'Black'}</div>
            <div class="smoke-meaning">${isHi ? 'ईंधन मिश्रण गड़बड़' : 'Rich fuel mix'}</div>
          </div>
          <div class="smoke-item blue">
            <span class="smoke-emoji">🔵</span>
            <div class="smoke-color">${isHi ? 'नीला' : 'Blue'}</div>
            <div class="smoke-meaning">${isHi ? 'तेल जल रहा है' : 'Oil burning'}</div>
          </div>
        </div>
      </div>

      <!-- Next Check -->
      ${result.nextCheckKm ? `
      <div class="card" style="margin-top: 12px; display: flex; gap: 12px; align-items: center;">
        <span style="font-size: 1.5rem;">📅</span>
        <div>
          <div class="text-sm font-semibold">${isHi ? 'अगली सर्विस' : 'Next Service Due'}</div>
          <div class="text-xs text-muted">${isHi ? 'लगभग ' : 'At approximately '}${result.nextCheckKm?.toLocaleString()} km</div>
        </div>
      </div>` : ''}

      <!-- Mechanic Finder -->
      <div style="margin-top: 16px;">
        <div class="section-title">${isHi ? 'नजदीकी मैकेनिक' : 'Nearby Mechanics'}</div>
        <div class="map-placeholder" onclick="openMechanicFinder()">
          <div class="map-pin">📍</div>
          <div class="map-label">${isHi ? 'मैप पर देखें' : 'Tap to Open in Maps'}</div>
        </div>
        ${renderMechanicList()}
      </div>

      <div style="height: 40px;"></div>
    </div>
  `;

  // Animate health ring and counter
  animateHealthScore(score, colorHex);
}

function renderIssueCard(issue, isHi) {
  const severityBadge = {
    critical: `<span class="badge badge-red">🚨 ${isHi ? 'आज ठीक करें' : 'Fix Today'}</span>`,
    warning:  `<span class="badge badge-amber">⚠️ ${isHi ? '1 हफ्ते में' : 'Within 1 Week'}</span>`,
    monitor:  `<span class="badge badge-green">👁 ${isHi ? 'निगरानी रखें' : 'Monitor'}</span>`,
  };

  const issueEmojis = {
    engineOverheating: '🌡️', lowOil: '🛢️', dirtyOil: '🔧', weakBattery: '🔋',
    airFilter: '💨', fuelFilter: '⛽', engineWear: '⚙️', coolantDrop: '💧',
    brake: '🛑', acBlocked: '❄️', wiper: '🪟', cngLow: '🔵',
  };

  const emoji = issueEmojis[issue.id] || '⚠️';
  const cost = issue.costMin && issue.costMax
    ? `₹${issue.costMin?.toLocaleString()} – ₹${issue.costMax?.toLocaleString()}`
    : '';

  return `
    <div class="issue-card ${issue.severity}">
      <div class="issue-card-header">
        <div style="display: flex; gap: 10px; align-items: flex-start; flex: 1;">
          <span class="issue-icon">${emoji}</span>
          <div>
            <div class="issue-name">${issue.name}</div>
            ${cost ? `<div class="issue-cost">${isHi ? 'अनुमानित लागत:' : 'Est. Cost:'} <span>${cost}</span></div>` : ''}
          </div>
        </div>
        ${severityBadge[issue.severity] || ''}
      </div>
      <div class="issue-tip">
        ${issue.action ? `<strong>${isHi ? 'करें:' : 'Action:'}</strong> ${issue.action}<br><br>` : ''}
        💡 ${issue.tip}
      </div>
    </div>
  `;
}

function renderMechanicList() {
  const mechanics = [
    { name: 'Hero Service Centre', rating: '⭐ 4.5', dist: '0.8 km', open: true },
    { name: 'Raju Auto Garage', rating: '⭐ 4.2', dist: '1.2 km', open: true },
    { name: 'Bajaj Authorised', rating: '⭐ 4.7', dist: '2.1 km', open: false },
  ];

  return mechanics.map(m => `
    <div class="mechanic-item" onclick="openMechanicFinder()">
      <div class="mechanic-icon">🔧</div>
      <div style="flex: 1;">
        <div class="mechanic-name">${m.name}</div>
        <div class="mechanic-rating">${m.rating} · <span class="mechanic-dist">${m.dist}</span>${m.open ? '<span class="mechanic-open">Open</span>' : ''}</div>
      </div>
      <div class="text-muted text-xs">📞</div>
    </div>
  `).join('');
}

function animateHealthScore(targetScore, colorHex) {
  const ring = document.getElementById('ring-track');
  const counter = document.getElementById('score-counter');

  if (!ring || !counter) return;

  const circumference = 2 * Math.PI * 76;
  const dashArray = (targetScore / 100) * circumference;

  // Start animation after brief delay
  setTimeout(() => {
    ring.style.transition = 'stroke-dasharray 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    ring.setAttribute('stroke-dasharray', `${dashArray} ${circumference - dashArray}`);

    // Number counter
    let current = 0;
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      current = Math.round(eased * targetScore);
      counter.textContent = current;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, 200);
}

function toggleHindi(checked) {
  hindiMode = checked;
  State.language = checked ? 'hi' : 'en';
  saveState();
  renderResultsScreen();
}

function openMechanicFinder() {
  const query = encodeURIComponent('bike mechanic near me');
  window.open(`https://www.google.com/maps/search/${query}`, '_blank');
}

function shareReport() {
  const result = State.results;
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId);
  if (!result) return;

  const text = `🏍️ Bike Health Report — ${vehicle?.nickname || 'My Vehicle'}
Health Score: ${result.healthScore}/100
Issues: ${result.issues?.map(i => i.name).join(', ') || 'None'}
Generated by Bike Health AI

Get your free diagnosis: bikehealth.ai`;

  if (navigator.share) {
    navigator.share({ title: 'Bike Health Report', text });
  } else {
    navigator.clipboard?.writeText(text).then(() => showToast('Report copied to clipboard!'));
  }
}

function diagnoseAgain() {
  navigateTo('diagnose', 'left');
  renderDiagnoseScreen();
}

/* ═══════════════════════════════════════════════════════════
   SCREEN 6 · RESULTS — Enhanced Visual Design
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
  const isKn = State.language === 'kn';

  const criticalIssues = (result.issues || []).filter(i => i.severity === 'critical');
  const warningIssues  = (result.issues || []).filter(i => i.severity === 'warning');
  const monitorIssues  = (result.issues || []).filter(i => i.severity === 'monitor');

  const statusLabel = score >= 75
    ? (isHi ? 'बढ़िया हालत' : isKn ? 'ಉತ್ತಮ ಸ್ಥಿತಿ' : 'HEALTHY')
    : score >= 50
    ? (isHi ? 'ध्यान दें' : isKn ? 'ಗಮನ ಬೇಕು' : 'WARNING')
    : (isHi ? 'तुरंत ठीक करें' : isKn ? 'ತಕ್ಷಣ ಸರಿಪಡಿಸಿ' : 'CRITICAL');

  const statusBg = score >= 75
    ? 'linear-gradient(135deg,rgba(34,197,94,0.18),rgba(22,163,74,0.08))'
    : score >= 50
    ? 'linear-gradient(135deg,rgba(255,187,68,0.18),rgba(245,158,11,0.08))'
    : 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(220,38,38,0.08))';

  el.innerHTML = `
    <div class="screen-scroll" style="background:var(--bg-primary);">

      <!-- ── HERO HEADER ── -->
      <div style="background:${statusBg};border-bottom:1px solid ${colorHex}33;padding:20px 20px 24px;">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;">
          <div class="back-btn" onclick="goBack()">${Icons.back}</div>
          <div style="font-size:0.8rem;font-weight:700;color:var(--text-muted);">${vehicle?.nickname || 'My Vehicle'}</div>
          <button class="btn btn-ghost btn-sm" onclick="diagnoseAgain()" style="padding:6px 12px;font-size:0.72rem;">🔄</button>
        </div>

        <!-- Score + Status row -->
        <div style="display:flex;align-items:center;gap:20px;">
          <!-- Ring -->
          <div style="position:relative;width:110px;height:110px;flex-shrink:0;">
            <svg width="110" height="110" viewBox="0 0 110 110" style="transform:rotate(-90deg);">
              <circle cx="55" cy="55" r="46" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
              <circle cx="55" cy="55" r="46" fill="none" stroke="${colorHex}" stroke-width="10"
                stroke-linecap="round"
                stroke-dasharray="${(score/100)*289.03} 289.03"
                id="ring-track"
                style="filter:drop-shadow(0 0 8px ${colorHex}88);transition:stroke-dasharray 1.2s ease;"/>
            </svg>
            <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
              <div style="font-size:1.8rem;font-weight:900;color:${colorHex};line-height:1;" id="score-counter">0</div>
              <div style="font-size:0.58rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">${isHi ? 'स्कोर' : 'Score'}</div>
            </div>
          </div>

          <!-- Status text -->
          <div style="flex:1;">
            <div style="display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:${colorHex}22;border:1px solid ${colorHex}44;margin-bottom:8px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${colorHex};display:inline-block;"></span>
              <span style="font-size:0.72rem;font-weight:800;color:${colorHex};letter-spacing:1px;">${statusLabel}</span>
            </div>
            <div style="font-size:1rem;font-weight:800;color:var(--text-primary);line-height:1.3;margin-bottom:6px;">${result.summary || ''}</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">
              ${result.source === 'claude' ? '✨ AI Enhanced' : '⚡ Local AI'} · ${new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        <!-- Issue count pills -->
        ${result.issues?.length ? `
        <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
          ${criticalIssues.length ? `<div style="padding:6px 14px;border-radius:999px;background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);font-size:0.75rem;font-weight:700;color:#F87171;">🚨 ${criticalIssues.length} ${isHi ? 'गंभीर' : 'Critical'}</div>` : ''}
          ${warningIssues.length  ? `<div style="padding:6px 14px;border-radius:999px;background:rgba(255,187,68,0.15);border:1px solid rgba(255,187,68,0.3);font-size:0.75rem;font-weight:700;color:#FBBF24;">⚠️ ${warningIssues.length} ${isHi ? 'चेतावनी' : 'Warning'}</div>` : ''}
          ${monitorIssues.length  ? `<div style="padding:6px 14px;border-radius:999px;background:rgba(34,197,94,0.15);border:1px solid rgba(34,197,94,0.3);font-size:0.75rem;font-weight:700;color:#4ADE80;">👁 ${monitorIssues.length} ${isHi ? 'निगरानी' : 'Monitor'}</div>` : ''}
        </div>` : ''}

        <!-- Action buttons -->
        <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" onclick="openMechanicFinder()" style="flex:1;">${Icons.map} ${isHi ? 'मैकेनिक' : 'Mechanic'}</button>
          <button class="btn btn-secondary btn-sm" onclick="shareReport()" style="flex:1;">${Icons.share} ${isHi ? 'शेयर' : 'Share'}</button>
          <button class="btn btn-secondary btn-sm" onclick="tripDownloadPDF && tripDownloadPDF()" style="flex:1;">📄 PDF</button>
        </div>
      </div>

      <div style="padding:16px 16px 80px;">

        <!-- FIX 4: Show user complaint prominently at top -->
        ${(result.userComplaint || State.diagnoseInputs.symptoms || '').trim() ? `
        <div style="background:linear-gradient(135deg,rgba(239,68,68,0.15),rgba(17,24,39,0.8));border:2px solid rgba(239,68,68,0.4);border-radius:14px;padding:14px 16px;margin-bottom:16px;display:flex;gap:12px;align-items:flex-start;">
          <span style="font-size:1.4rem;flex-shrink:0;">🗣️</span>
          <div>
            <div style="font-size:0.68rem;font-weight:800;color:#F87171;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:4px;">${isHi ? 'आपकी रिपोर्ट की गई समस्या' : isKn ? 'ನೀವು ವರದಿ ಮಾಡಿದ ಸಮಸ್ಯೆ' : 'Your Reported Problem'}</div>
            <div style="font-size:0.88rem;font-weight:700;color:#F1F5F9;">"${(result.userComplaint || State.diagnoseInputs.symptoms || '').trim()}"</div>
            <div style="font-size:0.72rem;color:#94A3B8;margin-top:4px;">${isHi ? '✅ AI ने इसे विश्लेषण में शामिल किया है' : '✅ AI has analysed this complaint'}</div>
          </div>
        </div>` : ''}

        <!-- ── PROBLEMS SECTION (most important) ── -->
        ${result.issues?.length === 0 ? `
        <div style="background:linear-gradient(135deg,rgba(34,197,94,0.12),rgba(17,24,39,0.8));border:1.5px solid rgba(34,197,94,0.3);border-radius:16px;padding:28px 20px;text-align:center;margin-bottom:16px;">
          <div style="font-size:3.5rem;margin-bottom:12px;">✅</div>
          <div style="font-size:1.2rem;font-weight:800;color:#4ADE80;margin-bottom:6px;">${isHi ? 'बिल्कुल ठीक है!' : 'All Clear!'}</div>
          <div style="font-size:0.85rem;color:var(--text-secondary);">${isHi ? 'आपकी गाड़ी बढ़िया हालत में है।' : 'Your vehicle is in great shape. Keep up with regular maintenance!'}</div>
        </div>` : `

        <!-- Critical issues first -->
        ${criticalIssues.length ? `
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <div style="width:4px;height:20px;background:#EF4444;border-radius:2px;"></div>
            <span style="font-size:0.72rem;font-weight:800;color:#F87171;text-transform:uppercase;letter-spacing:1px;">🚨 ${isHi ? 'आज ठीक करें' : 'Fix Today — Critical'}</span>
          </div>
          ${criticalIssues.map(i => renderIssueCardV2(i, isHi, isKn)).join('')}
        </div>` : ''}

        <!-- Warning issues -->
        ${warningIssues.length ? `
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <div style="width:4px;height:20px;background:#FFBB44;border-radius:2px;"></div>
            <span style="font-size:0.72rem;font-weight:800;color:#FBBF24;text-transform:uppercase;letter-spacing:1px;">⚠️ ${isHi ? '1 हफ्ते में ठीक करें' : 'Fix Within 1 Week'}</span>
          </div>
          ${warningIssues.map(i => renderIssueCardV2(i, isHi, isKn)).join('')}
        </div>` : ''}

        <!-- Monitor issues -->
        ${monitorIssues.length ? `
        <div style="margin-bottom:16px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
            <div style="width:4px;height:20px;background:#22C55E;border-radius:2px;"></div>
            <span style="font-size:0.72rem;font-weight:800;color:#4ADE80;text-transform:uppercase;letter-spacing:1px;">👁 ${isHi ? 'निगरानी रखें' : 'Monitor'}</span>
          </div>
          ${monitorIssues.map(i => renderIssueCardV2(i, isHi, isKn)).join('')}
        </div>` : ''}
        `}

        <!-- ── COST ESTIMATOR ── -->
        ${result.issues?.length ? (typeof renderCostEstimator === 'function' ? renderCostEstimator(result.issues) : '') : ''}

        <!-- ── SENSOR SNAPSHOT ── -->
        <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:14px;padding:16px;margin-top:16px;margin-bottom:16px;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:12px;">📡 Sensor Snapshot</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            ${[
              { label: isHi ? 'इंजन' : 'Engine', val: State.diagnoseInputs.engineTemp + '°C', warn: State.diagnoseInputs.engineTemp > 95, crit: State.diagnoseInputs.engineTemp > 105, icon: '🌡️' },
              { label: isHi ? 'ऑयल' : 'Oil', val: State.diagnoseInputs.oilLevel + '%', warn: State.diagnoseInputs.oilLevel < 40, crit: State.diagnoseInputs.oilLevel < 25, icon: '🛢️' },
              { label: isHi ? 'बैटरी' : 'Battery', val: State.diagnoseInputs.batteryVolt + 'V', warn: State.diagnoseInputs.batteryVolt < 12.4, crit: State.diagnoseInputs.batteryVolt < 12.0, icon: '🔋' },
            ].map(s => {
              const c = s.crit ? '#EF4444' : s.warn ? '#FFBB44' : '#22C55E';
              return `<div style="background:${c}11;border:1px solid ${c}33;border-radius:10px;padding:10px;text-align:center;">
                <div style="font-size:1.2rem;margin-bottom:4px;">${s.icon}</div>
                <div style="font-size:0.95rem;font-weight:800;color:${c};">${s.val}</div>
                <div style="font-size:0.62rem;color:var(--text-muted);margin-top:2px;">${s.label}</div>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- ── NEXT SERVICE ── -->
        ${result.nextCheckKm ? `
        <div style="background:var(--bg-card);border:1px solid var(--border-card);border-radius:14px;padding:14px 16px;margin-bottom:16px;display:flex;align-items:center;gap:14px;">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,107,53,0.12);display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">📅</div>
          <div>
            <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);">${isHi ? 'अगली सर्विस' : 'Next Service Due'}</div>
            <div style="font-size:0.75rem;color:var(--brand-orange);font-weight:600;">${isHi ? 'लगभग ' : 'At '}${result.nextCheckKm?.toLocaleString('en-IN')} km</div>
          </div>
        </div>` : ''}

        <!-- ── NEARBY MECHANICS ── -->
        <div style="margin-bottom:16px;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.8px;margin-bottom:10px;">🔧 ${isHi ? 'नजदीकी मैकेनिक' : 'Nearby Mechanics'}</div>
          <div style="background:linear-gradient(135deg,#0F1929,#1A2235);border:1px solid var(--border-card);border-radius:12px;overflow:hidden;margin-bottom:8px;cursor:pointer;" onclick="openMechanicFinder()">
            <div style="padding:20px;display:flex;flex-direction:column;align-items:center;gap:6px;">
              <div style="font-size:2rem;animation:mapPin 1.5s ease-in-out infinite;">📍</div>
              <div style="font-size:0.82rem;font-weight:600;color:var(--text-secondary);">${isHi ? 'मैप पर देखें' : 'Tap to find on Maps'}</div>
            </div>
          </div>
          ${renderMechanicList()}
        </div>

        <!-- ── LANGUAGE TOGGLE ── -->
        <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
          <div>
            <div style="font-size:0.85rem;font-weight:600;">हिंदी में देखें</div>
            <div style="font-size:0.72rem;color:var(--text-muted);">View results in Hindi</div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="hindi-toggle" ${hindiMode ? 'checked' : ''} onchange="toggleHindi(this.checked)">
            <span class="slider"></span>
          </label>
        </div>

      </div>
    </div>
  `;

  animateHealthScore(score, colorHex);
  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

/* ── Enhanced Issue Card V2 ── */
function renderIssueCardV2(issue, isHi, isKn) {
  const issueEmojis = {
    engineOverheating: '🌡️', lowOil: '🛢️', dirtyOil: '🔧', weakBattery: '🔋',
    airFilter: '💨', fuelFilter: '⛽', engineWear: '⚙️', coolantDrop: '💧',
    brake: '🛑', acBlocked: '❄️', wiper: '🪟', cngLow: '🔵',
  };
  const emoji = issueEmojis[issue.id] || '⚠️';
  const borderColor = issue.severity === 'critical' ? '#EF4444' : issue.severity === 'warning' ? '#FFBB44' : '#22C55E';
  const bgColor = issue.severity === 'critical' ? 'rgba(239,68,68,0.06)' : issue.severity === 'warning' ? 'rgba(255,187,68,0.06)' : 'rgba(34,197,94,0.06)';
  const cost = issue.costMin && issue.costMax ? `₹${issue.costMin.toLocaleString('en-IN')} – ₹${issue.costMax.toLocaleString('en-IN')}` : '';

  // Parse action into numbered steps if it contains numbered list
  const steps = issue.action ? issue.action.split(/\d+\.\s+/).filter(Boolean) : [];
  const stepsHtml = steps.length > 1
    ? `<div style="margin-top:10px;display:flex;flex-direction:column;gap:6px;">
        ${steps.map((s, i) => `<div style="display:flex;gap:8px;align-items:flex-start;"><span style="min-width:20px;height:20px;border-radius:50%;background:${borderColor}22;border:1px solid ${borderColor}44;display:flex;align-items:center;justify-content:center;font-size:0.65rem;font-weight:800;color:${borderColor};flex-shrink:0;">${i+1}</span><span style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${s.trim()}</span></div>`).join('')}
       </div>`
    : `<div style="font-size:0.8rem;color:var(--text-secondary);margin-top:8px;line-height:1.55;">${issue.action || ''}</div>`;

  return `
    <div style="background:${bgColor};border:1.5px solid ${borderColor}44;border-left:4px solid ${borderColor};border-radius:14px;padding:16px;margin-bottom:10px;">
      <!-- Issue header -->
      <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:10px;">
        <div style="width:42px;height:42px;border-radius:12px;background:${borderColor}18;display:flex;align-items:center;justify-content:center;font-size:1.4rem;flex-shrink:0;">${emoji}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:0.95rem;font-weight:800;color:var(--text-primary);margin-bottom:4px;">${issue.name}</div>
          ${cost ? `<div style="font-size:0.72rem;color:${borderColor};font-weight:700;">💰 ${isHi ? 'अनुमानित लागत:' : 'Est. cost:'} ${cost}</div>` : ''}
        </div>
      </div>

      <!-- Fix steps -->
      <div style="background:rgba(255,255,255,0.03);border-radius:10px;padding:12px;">
        <div style="font-size:0.68rem;font-weight:800;color:${borderColor};text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">${isHi ? '✅ क्या करें' : '✅ How to Fix'}</div>
        ${stepsHtml}
      </div>

      <!-- Tip -->
      ${issue.tip ? `
      <div style="display:flex;gap:8px;align-items:flex-start;margin-top:10px;padding:10px 12px;background:rgba(255,107,53,0.06);border-radius:8px;border:1px solid rgba(255,107,53,0.15);">
        <span style="font-size:0.9rem;flex-shrink:0;">💡</span>
        <span style="font-size:0.76rem;color:var(--text-secondary);line-height:1.5;">${issue.tip}</span>
      </div>` : ''}
    </div>
  `;
}

/* ── Keep old renderIssueCard as alias ── */
function renderIssueCard(issue, isHi) {
  return renderIssueCardV2(issue, isHi, false);
}

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
  const isKn = State.language === 'kn';

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
      <!-- Language selector + Read Aloud -->
      <div style="background:var(--bg-card);border:1px solid var(--border-subtle);border-radius:12px;padding:12px 16px;margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;gap:6px;">
            ${[['en','EN 🇬🇧'],['hi','HI 🇮🇳'],['kn','KN 🇮🇳']].map(([code,label]) => `
              <button onclick="setResultsLang('${code}')" style="padding:6px 12px;border-radius:999px;border:1.5px solid ${State.language===code?'var(--brand-orange)':'var(--border-card)'};background:${State.language===code?'rgba(255,107,53,0.12)':'var(--bg-input)'};color:${State.language===code?'var(--brand-orange)':'var(--text-secondary)'};font-size:0.75rem;font-weight:700;cursor:pointer;">${label}</button>
            `).join('')}
          </div>
          <button id="results-speak-btn" onclick="resultsReadAloud()" style="display:inline-flex;align-items:center;gap:6px;padding:7px 14px;background:var(--grad-brand);border:none;border-radius:999px;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;">🔊 Read Aloud</button>
        </div>
        <div id="results-speak-status" style="font-size:0.7rem;color:var(--text-muted);margin-top:6px;min-height:14px;"></div>
      </div>

      <!-- Issues -->
      <div class="section-title">${isHi ? 'मिली समस्याएं' : isKn ? 'ಪತ್ತೆಯಾದ ಸಮಸ್ಯೆಗಳು' : 'Detected Issues'} (${result.issues?.length || 0})</div>

      ${result.issues?.length === 0
        ? `<div class="card" style="text-align: center; padding: 24px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">✅</div>
            <h3 style="color: var(--brand-green); margin-bottom: 8px;">${isHi ? 'बिल्कुल ठीक है!' : 'No Issues Found!'}</h3>
            <p class="text-sm text-secondary">${isHi ? 'आपकी गाड़ी बढ़िया हालत में है। नियमित सर्विस जारी रखें।' : 'Your vehicle is in great shape. Keep up with regular maintenance!'}</p>
           </div>`
        : (result.issues || []).map(issue => renderIssueCard(issue, isHi)).join('')
      }

      <!-- Module 10: Cost Estimator -->
      ${result.issues?.length ? `<div id="rr-cost-estimator">${typeof renderCostEstimator === 'function' ? renderCostEstimator(result.issues) : ''}</div>` : ''}

      <!-- Module 5: Service Recommendations link -->
      ${result.issues?.length ? `<button class="btn btn-secondary btn-full" style="margin-top:10px;" onclick="navigateTo('history','right');renderHistoryScreen();">🔧 View Service Recommendations</button>` : ''}

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

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
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
  applyDocumentLocale();
  renderResultsScreen();
  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function setResultsLang(code) {
  State.language = code;
  hindiMode = (code === 'hi');
  saveState();
  applyDocumentLocale();
  renderResultsScreen();
  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

let _resultsUtterance = null;
let _resultsSpeaking = false;

function resultsReadAloud() {
  const synth = window.speechSynthesis;
  if (!synth) { showToast('Voice not supported in this browser'); return; }

  // If already speaking, stop
  if (_resultsSpeaking) {
    synth.cancel();
    _resultsSpeaking = false;
    const btn = document.getElementById('results-speak-btn');
    const status = document.getElementById('results-speak-status');
    if (btn) btn.innerHTML = '🔊 Read Aloud';
    if (status) status.textContent = '';
    return;
  }

  const result = State.results;
  if (!result) return;

  const lang = State.language;
  const langCode = lang === 'hi' ? 'hi-IN' : lang === 'kn' ? 'kn-IN' : 'en-IN';

  // Build text to speak
  let text = '';
  if (lang === 'hi') {
    text = `स्वास्थ्य स्कोर ${result.healthScore}। ${result.summary || ''}। `;
    (result.issues || []).forEach(i => { text += `समस्या: ${i.name}। ${i.action || ''}। `; });
  } else if (lang === 'kn') {
    text = `ಆರೋಗ್ಯ ಅಂಕ ${result.healthScore}. ${result.summary || ''}. `;
    (result.issues || []).forEach(i => { text += `ಸಮಸ್ಯೆ: ${i.name}. ${i.action || ''}. `; });
  } else {
    text = `Health score ${result.healthScore}. ${result.summary || ''}. `;
    (result.issues || []).forEach(i => { text += `Issue: ${i.name}. ${i.action || ''}. `; });
    if (!result.issues?.length) text += 'No issues detected. Your vehicle is in good condition.';
  }

  synth.cancel();
  _resultsUtterance = new SpeechSynthesisUtterance(text);
  _resultsUtterance.lang = langCode;
  _resultsUtterance.rate = 0.88;

  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang === langCode)
    || voices.find(v => v.lang.startsWith(lang))
    || voices.find(v => v.lang.startsWith('en'))
    || null;
  if (voice) _resultsUtterance.voice = voice;

  const btn = document.getElementById('results-speak-btn');
  const status = document.getElementById('results-speak-status');

  _resultsUtterance.onstart = () => {
    _resultsSpeaking = true;
    if (btn) btn.innerHTML = '⏹ Stop';
    if (status) status.textContent = '🔊 Reading...';
  };
  _resultsUtterance.onend = _resultsUtterance.onerror = () => {
    _resultsSpeaking = false;
    if (btn) btn.innerHTML = '🔊 Read Aloud';
    if (status) status.textContent = '';
  };

  function doSpeak() {
    synth.speak(_resultsUtterance);
    setTimeout(() => { if (synth.paused) synth.resume(); }, 150);
  }

  if (synth.getVoices().length > 0) {
    doSpeak();
  } else {
    synth.addEventListener('voiceschanged', doSpeak, { once: true });
    setTimeout(doSpeak, 500);
  }
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

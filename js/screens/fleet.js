/* ═══════════════════════════════════════════════════════════
   FLEET OVERVIEW OVERLAY
   ═══════════════════════════════════════════════════════════ */
function showFleet() {
  const el = document.getElementById('screen-fleet');
  const isHi = State.language === 'hi';
  const vehicles = State.vehicles;

  const avgScore = vehicles.length
    ? Math.round(vehicles.reduce((sum, v) => sum + (v.lastDiagnosis?.score || 0), 0) / vehicles.length)
    : 0;

  const critCount = vehicles.filter(v => (v.lastDiagnosis?.score || 100) < 50).length;
  const okCount   = vehicles.filter(v => (v.lastDiagnosis?.score || 100) >= 75).length;

  el.classList.add('active');

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="hideFleet()">${Icons.back}</div>
      <div>
        <div class="page-title">${isHi ? 'फ्लीट ओवरव्यू' : 'Fleet Overview'}</div>
        <div class="text-xs text-muted">${vehicles.length} ${isHi ? 'वाहन' : 'vehicles'}</div>
      </div>
    </div>

    <div class="fleet-content">
      <!-- Summary Stats -->
      <div class="fleet-summary">
        <div class="fleet-stat">
          <div class="fleet-stat-num">${vehicles.length}</div>
          <div class="fleet-stat-label">${isHi ? 'कुल गाड़ियां' : 'Total'}</div>
        </div>
        <div class="fleet-stat">
          <div class="fleet-stat-num">${avgScore}</div>
          <div class="fleet-stat-label">${isHi ? 'औसत स्कोर' : 'Avg Score'}</div>
        </div>
        <div class="fleet-stat">
          <div class="fleet-stat-num" style="color: #F87171;">${critCount}</div>
          <div class="fleet-stat-label">${isHi ? 'तत्काल ध्यान' : 'Needs Action'}</div>
        </div>
        <div class="fleet-stat">
          <div class="fleet-stat-num" style="color: #4ADE80;">${okCount}</div>
          <div class="fleet-stat-label">${isHi ? 'ठीक हैं' : 'Healthy'}</div>
        </div>
      </div>

      <!-- Vehicle List -->
      <div class="section-title">${isHi ? 'वाहनों की हालत' : 'Vehicle Health Status'}</div>

      ${vehicles.map(v => {
        const score = v.lastDiagnosis?.score || 0;
        const color = v.lastDiagnosis?.color || 'green';
        const colorHex = getScoreHex(score);
        const hasData = v.lastDiagnosis != null;

        return `
          <div class="fleet-vehicle-row" onclick="startDiagnose('${v.id}'); hideFleet();">
            <span style="font-size: 1.5rem;">${v.emoji}</span>
            <div style="flex: 1;">
              <div style="font-size: 0.88rem; font-weight: 700;">${v.nickname}</div>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${v.brand} ${v.model} · ${v.year}</div>
            </div>
            ${hasData
              ? `<div style="display: flex; align-items: center; gap: 6px;">
                  ${renderMiniRing(score, 36)}
                  <span style="font-size: 0.85rem; font-weight: 800; color: ${colorHex};">${score}</span>
                </div>`
              : `<span class="badge badge-blue">${isHi ? 'जांचें' : 'Get Check'}</span>`
            }
          </div>
        `;
      }).join('')}

      <!-- B2B Banner -->
      <div class="card-glass" style="margin-top: 20px; text-align: center; padding: 20px;">
        <div style="font-size: 1.5rem; margin-bottom: 8px;">🏢</div>
        <div class="text-sm font-semibold" style="margin-bottom: 6px;">
          ${isHi ? 'बड़े फ्लीट के लिए' : 'Managing a Large Fleet?'}
        </div>
        <div class="text-xs text-secondary" style="margin-bottom: 12px; line-height: 1.5;">
          ${isHi
            ? 'ओला, रैपिडो और ऑटो एग्रीगेटर्स के लिए B2B फ्लीट डैशबोर्ड। हजारों गाड़ियों की एक जगह निगरानी।'
            : 'B2B fleet dashboard for Ola, Rapido & local operators. Monitor thousands of vehicles from one screen.'}
        </div>
        <button class="btn btn-primary" onclick="showToast('Contact us at fleet@bikehealth.ai')">
          📧 ${isHi ? 'संपर्क करें' : 'Contact for Enterprise'}
        </button>
      </div>

      <div style="height: 40px;"></div>
    </div>
  `;
}

function hideFleet() {
  document.getElementById('screen-fleet').classList.remove('active');
}

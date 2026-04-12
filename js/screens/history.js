/* ═══════════════════════════════════════════════════════════
   SCREEN 7 · HISTORY
   ═══════════════════════════════════════════════════════════ */
let historyVehicleFilter = 'All';
let historyTypeFilter = 'all'; // all | bike | scooter | auto
let historySeverityFilter = 'all'; // all | critical
let historyPeriodFilter = 'all'; // all | month

function historyEntryVehicleType(entry) {
  if (entry.vehicleType) return entry.vehicleType;
  const v = State.vehicles.find(x => x.id === entry.vehicleId);
  return v?.type || null;
}

function buildFilteredHistory() {
  let list = [...State.diagnoseHistory];

  if (historyVehicleFilter !== 'All') {
    list = list.filter(h => h.vehicleName === historyVehicleFilter);
  }

  if (historyTypeFilter !== 'all') {
    list = list.filter(h => historyEntryVehicleType(h) === historyTypeFilter);
  }

  if (historySeverityFilter === 'critical') {
    list = list.filter(h => (h.score ?? 100) < 50);
  }

  if (historyPeriodFilter === 'month') {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    list = list.filter(h => {
      const d = new Date(h.date);
      return !Number.isNaN(d.getTime()) && d >= start;
    });
  }

  return list;
}

function renderHistoryScreen() {
  const el = document.getElementById('screen-history');
  const isHi = State.language === 'hi';
  const history = State.diagnoseHistory;
  const filtered = buildFilteredHistory();

  const vehicleNames = ['All', ...new Set(history.map(h => h.vehicleName))];

  const L = {
    typeAll: isHi ? 'सभी प्रकार' : 'All types',
    bike: isHi ? 'बाइक' : 'Bike',
    scooter: isHi ? 'स्कूटर' : 'Scooter',
    auto: isHi ? 'ऑटो' : 'Auto',
    severityAll: isHi ? 'सभी' : 'All scores',
    criticalOnly: isHi ? 'केवल क्रिटिकल' : 'Critical only',
    periodAll: isHi ? 'सभी समय' : 'All time',
    thisMonth: isHi ? 'यह महीना' : 'This month',
    filters: isHi ? 'फ़िल्टर' : 'Filters',
  };

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack(); refreshCurrentScreen();">${Icons.back}</div>
      <h2 class="page-title">${isHi ? 'जांच का इतिहास' : 'Diagnosis History'}</h2>
      <button class="btn btn-ghost btn-sm" onclick="exportHistoryFiltered()">📤 Export</button>
    </div>

    <div class="history-content screen-scroll">
      <!-- Vehicle chips -->
      <div class="filter-row">
        ${vehicleNames.map(name => `
          <div class="chip ${historyVehicleFilter === name ? 'active' : ''}" onclick="filterHistory(${JSON.stringify(name)})">
            ${name === 'All' ? '🚗 ' + (isHi ? 'सभी वाहन' : 'All Vehicles') : name}
          </div>
        `).join('')}
      </div>

      <div class="section-title" style="margin-top:4px;">${L.filters}</div>
      <div class="filter-row">
        <div class="chip ${historyTypeFilter === 'all' ? 'active' : ''}" onclick="setHistoryTypeFilter('all')">${L.typeAll}</div>
        <div class="chip ${historyTypeFilter === 'bike' ? 'active' : ''}" onclick="setHistoryTypeFilter('bike')">🏍️ ${L.bike}</div>
        <div class="chip ${historyTypeFilter === 'scooter' ? 'active' : ''}" onclick="setHistoryTypeFilter('scooter')">🛵 ${L.scooter}</div>
        <div class="chip ${historyTypeFilter === 'auto' ? 'active' : ''}" onclick="setHistoryTypeFilter('auto')">🛺 ${L.auto}</div>
      </div>
      <div class="filter-row">
        <div class="chip ${historySeverityFilter === 'all' ? 'active' : ''}" onclick="setHistorySeverityFilter('all')">${L.severityAll}</div>
        <div class="chip ${historySeverityFilter === 'critical' ? 'active' : ''}" onclick="setHistorySeverityFilter('critical')">🔴 ${L.criticalOnly}</div>
        <div class="chip ${historyPeriodFilter === 'all' ? 'active' : ''}" onclick="setHistoryPeriodFilter('all')">${L.periodAll}</div>
        <div class="chip ${historyPeriodFilter === 'month' ? 'active' : ''}" onclick="setHistoryPeriodFilter('month')">📅 ${L.thisMonth}</div>
      </div>

      <!-- Trend Chart -->
      ${renderTrendChart(filtered.slice(0, 7))}

      <!-- Trip History + PDF Download -->
      <div class="section-title" style="margin-top:8px;">Trip Logs</div>
      <div id="rr-trip-history-hist" style="margin-bottom:12px;"></div>
      <button class="btn btn-secondary btn-sm btn-full" style="margin-bottom:16px;" onclick="renderTripHistory();document.getElementById('rr-trip-history-hist').innerHTML=document.getElementById('rr-trip-history')?.innerHTML||''">📊 Load Trip Logs</button>

      <!-- History Items -->
      <div class="section-title">${isHi ? 'पिछली जांचें' : 'Past Diagnoses'} (${filtered.length})</div>

      ${filtered.length === 0
        ? `<div class="card" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 3.5rem; margin-bottom: 12px;">📭</div>
            <div style="font-size: 1rem; font-weight: 700; margin-bottom: 6px;">${isHi ? 'कोई रिकॉर्ड नहीं' : 'No records yet'}</div>
            <p class="text-secondary" style="font-size:0.85rem;">${history.length === 0
              ? (isHi ? 'अभी तक कोई जांच नहीं हुई। पहली जांच करें!' : 'No diagnoses yet. Run your first check!')
              : (isHi ? 'इन फ़िल्टर के लिए कोई रिकॉर्ड नहीं।' : 'No records match these filters.')
            }</p>
            ${history.length === 0 ? `<button class="btn btn-primary" style="margin-top:16px;" onclick="startDiagnose(null)">🔍 ${isHi ? 'जांचें' : 'Diagnose Now'}</button>` : ''}
           </div>`
        : filtered.map(entry => renderHistoryItem(entry, isHi)).join('')
      }
    </div>

  `;

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function renderTrendChart(entries) {
  if (entries.length < 2) return '';
  const reversed = [...entries].reverse();

  return `
    <div class="trend-chart-wrapper">
      <div class="trend-chart-title">${State.language === 'hi' ? 'स्वास्थ्य ट्रेंड' : 'Health Score Trend'}</div>
      <div class="trend-chart">
        ${reversed.map(e => {
          const h = Math.max(10, (e.score / 100) * 76);
          return `<div class="trend-bar ${e.color}" style="height: ${h}px;" title="${e.score} — ${e.date}"></div>`;
        }).join('')}
      </div>
    </div>
  `;
}

function renderHistoryItem(entry, isHi) {
  const issueText = entry.issues?.length
    ? entry.issues.slice(0, 2).join(', ') + (entry.issues.length > 2 ? ` +${entry.issues.length - 2} more` : '')
    : (isHi ? 'कोई समस्या नहीं' : 'No issues found');

  const loc = State.language === 'hi' ? 'hi-IN' : State.language === 'kn' ? 'kn-IN' : 'en-IN';
  const dateStr = new Date(entry.date).toLocaleDateString(loc, {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const veh = State.vehicles.find(v => v.id === entry.vehicleId);
  const thumb = veh?.image
    ? `<img class="history-thumb" src="${String(veh.image).replace(/"/g, '&quot;')}" alt="" />`
    : `<div class="history-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);font-size:1.2rem;">${veh?.emoji || '🏍️'}</div>`;

  return `
    <div class="history-item" onclick="viewHistoryEntry('${entry.id}')">
      ${thumb}
      <div class="history-score ${entry.color}">${entry.score}</div>
      <div class="history-info">
        <div class="history-vehicle">${entry.vehicleName}</div>
        <div class="history-date">📅 ${dateStr}</div>
        <div class="history-issues">${issueText}</div>
      </div>
      <div class="text-muted">${Icons.arrow}</div>
    </div>
  `;
}

function filterHistory(name) {
  historyVehicleFilter = name;
  renderHistoryScreen();
}

function setHistoryTypeFilter(type) {
  historyTypeFilter = type;
  renderHistoryScreen();
}

function setHistorySeverityFilter(sev) {
  historySeverityFilter = sev;
  renderHistoryScreen();
}

function setHistoryPeriodFilter(period) {
  historyPeriodFilter = period;
  renderHistoryScreen();
}

function viewHistoryEntry(id) {
  const entry = State.diagnoseHistory.find(h => h.id === id);
  if (!entry) return;

  const isHi = State.language === 'hi';
  if (entry.result) {
    State.results = entry.result;
  } else {
    const sev = (entry.score ?? 50) < 50 ? 'critical' : (entry.score ?? 70) < 75 ? 'warning' : 'monitor';
    State.results = {
      healthScore: entry.score ?? 0,
      issues: (entry.issues || []).map((name, i) => ({
        id: 'hist-' + i,
        name,
        severity: sev,
        action: isHi ? 'मैकेनिक से सलाह लें।' : 'Have a mechanic review this.',
        costMin: 200,
        costMax: 2000,
        tip: isHi ? 'पुराना रिकॉर्ड — विवरण सीमित हो सकता है।' : 'Older record — details may be limited.',
      })),
      summary: isHi
        ? 'यह पिछली जांच का सारांश है। नई जांच से अधिक सटीक परिणाम मिलेंगे।'
        : 'Summary from a past check. Run a new diagnosis for full detail.',
      nextCheckKm: null,
      source: 'local',
    };
  }

  State.diagnoseInputs.vehicleId = entry.vehicleId;
  navigateTo('results', 'right');
  renderResultsScreen();
}

function exportHistoryFiltered() {
  const isHi = State.language === 'hi';
  const rows = buildFilteredHistory();
  const csv = [
    'Date,Vehicle,Type,Score,Issues',
    ...rows.map(h =>
      `${h.date},"${h.vehicleName}",${historyEntryVehicleType(h) || ''},${h.score},"${h.issues?.join('; ') || ''}"`
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bike_health_history.csv';
  a.click();
  showToast(isHi ? 'CSV डाउनलोड हो रहा है...' : 'Downloading CSV...');
}

function exportHistory() {
  exportHistoryFiltered();
}

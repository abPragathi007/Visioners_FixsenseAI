/* ═══════════════════════════════════════════════════════════
   SCREEN 7 · HISTORY
   ═══════════════════════════════════════════════════════════ */
let historyFilter = 'All';

function renderHistoryScreen() {
  const el = document.getElementById('screen-history');
  const isHi = State.language === 'hi';
  const history = State.diagnoseHistory;

  const vehicleNames = ['All', ...new Set(history.map(h => h.vehicleName))];
  const filtered = historyFilter === 'All' ? history : history.filter(h => h.vehicleName === historyFilter);

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack(); renderHomeScreen();">${Icons.back}</div>
      <h2 class="page-title">${isHi ? 'जांच का इतिहास' : 'Diagnosis History'}</h2>
      <button class="btn btn-ghost btn-sm" onclick="exportHistory()">📤 Export</button>
    </div>

    <div class="history-content">
      <!-- Filters -->
      <div class="filter-row">
        ${vehicleNames.map(name => `
          <div class="chip ${historyFilter === name ? 'active' : ''}" onclick="filterHistory('${name}')">
            ${name === 'All' ? '🚗 All Vehicles' : name}
          </div>
        `).join('')}
      </div>

      <!-- Trend Chart -->
      ${renderTrendChart(filtered.slice(0, 7))}

      <!-- History Items -->
      <div class="section-title">${isHi ? 'पिछली जांचें' : 'Past Diagnoses'} (${filtered.length})</div>

      ${filtered.length === 0
        ? `<div class="card" style="text-align: center; padding: 32px;">
            <div style="font-size: 3rem; margin-bottom: 12px;">📭</div>
            <p class="text-secondary">${isHi ? 'अभी तक कोई जांच नहीं हुई।' : 'No diagnoses yet. Run your first check!'}</p>
           </div>`
        : filtered.map(entry => renderHistoryItem(entry, isHi)).join('')
      }
    </div>

    ${renderBottomNav('history')}
  `;
}

function renderTrendChart(entries) {
  if (entries.length < 2) return '';
  const reversed = [...entries].reverse();
  const maxScore = Math.max(...reversed.map(e => e.score));

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

  const dateStr = new Date(entry.date).toLocaleDateString(isHi ? 'hi-IN' : 'en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return `
    <div class="history-item" onclick="viewHistoryEntry('${entry.id}')">
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
  historyFilter = name;
  renderHistoryScreen();
}

function viewHistoryEntry(id) {
  const entry = State.diagnoseHistory.find(h => h.id === id);
  if (!entry?.result) return showToast('Full data not available for this entry');

  State.results = entry.result;
  State.diagnoseInputs.vehicleId = entry.vehicleId;
  navigateTo('results', 'right');
  renderResultsScreen();
}

function exportHistory() {
  const isHi = State.language === 'hi';
  const csv = [
    'Date,Vehicle,Score,Issues',
    ...State.diagnoseHistory.map(h =>
      `${h.date},"${h.vehicleName}",${h.score},"${h.issues?.join('; ') || ''}"`
    )
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bike_health_history.csv';
  a.click();
  showToast(isHi ? 'CSV डाउनलोड हो रहा है...' : 'Downloading CSV...');
}

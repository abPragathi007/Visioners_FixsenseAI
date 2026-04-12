/* ═══════════════════════════════════════════════════════════
   SCREEN · ESP32 LIVE DATA
   Uses existing design system exclusively — no new CSS.
   ═══════════════════════════════════════════════════════════ */

/* ── Module state (scoped, not global timers) ── */
const Esp32 = {
  connected: true,
  liveInterval: null,
  chart: null,
  currentSensor: 'temp',

  // Simulated sensor baseline values
  sensors: {
    temp:      { base: 88, range: 8,    color: '#EF4444', unit: '°C',  label: 'Temperature' },
    battery:   { base: 40, range: 5,    color: '#FF6B35', unit: '%',   label: 'Battery' },
    vibration: { base: 0.3, range: 0.15, color: '#22C55E', unit: 'g',  label: 'Vibration' },
  },
};

/* ── Render ────────────────────────────────────── */
function renderEsp32Screen() {
  const el = document.getElementById('screen-esp32');
  if (!el) return;

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack(); renderHomeScreen();">${Icons.back}</div>
      <h2 class="page-title">📡 Live Sensor Data</h2>
    </div>

    <div class="screen-scroll scroll-area" style="padding: 0 16px 100px;">

      <!-- Connection status -->
      <div class="fleet-ai-card reveal-card" style="--delay:0s; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.4rem;">📡</span>
          <div>
            <div style="font-size:0.85rem; font-weight:700; color:var(--text-primary);">SmartVehicle_01</div>
            <div style="display:flex; align-items:center; gap:5px; margin-top:3px;">
              <span id="esp32-dot" style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22C55E; animation:voicePulse 2s infinite;"></span>
              <span id="esp32-status-text" style="font-size:0.72rem; color:var(--text-secondary);">Connected via WiFi</span>
            </div>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span class="badge badge-green" id="esp32-conn-badge">✓ Connected</span>
          <button class="btn btn-sm btn-secondary" id="esp32-conn-btn" onclick="esp32ToggleConnect()">Disconnect</button>
          <button class="btn btn-sm btn-secondary" onclick="esp32ToggleScan()">Scan Devices</button>
        </div>
      </div>

      <!-- Scan dropdown -->
      <div id="esp32-scan-drop" style="display:none;" class="fleet-ai-card" style="margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <span style="font-size:0.82rem; color:var(--text-primary);">📡 SmartVehicle_01</span>
          <span class="badge badge-green">In range</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border-subtle);">
          <span style="font-size:0.82rem; color:var(--text-primary);">🔵 BikeDevice_02</span>
          <span class="badge badge-blue">In range</span>
        </div>
        <div style="display:flex; align-items:center; justify-content:space-between; padding:6px 0;">
          <span style="font-size:0.82rem; color:var(--text-primary);">⚪ AutoSensor_03</span>
          <span class="badge" style="background:rgba(100,116,139,0.15); color:var(--text-muted); border:1px solid rgba(100,116,139,0.2);">Weak signal</span>
        </div>
      </div>

      <!-- Live metric cards — reuse .fleet-ai-card + .risk-track/.risk-fill -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:10px; margin-bottom:10px;">

        <!-- Engine Temp -->
        <div class="fleet-ai-card reveal-card" style="--delay:0.05s;">
          <div class="fleet-ai-sub" style="margin-bottom:4px;">🌡️ ENGINE TEMP</div>
          <div class="fleet-ai-title" id="esp32-m-temp" style="font-size:1.4rem; color:#EF4444;">88.0°C</div>
          <div class="fleet-ai-sub" id="esp32-s-temp">Warning: High</div>
          <div class="risk-track" style="margin-top:8px;">
            <div class="risk-fill is-warn" id="esp32-p-temp" style="width:47%;"></div>
          </div>
        </div>

        <!-- Battery -->
        <div class="fleet-ai-card reveal-card" style="--delay:0.1s;">
          <div class="fleet-ai-sub" style="margin-bottom:4px;">🔋 BATTERY</div>
          <div class="fleet-ai-title" id="esp32-m-bat" style="font-size:1.4rem; color:#FF6B35;">40%</div>
          <div class="fleet-ai-sub" id="esp32-s-bat">Low charge</div>
          <div class="risk-track" style="margin-top:8px;">
            <div class="risk-fill is-warn" id="esp32-p-bat" style="width:40%;"></div>
          </div>
        </div>

        <!-- Vibration -->
        <div class="fleet-ai-card reveal-card" style="--delay:0.15s;">
          <div class="fleet-ai-sub" style="margin-bottom:4px;">📳 VIBRATION</div>
          <div class="fleet-ai-title" id="esp32-m-vib" style="font-size:1.4rem; color:#22C55E;">0.30g</div>
          <div class="fleet-ai-sub" id="esp32-s-vib">Normal</div>
          <div class="risk-track" style="margin-top:8px;">
            <div class="risk-fill is-ok" id="esp32-p-vib" style="width:15%;"></div>
          </div>
        </div>
      </div>

      <!-- Real-time chart -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.2s; margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <div>
            <div class="fleet-ai-title">📈 Real-Time Chart</div>
            <div class="fleet-ai-sub">Updates every 2s</div>
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;" id="esp32-tabs">
            <button class="alert-filter active" data-sensor="temp" onclick="esp32SwitchTab('temp', this)">Temp</button>
            <button class="alert-filter" data-sensor="battery" onclick="esp32SwitchTab('battery', this)">Battery</button>
            <button class="alert-filter" data-sensor="vibration" onclick="esp32SwitchTab('vibration', this)">Vibration</button>
          </div>
        </div>
        <div style="display:flex; gap:16px; margin-bottom:8px;">
          <div style="display:flex; align-items:center; gap:5px; font-size:0.72rem; color:var(--text-secondary);">
            <span id="esp32-legend-dot" style="display:inline-block; width:10px; height:10px; border-radius:2px; background:#EF4444;"></span> Actual
          </div>
          <div style="display:flex; align-items:center; gap:5px; font-size:0.72rem; color:var(--text-secondary);">
            <span style="display:inline-block; width:18px; height:2px; background:repeating-linear-gradient(90deg,#FF6B35 0,#FF6B35 4px,transparent 4px,transparent 8px);"></span> Predicted
          </div>
        </div>
        <div style="position:relative; height:180px;">
          <canvas id="esp32-chart"></canvas>
        </div>
      </div>

      <!-- Breakdown detection — mimics emergency-btn pattern -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.25s; background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(17,24,39,0.7)); border-color:rgba(239,68,68,0.3); margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <span style="font-size:0.78rem; color:#F87171; font-weight:700;">⚠ Warning Detected</span>
          <span class="badge badge-red">WARNING</span>
        </div>
        <div class="fleet-ai-title">Engine Overheating</div>
        <div class="fleet-ai-sub" style="margin-bottom:4px;"><strong style="color:var(--text-primary);">Reason:</strong> Heavy traffic + low coolant detected by sensor</div>
        <div class="fleet-ai-sub" style="margin-bottom:12px;"><strong style="color:var(--text-primary);">Fix:</strong> Stop vehicle · Cool engine · Check coolant level</div>
        <button class="btn btn-danger btn-full btn-sm" onclick="esp32ToggleFixGuide(this)">Get Fix Guide →</button>
        <div id="esp32-fix-guide" style="display:none; margin-top:10px; border-top:1px solid rgba(239,68,68,0.2); padding-top:10px;">
          <div class="fleet-ai-list">
            <div class="alert-item">1. 🚗 Pull over safely and turn off the engine</div>
            <div class="alert-item">2. ⏳ Wait 15–20 minutes for engine to cool</div>
            <div class="alert-item">3. 🧴 Check coolant reservoir — top up if low</div>
            <div class="alert-item">4. 🔍 Inspect hoses or radiator for leaks</div>
            <div class="alert-item">5. 🏪 Visit nearest service center if issue persists</div>
          </div>
        </div>
      </div>

      <!-- Smart Alerts — reuse alert-item / alert-filter pattern -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.3s; margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; flex-wrap:wrap; gap:6px;">
          <div class="fleet-ai-title">🚨 Smart Alerts</div>
          <div style="display:flex; gap:6px;" id="esp32-alert-filters">
            <button class="alert-filter active" data-filter="all" onclick="esp32FilterAlerts('all', this)">All</button>
            <button class="alert-filter" data-filter="critical" onclick="esp32FilterAlerts('critical', this)">Critical</button>
            <button class="alert-filter" data-filter="warning" onclick="esp32FilterAlerts('warning', this)">Warning</button>
          </div>
        </div>
        <div class="alert-list" id="esp32-alert-list">
          <div class="alert-item" data-alert-type="critical">🔴 <div><div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Engine overheating</div><div class="fleet-ai-sub">Temp reached 92°C · Reduce load</div></div><div style="margin-left:auto; font-size:0.68rem; color:var(--text-muted);">Now</div></div>
          <div class="alert-item" data-alert-type="warning">🟠 <div><div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Battery critically low</div><div class="fleet-ai-sub">Below 40% · Recharge soon</div></div><div style="margin-left:auto; font-size:0.68rem; color:var(--text-muted);">2m ago</div></div>
          <div class="alert-item" data-alert-type="warning">🟡 <div><div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Tire pressure low</div><div class="fleet-ai-sub">Front tire: 26 PSI</div></div><div style="margin-left:auto; font-size:0.68rem; color:var(--text-muted);">8m ago</div></div>
        </div>
      </div>

      <!-- All Sensors panel -->
      <div class="fleet-ai-card reveal-card" style="--delay:0.35s; margin-bottom:10px;">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
          <div class="fleet-ai-title">🔬 All Sensors</div>
          <span class="badge badge-green">Live</span>
        </div>
        <div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
            <div style="width:30px; height:30px; border-radius:var(--radius-sm); background:rgba(239,68,68,0.15); display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0;">🌡️</div>
            <div style="flex:1;">
              <div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Engine Temp</div>
              <div class="fleet-ai-sub" id="esp32-sv-temp">88.0°C · Normal &lt;95°C</div>
            </div>
            <span class="badge badge-amber">High</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
            <div style="width:30px; height:30px; border-radius:var(--radius-sm); background:rgba(255,107,53,0.15); display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0;">🔋</div>
            <div style="flex:1;">
              <div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Battery</div>
              <div class="fleet-ai-sub" id="esp32-sv-bat">40% · 12.1V</div>
            </div>
            <span class="badge badge-red">Low</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px solid var(--border-subtle);">
            <div style="width:30px; height:30px; border-radius:var(--radius-sm); background:rgba(100,116,139,0.15); display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0;">🛞</div>
            <div style="flex:1;">
              <div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Tire Pressure</div>
              <div class="fleet-ai-sub">F: 26 PSI · R: 30 PSI</div>
            </div>
            <span class="badge badge-amber">Check</span>
          </div>
          <div style="display:flex; align-items:center; gap:10px; padding:8px 0;">
            <div style="width:30px; height:30px; border-radius:var(--radius-sm); background:rgba(34,197,94,0.15); display:flex; align-items:center; justify-content:center; font-size:0.95rem; flex-shrink:0;">📳</div>
            <div style="flex:1;">
              <div style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Vibration</div>
              <div class="fleet-ai-sub" id="esp32-sv-vib">0.30g · Smooth</div>
            </div>
            <span class="badge badge-green" id="esp32-sv-vib-badge">Normal</span>
          </div>
        </div>
      </div>

      <!-- Voice alert + connection mode -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:10px; margin-bottom:10px;">
        <div class="fleet-ai-card reveal-card" style="--delay:0.4s;">
          <div class="fleet-ai-title" style="margin-bottom:10px;">🔊 Voice Alert</div>
          <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-secondary" onclick="esp32Speak('engine')">🔊 Speak</button>
            <span id="esp32-voice-status" class="fleet-ai-sub">Click to announce</span>
          </div>
          <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
            <button class="btn btn-sm btn-ghost" style="font-size:0.7rem; padding:5px 8px;" onclick="esp32Speak('engine')">Engine</button>
            <button class="btn btn-sm btn-ghost" style="font-size:0.7rem; padding:5px 8px;" onclick="esp32Speak('battery')">Battery</button>
            <button class="btn btn-sm btn-ghost" style="font-size:0.7rem; padding:5px 8px;" onclick="esp32Speak('tire')">Tire</button>
          </div>
        </div>

        <div class="fleet-ai-card reveal-card" style="--delay:0.45s;">
          <div class="fleet-ai-title" style="margin-bottom:10px;">🔗 Connection Mode</div>
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
            <span class="fleet-ai-sub">📶 WiFi (ESP32 → Server)</span>
            <span class="badge badge-green" id="esp32-wifi-badge">Active</span>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between;">
            <span class="fleet-ai-sub">🔵 Bluetooth (Demo)</span>
            <span class="badge" style="background:rgba(100,116,139,0.15); color:var(--text-muted); border:1px solid rgba(100,116,139,0.2);">Idle</span>
          </div>
          <div class="fleet-ai-sub" style="margin-top:8px; font-family:monospace;">
            ESP32 → WiFi → Firebase → Dashboard
          </div>
        </div>
      </div>

    </div>
  `;

  // Init chart + start live updates after DOM is ready
  queueMicrotask(() => {
    esp32InitChart(Esp32.currentSensor);
    esp32StartLive();
  });

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

/* ── Chart ─────────────────────────────────────── */
function _esp32GenData(base, range, count) {
  const out = [];
  let v = base;
  for (let i = 0; i < count; i++) {
    v += (Math.random() - 0.48) * range * 0.4;
    v = Math.max(base - range, Math.min(base + range, v));
    out.push(parseFloat(v.toFixed(3)));
  }
  return out;
}

function _esp32GenLabels(count) {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.now() - (count - 1 - i) * 2000);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  });
}

function esp32InitChart(sensor) {
  const canvas = document.getElementById('esp32-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const cfg = Esp32.sensors[sensor];
  const actual = _esp32GenData(cfg.base, cfg.range, 20);
  const labels = _esp32GenLabels(20);
  const predicted = actual.map((v, i) =>
    i >= 16 ? parseFloat((v + (Math.random() - 0.4) * cfg.range * 0.5).toFixed(3)) : null
  );

  if (Esp32.chart) { Esp32.chart.destroy(); Esp32.chart = null; }

  Esp32.chart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Actual',
          data: actual,
          borderColor: cfg.color,
          backgroundColor: 'transparent',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 4,
          tension: 0.4,
        },
        {
          label: 'Predicted',
          data: predicted,
          borderColor: '#FF6B35',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 4],
          pointRadius: 2,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1A2235',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          titleColor: '#F1F5F9',
          bodyColor: '#94A3B8',
          callbacks: {
            label: ctx => ` ${ctx.parsed.y.toFixed(2)}${cfg.unit}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#64748B', font: { size: 9 }, maxTicksLimit: 5 },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        y: {
          ticks: { color: '#64748B', font: { size: 9 } },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
    },
  });

  // Sync legend dot color
  const dot = document.getElementById('esp32-legend-dot');
  if (dot) dot.style.background = cfg.color;
}

function esp32SwitchTab(sensor, btn) {
  Esp32.currentSensor = sensor;
  document.querySelectorAll('#esp32-tabs .alert-filter').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  esp32InitChart(sensor);
}

/* ── Live Updates ──────────────────────────────── */
function esp32StartLive() {
  esp32StopLive(); // always clear before starting — no duplicate timers
  Esp32.liveInterval = setInterval(() => {
    if (!Esp32.connected) return;

    // Update chart
    const cfg = Esp32.sensors[Esp32.currentSensor];
    if (Esp32.chart) {
      const val = parseFloat((cfg.base + (Math.random() - 0.48) * cfg.range).toFixed(3));
      const label = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      Esp32.chart.data.labels.push(label);
      Esp32.chart.data.datasets[0].data.push(val);

      const len = Esp32.chart.data.datasets[0].data.length;
      Esp32.chart.data.datasets[1].data = Esp32.chart.data.datasets[0].data.map((v, i) =>
        i >= len - 4 ? parseFloat((v + (Math.random() - 0.4) * cfg.range * 0.5).toFixed(3)) : null
      );

      if (Esp32.chart.data.labels.length > 25) {
        Esp32.chart.data.labels.shift();
        Esp32.chart.data.datasets[0].data.shift();
        Esp32.chart.data.datasets[1].data.shift();
      }
      Esp32.chart.update('none');
    }

    // Update metric cards
    const newTemp = parseFloat((88 + (Math.random() - 0.48) * 8).toFixed(1));
    const newBat  = parseFloat((40 + (Math.random() - 0.48) * 5).toFixed(0));
    const newVib  = parseFloat((0.3 + (Math.random() - 0.48) * 0.15).toFixed(2));
    esp32UpdateMetrics(newTemp, newBat, newVib);
  }, 2000);
}

function esp32StopLive() {
  if (Esp32.liveInterval) {
    clearInterval(Esp32.liveInterval);
    Esp32.liveInterval = null;
  }
}

/* ── Metric card updates ───────────────────────── */
function esp32UpdateMetrics(temp, bat, vib) {
  const tempEl = document.getElementById('esp32-m-temp');
  const batEl  = document.getElementById('esp32-m-bat');
  const vibEl  = document.getElementById('esp32-m-vib');
  if (!tempEl || !batEl || !vibEl) return; // screen not visible

  // Temp
  const tempColor = temp > 100 ? '#EF4444' : temp > 90 ? '#FF6B35' : '#22C55E';
  tempEl.textContent = temp.toFixed(1) + '°C';
  tempEl.style.color = tempColor;
  const pTemp = document.getElementById('esp32-p-temp');
  if (pTemp) {
    pTemp.style.width = Math.min(100, Math.max(0, ((temp - 60) / 60 * 100))).toFixed(0) + '%';
    pTemp.className = 'risk-fill ' + (temp > 90 ? 'is-warn' : 'is-ok');
  }
  const sTemp = document.getElementById('esp32-s-temp');
  if (sTemp) sTemp.textContent = temp > 100 ? 'Critical: Overheat' : temp > 90 ? 'Warning: High' : 'Normal';
  const svTemp = document.getElementById('esp32-sv-temp');
  if (svTemp) svTemp.textContent = temp.toFixed(1) + '°C · Normal <95°C';

  // Battery
  const batColor = bat < 30 ? '#EF4444' : bat < 50 ? '#FF6B35' : '#22C55E';
  batEl.textContent = bat.toFixed(0) + '%';
  batEl.style.color = batColor;
  const pBat = document.getElementById('esp32-p-bat');
  if (pBat) {
    pBat.style.width = bat.toFixed(0) + '%';
    pBat.className = 'risk-fill ' + (bat < 50 ? 'is-warn' : 'is-ok');
  }
  const sBat = document.getElementById('esp32-s-bat');
  if (sBat) sBat.textContent = bat < 30 ? 'Critical: Recharge now' : bat < 50 ? 'Low charge' : 'Good';
  const svBat = document.getElementById('esp32-sv-bat');
  if (svBat) svBat.textContent = bat.toFixed(0) + '% · 12.1V';

  // Vibration
  const vibColor = vib > 1.2 ? '#EF4444' : vib > 0.6 ? '#FF6B35' : '#22C55E';
  vibEl.textContent = vib.toFixed(2) + 'g';
  vibEl.style.color = vibColor;
  const pVib = document.getElementById('esp32-p-vib');
  if (pVib) {
    pVib.style.width = Math.min(100, (vib / 2 * 100)).toFixed(0) + '%';
    pVib.className = 'risk-fill ' + (vib < 0.6 ? 'is-ok' : 'is-warn');
  }
  const sVib = document.getElementById('esp32-s-vib');
  if (sVib) sVib.textContent = vib > 1.2 ? 'Rough ride' : vib > 0.6 ? 'Moderate' : 'Normal';
  const svVib = document.getElementById('esp32-sv-vib');
  if (svVib) svVib.textContent = vib.toFixed(2) + 'g · ' + (vib < 0.6 ? 'Smooth' : 'Bumpy');
}

/* ── Connect / Disconnect ──────────────────────── */
function esp32ToggleConnect() {
  Esp32.connected = !Esp32.connected;

  const dot    = document.getElementById('esp32-dot');
  const status = document.getElementById('esp32-status-text');
  const btn    = document.getElementById('esp32-conn-btn');
  const badge  = document.getElementById('esp32-conn-badge');
  const wifiBadge = document.getElementById('esp32-wifi-badge');

  if (Esp32.connected) {
    dot && (dot.style.background = '#22C55E');
    status && (status.textContent = 'Connected via WiFi');
    btn && (btn.textContent = 'Disconnect');
    if (badge) { badge.textContent = '✓ Connected'; badge.className = 'badge badge-green'; }
    if (wifiBadge) { wifiBadge.textContent = 'Active'; wifiBadge.className = 'badge badge-green'; }
    esp32StartLive();
    showToast('ESP32 connected');
  } else {
    dot && (dot.style.background = '#EF4444');
    status && (status.textContent = 'Disconnected');
    btn && (btn.textContent = 'Connect');
    if (badge) { badge.textContent = '✗ Offline'; badge.className = 'badge badge-red'; }
    if (wifiBadge) { wifiBadge.textContent = 'Idle'; wifiBadge.className = 'badge'; }
    esp32StopLive();
    showToast('ESP32 disconnected');
  }
}

/* ── Scan Dropdown ─────────────────────────────── */
function esp32ToggleScan() {
  const el = document.getElementById('esp32-scan-drop');
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

/* ── Fix Guide ─────────────────────────────────── */
function esp32ToggleFixGuide(btn) {
  const el = document.getElementById('esp32-fix-guide');
  if (!el) return;
  const showing = el.style.display !== 'none';
  el.style.display = showing ? 'none' : 'block';
  btn.textContent = showing ? 'Get Fix Guide →' : 'Hide Fix Guide ↑';
}

/* ── Alert Filters ─────────────────────────────── */
function esp32FilterAlerts(type, btn) {
  document.querySelectorAll('#esp32-alert-filters .alert-filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#esp32-alert-list .alert-item').forEach(item => {
    item.style.display = type === 'all' || item.dataset.alertType === type ? 'flex' : 'none';
  });
}

/* ── Voice Alerts (robust with voice picker + Chrome bug fix) ── */
const _esp32AlertText = {
  engine:  'Warning. Engine overheating detected. Temperature is above 90 degrees Celsius. Please stop your vehicle and check the coolant level immediately.',
  battery: 'Warning. Battery level is critically low. Please recharge your vehicle battery as soon as possible.',
  tire:    'Alert. Tire pressure is low on the front tire at 26 PSI. Please inflate to the recommended pressure.',
};

function esp32Speak(type) {
  const statusEl = document.getElementById('esp32-voice-status');
  const synth    = window.speechSynthesis;

  if (!synth) {
    if (statusEl) statusEl.textContent = '⚠ Voice not supported';
    return;
  }

  const text = _esp32AlertText[type] || _esp32AlertText.engine;
  synth.cancel();

  function _pick() {
    const voices = synth.getVoices();
    return voices.find(v => v.lang === 'en-IN')
      || voices.find(v => v.lang.startsWith('en-IN'))
      || voices.find(v => v.lang === 'en-US')
      || voices.find(v => v.lang.startsWith('en'))
      || null;
  }

  function _doSpeak() {
    const utt   = new SpeechSynthesisUtterance(text);
    const voice = _pick();
    if (voice) utt.voice = voice;
    utt.lang   = voice ? voice.lang : 'en-US';
    utt.rate   = 0.9;
    utt.pitch  = 1;
    utt.volume = 1;
    if (statusEl) statusEl.textContent = '🔊 Speaking...';
    utt.onend = () => {
      if (statusEl) {
        statusEl.textContent = '✓ Announced';
        setTimeout(() => { if (statusEl) statusEl.textContent = 'Click to announce'; }, 2500);
      }
    };
    utt.onerror = () => { if (statusEl) statusEl.textContent = 'Error — try again'; };
    synth.speak(utt);
    // Chrome bug: synthesizer can silently pause — wake it up
    setTimeout(() => { if (synth.paused) synth.resume(); }, 150);
  }

  // Voices may not be loaded yet on first call
  if (synth.getVoices().length > 0) {
    _doSpeak();
  } else {
    synth.addEventListener('voiceschanged', _doSpeak, { once: true });
    setTimeout(_doSpeak, 600); // hard fallback in case event never fires
  }
}

/* ── Cleanup when leaving screen ──────────────── */
// Called by navigateTo when screen changes — stops the timer safely
window.addEventListener('esp32:leave', esp32StopLive);

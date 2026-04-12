/* ═══════════════════════════════════════════════════════════
   RIDERAKSHA EXTENDED MODULES
   Modules 1,3,5,6,7,8,9,10,11,12
   ═══════════════════════════════════════════════════════════ */

/* ── MODULE 1: Web Bluetooth + Auto-Reconnect ── */
const BLE = {
  device: null,
  server: null,
  reconnectAttempts: 0,
  maxReconnect: 3,
  reconnectTimer: null,
  simMode: true,
};

async function bleConnect() {
  if (!navigator.bluetooth) {
    showToast('Web Bluetooth not supported — simulation mode active');
    BLE.simMode = true;
    Esp32.connected = true;
    _bleUpdateUI(true);
    if (typeof esp32StartLive === 'function') esp32StartLive();
    return;
  }
  try {
    showToast('Scanning for SmartVehicle devices…');
    BLE.device = await navigator.bluetooth.requestDevice({
      filters: [{ namePrefix: 'SmartVehicle' }],
      optionalServices: ['battery_service'],
    });
    BLE.device.addEventListener('gattserverdisconnected', _bleOnDisconnect);
    BLE.server = await BLE.device.gatt.connect();
    BLE.reconnectAttempts = 0;
    BLE.simMode = false;
    Esp32.connected = true;
    _bleUpdateUI(true);
    showToast('Connected to ' + BLE.device.name);
    if (typeof esp32StartLive === 'function') esp32StartLive();
  } catch (err) {
    showToast('BLE unavailable — simulation mode active');
    BLE.simMode = true;
    Esp32.connected = true;
    _bleUpdateUI(true);
    if (typeof esp32StartLive === 'function') esp32StartLive();
  }
}

function _bleOnDisconnect() {
  Esp32.connected = false;
  _bleUpdateUI(false);
  showToast('Device disconnected — reconnecting…');
  _bleScheduleReconnect();
}

function _bleScheduleReconnect() {
  if (BLE.reconnectAttempts >= BLE.maxReconnect) {
    showToast('Reconnect failed — switching to simulation');
    BLE.simMode = true;
    Esp32.connected = true;
    _bleUpdateUI(true);
    if (typeof esp32StartLive === 'function') esp32StartLive();
    return;
  }
  BLE.reconnectTimer = setTimeout(async () => {
    BLE.reconnectAttempts++;
    try {
      if (BLE.device) {
        BLE.server = await BLE.device.gatt.connect();
        BLE.reconnectAttempts = 0;
        Esp32.connected = true;
        _bleUpdateUI(true);
        showToast('Reconnected!');
        if (typeof esp32StartLive === 'function') esp32StartLive();
      }
    } catch { _bleScheduleReconnect(); }
  }, 5000);
}

function _bleUpdateUI(connected) {
  const dot = document.getElementById('esp32-dot');
  const status = document.getElementById('esp32-status-text');
  const btn = document.getElementById('esp32-conn-btn');
  const badge = document.getElementById('esp32-conn-badge');
  if (dot) dot.style.background = connected ? '#22C55E' : '#EF4444';
  if (status) status.textContent = connected ? (BLE.simMode ? 'Simulation Mode' : 'Connected via BLE') : 'Disconnected';
  if (btn) btn.textContent = connected ? 'Disconnect' : 'Connect';
  if (badge) {
    badge.textContent = connected ? '● Connected' : '✗ Offline';
    badge.className = 'badge ' + (connected ? 'badge-green' : 'badge-red');
  }
}

/* ── MODULE 3: Smart Alert System ── */
const AlertManager = {
  history: [],
  lastAlertTime: {},
  COOLDOWN_MS: 30000,
};

function alertCheckThresholds(temp, bat, vib) {
  const now = Date.now();
  const checks = [
    { sensor: 'engine',    trigger: temp > 100, msg: `Engine overheating: ${temp.toFixed(1)}C` },
    { sensor: 'battery',   trigger: bat < 25,   msg: `Battery critically low: ${bat.toFixed(0)}%` },
    { sensor: 'vibration', trigger: vib > 1.2,  msg: `Severe vibration: ${vib.toFixed(2)}g` },
  ];
  checks.forEach(c => {
    if (!c.trigger) return;
    const last = AlertManager.lastAlertTime[c.sensor] || 0;
    if (now - last < AlertManager.COOLDOWN_MS) return;
    AlertManager.lastAlertTime[c.sensor] = now;
    const entry = { sensor: c.sensor, message: c.msg, time: new Date().toLocaleTimeString('en-IN'), location: null };
    AlertManager.history.unshift(entry);
    _alertShowModal(c.sensor, c.msg);
    _alertFlashScreen();
    alertSpeak(c.sensor);
    _alertCaptureLocation(entry);
    _alertUpdateHistoryUI();
  });
}

function _alertShowModal(sensor, msg) {
  document.getElementById('rr-alert-modal')?.remove();
  const modal = document.createElement('div');
  modal.id = 'rr-alert-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.85);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML = `
    <div style="background:#1A2235;border:2px solid #EF4444;border-radius:16px;padding:24px;max-width:380px;width:100%;text-align:center;">
      <div style="font-size:3rem;margin-bottom:12px;">🚨</div>
      <div style="font-size:1.1rem;font-weight:800;color:#F87171;margin-bottom:8px;">CRITICAL ALERT</div>
      <div style="font-size:0.9rem;color:#F1F5F9;margin-bottom:20px;">${msg}</div>
      <div style="display:flex;gap:10px;">
        <button onclick="document.getElementById('rr-alert-modal').remove()" style="flex:1;padding:12px;background:#374151;border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;">Dismiss</button>
        <button onclick="alertSpeak('${sensor}');document.getElementById('rr-alert-modal').remove()" style="flex:1;padding:12px;background:#EF4444;border:none;border-radius:8px;color:#fff;font-weight:700;cursor:pointer;">Speak Alert</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function _alertFlashScreen() {
  let overlay = document.getElementById('rr-flash-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'rr-flash-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;border:6px solid #EF4444;animation:rrFlash 1s ease 3;';
    document.body.appendChild(overlay);
    const style = document.getElementById('rr-flash-style') || document.createElement('style');
    style.id = 'rr-flash-style';
    style.textContent = '@keyframes rrFlash{0%,100%{opacity:0}50%{opacity:1}}';
    document.head.appendChild(style);
    setTimeout(() => overlay.remove(), 3100);
  }
}

function _alertUpdateHistoryUI() {
  const el = document.getElementById('rr-alert-history-list');
  if (!el) return;
  el.innerHTML = AlertManager.history.slice(0, 20).map(a => `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <span style="font-size:1rem;">🔴</span>
      <div style="flex:1;">
        <div style="font-size:0.78rem;font-weight:600;color:#F1F5F9;">${a.message}</div>
        <div style="font-size:0.68rem;color:#64748B;">${a.time}${a.location ? ' · ' + a.location : ''}</div>
      </div>
    </div>`).join('') || '<div style="font-size:0.8rem;color:#64748B;padding:8px 0;">No alerts yet</div>';
}

function _alertCaptureLocation(entry) {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    entry.location = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    entry.mapsUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
    _alertUpdateHistoryUI();
  }, () => {});
}

/* ── MODULE 8: Multilingual Voice Alerts ── */
const VOICE_LANG_MAP = { en: 'en-IN', hi: 'hi-IN', kn: 'kn-IN', ta: 'ta-IN', te: 'te-IN' };
const ALERT_TEXTS = {
  engine: {
    en: 'Warning. Engine overheating detected. Please stop your vehicle immediately.',
    hi: 'चेतावनी। इंजन ओवरहीट हो रहा है। कृपया तुरंत गाड़ी रोकें।',
    kn: 'ಎಚ್ಚರಿಕೆ. ಎಂಜಿನ್ ಓವರ್ ಹೀಟ್ ಆಗುತ್ತಿದೆ. ದಯವಿಟ್ಟು ತಕ್ಷಣ ವಾಹನ ನಿಲ್ಲಿಸಿ.',
    ta: 'எச்சரிக்கை. என்ஜின் அதிகமாக சூடாகிறது. உடனே வாகனத்தை நிறுத்துங்கள்.',
    te: 'హెచ్చరిక. ఇంజన్ అతిగా వేడెక్కుతోంది. వెంటనే వాహనాన్ని ఆపండి.',
  },
  battery: {
    en: 'Warning. Battery critically low. Please recharge soon.',
    hi: 'चेतावनी। बैटरी बहुत कम है। जल्दी चार्ज करें।',
    kn: 'ಎಚ್ಚರಿಕೆ. ಬ್ಯಾಟರಿ ತುಂಬಾ ಕಡಿಮೆ. ದಯವಿಟ್ಟು ಶೀಘ್ರ ಚಾರ್ಜ್ ಮಾಡಿ.',
    ta: 'எச்சரிக்கை. பேட்டரி மிகவும் குறைவு. விரைவில் சார்ஜ் செய்யுங்கள்.',
    te: 'హెచ్చరిక. బ్యాటరీ చాలా తక్కువ. వీలైనంత త్వరగా చార్జ్ చేయండి.',
  },
  vibration: {
    en: 'Alert. Severe vibration detected. Check your vehicle immediately.',
    hi: 'अलर्ट। तेज कंपन महसूस हो रहा है। तुरंत गाड़ी जांचें।',
    kn: 'ಎಚ್ಚರಿಕೆ. ತೀವ್ರ ಕಂಪನ ಪತ್ತೆಯಾಗಿದೆ. ತಕ್ಷಣ ವಾಹನ ಪರಿಶೀಲಿಸಿ.',
    ta: 'எச்சரிக்கை. கடுமையான அதிர்வு கண்டறியப்பட்டது. உடனே வாகனத்தை சரிபாருங்கள்.',
    te: 'హెచ్చరిక. తీవ్రమైన కంపనం గుర్తించబడింది. వెంటనే వాహనాన్ని తనిఖీ చేయండి.',
  },
};

let _alertVoiceLang = 'en';

function alertSpeak(type) {
  const synth = window.speechSynthesis;
  if (!synth) return;
  const lang = _alertVoiceLang;
  const text = (ALERT_TEXTS[type] || ALERT_TEXTS.engine)[lang] || (ALERT_TEXTS[type] || ALERT_TEXTS.engine).en;
  const langCode = VOICE_LANG_MAP[lang] || 'en-IN';
  synth.cancel();
  function doSpeak() {
    const utt = new SpeechSynthesisUtterance(text);
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang === langCode) || voices.find(v => v.lang.startsWith(lang)) || null;
    if (voice) utt.voice = voice;
    utt.lang = langCode;
    utt.rate = 0.9;
    synth.speak(utt);
    setTimeout(() => { if (synth.paused) synth.resume(); }, 150);
  }
  synth.getVoices().length > 0 ? doSpeak() : synth.addEventListener('voiceschanged', doSpeak, { once: true });
}

function alertSetVoiceLang(lang) {
  _alertVoiceLang = lang;
  showToast('Voice language: ' + lang.toUpperCase());
}

/* ── MODULE 9: Breakdown Location Sharing ── */
function breakdownShareLocation() {
  if (!navigator.geolocation) { showToast('GPS not available'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    const mapsUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
    const waMsg = encodeURIComponent(`🚨 RideRaksha BREAKDOWN ALERT!\nMy vehicle has broken down.\nLocation: ${mapsUrl}\nCoords: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    const waUrl = `https://wa.me/?text=${waMsg}`;
    window.open(waUrl, '_blank');
    showToast('Opening WhatsApp with location…');
  }, () => showToast('Could not get GPS location'));
}

/* ── MODULE 11: Simulation Mode + Inject Breakdown ── */
let _simModeOn = true;

function simToggle() {
  _simModeOn = !_simModeOn;
  const btn = document.getElementById('rr-sim-toggle-btn');
  if (btn) btn.textContent = _simModeOn ? '🟢 Sim ON' : '⚫ Sim OFF';
  showToast(_simModeOn ? 'Simulation mode ON' : 'Simulation mode OFF');
  if (_simModeOn && typeof esp32StartLive === 'function') esp32StartLive();
  else if (typeof esp32StopLive === 'function') esp32StopLive();
}

function simInjectBreakdown() {
  if (typeof esp32UpdateMetrics === 'function') {
    esp32UpdateMetrics(112, 18, 1.8);
    alertCheckThresholds(112, 18, 1.8);
    showToast('Breakdown injected — critical values set');
  }
}

/* ── MODULE 5: Service Recommendations ── */
const ServiceRecs = { list: [] };

function serviceRecsFromDiagnosis(result) {
  ServiceRecs.list = [];
  if (!result || !result.issues) return;
  result.issues.forEach(issue => {
    ServiceRecs.list.push({
      issue: issue.name,
      action: issue.action,
      costMin: issue.costMin,
      costMax: issue.costMax,
      priority: issue.severity,
    });
  });
  ServiceRecs.list.push({
    issue: 'Nearest Service Center',
    action: 'Visit authorized service center for full inspection',
    costMin: 0,
    costMax: 0,
    priority: 'info',
    isCenter: true,
  });
}

function renderServiceTab() {
  const el = document.getElementById('rr-service-tab-content');
  if (!el) return;
  if (!ServiceRecs.list.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 20px;"><div style="font-size:3rem;margin-bottom:12px;">🔧</div><div style="color:#64748B;">Run a diagnosis to get service recommendations</div></div>';
    return;
  }
  const priorityColor = { critical: '#EF4444', warning: '#FFBB44', monitor: '#22C55E', info: '#60A5FA' };
  el.innerHTML = ServiceRecs.list.map(r => `
    <div style="background:#1A2235;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:10px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <div style="font-size:0.88rem;font-weight:700;color:#F1F5F9;">${r.issue}</div>
        <span style="background:${priorityColor[r.priority]}22;color:${priorityColor[r.priority]};border:1px solid ${priorityColor[r.priority]}44;border-radius:999px;padding:2px 8px;font-size:0.68rem;font-weight:700;">${r.priority.toUpperCase()}</span>
      </div>
      <div style="font-size:0.78rem;color:#94A3B8;margin-bottom:8px;">${r.action}</div>
      ${r.costMin ? `<div style="font-size:0.75rem;color:#FFBB44;">Est. cost: ₹${r.costMin}–₹${r.costMax}</div>` : ''}
      ${r.isCenter ? `<button onclick="window.open('https://www.google.com/maps/search/bike+service+center+near+me','_blank')" style="margin-top:8px;padding:8px 14px;background:#FF6B35;border:none;border-radius:8px;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;">📍 Find Nearest Center</button>` : ''}
    </div>`).join('');
}

/* ── MODULE 6: Trip Log + Health Score + PDF ── */
const TripLog = {
  sessions: JSON.parse(localStorage.getItem('rr_trips') || '[]'),
  current: null,
};

function tripStart() {
  TripLog.current = {
    id: 'trip_' + Date.now(),
    startTime: new Date().toISOString(),
    readings: [],
    alerts: [],
    healthScore: 100,
  };
  showToast('Trip started');
}

function tripRecordReading(temp, bat, vib) {
  if (!TripLog.current) return;
  TripLog.current.readings.push({ t: Date.now(), temp, bat, vib });
  // Recalculate health score
  const breaches = TripLog.current.readings.filter(r => r.temp > 100 || r.bat < 25 || r.vib > 1.2).length;
  TripLog.current.healthScore = Math.max(0, 100 - Math.round((breaches / Math.max(1, TripLog.current.readings.length)) * 100));
}

function tripEnd() {
  if (!TripLog.current) return;
  TripLog.current.endTime = new Date().toISOString();
  TripLog.current.alerts = [...AlertManager.history];
  TripLog.sessions.unshift(TripLog.current);
  if (TripLog.sessions.length > 20) TripLog.sessions.pop();
  localStorage.setItem('rr_trips', JSON.stringify(TripLog.sessions));
  showToast('Trip saved — Health Score: ' + TripLog.current.healthScore);
  TripLog.current = null;
}

function renderTripHistory() {
  const el = document.getElementById('rr-trip-history');
  if (!el) return;
  if (!TripLog.sessions.length) {
    el.innerHTML = '<div style="text-align:center;padding:40px 20px;color:#64748B;">No trips recorded yet</div>';
    return;
  }
  el.innerHTML = TripLog.sessions.map(s => {
    const dur = s.endTime ? Math.round((new Date(s.endTime) - new Date(s.startTime)) / 60000) : '?';
    const scoreColor = s.healthScore >= 75 ? '#22C55E' : s.healthScore >= 50 ? '#FFBB44' : '#EF4444';
    return `<div style="background:#1A2235;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;margin-bottom:8px;display:flex;align-items:center;gap:12px;">
      <div style="width:48px;height:48px;border-radius:50%;background:${scoreColor}22;display:flex;align-items:center;justify-content:center;font-size:0.9rem;font-weight:800;color:${scoreColor};flex-shrink:0;">${s.healthScore}</div>
      <div style="flex:1;">
        <div style="font-size:0.82rem;font-weight:700;color:#F1F5F9;">${new Date(s.startTime).toLocaleDateString('en-IN')}</div>
        <div style="font-size:0.72rem;color:#64748B;">${dur} min · ${s.readings.length} readings · ${s.alerts.length} alerts</div>
      </div>
      <button onclick="tripDownloadPDF('${s.id}')" style="padding:6px 10px;background:#FF6B35;border:none;border-radius:8px;color:#fff;font-size:0.7rem;font-weight:700;cursor:pointer;">PDF</button>
    </div>`;
  }).join('');
}

/* ── MODULE 12: PDF Report ── */
function tripDownloadPDF(tripId) {
  const trip = TripLog.sessions.find(s => s.id === tripId) || TripLog.sessions[0];
  if (!trip) { showToast('No trip data'); return; }

  // Load jsPDF dynamically if not present
  if (typeof window.jspdf === 'undefined' && typeof window.jsPDF === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => _generatePDF(trip);
    document.head.appendChild(script);
  } else {
    _generatePDF(trip);
  }
}

function _generatePDF(trip) {
  const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
  if (!jsPDF) { showToast('PDF library not loaded'); return; }
  const doc = new jsPDF();
  const vehicle = State.vehicles[0];

  // Header
  doc.setFillColor(255, 107, 53);
  doc.rect(0, 0, 210, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('RideRaksha — Vehicle Health Report', 14, 18);

  // Vehicle info
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  let y = 38;
  doc.text('Vehicle: ' + (vehicle ? `${vehicle.nickname} · ${vehicle.brand} ${vehicle.model} (${vehicle.year})` : 'N/A'), 14, y);
  y += 7;
  doc.text('Trip Date: ' + new Date(trip.startTime).toLocaleString('en-IN'), 14, y);
  y += 7;
  doc.text('Duration: ' + (trip.endTime ? Math.round((new Date(trip.endTime) - new Date(trip.startTime)) / 60000) + ' min' : 'Ongoing'), 14, y);
  y += 7;

  // Health score
  const scoreColor = trip.healthScore >= 75 ? [34, 197, 94] : trip.healthScore >= 50 ? [255, 187, 68] : [239, 68, 68];
  doc.setFillColor(...scoreColor);
  doc.roundedRect(14, y, 60, 18, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Health Score: ' + trip.healthScore + '/100', 17, y + 12);
  y += 26;

  // Sensor summary
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Sensor Summary (' + trip.readings.length + ' readings)', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  if (trip.readings.length) {
    const temps = trip.readings.map(r => r.temp);
    const bats = trip.readings.map(r => r.bat);
    doc.text(`Engine Temp — Avg: ${(temps.reduce((a,b)=>a+b,0)/temps.length).toFixed(1)}°C  Max: ${Math.max(...temps).toFixed(1)}°C`, 14, y); y += 6;
    doc.text(`Battery — Avg: ${(bats.reduce((a,b)=>a+b,0)/bats.length).toFixed(0)}%  Min: ${Math.min(...bats).toFixed(0)}%`, 14, y); y += 6;
  }

  // Alerts
  y += 4;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Alert History (' + trip.alerts.length + ' alerts)', 14, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  trip.alerts.slice(0, 10).forEach(a => {
    doc.text(`• [${a.time}] ${a.message}`, 14, y);
    y += 5;
    if (y > 270) { doc.addPage(); y = 20; }
  });

  // AI Diagnosis
  if (State.results) {
    y += 4;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Diagnosis', 14, y); y += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Summary: ' + (State.results.summary || ''), 14, y, { maxWidth: 180 }); y += 10;
    (State.results.issues || []).slice(0, 5).forEach(issue => {
      doc.text(`• [${issue.severity.toUpperCase()}] ${issue.name} — ${issue.action}`, 14, y, { maxWidth: 180 });
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by RideRaksha · India\'s Smart Vehicle Health Monitor', 14, 290);

  doc.save('RideRaksha_Report_' + new Date().toISOString().split('T')[0] + '.pdf');
  showToast('PDF downloaded!');
}

/* ── MODULE 7: User/Vehicle Profile (localStorage auth) ── */
const UserProfile = {
  get() { return JSON.parse(localStorage.getItem('rr_user') || 'null'); },
  save(data) { localStorage.setItem('rr_user', JSON.stringify(data)); },
  clear() { localStorage.removeItem('rr_user'); },
};

function renderUserProfileModal() {
  document.getElementById('rr-user-modal')?.remove();
  const user = UserProfile.get() || {};
  const modal = document.createElement('div');
  modal.id = 'rr-user-modal';
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-box" style="max-width:420px;max-height:90vh;overflow-y:auto;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 class="modal-title" style="margin:0;">👤 User Profile</h3>
        <button class="btn btn-ghost btn-sm" onclick="document.getElementById('rr-user-modal').remove()">✕</button>
      </div>
      <div class="form-group">
        <label class="label">Full Name</label>
        <input type="text" class="input-field" id="rr-u-name" value="${user.name||''}" placeholder="Your name" />
      </div>
      <div class="form-group">
        <label class="label">Contact Number</label>
        <input type="tel" class="input-field" id="rr-u-phone" value="${user.phone||''}" placeholder="+91 XXXXX XXXXX" />
      </div>
      <div class="form-group">
        <label class="label">Profile Photo</label>
        <div style="display:flex;align-items:center;gap:12px;">
          <div id="rr-u-photo-preview" style="width:60px;height:60px;border-radius:50%;background:#1A2235;border:2px solid rgba(255,107,53,0.3);display:flex;align-items:center;justify-content:center;font-size:1.8rem;overflow:hidden;">
            ${user.photo ? `<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover;" />` : '🧑‍🔧'}
          </div>
          <label class="btn btn-secondary btn-sm" style="cursor:pointer;">
            📷 Upload Photo
            <input type="file" accept="image/*" style="display:none;" onchange="rrUploadProfilePhoto(event)" />
          </label>
        </div>
      </div>
      <div class="form-group">
        <label class="label">ESP32 Device ID</label>
        <input type="text" class="input-field" id="rr-u-device" value="${user.deviceId||''}" placeholder="SmartVehicle_01" />
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;">
        <button class="btn btn-ghost btn-full" onclick="document.getElementById('rr-user-modal').remove()">Cancel</button>
        <button class="btn btn-primary btn-full" onclick="rrSaveUserProfile()">💾 Save Profile</button>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function rrUploadProfilePhoto(ev) {
  const file = ev.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const preview = document.getElementById('rr-u-photo-preview');
    if (preview) preview.innerHTML = `<img src="${reader.result}" style="width:100%;height:100%;object-fit:cover;" />`;
    window._rrTempPhoto = reader.result;
  };
  reader.readAsDataURL(file);
}

function rrSaveUserProfile() {
  const name = document.getElementById('rr-u-name')?.value.trim();
  if (!name) { showToast('Please enter your name'); return; }
  UserProfile.save({
    name,
    phone: document.getElementById('rr-u-phone')?.value.trim() || '',
    deviceId: document.getElementById('rr-u-device')?.value.trim() || '',
    photo: window._rrTempPhoto || UserProfile.get()?.photo || null,
  });
  window._rrTempPhoto = null;
  document.getElementById('rr-user-modal')?.remove();
  showToast('Profile saved!');
}

/* ── MODULE 10: Maintenance Cost Estimator ── */
function renderCostEstimator(issues) {
  if (!issues || !issues.length) return '';
  const fixNow = issues.reduce((sum, i) => sum + (i.costMin || 0), 0);
  const ifIgnored = issues.filter(i => i.severity === 'critical').reduce((sum, i) => sum + (i.costMax || 0) * 3, 0);
  const maxBar = Math.max(fixNow, ifIgnored, 1);
  return `
    <div style="background:#1A2235;border:1px solid rgba(255,107,53,0.2);border-radius:12px;padding:16px;margin-top:12px;">
      <div style="font-size:0.82rem;font-weight:800;color:#F1F5F9;margin-bottom:12px;">💰 Maintenance Cost Estimator</div>
      <div style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;">
          <span style="color:#22C55E;font-weight:700;">Fix Now</span>
          <span style="color:#22C55E;font-weight:700;">₹${fixNow.toLocaleString('en-IN')}</span>
        </div>
        <div style="height:10px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${Math.round(fixNow/maxBar*100)}%;background:#22C55E;border-radius:999px;"></div>
        </div>
      </div>
      <div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;margin-bottom:4px;">
          <span style="color:#EF4444;font-weight:700;">If Ignored (est. damage)</span>
          <span style="color:#EF4444;font-weight:700;">₹${ifIgnored.toLocaleString('en-IN')}</span>
        </div>
        <div style="height:10px;background:rgba(255,255,255,0.08);border-radius:999px;overflow:hidden;">
          <div style="height:100%;width:${Math.round(ifIgnored/maxBar*100)}%;background:#EF4444;border-radius:999px;"></div>
        </div>
      </div>
      <div style="font-size:0.68rem;color:#64748B;margin-top:8px;">Estimates based on Indian market rates. Actual costs may vary.</div>
    </div>`;
}

/* ── Wire alertCheckThresholds into esp32 live loop ── */
const _origEsp32UpdateMetrics = typeof esp32UpdateMetrics === 'function' ? esp32UpdateMetrics : null;
if (_origEsp32UpdateMetrics) {
  window.esp32UpdateMetrics = function(temp, bat, vib) {
    _origEsp32UpdateMetrics(temp, bat, vib);
    alertCheckThresholds(temp, bat, vib);
    if (TripLog.current) tripRecordReading(temp, bat, vib);
  };
}

/* ── Expose globals ── */
window.bleConnect = bleConnect;
window.simToggle = simToggle;
window.simInjectBreakdown = simInjectBreakdown;
window.alertSpeak = alertSpeak;
window.alertSetVoiceLang = alertSetVoiceLang;
window.breakdownShareLocation = breakdownShareLocation;
window.renderServiceTab = renderServiceTab;
window.renderTripHistory = renderTripHistory;
window.tripStart = tripStart;
window.tripEnd = tripEnd;
window.tripDownloadPDF = tripDownloadPDF;
window.renderUserProfileModal = renderUserProfileModal;
window.rrSaveUserProfile = rrSaveUserProfile;
window.rrUploadProfilePhoto = rrUploadProfilePhoto;
window.renderCostEstimator = renderCostEstimator;
window.serviceRecsFromDiagnosis = serviceRecsFromDiagnosis;

/* ═══════════════════════════════════════════════════════════
   EMERGENCY OVERLAY SCREEN
   ═══════════════════════════════════════════════════════════ */
function showEmergency() {
  const el = document.getElementById('screen-emergency');
  const isHi = State.language === 'hi';

  el.classList.add('active');

  const steps = isHi ? [
    { title: 'तुरंत रोकें', desc: 'सड़क के किनारे गाड़ी लगाएं। इंजन बंद करें। खतरनाक जगह से हटें।' },
    { title: 'ठंडा होने दें', desc: 'इंजन को 20-30 मिनट ठंडा होने दें। रेडिएटर कैप कभी तुरंत नहीं खोलें।' },
    { title: 'तेल जांचें', desc: 'इंजन ठंडा होने के बाद डिपस्टिक से तेल लेवल जांचें।' },
    { title: 'मैकेनिक को बुलाएं', desc: 'नजदीकी सर्विस सेंटर पर कॉल करें। धक्का देकर मैकेनिक के पास ले जाएं।' },
    { title: 'खुद ठीक करने की कोशिश न करें', desc: 'अगर धुआं, तेल लीक, या जलने की बू हो — खुद ठीक करने की कोशिश न करें।' },
  ] : [
    { title: 'Pull Over Immediately', desc: 'Move to the roadside. Turn off the engine. Get to a safe location.' },
    { title: 'Let it Cool Down', desc: 'Wait 20-30 minutes before touching anything. Never open a hot radiator cap.' },
    { title: 'Check Oil Level', desc: 'Once cool, check oil dipstick. Low oil is the #1 cause of breakdowns.' },
    { title: 'Call a Mechanic', desc: 'Call the nearest service centre. Push the bike only if it is safe to do so.' },
    { title: 'Don\'t Force Start', desc: 'If you see smoke, oil dripping, or smell burning — do not attempt to restart.' },
  ];

  el.innerHTML = `
    <div class="emergency-screen-header">
      <div class="back-btn" onclick="hideEmergency()">${Icons.back}</div>
      <div>
        <div class="emergency-screen-title">🚨 ${isHi ? 'इमरजेंसी गाइड' : 'Emergency Guide'}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">${isHi ? 'ऑफलाइन उपलब्ध' : 'Works fully offline'}</div>
      </div>
      <span class="offline-badge">⚡ Offline</span>
    </div>

    <div class="emergency-steps" style="overflow-y: auto; flex: 1; padding-bottom: 40px;">
      ${steps.map((step, i) => `
        <div class="emergency-step">
          <div class="step-number">${i + 1}</div>
          <div class="step-content">
            <div class="step-title">${step.title}</div>
            <div class="step-desc">${step.desc}</div>
          </div>
        </div>
      `).join('')}

      <!-- Call Mechanic Button -->
      <div style="padding: 0 0 16px;">
        <button class="btn btn-danger btn-full btn-lg" onclick="callMechanic()" style="margin-bottom: 10px;">
          📞 ${isHi ? 'मैकेनिक को कॉल करें' : 'Call Nearest Mechanic'}
        </button>
        <button class="btn btn-secondary btn-full" onclick="openMechanicFinder()">
          📍 ${isHi ? 'मैप पर देखें' : 'Find on Maps'}
        </button>
      </div>

      <!-- Warning Signs -->
      <div class="card" style="background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2);">
        <div style="font-size: 0.78rem; font-weight: 700; color: #F87171; margin-bottom: 10px;">
          🚫 ${isHi ? 'ये काम कभी न करें' : 'NEVER do these'}
        </div>
        <ul style="font-size: 0.8rem; color: var(--text-secondary); line-height: 2; padding-left: 16px;">
          <li>${isHi ? 'गर्म इंजन में ठंडा पानी डालना' : 'Pour cold water on a hot engine'}</li>
          <li>${isHi ? 'तेल लीक के साथ गाड़ी चलाना' : 'Ride with visible oil leaks'}</li>
          <li>${isHi ? 'धुएं के साथ स्टार्ट करना' : 'Force start when smoking'}</li>
          <li>${isHi ? 'हाइवे पर गाड़ी रोकना' : 'Stop in the middle of a highway'}</li>
        </ul>
      </div>
    </div>
  `;
}

function hideEmergency() {
  document.getElementById('screen-emergency').classList.remove('active');
}

function callMechanic() {
  // In a real app, this would call the nearest mechanic
  showToast('Opening dialler... (Demo mode)');
  setTimeout(() => window.open('tel:+911800-xxx-xxxx'), 500);
}

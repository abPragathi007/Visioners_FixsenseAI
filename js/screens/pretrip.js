/* ═══════════════════════════════════════════════════════════
   PRE-TRIP CHECK OVERLAY
   ═══════════════════════════════════════════════════════════ */
let pretripAnswers = {};

function showPretrip() {
  const el = document.getElementById('screen-pretrip');
  const isHi = State.language === 'hi';
  pretripAnswers = {};

  el.classList.add('active');
  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();

  const questions = isHi ? [
    { id: 'mirror', text: '🪞 दर्पण और लाइट सही हैं?' },
    { id: 'brakes', text: '🛑 ब्रेक ठीक से काम कर रहे हैं?' },
    { id: 'fuel', text: '⛽ पर्याप्त ईंधन है?' },
  ] : [
    { id: 'mirror', text: '🪞 Are mirrors and lights working properly?' },
    { id: 'brakes', text: '🛑 Are brakes responding well?' },
    { id: 'fuel', text: '⛽ Do you have enough fuel?' },
  ];

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="hidePretrip()">${Icons.back}</div>
      <div>
        <div class="page-title">${isHi ? '30 सेकंड जांच' : 'Pre-Trip Check'}</div>
        <div class="text-xs text-muted">${isHi ? 'आज सुरक्षित है?' : 'Safe to ride today?'}</div>
      </div>
    </div>

    <div class="pretrip-content">
      <div class="pretrip-questions" id="pretrip-questions">
        ${questions.map(q => `
          <div class="pretrip-q" id="q-${q.id}">
            <div class="pretrip-q-text">${q.text}</div>
            <div class="pretrip-q-btns">
              <button class="pretrip-q-btn yes" onclick="answerPretrip('${q.id}', true, this)">
                ✅ ${isHi ? 'हाँ' : 'Yes'}
              </button>
              <button class="pretrip-q-btn no" onclick="answerPretrip('${q.id}', false, this)">
                ❌ ${isHi ? 'नहीं' : 'No'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <div id="pretrip-result"></div>
    </div>
  `;
}

function answerPretrip(id, answer, btn) {
  pretripAnswers[id] = answer;

  // Update button states
  const qEl = document.getElementById(`q-${id}`);
  if (qEl) {
    qEl.querySelectorAll('.pretrip-q-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    qEl.className = `pretrip-q ${answer ? 'answered-yes' : 'answered-no'}`;
  }

  // Check if all answered
  const total = document.querySelectorAll('.pretrip-q').length;
  if (Object.keys(pretripAnswers).length >= total) {
    setTimeout(() => showPretripVerdict(), 500);
  }
}

function showPretripVerdict() {
  const result = document.getElementById('pretrip-result');
  const allGood = Object.values(pretripAnswers).every(v => v === true);
  const isHi = State.language === 'hi';

  result.innerHTML = `
    <div class="pretrip-verdict ${allGood ? 'safe' : 'unsafe'}">
      <span class="verdict-emoji">${allGood ? '🟢' : '🔴'}</span>
      <div class="verdict-text" style="color: ${allGood ? 'var(--brand-green)' : 'var(--brand-red)'};">
        ${allGood
          ? (isHi ? 'सुरक्षित है! चलिए 🏍️' : 'Safe to Ride! ✅')
          : (isHi ? 'रुकिए — जांच करें ⚠️' : 'Not Safe — Fix Issues First ⚠️')}
      </div>
      <div class="verdict-sub">
        ${allGood
          ? (isHi ? 'सभी बुनियादी जांचें पास। सुरक्षित यात्रा करें!' : 'All basic checks passed. Have a safe ride!')
          : (isHi ? 'कुछ समस्याएं हैं। पूरी जांच करवाएं।' : 'Some issues detected. Run a full diagnosis before riding.')}
      </div>
    </div>
    <div style="display: flex; gap: 10px; margin-top: 16px;">
      ${!allGood ? `<button class="btn btn-primary btn-full" onclick="hidePretrip(); startDiagnose(null);">
        🔍 ${isHi ? 'पूरी जांच करें' : 'Full Diagnosis'}
      </button>` : ''}
      <button class="btn btn-ghost btn-full" onclick="hidePretrip();">
        ${isHi ? 'बंद करें' : 'Close'}
      </button>
    </div>
  `;

  result.scrollIntoView({ behavior: 'smooth' });
}

function hidePretrip() {
  document.getElementById('screen-pretrip').classList.remove('active');
  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

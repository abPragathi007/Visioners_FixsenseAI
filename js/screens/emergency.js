/* ═══════════════════════════════════════════════════════════
   EMERGENCY OVERLAY SCREEN — issue-based AI steps + offline fallback
   ═══════════════════════════════════════════════════════════ */

function getEmergencyIssueKey() {
  const el = document.querySelector('input[name="emergency-issue"]:checked');
  return el ? el.value : 'general';
}

function getAiStepsForIssue(issueKey) {
  const lang = State.language === 'hi' ? 'hi' : State.language === 'kn' ? 'kn' : 'en';
  const T = {
    general: {
      en: [
        { title: 'Pull over safely', desc: 'Move to the roadside, turn on hazard lights, turn off the engine.' },
        { title: 'Check fuel & kill switch', desc: 'Verify petrol/CNG, side stand, and kill switch position.' },
        { title: 'Let hot engine cool', desc: 'Wait 15–20 minutes before opening oil cap or radiator.' },
        { title: 'Call for help', desc: 'Contact a mechanic or roadside assistance if unsure.' },
      ],
      hi: [
        { title: 'सुरक्षित रोकें', desc: 'सड़क किनारे लगाएं, हेज़र्ड ऑन करें, इंजन बंद करें।' },
        { title: 'ईंधन और किल स्विच', desc: 'पेट्रोल/CNG, साइड स्टैंड और किल स्विच जांचें।' },
        { title: 'गर्म इंजन ठंडा करें', desc: 'तेल/रेडिएटर कैप गर्म इंजन में न खोलें — 15–20 मिनट इंतजार।' },
        { title: 'मदद बुलाएं', desc: 'संदेह हो तो मैकेनिक या रोडसाइड सहायता।' },
      ],
      kn: [
        { title: 'ಸುರಕ್ಷಿತವಾಗಿ ನಿಲ್ಲಿಸಿ', desc: 'ರಸ್ತೆಯ ಬದಿಯಲ್ಲಿ, ಹೆಜಾರ್ಡ್ ಲೈಟ್, ಇಂಜಿನ್ ಆಫ್.' },
        { title: 'ಇಂಧನ ಮತ್ತು ಕಿಲ್ ಸ್ವಿಚ್', desc: 'ಪೆಟ್ರೋಲ್/CNG, ಸೈಡ್ ಸ್ಟ್ಯಾಂಡ್, ಕಿಲ್ ಸ್ವಿಚ್ ಪರಿಶೀಲಿಸಿ.' },
        { title: 'ಬಿಸಿ ಇಂಜಿನ್ ತಣ್ಣಗಾಗಲಿ', desc: '15–20 ನಿಮಿಷ ಕಾಯಿರಿ — ಬಿಸಿ ಕ್ಯಾಪ್ ತೆರೆಯಬೇಡಿ.' },
        { title: 'ಸಹಾಯಕ್ಕೆ ಕರೆ', desc: 'ಖಚಿತವಿಲ್ಲದಿದ್ದರೆ ಮೆಕ್ಯಾನಿಕ್ ಅಥವಾ ರೋಡ್‌ಸೈಡ್ ಸಹಾಯ.' },
      ],
    },
    overheat: {
      en: [
        { title: 'Stop riding immediately', desc: 'Overheating can seize the engine. Pull over and idle off.' },
        { title: 'Do not open hot cap', desc: 'Wait until cool. Steam burns are dangerous.' },
        { title: 'Check coolant & oil', desc: 'When cool, verify levels. Top up with correct fluids only.' },
        { title: 'Avoid hard revs', desc: 'Tow or push to service if temperature stays high.' },
      ],
      hi: [
        { title: 'तुरंत रोकें', desc: 'ओवरहीट से इंजन जाम हो सकता है — साइड में रोकें।' },
        { title: 'गर्म कैप न खोलें', desc: 'भाप से जल सकते हैं — ठंडा होने तक इंतजार।' },
        { title: 'कूलेंट और तेल', desc: 'ठंडा होने पर लेवल जांचें, सही फ्लूइड डालें।' },
        { title: 'ज्यादा रेव न करें', desc: 'तापमान ऊँचा रहे तो धक्का/टो कराएं।' },
      ],
      kn: [
        { title: 'ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ', desc: 'ಓವರ್‌ಹೀಟಿಂಗ್ ಇಂಜಿನ್‌ಗೆ ಹಾನಿ — ಬದಿಗೆ ನಿಲ್ಲಿಸಿ.' },
        { title: 'ಬಿಸಿ ಕ್ಯಾಪ್ ಬೇಡ', desc: 'ನೀರಾವಿ ಸುಡಬಹುದು — ತಣ್ಣಗಾಗಲಿ ಕಾಯಿರಿ.' },
        { title: 'ಕೂಲೆಂಟ್ ಮತ್ತು ಎಣ್ಣೆ', desc: 'ತಣ್ಣಗಾದ ನಂತರ ಮಟ್ಟ ಪರಿಶೀಲಿಸಿ.' },
        { title: 'ಹೆಚ್ಚು RPM ಬೇಡ', desc: 'ತಾಪಮಾನ ಉಳಿದರೆ ಟೋ ಮಾಡಿ ಅಥವಾ ತಳ್ಳಿ.' },
      ],
    },
    noStart: {
      en: [
        { title: 'Check fuel & battery', desc: 'Petrol tap on, enough fuel, terminals tight, horn works?' },
        { title: 'Try neutral & clutch', desc: 'Pull clutch, neutral gear, then start. Side stand up.' },
        { title: 'Don’t crank endlessly', desc: 'Repeated cranking drains battery — pause between tries.' },
        { title: 'Push start (if safe)', desc: 'Only on flat ground with help; otherwise call support.' },
      ],
      hi: [
        { title: 'ईंधन और बैटरी', desc: 'पेट्रोल टैप, ईंधन, टर्मिनल टाइट, हॉर्न चेक।' },
        { title: 'न्यूट्रल और क्लच', desc: 'क्लच खींचें, न्यूट्रल, साइड स्टैंड ऊपर।' },
        { title: 'लगातार क्रैंक न करें', desc: 'बैटरी खत्म हो जाएगी — बीच में रुकें।' },
        { title: 'पुश स्टार्ट (सुरक्षित)', desc: 'सिर्फ समतल जगह पर; नहीं तो मदद।' },
      ],
      kn: [
        { title: 'ಇಂಧನ ಮತ್ತು ಬ್ಯಾಟರಿ', desc: 'ಪೆಟ್ರೋಲ್, ಟರ್ಮಿನಲ್, ಹಾರ್ನ್ ಪರಿಶೀಲಿಸಿ.' },
        { title: 'ನ್ಯೂಟ್ರಲ್ ಮತ್ತು ಕ್ಲಚ್', desc: 'ಸೈಡ್ ಸ್ಟ್ಯಾಂಡ್ ಮೇಲೆ, ನ್ಯೂಟ್ರಲ್‌ನಲ್ಲಿ ಸ್ಟಾರ್ಟ್.' },
        { title: 'ನಿರಂತರ ಕ್ರ್ಯಾಂಕ್ ಬೇಡ', desc: 'ಬ್ಯಾಟರಿ ಖಾಲಿಯಾಗುತ್ತದೆ — ವಿರಾಮ.' },
        { title: 'ಪುಶ್ ಸ್ಟಾರ್ಟ್', desc: 'ಸಮತಲದಲ್ಲಿ ಮಾತ್ರ; ಇಲ್ಲದಿದ್ದರೆ ಸಹಾಯ.' },
      ],
    },
    smoke: {
      en: [
        { title: 'Stop riding now', desc: 'Smoke can mean oil burning or electrical fault — risk of fire.' },
        { title: 'Cut ignition', desc: 'Turn key off. Do not restart until inspected.' },
        { title: 'Move away if smell strong', desc: 'Fuel vapour or burning wire — keep distance, call help.' },
        { title: 'Note smoke colour', desc: 'White/blue/black helps mechanics diagnose — share when safe.' },
      ],
      hi: [
        { title: 'अभी चलाना बंद करें', desc: 'धुआं तेल या बिजली की खराबी — आग का खतरा।' },
        { title: 'इग्निशन बंद', desc: 'चाबी बंद — बिना जांच के स्टार्ट न करें।' },
        { title: 'तेज़ गंध पर दूर हटें', desc: 'ईंधन या तार जलने की गंध — मदद बुलाएं।' },
        { title: 'धुएं का रंग याद रखें', desc: 'सफेद/नीला/काला — मैकेनिक को बताएं।' },
      ],
      kn: [
        { title: 'ಈಗಲೇ ನಿಲ್ಲಿಸಿ', desc: 'ಹೊಗೆ ಎಣ್ಣೆ/ವಿದ್ಯುತ್ ದೋಷ — ಬೆಂಕಿ ಅಪಾಯ.' },
        { title: 'ಇಗ್ನಿಶನ್ ಆಫ್', desc: 'ಪುನರಾರಂಭ ಮಾಡಬೇಡಿ — ಪರಿಶೀಲನೆ ತನಕ.' },
        { title: 'ತೀವ್ರ ವಾಸನೆಗೆ ಸುರಕ್ಷಿತ ದೂರ', desc: 'ಸಹಾಯಕ್ಕೆ ಕರೆ.' },
        { title: 'ಹೊಗೆ ಬಣ್ಣ ಗಮನಿಸಿ', desc: 'ಬಿಳಿ/ನೀಲಿ/ಕಪ್ಪು — ಮೆಕ್ಯಾನಿಕ್‌ಗೆ ತಿಳಿಸಿ.' },
      ],
    },
    brake: {
      en: [
        { title: 'Slow down gradually', desc: 'Engine brake + downshift if front brake is weak.' },
        { title: 'Pump lever gently', desc: 'If spongy, air in line — avoid hard stops downhill.' },
        { title: 'Check fluid & leaks', desc: 'Look for oil on tyres or ground near wheels.' },
        { title: 'Do not ride fast', desc: 'Get towed to nearest service if unsafe.' },
      ],
      hi: [
        { title: 'धीरे-धीरे धीमा करें', desc: 'इंजन ब्रेक और डाउनशिफ्ट।' },
        { title: 'लीवर हल्का दबाएं', desc: 'स्पंजी हो तो हवा हो सकती है — तेज़ ब्रेक न लगाएं।' },
        { title: 'फ्लूइड और लीक', desc: 'टायर/ज़मीन पर तेल देखें।' },
        { title: 'तेज़ न चलाएं', desc: 'खतरा हो तो टो कराएं।' },
      ],
      kn: [
        { title: 'ನಿಧಾನವಾಗಿ ಕಡಿಮೆ ಮಾಡಿ', desc: 'ಇಂಜಿನ್ ಬ್ರೇಕ್, ಡೌನ್‌ಶಿಫ್ಟ್.' },
        { title: 'ಲಿವರ್ ಲಘುವಾಗಿ', desc: 'ಸ್ಪಂಜಿ ಏರ್ ಇನ್ ಲೈನ್ — ಜಾಗರೂಕೆ.' },
        { title: 'ದ್ರವ ಮತ್ತು ಸೋರುವಿಕೆ', desc: 'ಚಕ್ರಗಳ ಬಳಿ ಎಣ್ಣೆ ಪರಿಶೀಲಿಸಿ.' },
        { title: 'ವೇಗವಾಗಿ ಬೇಡ', desc: 'ಅಪಾಯವಿದ್ದರೆ ಟೋ.' },
      ],
    },
    flat: {
      en: [
        { title: 'Move away from traffic', desc: 'Park on level ground, side stand on firm surface.' },
        { title: 'Check valve & puncture', desc: 'If tubeless, small punctures can be plugged temporarily.' },
        { title: 'Don’t ride on rim', desc: 'Riding flat damages rim and is unsafe — push or inflate.' },
        { title: 'Inflate or replace', desc: 'Use nearby pump or repair shop; carry spare if possible.' },
      ],
      hi: [
        { title: 'ट्रैफिक से हटें', desc: 'समतल जगह, मज़बूत स्टैंड।' },
        { title: 'वाल्व और पंचर', desc: 'ट्यूबलेस में छोटा पंचर कभी-कभी प्लग से ठीक।' },
        { title: 'रिम पर न चलाएं', desc: 'रिम खराब होगी — धक्का या हवा।' },
        { title: 'हवा या बदलें', desc: 'पंप या रिपेयर शॉप।' },
      ],
      kn: [
        { title: 'ಟ್ರಾಫಿಕ್‌ನಿಂದ ದೂರ', desc: 'ಸಮತಲ, ಗಟ್ಟಿ ಸ್ಟ್ಯಾಂಡ್.' },
        { title: 'ವಾಲ್ವ್ ಮತ್ತು ಪಂಚರ್', desc: 'ಟ್ಯೂಬ್‌ಲೆಸ್‌ಗೆ ತಾತ್ಕಾಲಿಕ ಪ್ಲಗ್.' },
        { title: 'ರಿಮ್‌ನಲ್ಲಿ ಸವಾರಿ ಬೇಡ', desc: 'ತಳ್ಳಿ ಅಥವಾ ಒತ್ತಡ.' },
        { title: 'ಒತ್ತಡ ಅಥವಾ ಬದಲಾಯಿಸಿ', desc: 'ಪಂಪ್ ಅಥವಾ ಚಿಕಿತ್ಸಾಲಯ.' },
      ],
    },
    other: {
      en: [
        { title: 'Stay safe first', desc: 'Visibility, helmet, hazard lights; don’t block traffic.' },
        { title: 'Describe symptoms', desc: 'Use app Diagnose when you can for structured checks.' },
        { title: 'Avoid roadside experiments', desc: 'Random wiring or fuel tweaks can cause fire or damage.' },
        { title: 'Get professional help', desc: 'Tow or push to service if the problem is unclear.' },
      ],
      hi: [
        { title: 'पहले सुरक्षा', desc: 'हेलमेट, हेज़र्ड — ट्रैफिक न रोकें।' },
        { title: 'लक्षण बताएं', desc: 'ऐप में जांच करें जब संभव हो।' },
        { title: 'खुद से प्रयोग न करें', desc: 'तार या ईंधन छेड़ना खतरनाक।' },
        { title: 'पेशेवर मदद', desc: 'समस्या स्पष्ट न हो तो टो कराएं।' },
      ],
      kn: [
        { title: 'ಮೊದಲು ಸುರಕ್ಷತೆ', desc: 'ಹೆಲ್ಮೆಟ್, ಹೆಜಾರ್ಡ್.' },
        { title: 'ಲಕ್ಷಣಗಳು ವಿವರಿಸಿ', desc: 'ಸಾಧ್ಯವಾದಾಗ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಪರಿಶೀಲನೆ.' },
        { title: 'ದಾರಿಯಲ್ಲಿ ಪ್ರಯೋಗ ಬೇಡ', desc: 'ವಿಪರೀತ ಮಾರ್ಪಾಡು ಅಪಾಯಕಾರಿ.' },
        { title: 'ವೃತ್ತಿಪರ ಸಹಾಯ', desc: 'ಅಸ್ಪಷ್ಟವಿದ್ದರೆ ಟೋ.' },
      ],
    },
  };

  const pack = T[issueKey] || T.general;
  return pack[lang] || pack.en;
}

function getStaticFallbackSteps() {
  const lang = State.language === 'hi' ? 'hi' : State.language === 'kn' ? 'kn' : 'en';
  const S = {
    en: [
      { title: 'Hazard lights on', desc: 'Make yourself visible to other vehicles.' },
      { title: 'Reflective triangle / safe spot', desc: 'Move to breakdown lane or footpath if possible.' },
      { title: 'Carry water & phone charged', desc: 'Especially in summer heat — dehydration is risky.' },
    ],
    hi: [
      { title: 'हेज़र्ड लाइट', desc: 'दूसरे वाहनों को दिखें।' },
      { title: 'सुरक्षित जगह', desc: 'ब्रेकडाउन लेन या फुटपाथ।' },
      { title: 'पानी और फोन चार्ज', desc: 'गर्मी में निर्जलन से बचें।' },
    ],
    kn: [
      { title: 'ಹೆಜಾರ್ಡ್ ಲೈಟ್', desc: 'ಇತರ ವಾಹನಗಳಿಗೆ ಕಾಣಿಸಿ.' },
      { title: 'ಸುರಕ್ಷಿತ ಸ್ಥಳ', desc: 'ಬ್ರೇಕ್‌ಡೌನ್ ಲೇನ್ ಅಥವಾ ಫುಟ್‌ಪಾತ್.' },
      { title: 'ನೀರು ಮತ್ತು ಫೋನ್ ಚಾರ್ಜ್', desc: 'ಬಿಸಿಲಿನಲ್ಲಿ ನಿರ್ಜಲನೆ ಎಚ್ಚರಿಕೆ.' },
    ],
  };
  return S[lang] || S.en;
}

function renderEmergencyStepsHtml(steps) {
  return steps.map((step, i) => `
    <div class="emergency-step">
      <div class="step-number">${i + 1}</div>
      <div class="step-content">
        <div class="step-title">${step.title}</div>
        <div class="step-desc">${step.desc}</div>
      </div>
    </div>
  `).join('');
}

function showEmergency() {
  const el = document.getElementById('screen-emergency');
  el.classList.add('active');

  el.innerHTML = `
    <div class="emergency-screen-header">
      <div class="back-btn" onclick="hideEmergency()">${Icons.back}</div>
      <div>
        <div class="emergency-screen-title">🚨 ${t('emergencyGuide')}</div>
        <div style="font-size: 0.72rem; color: var(--text-muted);">${t('worksOffline')}</div>
      </div>
      <span class="offline-badge">⚡ Offline</span>
    </div>

    <div class="emergency-steps" style="overflow-y: auto; flex: 1; padding-bottom: 40px;">
      <div class="card" style="background: rgba(255,107,53,0.06); border-color: rgba(255,107,53,0.25); margin-bottom: 14px;">
        <div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 8px;">${t('issueType')}</div>
        <div class="emergency-issue-grid">
          ${[
    { key: 'general', lab: tr('Quick help (any issue)', 'त्वरित सहायता (कोई भी)', 'ತ್ವರಿತ ಸಹಾಯ (ಯಾವುದೇ)') },
    { key: 'overheat', lab: t('issueOverheat') },
    { key: 'noStart', lab: t('issueNoStart') },
    { key: 'smoke', lab: t('issueSmoke') },
    { key: 'brake', lab: t('issueBrake') },
    { key: 'flat', lab: t('issueFlat') },
    { key: 'other', lab: t('issueOther') },
  ]
    .map(
      (o, i) => `
          <label class="emergency-issue-option">
            <input type="radio" name="emergency-issue" value="${o.key}" ${i === 0 ? 'checked' : ''} onchange="refreshEmergencyAiSteps()" />
            <span>${o.lab}</span>
          </label>
        `
    )
    .join('')}
        </div>
        <button type="button" class="btn btn-primary btn-full btn-lg" onclick="refreshEmergencyAiSteps()" style="margin-top: 12px;">
          🆘 ${t('sosGetHelp')}
        </button>
      </div>

      <div class="section-title" style="margin-top:4px;">${t('sosAiSteps')}</div>
      <div id="emergency-ai-steps">${renderEmergencyStepsHtml(getAiStepsForIssue('general'))}</div>

      <div class="section-title" style="margin-top:16px;">${t('offlineFallback')}</div>
      <div id="emergency-static-steps">${renderEmergencyStepsHtml(getStaticFallbackSteps())}</div>

      <div style="padding: 0 0 16px;">
        <button type="button" class="btn btn-danger btn-full btn-lg" onclick="callMechanic()" style="margin-bottom: 10px;">
          📞 ${t('callMechanic')}
        </button>
        <button type="button" class="btn btn-secondary btn-full" onclick="openMechanicFinder()">
          📍 ${t('findOnMaps')}
        </button>
      </div>

      <div class="card" style="background: rgba(239,68,68,0.05); border-color: rgba(239,68,68,0.2);">
        <div style="font-size: 0.78rem; font-weight: 700; color: #F87171; margin-bottom: 10px;">
          🚫 ${t('neverDo')}
        </div>
        <ul style="font-size: 0.8rem; color: var(--text-secondary); line-height: 2; padding-left: 16px;">
          <li>${tr('Pour cold water on a hot engine', 'गर्म इंजन में ठंडा पानी डालना', 'ಬಿಸಿ ಇಂಜಿನ್‌ಗೆ ತಣ್ಣೀರು ಬಳಸಬೇಡಿ')}</li>
          <li>${tr('Ride with visible oil leaks', 'तेल लीक के साथ गाड़ी चलाना', 'ಸೋರುವ ಎಣ್ಣೆಯೊಂದಿಗೆ ಸವಾರಿ')}</li>
          <li>${tr('Force start when smoking', 'धुएं के साथ स्टार्ट करना', 'ಹೊಗೆಯಲ್ಲಿ ಒತ್ತಾಯದ ಸ್ಟಾರ್ಟ್')}</li>
          <li>${tr('Stop in the middle of a highway', 'हाइवे पर गाड़ी रोकना', 'ಹೈವೆ ಮಧ್ಯೆ ನಿಲ್ಲಿಸಬೇಡಿ')}</li>
        </ul>
      </div>
    </div>
  `;

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function refreshEmergencyAiSteps() {
  const key = getEmergencyIssueKey();
  const steps = getAiStepsForIssue(key);
  const host = document.getElementById('emergency-ai-steps');
  if (host) host.innerHTML = renderEmergencyStepsHtml(steps);
}

function hideEmergency() {
  document.getElementById('screen-emergency').classList.remove('active');
  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function callMechanic() {
  showToast(tr('Opening dialler… (demo)', 'डायलर खुल रहा है…', 'ಡಯಲರ್ ತೆರೆಯುತ್ತಿದೆ…'));
  setTimeout(() => window.open('tel:+911800-xxx-xxxx'), 500);
}

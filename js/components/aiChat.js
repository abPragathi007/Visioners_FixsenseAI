/* ═══════════════════════════════════════════════════════════
   In-app AI assistant — mock responses (no backend)
   ═══════════════════════════════════════════════════════════ */

function mockAiReply(userText) {
  const q = (userText || '').toLowerCase();
  const lang = State.language;

  if (/overheat|गर्म|ಓವರ್‌ಹೀಟ್|ತಾಪ/.test(q)) {
    return tr(
      'Overheating often means low coolant, a dirty radiator, or hard riding in heat. Stop safely, let the engine cool 15–20 minutes, then check coolant and oil. Avoid long idling.',
      'ओवरहीटिंग का मतलब अक्सर कम कूलेंट या गंदा रेडिएटर होता है। सुरक्षित रुकें, 15–20 मिनट ठंडा होने दें, फिर कूलेंट और तेल जांचें।',
      'ಓವರ್‌ಹೀಟಿಂಗ್ ಸಾಮಾನ್ಯವಾಗಿ ಕಡಿಮೆ ಕೂಲೆಂಟ್ ಅಥವಾ ಕೊಳಕು ರೇಡಿಯೇಟರ್‌ನಿಂದ. ಸುರಕ್ಷಿತವಾಗಿ ನಿಲ್ಲಿಸಿ, 15–20 ನಿಮಿಷ ಠಂಡಗೊಳಿಸಿ, ನಂತರ ಕೂಲೆಂಟ್ ಮತ್ತು ಎಣ್ಣೆ ಪರಿಶೀಲಿಸಿ.'
    );
  }
  if (/stop|stall|start|स्टार्ट|ಸ್ಟಾರ್ಟ್/.test(q)) {
    return tr(
      'If the engine stops: turn ignition off, check fuel, ensure kill switch is off, try restart after 1 minute. If battery is weak, push-start or jump. Seek help if fuel smells or smoke appears.',
      'इंजन बंद हो तो: इग्निशन बंद करें, ईंधन जांचें, किल स्विच ऑफ करें, 1 मिनट बाद फिर स्टार्ट करें।',
      'ಎಂಜಿನ್ ನಿಲ್ಲಿದರೆ: ಇಗ್ನಿಷನ್ ಆಫ್, ಇಂಧನ ಪರಿಶೀಲಿಸಿ, 1 ನಿಮಿಷ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
    );
  }
  if (/battery|बैटरी|ಬ್ಯಾಟರಿ/.test(q)) {
    return tr(
      'Weak battery: check 12.4V+ at rest, clean terminals, take a 20+ minute ride to charge, or use a charger. Replace if older than 2–3 years.',
      'कमजोर बैटरी: आराम पर 12.4V+ जांचें, टर्मिनल साफ करें, लंबी सवारी करें या चार्जर लगाएं।',
      'ದುರ್ಬಲ ಬ್ಯಾಟರಿ: ವಿಶ್ರಾಂತಿಯಲ್ಲಿ 12.4V+ ಪರಿಶೀಲಿಸಿ, ಟರ್ಮಿನಲ್‌ಗಳನ್ನು ಸ್ವಚ್ಛಗೊಳಿಸಿ, ಟಾರ್ಚ್ ಚಾರ್ಜ್ ಮಾಡಿ.'
    );
  }
  if (/oil|तेल|ಎಣ್ಣೆ/.test(q)) {
    return tr(
      'Check oil on level ground with the dipstick. Top up with the grade recommended in your manual. Never ride with oil below MIN.',
      'डिपस्टिक से तेल जांचें। मैनुअल के अनुसार ग्रेड डालें। MIN से नीचे कभी न चलाएं।',
      'ಡಿಪ್‌ಸ್ಟಿಕ್‌ನಿಂದ ಎಣ್ಣೆ ಪರಿಶೀಲಿಸಿ. MIN ಗೆ ಮೇಲೆ ಇರಿಸಿ, ಶಿಫಾರಸು ಮಾಡಿದ ಗ್ರೇಡ್ ಬಳಸಿ.'
    );
  }

  if (lang === 'hi') {
    return 'सामान्य सुझाव: पहले सुरक्षित रुकें, इंजन ठंडा होने दें, तेल/कूलेंट/ईंधन जांचें। अगर धुआं या आग की गंध हो — मैकेनिक बुलाएं।';
  }
  if (lang === 'kn') {
    return 'ಸಾಮಾನ್ಯ ಸಲಹೆ: ಸುರಕ್ಷಿತವಾಗಿ ನಿಲ್ಲಿಸಿ, ಎಂಜಿನ್ ಠಂಡಗೊಳಿಸಿ, ಎಣ್ಣೆ/ಕೂಲೆಂಟ್/ಇಂಧನ ಪರಿಶೀಲಿಸಿ. ಹೊಗೆ ಅಥವಾ ವಾಸನೆ ಇದ್ದರೆ ಮೆಕ್ಯಾನಿಕ್ ಕರೆಯಿರಿ.';
  }
  return 'General tips: pull over safely, let the engine cool, check oil, coolant, and fuel. If you see smoke or smell burning, call a mechanic.';
}

function initAiChat() {
  const root = document.getElementById('ai-chat-root');
  if (!root || root.dataset.bound) return;
  root.dataset.bound = '1';

  root.innerHTML = `
    <div id="ai-chat-panel" class="ai-chat-panel" role="dialog" aria-label="${t('aiAssistant')}">
      <div class="ai-chat-header">
        <span>🤖 ${t('aiAssistant')}</span>
        <button type="button" class="icon-btn" style="width:32px;height:32px;" onclick="document.getElementById('ai-chat-panel').classList.remove('open')" aria-label="Close">✕</button>
      </div>
      <div class="ai-chat-messages" id="ai-chat-messages"></div>
      <div class="ai-chat-input-row">
        <input type="text" id="ai-chat-input" placeholder="${t('chatPlaceholder')}" maxlength="500" autocomplete="off" />
        <button type="button" id="ai-chat-send" onclick="sendAiChat()">➤</button>
      </div>
    </div>
    <button type="button" class="ai-chat-fab" id="ai-chat-fab" aria-label="${t('aiAssistant')}" onclick="toggleAiChatPanel()">💬</button>
  `;

  const input = document.getElementById('ai-chat-input');
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendAiChat();
  });
}

function toggleAiChatPanel() {
  const p = document.getElementById('ai-chat-panel');
  if (!p) return;
  p.classList.toggle('open');
  if (p.classList.contains('open')) {
    const el = document.getElementById('ai-chat-messages');
    if (el && !el.dataset.seeded) {
      el.dataset.seeded = '1';
      appendAiBubble('ai', tr(
        'Hi! Ask me about overheating, oil, battery, or what to do in a breakdown.',
        'नमस्ते! ओवरहीटिंग, तेल, बैटरी या ब्रेकडाउन के बारे में पूछें।',
        'ನಮಸ್ಕಾರ! ಓವರ್‌ಹೀಟಿಂಗ್, ಎಣ್ಣೆ, ಬ್ಯಾಟರಿ ಅಥವಾ ಕೆಟ್ಟುನಿಂತಾಗ ಏನು ಮಾಡಬೇಕು ಎಂದು ಕೇಳಿ.'
      ));
    }
    document.getElementById('ai-chat-input')?.focus();
  }
}

function appendAiBubble(role, text) {
  const box = document.getElementById('ai-chat-messages');
  if (!box) return;
  const d = document.createElement('div');
  d.className = 'ai-chat-bubble ' + role;
  d.textContent = text;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

function sendAiChat() {
  const input = document.getElementById('ai-chat-input');
  const msg = (input?.value || '').trim();
  if (!msg) return;
  appendAiBubble('user', msg);
  input.value = '';
  setTimeout(() => {
    appendAiBubble('ai', mockAiReply(msg));
  }, 400);
}

window.initAiChat = initAiChat;
window.toggleAiChatPanel = toggleAiChatPanel;
window.sendAiChat = sendAiChat;

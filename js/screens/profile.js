/* ═══════════════════════════════════════════════════════════
   SCREEN 9 · PROFILE & SETTINGS
   ═══════════════════════════════════════════════════════════ */
function renderProfileScreen() {
  const el = document.getElementById('screen-profile');
  const isHi = State.language === 'hi';

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack(); renderHomeScreen();">${Icons.back}</div>
      <h2 class="page-title">${isHi ? 'प्रोफ़ाइल और सेटिंग्स' : 'Profile & Settings'}</h2>
    </div>

    <div class="profile-content">
      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="profile-avatar-large">🧑‍🔧</div>
        <div class="profile-name">${isHi ? 'मेरा खाता' : 'My Account'}</div>
        <div class="profile-since">${isHi ? 'Bike Health AI उपयोगकर्ता' : 'Bike Health AI Member'}</div>
      </div>

      <!-- Streak -->
      <div class="streak-card">
        <span class="streak-flame">🔥</span>
        <div>
          <div class="streak-count">${State.streak}</div>
          <div class="streak-label">${isHi ? 'हफ्ते' : 'WEEK STREAK'}</div>
          <div class="streak-desc">${isHi ? 'हर हफ्ते जांचते रहें — गाड़ी की उम्र बढ़ेगी!' : 'Keep checking every week to maintain your streak!'}</div>
        </div>
      </div>

      <!-- Badges -->
      <div class="setting-group">
        <div class="setting-group-title">${isHi ? 'बैज' : 'Badges Earned'}</div>
        <div class="badges-row">
          <div class="badge-item earned">
            <span class="badge-emoji">🏆</span>
            <div class="badge-name">${isHi ? 'पहली जांच' : 'First Check'}</div>
          </div>
          <div class="badge-item earned">
            <span class="badge-emoji">🔥</span>
            <div class="badge-name">${isHi ? '4 हफ्ते' : '4 Week Streak'}</div>
          </div>
          <div class="badge-item">
            <span class="badge-emoji">💎</span>
            <div class="badge-name" style="color: var(--text-muted);">${isHi ? '12 हफ्ते' : '12 Weeks'}</div>
          </div>
          <div class="badge-item">
            <span class="badge-emoji">🌟</span>
            <div class="badge-name" style="color: var(--text-muted);">${isHi ? 'फ्लीट मास्टर' : 'Fleet Master'}</div>
          </div>
        </div>
      </div>

      <!-- AI Settings -->
      <div class="setting-group">
        <div class="setting-group-title">${isHi ? 'AI सेटिंग्स' : 'AI Settings'}</div>
        <div class="setting-item" onclick="showApiKeyModal()">
          <div class="setting-left">
            <span class="setting-icon">🤖</span>
            <div>
              <div class="setting-label">Claude API Key</div>
              <div class="setting-desc">${State.claudeApiKey ? '✅ Connected — AI Analysis Active' : '⚡ Using local analysis (free)'}</div>
            </div>
          </div>
          <span class="setting-right">›</span>
        </div>
        <div class="setting-item" onclick="toggleMechanicMode()">
          <div class="setting-left">
            <span class="setting-icon">🔧</span>
            <div>
              <div class="setting-label">${isHi ? 'मैकेनिक मोड' : 'Mechanic Mode'}</div>
              <div class="setting-desc">${isHi ? 'तकनीकी भाषा में परिणाम' : 'Technical output for professionals'}</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" id="mechanic-toggle" ${State.mechanicMode ? 'checked' : ''} onchange="toggleMechanicMode()">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Preferences -->
      <div class="setting-group">
        <div class="setting-group-title">${isHi ? 'प्राथमिकताएं' : 'Preferences'}</div>
        <div class="setting-item" onclick="showLanguageModal()">
          <div class="setting-left">
            <span class="setting-icon">🌐</span>
            <div>
              <div class="setting-label">${isHi ? 'भाषा' : 'Language'}</div>
              <div class="setting-desc">${State.language === 'hi' ? 'हिंदी' : 'English'}</div>
            </div>
          </div>
          <span class="setting-right">›</span>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">🔔</span>
            <div>
              <div class="setting-label">${isHi ? 'सर्विस रिमाइंडर' : 'Service Reminders'}</div>
              <div class="setting-desc">${isHi ? 'हर 30 दिन पर याद दिलाएं' : 'Notify every 30 days'}</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked>
            <span class="slider"></span>
          </label>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">🌙</span>
            <div>
              <div class="setting-label">${isHi ? 'डार्क मोड' : 'Dark Mode'}</div>
              <div class="setting-desc">${isHi ? 'हमेशा डार्क' : 'Always dark (recommended)'}</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" checked disabled>
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Data -->
      <div class="setting-group">
        <div class="setting-group-title">${isHi ? 'डेटा' : 'Data & Privacy'}</div>
        <div class="setting-item" onclick="exportHistory()">
          <div class="setting-left">
            <span class="setting-icon">📊</span>
            <div>
              <div class="setting-label">${isHi ? 'CSV एक्सपोर्ट' : 'Export as CSV'}</div>
              <div class="setting-desc">${isHi ? 'पूरा इतिहास डाउनलोड करें' : 'Download all diagnosis history'}</div>
            </div>
          </div>
          <span class="setting-right">›</span>
        </div>
        <div class="setting-item" onclick="clearData()">
          <div class="setting-left">
            <span class="setting-icon">🗑️</span>
            <div>
              <div class="setting-label" style="color: var(--brand-red);">${isHi ? 'सारा डेटा मिटाएं' : 'Clear All Data'}</div>
              <div class="setting-desc">${isHi ? 'इतिहास और गाड़ियां हटाएं' : 'Remove all vehicles and history'}</div>
            </div>
          </div>
          <span class="setting-right">›</span>
        </div>
      </div>

      <!-- About -->
      <div style="text-align: center; padding: 20px 0 40px;">
        <div style="font-size: 1.5rem; margin-bottom: 6px;">🏍️</div>
        <div class="text-sm font-semibold gradient-text">Bike Health AI</div>
        <div class="text-xs text-muted">v1.0 · Built in 1 day for CodeClash · India-first</div>
        <div class="text-xs text-muted mt-2">Challenge 03 · Mini Predictive Maintenance Assistant</div>
      </div>
    </div>

    ${renderBottomNav('profile')}
  `;
}

function showApiKeyModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'api-key-modal';
  modal.innerHTML = `
    <div class="modal-box">
      <h3 class="modal-title">🤖 Claude API Key</h3>
      <p class="modal-desc">Enter your Anthropic API key to enable full AI analysis via Claude. Without it, the app uses our built-in smart analysis (works great too!).</p>
      <div class="form-group">
        <input type="password" class="input-field" id="api-key-input" placeholder="sk-ant-..." value="${State.claudeApiKey}" />
      </div>
      <div class="text-xs text-muted mb-4">Get your key at console.anthropic.com</div>
      <div style="display: flex; gap: 10px;">
        <button class="btn btn-ghost btn-full" onclick="closeModal()">Cancel</button>
        <button class="btn btn-primary btn-full" onclick="saveApiKey()">Save Key</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function saveApiKey() {
  const key = document.getElementById('api-key-input')?.value?.trim() || '';
  State.claudeApiKey = key;
  saveState();
  closeModal();
  showToast(key ? '✅ API Key saved!' : 'API key cleared — using local analysis');
  renderProfileScreen();
}

function closeModal() {
  document.getElementById('api-key-modal')?.remove();
  document.getElementById('lang-modal')?.remove();
}

function showLanguageModal() {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.id = 'lang-modal';

  const langs = [
    { code: 'en', native: 'English' },
    { code: 'hi', native: 'हिंदी' },
    { code: 'ta', native: 'தமிழ்' },
    { code: 'te', native: 'తెలుగు' },
    { code: 'kn', native: 'ಕನ್ನಡ' },
    { code: 'mr', native: 'मराठी' },
  ];

  modal.innerHTML = `
    <div class="modal-box">
      <h3 class="modal-title">🌐 Select Language</h3>
      <div class="lang-grid" style="margin-bottom: 16px;">
        ${langs.map(l => `
          <button class="lang-btn ${l.code === State.language ? 'selected' : ''}" onclick="setLanguage('${l.code}')">
            <span class="lang-native">${l.native}</span>
          </button>
        `).join('')}
      </div>
      <button class="btn btn-ghost btn-full" onclick="closeModal()">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function setLanguage(code) {
  State.language = code;
  saveState();
  closeModal();
  renderProfileScreen();
  showToast('Language updated!');
}

function toggleMechanicMode() {
  State.mechanicMode = !State.mechanicMode;
  saveState();
  showToast(State.mechanicMode ? 'Mechanic mode ON' : 'Plain language mode ON');
  renderProfileScreen();
}

function clearData() {
  if (!confirm('Are you sure? This will delete all vehicles, history, and settings.')) return;
  localStorage.clear();
  location.reload();
}

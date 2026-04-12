/* ═══════════════════════════════════════════════════════════
   SCREEN 9 · PROFILE & SETTINGS
   ═══════════════════════════════════════════════════════════ */
function renderProfileScreen() {
  const el = document.getElementById('screen-profile');

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack(); renderHomeScreen();">${Icons.back}</div>
      <h2 class="page-title">${t('profileSettings')}</h2>
    </div>

    <div class="profile-content screen-scroll">
      <!-- Profile Hero -->
      <div class="profile-hero">
        <div class="profile-avatar-large">🧑‍🔧</div>
        <div class="profile-name">${t('myAccount')}</div>
        <div class="profile-since">${t('memberTag')}</div>
      </div>

      <!-- Saved vehicles (thumbnails) -->
      <div class="setting-group">
        <div class="setting-group-title">${t('myVehicles')}</div>
        <div class="profile-vehicles-row">
          ${State.vehicles.length === 0
    ? `<p class="text-xs text-muted">${t('addVehicle')}</p>`
    : State.vehicles.map((v) => `
            <div class="profile-vehicle-pill" onclick="navigateTo('home','left'); renderHomeScreen();">
              ${v.image
    ? `<img class="history-thumb" src="${String(v.image).replace(/"/g, '&quot;')}" alt="" />`
    : `<span style="font-size:1.4rem">${v.emoji || '🏍️'}</span>`}
              <span class="profile-vehicle-name">${escapeHtml(v.nickname)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Streak -->
      <div class="streak-card">
        <span class="streak-flame">🔥</span>
        <div>
          <div class="streak-count">${State.streak}</div>
          <div class="streak-label">${tr('WEEK STREAK', 'हफ्तों की स्ट्रीक', 'ವಾರಗಳ ಸ್ಟ್ರೀಕ್')}</div>
          <div class="streak-desc">${tr('Keep checking every week to maintain your streak!', 'हर हफ्ते जांचते रहें — गाड़ी की उम्र बढ़ेगी!', 'ಪ್ರತಿ ವಾರ ಪರಿಶೀಲಿಸಿ — ವಾಹನ ಆರೋಗ್ಯವನ್ನು ಕಾಪಾಡಿಕೊಳ್ಳಿ.')}</div>
        </div>
      </div>

      <!-- Badges -->
      <div class="setting-group">
        <div class="setting-group-title">${t('badgesEarned')}</div>
        <div class="badges-row">
          <div class="badge-item earned">
            <span class="badge-emoji">🏆</span>
            <div class="badge-name">${t('firstCheck')}</div>
          </div>
          <div class="badge-item earned">
            <span class="badge-emoji">🔥</span>
            <div class="badge-name">${t('weekStreak4')}</div>
          </div>
          <div class="badge-item">
            <span class="badge-emoji">💎</span>
            <div class="badge-name" style="color: var(--text-muted);">${t('weekStreak12')}</div>
          </div>
          <div class="badge-item">
            <span class="badge-emoji">🌟</span>
            <div class="badge-name" style="color: var(--text-muted);">${t('fleetMaster')}</div>
          </div>
        </div>
      </div>

      <!-- AI Settings -->
      <div class="setting-group">
        <div class="setting-group-title">${t('aiSettings')}</div>
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
              <div class="setting-label">${t('mechanicMode')}</div>
              <div class="setting-desc">${t('mechanicDesc')}</div>
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
        <div class="setting-group-title">${t('preferences')}</div>
        <div class="setting-item" onclick="showLanguageModal()">
          <div class="setting-left">
            <span class="setting-icon">🌐</span>
            <div>
              <div class="setting-label">${t('language')}</div>
              <div class="setting-desc">${langDisplayName(State.language)}</div>
            </div>
          </div>
          <span class="setting-right">›</span>
        </div>
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">🔔</span>
            <div>
              <div class="setting-label">${t('serviceReminders')}</div>
              <div class="setting-desc">${t('remind30')}</div>
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
              <div class="setting-label">${t('darkMode')}</div>
              <div class="setting-desc">${t('themeDesc')}</div>
            </div>
          </div>
          <label class="toggle-switch">
            <input type="checkbox" ${State.darkMode ? 'checked' : ''} onchange="setDarkModeFromUi(this.checked)">
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <!-- Data -->
      <div class="setting-group">
        <div class="setting-group-title">${t('dataPrivacy')}</div>
        <div class="setting-item" onclick="exportHistory()">
          <div class="setting-left">
            <span class="setting-icon">📊</span>
            <div>
              <div class="setting-label">${t('exportCsv')}</div>
              <div class="setting-desc">${t('exportDesc')}</div>
            </div>
          </div>
          <span class="setting-right">›</span>
        </div>
        <div class="setting-item" onclick="clearData()">
          <div class="setting-left">
            <span class="setting-icon">🗑️</span>
            <div>
              <div class="setting-label" style="color: var(--brand-red);">${t('clearAll')}</div>
              <div class="setting-desc">${t('clearDesc')}</div>
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

  `;

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
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
    { code: 'en', native: t('langEnglish') },
    { code: 'hi', native: t('langHindi') },
    { code: 'kn', native: t('langKannada') },
  ];

  modal.innerHTML = `
    <div class="modal-box">
      <h3 class="modal-title">🌐 ${t('selectLanguage')}</h3>
      <div class="lang-grid" style="margin-bottom: 16px;">
        ${langs.map(l => `
          <button type="button" class="lang-btn ${l.code === State.language ? 'selected' : ''}" onclick="setLanguage('${l.code}')">
            <span class="lang-native">${l.native}</span>
          </button>
        `).join('')}
      </div>
      <button type="button" class="btn btn-ghost btn-full" onclick="closeModal()">${t('cancel')}</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function langDisplayName(code) {
  const native = { en: 'English', hi: 'हिंदी', kn: 'ಕನ್ನಡ' };
  return native[code] || native.en;
}

function setLanguage(code) {
  State.language = code;
  saveState();
  applyDocumentLocale();
  closeModal();
  refreshCurrentScreen();
  showToast(t('languageUpdated'));
}

function toggleMechanicMode() {
  State.mechanicMode = !State.mechanicMode;
  saveState();
  showToast(State.mechanicMode ? 'Mechanic mode ON' : 'Plain language mode ON');
  renderProfileScreen();
}

function clearData() {
  if (!confirm('Are you sure? This will delete all vehicles, history, and settings.')) return;
  localStorage.removeItem('bikeHealthAI');
  localStorage.removeItem('bikeHealthAI_lang');
  localStorage.removeItem('bikeHealthAI_theme');
  localStorage.removeItem('bikeHealthAI_diagnoses');
  location.reload();
}

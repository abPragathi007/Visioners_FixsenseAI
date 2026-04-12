/* ═══════════════════════════════════════════════════════════
   SCREEN 3 · ADD / MANAGE VEHICLE
   ═══════════════════════════════════════════════════════════ */
let newVehicle = {};

function renderAddVehicleScreen() {
  newVehicle = { type: 'bike', emoji: '🏍️', imageDataUrl: null };
  const el = document.getElementById('screen-add-vehicle');

  el.innerHTML = `
    <div class="screen-scroll">
    <div class="page-header">
      <div class="back-btn" onclick="goBack()">${Icons.back}</div>
      <h2 class="page-title">${t('addVehicle')}</h2>
    </div>
    <div class="add-vehicle-content stagger-children">

      <!-- Vehicle Type -->
      <div class="form-group">
        <label class="label">${tr('Vehicle Type', 'गाड़ी का प्रकार', 'ವಾಹನದ ಪ್ರಕಾರ')}</label>
        <div class="vehicle-type-grid" id="vtype-grid">
          ${VEHICLE_TYPES.map(t => `
            <div class="vtype-btn ${t.id === 'bike' ? 'selected' : ''}" data-type="${t.id}" onclick="selectVehicleType('${t.id}')">
              <span class="vtype-emoji">${t.emoji}</span>
              <span class="vtype-name">${t.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Photo -->
      <div class="form-group">
        <label class="label">${t('vehiclePhoto')}</label>
        <input type="file" id="v-image" accept="image/*" class="input-field" style="padding:10px;"
          onchange="onVehicleImageSelected(event)" />
        <div id="v-image-preview" style="margin-top:10px;display:none;">
          <img id="v-image-preview-img" alt="" style="max-width:100%;max-height:160px;border-radius:12px;border:1px solid var(--border-card);" />
          <button type="button" class="btn btn-ghost btn-sm" style="margin-top:8px;" onclick="clearVehicleImage()">${tr('Remove photo', 'फोटो हटाएं', 'ಫೋಟೋ ತೆಗೆದುಹಾಕಿ')}</button>
        </div>
      </div>

      <!-- Registration number -->
      <div class="form-group">
        <label class="label">${t('vehicleReg')}</label>
        <input type="text" class="input-field" id="v-number" placeholder="${tr('e.g. KA-01-AB-1234', 'उदा. DL-01-AB-1234', 'ಉದಾ. KA-01-AB-1234')}" maxlength="20" />
      </div>

      <!-- Nickname -->
      <div class="form-group">
        <label class="label">${tr('Nickname / Name', 'गाड़ी का नाम', 'ಹೆಸರು')}</label>
        <input type="text" class="input-field" id="v-nickname" placeholder="${tr('e.g. My Splendor', 'जैसे: मेरी बाइक', 'ಉದಾ. ನನ್ನ ಬೈಕ್')}" maxlength="30" />
      </div>

      <!-- Brand -->
      <div class="form-group">
        <label class="label">${tr('Brand', 'ब्रांಡ್', 'ಬ್ರಾಂಡ್')}</label>
        <select class="input-field" id="v-brand" onchange="updateModels()">
          <option value="">${tr('Select brand', 'ब्रांड चुनें', 'ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ')}</option>
          ${(VEHICLE_BRANDS.bike || []).map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>

      <!-- Model -->
      <div class="form-group">
        <label class="label">${tr('Model', 'मॉडल', 'ಮಾಡೆಲ್')}</label>
        <select class="input-field" id="v-model">
          <option value="">${tr('Select brand first', 'पहले ब्रांड चुनें', 'ಮೊದಲು ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ')}</option>
        </select>
      </div>

      <!-- Year + CC -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="label">${tr('Year', 'साल', 'ವರ್ಷ')}</label>
          <select class="input-field" id="v-year">
            ${Array.from({ length: 15 }, (_, i) => 2026 - i).map(y => `<option value="${y}">${y}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="label">Engine CC</label>
          <input type="number" class="input-field" id="v-cc" placeholder="110" min="50" max="2000" />
        </div>
      </div>

      <!-- Last Service Date -->
      <div class="form-group">
        <label class="label">${tr('Last service date', 'अंतिम सर्विस की तारीख', 'ಕೊನೆಯ ಸರ್ವಿಸ್ ದಿನಾಂಕ')}</label>
        <input type="date" class="input-field" id="v-service-date" value="${new Date().toISOString().split('T')[0]}" />
      </div>

      <!-- Odometer -->
      <div class="form-group">
        <label class="label">${tr('Odometer (km)', 'ओडोमीटर (km)', 'ಓಡೋಮೀಟರ್ (ಕಿಮೀ)')}</label>
        <input type="number" class="input-field" id="v-odometer" placeholder="15000" min="0" max="999999" />
      </div>

      <!-- Save Button -->
      <button class="btn btn-primary btn-full btn-lg" onclick="saveVehicle()" style="margin-top: 8px;">
        💾 ${tr('Save vehicle', 'गाड़ी सेव करें', 'ವಾಹನ ಉಳಿಸಿ')}
      </button>

      <div style="height: 24px;"></div>
    </div>
    </div>
  `;

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function onVehicleImageSelected(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f || !f.type.startsWith('image/')) return;
  if (f.size > 1.5 * 1024 * 1024) {
    showToast(tr('Image too large (max ~1.5MB)', 'फोटो बहुत बड़ी है', 'ಚಿತ್ರ ತುಂಬಾ ದೊಡ್ಡದು'));
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    newVehicle.imageDataUrl = reader.result;
    const prev = document.getElementById('v-image-preview');
    const img = document.getElementById('v-image-preview-img');
    if (prev && img) {
      img.src = newVehicle.imageDataUrl;
      prev.style.display = 'block';
    }
  };
  reader.readAsDataURL(f);
}

function clearVehicleImage() {
  newVehicle.imageDataUrl = null;
  const inp = document.getElementById('v-image');
  if (inp) inp.value = '';
  const prev = document.getElementById('v-image-preview');
  if (prev) prev.style.display = 'none';
}

function selectVehicleType(type) {
  newVehicle.type = type;
  newVehicle.emoji = VEHICLE_TYPES.find(t => t.id === type)?.emoji || '🏍️';

  document.querySelectorAll('.vtype-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === type);
  });

  const brandSel = document.getElementById('v-brand');
  brandSel.innerHTML = `<option value="">${tr('Select brand', 'ब्रांड चुनें', 'ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ')}</option>` +
    (VEHICLE_BRANDS[type] || []).map(b => `<option value="${b}">${b}</option>`).join('');
  document.getElementById('v-model').innerHTML = `<option value="">${tr('Select brand first', 'पहले ब्रांड चुनें', 'ಮೊದಲು ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ')}</option>`;
}

function updateModels() {
  const brand = document.getElementById('v-brand').value;
  const type = newVehicle.type || 'bike';
  const models = VEHICLE_MODELS[type]?.[brand] || [];

  document.getElementById('v-model').innerHTML =
    models.length
      ? models.map(m => `<option value="${m}">${m}</option>`).join('')
      : `<option value="">${tr('Other', 'अन्य', 'ಇತರೆ')}</option>`;
}

function saveVehicle() {
  const nickname = document.getElementById('v-nickname').value.trim();
  const brand = document.getElementById('v-brand').value;
  const model = document.getElementById('v-model').value;
  const year = parseInt(document.getElementById('v-year').value);
  const cc = parseInt(document.getElementById('v-cc').value) || 110;
  const lastService = document.getElementById('v-service-date').value;
  const odometer = parseInt(document.getElementById('v-odometer').value) || 0;
  const number = (document.getElementById('v-number').value || '').trim();

  if (!nickname) {
    showToast(tr('Please enter a name for your vehicle', 'कृपया नाम दर्ज करें', 'ದಯವಿಟ್ಟು ಹೆಸರು ನಮೂದಿಸಿ'));
    return;
  }

  const vehicle = {
    id: 'v' + Date.now(),
    type: newVehicle.type,
    emoji: newVehicle.emoji,
    nickname: nickname || `My ${newVehicle.type}`,
    number,
    image: newVehicle.imageDataUrl || null,
    brand: brand || 'Other',
    model: model || 'Other',
    year,
    cc,
    lastService,
    odometer,
    lastDiagnosis: null,
  };

  State.vehicles.push(vehicle);
  saveState();
  showToast(tr('Vehicle saved!', 'गाड़ी सेव हो गई! ✅', 'ವಾಹನ ಉಳಿಸಲಾಗಿದೆ! ✅'));

  setTimeout(() => {
    goBack();
    renderHomeScreen();
  }, 500);
}

/* ── Modal add-vehicle helpers ── */
function modalSelectVehicleType(type) {
  newVehicle.type = type;
  newVehicle.emoji = VEHICLE_TYPES.find(t => t.id === type)?.emoji || '🏍️';
  document.querySelectorAll('#modal-vtype-grid .vtype-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === type);
  });
  const brandSel = document.getElementById('modal-v-brand');
  if (brandSel) {
    brandSel.innerHTML = `<option value="">${tr('Select brand', 'ब्रांड चुनें', 'ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ')}</option>` +
      (VEHICLE_BRANDS[type] || []).map(b => `<option value="${b}">${b}</option>`).join('');
  }
  const modelSel = document.getElementById('modal-v-model');
  if (modelSel) modelSel.innerHTML = `<option value="">${tr('Select brand first', 'पहले ब्रांड चुनें', 'ಮೊದಲು ಬ್ರಾಂಡ್ ಆಯ್ಕೆಮಾಡಿ')}</option>`;
}

function modalUpdateModels() {
  const brand = document.getElementById('modal-v-brand')?.value;
  const type = newVehicle.type || 'bike';
  const models = VEHICLE_MODELS[type]?.[brand] || [];
  const sel = document.getElementById('modal-v-model');
  if (sel) {
    sel.innerHTML = models.length
      ? models.map(m => `<option value="${m}">${m}</option>`).join('')
      : `<option value="">${tr('Other', 'अन्य', 'ಇತರೆ')}</option>`;
  }
}

function saveVehicleFromModal() {
  const nickname = document.getElementById('modal-v-nickname')?.value.trim();
  if (!nickname) {
    showToast(tr('Please enter a name for your vehicle', 'कृपया नाम दर्ज करें', 'ದಯವಿಟ್ಟು ಹೆಸರು ನಮೂದಿಸಿ'));
    return;
  }
  const vehicle = {
    id: 'v' + Date.now(),
    type: newVehicle.type,
    emoji: newVehicle.emoji,
    nickname,
    number: (document.getElementById('modal-v-number')?.value || '').trim(),
    image: null,
    brand: document.getElementById('modal-v-brand')?.value || 'Other',
    model: document.getElementById('modal-v-model')?.value || 'Other',
    year: parseInt(document.getElementById('modal-v-year')?.value) || 2024,
    cc: parseInt(document.getElementById('modal-v-cc')?.value) || 110,
    lastService: document.getElementById('modal-v-service-date')?.value || new Date().toISOString().split('T')[0],
    odometer: parseInt(document.getElementById('modal-v-odometer')?.value) || 0,
    lastDiagnosis: null,
  };
  State.vehicles.push(vehicle);
  saveState();
  document.getElementById('add-vehicle-modal')?.remove();
  showToast(tr('Vehicle saved! ✅', 'गाड़ी सेव हो गई! ✅', 'ವಾಹನ ಉಳಿಸಲಾಗಿದೆ! ✅'));
  renderHomeScreen();
}

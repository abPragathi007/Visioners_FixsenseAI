/* ═══════════════════════════════════════════════════════════
   SCREEN 3 · ADD / MANAGE VEHICLE
   ═══════════════════════════════════════════════════════════ */
let newVehicle = {};

function renderAddVehicleScreen() {
  newVehicle = { type: 'bike', emoji: '🏍️' };
  const el = document.getElementById('screen-add-vehicle');

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack()">${Icons.back}</div>
      <h2 class="page-title">${State.language === 'hi' ? 'नई गाड़ी जोड़ें' : 'Add Vehicle'}</h2>
    </div>
    <div class="add-vehicle-content stagger-children">

      <!-- Vehicle Type -->
      <div class="form-group">
        <label class="label">${State.language === 'hi' ? 'गाड़ी का प्रकार' : 'Vehicle Type'}</label>
        <div class="vehicle-type-grid" id="vtype-grid">
          ${VEHICLE_TYPES.map(t => `
            <div class="vtype-btn ${t.id === 'bike' ? 'selected' : ''}" data-type="${t.id}" onclick="selectVehicleType('${t.id}')">
              <span class="vtype-emoji">${t.emoji}</span>
              <span class="vtype-name">${t.label}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Nickname -->
      <div class="form-group">
        <label class="label">${State.language === 'hi' ? 'गाड़ी का नाम' : 'Nickname'}</label>
        <input type="text" class="input-field" id="v-nickname" placeholder="${State.language === 'hi' ? 'जैसे: मेरी बाइक' : 'e.g. My Splendor'}" maxlength="30" />
      </div>

      <!-- Brand -->
      <div class="form-group">
        <label class="label">${State.language === 'hi' ? 'ब्रांड' : 'Brand'}</label>
        <select class="input-field" id="v-brand" onchange="updateModels()">
          <option value="">Select brand</option>
          ${(VEHICLE_BRANDS.bike || []).map(b => `<option value="${b}">${b}</option>`).join('')}
        </select>
      </div>

      <!-- Model -->
      <div class="form-group">
        <label class="label">${State.language === 'hi' ? 'मॉडल' : 'Model'}</label>
        <select class="input-field" id="v-model">
          <option value="">Select brand first</option>
        </select>
      </div>

      <!-- Year + CC -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="label">${State.language === 'hi' ? 'साल' : 'Year'}</label>
          <select class="input-field" id="v-year">
            ${Array.from({length: 15}, (_, i) => 2025 - i).map(y => `<option value="${y}">${y}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="label">Engine CC</label>
          <input type="number" class="input-field" id="v-cc" placeholder="110" min="50" max="2000" />
        </div>
      </div>

      <!-- Last Service Date -->
      <div class="form-group">
        <label class="label">${State.language === 'hi' ? 'अंतिम सर्विस की तारीख' : 'Last Service Date'}</label>
        <input type="date" class="input-field" id="v-service-date" value="${new Date().toISOString().split('T')[0]}" />
      </div>

      <!-- Odometer -->
      <div class="form-group">
        <label class="label">${State.language === 'hi' ? 'ओडोमीटर (km)' : 'Odometer Reading (km)'}</label>
        <input type="number" class="input-field" id="v-odometer" placeholder="15000" min="0" max="999999" />
      </div>

      <!-- Save Button -->
      <button class="btn btn-primary btn-full btn-lg" onclick="saveVehicle()" style="margin-top: 8px;">
        ${State.language === 'hi' ? '💾 गाड़ी सेव करें' : '💾 Save Vehicle'}
      </button>

      <div style="height: 40px;"></div>
    </div>
  `;
}

function selectVehicleType(type) {
  newVehicle.type = type;
  newVehicle.emoji = VEHICLE_TYPES.find(t => t.id === type)?.emoji || '🏍️';

  document.querySelectorAll('.vtype-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.type === type);
  });

  // Update brand dropdown
  const brandSel = document.getElementById('v-brand');
  brandSel.innerHTML = '<option value="">Select brand</option>' +
    (VEHICLE_BRANDS[type] || []).map(b => `<option value="${b}">${b}</option>`).join('');
  document.getElementById('v-model').innerHTML = '<option value="">Select brand first</option>';
}

function updateModels() {
  const brand = document.getElementById('v-brand').value;
  const type = newVehicle.type || 'bike';
  const models = VEHICLE_MODELS[type]?.[brand] || [];

  document.getElementById('v-model').innerHTML =
    models.length
      ? models.map(m => `<option value="${m}">${m}</option>`).join('')
      : '<option value="">Other</option>';
}

function saveVehicle() {
  const nickname = document.getElementById('v-nickname').value.trim();
  const brand = document.getElementById('v-brand').value;
  const model = document.getElementById('v-model').value;
  const year = parseInt(document.getElementById('v-year').value);
  const cc = parseInt(document.getElementById('v-cc').value) || 110;
  const lastService = document.getElementById('v-service-date').value;
  const odometer = parseInt(document.getElementById('v-odometer').value) || 0;

  if (!nickname) { showToast('Please enter a nickname for your vehicle'); return; }

  const vehicle = {
    id: 'v' + Date.now(),
    type: newVehicle.type,
    emoji: newVehicle.emoji,
    nickname: nickname || `My ${newVehicle.type}`,
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
  showToast(State.language === 'hi' ? 'गाड़ी सेव हो गई! ✅' : 'Vehicle saved! ✅');

  setTimeout(() => {
    goBack();
    renderHomeScreen();
  }, 500);
}

/* ═══════════════════════════════════════════════════════════
   SEED DATA — Bike Health AI
   ═══════════════════════════════════════════════════════════ */

const VEHICLE_TYPES = [
  { id: 'bike', label: 'Bike', emoji: '🏍️', desc: '100cc–150cc' },
  { id: 'scooter', label: 'Scooter', emoji: '🛵', desc: 'Activa, Jupiter' },
  { id: 'auto', label: 'Auto Rickshaw', emoji: '🛺', desc: 'CNG + Petrol' },
];

const VEHICLE_BRANDS = {
  bike: ['Hero', 'Bajaj', 'Honda', 'TVS', 'Yamaha', 'Royal Enfield', 'KTM', 'Other'],
  scooter: ['Honda', 'TVS', 'Suzuki', 'Hero', 'Yamaha', 'Vespa', 'Other'],
  auto: ['Bajaj', 'TVS', 'Mahindra', 'Piaggio', 'Other'],
};

const VEHICLE_MODELS = {
  bike: {
    Hero: ['Splendor Plus', 'HF Deluxe', 'Glamour', 'Xtreme 160R', 'Passion Pro'],
    Bajaj: ['Pulsar 125', 'Pulsar 150', 'Platina', 'CT100', 'Avenger'],
    Honda: ['CB Shine', 'CB Unicorn', 'Livo', 'CB300R'],
    TVS: ['Apache RTR 160', 'Raider 125', 'Star City+', 'Victor'],
    Yamaha: ['FZ-S', 'MT-15', 'R15', 'Saluto'],
    'Royal Enfield': ['Classic 350', 'Bullet 350', 'Meteor 350', 'Hunter 350'],
    KTM: ['Duke 125', 'Duke 200', 'Duke 390', 'RC 200'],
    Other: ['Other'],
  },
  scooter: {
    Honda: ['Activa 6G', 'Activa 125', 'Dio', 'Grazia', 'Aviator'],
    TVS: ['Jupiter', 'NTorq 125', 'Pep+', 'Wego'],
    Suzuki: ['Access 125', 'Burgman Street', 'Avenis'],
    Hero: ['Maestro Edge', 'Pleasure+', 'Destini 125', 'Xoom'],
    Yamaha: ['Fascino 125', 'Ray ZR', 'Aerox 155'],
    Vespa: ['SxL 125', 'VXL 125', 'ZX'],
    Other: ['Other'],
  },
  auto: {
    Bajaj: ['RE Compact', 'Maxima Z', 'RE Plus', 'Trima'],
    TVS: ['King Deluxe', 'King DURAMAX'],
    Mahindra: ['Alfa Load', 'Alfa Passenger', 'Treo'],
    Piaggio: ['Ape City', 'Ape E-City', 'Ape Xtra Ldg'],
    Other: ['Other'],
  },
};

const SYMPTOM_TAGS = [
  { label: 'Hard starting', emoji: '🔑' },
  { label: 'Black smoke', emoji: '💨' },
  { label: 'White smoke', emoji: '☁️' },
  { label: 'Blue smoke', emoji: '🔵' },
  { label: 'Vibration', emoji: '📳' },
  { label: 'Poor mileage', emoji: '⛽' },
  { label: 'Engine noise', emoji: '🔊' },
  { label: 'Brake issue', emoji: '🛑' },
  { label: 'Overheating', emoji: '🌡️' },
  { label: 'Oil leak', emoji: '💧' },
  { label: 'Chain slip', emoji: '⛓️' },
  { label: 'Wiper issue', emoji: '🪟' },
];

const DID_YOU_KNOW = [
  'Regular oil changes every 3,000 km can extend your engine life by up to 40%.',
  'A weak battery is the #1 cause of hard starting in Indian summers.',
  'Checking tyre pressure once a week can improve your mileage by 3–5%.',
  'Engine overheating above 105°C can permanently damage cylinder walls.',
  'Auto rickshaws need oil checks twice as often due to stop-and-go traffic.',
  'Air filter cleaning every 4,000 km improves pick-up and fuel efficiency.',
  'Battery voltage below 12V means your bike may not start in cold weather.',
  'CNG pressure below 130 PSI means your auto has less than 25% fuel left.',
];

const MECHANIC_MODE_TIPS = {
  en: {
    engineOverheating: 'Stop immediately. Let engine cool for 30 minutes. Check coolant level. Do not add cold water to a hot engine.',
    lowOil: 'Top up with SAE 10W-30 mineral oil. Do not ride until level is above MIN mark.',
    dirtyOil: 'Schedule oil + filter change. Continued use of dirty oil accelerates engine wear.',
    weakBattery: 'Charge battery with smart charger. Test charging voltage at 2000 RPM — should read 13.8–14.8V.',
    airFilter: 'Remove and blow out with compressed air. Replace if torn or oil-soaked.',
    fuelFilter: 'Replace fuel filter. Check for air bubbles in fuel line.',
    engineWear: 'Compression test recommended. Monitor oil consumption. Avoid high-rev riding.',
    coolantDrop: 'Pressure-test cooling system. Inspect radiator hoses for cracks. Replace coolant if milky.',
    brake: 'Inspect brake pads thickness — replace below 2mm. Bleed brake lines if spongy feel.',
    acBlocked: 'Check condenser fins for mud. Clean with low-pressure water. Inspect belt tension.',
    wiper: 'Replace wiper blades. Check washer pump operation and fluid level.',
  },
  hi: {
    engineOverheating: 'तुरंत रोकें। इंजन 30 मिनट ठंडा होने दें। कूलेंट लेवल जांचें। गर्म इंजन में ठंडा पानी न डालें।',
    lowOil: 'SAE 10W-30 मिनरल ऑयल डालें। MIN मार्क से ऊपर होने तक न चलाएं।',
    dirtyOil: 'तेल + फिल्टर बदलवाएं। गंदा तेल इंजन को नुकसान पहुंचाता है।',
    weakBattery: 'स्मार्ट चार्जर से बैटरी चार्ज करें। 2000 RPM पर चार्जिंग वोल्टेज 13.8–14.8V होनी चाहिए।',
    airFilter: 'एयर फिल्टर निकाल कर कंप्रेस्ड एयर से साफ करें। फटा हो तो बदलें।',
    fuelFilter: 'फ्यूल फिल्टर बदलें। फ्यूल लाइन में हवा के बुलबुले जांचें।',
    engineWear: 'कंप्रेशन टेस्ट करवाएं। तेल की खपत पर नजर रखें। ज्यादा RPM से बचें।',
    coolantDrop: 'कूलिंग सिस्टम का प्रेशर टेस्ट करें। रेडिएटर होज़ की जांच करें।',
    brake: 'ब्रेक पैड की मोटाई जांचें — 2mm से कम हो तो बदलें। स्पंजी फील हो तो ब्लीड करें।',
    acBlocked: 'कंडेंसर फिन्स की मिट्टी साफ करें। बेल्ट टेंशन जांचें।',
    wiper: 'वाइपर ब्लेड बदलें। वॉशर पंप और फ्लूइड लेवल जांचें।',
  }
};

const TIPS_ARTICLES = [
  { id: 1, cat: 'Monsoon', emoji: '🌧️', title: 'Monsoon Bike Checklist: 10 Things to Inspect Before the Rains', read: '4 min', type: 'article' },
  { id: 2, cat: 'Engine', emoji: '🔧', title: 'Why Your Bike Engine Overheats in Indian Summers', read: '3 min', type: 'article' },
  { id: 3, cat: 'Winter', emoji: '❄️', title: 'Cold Start Tips: Getting Your Bike Running in Chilly Mornings', read: '3 min', type: 'article' },
  { id: 4, cat: 'Fuel', emoji: '⛽', title: 'How to Get 70+ kmpl from Your Splendor or Activa', read: '5 min', type: 'article' },
  { id: 5, cat: 'Auto', emoji: '🛺', title: 'Auto Rickshaw Maintenance on ₹500 a Month — Complete Guide', read: '6 min', type: 'article' },
  { id: 6, cat: 'Battery', emoji: '🔋', title: 'When to Replace Your Bike Battery — 5 Warning Signs', read: '3 min', type: 'article' },
  { id: 7, cat: 'Video', emoji: '▶️', title: 'How to Change Engine Oil at Home in 10 Minutes', url: '#', type: 'video' },
  { id: 8, cat: 'Video', emoji: '▶️', title: 'Checking Tyre Pressure the Right Way', url: '#', type: 'video' },
];

const TIPS_CATEGORIES = ['All', 'Monsoon', 'Engine', 'Winter', 'Fuel', 'Auto', 'Battery', 'Video'];

// Seed vehicles
function initSeedData() {
  if (State.vehicles.length === 0) {
    State.vehicles = [
      {
        id: 'v1',
        type: 'bike',
        emoji: '🏍️',
        nickname: 'My Splendor',
        brand: 'Hero',
        model: 'Splendor Plus',
        year: 2021,
        cc: 100,
        lastService: '2025-01-10',
        odometer: 18500,
        lastDiagnosis: { score: 78, color: 'amber', date: '2025-02-14' },
      },
      {
        id: 'v2',
        type: 'scooter',
        emoji: '🛵',
        nickname: 'Activa',
        brand: 'Honda',
        model: 'Activa 6G',
        year: 2022,
        cc: 110,
        lastService: '2025-03-01',
        odometer: 12000,
        lastDiagnosis: { score: 91, color: 'green', date: '2025-03-10' },
      },
      {
        id: 'v3',
        type: 'auto',
        emoji: '🛺',
        nickname: 'Auto #1',
        brand: 'Bajaj',
        model: 'RE Compact',
        year: 2020,
        cc: 216,
        lastService: '2025-01-05',
        odometer: 45000,
        lastDiagnosis: { score: 45, color: 'red', date: '2025-02-20' },
      },
    ];
    State.diagnoseHistory = [
      { id: 'h1', vehicleId: 'v1', vehicleName: 'My Splendor', score: 78, color: 'amber', date: '2025-02-14', issues: ['Low engine oil', 'Air filter check'] },
      { id: 'h2', vehicleId: 'v2', vehicleName: 'Activa', score: 91, color: 'green', date: '2025-03-10', issues: [] },
      { id: 'h3', vehicleId: 'v3', vehicleName: 'Auto #1', score: 45, color: 'red', date: '2025-02-20', issues: ['Engine overheating', 'Dirty oil', 'Weak battery'] },
      { id: 'h4', vehicleId: 'v1', vehicleName: 'My Splendor', score: 65, color: 'amber', date: '2025-01-20', issues: ['Km service overdue'] },
      { id: 'h5', vehicleId: 'v3', vehicleName: 'Auto #1', score: 55, color: 'amber', date: '2025-01-15', issues: ['Low CNG pressure', 'High temp'] },
    ];
  }
}

// Health color/label helpers
function getHealthColor(score) {
  if (score >= 75) return 'green';
  if (score >= 50) return 'amber';
  return 'red';
}

function getHealthLabel(score, lang) {
  if (lang === 'hi') {
    if (score >= 75) return 'बढ़िया हालत';
    if (score >= 50) return 'ध्यान दें';
    return 'तुरंत ठीक करें';
  }
  if (score >= 75) return 'Good Condition';
  if (score >= 50) return 'Needs Attention';
  return 'Critical — Act Now';
}

function getScoreHex(score) {
  if (score >= 75) return '#22C55E';
  if (score >= 50) return '#FFBB44';
  return '#EF4444';
}

// Mini health ring SVG
function renderMiniRing(score, size = 36) {
  const color = getScoreHex(score);
  const r = (size / 2) - 3;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="3"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="3"
        stroke-linecap="round"
        stroke-dasharray="${dash} ${circ - dash}"
        style="filter:drop-shadow(0 0 4px ${color}88)"/>
    </svg>`;
}

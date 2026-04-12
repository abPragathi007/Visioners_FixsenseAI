/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   AI ENGINE â€” Bike Health AI
   Claude API integration + local fallback analysis
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */

// â”€â”€ Fault Thresholds â”€â”€
const THRESHOLDS = {
  engineTemp: { normal: 95, warning: 105, critical: 110 },
  oilLevel: { normal: 40, warning: 30, critical: 25 },
  battery: { normal: 12.4, warning: 12.2, critical: 12.0 },
  kmService: { oil: 3000, airFilter: 4000, fuelFilter: 5000 },
  cngPressure: { normal: 150, warning: 140, critical: 120 },
};

// â”€â”€ Build Analysis Prompt â€” SHORT for fast API response â”€â”€
function buildPrompt(inputs, vehicle, lang) {
  const complaint = (inputs.symptoms || '').trim();
  const veh = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Unknown vehicle';
  const isHi = lang === 'hi';

  return `Vehicle: ${veh}. Problem: "${complaint || 'none'}". Sensors: temp=${inputs.engineTemp}C, battery=${inputs.batteryVolt}V, oil=${inputs.oilLevel}%, km_since_service=${inputs.kmSinceService}${vehicle?.type === 'auto' ? `, cng=${inputs.cngPressure}PSI` : ''}.

RULES: If complaint mentions brake/brakes â†’ scoreâ‰¤35,severity=critical. If overheat/smoke â†’ scoreâ‰¤45. If oil/leak â†’ scoreâ‰¤40. If battery/start â†’ scoreâ‰¤45. If tyre/puncture â†’ scoreâ‰¤50. If complaint empty and sensors normal â†’ score 80-95. Never score>60 if complaint is non-empty.

Reply ONLY in JSON (no markdown):
{"score":<0-100>,"status":"HEALTHY|WARNING|CRITICAL","issue":"<main problem>","cause":"<why>","fix":"<numbered steps>","severity":"Minor|Moderate|Critical","cost_inr":"<â‚¹range>","summary":"<1 sentence ${isHi ? 'in Hindi' : 'in English'}>"}`;
}

// â”€â”€ Local Fallback Analysis (no API key needed) â”€â”€
function localAnalysis(inputs, vehicle, lang) {
  const isHindi = lang === 'hi';
  const isAuto = vehicle?.type === 'auto';
  const issues = [];
  const complaint = (inputs.symptoms || '').toLowerCase();

  const addIssue = (id, nameEn, nameHi, severity, actionEn, actionHi, costMin, costMax, tipEn, tipHi) => {
    issues.push({
      id,
      name: isHindi ? nameHi : nameEn,
      severity,
      action: isHindi ? actionHi : actionEn,
      costMin: isAuto ? Math.round(costMin * 1.5) : costMin,
      costMax: isAuto ? Math.round(costMax * 1.5) : costMax,
      tip: isHindi ? tipHi : tipEn,
    });
  };

  // â”€â”€ FIX 2: Keyword detection from user complaint â”€â”€
  const hasBrake    = /brake|brakes|à¤¬à¥à¤°à¥‡à¤•|à²¬à³à²°à³‡à²•à³/.test(complaint);
  const hasOverheat = /overheat|overheating|à¤“à¤µà¤°à¤¹à¥€à¤Ÿ|à²“à²µà²°à³â€Œà²¹à³€à²Ÿ/.test(complaint);
  const hasSmoke    = /smoke|à¤§à¥à¤†à¤‚|à²¹à³Šà²—à³†/.test(complaint);
  const hasOilLeak  = /oil leak|oil smoke|à¤¤à¥‡à¤² à¤°à¤¿à¤¸à¤¾à¤µ|à²Žà²£à³à²£à³† à²¸à³‹à²°à²¿à²•à³†/.test(complaint);
  const hasBattery  = /battery|not starting|start nahi|à¤¬à¥ˆà¤Ÿà¤°à¥€|à²¬à³à²¯à²¾à²Ÿà²°à²¿/.test(complaint);
  const hasTyre     = /tyre|tire|puncture|à¤Ÿà¤¾à¤¯à¤°|à²Ÿà³ˆà²°à³/.test(complaint);
  const hasVibration= /vibrat|shake|à¤•à¤‚à¤ªà¤¨|à²•à²‚à²ªà²¨/.test(complaint);
  const hasNoise    = /noise|sound|à¤†à¤µà¤¾à¤œ|à²¶à²¬à³à²¦/.test(complaint);
  const hasMileage  = /mileage|à¤®à¤¾à¤‡à¤²à¥‡à¤œ|à²®à³ˆà²²à³‡à²œà³/.test(complaint);
  const hasChain    = /chain|à¤šà¥‡à¤¨|à²šà³ˆà²¨à³/.test(complaint);

  if (hasBrake) {
    addIssue('brake', 'Brake Failure â€” CRITICAL', 'à¤¬à¥à¤°à¥‡à¤• à¤«à¥‡à¤² â€” à¤—à¤‚à¤­à¥€à¤°',
      'critical',
      '1. Stop riding immediately â€” do NOT ride with faulty brakes.\n2. Inspect brake pads â€” replace if below 2mm.\n3. Check brake fluid level and top up if low.\n4. Bleed brake lines if lever feels spongy.\n5. Visit mechanic before riding again.',
      '1. à¤¤à¥à¤°à¤‚à¤¤ à¤—à¤¾à¤¡à¤¼à¥€ à¤°à¥‹à¤•à¥‡à¤‚ â€” à¤–à¤°à¤¾à¤¬ à¤¬à¥à¤°à¥‡à¤• à¤•à¥‡ à¤¸à¤¾à¤¥ à¤¨ à¤šà¤²à¤¾à¤à¤‚à¥¤\n2. à¤¬à¥à¤°à¥‡à¤• à¤ªà¥ˆà¤¡ à¤œà¤¾à¤‚à¤šà¥‡à¤‚ â€” 2mm à¤¸à¥‡ à¤•à¤® à¤¹à¥‹ à¤¤à¥‹ à¤¬à¤¦à¤²à¥‡à¤‚à¥¤\n3. à¤¬à¥à¤°à¥‡à¤• à¤«à¥à¤²à¥‚à¤‡à¤¡ à¤²à¥‡à¤µà¤² à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n4. à¤®à¥ˆà¤•à¥‡à¤¨à¤¿à¤• à¤•à¥‡ à¤ªà¤¾à¤¸ à¤œà¤¾à¤à¤‚à¥¤',
      300, 2000,
      'Faulty brakes are the #1 cause of accidents. Never ride until fixed.',
      'à¤–à¤°à¤¾à¤¬ à¤¬à¥à¤°à¥‡à¤• à¤¦à¥à¤°à¥à¤˜à¤Ÿà¤¨à¤¾ à¤•à¤¾ à¤¸à¤¬à¤¸à¥‡ à¤¬à¤¡à¤¼à¤¾ à¤•à¤¾à¤°à¤£ à¤¹à¥ˆà¥¤ à¤ à¥€à¤• à¤¹à¥‹à¤¨à¥‡ à¤¤à¤• à¤¨ à¤šà¤²à¤¾à¤à¤‚à¥¤');
  }

  if (hasOverheat || hasSmoke) {
    addIssue('engineOverheating', 'Engine Overheating', 'à¤‡à¤‚à¤œà¤¨ à¤“à¤µà¤°à¤¹à¥€à¤Ÿà¤¿à¤‚à¤—',
      'critical',
      '1. Pull over and switch off engine immediately.\n2. Wait 20-30 minutes for engine to cool.\n3. Check coolant level â€” top up if low.\n4. Check engine oil level.\n5. Do NOT add cold water to hot engine.',
      '1. à¤¤à¥à¤°à¤‚à¤¤ à¤—à¤¾à¤¡à¤¼à¥€ à¤°à¥‹à¤•à¥‡à¤‚ à¤”à¤° à¤‡à¤‚à¤œà¤¨ à¤¬à¤‚à¤¦ à¤•à¤°à¥‡à¤‚à¥¤\n2. 20-30 à¤®à¤¿à¤¨à¤Ÿ à¤ à¤‚à¤¡à¤¾ à¤¹à¥‹à¤¨à¥‡ à¤¦à¥‡à¤‚à¥¤\n3. à¤•à¥‚à¤²à¥‡à¤‚à¤Ÿ à¤²à¥‡à¤µà¤² à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n4. à¤ à¤‚à¤¡à¥‡ à¤‡à¤‚à¤œà¤¨ à¤®à¥‡à¤‚ à¤ à¤‚à¤¡à¤¾ à¤ªà¤¾à¤¨à¥€ à¤¨ à¤¡à¤¾à¤²à¥‡à¤‚à¥¤',
      300, 3000,
      'Overheating can permanently damage your engine. Stop immediately.',
      'à¤“à¤µà¤°à¤¹à¥€à¤Ÿà¤¿à¤‚à¤— à¤¸à¥‡ à¤‡à¤‚à¤œà¤¨ à¤¸à¥à¤¥à¤¾à¤¯à¥€ à¤°à¥‚à¤ª à¤¸à¥‡ à¤–à¤°à¤¾à¤¬ à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤');
  }

  if (hasOilLeak) {
    addIssue('oilLeak', 'Oil Leak Detected', 'à¤¤à¥‡à¤² à¤°à¤¿à¤¸à¤¾à¤µ',
      'critical',
      '1. Stop riding â€” oil leak can cause engine seizure.\n2. Check oil level immediately.\n3. Identify leak source (gasket, drain plug, seals).\n4. Visit mechanic for repair.',
      '1. à¤—à¤¾à¤¡à¤¼à¥€ à¤°à¥‹à¤•à¥‡à¤‚ â€” à¤¤à¥‡à¤² à¤°à¤¿à¤¸à¤¾à¤µ à¤¸à¥‡ à¤‡à¤‚à¤œà¤¨ à¤œà¤¾à¤® à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤\n2. à¤¤à¥‡à¤² à¤²à¥‡à¤µà¤² à¤¤à¥à¤°à¤‚à¤¤ à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n3. à¤®à¥ˆà¤•à¥‡à¤¨à¤¿à¤• à¤¸à¥‡ à¤°à¤¿à¤¸à¤¾à¤µ à¤ à¥€à¤• à¤•à¤°à¤µà¤¾à¤à¤‚à¥¤',
      500, 3000,
      'Oil leaks can cause engine seizure within minutes of riding.',
      'à¤¤à¥‡à¤² à¤°à¤¿à¤¸à¤¾à¤µ à¤¸à¥‡ à¤‡à¤‚à¤œà¤¨ à¤•à¥à¤› à¤¹à¥€ à¤®à¤¿à¤¨à¤Ÿà¥‹à¤‚ à¤®à¥‡à¤‚ à¤œà¤¾à¤® à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤');
  }

  if (hasBattery) {
    addIssue('weakBattery', 'Battery / Starting Issue', 'à¤¬à¥ˆà¤Ÿà¤°à¥€ / à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿà¤¿à¤‚à¤— à¤¸à¤®à¤¸à¥à¤¯à¤¾',
      'warning',
      '1. Check battery voltage â€” should be above 12.4V.\n2. Charge battery with smart charger overnight.\n3. Get load test done at battery shop.\n4. Replace if battery is over 2 years old.',
      '1. à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤µà¥‹à¤²à¥à¤Ÿà¥‡à¤œ à¤œà¤¾à¤‚à¤šà¥‡à¤‚ â€” 12.4V à¤¸à¥‡ à¤Šà¤ªà¤° à¤¹à¥‹à¤¨à¥€ à¤šà¤¾à¤¹à¤¿à¤à¥¤\n2. à¤°à¤¾à¤¤ à¤­à¤° à¤šà¤¾à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚à¥¤\n3. à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤¶à¥‰à¤ª à¤ªà¤° à¤²à¥‹à¤¡ à¤Ÿà¥‡à¤¸à¥à¤Ÿ à¤•à¤°à¤µà¤¾à¤à¤‚à¥¤',
      100, 2500,
      'A weak battery is the #1 reason bikes don\'t start in Indian summers.',
      'à¤•à¤®à¤œà¥‹à¤° à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤—à¤°à¥à¤®à¤¿à¤¯à¥‹à¤‚ à¤®à¥‡à¤‚ à¤—à¤¾à¤¡à¤¼à¥€ à¤¨ à¤¸à¥à¤Ÿà¤¾à¤°à¥à¤Ÿ à¤¹à¥‹à¤¨à¥‡ à¤•à¤¾ à¤¸à¤¬à¤¸à¥‡ à¤¬à¤¡à¤¼à¤¾ à¤•à¤¾à¤°à¤£ à¤¹à¥ˆà¥¤');
  }

  if (hasTyre) {
    addIssue('tyre', 'Tyre Issue / Puncture', 'à¤Ÿà¤¾à¤¯à¤° à¤¸à¤®à¤¸à¥à¤¯à¤¾ / à¤ªà¤‚à¤šà¤°',
      'warning',
      '1. Check tyre pressure â€” inflate to recommended PSI.\n2. Inspect for puncture or nail.\n3. Check tread depth â€” replace if below 1.6mm.\n4. Visit tyre shop for repair or replacement.',
      '1. à¤Ÿà¤¾à¤¯à¤° à¤ªà¥à¤°à¥‡à¤¶à¤° à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n2. à¤ªà¤‚à¤šà¤° à¤•à¥‡ à¤²à¤¿à¤ à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n3. à¤Ÿà¤¾à¤¯à¤° à¤¶à¥‰à¤ª à¤ªà¤° à¤œà¤¾à¤à¤‚à¥¤',
      100, 2000,
      'Riding on a flat or low-pressure tyre damages the rim and is dangerous.',
      'à¤•à¤® à¤ªà¥à¤°à¥‡à¤¶à¤° à¤µà¤¾à¤²à¥‡ à¤Ÿà¤¾à¤¯à¤° à¤ªà¤° à¤šà¤²à¤¨à¤¾ à¤–à¤¤à¤°à¤¨à¤¾à¤• à¤¹à¥ˆ à¤”à¤° à¤°à¤¿à¤® à¤•à¥‹ à¤¨à¥à¤•à¤¸à¤¾à¤¨ à¤ªà¤¹à¥à¤‚à¤šà¤¾à¤¤à¤¾ à¤¹à¥ˆà¥¤');
  }

  if (hasVibration || hasNoise) {
    addIssue('vibration', 'Vibration / Unusual Noise', 'à¤•à¤‚à¤ªà¤¨ / à¤…à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯ à¤†à¤µà¤¾à¤œ',
      'warning',
      '1. Check wheel balance and alignment.\n2. Inspect chain tension and lubrication.\n3. Check engine mounts for looseness.\n4. Visit mechanic for full inspection.',
      '1. à¤µà¥à¤¹à¥€à¤² à¤¬à¥ˆà¤²à¥‡à¤‚à¤¸ à¤”à¤° à¤…à¤²à¤¾à¤‡à¤¨à¤®à¥‡à¤‚à¤Ÿ à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n2. à¤šà¥‡à¤¨ à¤Ÿà¥‡à¤‚à¤¶à¤¨ à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n3. à¤®à¥ˆà¤•à¥‡à¤¨à¤¿à¤• à¤¸à¥‡ à¤ªà¥‚à¤°à¥€ à¤œà¤¾à¤‚à¤š à¤•à¤°à¤µà¤¾à¤à¤‚à¥¤',
      200, 2000,
      'Vibration often indicates loose parts or wheel imbalance â€” get it checked soon.',
      'à¤•à¤‚à¤ªà¤¨ à¤…à¤•à¥à¤¸à¤° à¤¢à¥€à¤²à¥‡ à¤ªà¥à¤°à¥à¤œà¥‹à¤‚ à¤•à¤¾ à¤¸à¤‚à¤•à¥‡à¤¤ à¤¹à¥ˆ â€” à¤œà¤²à¥à¤¦à¥€ à¤œà¤¾à¤‚à¤š à¤•à¤°à¤µà¤¾à¤à¤‚à¥¤');
  }

  if (hasMileage) {
    addIssue('poorMileage', 'Poor Fuel Efficiency', 'à¤•à¤® à¤®à¤¾à¤‡à¤²à¥‡à¤œ',
      'monitor',
      '1. Check tyre pressure â€” under-inflation reduces mileage by 10%.\n2. Clean or replace air filter.\n3. Check spark plug â€” replace if worn.\n4. Ensure choke is fully off.',
      '1. à¤Ÿà¤¾à¤¯à¤° à¤ªà¥à¤°à¥‡à¤¶à¤° à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤\n2. à¤à¤¯à¤° à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¸à¤¾à¤« à¤•à¤°à¥‡à¤‚à¥¤\n3. à¤¸à¥à¤ªà¤¾à¤°à¥à¤• à¤ªà¥à¤²à¤— à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤',
      100, 800,
      'Proper tyre pressure alone can improve mileage by 3-5 kmpl.',
      'à¤¸à¤¹à¥€ à¤Ÿà¤¾à¤¯à¤° à¤ªà¥à¤°à¥‡à¤¶à¤° à¤¸à¥‡ à¤®à¤¾à¤‡à¤²à¥‡à¤œ 3-5 à¤•à¤¿à¤²à¥‹à¤®à¥€à¤Ÿà¤° à¤ªà¥à¤°à¤¤à¤¿ à¤²à¥€à¤Ÿà¤° à¤¬à¤¢à¤¼ à¤¸à¤•à¤¤à¥€ à¤¹à¥ˆà¥¤');
  }

  if (hasChain) {
    addIssue('chain', 'Chain Issue', 'à¤šà¥‡à¤¨ à¤¸à¤®à¤¸à¥à¤¯à¤¾',
      'warning',
      '1. Check chain tension â€” should have 20-30mm slack.\n2. Lubricate chain with chain lube.\n3. Inspect for worn or broken links.\n4. Replace chain if stretched beyond limit.',
      '1. à¤šà¥‡à¤¨ à¤Ÿà¥‡à¤‚à¤¶à¤¨ à¤œà¤¾à¤‚à¤šà¥‡à¤‚ â€” 20-30mm à¤¢à¥€à¤²à¥€ à¤¹à¥‹à¤¨à¥€ à¤šà¤¾à¤¹à¤¿à¤à¥¤\n2. à¤šà¥‡à¤¨ à¤²à¥à¤¬à¥à¤°à¤¿à¤•à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚à¥¤\n3. à¤˜à¤¿à¤¸à¥€ à¤¹à¥à¤ˆ à¤•à¤¡à¤¼à¤¿à¤¯à¤¾à¤‚ à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤',
      200, 1500,
      'A dry or loose chain can snap while riding â€” lubricate every 500 km.',
      'à¤¸à¥‚à¤–à¥€ à¤¯à¤¾ à¤¢à¥€à¤²à¥€ à¤šà¥‡à¤¨ à¤šà¤²à¤¤à¥‡ à¤¸à¤®à¤¯ à¤Ÿà¥‚à¤Ÿ à¤¸à¤•à¤¤à¥€ à¤¹à¥ˆ â€” à¤¹à¤° 500 km à¤ªà¤° à¤²à¥à¤¬à¥à¤°à¤¿à¤•à¥‡à¤Ÿ à¤•à¤°à¥‡à¤‚à¥¤');
  }

  // â”€â”€ Sensor-based detection (existing logic) â”€â”€
  if (inputs.engineTemp > THRESHOLDS.engineTemp.critical && !hasOverheat) {
    addIssue('coolantDrop', 'Coolant Level Critical', 'à¤•à¥‚à¤²à¥‡à¤‚à¤Ÿ à¤¬à¤¹à¥à¤¤ à¤•à¤®',
      'critical',
      'Go to mechanic immediately â€” coolant is critically low.',
      'à¤¤à¥à¤°à¤‚à¤¤ à¤®à¥ˆà¤•à¥‡à¤¨à¤¿à¤• à¤•à¥‡ à¤ªà¤¾à¤¸ à¤œà¤¾à¤à¤‚ â€” à¤•à¥‚à¤²à¥‡à¤‚à¤Ÿ à¤¬à¤¹à¥à¤¤ à¤•à¤® à¤¹à¥ˆà¥¤',
      800, 2500,
      'Never add cold water to a hot engine â€” let it cool first, then top up coolant.',
      'à¤—à¤°à¥à¤® à¤‡à¤‚à¤œà¤¨ à¤®à¥‡à¤‚ à¤ à¤‚à¤¡à¤¾ à¤ªà¤¾à¤¨à¥€ à¤¨ à¤¡à¤¾à¤²à¥‡à¤‚à¥¤');
  }

  if (inputs.engineTemp > THRESHOLDS.engineTemp.warning && !hasOverheat) {
    addIssue('engineOverheatSensor', 'Engine Running Hot', 'à¤‡à¤‚à¤œà¤¨ à¤—à¤°à¥à¤® à¤¹à¥ˆ',
      inputs.engineTemp > THRESHOLDS.engineTemp.critical ? 'critical' : 'warning',
      'Stop riding. Let engine cool 30 mins. Check oil + coolant.',
      'à¤—à¤¾à¤¡à¤¼à¥€ à¤°à¥‹à¤•à¥‡à¤‚à¥¤ 30 à¤®à¤¿à¤¨à¤Ÿ à¤ à¤‚à¤¡à¤¾ à¤¹à¥‹à¤¨à¥‡ à¤¦à¥‡à¤‚à¥¤',
      300, 2000,
      'On hot days, take 5-minute breaks every 30 km.',
      'à¤—à¤°à¥à¤®à¥€ à¤®à¥‡à¤‚ à¤¹à¤° 30 km à¤ªà¤° 5 à¤®à¤¿à¤¨à¤Ÿ à¤°à¥à¤•à¥‡à¤‚à¥¤');
  }

  if (inputs.oilLevel <= THRESHOLDS.oilLevel.critical) {
    addIssue('lowOil', 'Engine Oil Critically Low', 'à¤‡à¤‚à¤œà¤¨ à¤‘à¤¯à¤² à¤¬à¤¹à¥à¤¤ à¤•à¤®',
      'critical',
      'Do not ride. Add engine oil immediately.',
      'à¤—à¤¾à¤¡à¤¼à¥€ à¤¨ à¤šà¤²à¤¾à¤à¤‚à¥¤ à¤¤à¥à¤°à¤‚à¤¤ à¤‡à¤‚à¤œà¤¨ à¤‘à¤¯à¤² à¤¡à¤¾à¤²à¥‡à¤‚à¥¤',
      150, 600,
      'Low oil can seize your engine in minutes.',
      'à¤•à¤® à¤¤à¥‡à¤² à¤®à¥‡à¤‚ à¤‡à¤‚à¤œà¤¨ à¤œà¤¾à¤® à¤¹à¥‹ à¤¸à¤•à¤¤à¤¾ à¤¹à¥ˆà¥¤');
  } else if (inputs.oilLevel <= THRESHOLDS.oilLevel.warning) {
    addIssue('lowOil', 'Engine Oil Low', 'à¤‡à¤‚à¤œà¤¨ à¤‘à¤¯à¤² à¤•à¤®',
      'warning',
      'Top up engine oil before your next long ride.',
      'à¤…à¤—à¤²à¥€ à¤²à¤‚à¤¬à¥€ à¤¯à¤¾à¤¤à¥à¤°à¤¾ à¤¸à¥‡ à¤ªà¤¹à¤²à¥‡ à¤‡à¤‚à¤œà¤¨ à¤‘à¤¯à¤² à¤¡à¤¾à¤²à¥‡à¤‚à¥¤',
      150, 400,
      'Check oil every 500 km using the dipstick.',
      'à¤¹à¤° 500 km à¤ªà¤° à¤¡à¤¿à¤ªà¤¸à¥à¤Ÿà¤¿à¤• à¤¸à¥‡ à¤¤à¥‡à¤² à¤œà¤¾à¤‚à¤šà¥‡à¤‚à¥¤');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.oil) {
    addIssue('dirtyOil', 'Oil Change Overdue', 'à¤¤à¥‡à¤² à¤¬à¤¦à¤²à¤¨à¤¾ à¤œà¤°à¥‚à¤°à¥€ à¤¹à¥ˆ',
      inputs.kmSinceService >= THRESHOLDS.kmService.oil * 1.5 ? 'warning' : 'monitor',
      'Schedule oil + filter change at your nearest service centre.',
      'à¤¨à¤œà¤¦à¥€à¤•à¥€ à¤¸à¤°à¥à¤µà¤¿à¤¸ à¤¸à¥‡à¤‚à¤Ÿà¤° à¤®à¥‡à¤‚ à¤¤à¥‡à¤² + à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¬à¤¦à¤²à¤µà¤¾à¤à¤‚à¥¤',
      200, 800,
      'Dirty oil causes 3x more engine wear.',
      'à¤—à¤‚à¤¦à¤¾ à¤¤à¥‡à¤² à¤‡à¤‚à¤œà¤¨ à¤•à¥‹ 3 à¤—à¥à¤¨à¤¾ à¤œà¥à¤¯à¤¾à¤¦à¤¾ à¤˜à¤¿à¤¸à¤¤à¤¾ à¤¹à¥ˆà¥¤');
  }

  if (inputs.batteryVolt < THRESHOLDS.battery.critical && !hasBattery) {
    addIssue('weakBatterySensor', 'Battery Dead / Dying', 'à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤²à¤—à¤­à¤— à¤–à¤¤à¥à¤®',
      'critical',
      'Replace battery immediately â€” bike may not start tomorrow.',
      'à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤¤à¥à¤°à¤‚à¤¤ à¤¬à¤¦à¤²à¤µà¤¾à¤à¤‚à¥¤',
      800, 2500,
      'A dead battery in summer heat is the #1 reason Indian bikes don\'t start.',
      'à¤—à¤°à¥à¤®à¥€ à¤®à¥‡à¤‚ à¤–à¤°à¤¾à¤¬ à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤¸à¤¬à¤¸à¥‡ à¤¬à¤¡à¤¼à¥€ à¤ªà¤°à¥‡à¤¶à¤¾à¤¨à¥€ à¤¹à¥ˆà¥¤');
  } else if (inputs.batteryVolt < THRESHOLDS.battery.normal && !hasBattery) {
    addIssue('weakBatterySensor', 'Battery Weak', 'à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤•à¤®à¤œà¥‹à¤°',
      'warning',
      'Charge battery and get it load-tested at a battery shop.',
      'à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤šà¤¾à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤²à¥‹à¤¡ à¤Ÿà¥‡à¤¸à¥à¤Ÿ à¤•à¤°à¤µà¤¾à¤à¤‚à¥¤',
      100, 2000,
      'Short rides don\'t charge your battery fully.',
      'à¤›à¥‹à¤Ÿà¥€ à¤¸à¤µà¤¾à¤°à¥€ à¤¸à¥‡ à¤¬à¥ˆà¤Ÿà¤°à¥€ à¤ªà¥‚à¤°à¥€ à¤šà¤¾à¤°à¥à¤œ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹à¤¤à¥€à¥¤');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.airFilter) {
    addIssue('airFilter', 'Air Filter Clogged', 'à¤à¤¯à¤° à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¬à¤‚à¤¦',
      hasSmoke ? 'warning' : 'monitor',
      'Clean or replace air filter to restore fuel efficiency.',
      'à¤à¤¯à¤° à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¸à¤¾à¤« à¤•à¤°à¥‡à¤‚ à¤¯à¤¾ à¤¬à¤¦à¤²à¥‡à¤‚à¥¤',
      100, 400,
      'A clogged air filter reduces mileage by 10-15 kmpl.',
      'à¤¬à¤‚à¤¦ à¤à¤¯à¤° à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¸à¥‡ à¤®à¤¾à¤‡à¤²à¥‡à¤œ 10-15 km/l à¤•à¤® à¤¹à¥‹ à¤¸à¤•à¤¤à¥€ à¤¹à¥ˆà¥¤');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.fuelFilter) {
    addIssue('fuelFilter', 'Fuel Filter Dirty', 'à¤«à¥à¤¯à¥‚à¤² à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤—à¤‚à¤¦à¤¾',
      'monitor',
      'Replace fuel filter to maintain proper fuel flow.',
      'à¤«à¥à¤¯à¥‚à¤² à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤¬à¤¦à¤²à¥‡à¤‚à¥¤',
      150, 500,
      'A dirty fuel filter causes poor pick-up and rough idling.',
      'à¤—à¤‚à¤¦à¤¾ à¤«à¥à¤¯à¥‚à¤² à¤«à¤¿à¤²à¥à¤Ÿà¤° à¤ªà¤¿à¤•à¤…à¤ª à¤•à¤® à¤•à¤°à¤¤à¤¾ à¤¹à¥ˆà¥¤');
  }

  if (isAuto && inputs.cngPressure < THRESHOLDS.cngPressure.critical) {
    addIssue('cngLow', 'CNG Pressure Critically Low', 'CNG à¤ªà¥à¤°à¥‡à¤¶à¤° à¤¬à¤¹à¥à¤¤ à¤•à¤®',
      'warning',
      'Refuel CNG immediately.',
      'à¤¤à¥à¤°à¤‚à¤¤ CNG à¤­à¤°à¤µà¤¾à¤à¤‚à¥¤',
      200, 600,
      'Keep CNG above 140 PSI for optimal fuel consumption.',
      'à¤¬à¥‡à¤¹à¤¤à¤° à¤®à¤¾à¤‡à¤²à¥‡à¤œ à¤•à¥‡ à¤²à¤¿à¤ CNG 140 PSI à¤¸à¥‡ à¤Šà¤ªà¤° à¤°à¤–à¥‡à¤‚à¥¤');
  }

  // â”€â”€ Calculate score â”€â”€
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount  = issues.filter(i => i.severity === 'warning').length;
  const monitorCount  = issues.filter(i => i.severity === 'monitor').length;
  let score = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10) - (monitorCount * 5));

  // â”€â”€ FIX 3: Never show 100/Good if user typed a complaint â”€â”€
  if (complaint.length > 0 && score > 60) {
    score = Math.min(score, 60);
  }

  const nextCheckKm = (vehicle?.odometer || 0) + Math.max(0, THRESHOLDS.kmService.oil - inputs.kmSinceService);

  let summary, summaryHi;
  if (score >= 75) {
    summary = issues.length === 0
      ? 'Your vehicle is in good condition. Keep up with regular maintenance.'
      : `${issues.length} minor item(s) to monitor. Vehicle is generally healthy.`;
    summaryHi = issues.length === 0
      ? 'à¤†à¤ªà¤•à¤¾ à¤µà¤¾à¤¹à¤¨ à¤…à¤šà¥à¤›à¥€ à¤¹à¤¾à¤²à¤¤ à¤®à¥‡à¤‚ à¤¹à¥ˆà¥¤'
      : `${issues.length} à¤›à¥‹à¤Ÿà¥€ à¤¸à¤®à¤¸à¥à¤¯à¤¾ à¤®à¤¿à¤²à¥€à¥¤ à¤µà¤¾à¤¹à¤¨ à¤¸à¤¾à¤®à¤¾à¤¨à¥à¤¯à¤¤à¤ƒ à¤ à¥€à¤• à¤¹à¥ˆà¥¤`;
  } else if (score >= 50) {
    summary = `${issues.length} issue(s) detected. Address warnings to prevent breakdowns.`;
    summaryHi = `${issues.length} à¤¸à¤®à¤¸à¥à¤¯à¤¾ à¤®à¤¿à¤²à¥€à¥¤ à¤–à¤°à¤¾à¤¬à¥€ à¤¸à¥‡ à¤¬à¤šà¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤œà¤²à¥à¤¦à¥€ à¤ à¥€à¤• à¤•à¤°à¥‡à¤‚à¥¤`;
  } else {
    summary = `âš ï¸ Critical issues detected! Do not ride until problems are fixed.`;
    summaryHi = 'âš ï¸ à¤—à¤‚à¤­à¥€à¤° à¤¸à¤®à¤¸à¥à¤¯à¤¾à¤à¤‚! à¤ à¥€à¤• à¤•à¤¿à¤ à¤¬à¤¿à¤¨à¤¾ à¤—à¤¾à¤¡à¤¼à¥€ à¤¨ à¤šà¤²à¤¾à¤à¤‚à¥¤';
  }

  return {
    healthScore: score,
    issues,
    summary: isHindi ? summaryHi : summary,
    nextCheckKm,
    source: 'local',
    userComplaint: complaint,
  };
}

// â”€â”€ Claude API Call â€” fast, compact, 5s timeout â”€â”€
async function callClaudeAPI(inputs, vehicle, lang) {
  if (!State.claudeApiKey) return null; // caller handles fallback

  try {
    const prompt = buildPrompt(inputs, vehicle, lang);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': State.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',   // fastest Claude model
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    clearTimeout(timeoutId);
    if (!response.ok) return null;

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const raw = JSON.parse(jsonMatch[0]);
    const complaint = (inputs.symptoms || '').trim();

    // Map compact response to full result shape
    let score = Number(raw.score) || 75;
    if (complaint.length > 0 && score > 60) score = Math.min(score, 60);

    const severity = (raw.severity || 'monitor').toLowerCase();
    const mappedSeverity = severity === 'critical' ? 'critical' : severity === 'moderate' ? 'warning' : 'monitor';

    return {
      healthScore: score,
      issues: raw.issue ? [{
        id: 'ai_issue',
        name: raw.issue,
        severity: mappedSeverity,
        action: raw.fix || '',
        costMin: 0,
        costMax: 0,
        tip: raw.cause || '',
      }] : [],
      summary: raw.summary || '',
      nextCheckKm: null,
      source: 'claude',
      userComplaint: complaint,
      aiCost: raw.cost_inr || '',
    };
  } catch {
    return null; // timeout or parse error â†’ caller uses local
  }
}

// â”€â”€ Run Diagnosis â€” local first, Claude updates silently â”€â”€
async function runDiagnosis() {
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId)
    || State.vehicles[0]
    || null;

  // STEP 1: Local analysis â€” instant (0ms)
  const localResult = localAnalysis(State.diagnoseInputs, vehicle, State.language);
  localResult.source = 'local';

  // Save to history immediately
  function saveToHistory(result) {
    const entry = {
      id: 'h' + Date.now(),
      vehicleId: vehicle?.id,
      vehicleName: vehicle?.nickname || 'My Vehicle',
      vehicleType: vehicle?.type || null,
      score: result.healthScore,
      color: getHealthColor(result.healthScore),
      date: new Date().toISOString().split('T')[0],
      issues: (result.issues || []).map(i => i.name),
      inputs: { ...State.diagnoseInputs },
      result,
    };
    // Replace existing entry for same session or prepend
    const existingIdx = State.diagnoseHistory.findIndex(h => h.id === entry.id);
    if (existingIdx >= 0) State.diagnoseHistory[existingIdx] = entry;
    else State.diagnoseHistory.unshift(entry);

    if (vehicle) {
      vehicle.lastDiagnosis = { score: result.healthScore, color: getHealthColor(result.healthScore), date: entry.date };
    }
    const today = new Date().toDateString();
    if (State.lastCheckDate !== today) { State.streak = (State.streak || 0) + 1; State.lastCheckDate = today; }
    saveState();
    if (typeof serviceRecsFromDiagnosis === 'function') serviceRecsFromDiagnosis(result);
  }

  saveToHistory(localResult);

  // STEP 2: If no API key, return local result immediately
  if (!State.claudeApiKey) return localResult;

  // STEP 3: Fire Claude in background â€” don't await here
  // Caller (startAiDiagnosis) handles the background update
  callClaudeAPI(State.diagnoseInputs, vehicle, State.language).then(aiResult => {
    if (!aiResult) return; // timeout or error â€” keep local
    saveToHistory(aiResult);
    // Silently update results screen if still showing
    if (State.currentScreen === 'results') {
      State.results = aiResult;
      renderResultsScreen();
      // Flash "AI Enhanced" badge
      const badge = document.querySelector('.ai-source-badge');
      if (badge) { badge.textContent = 'âœ¨ AI Enhanced'; badge.className = 'badge badge-blue ai-source-badge'; }
    }
  });

  return localResult; // return local immediately â€” don't wait for Claude
}

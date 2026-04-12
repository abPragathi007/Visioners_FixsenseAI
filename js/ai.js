/* ═══════════════════════════════════════════════════════════
   AI ENGINE — Bike Health AI
   Claude API integration + local fallback analysis
   ═══════════════════════════════════════════════════════════ */

// ── Fault Thresholds ──
const THRESHOLDS = {
  engineTemp: { normal: 95, warning: 105, critical: 110 },
  oilLevel: { normal: 40, warning: 30, critical: 25 },
  battery: { normal: 12.4, warning: 12.2, critical: 12.0 },
  kmService: { oil: 3000, airFilter: 4000, fuelFilter: 5000 },
  cngPressure: { normal: 150, warning: 140, critical: 120 },
};

// ── Build Analysis Prompt — SHORT for fast API response ──
function buildPrompt(inputs, vehicle, lang) {
  const complaint = (inputs.symptoms || '').trim();
  const veh = vehicle ? `${vehicle.brand} ${vehicle.model} ${vehicle.year}` : 'Unknown vehicle';
  const isHi = lang === 'hi';

  return `Vehicle: ${veh}. Problem: "${complaint || 'none'}". Sensors: temp=${inputs.engineTemp}C, battery=${inputs.batteryVolt}V, oil=${inputs.oilLevel}%, km_since_service=${inputs.kmSinceService}${vehicle?.type === 'auto' ? `, cng=${inputs.cngPressure}PSI` : ''}.

RULES: If complaint mentions brake/brakes → score≤35,severity=critical. If overheat/smoke → score≤45. If oil/leak → score≤40. If battery/start → score≤45. If tyre/puncture → score≤50. If complaint empty and sensors normal → score 80-95. Never score>60 if complaint is non-empty.

Reply ONLY in JSON (no markdown):
{"score":<0-100>,"status":"HEALTHY|WARNING|CRITICAL","issue":"<main problem>","cause":"<why>","fix":"<numbered steps>","severity":"Minor|Moderate|Critical","cost_inr":"<₹range>","summary":"<1 sentence ${isHi ? 'in Hindi' : 'in English'}>"}`;
}

// ── Local Fallback Analysis (no API key needed) ──
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

  // ── FIX 2: Keyword detection from user complaint ──
  const hasBrake    = /brake|brakes|ब्रेक|ಬ್ರೇಕ್/.test(complaint);
  const hasOverheat = /overheat|overheating|ओवरहीट|ಓವರ್‌ಹೀಟ/.test(complaint);
  const hasSmoke    = /smoke|धुआं|ಹೊಗೆ/.test(complaint);
  const hasOilLeak  = /oil leak|oil smoke|तेल रिसाव|ಎಣ್ಣೆ ಸೋರಿಕೆ/.test(complaint);
  const hasBattery  = /battery|not starting|start nahi|बैटरी|ಬ್ಯಾಟರಿ/.test(complaint);
  const hasTyre     = /tyre|tire|puncture|टायर|ಟೈರ್/.test(complaint);
  const hasVibration= /vibrat|shake|कंपन|ಕಂಪನ/.test(complaint);
  const hasNoise    = /noise|sound|आवाज|ಶಬ್ದ/.test(complaint);
  const hasMileage  = /mileage|माइलेज|ಮೈಲೇಜ್/.test(complaint);
  const hasChain    = /chain|चेन|ಚೈನ್/.test(complaint);

  if (hasBrake) {
    addIssue('brake', 'Brake Failure — CRITICAL', 'ब्रेक फेल — गंभीर',
      'critical',
      '1. Stop riding immediately — do NOT ride with faulty brakes.\n2. Inspect brake pads — replace if below 2mm.\n3. Check brake fluid level and top up if low.\n4. Bleed brake lines if lever feels spongy.\n5. Visit mechanic before riding again.',
      '1. तुरंत गाड़ी रोकें — खराब ब्रेक के साथ न चलाएं।\n2. ब्रेक पैड जांचें — 2mm से कम हो तो बदलें।\n3. ब्रेक फ्लूइड लेवल जांचें।\n4. मैकेनिक के पास जाएं।',
      300, 2000,
      'Faulty brakes are the #1 cause of accidents. Never ride until fixed.',
      'खराब ब्रेक दुर्घटना का सबसे बड़ा कारण है। ठीक होने तक न चलाएं।');
  }

  if (hasOverheat || hasSmoke) {
    addIssue('engineOverheating', 'Engine Overheating', 'इंजन ओवरहीटिंग',
      'critical',
      '1. Pull over and switch off engine immediately.\n2. Wait 20-30 minutes for engine to cool.\n3. Check coolant level — top up if low.\n4. Check engine oil level.\n5. Do NOT add cold water to hot engine.',
      '1. तुरंत गाड़ी रोकें और इंजन बंद करें।\n2. 20-30 मिनट ठंडा होने दें।\n3. कूलेंट लेवल जांचें।\n4. ठंडे इंजन में ठंडा पानी न डालें।',
      300, 3000,
      'Overheating can permanently damage your engine. Stop immediately.',
      'ओवरहीटिंग से इंजन स्थायी रूप से खराब हो सकता है।');
  }

  if (hasOilLeak) {
    addIssue('oilLeak', 'Oil Leak Detected', 'तेल रिसाव',
      'critical',
      '1. Stop riding — oil leak can cause engine seizure.\n2. Check oil level immediately.\n3. Identify leak source (gasket, drain plug, seals).\n4. Visit mechanic for repair.',
      '1. गाड़ी रोकें — तेल रिसाव से इंजन जाम हो सकता है।\n2. तेल लेवल तुरंत जांचें।\n3. मैकेनिक से रिसाव ठीक करवाएं।',
      500, 3000,
      'Oil leaks can cause engine seizure within minutes of riding.',
      'तेल रिसाव से इंजन कुछ ही मिनटों में जाम हो सकता है।');
  }

  if (hasBattery) {
    addIssue('weakBattery', 'Battery / Starting Issue', 'बैटरी / स्टार्टिंग समस्या',
      'warning',
      '1. Check battery voltage — should be above 12.4V.\n2. Charge battery with smart charger overnight.\n3. Get load test done at battery shop.\n4. Replace if battery is over 2 years old.',
      '1. बैटरी वोल्टेज जांचें — 12.4V से ऊपर होनी चाहिए।\n2. रात भर चार्ज करें।\n3. बैटरी शॉप पर लोड टेस्ट करवाएं।',
      100, 2500,
      'A weak battery is the #1 reason bikes don\'t start in Indian summers.',
      'कमजोर बैटरी गर्मियों में गाड़ी न स्टार्ट होने का सबसे बड़ा कारण है।');
  }

  if (hasTyre) {
    addIssue('tyre', 'Tyre Issue / Puncture', 'टायर समस्या / पंचर',
      'warning',
      '1. Check tyre pressure — inflate to recommended PSI.\n2. Inspect for puncture or nail.\n3. Check tread depth — replace if below 1.6mm.\n4. Visit tyre shop for repair or replacement.',
      '1. टायर प्रेशर जांचें।\n2. पंचर के लिए जांचें।\n3. टायर शॉप पर जाएं।',
      100, 2000,
      'Riding on a flat or low-pressure tyre damages the rim and is dangerous.',
      'कम प्रेशर वाले टायर पर चलना खतरनाक है और रिम को नुकसान पहुंचाता है।');
  }

  if (hasVibration || hasNoise) {
    addIssue('vibration', 'Vibration / Unusual Noise', 'कंपन / असामान्य आवाज',
      'warning',
      '1. Check wheel balance and alignment.\n2. Inspect chain tension and lubrication.\n3. Check engine mounts for looseness.\n4. Visit mechanic for full inspection.',
      '1. व्हील बैलेंस और अलाइनमेंट जांचें।\n2. चेन टेंशन जांचें।\n3. मैकेनिक से पूरी जांच करवाएं।',
      200, 2000,
      'Vibration often indicates loose parts or wheel imbalance — get it checked soon.',
      'कंपन अक्सर ढीले पुर्जों का संकेत है — जल्दी जांच करवाएं।');
  }

  if (hasMileage) {
    addIssue('poorMileage', 'Poor Fuel Efficiency', 'कम माइलेज',
      'monitor',
      '1. Check tyre pressure — under-inflation reduces mileage by 10%.\n2. Clean or replace air filter.\n3. Check spark plug — replace if worn.\n4. Ensure choke is fully off.',
      '1. टायर प्रेशर जांचें।\n2. एयर फिल्टर साफ करें।\n3. स्पार्क प्लग जांचें।',
      100, 800,
      'Proper tyre pressure alone can improve mileage by 3-5 kmpl.',
      'सही टायर प्रेशर से माइलेज 3-5 किलोमीटर प्रति लीटर बढ़ सकती है।');
  }

  if (hasChain) {
    addIssue('chain', 'Chain Issue', 'चेन समस्या',
      'warning',
      '1. Check chain tension — should have 20-30mm slack.\n2. Lubricate chain with chain lube.\n3. Inspect for worn or broken links.\n4. Replace chain if stretched beyond limit.',
      '1. चेन टेंशन जांचें — 20-30mm ढीली होनी चाहिए।\n2. चेन लुब्रिकेट करें।\n3. घिसी हुई कड़ियां जांचें।',
      200, 1500,
      'A dry or loose chain can snap while riding — lubricate every 500 km.',
      'सूखी या ढीली चेन चलते समय टूट सकती है — हर 500 km पर लुब्रिकेट करें।');
  }

  // ── Sensor-based detection (existing logic) ──
  if (inputs.engineTemp > THRESHOLDS.engineTemp.critical && !hasOverheat) {
    addIssue('coolantDrop', 'Coolant Level Critical', 'कूलेंट बहुत कम',
      'critical',
      'Go to mechanic immediately — coolant is critically low.',
      'तुरंत मैकेनिक के पास जाएं — कूलेंट बहुत कम है।',
      800, 2500,
      'Never add cold water to a hot engine — let it cool first, then top up coolant.',
      'गर्म इंजन में ठंडा पानी न डालें।');
  }

  if (inputs.engineTemp > THRESHOLDS.engineTemp.warning && !hasOverheat) {
    addIssue('engineOverheatSensor', 'Engine Running Hot', 'इंजन गर्म है',
      inputs.engineTemp > THRESHOLDS.engineTemp.critical ? 'critical' : 'warning',
      'Stop riding. Let engine cool 30 mins. Check oil + coolant.',
      'गाड़ी रोकें। 30 मिनट ठंडा होने दें।',
      300, 2000,
      'On hot days, take 5-minute breaks every 30 km.',
      'गर्मी में हर 30 km पर 5 मिनट रुकें।');
  }

  if (inputs.oilLevel <= THRESHOLDS.oilLevel.critical) {
    addIssue('lowOil', 'Engine Oil Critically Low', 'इंजन ऑयल बहुत कम',
      'critical',
      'Do not ride. Add engine oil immediately.',
      'गाड़ी न चलाएं। तुरंत इंजन ऑयल डालें।',
      150, 600,
      'Low oil can seize your engine in minutes.',
      'कम तेल में इंजन जाम हो सकता है।');
  } else if (inputs.oilLevel <= THRESHOLDS.oilLevel.warning) {
    addIssue('lowOil', 'Engine Oil Low', 'इंजन ऑयल कम',
      'warning',
      'Top up engine oil before your next long ride.',
      'अगली लंबी यात्रा से पहले इंजन ऑयल डालें।',
      150, 400,
      'Check oil every 500 km using the dipstick.',
      'हर 500 km पर डिपस्टिक से तेल जांचें।');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.oil) {
    addIssue('dirtyOil', 'Oil Change Overdue', 'तेल बदलना जरूरी है',
      inputs.kmSinceService >= THRESHOLDS.kmService.oil * 1.5 ? 'warning' : 'monitor',
      'Schedule oil + filter change at your nearest service centre.',
      'नजदीकी सर्विस सेंटर में तेल + फिल्टर बदलवाएं।',
      200, 800,
      'Dirty oil causes 3x more engine wear.',
      'गंदा तेल इंजन को 3 गुना ज्यादा घिसता है।');
  }

  if (inputs.batteryVolt < THRESHOLDS.battery.critical && !hasBattery) {
    addIssue('weakBatterySensor', 'Battery Dead / Dying', 'बैटरी लगभग खत्म',
      'critical',
      'Replace battery immediately — bike may not start tomorrow.',
      'बैटरी तुरंत बदलवाएं।',
      800, 2500,
      'A dead battery in summer heat is the #1 reason Indian bikes don\'t start.',
      'गर्मी में खराब बैटरी सबसे बड़ी परेशानी है।');
  } else if (inputs.batteryVolt < THRESHOLDS.battery.normal && !hasBattery) {
    addIssue('weakBatterySensor', 'Battery Weak', 'बैटरी कमजोर',
      'warning',
      'Charge battery and get it load-tested at a battery shop.',
      'बैटरी चार्ज करें और लोड टेस्ट करवाएं।',
      100, 2000,
      'Short rides don\'t charge your battery fully.',
      'छोटी सवारी से बैटरी पूरी चार्ज नहीं होती।');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.airFilter) {
    addIssue('airFilter', 'Air Filter Clogged', 'एयर फिल्टर बंद',
      hasSmoke ? 'warning' : 'monitor',
      'Clean or replace air filter to restore fuel efficiency.',
      'एयर फिल्टर साफ करें या बदलें।',
      100, 400,
      'A clogged air filter reduces mileage by 10-15 kmpl.',
      'बंद एयर फिल्टर से माइलेज 10-15 km/l कम हो सकती है।');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.fuelFilter) {
    addIssue('fuelFilter', 'Fuel Filter Dirty', 'फ्यूल फिल्टर गंदा',
      'monitor',
      'Replace fuel filter to maintain proper fuel flow.',
      'फ्यूल फिल्टर बदलें।',
      150, 500,
      'A dirty fuel filter causes poor pick-up and rough idling.',
      'गंदा फ्यूल फिल्टर पिकअप कम करता है।');
  }

  if (isAuto && inputs.cngPressure < THRESHOLDS.cngPressure.critical) {
    addIssue('cngLow', 'CNG Pressure Critically Low', 'CNG प्रेशर बहुत कम',
      'warning',
      'Refuel CNG immediately.',
      'तुरंत CNG भरवाएं।',
      200, 600,
      'Keep CNG above 140 PSI for optimal fuel consumption.',
      'बेहतर माइलेज के लिए CNG 140 PSI से ऊपर रखें।');
  }

  // ── Calculate score ──
  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount  = issues.filter(i => i.severity === 'warning').length;
  const monitorCount  = issues.filter(i => i.severity === 'monitor').length;
  let score = Math.max(0, 100 - (criticalCount * 20) - (warningCount * 10) - (monitorCount * 5));

  // ── FIX 3: Never show 100/Good if user typed a complaint ──
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
      ? 'आपका वाहन अच्छी हालत में है।'
      : `${issues.length} छोटी समस्या मिली। वाहन सामान्यतः ठीक है।`;
  } else if (score >= 50) {
    summary = `${issues.length} issue(s) detected. Address warnings to prevent breakdowns.`;
    summaryHi = `${issues.length} समस्या मिली। खराबी से बचने के लिए जल्दी ठीक करें।`;
  } else {
    summary = `⚠️ Critical issues detected! Do not ride until problems are fixed.`;
    summaryHi = '⚠️ गंभीर समस्याएं! ठीक किए बिना गाड़ी न चलाएं।';
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

  if (inputs.engineTemp > THRESHOLDS.engineTemp.critical) {
    addIssue('coolantDrop', 'Coolant Level Critical', 'कूलेंट बहुत कम',
      'critical',
      'Go to mechanic immediately — coolant is critically low.',
      'तुरंत मैकेनिक के पास जाएं — कूलेंट बहुत कम है।',
      800, 2500,
      'Never add cold water to a hot engine — let it cool first, then top up coolant.',
      'गर्म इंजन में ठंडा पानी न डालें — पहले ठंडा होने दें, फिर कूलेंट डालें।');
  }

  if (inputs.engineTemp > THRESHOLDS.engineTemp.warning) {
    addIssue('engineOverheating', 'Engine Overheating', 'इंजन ओवरहीटिंग',
      inputs.engineTemp > THRESHOLDS.engineTemp.critical ? 'critical' : 'warning',
      'Stop riding. Let engine cool 30 mins. Check oil + coolant.',
      'गाड़ी रोकें। 30 मिनट ठंडा होने दें। तेल और कूलेंट जांचें।',
      300, 2000,
      'On hot days, take 5-minute breaks every 30 km to prevent overheating.',
      'गर्मी के दिनों में हर 30 किलोमीटर पर 5 मिनट रुकें।');
  }

  if (inputs.oilLevel <= THRESHOLDS.oilLevel.critical) {
    addIssue('lowOil', 'Engine Oil Critically Low', 'इंजन ऑयल बहुत कम',
      'critical',
      'Do not ride. Add engine oil immediately.',
      'गाड़ी न चलाएं। तुरंत इंजन ऑयल डालें।',
      150, 600,
      'Low oil can seize your engine in minutes. Always keep a small bottle in your toolbox.',
      'कम तेल में इंजन जाम हो सकता है। हमेशा एक छोटी बोतल तेल साथ रखें।');
  } else if (inputs.oilLevel <= THRESHOLDS.oilLevel.warning) {
    addIssue('lowOil', 'Engine Oil Low', 'इंजन ऑयल कम',
      'warning',
      'Top up engine oil before your next long ride.',
      'अगली लंबी यात्रा से पहले इंजन ऑयल डालें।',
      150, 400,
      'Check oil every 500 km using the dipstick — it takes only 2 minutes.',
      'हर 500 किलोमीटर पर डिपस्टिक से तेल जांचें — सिर्फ 2 मिनट लगते हैं।');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.oil) {
    addIssue('dirtyOil', 'Oil Change Overdue', 'तेल बदलना जरूरी है',
      inputs.kmSinceService >= THRESHOLDS.kmService.oil * 1.5 ? 'warning' : 'monitor',
      'Schedule oil + filter change at your nearest service centre.',
      'नजदीकी सर्विस सेंटर में तेल + फिल्टर बदलवाएं।',
      200, 800,
      'Dirty oil is like thick syrup for your engine — it causes 3x more wear.',
      'गंदा तेल इंजन को 3 गुना ज्यादा घिसता है — समय पर बदलें।');
  }

  if (inputs.batteryVolt < THRESHOLDS.battery.critical) {
    addIssue('weakBattery', 'Battery Dead / Dying', 'बैटरी लगभग खत्म',
      'critical',
      'Replace battery immediately — bike may not start tomorrow.',
      'बैटरी तुरंत बदलवाएं — कल सुबह गाड़ी स्टार्ट नहीं होगी।',
      800, 2500,
      'A dead battery in summer heat is the #1 reason Indian bikes don\'t start.',
      'गर्मी में खराब बैटरी सबसे बड़ी परेशानी है — आज ही बदलवाएं।');
  } else if (inputs.batteryVolt < THRESHOLDS.battery.normal) {
    addIssue('weakBattery', 'Battery Weak', 'बैटरी कमजोर',
      'warning',
      'Charge battery and get it load-tested at a battery shop.',
      'बैटरी चार्ज करें और बैटरी शॉप पर लोड टेस्ट करवाएं।',
      100, 2000,
      'Short rides don\'t charge your battery fully — take longer rides or use a trickle charger.',
      'छोटी सवारी से बैटरी पूरी चार्ज नहीं होती — लंबी सवारी करें।');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.airFilter) {
    const symptomsLower = (inputs.symptoms || '').toLowerCase();
    const hasSmokeSymptom = symptomsLower.includes('smoke') || symptomsLower.includes('start') || symptomsLower.includes('धुआं');
    addIssue('airFilter', 'Air Filter Clogged', 'एयर फिल्टर बंद',
      hasSmokeSymptom ? 'warning' : 'monitor',
      'Clean or replace air filter to restore fuel efficiency.',
      'एयर फिल्टर साफ करें या बदलें — माइलेज वापस आएगी।',
      100, 400,
      'A clogged air filter can reduce your mileage by 10-15 kmpl.',
      'बंद एयर फिल्टर से माइलेज 10-15 किलोमीटर प्रति लीटर कम हो सकती है।');
  }

  if (inputs.kmSinceService >= THRESHOLDS.kmService.fuelFilter) {
    addIssue('fuelFilter', 'Fuel Filter Dirty', 'फ्यूल फिल्टर गंदा',
      'monitor',
      'Replace fuel filter to maintain proper fuel flow.',
      'ईंधन प्रवाह बनाए रखने के लिए फ्यूल फिल्टर बदलें।',
      150, 500,
      'A dirty fuel filter starves your engine — causes poor pick-up and rough idling.',
      'गंदा फ्यूल फिल्टर इंजन को भूखा रखता है — पिकअप कम और खड़खड़ाहट होती है।');
  }

  // Symptom-based detection
  const symptomsLower = (inputs.symptoms || '').toLowerCase();
  if (symptomsLower.includes('brake') || symptomsLower.includes('ब्रेक')) {
    addIssue('brake', 'Brake System Issue', 'ब्रेक में खराबी',
      'critical',
      'Inspect brake pads and fluid immediately — safety critical.',
      'ब्रेक पैड और फ्लूइड तुरंत जांचें — सुरक्षा खतरे में है।',
      300, 1500,
      'Never ride with faulty brakes — check brake pads every 5,000 km.',
      'खराब ब्रेक के साथ कभी न चलें — हर 5000 किलोमीटर पर ब्रेक जांचें।');
  }

  if (symptomsLower.includes('wiper') || symptomsLower.includes('वाइपर')) {
    addIssue('wiper', 'Wiper / Accessory Issue', 'वाइपर में खराबी',
      'monitor',
      'Check wiper blade and washer pump.',
      'वाइपर ब्लेड और वॉशर पंप जांचें।',
      100, 400,
      'Replace wiper blades before monsoon — clean windshield is crucial for visibility.',
      'मानसून से पहले वाइपर बदलें — साफ शीशा दृश्यता के लिए जरूरी है।');
  }

  if (isAuto && inputs.cngPressure < THRESHOLDS.cngPressure.critical) {
    addIssue('cngLow', 'CNG Pressure Critically Low', 'CNG प्रेशर बहुत कम',
      'warning',
      'Refuel CNG immediately — engine may switch to petrol soon.',
      'तुरंत CNG भरवाएं — इंजन पेट्रोल पर चला जाएगा।',
      200, 600,
      'Keep CNG above 140 PSI for optimal fuel consumption.',
      'बेहतर माइलेज के लिए CNG 140 PSI से ऊपर रखें।');
  }

  // Engine wear composite
  if (inputs.kmSinceService >= THRESHOLDS.kmService.airFilter && inputs.engineTemp > 95) {
    addIssue('engineWear', 'Engine Wear Risk', 'इंजन घिसाव का खतरा',
      'monitor',
      'Get a full engine check at service centre — high usage detected.',
      'सर्विस सेंटर में पूरी जांच करवाएं — ज्यादा उपयोग का संकेत है।',
      500, 3000,
      'High mileage with elevated temperature is a sign your engine needs TLC.',
      'ज्यादा किलोमीटर के साथ गर्म इंजन यानी सर्विस का समय आ गया है।');
  }

  // Calculate score
  const critical = issues.filter(i => i.severity === 'critical').length;
  const warning = issues.filter(i => i.severity === 'warning').length;
  const monitor = issues.filter(i => i.severity === 'monitor').length;
  const score = Math.max(0, 100 - (critical * 20) - (warning * 10) - (monitor * 5));

  const nextCheckKm = (vehicle?.odometer || 0) + (THRESHOLDS.kmService.oil - inputs.kmSinceService);

  let summary, summaryHi;
  if (score >= 80) {
    summary = 'Your vehicle is in good condition. Keep up with regular maintenance.';
    summaryHi = 'आपका वाहन अच्छी हालत में है। नियमित सर्विस जारी रखें।';
  } else if (score >= 50) {
    summary = `${issues.length} issue(s) detected. Address warnings to prevent breakdowns.`;
    summaryHi = `${issues.length} समस्या मिली। खराबी से बचने के लिए जल्दी ठीक करें।`;
  } else {
    summary = `Multiple critical issues! Do not ride until problems are fixed.`;
    summaryHi = 'कई गंभीर समस्याएं! ठीक किए बिना गाड़ी न चलाएं।';
  }

  return {
    healthScore: score,
    issues,
    summary: isHindi ? summaryHi : summary,
    nextCheckKm,
    source: 'local',
  };
}

// ── Claude API Call — fast, compact, 5s timeout ──
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
    return null; // timeout or parse error → caller uses local
  }
}

// ── Run Diagnosis — local first, Claude updates silently ──
async function runDiagnosis() {
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId)
    || State.vehicles[0]
    || null;

  // STEP 1: Local analysis — instant (0ms)
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

  // STEP 3: Fire Claude in background — don't await here
  // Caller (startAiDiagnosis) handles the background update
  callClaudeAPI(State.diagnoseInputs, vehicle, State.language).then(aiResult => {
    if (!aiResult) return; // timeout or error — keep local
    saveToHistory(aiResult);
    // Silently update results screen if still showing
    if (State.currentScreen === 'results') {
      State.results = aiResult;
      renderResultsScreen();
      // Flash "AI Enhanced" badge
      const badge = document.querySelector('.ai-source-badge');
      if (badge) { badge.textContent = '✨ AI Enhanced'; badge.className = 'badge badge-blue ai-source-badge'; }
    }
  });

  return localResult; // return local immediately — don't wait for Claude
}

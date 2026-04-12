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

// ── Build Analysis Prompt ──
function buildPrompt(inputs, vehicle, lang) {
  const vehicleDesc = vehicle
    ? `${vehicle.year} ${vehicle.brand} ${vehicle.model} (${vehicle.type}, ${vehicle.cc}cc)`
    : 'Unknown Indian two-wheeler';

  const isHindi = lang === 'hi';

  const prompt = `You are an expert Indian two-wheeler and three-wheeler mechanic AI assistant. Analyze this vehicle's health data and return a structured JSON diagnosis.

Vehicle: ${vehicleDesc}
Vehicle Type: ${vehicle?.type || 'bike'}

Sensor Readings:
- Engine Temperature: ${inputs.engineTemp}°C (Normal: <95°C, Warning: 95-105°C, Critical: >105°C)
- Engine Oil Level: ${inputs.oilLevel}% (Normal: >40%, Warning: 30-40%, Critical: <25%)
- Battery Voltage: ${inputs.batteryVolt}V (Normal: >12.4V, Warning: 12.0-12.4V, Critical: <12.0V)
- Km Since Last Service: ${inputs.kmSinceService} km (Oil change due: >3000km, Air filter: >4000km, Fuel filter: >5000km)
${vehicle?.type === 'auto' ? `- CNG Pressure: ${inputs.cngPressure} PSI (Normal: >150 PSI, Warning: 130-150 PSI, Critical: <130 PSI)` : ''}

User Reported Symptoms: "${inputs.symptoms || 'None reported'}"

${vehicle?.type === 'auto' ? 'Note: This is an auto rickshaw. Apply higher wear thresholds (more idle time, heavier load). Use higher cost estimates. CNG dual-fuel vehicle.' : ''}

The 11 possible issues to detect:
1. Engine overheating (temp > 105°C)
2. Low engine oil (oil < 25%)
3. Dirty engine oil (km > 3000)
4. Weak battery (voltage < 12.4V)
5. Air filter clogged (km > 4000 OR symptoms mention smoke/hard start)
6. Fuel filter dirty (km > 5000)
7. Engine wear (km > 4000 AND high temp)
8. Coolant drop (temp > 110°C)
9. Brake fluid issue (symptoms mention brake)
10. AC/condenser blocked (temp > 105 AND km > 3000)
11. Wiper/other (symptoms mention wiper)

Health Score Formula: Start at 100. Subtract 20 for each critical issue, 10 for each soon/warning issue, 5 for each monitor issue. Minimum 0.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "healthScore": <number 0-100>,
  "issues": [
    {
      "id": "<issue_id>",
      "name": "${isHindi ? '<issue name in Hindi>' : '<issue name in English>'}",
      "severity": "critical|warning|monitor",
      "action": "${isHindi ? '<action in Hindi, 1 sentence>' : '<action in English, 1 sentence>'}",
      "costMin": <number in INR>,
      "costMax": <number in INR>,
      "tip": "${isHindi ? '<plain language tip in Hindi for an Indian rider>' : '<plain language tip in English for an Indian rider>'}"
    }
  ],
  "summary": "${isHindi ? '<overall summary in Hindi, 1-2 sentences>' : '<overall summary in English, 1-2 sentences>'}",
  "nextCheckKm": <km reading for next service>
}

If no issues are detected, return an empty "issues" array and healthScore of 95+.
Keep tips short, friendly, and practical — written for a non-technical Indian rider.
${vehicle?.type === 'auto' ? 'Use ₹ cost estimates appropriate for auto rickshaw (typically 1.5-2x bike costs).' : 'Use ₹ cost estimates appropriate for Indian two-wheelers (₹200 to ₹5000 range).'}`;

  return prompt;
}

// ── Local Fallback Analysis (no API key needed) ──
function localAnalysis(inputs, vehicle, lang) {
  const isHindi = lang === 'hi';
  const isAuto = vehicle?.type === 'auto';
  const issues = [];

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

// ── Claude API Call ──
async function callClaudeAPI(inputs, vehicle, lang) {
  if (!State.claudeApiKey) {
    return localAnalysis(inputs, vehicle, lang);
  }

  try {
    const prompt = buildPrompt(inputs, vehicle, lang);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': State.claudeApiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.warn('Claude API error:', response.status);
      return localAnalysis(inputs, vehicle, lang);
    }

    const data = await response.json();
    const text = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in response');

    const result = JSON.parse(jsonMatch[0]);
    result.source = 'claude';
    return result;

  } catch (err) {
    console.warn('Claude API failed, using local analysis:', err);
    return localAnalysis(inputs, vehicle, lang);
  }
}

// ── Run Diagnosis ──
async function runDiagnosis() {
  const vehicle = State.vehicles.find(v => v.id === State.diagnoseInputs.vehicleId)
    || State.vehicles[0]
    || null;

  const result = await callClaudeAPI(State.diagnoseInputs, vehicle, State.language);

  State.results = result;

  // Save to history
  const historyEntry = {
    id: 'h' + Date.now(),
    vehicleId: vehicle?.id,
    vehicleName: vehicle?.nickname || 'My Vehicle',
    vehicleType: vehicle?.type || null,
    score: result.healthScore,
    color: getHealthColor(result.healthScore),
    date: new Date().toISOString().split('T')[0],
    issues: result.issues.map(i => i.name),
    inputs: { ...State.diagnoseInputs },
    result: result,
  };

  State.diagnoseHistory.unshift(historyEntry);

  // Update vehicle last diagnosis
  if (vehicle) {
    vehicle.lastDiagnosis = {
      score: result.healthScore,
      color: getHealthColor(result.healthScore),
      date: historyEntry.date,
    };
  }

  // Update streak
  const today = new Date().toDateString();
  if (State.lastCheckDate !== today) {
    State.streak = (State.streak || 0) + 1;
    State.lastCheckDate = today;
  }

  saveState();
  return result;
}

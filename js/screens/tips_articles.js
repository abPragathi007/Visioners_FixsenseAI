/* ═══════════════════════════════════════════════════════════
   TIPS ARTICLE CONTENT + READER MODAL
   Full article text + voice read-aloud
   ═══════════════════════════════════════════════════════════ */

const ARTICLE_CONTENT = {
  1: {
    emoji: '🌧️',
    sections: [
      { h: 'Brakes', b: 'Wet roads reduce braking distance by up to 40%. Check brake pad thickness — replace if below 2mm. Bleed brake lines if the lever feels spongy. For drum brakes, check cable tension and shoe wear.' },
      { h: 'Tyres', b: 'Bald tyres are deadly in rain. Check tread depth — minimum 1.6mm. Look for cracks on sidewalls. Inflate to recommended PSI (28–32 front, 32–36 rear). Wet roads need proper grip.' },
      { h: 'Wipers & Visibility', b: 'Replace wiper blades if they streak or skip. Clean the windshield. Check headlights and tail lights — visibility drops to 50m in heavy rain. Replace any blown bulbs.' },
      { h: 'Chain & Sprocket', b: 'Rain washes away chain lubricant fast. Clean the chain with kerosene, dry it, then apply waterproof chain lube. Check chain slack — should be 20–30mm. Tight or loose chains snap in wet conditions.' },
      { h: 'Battery', b: 'Monsoon humidity corrodes battery terminals. Clean terminals with baking soda and water. Apply petroleum jelly to prevent corrosion. Check voltage — should be 12.4V or more when engine is off.' },
      { h: 'Air Filter', b: 'Riding through puddles can suck water into the air filter. Check and clean the air filter before monsoon. A wet air filter causes hard starting and poor mileage. Replace if torn or oil-soaked.' },
      { h: 'Electrical Connections', b: 'Water causes short circuits. Check all exposed wiring for cracks. Apply dielectric grease to connectors. Ensure the battery box cover is intact. Tape any exposed wire joints.' },
      { h: 'Engine Oil', b: 'Water contamination turns engine oil milky white. Check oil colour on the dipstick — should be amber or brown, not white or grey. Change oil if contaminated. Use SAE 10W-30 for monsoon riding.' },
      { h: 'Rust Prevention', b: 'Apply WD-40 or chain lube to exposed metal parts — footpegs, handlebar ends, exhaust headers. Wipe down the bike after every wet ride. Park under cover whenever possible.' },
      { h: 'Lights & Horn', b: 'In heavy rain, other drivers cannot see you. Ensure all lights work — headlight, tail light, indicators. Test the horn. Consider adding reflective tape to the bike for extra visibility.' },
    ],
    tip: 'Pro tip: Carry a small bottle of chain lube and a microfibre cloth in your toolbox during monsoon season.',
  },
  2: {
    emoji: '🔧',
    sections: [
      { h: 'Why Indian Summers Are Brutal for Engines', b: 'Ambient temperatures of 40 to 45 degrees Celsius mean your engine has to work much harder to stay cool. Air-cooled engines rely entirely on airflow — slow traffic kills this cooling.' },
      { h: 'Top 5 Causes of Overheating', b: 'First, low coolant or engine oil level. Second, clogged air filter restricting airflow. Third, stuck in traffic for 30 or more minutes. Fourth, riding at high RPM in peak heat. Fifth, old or dirty engine oil that has lost viscosity.' },
      { h: 'Warning Signs to Watch For', b: 'Engine temperature gauge in red zone. Unusual ticking or knocking sounds. Loss of power or rough idling. Burning smell from the engine bay. Steam or smoke from the engine.' },
      { h: 'What to Do When Overheating', b: 'Pull over immediately and switch off the engine. Do NOT add cold water to a hot engine — thermal shock can crack the cylinder head. Wait 20 to 30 minutes. Check oil level. Check coolant if liquid-cooled. Start engine and monitor temperature.' },
      { h: 'Prevention Tips', b: 'Change engine oil every 3000 km — fresh oil cools better. Clean air filter every 4000 km. Take 5-minute breaks every 30 km on hot days. Avoid peak traffic hours from 12 to 3 PM in summer. Park in shade whenever possible.' },
    ],
    tip: 'Normal engine temperature is 80 to 95 degrees. Warning at 95 to 105 degrees. Critical above 105 degrees — stop immediately.',
  },
  3: {
    emoji: '❄️',
    sections: [
      { h: 'Why Cold Starts Are Hard', b: 'Cold temperatures thicken engine oil, making it harder to circulate. Battery capacity drops by 20 to 30 percent in cold weather. Fuel vaporisation is reduced, making the air-fuel mixture lean.' },
      { h: 'Step-by-Step Cold Start Procedure', b: 'Step 1: Turn on the ignition and check fuel level. Step 2: Pull the choke lever on carburettor bikes. Step 3: Do NOT twist the throttle before starting. Step 4: Press the starter and hold for maximum 5 seconds. Step 5: If it starts, let it idle for 2 to 3 minutes. Step 6: Push choke back in after engine warms up. Step 7: Ride gently for the first 5 km.' },
      { h: 'Battery Care in Winter', b: 'Cold kills weak batteries. If your bike struggles to start, charge the battery overnight. Keep the battery terminals clean and tight. Consider a battery tender if the bike sits unused for days.' },
      { h: 'Engine Oil for Winter', b: 'Use 10W-30 or 5W-30 oil in winter — the lower first number means better cold-flow. Thick oil like 20W-50 is too viscous in cold and starves the engine on startup.' },
      { h: 'Fuel Injection vs Carburettor', b: 'Fuel injection bikes handle cold starts automatically — just press the starter. Carburettor bikes need the choke. Never rev a cold engine hard — let it warm up naturally.' },
    ],
    tip: 'If your bike does not start after 3 attempts, wait 30 seconds before trying again to avoid flooding the engine.',
  },
  4: {
    emoji: '⛽',
    sections: [
      { h: 'Tyre Pressure is Number One', b: 'Under-inflated tyres increase rolling resistance and kill mileage. Check pressure every week. Splendor: 30 PSI front, 35 PSI rear. Activa: 28 PSI front, 33 PSI rear. Use a digital gauge for accuracy.' },
      { h: 'Riding Style Matters Most', b: 'Smooth acceleration and braking saves 15 to 20 percent fuel. Avoid sudden throttle bursts. Maintain steady speed between 40 and 60 kmph — this is the sweet spot for Indian bikes. Anticipate traffic and coast to stops.' },
      { h: 'Engine Maintenance', b: 'Fresh spark plug improves combustion efficiency. Replace every 8000 to 10000 km. Clean air filter every 4000 km — a clogged filter richens the mixture and wastes fuel. Fresh engine oil reduces friction.' },
      { h: 'Avoid These Mileage Killers', b: 'Riding with choke on for carb bikes. Carrying excess weight. Idling for more than 2 minutes. Riding in wrong gear at too low RPM. Worn brake pads dragging on the disc.' },
      { h: 'Fuel Quality', b: 'Use the fuel grade recommended in your owner manual. Premium fuel does NOT improve mileage on low-compression Indian bikes. Fill up in the morning when fuel is denser.' },
    ],
    tip: 'Real-world test: fill full tank, ride 100 km normally, fill again. Divide km by litres used. Do this 3 times for accurate mileage.',
  },
  5: {
    emoji: '🛺',
    sections: [
      { h: 'Weekly Checks — Free', b: 'Check engine oil level — autos need oil checks twice as often as bikes due to stop-and-go traffic. Check CNG pressure gauge — refuel when below 130 PSI. Check tyre pressure — 35 PSI all round. Clean air filter with compressed air.' },
      { h: 'Monthly Maintenance — 200 to 300 Rupees', b: 'Engine oil change costs 150 to 200 rupees every 2500 km for autos. Air filter cleaning or replacement costs 50 to 100 rupees. Spark plug check costs 30 to 50 rupees. Chain lubrication costs 20 rupees.' },
      { h: 'CNG System Care', b: 'CNG autos need special attention. Check CNG kit connections for leaks every month — use soapy water and look for bubbles. Replace CNG filter every 10000 km. Keep the CNG cylinder valve clean and free of rust.' },
      { h: 'Brake Maintenance', b: 'Autos carry heavy loads and brake frequently. Check brake shoe thickness every 5000 km. Adjust brake cable tension monthly. Replace brake shoes when thickness is below 3mm. Budget 300 to 500 rupees for brake shoes.' },
      { h: 'Earning More by Spending Less', b: 'A well-maintained auto earns 800 to 1200 rupees per day. A breakdown costs 500 to 2000 rupees in repairs plus lost earnings. Spending 500 rupees per month on maintenance prevents 5000 to 10000 rupees in repair bills.' },
    ],
    tip: 'Keep a maintenance logbook in your auto. Record every oil change, tyre rotation, and repair. This increases resale value by 5000 to 10000 rupees.',
  },
  6: {
    emoji: '🔋',
    sections: [
      { h: 'Sign 1: Slow or Weak Cranking', b: 'If the starter motor sounds sluggish or slow when you press the button, the battery cannot deliver enough current. This is the earliest and most common sign of a dying battery.' },
      { h: 'Sign 2: Voltage Below 12.4 Volts', b: 'A healthy battery reads 12.6 to 12.8 volts when fully charged and engine is off. Below 12.4 volts means the battery is weak. Below 12.0 volts means it is nearly dead. Check with a multimeter or use the RideRaksha diagnosis.' },
      { h: 'Sign 3: Battery More Than 2 Years Old', b: 'Indian bike batteries last 2 to 3 years on average. After 2 years, get a load test done at a battery shop — it is free at most shops. Even if it starts fine, an old battery can fail suddenly in summer heat.' },
      { h: 'Sign 4: Lights Dim When Idling', b: 'If headlights or indicators dim when the engine is at idle but brighten when you rev, the battery is not holding charge. The alternator is compensating — but it cannot do this forever.' },
      { h: 'Sign 5: Swollen or Leaking Battery', b: 'A swollen battery case means internal damage from overcharging or heat. A leaking battery has acid damage. Both are dangerous — replace immediately. Never touch battery acid without gloves.' },
      { h: 'Choosing a Replacement', b: 'Match the CCA and Ah rating to your original battery. Exide, Amaron, and Luminous are reliable Indian brands. Budget 800 to 2500 rupees depending on bike. Always buy from authorised dealers with warranty.' },
    ],
    tip: 'When replacing, also clean the battery terminals with baking soda and water, and apply petroleum jelly to prevent future corrosion.',
  },
};

let _articleSpeaking = false;
let _articleUtterance = null;
let _currentArticleId = null;  // store for language switch

function _openArticleModal(id, article) {
  document.getElementById('rr-article-modal')?.remove();
  articleStopVoice();
  _currentArticleId = id;

  const content = ARTICLE_CONTENT[id];
  const curLang = State.language;

  // Build voice text globally
  window._articleFullText = content
    ? content.sections.map(s => (s.h || '') + '. ' + (s.b || '')).join('. ') + '. ' + (content.tip || '')
    : (article.title || '') + '. No detailed content available yet.';

  // Build sections HTML safely
  let sectionsHtml = '';
  if (content && content.sections) {
    content.sections.forEach(s => {
      sectionsHtml += '<div style="margin-bottom:16px;">'
        + '<div style="font-size:0.88rem;font-weight:800;color:var(--brand-orange);margin-bottom:6px;">' + (s.h || '') + '</div>'
        + '<div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.65;">' + (s.b || '').replace(/\n/g, '<br>') + '</div>'
        + '</div>';
    });
  } else {
    sectionsHtml = '<div style="font-size:0.85rem;color:var(--text-secondary);">Full article coming soon.</div>';
  }

  const tipHtml = (content && content.tip)
    ? '<div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:10px;padding:12px 14px;margin-top:8px;font-size:0.82rem;color:var(--brand-orange);">&#128161; ' + content.tip + '</div>'
    : '';

  // Language button styles
  function langBtnStyle(code) {
    const active = curLang === code;
    return 'padding:5px 11px;border-radius:999px;border:1.5px solid ' + (active ? 'var(--brand-orange)' : 'var(--border-card)') + ';background:' + (active ? 'rgba(255,107,53,0.12)' : 'var(--bg-input)') + ';color:' + (active ? 'var(--brand-orange)' : 'var(--text-secondary)') + ';font-size:0.72rem;font-weight:700;cursor:pointer;';
  }

  const modal = document.createElement('div');
  modal.id = 'rr-article-modal';
  modal.className = 'modal-overlay';
  modal.style.cssText = 'align-items:flex-start;padding-top:20px;';

  const box = document.createElement('div');
  box.className = 'modal-box';
  box.style.cssText = 'max-width:520px;max-height:88vh;overflow-y:auto;padding:0;';

  // Header
  const header = document.createElement('div');
  header.style.cssText = 'position:sticky;top:0;background:var(--bg-card);border-bottom:1px solid var(--border-subtle);padding:16px 20px;display:flex;align-items:center;gap:12px;z-index:1;';
  header.innerHTML = '<span style="font-size:1.8rem;">' + (content && content.emoji ? content.emoji : (article.emoji || '📖')) + '</span>'
    + '<div style="flex:1;min-width:0;">'
    + '<div style="font-size:0.65rem;font-weight:700;color:var(--brand-orange);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:2px;">' + (article.cat || '') + ' &middot; ' + (article.read || '') + '</div>'
    + '<div style="font-size:0.92rem;font-weight:800;color:var(--text-primary);line-height:1.3;">' + (article.title || '') + '</div>'
    + '</div>'
    + '<button onclick="articleStopVoice();document.getElementById(\'rr-article-modal\').remove()" style="width:32px;height:32px;border-radius:50%;background:var(--bg-input);border:1px solid var(--border-card);color:var(--text-muted);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;">&#10005;</button>';

  // Controls bar
  const controls = document.createElement('div');
  controls.style.cssText = 'padding:12px 20px;background:var(--bg-secondary);border-bottom:1px solid var(--border-subtle);display:flex;align-items:center;gap:8px;flex-wrap:wrap;';
  controls.innerHTML = '<button id="rr-art-speak-btn" onclick="articleToggleVoice(window._articleFullText)" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:var(--grad-brand);border:none;border-radius:999px;color:#fff;font-size:0.8rem;font-weight:700;cursor:pointer;">&#128266; Read Aloud</button>'
    + '<button onclick="articleStopVoice()" style="display:inline-flex;align-items:center;gap:6px;padding:8px 12px;background:var(--bg-card);border:1px solid var(--border-card);border-radius:999px;color:var(--text-secondary);font-size:0.78rem;font-weight:600;cursor:pointer;">&#9209; Stop</button>'
    + '<div style="display:flex;gap:5px;margin-left:auto;">'
    + '<button onclick="articleSwitchLang(\'en\')" style="' + langBtnStyle('en') + '">EN</button>'
    + '<button onclick="articleSwitchLang(\'hi\')" style="' + langBtnStyle('hi') + '">HI</button>'
    + '<button onclick="articleSwitchLang(\'kn\')" style="' + langBtnStyle('kn') + '">KN</button>'
    + '</div>'
    + '<span id="rr-art-voice-status" style="font-size:0.7rem;color:var(--text-muted);width:100%;">Tap to hear this article</span>';

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'padding:20px;';
  body.innerHTML = sectionsHtml + tipHtml + '<div style="height:8px;"></div>';

  box.appendChild(header);
  box.appendChild(controls);
  box.appendChild(body);
  modal.appendChild(box);

  modal.addEventListener('click', e => {
    if (e.target === modal) { articleStopVoice(); modal.remove(); }
  });
  document.body.appendChild(modal);
}

/* Switch language and reopen same article */
function articleSwitchLang(code) {
  State.language = code;
  if (typeof saveState === 'function') saveState();
  if (typeof applyDocumentLocale === 'function') applyDocumentLocale();
  if (typeof syncBottomNav === 'function') syncBottomNav();
  articleStopVoice();
  const id = _currentArticleId;
  if (id == null) return;
  const article = (typeof TIPS_ARTICLES !== 'undefined') ? TIPS_ARTICLES.find(a => a.id === id) : null;
  if (article) {
    document.getElementById('rr-article-modal')?.remove();
    _openArticleModal(id, article);
  }
}

function articleToggleVoice(text) {
  const synth = window.speechSynthesis;
  if (!synth) { showToast('Voice not supported in this browser'); return; }

  if (_articleSpeaking) { articleStopVoice(); return; }

  synth.cancel();
  const lang = State.language === 'hi' ? 'hi-IN' : State.language === 'kn' ? 'kn-IN' : 'en-IN';
  _articleUtterance = new SpeechSynthesisUtterance(text);
  _articleUtterance.lang = lang;
  _articleUtterance.rate = 0.88;
  _articleUtterance.pitch = 1;
  _articleUtterance.volume = 1;

  const btn = document.getElementById('rr-art-speak-btn');
  const status = document.getElementById('rr-art-voice-status');

  _articleUtterance.onstart = () => {
    _articleSpeaking = true;
    if (btn) btn.innerHTML = '⏹ Stop';
    if (status) status.textContent = '🔊 Reading aloud…';
  };
  _articleUtterance.onend = () => {
    _articleSpeaking = false;
    if (btn) btn.innerHTML = '🔊 Read Aloud';
    if (status) status.textContent = 'Tap to hear this article';
  };
  _articleUtterance.onerror = () => {
    _articleSpeaking = false;
    if (btn) btn.innerHTML = '🔊 Read Aloud';
    if (status) status.textContent = 'Error — try again';
  };

  function pickVoiceAndSpeak() {
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang === lang)
      || voices.find(v => v.lang.startsWith(lang.split('-')[0]))
      || voices.find(v => v.lang.startsWith('en'))
      || null;
    if (voice) _articleUtterance.voice = voice;
    synth.speak(_articleUtterance);
    setTimeout(() => { if (synth.paused) synth.resume(); }, 150);
  }

  if (synth.getVoices().length > 0) {
    pickVoiceAndSpeak();
  } else {
    synth.addEventListener('voiceschanged', pickVoiceAndSpeak, { once: true });
    setTimeout(pickVoiceAndSpeak, 600); // fallback if event never fires
  }
}

function articleStopVoice() {
  window.speechSynthesis?.cancel();
  _articleSpeaking = false;
  const btn = document.getElementById('rr-art-speak-btn');
  const status = document.getElementById('rr-art-voice-status');
  if (btn) btn.innerHTML = '🔊 Read Aloud';
  if (status) status.textContent = 'Tap to hear this article';
}

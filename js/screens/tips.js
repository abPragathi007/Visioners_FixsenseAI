/* ═══════════════════════════════════════════════════════════
   SCREEN 8 · TIPS & LEARN
   ═══════════════════════════════════════════════════════════ */
let activeCategory = 'All';

function renderTipsScreen() {
  const el = document.getElementById('screen-tips');
  const isHi = State.language === 'hi';

  const filtered = activeCategory === 'All'
    ? TIPS_ARTICLES
    : TIPS_ARTICLES.filter(a => a.cat === activeCategory);

  el.innerHTML = `
    <div class="page-header">
      <div class="back-btn" onclick="goBack(); refreshCurrentScreen();">${Icons.back}</div>
      <h2 class="page-title">${isHi ? 'सुझाव और जानें' : 'Tips & Learn'}</h2>
    </div>

    <div class="tips-content screen-scroll">
      <!-- Hero -->
      <div class="tips-hero">
        <span class="tips-hero-icon">🌧️</span>
        <div>
          <div class="tips-hero-title">${isHi ? 'मानसून चेकलिस्ट' : 'Monsoon Checklist 2025'}</div>
          <div class="tips-hero-sub">${isHi ? 'बारिश से पहले 10 जरूरी जांचें' : '10 essential checks before the rains hit'}</div>
        </div>
      </div>

      <!-- Category Pills -->
      <div class="category-pills">
        ${TIPS_CATEGORIES.map(cat => `
          <div class="chip ${activeCategory === cat ? 'active' : ''}" onclick="filterTips(${JSON.stringify(cat)})">
            ${cat}
          </div>
        `).join('')}
      </div>

      <!-- Articles -->
      <div class="section-title">${isHi ? 'लेख और वीडियो' : 'Articles & Videos'}</div>

      ${filtered.map(article => article.type === 'video' ? renderYTCard(article, isHi) : renderArticleCard(article, isHi)).join('')}

      <!-- Seasonal Tips inline -->
      <div class="section-title" style="margin-top: 8px;">${isHi ? 'मौसमी सुझाव' : 'Seasonal Tips'}</div>
      ${renderSeasonalTips(isHi)}

      <div style="height: 40px;"></div>
    </div>

  `;

  if (typeof window.syncBottomNav === 'function') window.syncBottomNav();
}

function renderArticleCard(article, isHi) {
  return `
    <div class="article-card" onclick="openArticle(${article.id})">
      <div class="article-thumb">${article.emoji}</div>
      <div class="article-info">
        <div class="article-cat">${article.cat}</div>
        <div class="article-title">${article.title}</div>
        <div class="article-meta">
          <span>📖 ${article.read}</span>
          <span>·</span>
          <span style="color: var(--brand-orange);">Read →</span>
        </div>
      </div>
    </div>
  `;
}

function renderYTCard(article, isHi) {
  return `
    <div class="yt-card" onclick="openYouTube()">
      <div class="yt-thumb">▶️</div>
      <div style="flex: 1;">
        <div class="article-cat" style="color: #FF4444;">YouTube</div>
        <div class="article-title">${article.title}</div>
        <div class="text-xs text-muted">Watch on YouTube →</div>
      </div>
    </div>
  `;
}

function renderSeasonalTips(isHi) {
  const tips = [
    {
      emoji: '🌡️',
      id: 'summer',
      title: isHi ? 'गर्मी की देखभाल' : 'Summer Care',
      desc: isHi ? 'इंजन कूलेंट, टायर प्रेशर और बैटरी पर ध्यान दें।' : 'Monitor engine coolant, tyre pressure, and battery in extreme heat.',
    },
    {
      emoji: '🌧️',
      id: 'monsoon',
      title: isHi ? 'मानसून तैयारी' : 'Monsoon Prep',
      desc: isHi ? 'ब्रेक, वाइपर और हेडलाइट की जांच करें।' : 'Check brakes, wipers, and headlights before rainy season.',
    },
    {
      emoji: '❄️',
      id: 'winter',
      title: isHi ? 'सर्दी की स्टार्टिंग' : 'Winter Cold Start',
      desc: isHi ? 'थोड़ा वार्म-अप दें। बैटरी कमजोर पड़ सकती है।' : 'Allow warm-up time. Battery is more prone to failure in cold.',
    },
  ];

  return tips.map(tip => `
    <div class="card" onclick="openSeasonalTip('${tip.id}')" style="display:flex;gap:12px;align-items:center;margin-bottom:8px;cursor:pointer;">
      <span style="font-size:1.8rem;">${tip.emoji}</span>
      <div style="flex:1;">
        <div class="text-sm font-semibold">${tip.title}</div>
        <div class="text-xs text-secondary" style="margin-top:3px;">${tip.desc}</div>
      </div>
      <span style="color:var(--brand-orange);font-size:0.8rem;">Read →</span>
    </div>
  `).join('');
}

/* ── Seasonal tip content ── */
const SEASONAL_TIP_CONTENT = {
  summer: {
    emoji: '🌡️',
    title: 'Summer Care Guide',
    sections: [
      { h: 'Engine Coolant', b: 'Check coolant level every week in summer. Top up with the correct coolant mix (50% water, 50% coolant). Never open the radiator cap when the engine is hot — wait 30 minutes after switching off.' },
      { h: 'Tyre Pressure', b: 'Heat expands air in tyres. Check pressure in the morning before riding. Reduce by 2 PSI from normal in peak summer. Under-inflated tyres in heat cause blowouts.' },
      { h: 'Battery Care', b: 'Heat is the #1 killer of batteries. Check terminals for corrosion (white powder). Clean with baking soda + water. Keep battery water level topped up (for non-sealed batteries).' },
      { h: 'Engine Oil', b: 'Use SAE 20W-50 oil in summer — it handles high temperatures better. Change oil every 2,500 km in summer (more frequent than normal). Check oil level every 500 km.' },
      { h: 'Riding Tips', b: 'Take 5-minute breaks every 30 km. Avoid riding between 12 PM and 3 PM when temperatures peak. Park in shade. Carry a water bottle for yourself and a small coolant bottle for emergencies.' },
    ],
    tip: 'If your temperature gauge enters the red zone, pull over immediately, switch off the engine, and wait 20 minutes before checking coolant.',
  },
  monsoon: {
    emoji: '🌧️',
    title: 'Monsoon Prep Checklist',
    sections: [
      { h: 'Brakes', b: 'Wet roads increase stopping distance by 40%. Check brake pad thickness — replace if below 2mm. Test brakes at low speed before every ride in rain. Drum brakes need more frequent adjustment in monsoon.' },
      { h: 'Tyres', b: 'Check tread depth — minimum 1.6mm for safe wet grip. Look for cracks on sidewalls. Inflate to correct PSI. Bald tyres on wet roads are extremely dangerous.' },
      { h: 'Lights & Wipers', b: 'Visibility drops to 50m in heavy rain. Ensure all lights work — headlight, tail light, indicators. Replace wiper blades if they streak. Clean windshield with glass cleaner.' },
      { h: 'Chain Lubrication', b: 'Rain washes away chain lube every 100-200 km. Use waterproof chain lube. Clean chain with kerosene, dry completely, then apply lube. Check chain slack — 20-30mm.' },
      { h: 'Electrical Protection', b: 'Apply dielectric grease to all electrical connectors. Check for exposed wiring. Ensure battery box cover is intact. Avoid riding through deep water — it can damage the engine.' },
    ],
    tip: 'After every wet ride, wipe down the bike with a dry cloth and apply WD-40 to exposed metal parts to prevent rust.',
  },
  winter: {
    emoji: '❄️',
    title: 'Winter Cold Start Guide',
    sections: [
      { h: 'Why Cold Starts Are Hard', b: 'Cold thickens engine oil, reducing its flow. Battery capacity drops 20-30% in cold. Fuel vaporisation is reduced. All these make starting harder in winter mornings.' },
      { h: 'Cold Start Procedure', b: 'Step 1: Turn on ignition, check fuel. Step 2: Pull choke lever (carburettor bikes). Step 3: Do NOT twist throttle before starting. Step 4: Press starter for max 5 seconds. Step 5: Let idle for 2-3 minutes. Step 6: Push choke back after warming up.' },
      { h: 'Engine Oil for Winter', b: 'Use 10W-30 or 5W-30 oil — the lower first number means better cold flow. Avoid 20W-50 in winter — it is too thick when cold and starves the engine on startup.' },
      { h: 'Battery in Winter', b: 'Cold kills weak batteries. If bike struggles to start, charge battery overnight. Keep terminals clean and tight. Consider a battery tender if bike sits unused for days.' },
      { h: 'Tyre Pressure', b: 'Cold air contracts — tyre pressure drops 1-2 PSI in winter. Check and inflate to correct pressure every morning. Under-inflated tyres reduce grip on cold roads.' },
    ],
    tip: 'If your bike does not start after 3 attempts, wait 30 seconds before trying again to avoid flooding the engine.',
  },
};

function openSeasonalTip(id) {
  const data = SEASONAL_TIP_CONTENT[id];
  if (!data) return;

  document.getElementById('rr-article-modal')?.remove();
  window._articleFullText = data.sections.map(s => s.h + '. ' + s.b).join('. ') + '. ' + (data.tip || '');

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
  header.innerHTML = '<span style="font-size:2rem;">' + data.emoji + '</span>'
    + '<div style="flex:1;"><div style="font-size:1rem;font-weight:800;color:var(--text-primary);">' + data.title + '</div></div>'
    + '<button onclick="document.getElementById(\'rr-article-modal\').remove()" style="width:32px;height:32px;border-radius:50%;background:var(--bg-input);border:1px solid var(--border-card);color:var(--text-muted);font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;">&#10005;</button>';

  // Voice bar
  const controls = document.createElement('div');
  controls.style.cssText = 'padding:10px 20px;background:var(--bg-secondary);border-bottom:1px solid var(--border-subtle);display:flex;gap:8px;align-items:center;';
  controls.innerHTML = '<button onclick="articleToggleVoice(window._articleFullText)" id="rr-art-speak-btn" style="padding:7px 14px;background:var(--grad-brand);border:none;border-radius:999px;color:#fff;font-size:0.78rem;font-weight:700;cursor:pointer;">&#128266; Read Aloud</button>'
    + '<button onclick="articleStopVoice()" style="padding:7px 12px;background:var(--bg-card);border:1px solid var(--border-card);border-radius:999px;color:var(--text-secondary);font-size:0.78rem;cursor:pointer;">&#9209; Stop</button>'
    + '<span id="rr-art-voice-status" style="font-size:0.7rem;color:var(--text-muted);margin-left:4px;">Tap to hear</span>';

  // Body
  const body = document.createElement('div');
  body.style.cssText = 'padding:20px;';
  let bodyHtml = '';
  data.sections.forEach(s => {
    bodyHtml += '<div style="margin-bottom:16px;">'
      + '<div style="font-size:0.88rem;font-weight:800;color:var(--brand-orange);margin-bottom:6px;">' + s.h + '</div>'
      + '<div style="font-size:0.85rem;color:var(--text-secondary);line-height:1.65;">' + s.b + '</div>'
      + '</div>';
  });
  if (data.tip) {
    bodyHtml += '<div style="background:rgba(255,107,53,0.08);border:1px solid rgba(255,107,53,0.2);border-radius:10px;padding:12px 14px;margin-top:8px;font-size:0.82rem;color:var(--brand-orange);">&#128161; ' + data.tip + '</div>';
  }
  body.innerHTML = bodyHtml;

  box.appendChild(header);
  box.appendChild(controls);
  box.appendChild(body);
  modal.appendChild(box);
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

function filterTips(cat) {
  activeCategory = cat;
  renderTipsScreen();
}

function openArticle(id) {
  const article = TIPS_ARTICLES.find(a => a.id === id);
  if (!article) { showToast('Article not found'); return; }
  _openArticleModal(id, article);
}

function openYouTube() {
  window.open('https://www.youtube.com/results?search_query=bike+maintenance+india', '_blank');
}

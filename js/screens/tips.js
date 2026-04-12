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
      <div class="back-btn" onclick="goBack(); renderHomeScreen();">${Icons.back}</div>
      <h2 class="page-title">${isHi ? 'सुझाव और जानें' : 'Tips & Learn'}</h2>
    </div>

    <div class="tips-content">
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
          <div class="chip ${activeCategory === cat ? 'active' : ''}" onclick="filterTips('${cat}')">
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

    ${renderBottomNav('tips')}
  `;
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
  const tips = isHi ? [
    { emoji: '🌡️', title: 'गर्मी की देखभाल', desc: 'इंजन कूलेंट, टायर प्रेशर और बैटरी पर ध्यान दें।' },
    { emoji: '🌧️', title: 'मानसून तैयारी', desc: 'ब्रेक, वाइपर और हेडलाइट की जांच करें।' },
    { emoji: '❄️', title: 'सर्दी की स्टार्टिंग', desc: 'थोड़ा वार्म-अप दें। बैटरी कमजोर पड़ सकती है।' },
  ] : [
    { emoji: '🌡️', title: 'Summer Care', desc: 'Monitor engine coolant, tyre pressure, and battery in extreme heat.' },
    { emoji: '🌧️', title: 'Monsoon Prep', desc: 'Check brakes, wipers, and headlights before rainy season.' },
    { emoji: '❄️', title: 'Winter Cold Start', desc: 'Allow warm-up time. Battery is more prone to failure in cold.' },
  ];

  return tips.map(tip => `
    <div class="card" style="display: flex; gap: 12px; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 1.8rem;">${tip.emoji}</span>
      <div>
        <div class="text-sm font-semibold">${tip.title}</div>
        <div class="text-xs text-secondary" style="margin-top: 3px;">${tip.desc}</div>
      </div>
    </div>
  `).join('');
}

function filterTips(cat) {
  activeCategory = cat;
  renderTipsScreen();
}

function openArticle(id) {
  const article = TIPS_ARTICLES.find(a => a.id === id);
  if (!article) return;
  showToast(`Opening: ${article.title}`);
}

function openYouTube() {
  window.open('https://www.youtube.com/results?search_query=bike+maintenance+india', '_blank');
}

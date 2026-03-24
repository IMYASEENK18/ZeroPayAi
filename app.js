// ─── Utility: get badge class ───


// ─── THEME TOGGLE ───
function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('theme-toggle').textContent = isLight ? '☀️' : '🌙';
}

// Apply saved theme on page load
(function() {
  const saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.body.classList.add('light');
    document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.textContent = '☀️';
    });
  }
})();
function badgeClass(badge) {
  if (!badge) return 'badge-free';
  const b = badge.toLowerCase();
  if (b.includes('popular')) return 'badge-popular';
  if (b.includes('trending')) return 'badge-trending';
  if (b.includes("editor")) return 'badge-editor';
  return 'badge-free';
}

// ─── Utility: tool icon emoji by category ───
function categoryEmoji(cat) {
  const map = {
    'Chatbot': '🤖', 'Design': '🎨', 'Image Generation': '🖼️',
    'Video': '🎬', 'Audio': '🎵', 'Writing': '✍️',
    'Research': '🔍', 'Coding': '💻', 'Productivity': '⚡'
  };
  return map[cat] || '🛠️';
}

// ─── Render a single tool card ───
function renderCard(tool) {
  return `
    <div class="tool-card fade-up" onclick="window.location='tool-detail.html?id=${tool.id}'">
      <div class="card-top">
        <div class="tool-icon">${categoryEmoji(tool.category)}</div>
        ${tool.badge ? `<span class="tool-badge ${badgeClass(tool.badge)}">${tool.badge}</span>` : ''}
      </div>
      <div>
        <div class="tool-name">${tool.name}</div>
        <div class="tool-tagline">${tool.tagline}</div>
        <div class="free-tag">✓ ${tool.free_tier}</div>
      </div>
      <div class="card-bottom">
        <span class="tool-category">${tool.category}</span>
        <span class="tool-rating"><span class="star">★</span> ${tool.rating}</span>
      </div>
    </div>
  `;
}

// ─── HOME PAGE ───
function initHome() {
  if (!document.getElementById('featured-grid')) return;

  const featured = [...TOOLS].sort((a, b) => b.rating - a.rating).slice(0, 8);
  document.getElementById('featured-grid').innerHTML = featured.map(renderCard).join('');

  document.getElementById('hero-search-btn').addEventListener('click', () => {
    const q = document.getElementById('hero-search-input').value.trim();
    if (q) window.location = `tools.html?q=${encodeURIComponent(q)}`;
  });
  document.getElementById('hero-search-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('hero-search-btn').click();
  });
}

// ─── TOOLS PAGE ───
function initTools() {
  if (!document.getElementById('tools-grid')) return;

  const params = new URLSearchParams(window.location.search);
  let currentQuery = params.get('q') || '';
  let currentCat = params.get('cat') || 'All';

  const searchInput = document.getElementById('search-input');
  const categorySelect = document.getElementById('cat-select');
  const grid = document.getElementById('tools-grid');
  const countEl = document.getElementById('results-count');

  // Populate category select
  CATEGORIES.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    if (cat === currentCat) opt.selected = true;
    categorySelect.appendChild(opt);
  });

  // Category pills
  const pillsContainer = document.getElementById('cat-pills');
  CATEGORIES.forEach(cat => {
    const pill = document.createElement('button');
    pill.className = 'cat-pill' + (cat === currentCat ? ' active' : '');
    pill.textContent = cat;
    pill.addEventListener('click', () => {
      currentCat = cat;
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      categorySelect.value = cat;
      renderTools();
    });
    pillsContainer.appendChild(pill);
  });

  if (currentQuery) searchInput.value = currentQuery;

  function renderTools() {
    const q = searchInput.value.toLowerCase().trim();
    const cat = currentCat;

    let filtered = TOOLS.filter(t => {
      const matchCat = cat === 'All' || t.category === cat;
      const matchQ = !q || t.name.toLowerCase().includes(q)
        || t.tagline.toLowerCase().includes(q)
        || t.tags.some(tag => tag.includes(q))
        || t.category.toLowerCase().includes(q);
      return matchCat && matchQ;
    });

    countEl.textContent = `${filtered.length} tool${filtered.length !== 1 ? 's' : ''} found`;

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="emoji">🔍</div>
          <h3>No tools found</h3>
          <p>Try a different search or category</p>
        </div>`;
    } else {
      grid.innerHTML = filtered.map(renderCard).join('');
    }
  }

  searchInput.addEventListener('input', renderTools);
  categorySelect.addEventListener('change', e => {
    currentCat = e.target.value;
    document.querySelectorAll('.cat-pill').forEach(p => {
      p.classList.toggle('active', p.textContent === currentCat);
    });
    renderTools();
  });

  renderTools();
}

// ─── TOOL DETAIL PAGE ───
function initDetail() {
  if (!document.getElementById('detail-root')) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const tool = TOOLS.find(t => t.id === id);

  if (!tool) {
    document.getElementById('detail-root').innerHTML = `
      <div class="empty-state">
        <div class="emoji">😕</div>
        <h3>Tool not found</h3>
        <p><a href="tools.html" style="color:var(--accent)">Browse all tools →</a></p>
      </div>`;
    return;
  }

  // Update page title + meta dynamically
  document.title = `${tool.name} — Free AI Tool Review | ZeroPayAI`;
  document.querySelector('meta[name="description"]').setAttribute('content',
    `${tool.name}: ${tool.tagline}. Free tier: ${tool.free_tier}. Full review on ZeroPayAI.`
  );
  document.getElementById('og-title').setAttribute('content', `${tool.name} — ZeroPayAI`);
  document.getElementById('og-desc').setAttribute('content', tool.tagline);
  document.getElementById('og-url').setAttribute('content',
    `https://www.zeropayai.com/tool-detail.html?id=${tool.id}`
  );

  // Breadcrumb
  const bc = document.getElementById('breadcrumb-name');
  if (bc) bc.textContent = tool.name;

  // Schema: SoftwareApplication
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name,
    "description": tool.description,
    "applicationCategory": tool.category,
    "url": tool.url,
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": tool.free_tier
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": tool.rating,
      "reviewCount": tool.reviews
    }
  };
  document.getElementById('tool-schema').textContent = JSON.stringify(schema);

  // Main detail HTML
  document.getElementById('detail-root').innerHTML = `
    <a href="javascript:history.back()" class="back-btn">← Back</a>
    <div class="detail-header">
      <div class="detail-icon">${categoryEmoji(tool.category)}</div>
      <div class="detail-meta">
        <h1>${tool.name}</h1>
        <p class="detail-tagline">${tool.tagline}</p>
        <div class="detail-tags">
          ${tool.tags.map(t => `<span class="tag-chip">${t}</span>`).join('')}
          <span class="tag-chip" style="color:var(--accent);border-color:rgba(0,255,136,0.25)">${tool.category}</span>
        </div>
      </div>
    </div>
    <div class="detail-info-grid">
      <div class="info-card">
        <div class="label">Free Tier</div>
        <div class="value green">${tool.free_tier}</div>
      </div>
      <div class="info-card">
        <div class="label">Rating</div>
        <div class="value">★ ${tool.rating}
          <span style="font-size:0.75rem;color:var(--muted);font-family:var(--font-body);font-weight:400">
            (${tool.reviews.toLocaleString()} reviews)
          </span>
        </div>
      </div>
      <div class="info-card">
        <div class="label">Category</div>
        <div class="value">${tool.category}</div>
      </div>
      <div class="info-card">
        <div class="label">Badge</div>
        <div class="value">
          <span class="tool-badge ${badgeClass(tool.badge)}">${tool.badge}</span>
        </div>
      </div>
    </div>
    <div class="detail-body">
      <h2>About ${tool.name}</h2>
      <p>${tool.description}</p>
    </div>
    <a href="${tool.url}" target="_blank" rel="noopener noreferrer" class="visit-btn">
      Visit ${tool.name} — It's Free →
    </a>
  `;

  // Related tools (same category, exclude current)
  const related = TOOLS
    .filter(t => t.category === tool.category && t.id !== tool.id)
    .slice(0, 3);
  const relatedGrid = document.getElementById('related-grid');
  if (relatedGrid) {
    relatedGrid.innerHTML = related.length
      ? related.map(renderCard).join('')
      : `<p style="color:var(--muted);font-size:0.88rem;">No other tools in this category yet.</p>`;
  }
}

// ─── SUBMIT PAGE ───
function initSubmit() {
  if (!document.getElementById('submit-form')) return;

  // Populate category select
  const catSelect = document.getElementById('tool-category');
  CATEGORIES.filter(c => c !== 'All').forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    catSelect.appendChild(opt);
  });

  document.getElementById('submit-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('.submit-btn');
    btn.textContent = 'Submitting...';
    btn.disabled = true;

    const data = new FormData(this);
    try {
      const res = await fetch('https://formspree.io/f/https://formspree.io/f/mgonjrqp', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        this.reset();
        document.getElementById('success-msg').style.display = 'block';
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Network error. Please try again.');
    }

    btn.textContent = 'Submit Tool →';
    btn.disabled = false;
  });
}

// ─── NEWSLETTER ───
function initNewsletter() {
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button');
      btn.textContent = '✓ Subscribed!';
      btn.style.background = '#00c8ff';
      form.querySelector('input').value = '';
      setTimeout(() => {
        btn.textContent = 'Subscribe →';
        btn.style.background = '';
      }, 3000);
    });
  });
}

// ─── INIT ALL ───
document.addEventListener('DOMContentLoaded', () => {
  initHome();
  initTools();
  initDetail();
  initSubmit();
  initNewsletter();
});
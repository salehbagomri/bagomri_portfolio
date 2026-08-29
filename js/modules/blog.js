// ============================================
// BLOG MODULE - js/modules/blog.js
// Full SEO-ready blog engine with:
// - Dynamic SEO meta, canonical, hreflang
// - JSON-LD Article structured data
// - Breadcrumb structured data
// - Table of Contents auto-generation
// - Related Articles
// - Prev/Next navigation
// - Code block copy buttons
// - HTML sanitization
// - Author box
// ============================================

const SITE_URL = 'https://bagomri.com';
const AUTHOR = {
  name: 'Saleh Bagomri',
  url: 'https://bagomri.com/#about',
  sameAs: ['https://github.com/salehbagomri', 'https://linkedin.com/in/salehbagomri'],
};

// ── HTML Sanitizer ─────────────────────────────────────────
// Only allows safe elements for article content
const ALLOWED_TAGS = new Set([
  'H2','H3','H4','P','UL','OL','LI',
  'PRE','CODE','BLOCKQUOTE','TABLE',
  'THEAD','TBODY','TR','TH','TD',
  'A','STRONG','EM','B','I','U','S',
  'BR','HR','SPAN','DIV','IMG',
  'FIGURE','FIGCAPTION',
]);
const ALLOWED_ATTRS = new Set([
  'href','src','alt','title','class','id','width','height',
  'loading','target','rel','lang','dir','data-lang',
]);
const FORBIDDEN_PATTERNS = [
  /javascript:/i,
  /data:text\/html/i,
  /vbscript:/i,
];

function sanitizeHTML(dirty) {
  if (!dirty) return '';
  const parser = new DOMParser();
  const doc = parser.parseFromString(dirty, 'text/html');

  function clean(node) {
    if (node.nodeType === 3) return; // text node - safe
    if (node.nodeType !== 1) {
      node.parentNode?.removeChild(node);
      return;
    }

    const tag = node.tagName;
    if (!ALLOWED_TAGS.has(tag)) {
      // Replace with text content or remove
      const replacement = doc.createTextNode(node.textContent || '');
      node.parentNode?.replaceChild(replacement, node);
      return;
    }

    // Clean attributes
    const attrsToRemove = [];
    for (const attr of node.attributes) {
      const name = attr.name.toLowerCase();
      const value = attr.value;

      if (!ALLOWED_ATTRS.has(name)) {
        attrsToRemove.push(name);
        continue;
      }

      // Block dangerous URLs
      if ((name === 'href' || name === 'src') &&
          FORBIDDEN_PATTERNS.some(p => p.test(value))) {
        attrsToRemove.push(name);
      }
    }
    attrsToRemove.forEach(a => node.removeAttribute(a));

    // Add rel="noopener noreferrer" to external links
    if (tag === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }

    // Enforce loading="lazy" on images inside content
    if (tag === 'IMG') {
      node.setAttribute('loading', 'lazy');
      if (!node.getAttribute('alt')) {
        node.setAttribute('alt', '');
      }
    }

    Array.from(node.childNodes).forEach(child => clean(child));
  }

  Array.from(doc.body.childNodes).forEach(child => clean(child));
  return doc.body.innerHTML;
}

// ── Table of Contents builder ──────────────────────────────
function buildTOC(contentEl, lang = 'ar') {
  const headings = contentEl.querySelectorAll('h2, h3');
  if (headings.length < 2) return null;

  // Generate unique IDs for headings
  const slugify = text => text.toLowerCase()
    .replace(/[\u0600-\u06FF]/g, m => m) // keep Arabic
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0600-\u06FF-]/g, '')
    .slice(0, 60);

  const usedIds = {};
  const items = [];

  headings.forEach(h => {
    const text = h.textContent.trim();
    let id = slugify(text) || `section-${items.length + 1}`;
    if (usedIds[id]) { usedIds[id]++; id = `${id}-${usedIds[id]}`; }
    else usedIds[id] = 1;
    h.id = id;

    items.push({ id, text, level: parseInt(h.tagName[1]) });
  });

  const title = lang === 'ar' ? 'محتويات المقال' : 'Table of Contents';
  let html = `<details class="toc-details" open>
  <summary class="toc-toggle">
    <i data-lucide="list"></i>
    <span>${title}</span>
  </summary>
  <nav class="toc-nav" aria-label="${title}">
    <ol class="toc-list">`;

  items.forEach(item => {
    const indent = item.level === 3 ? ' toc-item-h3' : '';
    html += `<li class="toc-item${indent}">
      <a href="#${item.id}" class="toc-link">${item.text}</a>
    </li>`;
  });

  html += `</ol></nav></details>`;
  return html;
}

// ── Code block enhancer ────────────────────────────────────
function enhanceCodeBlocks(contentEl, lang = 'ar') {
  contentEl.querySelectorAll('pre').forEach((pre, idx) => {
    if (pre.querySelector('.code-copy-btn')) return; // already enhanced

    const code = pre.querySelector('code');
    const copyLabel = lang === 'ar' ? 'نسخ' : 'Copy';
    const copiedLabel = lang === 'ar' ? 'تم!' : 'Copied!';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block-wrapper';

    const btn = document.createElement('button');
    btn.className = 'code-copy-btn';
    btn.setAttribute('aria-label', copyLabel);
    btn.innerHTML = `<i data-lucide="copy"></i><span>${copyLabel}</span>`;
    btn.addEventListener('click', () => {
      const text = code ? code.textContent : pre.textContent;
      navigator.clipboard?.writeText(text).then(() => {
        btn.innerHTML = `<i data-lucide="check"></i><span>${copiedLabel}</span>`;
        lucide.createIcons({ nodes: [btn] });
        setTimeout(() => {
          btn.innerHTML = `<i data-lucide="copy"></i><span>${copyLabel}</span>`;
          lucide.createIcons({ nodes: [btn] });
        }, 2000);
      });
    });

    pre.parentNode.insertBefore(wrapper, pre);
    wrapper.appendChild(btn);
    wrapper.appendChild(pre);
    lucide.createIcons({ nodes: [btn] });
  });
}

// ── Word count ─────────────────────────────────────────────
function wordCount(html) {
  if (!html) return 0;
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || '').trim().split(/\s+/).filter(Boolean).length;
}

class BlogManager {
  constructor() {
    this.articles       = [];
    this.currentArticle = null;
    this.currentFilter  = 'all';
    this.currentLang    = 'ar';
  }

  // ── Fetch articles from Firestore (REST + SDK fallback) ─
  async fetchArticles({ category = null, limit = 50, published = true } = {}) {
    // 1. Try ultra-fast direct REST runQuery (100ms, immune to WebSocket blocks)
    try {
      const body = {
        structuredQuery: {
          from: [{ collectionId: 'articles' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'published' },
              op: 'EQUAL',
              value: { booleanValue: published }
            }
          },
          orderBy: [{ field: { fieldPath: 'publishedAt' }, direction: 'DESCENDING' }]
        }
      };

      if (category && category !== 'all') {
        body.structuredQuery.where = {
          compositeFilter: {
            op: 'AND',
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: 'published' },
                  op: 'EQUAL',
                  value: { booleanValue: published }
                }
              },
              {
                fieldFilter: {
                  field: { fieldPath: 'category' },
                  op: 'EQUAL',
                  value: { stringValue: category }
                }
              }
            ]
          }
        };
      }

      if (limit) {
        body.structuredQuery.limit = limit;
      }

      const res = await fetch('https://firestore.googleapis.com/v1/projects/bagomri-portfolio/databases/(default)/documents:runQuery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const results = await res.json();
        const docs = [];
        for (const item of results) {
          if (item.document && typeof firebaseService !== 'undefined') {
            docs.push(firebaseService._parseFirestoreDoc(item.document));
          }
        }
        if (docs.length > 0) {
          this.articles = docs;
          try {
            if (!category || category === 'all') {
              localStorage.setItem('bagomri_cached_articles', JSON.stringify(this.articles));
            }
          } catch (e) {}
          return this.articles;
        }
      }
    } catch (restErr) {
      console.warn('⚠️ REST articles query failed, falling back to cache/SDK:', restErr.message);
    }

    // 2. Fallback to SDK if available
    try {
      if (typeof firebaseService !== 'undefined' && firebaseService.db) {
        let query = firebaseService.db
          .collection(firebaseService.collections.articles)
          .where('published', '==', published)
          .orderBy('publishedAt', 'desc');

        if (category && category !== 'all') {
          query = query.where('category', '==', category);
        }
        if (limit) query = query.limit(limit);

        const snapshot = await query.get();
        this.articles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return this.articles;
      }
    } catch (sdkErr) {
      console.warn('⚠️ SDK articles query fallback:', sdkErr.message);
    }

    // 3. Fallback to localStorage cache
    if (!this.articles || this.articles.length === 0) {
      try {
        const cached = localStorage.getItem('bagomri_cached_articles');
        if (cached) this.articles = JSON.parse(cached);
      } catch (e) {}
    }
    return this.articles || [];
  }

  // ── Fetch single article by slug ──────────────────────
  async fetchBySlug(slug) {
    if (!slug) return null;
    if (this.articles && this.articles.length > 0) {
      const cached = this.articles.find(a => a.slug === slug);
      if (cached) return cached;
    }

    const all = await this.fetchArticles({ limit: 100 });
    return all.find(a => a.slug === slug) || null;
  }

  // ── Fetch latest N articles ────────────────────────────
  async fetchLatest(n = 3) {
    return this.fetchArticles({ limit: n });
  }

  // ── Date parsing & formatting ─────────────────────────
  _parseDate(timestamp) {
    if (!timestamp) return null;
    if (typeof timestamp.toDate === 'function') {
      try { return timestamp.toDate(); } catch (e) {}
    }
    if (typeof timestamp.seconds === 'number') {
      return new Date(timestamp.seconds * 1000);
    }
    if (typeof timestamp._seconds === 'number') {
      return new Date(timestamp._seconds * 1000);
    }
    const d = new Date(timestamp);
    return isNaN(d.getTime()) ? null : d;
  }

  formatDate(timestamp, lang = 'ar') {
    const date = this._parseDate(timestamp);
    if (!date) return '';
    const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
    try {
      return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  }

  formatDateISO(timestamp) {
    const date = this._parseDate(timestamp);
    if (!date) return new Date().toISOString();
    try {
      return date.toISOString();
    } catch (e) {
      return new Date().toISOString();
    }
  }

  // ── Category helpers ───────────────────────────────────
  getCategoryIcon(category) {
    const icons = {
      kotlin:   '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 3 9 9-9 9h18L12 12 21 3Z"/></svg>',
      android:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 16a7 7 0 0 1 14 0"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><line x1="8" y1="7" x2="6" y2="4"/><line x1="16" y1="7" x2="18" y2="4"/></svg>',
      compose:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><path d="M17 13v8M13 17h8"/></svg>',
      tips:     '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
      personal: '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m13 2-3 14-3-5H2l5-3-1-6Z"/></svg>',
      default:  '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    };
    return icons[category] || icons.default;
  }

  getCategoryColor(category) {
    const colors = {
      kotlin:   { bg: '#EEF0FF', text: '#221461' },
      android:  { bg: '#E8F5E9', text: '#1B5E20' },
      compose:  { bg: '#FFF3E0', text: '#E65100' },
      tips:     { bg: '#F3E8FF', text: '#4A148C' },
      personal: { bg: '#E8F5FF', text: '#0D47A1' },
      default:  { bg: '#F3F4F6', text: '#374151' },
    };
    return colors[category] || colors.default;
  }

  // ── Render article card HTML ───────────────────────────
  renderCard(article, lang = 'ar') {
    const isAr    = lang === 'ar';
    const title   = isAr ? (article.titleAr || article.titleEn || '') : (article.titleEn || article.titleAr || '');
    const excerpt = isAr ? (article.excerptAr || article.excerptEn || '') : (article.excerptEn || article.excerptAr || '');
    const label   = isAr
      ? (article.categoryLabelAr || article.category)
      : (article.categoryLabelEn || article.category);
    const date      = this.formatDate(article.publishedAt, lang);
    const color     = this.getCategoryColor(article.category);
    const icon      = this.getCategoryIcon(article.category);
    const readMore  = isAr ? 'اقرأ المزيد' : 'Read More';
    const readTimeLabel = isAr
      ? `${article.readTime || 3} دقائق قراءة`
      : `${article.readTime || 3} min read`;

    const articleUrl = `/blog/${article.slug}`;
    const imageAlt   = isAr
      ? `صورة مقال: ${title}`
      : `Cover image for: ${title}`;

    const imageHtml = article.coverImage
      ? `<div class="blog-card-img">
           <img src="${article.coverImage}" class="blog-cover-img" alt="${imageAlt}" loading="lazy" width="400" height="225">
         </div>`
      : `<div class="blog-card-img" style="background:${color.bg};">
           <div class="blog-fallback-banner">
             <div class="blog-fallback-icon-wrap" style="color:${color.text};">${icon}</div>
             <span class="blog-fallback-badge" style="color:${color.text};">${label || article.category}</span>
           </div>
         </div>`;

    return `
    <article class="blog-card" data-category="${article.category || 'default'}" data-id="${article.id}">
      <a href="${articleUrl}" class="blog-card-link-wrap" aria-label="${title}" tabindex="-1" aria-hidden="true">
        ${imageHtml}
      </a>
      <div class="blog-card-body">
        <div class="blog-card-meta">
          <span class="blog-tag" style="color:${color.text};background:${color.bg}">${label || article.category}</span>
          <span class="blog-date">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <time datetime="${this.formatDateISO(article.publishedAt)}">${date}</time>
          </span>
        </div>
        <h3 class="blog-card-title">
          <a href="${articleUrl}" class="blog-card-title-link">${title}</a>
        </h3>
        <p class="blog-card-excerpt">${excerpt}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
          <a href="${articleUrl}" class="blog-read-more">
            ${readMore}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
          <span style="font-size:0.75rem;color:var(--text-light)" aria-label="${readTimeLabel}">${readTimeLabel}</span>
        </div>
      </div>
    </article>`;
  }

  // ── Render full blog grid ──────────────────────────────
  renderGrid(articles, containerId, lang = 'ar') {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!articles || articles.length === 0) {
      const msg = lang === 'ar'
        ? '<div class="blog-empty"><p>لا توجد مقالات حتى الآن. تابعنا قريباً!</p></div>'
        : '<div class="blog-empty"><p>No articles yet. Stay tuned!</p></div>';
      container.innerHTML = msg;
      return;
    }

    container.innerHTML = articles.map(a => this.renderCard(a, lang)).join('');
  }

  // ── Filter articles client-side ────────────────────────
  filterArticles(category) {
    this.currentFilter = category;
    const filtered = category === 'all'
      ? this.articles
      : this.articles.filter(a => a.category === category);
    return filtered;
  }

  // ── Init blog listing page ─────────────────────────────
  async initBlogPage() {
    const lang = document.documentElement.lang || 'ar';
    this.currentLang = lang;

    const gridEl = document.getElementById('blogGrid');
    if (!gridEl) return;

    this._setupFilters();

    // 1. If cached articles exist, render instantly (0ms)
    try {
      const cached = localStorage.getItem('bagomri_cached_articles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.articles = parsed;
          this.renderGrid(this.articles, 'blogGrid', lang);
        }
      }
    } catch (e) {}

    if (!this.articles || this.articles.length === 0) {
      gridEl.innerHTML = this._skeleton(6);
    }

    if (!firebaseService.db) firebaseService.init();

    // 2. Fetch fresh articles from network & re-render
    const articles = await this.fetchArticles();
    if (articles && articles.length > 0) {
      this.renderGrid(articles, 'blogGrid', lang);
    }

    // Update blog listing meta
    this._updateBlogListingMeta(lang);

    window.addEventListener('languageChanged', (e) => {
      this.currentLang = e.detail.lang;
      const filtered = this.filterArticles(this.currentFilter);
      this.renderGrid(filtered, 'blogGrid', e.detail.lang);
      this._updateBlogListingMeta(e.detail.lang);
    });
  }

  // ── Update blog listing page meta ─────────────────────
  _updateBlogListingMeta(lang) {
    const isAr = lang === 'ar';
    const title    = isAr ? 'المقالات - صالح باقمري | مطور Kotlin & Android' : 'Articles - Saleh Bagomri | Kotlin & Android Developer';
    const desc     = isAr
      ? 'مقالات ونصائح تقنية في Kotlin وAndroid وJetpack Compose من صالح باقمري.'
      : 'Technical articles and tips on Kotlin, Android, and Jetpack Compose by Saleh Bagomri.';
    document.title = title;
    this._setMeta('name', 'description', desc);
    this._setMeta('property', 'og:title', title);
    this._setMeta('property', 'og:description', desc);
  }

  // ── Init homepage preview blog ─────────────────────────
  async initHomepageBlog() {
    const gridEl = document.getElementById('homepageBlogGrid');
    if (!gridEl) return;

    const lang = document.documentElement.lang || 'ar';

    // 1. If we have cached articles, render instantly (0ms)
    try {
      const cached = localStorage.getItem('bagomri_cached_articles');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.articles = parsed;
          this.renderGrid(this.articles.slice(0, 3), 'homepageBlogGrid', lang);
        }
      }
    } catch (e) {}

    if (!this.articles || this.articles.length === 0) {
      gridEl.innerHTML = this._skeleton(3);
    }

    if (!firebaseService.db) firebaseService.init();

    // 2. Fetch fresh articles in background
    const latest = await this.fetchLatest(3);
    if (latest && latest.length > 0) {
      this.renderGrid(latest, 'homepageBlogGrid', lang);
    }

    window.addEventListener('languageChanged', (e) => {
      if (this.articles && this.articles.length > 0) {
        this.renderGrid(this.articles.slice(0, 3), 'homepageBlogGrid', e.detail.lang);
      }
    });
  }

  // ── Init single article page ───────────────────────────
  async initArticlePage() {
    // Detect slug from URL: /blog/slug or ?slug=slug
    const slug = this._getSlugFromUrl();

    if (!slug) {
      window.location.href = '/blog';
      return;
    }

    if (!firebaseService.db) firebaseService.init();

    // Fetch all articles for prev/next and related
    const allArticles = await this.fetchArticles({ limit: 100 });
    const article = allArticles.find(a => a.slug === slug);

    if (!article) {
      this._show404(slug);
      return;
    }

    this.currentArticle = article;
    const currentLang = document.documentElement.lang || 'ar';
    this._renderArticle(article, currentLang, allArticles);

    // Listen for language toggle
    window.addEventListener('languageChanged', (e) => {
      if (this.currentArticle) {
        this._renderArticle(this.currentArticle, e.detail.lang, allArticles);
      }
    });
  }

  // ── Get slug from URL ──────────────────────────────────
  _getSlugFromUrl() {
    // Support /blog/{slug} (via firebase.json rewrite)
    const path = window.location.pathname;
    const blogMatch = path.match(/^\/blog\/(.+)$/);
    if (blogMatch) return blogMatch[1];

    // Fallback: ?slug= query param
    const params = new URLSearchParams(window.location.search);
    return params.get('slug');
  }

  // ── Render full article ────────────────────────────────
  _renderArticle(article, lang = null, allArticles = []) {
    lang = lang || document.documentElement.lang || 'ar';
    const isAr = lang === 'ar';

    const title   = isAr ? (article.titleAr   || article.titleEn   || '') : (article.titleEn   || article.titleAr   || '');
    const rawContent = isAr ? (article.contentAr || article.contentEn || '') : (article.contentEn || article.contentAr || '');
    const excerpt = isAr ? (article.excerptAr || article.excerptEn || '') : (article.excerptEn || article.excerptAr || '');
    const date    = this.formatDate(article.publishedAt, lang);
    const color   = this.getCategoryColor(article.category);
    const label   = isAr
      ? (article.categoryLabelAr || article.category)
      : (article.categoryLabelEn || article.category);
    const author  = article.author || AUTHOR.name;

    const slug       = article.slug;
    const canonicalAr = `${SITE_URL}/blog/${slug}`;
    const canonicalEn = `${SITE_URL}/blog/${slug}`;

    // Update page title
    document.title = `${title} - Saleh Bagomri`;

    // Update meta description
    this._setMeta('name', 'description', excerpt);

    // Update canonical
    this._setLink('canonical', `${SITE_URL}/blog/${slug}`);

    // Update hreflang
    const hasAr = !!(article.titleAr && article.contentAr);
    const hasEn = !!(article.titleEn && article.contentEn);

    if (hasAr && hasEn) {
      this._setLinkHreflang('ar', canonicalAr);
      this._setLinkHreflang('en', canonicalEn);
      this._setLinkHreflang('x-default', canonicalAr);
    } else {
      this._removeHreflang();
    }

    // Update OG tags
    this._setMeta('property', 'og:title', title);
    this._setMeta('property', 'og:description', excerpt);
    this._setMeta('property', 'og:url', `${SITE_URL}/blog/${slug}`);
    this._setMeta('property', 'og:locale', isAr ? 'ar_SA' : 'en_US');
    if (article.coverImage) {
      this._setMeta('property', 'og:image', article.coverImage);
    }

    // Update Twitter Card
    this._setMeta('name', 'twitter:title', title);
    this._setMeta('name', 'twitter:description', excerpt);
    if (article.coverImage) {
      this._setMeta('name', 'twitter:image', article.coverImage);
    }

    // JSON-LD Structured Data
    this._injectArticleStructuredData(article, title, excerpt, lang);
    this._injectBreadcrumbStructuredData(title, slug);

    // Breadcrumb text
    const breadcrumbEl = document.getElementById('breadcrumbTitle');
    if (breadcrumbEl) {
      breadcrumbEl.textContent = title.length > 50 ? title.slice(0, 50) + '…' : title;
    }

    // Render article header
    const updatedAtDate = article.updatedAt && article.updatedAt !== article.publishedAt
      ? this.formatDate(article.updatedAt, lang)
      : null;

    const updatedLabel = updatedAtDate
      ? `<span class="article-updated" aria-label="${isAr ? 'آخر تحديث' : 'Updated'}">
           <i data-lucide="refresh-cw" aria-hidden="true"></i>
           ${isAr ? 'تحديث' : 'Updated'} ${updatedAtDate}
         </span>`
      : '';

    const coverHtml = article.coverImage
      ? `<div class="article-hero-cover">
           <img src="${article.coverImage}"
                alt="${isAr ? `صورة مقال: ${title}` : `Cover image for: ${title}`}"
                width="760" height="427"
                loading="eager"
                fetchpriority="high">
         </div>`
      : '';

    const headerEl = document.getElementById('articleHeader');
    if (headerEl) {
      headerEl.innerHTML = `
      <div class="article-category-badge" style="color:${color.text};background:${color.bg}">
        ${label}
      </div>
      <h1 class="article-title">${title}</h1>
      <div class="article-meta-row">
        <span class="article-author-meta">
          <img src="/assets/images/profile.png" alt="${author}" width="22" height="22" class="article-author-avatar">
          <span>${author}</span>
        </span>
        <span class="article-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <time datetime="${this.formatDateISO(article.publishedAt)}">${date}</time>
        </span>
        <span class="article-read-time">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          ${isAr ? `${article.readTime || 3} دقائق قراءة` : `${article.readTime || 3} min read`}
        </span>
        ${updatedLabel}
      </div>
      ${coverHtml}`;
    }

    // Sanitize and inject article content
    const safeContent = sanitizeHTML(rawContent);
    const contentEl = document.getElementById('articleContent');
    if (contentEl) {
      contentEl.innerHTML = safeContent;

      // Build TOC after content is in DOM
      const tocHTML = buildTOC(contentEl, lang);
      const tocEl = document.getElementById('articleTOC');
      if (tocEl && tocHTML) {
        tocEl.innerHTML = tocHTML;
        tocEl.style.display = '';
        lucide.createIcons({ nodes: [tocEl] });
      }

      // Enhance code blocks
      enhanceCodeBlocks(contentEl, lang);
    }

    // Author box lang update
    this._updateAuthorBox(lang);

    // Related Articles
    this._renderRelated(article, allArticles, lang);

    // Prev / Next
    this._renderPrevNext(article, allArticles, lang);

    // Re-init Lucide icons
    lucide.createIcons();
  }

  // ── Inject Article JSON-LD ─────────────────────────────
  _injectArticleStructuredData(article, title, excerpt, lang) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      'headline': title,
      'description': excerpt,
      'datePublished': this.formatDateISO(article.publishedAt),
      'dateModified': article.updatedAt
        ? this.formatDateISO(article.updatedAt)
        : this.formatDateISO(article.publishedAt),
      'author': {
        '@type': 'Person',
        'name': article.author || AUTHOR.name,
        'url': AUTHOR.url,
        'sameAs': AUTHOR.sameAs,
      },
      'publisher': {
        '@type': 'Person',
        'name': AUTHOR.name,
        'url': SITE_URL,
      },
      'mainEntityOfPage': {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/blog/${article.slug}`,
      },
      'inLanguage': lang === 'ar' ? 'ar' : 'en',
    };
    if (article.coverImage) {
      schema.image = {
        '@type': 'ImageObject',
        'url': article.coverImage,
        'width': 1200,
        'height': 675,
      };
    }

    const el = document.getElementById('articleStructuredData');
    if (el) el.textContent = JSON.stringify(schema);
  }

  // ── Inject Breadcrumb JSON-LD ──────────────────────────
  _injectBreadcrumbStructuredData(title, slug) {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': SITE_URL },
        { '@type': 'ListItem', 'position': 2, 'name': 'Blog', 'item': `${SITE_URL}/blog` },
        { '@type': 'ListItem', 'position': 3, 'name': title, 'item': `${SITE_URL}/blog/${slug}` },
      ]
    };
    const el = document.getElementById('breadcrumbStructuredData');
    if (el) el.textContent = JSON.stringify(schema);
  }

  // ── Render related articles ────────────────────────────
  _renderRelated(current, allArticles, lang) {
    const related = allArticles
      .filter(a => a.id !== current.id && a.category === current.category)
      .slice(0, 3);

    const fallback = related.length < 2
      ? allArticles.filter(a => a.id !== current.id).slice(0, 3 - related.length)
      : [];

    const toShow = [...related, ...fallback].slice(0, 3);

    const section = document.getElementById('relatedArticles');
    const grid    = document.getElementById('relatedGrid');
    if (!section || !grid || toShow.length === 0) return;

    grid.innerHTML = toShow.map(a => this.renderCard(a, lang)).join('');
    section.style.display = '';

    // Update heading text
    const heading = section.querySelector('.related-title');
    if (heading) {
      heading.textContent = lang === 'ar' ? 'مقالات ذات صلة' : 'Related Articles';
    }
  }

  // ── Render prev / next navigation ─────────────────────
  _renderPrevNext(current, allArticles, lang) {
    const idx    = allArticles.findIndex(a => a.id === current.id);
    const prev   = idx > 0 ? allArticles[idx - 1] : null;
    const next   = idx < allArticles.length - 1 ? allArticles[idx + 1] : null;

    const navEl  = document.getElementById('articleNavLinks');
    const prevEl = document.getElementById('prevArticleLink');
    const nextEl = document.getElementById('nextArticleLink');
    const prevTitleEl = document.getElementById('prevArticleTitle');
    const nextTitleEl = document.getElementById('nextArticleTitle');

    if (!navEl) return;

    const isAr = lang === 'ar';

    if (prev) {
      const prevTitle = isAr ? (prev.titleAr || prev.titleEn) : (prev.titleEn || prev.titleAr);
      prevEl.href = `/blog/${prev.slug}`;
      if (prevTitleEl) prevTitleEl.textContent = prevTitle;
      prevEl.style.display = '';
    }

    if (next) {
      const nextTitle = isAr ? (next.titleAr || next.titleEn) : (next.titleEn || next.titleAr);
      nextEl.href = `/blog/${next.slug}`;
      if (nextTitleEl) nextTitleEl.textContent = nextTitle;
      nextEl.style.display = '';
    }

    if (prev || next) navEl.style.display = '';

    // Update labels
    const prevSmall = prevEl?.querySelector('small');
    const nextSmall = nextEl?.querySelector('small');
    if (prevSmall) prevSmall.textContent = isAr ? 'المقال السابق' : 'Previous Article';
    if (nextSmall) nextSmall.textContent = isAr ? 'المقال التالي' : 'Next Article';
  }

  // ── Update author box lang ─────────────────────────────
  _updateAuthorBox(lang) {
    const isAr = lang === 'ar';
    const role = document.querySelector('.author-role');
    const bio  = document.querySelector('.author-bio');
    const cta  = document.querySelector('.author-cta');

    if (role) role.textContent = isAr
      ? 'مطور Kotlin & Android | خبرة سابقة في Flutter'
      : 'Kotlin & Android Developer | Former Flutter Developer';

    if (bio) bio.textContent = isAr
      ? 'أشاركم خبراتي وتجاربي في عالم تطوير التطبيقات - نصائح عملية ودروس مستفادة.'
      : 'Sharing my experience in mobile app development - practical tips and lessons learned.';

    if (cta) cta.textContent = isAr ? 'تواصل معي' : 'Get in Touch';
  }

  // ── Show 404 state ─────────────────────────────────────
  _show404(slug) {
    const isAr = (document.documentElement.lang || 'ar') === 'ar';
    document.title = isAr ? 'المقال غير موجود - Bagomri' : 'Article Not Found - Bagomri';
    this._setMeta('name', 'robots', 'noindex, follow');

    const contentEl = document.getElementById('articleContent');
    if (contentEl) {
      contentEl.innerHTML = `
      <div class="article-not-found" role="alert">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <h2>${isAr ? 'المقال غير موجود' : 'Article Not Found'}</h2>
        <p>${isAr ? 'عذراً، المقال الذي تبحث عنه غير متاح.' : 'Sorry, this article is not available.'}</p>
        <a href="/blog" class="btn btn-brand">${isAr ? 'العودة للمقالات' : 'Back to Articles'}</a>
      </div>`;
    }

    const headerEl = document.getElementById('articleHeader');
    if (headerEl) headerEl.innerHTML = '';
    const tocEl = document.getElementById('articleTOC');
    if (tocEl) tocEl.style.display = 'none';
  }

  // ── Filter button setup ────────────────────────────────
  _setupFilters() {
    const btns = document.querySelectorAll('.blog-filter-bar .filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const lang     = document.documentElement.lang || 'ar';
        const filtered = this.filterArticles(btn.dataset.filter);
        this.renderGrid(filtered, 'blogGrid', lang);
      });
    });
  }

  // ── DOM helpers ────────────────────────────────────────
  _setMeta(attrName, attrValue, content) {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  _setLink(rel, href) {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = rel;
      document.head.appendChild(el);
    }
    el.href = href;
  }

  _setLinkHreflang(hreflang, href) {
    let el = document.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
    if (!el) {
      el = document.createElement('link');
      el.rel = 'alternate';
      el.setAttribute('hreflang', hreflang);
      document.head.appendChild(el);
    }
    el.href = href;
  }

  _removeHreflang() {
    document.querySelectorAll('link[hreflang]').forEach(el => el.remove());
  }

  // ── Skeleton loader cards ──────────────────────────────
  _skeleton(n) {
    return Array.from({ length: n }, () => `
    <div class="blog-card blog-card-skeleton" aria-hidden="true">
      <div class="skeleton-img"></div>
      <div class="blog-card-body">
        <div class="skeleton-line short"></div>
        <div class="skeleton-line full"></div>
        <div class="skeleton-line medium"></div>
      </div>
    </div>`).join('');
  }
}

// Global instance
const blogManager = new BlogManager();
window.blogManager = blogManager;
window.wordCount = wordCount;

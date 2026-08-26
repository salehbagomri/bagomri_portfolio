// ============================================
// BLOG MODULE — js/modules/blog.js
// Reads articles from Firestore and renders them
// ============================================

class BlogManager {
    constructor() {
        this.articles = [];
        this.currentFilter = 'all';
        this.currentLang = 'ar';
    }

    // ── Fetch articles from Firestore ──────────────────────
    async fetchArticles({ category = null, limit = 50, published = true } = {}) {
        try {
            if (!firebaseService.db) return [];

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
        } catch (error) {
            console.error('❌ Error fetching articles:', error);
            return [];
        }
    }

    // ── Fetch single article by slug ──────────────────────
    async fetchBySlug(slug) {
        try {
            if (!firebaseService.db) return null;
            const snapshot = await firebaseService.db
                .collection(firebaseService.collections.articles)
                .where('slug', '==', slug)
                .where('published', '==', true)
                .limit(1)
                .get();

            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            console.error('❌ Error fetching article:', error);
            return null;
        }
    }

    // ── Fetch latest N articles (for homepage preview) ────
    async fetchLatest(n = 3) {
        return this.fetchArticles({ limit: n });
    }

    // ── Format publish date ────────────────────────────────
    formatDate(timestamp, lang = 'ar') {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const locale = lang === 'ar' ? 'ar-SA' : 'en-US';
        return date.toLocaleDateString(locale, { year: 'numeric', month: 'short' });
    }

    // ── Get icon SVG for category ──────────────────────────
    getCategoryIcon(category) {
        const icons = {
            kotlin:   '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m3 3 9 9-9 9h18L12 12 21 3Z"/></svg>',
            android:  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 16a7 7 0 0 1 14 0"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><line x1="8" y1="7" x2="6" y2="4"/><line x1="16" y1="7" x2="18" y2="4"/></svg>',
            compose:  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><path d="M17 13v8M13 17h8"/></svg>',
            tips:     '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
            personal: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m13 2-3 14-3-5H2l5-3-1-6Z"/></svg>',
            default:  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        };
        return icons[category] || icons.default;
    }

    // ── Get color theme per category ───────────────────────
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
        const title   = lang === 'ar' ? (article.titleAr   || article.title?.ar   || '') : (article.titleEn   || article.title?.en   || '');
        const excerpt = lang === 'ar' ? (article.excerptAr || article.excerpt?.ar || '') : (article.excerptEn || article.excerpt?.en || '');
        const label   = lang === 'ar' ? (article.categoryLabelAr || article.category) : (article.categoryLabelEn || article.category);
        const date    = this.formatDate(article.publishedAt, lang);
        const color   = this.getCategoryColor(article.category);
        const icon    = this.getCategoryIcon(article.category);
        const readMore = lang === 'ar' ? 'اقرأ المزيد' : 'Read More';
        const readTimeLabel = lang === 'ar'
            ? `${article.readTime || 3} دقائق قراءة`
            : `${article.readTime || 3} min read`;

        return `
        <article class="blog-card" data-category="${article.category || 'default'}" data-id="${article.id}">
          <div class="blog-card-img" style="background:${color.bg}; height:140px; color:${color.text}">
            ${icon}
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span class="blog-tag" style="color:${color.text};background:${color.bg}">${label || article.category}</span>
              <span class="blog-date">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${date}
              </span>
            </div>
            <h3 class="blog-card-title">${title}</h3>
            <p class="blog-card-excerpt">${excerpt}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
              <a href="article.html?slug=${article.slug}" class="blog-read-more">
                ${readMore}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
              <span style="font-size:0.75rem;color:var(--text-light)">${readTimeLabel}</span>
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

        // Show skeleton loading
        gridEl.innerHTML = this._skeleton(6);

        // Init Firebase if not done
        if (!firebaseService.db) firebaseService.init();

        const articles = await this.fetchArticles();

        // Render grid
        this.renderGrid(articles, 'blogGrid', lang);

        // Setup filter buttons
        this._setupFilters();
    }

    // ── Init single article page ───────────────────────────
    async initArticlePage() {
        const params = new URLSearchParams(window.location.search);
        const slug   = params.get('slug');

        if (!slug) {
            window.location.href = 'blog.html';
            return;
        }

        if (!firebaseService.db) firebaseService.init();
        const article = await this.fetchBySlug(slug);

        if (!article) {
            document.getElementById('articleContent').innerHTML =
                '<div class="article-not-found"><h2>المقال غير موجود</h2><a href="blog.html">العودة للمقالات</a></div>';
            return;
        }

        this._renderArticle(article);
    }

    // ── Render full article ────────────────────────────────
    _renderArticle(article) {
        const lang    = document.documentElement.lang || 'ar';
        const title   = lang === 'ar' ? (article.titleAr   || '') : (article.titleEn   || '');
        const content = lang === 'ar' ? (article.contentAr || '') : (article.contentEn || '');
        const date    = this.formatDate(article.publishedAt, lang);
        const color   = this.getCategoryColor(article.category);
        const label   = lang === 'ar' ? (article.categoryLabelAr || article.category) : (article.categoryLabelEn || article.category);

        // Update page title + meta
        document.title = `${title} - Saleh Bagomri`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            const excerpt = lang === 'ar' ? (article.excerptAr || '') : (article.excerptEn || '');
            metaDesc.setAttribute('content', excerpt);
        }

        // Update OG tags dynamically
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', title);

        // Render article header
        const headerEl = document.getElementById('articleHeader');
        if (headerEl) {
            headerEl.innerHTML = `
            <div class="article-category-badge" style="color:${color.text};background:${color.bg}">
              ${label}
            </div>
            <h1 class="article-title">${title}</h1>
            <div class="article-meta-row">
              <span class="article-date">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${date}
              </span>
              <span class="article-read-time">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${lang === 'ar' ? `${article.readTime || 3} دقائق` : `${article.readTime || 3} min`}
              </span>
            </div>`;
        }

        // Render article content
        const contentEl = document.getElementById('articleContent');
        if (contentEl) contentEl.innerHTML = content;
    }

    // ── Filter button setup ────────────────────────────────
    _setupFilters() {
        const btns = document.querySelectorAll('.blog-filter-bar .filter-btn');
        const lang = document.documentElement.lang || 'ar';

        btns.forEach(btn => {
            btn.addEventListener('click', () => {
                btns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filtered = this.filterArticles(btn.dataset.filter);
                this.renderGrid(filtered, 'blogGrid', lang);
            });
        });
    }

    // ── Skeleton loader cards ──────────────────────────────
    _skeleton(n) {
        return Array.from({ length: n }, () => `
        <div class="blog-card blog-card-skeleton">
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

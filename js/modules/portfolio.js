/**
 * Portfolio Module - Bagomri Portfolio
 * Fetches dynamic projects from Firestore and renders responsive cards & details modal
 */

class PortfolioManager {
  constructor() {
    this.projects = [];
    this.currentFilter = 'all';
    this.currentLang = document.documentElement.lang || 'ar';
    this.activeModalProject = null;
  }

  // ── Helper: Current Language ──────────────────────────────
  isArabic() {
    return (document.documentElement.lang || this.currentLang) === 'ar';
  }

  // ── Fetch projects from Firestore ─────────────────────────
  async fetchProjects() {
    try {
      if (typeof firebaseService !== 'undefined' && !firebaseService.db) {
        firebaseService.init();
      }

      if (typeof firebaseService !== 'undefined' && firebaseService.db) {
        let docs = [];
        try {
          const snap = await firebaseService.db
            .collection('projects')
            .orderBy('order', 'asc')
            .get();
          docs = snap.docs;
        } catch (orderErr) {
          const snap = await firebaseService.db.collection('projects').get();
          docs = snap.docs;
        }

        this.projects = docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        this.projects.sort((a, b) => {
          const orderA = typeof a.order === 'number' ? a.order : 10;
          const orderB = typeof b.order === 'number' ? b.order : 10;
          return orderA - orderB;
        });

        return this.projects;
      }
    } catch (err) {
      console.error('❌ Error fetching projects from Firestore:', err);
    }
    return [];
  }

  // ── Skeleton Placeholder while loading ────────────────────
  _skeleton(count = 3) {
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="project-card project-card-skeleton">
          <div class="project-skeleton-img"></div>
          <div class="project-card-body">
            <div class="project-skeleton-tag"></div>
            <div class="project-skeleton-title"></div>
            <div class="project-skeleton-text"></div>
            <div class="project-skeleton-text short"></div>
            <div class="project-skeleton-links"></div>
          </div>
        </div>`;
    }
    return html;
  }

  // ── Category formatting ───────────────────────────────────
  getCategoryLabel(category, isAr) {
    const map = {
      kotlin:   isAr ? 'Kotlin & Android' : 'Kotlin & Android',
      android:  isAr ? 'Kotlin & Android' : 'Kotlin & Android',
      flutter:  'Flutter',
      uiux:     'UI/UX',
      graphics: isAr ? 'جرافيك' : 'Graphics',
    };
    return map[category] || (category ? category.toUpperCase() : 'PROJECT');
  }

  // ── Category Icon & Color Helper ──────────────────────────
  getCategoryTheme(category) {
    switch (category) {
      case 'kotlin':
      case 'android':
        return { icon: 'smartphone', color: '#221461', bg: '#EEF0FF' };
      case 'flutter':
        return { icon: 'layers', color: '#0284C7', bg: '#E0F2FE' };
      case 'uiux':
        return { icon: 'pen-tool', color: '#D97706', bg: '#FEF3C7' };
      case 'graphics':
        return { icon: 'palette', color: '#16A34A', bg: '#DCFCE7' };
      default:
        return { icon: 'code', color: '#221461', bg: '#EEF0FF' };
    }
  }

  // ── Filter matching logic ─────────────────────────────────
  matchFilter(project, filter) {
    if (!filter || filter === 'all') return true;
    const cat = (project.category || '').toLowerCase();
    if (filter === 'android' || filter === 'kotlin') {
      return cat === 'android' || cat === 'kotlin';
    }
    if (filter === 'featured') {
      return !!project.featured;
    }
    return cat === filter;
  }

  // ── Build Single Project Card HTML ────────────────────────
  buildProjectCard(project, isAr) {
    const title = (isAr ? (project.title?.ar || project.titleAr) : (project.title?.en || project.titleEn))
      || project.title?.ar || project.titleAr || project.title?.en || project.title || 'Untitled Project';

    const desc = (isAr ? (project.description?.ar || project.descAr) : (project.description?.en || project.descEn))
      || project.description?.ar || project.descAr || project.description?.en || project.desc || project.description || '';

    const category = project.category || 'other';
    const catLabel = this.getCategoryLabel(category, isAr);
    const theme = this.getCategoryTheme(category);
    const imgUrl = project.image || project.imageUrl || '';

    // Tags
    const tags = Array.isArray(project.tags) ? project.tags.slice(0, 4) : [];
    const tagsHtml = tags.map(t => `<span class="project-tag-pill">${t}</span>`).join('');

    // Links & Actions
    const links = project.links || {};
    const githubUrl = links.github || project.githubUrl || '';
    const playstoreUrl = links.playstore || links.android || project.storeUrl || '';
    const appstoreUrl = links.appstore || links.ios || '';
    const figmaUrl = links.figma || '';
    const behanceUrl = links.behance || '';
    const demoUrl = links.demo || project.demoUrl || '';

    let linksHtml = '';

    if (demoUrl) {
      linksHtml += `
        <a href="${demoUrl}" target="_blank" rel="noopener" title="${isAr ? 'معاينة مباشرة' : 'Live Demo'}">
          <i data-lucide="external-link"></i>
          <span>${isAr ? 'معاينة' : 'Demo'}</span>
        </a>`;
    }
    if (playstoreUrl) {
      linksHtml += `
        <a href="${playstoreUrl}" target="_blank" rel="noopener" title="Google Play">
          <i data-lucide="play"></i>
          <span>Play</span>
        </a>`;
    }
    if (appstoreUrl) {
      linksHtml += `
        <a href="${appstoreUrl}" target="_blank" rel="noopener" title="App Store">
          <i data-lucide="apple"></i>
          <span>iOS</span>
        </a>`;
    }
    if (figmaUrl) {
      linksHtml += `
        <a href="${figmaUrl}" target="_blank" rel="noopener" title="Figma">
          <i data-lucide="figma"></i>
          <span>Figma</span>
        </a>`;
    }
    if (behanceUrl) {
      linksHtml += `
        <a href="${behanceUrl}" target="_blank" rel="noopener" title="Behance">
          <i data-lucide="palette"></i>
          <span>Behance</span>
        </a>`;
    }
    if (githubUrl) {
      linksHtml += `
        <a href="${githubUrl}" target="_blank" rel="noopener" title="GitHub">
          <i data-lucide="github"></i>
          <span>${isAr ? 'الكود' : 'Code'}</span>
        </a>`;
    }

    // Details button
    const hasDetails = (project.fullDescription?.ar || project.fullDescription?.en || (project.screenshots && project.screenshots.length > 0) || (project.features && (project.features.ar || project.features.en)));
    if (hasDetails) {
      linksHtml += `
        <button type="button" class="project-modal-btn" onclick="portfolioManager.openModal('${project.id}')" title="${isAr ? 'تفاصيل أكثر' : 'More Details'}">
          <i data-lucide="info"></i>
          <span>${isAr ? 'تفاصيل' : 'Details'}</span>
        </button>`;
    }

    // Cover image element or icon placeholder
    const imageHtml = imgUrl
      ? `<img src="${imgUrl}" alt="${title}" loading="lazy" class="project-img-thumb" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
         <div class="project-card-img-placeholder" style="display:none;background:${theme.bg}">
           <i data-lucide="${theme.icon}" style="width:40px;height:40px;color:${theme.color}"></i>
         </div>`
      : `<div class="project-card-img-placeholder" style="background:${theme.bg}">
           <i data-lucide="${theme.icon}" style="width:40px;height:40px;color:${theme.color}"></i>
         </div>`;

    return `
      <div class="project-card" data-category="${category}" data-id="${project.id}">
        <div class="project-card-img">
          ${imageHtml}
        </div>
        <div class="project-card-body">
          <div class="project-card-header-row">
            <span class="project-card-tag">${catLabel}</span>
            ${project.featured ? `<span class="project-featured-chip"><i data-lucide="star"></i> ${isAr ? 'مميز' : 'Featured'}</span>` : ''}
          </div>
          <h3 class="project-card-title">${title}</h3>
          <p class="project-card-desc">${desc}</p>
          ${tagsHtml ? `<div class="project-tags-wrap">${tagsHtml}</div>` : ''}
          ${linksHtml ? `<div class="project-card-links">${linksHtml}</div>` : ''}
        </div>
      </div>`;
  }

  // ── Render grid ───────────────────────────────────────────
  renderGrid() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    const isAr = this.isArabic();
    const filtered = this.projects.filter(p => this.matchFilter(p, this.currentFilter));

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="portfolio-empty">
          <i data-lucide="folder-open"></i>
          <p>${isAr ? 'لا توجد مشاريع في هذا التصنيف حالياً.' : 'No projects found in this category.'}</p>
        </div>`;
    } else {
      grid.innerHTML = filtered.map(p => this.buildProjectCard(p, isAr)).join('');
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof refreshAnimations === 'function') refreshAnimations();
  }

  // ── Filter Buttons Setup ──────────────────────────────────
  setupFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter || 'all';
        this.renderGrid();
      });
    });
  }

  // ── Project Details Modal ─────────────────────────────────
  openModal(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    this.activeModalProject = project;

    const isAr = this.isArabic();
    const title = (isAr ? (project.title?.ar || project.titleAr) : (project.title?.en || project.titleEn))
      || project.title?.ar || project.titleAr || project.title?.en || 'Project Details';

    const fullDesc = (isAr ? (project.fullDescription?.ar || project.description?.ar) : (project.fullDescription?.en || project.description?.en))
      || project.fullDescription?.ar || project.description?.ar || project.fullDescription?.en || project.description?.en || '';

    const category = project.category || 'other';
    const catLabel = this.getCategoryLabel(category, isAr);
    const role = (isAr ? project.role?.ar : project.role?.en) || project.role?.ar || project.role?.en || '';
    const date = project.date || '';

    // Features
    const features = (isAr ? project.features?.ar : project.features?.en)
      || (Array.isArray(project.features) ? project.features : (project.features?.ar || project.features?.en || []));
    const featuresHtml = Array.isArray(features) && features.length > 0
      ? `<div class="modal-features-section">
           <h4 class="modal-section-title"><i data-lucide="check-circle-2"></i> ${isAr ? 'أهم المميزات' : 'Key Features'}</h4>
           <ul class="modal-features-list">
             ${features.map(f => `<li><i data-lucide="check"></i> <span>${f}</span></li>`).join('')}
           </ul>
         </div>`
      : '';

    // Screenshots
    let shots = project.screenshots || [];
    if (!Array.isArray(shots)) {
      shots = [...(shots.mobile || []), ...(shots.desktop || [])];
    }
    const shotsHtml = shots.length > 0
      ? `<div class="modal-screenshots-section">
           <h4 class="modal-section-title"><i data-lucide="images"></i> ${isAr ? 'معرض الصور' : 'Screenshots'}</h4>
           <div class="modal-screenshots-gallery">
             ${shots.map(url => `
               <a href="${url}" target="_blank" rel="noopener" class="modal-shot-thumb">
                 <img src="${url}" alt="Screenshot" loading="lazy">
               </a>`).join('')}
           </div>
         </div>`
      : '';

    // Links
    const links = project.links || {};
    const githubUrl = links.github || project.githubUrl || '';
    const playstoreUrl = links.playstore || links.android || project.storeUrl || '';
    const appstoreUrl = links.appstore || links.ios || '';
    const figmaUrl = links.figma || '';
    const behanceUrl = links.behance || '';
    const demoUrl = links.demo || project.demoUrl || '';

    let linksButtons = '';
    if (demoUrl) {
      linksButtons += `<a href="${demoUrl}" target="_blank" rel="noopener" class="btn btn-brand btn-sm"><i data-lucide="external-link"></i> ${isAr ? 'معاينة حية' : 'Live Demo'}</a>`;
    }
    if (playstoreUrl) {
      linksButtons += `<a href="${playstoreUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i data-lucide="play"></i> Google Play</a>`;
    }
    if (appstoreUrl) {
      linksButtons += `<a href="${appstoreUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i data-lucide="apple"></i> App Store</a>`;
    }
    if (figmaUrl) {
      linksButtons += `<a href="${figmaUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i data-lucide="figma"></i> Figma</a>`;
    }
    if (behanceUrl) {
      linksButtons += `<a href="${behanceUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i data-lucide="palette"></i> Behance</a>`;
    }
    if (githubUrl) {
      linksButtons += `<a href="${githubUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><i data-lucide="github"></i> GitHub</a>`;
    }

    // Modal container
    let container = document.getElementById('projectDetailsModal');
    if (!container) {
      container = document.createElement('div');
      container.id = 'projectDetailsModal';
      container.className = 'portfolio-modal-overlay';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="portfolio-modal-dialog" role="dialog" aria-modal="true">
        <div class="portfolio-modal-header">
          <div class="portfolio-modal-title-wrap">
            <span class="project-card-tag">${catLabel}</span>
            <h3 class="portfolio-modal-title">${title}</h3>
          </div>
          <button type="button" class="portfolio-modal-close" onclick="portfolioManager.closeModal()" aria-label="Close">
            <i data-lucide="x"></i>
          </button>
        </div>

        <div class="portfolio-modal-body">
          ${project.image ? `
            <div class="portfolio-modal-banner">
              <img src="${project.image}" alt="${title}">
            </div>` : ''}

          <div class="portfolio-modal-meta-bar">
            ${role ? `<div class="modal-meta-item"><span class="meta-label">${isAr ? 'الدور:' : 'Role:'}</span> <strong class="meta-val">${role}</strong></div>` : ''}
            ${date ? `<div class="modal-meta-item"><span class="meta-label">${isAr ? 'التاريخ:' : 'Date:'}</span> <strong class="meta-val">${date}</strong></div>` : ''}
          </div>

          ${fullDesc ? `
            <div class="modal-desc-section">
              <p>${fullDesc.replace(/\n/g, '<br>')}</p>
            </div>` : ''}

          ${featuresHtml}
          ${shotsHtml}

          ${project.tags && project.tags.length > 0 ? `
            <div class="modal-tags-section">
              <h4 class="modal-section-title"><i data-lucide="tag"></i> ${isAr ? 'التقنيات المستخدمة' : 'Technologies'}</h4>
              <div class="project-tags-wrap">
                ${project.tags.map(t => `<span class="project-tag-pill">${t}</span>`).join('')}
              </div>
            </div>` : ''}
        </div>

        <div class="portfolio-modal-footer">
          <div class="modal-links-group">
            ${linksButtons}
          </div>
          <button type="button" class="btn btn-outline btn-sm" onclick="portfolioManager.closeModal()">${isAr ? 'إغلاق' : 'Close'}</button>
        </div>
      </div>`;

    container.classList.add('open');
    document.body.style.overflow = 'hidden';

    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Close on backdrop click or ESC
    container.onclick = (e) => {
      if (e.target === container) this.closeModal();
    };

    this._escHandler = (e) => {
      if (e.key === 'Escape') this.closeModal();
    };
    document.addEventListener('keydown', this._escHandler);
  }

  closeModal() {
    const container = document.getElementById('projectDetailsModal');
    if (container) {
      container.classList.remove('open');
    }
    document.body.style.overflow = '';
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    this.activeModalProject = null;
  }

  // ── Main Init ─────────────────────────────────────────────
  async init() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    // 1. Show clean skeleton loading
    grid.innerHTML = this._skeleton(3);

    // 2. Setup filter buttons
    this.setupFilters();

    // 3. Fetch from Firestore
    await this.fetchProjects();

    // 4. Render cards
    this.renderGrid();

    // 5. Listen to language changes
    window.addEventListener('languageChanged', (e) => {
      this.currentLang = e.detail?.lang || document.documentElement.lang || 'ar';
      this.renderGrid();
      if (this.activeModalProject) {
        this.openModal(this.activeModalProject.id);
      }
    });
  }
}

// Global instance
const portfolioManager = new PortfolioManager();

// Main function called by main.js
function initPortfolio() {
  portfolioManager.init();
}

// Expose globally
window.portfolioManager = portfolioManager;
window.initPortfolio = initPortfolio;

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

  // ── Load Cached Projects ──────────────────────────────────
  loadCachedProjects() {
    try {
      const cached = localStorage.getItem('bagomri_cached_projects');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.projects = parsed;
          return true;
        }
      }
    } catch (e) {}
    return false;
  }

  // ── Fetch projects from Firestore ─────────────────────────
  async fetchProjects() {
    try {
      if (typeof firebaseService !== 'undefined' && !firebaseService.db) {
        firebaseService.init();
      }

      if (typeof firebaseService !== 'undefined' && firebaseService.db) {
        const fetchPromise = (async () => {
          try {
            const snap = await firebaseService.db
              .collection('projects')
              .orderBy('order', 'asc')
              .get();
            return snap.docs;
          } catch (orderErr) {
            const snap = await firebaseService.db.collection('projects').get();
            return snap.docs;
          }
        })();

        // 4-second timeout to prevent hanging on unstable mobile connections
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 4000)
        );

        const docs = await Promise.race([fetchPromise, timeoutPromise]);

        if (docs && docs.length > 0) {
          this.projects = docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          this.projects.sort((a, b) => {
            const orderA = typeof a.order === 'number' ? a.order : 10;
            const orderB = typeof b.order === 'number' ? b.order : 10;
            return orderA - orderB;
          });

          try {
            localStorage.setItem('bagomri_cached_projects', JSON.stringify(this.projects));
          } catch (e) {}
        }
        return this.projects;
      }
    } catch (err) {
      console.warn('⚠️ Projects loaded from cache/fallback:', err.message);
    }
    return this.projects;
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
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
    this.currentLightboxShots = shots;

    const shotsHtml = shots.length > 0
      ? `<div class="modal-screenshots-section">
           <h4 class="modal-section-title"><i data-lucide="images"></i> ${isAr ? 'معرض الصور (اضغط للتكبير)' : 'Screenshots (Click to view)'}</h4>
           <div class="modal-screenshots-gallery">
             ${shots.map((url, idx) => `
               <button type="button" class="modal-shot-thumb" onclick="portfolioManager.openLightbox(${idx})" title="${isAr ? 'عرض الصورة بالحجم الكامل' : 'View Full Image'}" aria-label="Screenshot ${idx + 1}">
                 <img src="${url}" alt="Screenshot ${idx + 1}" loading="lazy">
                 <span class="shot-zoom-overlay"><i data-lucide="zoom-in"></i></span>
               </button>`).join('')}
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
      linksButtons += `<a href="${demoUrl}" target="_blank" rel="noopener" class="btn btn-brand btn-sm"><i data-lucide="external-link"></i> ${isAr ? 'معاينة' : 'Demo'}</a>`;
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
      linksButtons += `<a href="${githubUrl}" target="_blank" rel="noopener" class="btn btn-outline btn-sm"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:middle;flex-shrink:0"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg> GitHub</a>`;
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
          <button type="button" class="btn btn-outline btn-sm modal-btn-close" onclick="portfolioManager.closeModal()">${isAr ? 'إغلاق' : 'Close'}</button>
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
    this.closeLightbox();
    document.body.style.overflow = '';
    if (this._escHandler) {
      document.removeEventListener('keydown', this._escHandler);
      this._escHandler = null;
    }
    this.activeModalProject = null;
  }

  // ── In-App Lightbox Gallery ────────────────────────────────
  openLightbox(index = 0) {
    if (!this.currentLightboxShots || !this.currentLightboxShots.length) return;
    this.currentLightboxIndex = Math.max(0, Math.min(index, this.currentLightboxShots.length - 1));

    let box = document.getElementById('portfolioLightbox');
    if (!box) {
      box = document.createElement('div');
      box.id = 'portfolioLightbox';
      box.className = 'portfolio-lightbox-overlay';
      box.innerHTML = `
        <div class="lightbox-top-bar">
          <div class="lightbox-counter" id="lightboxCounter"></div>
          <button type="button" class="lightbox-btn lightbox-close-btn" onclick="portfolioManager.closeLightbox()" aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <button type="button" class="lightbox-nav-btn lightbox-prev-btn" onclick="portfolioManager.prevLightbox()" aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div class="lightbox-image-stage" onclick="portfolioManager.closeLightbox()">
          <img id="lightboxCurrentImg" src="" alt="Screenshot View" onclick="event.stopPropagation()">
        </div>
        <button type="button" class="lightbox-nav-btn lightbox-next-btn" onclick="portfolioManager.nextLightbox()" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m9 18 6-6-6-6"/></svg>
        </button>
      `;
      document.body.appendChild(box);
    }

    this._updateLightboxContent();
    box.classList.add('open');

    if (this._lightboxKeyHandler) {
      document.removeEventListener('keydown', this._lightboxKeyHandler);
    }
    this._lightboxKeyHandler = (e) => {
      if (e.key === 'Escape') this.closeLightbox();
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') this.nextLightbox();
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') this.prevLightbox();
    };
    document.addEventListener('keydown', this._lightboxKeyHandler);
  }

  _updateLightboxContent() {
    const imgEl = document.getElementById('lightboxCurrentImg');
    const counterEl = document.getElementById('lightboxCounter');
    const prevBtn = document.querySelector('.lightbox-prev-btn');
    const nextBtn = document.querySelector('.lightbox-next-btn');

    if (!this.currentLightboxShots || !imgEl) return;
    const total = this.currentLightboxShots.length;
    const curr = this.currentLightboxIndex;

    imgEl.src = this.currentLightboxShots[curr];
    if (counterEl) {
      counterEl.textContent = `${curr + 1} / ${total}`;
    }
    if (prevBtn) prevBtn.style.display = total > 1 ? 'flex' : 'none';
    if (nextBtn) nextBtn.style.display = total > 1 ? 'flex' : 'none';
  }

  nextLightbox() {
    if (!this.currentLightboxShots || this.currentLightboxShots.length <= 1) return;
    this.currentLightboxIndex = (this.currentLightboxIndex + 1) % this.currentLightboxShots.length;
    this._updateLightboxContent();
  }

  prevLightbox() {
    if (!this.currentLightboxShots || this.currentLightboxShots.length <= 1) return;
    this.currentLightboxIndex = (this.currentLightboxIndex - 1 + this.currentLightboxShots.length) % this.currentLightboxShots.length;
    this._updateLightboxContent();
  }

  closeLightbox() {
    const box = document.getElementById('portfolioLightbox');
    if (box) {
      box.classList.remove('open');
    }
    if (this._lightboxKeyHandler) {
      document.removeEventListener('keydown', this._lightboxKeyHandler);
      this._lightboxKeyHandler = null;
    }
  }

  // ── Main Init ─────────────────────────────────────────────
  async init() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    // 1. Setup filter buttons
    this.setupFilters();

    // 2. If cached projects exist, render INSTANTLY (0ms)
    const hasCache = this.loadCachedProjects();
    if (hasCache && this.projects.length > 0) {
      this.renderGrid();
    } else {
      grid.innerHTML = this._skeleton(3);
    }

    // 3. Fetch latest data in background & re-render
    await this.fetchProjects();

    // 4. Render cards with fresh/confirmed data
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

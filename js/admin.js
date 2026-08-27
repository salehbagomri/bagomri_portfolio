// ============================================
// ADMIN MANAGER - لوحة التحكم (Redesigned)
// ============================================

const CLOUDINARY_CLOUD_NAME    = 'dk5buckt1';
const CLOUDINARY_UPLOAD_PRESET = 'pre-pro';

class AdminManager {
    constructor() {
        this.projects      = [];
        this.currentTags   = [];
        this.editingId     = null;
        this.deletingId    = null;
        this._activeFilter = 'all';
    }

    // ══ INIT ════════════════════════════════

    init() {
        firebaseService.init();

        firebaseService.onAuthStateChanged(user => {
            if (user) {
                const emailEl = document.getElementById('adminUserEmail');
                if (emailEl) emailEl.textContent = user.email;
                this.showDashboard();
                this.loadProjects();
            } else {
                this.showLogin();
            }
        });

        this.setupLoginForm();
        this.setupTagsInput();
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
    }

    // ══ AUTH ════════════════════════════════

    setupLoginForm() {
        document.getElementById('loginForm').addEventListener('submit', async e => {
            e.preventDefault();
            const btn   = document.getElementById('loginBtn');
            const errEl = document.getElementById('loginError');
            errEl.style.display = 'none';
            btn.innerHTML = '<span class="spinner"></span> جارٍ الدخول...';
            btn.disabled  = true;
            try {
                const email = document.getElementById('loginEmail').value;
                const pass  = document.getElementById('loginPassword').value;
                await firebaseService.loginAdmin(email, pass);
            } catch (err) {
                errEl.textContent   = 'بيانات الدخول غير صحيحة. تحقق من البريد وكلمة المرور.';
                errEl.style.display = 'block';
                btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> تسجيل الدخول';
                btn.disabled  = false;
            }
        });
    }

    async logout() { await firebaseService.logoutAdmin(); }

    showLogin() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('dashboard').style.display   = 'none';
    }
    showDashboard() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboard').style.display   = 'block';
    }

    // ══ PROJECTS ════════════════════════════

    async loadProjects() {
        this.projects = await firebaseService.getProjects();
        this.renderProjects();
        this.updateOverview();
    }

    renderProjects() {
        const grid   = document.getElementById('projectsGrid');
        const search = (document.getElementById('projectSearch')?.value || '').toLowerCase();
        let list = this.projects;

        if (this._activeFilter === 'featured') {
            list = list.filter(p => p.featured);
        } else if (this._activeFilter !== 'all') {
            list = list.filter(p => p.category === this._activeFilter);
        }

        if (search) {
            list = list.filter(p =>
                (p.title?.ar || '').toLowerCase().includes(search) ||
                (p.title?.en || '').toLowerCase().includes(search) ||
                (p.category || '').toLowerCase().includes(search)
            );
        }

        if (list.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">🚀</div>
                    <h3>${this.projects.length === 0 ? 'لا توجد مشاريع بعد' : 'لا توجد نتائج'}</h3>
                    <p>${this.projects.length === 0 ? 'أضف مشروعك الأول الآن' : 'جرّب فلتر آخر'}</p>
                    ${this.projects.length === 0 ? '<button class="btn btn-primary" onclick="admin.openAddModal()">+ إضافة مشروع</button>' : ''}
                </div>`;
            return;
        }

        grid.innerHTML = list.map(p => {
            const catClass = `cat-${p.category || 'other'}`;
            const catLabel = this.categoryLabel(p.category);
            const tags     = (p.tags || []).slice(0, 3);
            return `
            <div class="proj-card">
                <div class="proj-card-thumb">
                    ${p.image
                        ? `<img src="${p.image}" alt="${p.title?.ar || ''}" loading="lazy">`
                        : `<div class="proj-card-thumb-placeholder">🖼️</div>`
                    }
                    <div class="proj-card-overlay">
                        <button class="btn btn-sm" style="background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff" onclick="admin.openEditModal('${p.id}')">✏️ تعديل</button>
                        <button class="btn btn-danger btn-sm" onclick="admin.confirmDelete('${p.id}')">🗑️</button>
                    </div>
                </div>
                <div class="proj-card-body">
                    <div class="proj-card-meta">
                        <span class="proj-cat-badge ${catClass}">${catLabel}</span>
                        ${p.featured ? '<span class="proj-featured-dot" title="مميز"></span>' : ''}
                    </div>
                    <div class="proj-card-title">${p.title?.ar || 'بلا عنوان'}</div>
                    <div class="proj-card-desc">${p.description?.ar || ''}</div>
                    ${tags.length > 0 ? `<div class="proj-tags">${tags.map(t => `<span class="tag-pill">${t}</span>`).join('')}</div>` : ''}
                    <div class="proj-card-actions">
                        <button class="btn btn-ghost btn-sm" style="flex:1" onclick="admin.openEditModal('${p.id}')">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                            تعديل
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="admin.confirmDelete('${p.id}')">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    filterProjects() { this.renderProjects(); }

    setFilter(filter, btn) {
        this._activeFilter = filter;
        document.querySelectorAll('#page-projects .filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        this.renderProjects();
    }

    updateOverview() {
        const p = this.projects;
        const badge = document.getElementById('navBadgeProjects');
        if (badge) badge.textContent = p.length;

        const totalArt = (typeof blogAdmin !== 'undefined') ? blogAdmin.articles.length : 0;
        const pubArt   = (typeof blogAdmin !== 'undefined') ? blogAdmin.articles.filter(a => a.published).length : 0;

        const statsGrid = document.getElementById('overviewStats');
        if (statsGrid) {
            statsGrid.innerHTML = `
                <div class="stat-card"><div class="stat-card-icon ic-purple">🚀</div><div class="stat-num">${p.length}</div><div class="stat-label">إجمالي المشاريع</div></div>
                <div class="stat-card"><div class="stat-card-icon ic-blue">📱</div><div class="stat-num">${p.filter(x=>x.category==='flutter').length}</div><div class="stat-label">Flutter</div></div>
                <div class="stat-card"><div class="stat-card-icon ic-orange">🎨</div><div class="stat-num">${p.filter(x=>x.category==='uiux').length}</div><div class="stat-label">UI/UX</div></div>
                <div class="stat-card"><div class="stat-card-icon ic-green">🖌️</div><div class="stat-num">${p.filter(x=>x.category==='graphics').length}</div><div class="stat-label">جرافيك</div></div>
                <div class="stat-card"><div class="stat-card-icon ic-yellow">⭐</div><div class="stat-num">${p.filter(x=>x.featured).length}</div><div class="stat-label">مشاريع مميزة</div></div>
                <div class="stat-card"><div class="stat-card-icon ic-pink">📝</div><div class="stat-num">${totalArt}</div><div class="stat-label">إجمالي المقالات</div></div>`;
        }

        const summary = document.getElementById('contentSummary');
        if (summary) {
            const row = (icon, label, val, color) =>
                `<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">
                    <span style="display:flex;align-items:center;gap:8px;font-size:.875rem;color:var(--text-secondary)">${icon} ${label}</span>
                    <strong style="font-family:'Outfit',sans-serif;font-size:1.1rem;color:${color}">${val}</strong>
                </div>`;
            summary.innerHTML =
                row('🚀', 'المشاريع', p.length, 'var(--accent-light)') +
                row('⭐', 'المميزة', p.filter(x=>x.featured).length, 'var(--warning)') +
                row('📝', 'المقالات', totalArt, 'var(--success)') +
                row('✅', 'منشورة', pubArt, 'var(--info)');
        }
    }

    categoryLabel(c) {
        return {flutter:'Flutter',uiux:'UI/UX',graphics:'جرافيك',android:'Android'}[c] || (c||'أخرى');
    }

    // ══ MODALS ══════════════════════════════

    openAddModal() {
        this.editingId   = null;
        this.currentTags = [];
        document.getElementById('modalTitle').textContent = 'إضافة مشروع جديد';
        document.getElementById('projectForm').reset();
        document.getElementById('projectId').value = '';
        this.clearImage();
        document.getElementById('screenshotUrlsText').value      = '';
        document.getElementById('screenshotFilesList').textContent = '';
        document.getElementById('screenshotPreviewsGrid').innerHTML = '';
        this.renderTags();
        document.getElementById('projectModal').classList.add('open');
    }

    openEditModal(id) {
        const p = this.projects.find(x => x.id === id);
        if (!p) return;

        this.editingId   = id;
        this.currentTags = [...(p.tags || [])];

        document.getElementById('modalTitle').textContent = 'تعديل المشروع';
        document.getElementById('projectId').value  = id;
        document.getElementById('titleAr').value    = p.title?.ar || '';
        document.getElementById('titleEn').value    = p.title?.en || '';
        document.getElementById('category').value   = p.category || '';
        document.getElementById('projectDate').value= p.date || '';
        document.getElementById('roleAr').value     = p.role?.ar || '';
        document.getElementById('roleEn').value     = p.role?.en || '';
        document.getElementById('featured').checked = !!p.featured;
        document.getElementById('order').value      = p.order ?? 10;

        document.getElementById('imageUrl').value = p.image || '';
        if (p.image) {
            document.getElementById('imgPreview').src = p.image;
            document.getElementById('imgPreviewWrap').classList.add('visible');
        } else { this.clearImage(); }

        document.getElementById('descAr').value     = p.description?.ar || '';
        document.getElementById('descEn').value     = p.description?.en || '';
        document.getElementById('fullDescAr').value = p.fullDescription?.ar || '';
        document.getElementById('fullDescEn').value = p.fullDescription?.en || '';
        document.getElementById('featuresAr').value = (p.features?.ar || []).join('\n');
        document.getElementById('featuresEn').value = (p.features?.en || []).join('\n');
        document.getElementById('linkGithub').value    = p.links?.github    || '';
        document.getElementById('linkPlaystore').value = p.links?.playstore  || '';
        document.getElementById('linkAppstore').value  = p.links?.appstore   || '';
        document.getElementById('linkFigma').value     = p.links?.figma      || '';
        document.getElementById('linkBehance').value   = p.links?.behance    || '';
        document.getElementById('linkDemo').value      = p.links?.demo       || '';

        const shots    = p.screenshots || [];
        const shotsArr = Array.isArray(shots) ? shots : [...(shots.mobile||[]),...(shots.desktop||[])];
        document.getElementById('screenshotUrlsText').value      = shotsArr.join('\n');
        document.getElementById('screenshotFilesList').textContent = '';
        this.renderScreenshotPreviews(shotsArr);

        this.renderTags();
        document.getElementById('projectModal').classList.add('open');
    }

    closeModal() { document.getElementById('projectModal').classList.remove('open'); }

    // ══ SAVE ════════════════════════════════

    async handleSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('submitBtn');
        btn.innerHTML = '<span class="spinner"></span> جارٍ الحفظ...';
        btn.disabled  = true;

        try {
            let imageUrl  = document.getElementById('imageUrl').value.trim();
            const imgFile = document.getElementById('imageFile').files[0];
            if (imgFile) { this.toast('جارٍ رفع الصورة...','success'); imageUrl = await this.uploadToCloudinary(imgFile); }

            const screenshotFiles    = document.getElementById('screenshotFiles').files;
            const screenshotUrlsText = document.getElementById('screenshotUrlsText').value.trim();
            let screenshots = screenshotUrlsText ? screenshotUrlsText.split('\n').map(u=>u.trim()).filter(Boolean) : [];
            if (screenshotFiles.length > 0) {
                this.toast(`جارٍ رفع ${screenshotFiles.length} لقطة...`,'success');
                for (const f of screenshotFiles) screenshots.push(await this.uploadToCloudinary(f));
            }

            const data = {
                title:           { ar:this.v('titleAr'),    en:this.v('titleEn') },
                description:     { ar:this.v('descAr'),     en:this.v('descEn') },
                fullDescription: { ar:this.v('fullDescAr'), en:this.v('fullDescEn') },
                category:        this.v('category'),
                image:           imageUrl,
                screenshots,
                tags:            [...this.currentTags],
                featured:        document.getElementById('featured').checked,
                date:            this.v('projectDate'),
                order:           parseInt(document.getElementById('order').value) || 10,
                role:            { ar:this.v('roleAr'), en:this.v('roleEn') },
                features: {
                    ar: this.v('featuresAr').split('\n').map(s=>s.trim()).filter(Boolean),
                    en: this.v('featuresEn').split('\n').map(s=>s.trim()).filter(Boolean)
                },
                links: {
                    github:this.v('linkGithub'), playstore:this.v('linkPlaystore'),
                    appstore:this.v('linkAppstore'), figma:this.v('linkFigma'),
                    behance:this.v('linkBehance'), demo:this.v('linkDemo')
                }
            };
            Object.keys(data.links).forEach(k => { if (!data.links[k]) delete data.links[k]; });

            if (this.editingId) {
                await firebaseService.updateProject(this.editingId, data);
                this.toast('✅ تم تحديث المشروع','success');
            } else {
                await firebaseService.addProject(data);
                this.toast('✅ تمت إضافة المشروع','success');
            }
            this.closeModal();
            await this.loadProjects();

        } catch (err) {
            console.error(err);
            this.toast('❌ حدث خطأ، حاول مجدداً','error');
        }

        btn.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> حفظ المشروع';
        btn.disabled  = false;
    }

    v(id) { return document.getElementById(id)?.value?.trim() || ''; }

    // ══ DELETE ══════════════════════════════

    confirmDelete(id) {
        this.deletingId = id;
        document.getElementById('deleteModal').classList.add('open');
        document.getElementById('confirmDeleteBtn').onclick = () => this.deleteProject();
    }

    async deleteProject() {
        if (!this.deletingId) return;
        try {
            await firebaseService.deleteProject(this.deletingId);
            this.toast('🗑️ تم حذف المشروع','success');
            this.closeDeleteModal();
            await this.loadProjects();
        } catch (err) { this.toast('❌ فشل الحذف، حاول مجدداً','error'); }
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('open');
        this.deletingId = null;
    }

    // ══ TAGS ════════════════════════════════

    setupTagsInput() {
        const input = document.getElementById('tagsInput');
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = input.value.trim().replace(/,$/, '');
                if (tag && !this.currentTags.includes(tag)) { this.currentTags.push(tag); this.renderTags(); }
                input.value = '';
            }
        });
    }

    renderTags() {
        const container = document.getElementById('tagsContainer');
        const input     = document.getElementById('tagsInput');
        container.querySelectorAll('.tag-chip').forEach(c => c.remove());
        this.currentTags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.innerHTML = `${tag} <button type="button" onclick="admin.removeTag('${tag}')">×</button>`;
            container.insertBefore(chip, input);
        });
    }

    removeTag(tag) { this.currentTags = this.currentTags.filter(t => t !== tag); this.renderTags(); }

    // ══ IMAGE PREVIEW ════════════════════════

    previewImage(input, wrapId, previewId) {
        const file = input.files[0];
        if (!file) return;
        document.getElementById(previewId).src = URL.createObjectURL(file);
        document.getElementById(wrapId).classList.add('visible');
        document.getElementById('imageUrl').value = '';
    }

    previewFromUrl(url, wrapId, previewId) {
        const wrap = document.getElementById(wrapId);
        const prev = document.getElementById(previewId);
        if (url) { prev.src = url; wrap.classList.add('visible'); }
        else      { wrap.classList.remove('visible'); }
    }

    clearImage() {
        const wrap = document.getElementById('imgPreviewWrap');
        const prev = document.getElementById('imgPreview');
        if (wrap) wrap.classList.remove('visible');
        if (prev) prev.src = '';
        const fi = document.getElementById('imageFile');
        if (fi) fi.value = '';
        const ui = document.getElementById('imageUrl');
        if (ui) ui.value = '';
    }

    // ══ SCREENSHOTS ═════════════════════════

    previewScreenshots(input) {
        document.getElementById('screenshotFilesList').textContent =
            input.files.length > 0 ? `${input.files.length} صورة محددة` : '';
        const grid = document.getElementById('screenshotPreviewsGrid');
        grid.innerHTML = '';
        Array.from(input.files).forEach(file => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            grid.appendChild(img);
        });
    }

    renderScreenshotPreviews(urls) {
        document.getElementById('screenshotPreviewsGrid').innerHTML =
            urls.map(url => `<img src="${url}" loading="lazy">`).join('');
    }

    // ══ CLOUDINARY ══════════════════════════

    async uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('folder', 'portfolio-projects');
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {method:'POST',body:formData});
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
        return data.secure_url;
    }

    // ══ TOAST ═══════════════════════════════

    toast(msg, type = 'success') {
        const el = document.getElementById('adminToast');
        el.textContent = msg;
        el.className   = `show ${type}`;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => { el.className = ''; }, 3500);
    }
}

// ── Start ──────────────────────────────────────
const admin = new AdminManager();
document.addEventListener('DOMContentLoaded', () => admin.init());

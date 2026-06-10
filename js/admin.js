// ============================================
// ADMIN MANAGER - لوحة التحكم
// ============================================

class AdminManager {
    constructor() {
        this.projects = [];
        this.currentTags = [];
        this.editingId = null;
        this.deletingId = null;
    }

    // ============================================
    // INIT
    // ============================================

    init() {
        firebaseService.init();

        firebaseService.onAuthStateChanged(user => {
            if (user) {
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

    // ============================================
    // AUTH
    // ============================================

    setupLoginForm() {
        document.getElementById('loginForm').addEventListener('submit', async e => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            const errEl = document.getElementById('loginError');
            errEl.style.display = 'none';
            btn.innerHTML = '<span class="spinner"></span>';
            btn.disabled = true;

            try {
                const email = document.getElementById('loginEmail').value;
                const pass  = document.getElementById('loginPassword').value;
                await firebaseService.loginAdmin(email, pass);
            } catch (err) {
                errEl.textContent = 'بيانات الدخول غير صحيحة';
                errEl.style.display = 'block';
                btn.innerHTML = 'دخول';
                btn.disabled = false;
            }
        });
    }

    async logout() {
        await firebaseService.logoutAdmin();
    }

    showLogin()     { document.getElementById('loginScreen').style.display = 'flex'; document.getElementById('dashboard').style.display = 'none'; }
    showDashboard() { document.getElementById('loginScreen').style.display = 'none'; document.getElementById('dashboard').style.display = 'block'; }

    // ============================================
    // PROJECTS
    // ============================================

    async loadProjects() {
        this.projects = await firebaseService.getProjects();
        this.renderProjects();
        this.updateStats();
    }

    renderProjects() {
        const grid = document.getElementById('projectsGrid');

        if (this.projects.length === 0) {
            grid.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                    <p>لا توجد مشاريع بعد</p>
                    <button class="btn btn-primary" onclick="admin.openAddModal()">+ أضف أول مشروع</button>
                </div>`;
            return;
        }

        grid.innerHTML = this.projects.map(p => `
            <div class="proj-card">
                ${p.image
                    ? `<img class="proj-card-img" src="${p.image}" alt="${p.title?.ar || ''}" loading="lazy">`
                    : `<div class="proj-card-img-placeholder">📷</div>`
                }
                <div class="proj-card-body">
                    <div class="proj-card-top">
                        <div class="proj-card-title">${p.title?.ar || 'بلا عنوان'}</div>
                    </div>
                    <div class="badges">
                        <span class="badge badge-${p.category}">${this.categoryLabel(p.category)}</span>
                        ${p.featured ? `<span class="badge badge-featured">⭐ مميز</span>` : ''}
                    </div>
                    <p style="font-size:.8rem;color:var(--text2);margin-bottom:10px;line-height:1.5">
                        ${(p.description?.ar || '').substring(0, 80)}${(p.description?.ar || '').length > 80 ? '...' : ''}
                    </p>
                    <div class="proj-card-actions">
                        <button class="btn btn-ghost btn-sm" onclick="admin.openEditModal('${p.id}')">
                            ✏️ تعديل
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="admin.confirmDelete('${p.id}')">
                            🗑️ حذف
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateStats() {
        const p = this.projects;
        document.getElementById('statTotal').textContent    = p.length;
        document.getElementById('statFlutter').textContent  = p.filter(x => x.category === 'flutter').length;
        document.getElementById('statUiux').textContent     = p.filter(x => x.category === 'uiux').length;
        document.getElementById('statGraphics').textContent = p.filter(x => x.category === 'graphics').length;
        document.getElementById('statFeatured').textContent = p.filter(x => x.featured).length;
    }

    categoryLabel(c) {
        return { flutter: 'Flutter', uiux: 'UI/UX', graphics: 'جرافيك' }[c] || c;
    }

    // ============================================
    // ADD / EDIT MODAL
    // ============================================

    openAddModal() {
        this.editingId = null;
        this.currentTags = [];
        document.getElementById('modalTitle').textContent = 'إضافة مشروع جديد';
        document.getElementById('projectForm').reset();
        document.getElementById('projectId').value = '';
        document.getElementById('imgPreview').style.display = 'none';
        this.renderTags();
        document.getElementById('projectModal').classList.add('open');
    }

    openEditModal(id) {
        const p = this.projects.find(x => x.id === id);
        if (!p) return;

        this.editingId = id;
        this.currentTags = [...(p.tags || [])];

        document.getElementById('modalTitle').textContent = 'تعديل المشروع';
        document.getElementById('projectId').value = id;

        // Basic
        document.getElementById('titleAr').value   = p.title?.ar || '';
        document.getElementById('titleEn').value   = p.title?.en || '';
        document.getElementById('category').value  = p.category || '';
        document.getElementById('projectDate').value = p.date || '';
        document.getElementById('roleAr').value    = p.role?.ar || '';
        document.getElementById('roleEn').value    = p.role?.en || '';
        document.getElementById('featured').checked = !!p.featured;
        document.getElementById('order').value     = p.order ?? 10;

        // Image
        document.getElementById('imageUrl').value  = p.image || '';
        const prev = document.getElementById('imgPreview');
        if (p.image) { prev.src = p.image; prev.style.display = 'block'; }
        else         { prev.style.display = 'none'; }

        // Description
        document.getElementById('descAr').value     = p.description?.ar || '';
        document.getElementById('descEn').value     = p.description?.en || '';
        document.getElementById('fullDescAr').value = p.fullDescription?.ar || '';
        document.getElementById('fullDescEn').value = p.fullDescription?.en || '';

        // Features
        document.getElementById('featuresAr').value = (p.features?.ar || []).join('\n');
        document.getElementById('featuresEn').value = (p.features?.en || []).join('\n');

        // Links
        document.getElementById('linkGithub').value   = p.links?.github   || '';
        document.getElementById('linkPlaystore').value= p.links?.playstore || '';
        document.getElementById('linkAppstore').value = p.links?.appstore  || '';
        document.getElementById('linkFigma').value    = p.links?.figma     || '';
        document.getElementById('linkBehance').value  = p.links?.behance   || '';
        document.getElementById('linkDemo').value     = p.links?.demo      || '';

        this.renderTags();
        document.getElementById('projectModal').classList.add('open');
    }

    closeModal() {
        document.getElementById('projectModal').classList.remove('open');
    }

    // ============================================
    // SAVE
    // ============================================

    async handleSubmit(e) {
        e.preventDefault();

        const btn = document.getElementById('submitBtn');
        btn.innerHTML = '<span class="spinner"></span> جارٍ الحفظ...';
        btn.disabled = true;

        try {
            // رفع الصورة إذا تم اختيار ملف
            let imageUrl = document.getElementById('imageUrl').value.trim();
            const imageFile = document.getElementById('imageFile').files[0];
            if (imageFile) {
                try {
                    imageUrl = await firebaseService.uploadImage(imageFile, 'project-images');
                } catch (uploadErr) {
                    this.toast('تعذّر رفع الصورة — تحقق من تفعيل Firebase Storage', 'error');
                }
            }

            const data = {
                title:           { ar: this.v('titleAr'), en: this.v('titleEn') },
                description:     { ar: this.v('descAr'),  en: this.v('descEn')  },
                fullDescription: { ar: this.v('fullDescAr'), en: this.v('fullDescEn') },
                category:        this.v('category'),
                image:           imageUrl,
                tags:            [...this.currentTags],
                featured:        document.getElementById('featured').checked,
                date:            this.v('projectDate'),
                order:           parseInt(document.getElementById('order').value) || 10,
                role:            { ar: this.v('roleAr'), en: this.v('roleEn') },
                features: {
                    ar: this.v('featuresAr').split('\n').map(s => s.trim()).filter(Boolean),
                    en: this.v('featuresEn').split('\n').map(s => s.trim()).filter(Boolean)
                },
                links: {
                    github:    this.v('linkGithub'),
                    playstore: this.v('linkPlaystore'),
                    appstore:  this.v('linkAppstore'),
                    figma:     this.v('linkFigma'),
                    behance:   this.v('linkBehance'),
                    demo:      this.v('linkDemo')
                }
            };

            // إزالة الروابط الفارغة
            Object.keys(data.links).forEach(k => { if (!data.links[k]) delete data.links[k]; });

            if (this.editingId) {
                await firebaseService.updateProject(this.editingId, data);
                this.toast('تم تحديث المشروع ✓', 'success');
            } else {
                await firebaseService.addProject(data);
                this.toast('تمت إضافة المشروع ✓', 'success');
            }

            this.closeModal();
            await this.loadProjects();

        } catch (err) {
            console.error(err);
            this.toast('حدث خطأ، حاول مجدداً', 'error');
        }

        btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> حفظ المشروع';
        btn.disabled = false;
    }

    v(id) { return document.getElementById(id)?.value?.trim() || ''; }

    // ============================================
    // DELETE
    // ============================================

    confirmDelete(id) {
        this.deletingId = id;
        document.getElementById('deleteModal').classList.add('open');
        document.getElementById('confirmDeleteBtn').onclick = () => this.deleteProject();
    }

    async deleteProject() {
        if (!this.deletingId) return;
        try {
            await firebaseService.deleteProject(this.deletingId);
            this.toast('تم حذف المشروع', 'success');
            this.closeDeleteModal();
            await this.loadProjects();
        } catch (err) {
            this.toast('فشل الحذف، حاول مجدداً', 'error');
        }
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').classList.remove('open');
        this.deletingId = null;
    }

    // ============================================
    // TAGS
    // ============================================

    setupTagsInput() {
        const input = document.getElementById('tagsInput');
        input.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const tag = input.value.trim().replace(/,$/, '');
                if (tag && !this.currentTags.includes(tag)) {
                    this.currentTags.push(tag);
                    this.renderTags();
                }
                input.value = '';
            }
        });
    }

    renderTags() {
        const container = document.getElementById('tagsContainer');
        const input = document.getElementById('tagsInput');
        // إزالة chips القديمة
        container.querySelectorAll('.tag-chip').forEach(c => c.remove());
        // إضافة chips جديدة قبل input
        this.currentTags.forEach(tag => {
            const chip = document.createElement('span');
            chip.className = 'tag-chip';
            chip.innerHTML = `${tag} <button type="button" onclick="admin.removeTag('${tag}')">×</button>`;
            container.insertBefore(chip, input);
        });
    }

    removeTag(tag) {
        this.currentTags = this.currentTags.filter(t => t !== tag);
        this.renderTags();
    }

    // ============================================
    // IMAGE PREVIEW
    // ============================================

    previewImage(input, previewId) {
        const file = input.files[0];
        if (!file) return;
        const prev = document.getElementById(previewId);
        prev.src = URL.createObjectURL(file);
        prev.style.display = 'block';
        document.getElementById('imageUrl').value = '';
    }

    previewFromUrl(url, previewId) {
        const prev = document.getElementById(previewId);
        if (url) { prev.src = url; prev.style.display = 'block'; }
        else      { prev.style.display = 'none'; }
    }

    // ============================================
    // TOAST
    // ============================================

    toast(msg, type = 'success') {
        const el = document.getElementById('adminToast');
        el.textContent = msg;
        el.className = `show ${type}`;
        setTimeout(() => { el.className = ''; }, 3000);
    }
}

// ── Start ──────────────────────────────────────
const admin = new AdminManager();
document.addEventListener('DOMContentLoaded', () => admin.init());

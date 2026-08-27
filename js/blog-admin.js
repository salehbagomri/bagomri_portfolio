// ============================================
// BLOG ADMIN - إدارة المقالات من لوحة التحكم
// js/blog-admin.js
// ============================================

class BlogAdminManager {
    constructor() {
        this.articles      = [];
        this.deletingId    = null;
        this.editingId     = null;
        this._activeFilter = 'all';
    }

    // ── Init (called after auth succeeds) ─────────────────
    init() {
        this.loadArticles();
        document.getElementById('confirmArticleDeleteBtn')
            .addEventListener('click', () => this.confirmDelete());
    }

    // ── Filter & Search ────────────────────────────────────
    filterArticles() { this.renderTable(); }

    setFilter(filter, btn) {
        this._activeFilter = filter;
        document.querySelectorAll('#page-articles .filter-chip').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        this.renderTable();
    }

    // ── Load articles from Firestore ───────────────────────
    async loadArticles() {
        const tbody = document.getElementById('articlesBody');
        if (!tbody) return;

        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:var(--text2)">
            <div class="spinner" style="margin:0 auto"></div>
        </td></tr>`;

        try {
            const snapshot = await firebaseService.db
                .collection('articles')
                .orderBy('publishedAt', 'desc')
                .get();

            this.articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            this.renderTable();
        } catch (err) {
            console.error('❌ loadArticles:', err);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#EF4444">
                خطأ في تحميل المقالات</td></tr>`;
        }
    }

    // ── Render articles table ──────────────────────────────
    renderTable() {
        const tbody = document.getElementById('articlesBody');
        if (!tbody) return;

        // Update nav badge
        const badge = document.getElementById('navBadgeArticles');
        if (badge) badge.textContent = this.articles.length;

        // Apply filter
        const search = (document.getElementById('articleSearch')?.value || '').toLowerCase();
        let list = this.articles;

        if (this._activeFilter === 'published') list = list.filter(a => a.published);
        else if (this._activeFilter === 'draft') list = list.filter(a => !a.published);

        if (search) {
            list = list.filter(a =>
                (a.titleAr || '').toLowerCase().includes(search) ||
                (a.titleEn || '').toLowerCase().includes(search) ||
                (a.slug || '').toLowerCase().includes(search)
            );
        }

        if (list.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:48px;color:var(--text-secondary)">
                <div style="font-size:2.5rem;margin-bottom:12px;opacity:.4">📝</div>
                ${this.articles.length === 0 ? 'لا توجد مقالات بعد. اضغط "إضافة مقال" للبدء.' : 'لا توجد نتائج تطابق البحث.'}
            </td></tr>`;
            return;
        }

        tbody.innerHTML = list.map(a => {
            const date = a.publishedAt
                ? (a.publishedAt.toDate ? a.publishedAt.toDate() : new Date(a.publishedAt))
                    .toLocaleDateString('ar-SA', { year:'numeric', month:'short', day:'numeric' })
                : '-';

            const thumb = a.coverImage
                ? `<img class="art-thumb" src="${a.coverImage}" loading="lazy">`
                : `<div class="art-thumb-ph">📄</div>`;

            const statusPill = a.published
                ? `<span class="status-pill status-published"><span class="status-dot"></span> منشور</span>`
                : `<span class="status-pill status-draft"><span class="status-dot"></span> مسودة</span>`;

            const catLabel = a.categoryLabelAr || a.category || '-';

            return `<tr>
                <td>
                    <div class="art-title-cell">
                        ${thumb}
                        <div>
                            <div class="art-title-text">${a.titleAr || ''}
                                <a href="article.html?slug=${a.slug}" target="_blank" style="color:var(--accent-light);font-size:.75rem;margin-right:6px">↗</a>
                            </div>
                            <span class="art-slug">${a.slug || ''}</span>
                        </div>
                    </div>
                </td>
                <td style="color:var(--text-secondary);font-size:.82rem">${catLabel}</td>
                <td style="color:var(--text-secondary);font-size:.82rem">${a.readTime || '-'} د</td>
                <td style="color:var(--text-secondary);font-size:.82rem">${date}</td>
                <td>${statusPill}</td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                        <button class="btn btn-ghost btn-sm" onclick="blogAdmin.openEditModal('${a.id}')">✏️</button>
                        <button class="btn btn-ghost btn-sm" onclick="blogAdmin.togglePublish('${a.id}',${!a.published})">
                            ${a.published ? '⏸' : '▶'}
                        </button>
                        <button class="btn btn-sm" style="background:var(--danger);color:#fff" onclick="blogAdmin.openDeleteModal('${a.id}')">🗑️</button>
                    </div>
                </td>
            </tr>`;
        }).join('');

        // Sync overview stats
        if (typeof admin !== 'undefined') admin.updateOverview();
    }

    // ── Open add modal ─────────────────────────────────────
    openAddModal() {
        this.editingId = null;
        document.getElementById('articleModalTitle').textContent = 'إضافة مقال جديد';
        document.getElementById('articleForm').reset();
        document.getElementById('articleId').value = '';
        document.getElementById('artPublished').checked = true;
        this.clearCover();
        document.getElementById('articleModal').classList.add('open');
    }

    // ── Open edit modal ────────────────────────────────────
    openEditModal(id) {
        const article = this.articles.find(a => a.id === id);
        if (!article) return;

        this.editingId = id;
        document.getElementById('articleModalTitle').textContent = 'تعديل المقال';
        document.getElementById('articleId').value          = id;
        document.getElementById('artTitleAr').value         = article.titleAr   || '';
        document.getElementById('artTitleEn').value         = article.titleEn   || '';
        document.getElementById('artSlug').value            = article.slug      || '';
        document.getElementById('artCategory').value        = article.category  || '';
        document.getElementById('artCategoryLabelAr').value = article.categoryLabelAr || '';
        document.getElementById('artCategoryLabelEn').value = article.categoryLabelEn || '';
        document.getElementById('artReadTime').value        = article.readTime  || 5;
        document.getElementById('artPublished').checked     = !!article.published;
        document.getElementById('artExcerptAr').value       = article.excerptAr || '';
        document.getElementById('artExcerptEn').value       = article.excerptEn || '';
        document.getElementById('artContentAr').value       = article.contentAr || '';
        document.getElementById('artContentEn').value       = article.contentEn || '';

        const coverUrl = article.coverImage || '';
        document.getElementById('artCoverUrl').value = coverUrl;
        if (coverUrl) {
            document.getElementById('artCoverPreview').src = coverUrl;
            document.getElementById('artCoverPreviewWrap').classList.add('visible');
        } else { this.clearCover(); }

        document.getElementById('articleModal').classList.add('open');
    }

    // ── Close modal ────────────────────────────────────────
    closeModal() {
        document.getElementById('articleModal').classList.remove('open');
    }

    // ── Image Preview ──────────────────────────────────────
    previewCover(input) {
        const file = input.files[0];
        if (!file) return;
        document.getElementById('artCoverPreview').src = URL.createObjectURL(file);
        document.getElementById('artCoverPreviewWrap').classList.add('visible');
        document.getElementById('artCoverUrl').value = '';
    }

    previewFromUrl(url) {
        if (url && url.trim()) {
            document.getElementById('artCoverPreview').src = url.trim();
            document.getElementById('artCoverPreviewWrap').classList.add('visible');
        } else {
            document.getElementById('artCoverPreviewWrap').classList.remove('visible');
        }
    }

    clearCover() {
        const wrap = document.getElementById('artCoverPreviewWrap');
        const prev = document.getElementById('artCoverPreview');
        if (wrap) wrap.classList.remove('visible');
        if (prev) prev.src = '';
        const fi = document.getElementById('artCoverFile');
        if (fi) fi.value = '';
        const ui = document.getElementById('artCoverUrl');
        if (ui) ui.value = '';
    }

    // ── Upload to Cloudinary ───────────────────────────────
    async uploadToCloudinary(file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', typeof CLOUDINARY_UPLOAD_PRESET !== 'undefined' ? CLOUDINARY_UPLOAD_PRESET : 'pre-pro');
        formData.append('folder', 'portfolio-articles');

        const cloudName = typeof CLOUDINARY_CLOUD_NAME !== 'undefined' ? CLOUDINARY_CLOUD_NAME : 'dk5buckt1';
        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: 'POST', body: formData }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || 'فشل رفع الصورة إلى Cloudinary');
        return data.secure_url;
    }

    // ── Submit (add or update) ─────────────────────────────
    async handleSubmit(e) {
        if (e) e.preventDefault();

        const titleAr = document.getElementById('artTitleAr').value.trim();
        const titleEn = document.getElementById('artTitleEn').value.trim();
        const slug    = document.getElementById('artSlug').value.trim()
            .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (!titleAr || !titleEn || !slug) {
            this._toast('يرجى ملء الحقول الإلزامية', 'error');
            return;
        }

        const submitBtn = document.querySelector('#articleModal .btn-primary');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner"></span>';

        try {
            // Handle image upload or URL
            let coverImage = document.getElementById('artCoverUrl').value.trim();
            const coverFile = document.getElementById('artCoverFile').files[0];
            if (coverFile) {
                this._toast('جارٍ رفع الصورة المصغرة...', 'success');
                coverImage = await this.uploadToCloudinary(coverFile);
            }

            const data = {
                titleAr,
                titleEn,
                slug,
                coverImage:       coverImage || '',
                category:         document.getElementById('artCategory').value,
                categoryLabelAr:  document.getElementById('artCategoryLabelAr').value.trim(),
                categoryLabelEn:  document.getElementById('artCategoryLabelEn').value.trim(),
                readTime:         parseInt(document.getElementById('artReadTime').value) || 5,
                published:        document.getElementById('artPublished').checked,
                excerptAr:        document.getElementById('artExcerptAr').value.trim(),
                excerptEn:        document.getElementById('artExcerptEn').value.trim(),
                contentAr:        document.getElementById('artContentAr').value,
                contentEn:        document.getElementById('artContentEn').value,
                updatedAt:        firebase.firestore.FieldValue.serverTimestamp(),
            };

            const col = firebaseService.db.collection('articles');

            if (this.editingId) {
                await col.doc(this.editingId).update(data);
                this._toast('✅ تم تحديث المقال بنجاح', 'success');
            } else {
                data.publishedAt = firebase.firestore.FieldValue.serverTimestamp();
                await col.add(data);
                this._toast('✅ تم إضافة المقال بنجاح', 'success');
            }

            this.closeModal();
            await this.loadArticles();
        } catch (err) {
            console.error('❌ handleSubmit:', err);
            this._toast('❌ حدث خطأ: ' + err.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> حفظ المقال`;
        }
    }

    // ── Toggle publish/draft ───────────────────────────────
    async togglePublish(id, newState) {
        try {
            await firebaseService.db.collection('articles').doc(id).update({
                published: newState,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            this._toast(newState ? '✅ تم نشر المقال' : '⏸ تم إخفاء المقال', 'success');
            await this.loadArticles();
        } catch (err) {
            this._toast('❌ خطأ في التغيير', 'error');
        }
    }

    // ── Delete flow ────────────────────────────────────────
    openDeleteModal(id) {
        this.deletingId = id;
        document.getElementById('articleDeleteModal').classList.add('open');
    }

    closeDeleteModal() {
        this.deletingId = null;
        document.getElementById('articleDeleteModal').classList.remove('open');
    }

    async confirmDelete() {
        if (!this.deletingId) return;
        try {
            await firebaseService.db.collection('articles').doc(this.deletingId).delete();
            this._toast('🗑️ تم حذف المقال', 'success');
            this.closeDeleteModal();
            await this.loadArticles();
        } catch (err) {
            this._toast('❌ خطأ في الحذف', 'error');
        }
    }

    // ── Toast notification ─────────────────────────────────
    _toast(msg, type = 'success') {
        const el = document.getElementById('adminToast');
        if (!el) return;
        el.textContent = msg;
        el.className = `show ${type}`;
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => el.className = '', 3000);
    }
}

// Global instance
const blogAdmin = new BlogAdminManager();

// Hook into admin init — called after Firebase auth succeeds
const _origShowDashboard = AdminManager.prototype.showDashboard;
AdminManager.prototype.showDashboard = function () {
    _origShowDashboard.call(this);
    blogAdmin.init();
};

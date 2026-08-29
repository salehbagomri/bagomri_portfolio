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

        // 1. Try fast authenticated REST API (100ms response)
        try {
            const token = (typeof firebase !== 'undefined' && firebase.auth() && firebase.auth().currentUser)
                ? await firebase.auth().currentUser.getIdToken()
                : null;
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const url = `https://firestore.googleapis.com/v1/projects/${firebaseService.projectId}/databases/(default)/documents/articles`;
            const res = await fetch(url, { headers });
            if (res.ok) {
                const json = await res.json();
                const docs = (json.documents || []).map(doc => firebaseService._parseFirestoreDoc(doc));
                docs.sort((a, b) => {
                    const dateA = new Date(a.createdAt || a.publishedAt || 0).getTime();
                    const dateB = new Date(b.createdAt || b.publishedAt || 0).getTime();
                    return dateB - dateA;
                });
                this.articles = docs;
                this.renderTable();
                return;
            }
        } catch (restErr) {
            console.warn('⚠️ REST loadArticles fallback to SDK:', restErr.message);
        }

        // 2. Fallback to SDK
        try {
            if (firebaseService.db) {
                const snapshot = await firebaseService.db
                    .collection('articles')
                    .orderBy('publishedAt', 'desc')
                    .get();

                this.articles = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                this.renderTable();
                return;
            }
        } catch (err) {
            console.error('❌ loadArticles SDK error:', err);
        }

        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:#EF4444">
            خطأ في تحميل المقالات</td></tr>`;
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
                : `<div class="art-thumb-ph"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div>`;

            const statusPill = a.published
                ? `<span class="status-pill status-published"><span class="status-dot"></span> منشور</span>`
                : `<span class="status-pill status-draft"><span class="status-dot"></span> مسودة</span>`;

            const catLabel = a.categoryLabelAr || a.category || '-';
            const extLink  = `<a href="article.html?slug=${a.slug}" target="_blank" style="color:var(--brand);font-size:.75rem;margin-right:6px">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>`;

            const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;
            const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
            const playIcon  = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
            const trashIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`;

            return `<tr>
                <td>
                    <div class="art-title-cell">
                        ${thumb}
                        <div>
                            <div class="art-title-text">${a.titleAr || ''} ${extLink}</div>
                            <span class="art-slug">${a.slug || ''}</span>
                        </div>
                    </div>
                </td>
                <td style="color:var(--text-muted);font-size:.82rem">${catLabel}</td>
                <td style="color:var(--text-muted);font-size:.82rem">${a.readTime || '-'} د</td>
                <td style="color:var(--text-muted);font-size:.82rem">${date}</td>
                <td>${statusPill}</td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                        <button class="btn btn-outline" style="padding:6px 10px" onclick="blogAdmin.openEditModal('${a.id}')" title="تعديل">${editIcon}</button>
                        <button class="btn btn-outline" style="padding:6px 10px" onclick="blogAdmin.togglePublish('${a.id}',${!a.published})" title="${a.published ? 'إخفاء' : 'نشر'}">
                            ${a.published ? pauseIcon : playIcon}
                        </button>
                        <button class="btn" style="background:var(--error-bg);color:var(--error);border:1.5px solid var(--error);padding:6px 10px" onclick="blogAdmin.openDeleteModal('${a.id}')" title="حذف">${trashIcon}</button>
                    </div>
                </td>
            </tr>`;
        }).join('');
        lucide.createIcons();
    }

    // ── Open add modal ─────────────────────────────────────
    openAddModal() {
        this.editingId = null;
        document.getElementById('articleModalTitle').textContent = 'إضافة مقال جديد';
        document.getElementById('articleForm').reset();
        document.getElementById('articleId').value = '';
        document.getElementById('artPublished').checked = true;
        const preview = document.getElementById('artSlugPreview');
        if (preview) preview.textContent = '';
        this.clearCover();
        document.getElementById('articleModal').classList.add('open');

        // Wire auto-slug from English title (on new article only)
        const enTitle = document.getElementById('artTitleEn');
        const slugField = document.getElementById('artSlug');
        if (enTitle && slugField) {
            enTitle.oninput = () => {
                if (!this.editingId) {
                    const auto = this._slugify(enTitle.value);
                    slugField.value = auto;
                    this._updateSlugPreview(auto);
                }
            };
        }
    }

    // ── Slugify helper ─────────────────────────────────────
    _slugify(str) {
        return str.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .slice(0, 80);
    }

    // ── Update slug preview ────────────────────────────────
    _updateSlugPreview(slug) {
        const preview = document.getElementById('artSlugPreview');
        if (!preview) return;
        preview.textContent = slug ? `bagomri.com/blog/${slug}` : '';
    }

    // ── Slug manual edit ───────────────────────────────────
    _onSlugInput(input) {
        const cleaned = input.value.toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-');
        input.value = cleaned;
        this._updateSlugPreview(cleaned);
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

        if (!titleAr && !titleEn) {
            this._toast('يرجى كتابة عنوان المقال بالعربي أو الإنجليزي على الأقل', 'error');
            document.getElementById('artTitleAr').focus();
            return;
        }
        if (!slug) {
            this._toast('يرجى إدخال رابط المقال (Slug)', 'error');
            document.getElementById('artSlug').focus();
            return;
        }
        // Check duplicate slug on new articles only
        if (!this.editingId) {
            const existing = this.articles.find(a => a.slug === slug);
            if (existing) {
                this._toast(`⚠️ الـ Slug "${slug}" مستخدم بالفعل في مقال آخر`, 'error');
                document.getElementById('artSlug').focus();
                return;
            }
        }

        const submitBtn = document.getElementById('articleSubmitBtn') || document.querySelector('#articleModal .btn-brand');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> جارٍ الحفظ...';
        }

        try {
            // Handle image upload or URL
            let coverImage = document.getElementById('artCoverUrl').value.trim();
            const coverFile = document.getElementById('artCoverFile').files[0];
            if (coverFile) {
                this._toast('جارٍ رفع الصورة المصغرة...', 'success');
                coverImage = await this.uploadToCloudinary(coverFile);
            }

            const isPublished = document.getElementById('artPublished').checked;
            const data = {
                titleAr,
                titleEn,
                slug,
                author:           'Saleh Bagomri',
                coverImage:       coverImage || '',
                category:         document.getElementById('artCategory').value,
                categoryLabelAr:  document.getElementById('artCategoryLabelAr').value.trim(),
                categoryLabelEn:  document.getElementById('artCategoryLabelEn').value.trim(),
                readTime:         parseInt(document.getElementById('artReadTime').value) || 5,
                published:        isPublished,
                excerptAr:        document.getElementById('artExcerptAr').value.trim(),
                excerptEn:        document.getElementById('artExcerptEn').value.trim(),
                contentAr:        document.getElementById('artContentAr').value,
                contentEn:        document.getElementById('artContentEn').value,
                // updatedAt: null on new articles, set on edits only
                updatedAt:        this.editingId ? firebase.firestore.FieldValue.serverTimestamp() : null,
            };

            const col = firebaseService.db.collection('articles');

            if (this.editingId) {
                // On edit: preserve original publishedAt, only update updatedAt
                await col.doc(this.editingId).update(data);
                this._toast('✅ تم تحديث المقال بنجاح', 'success');
            } else {
                // On create: set publishedAt only if published (not a draft)
                data.publishedAt = isPublished
                    ? firebase.firestore.FieldValue.serverTimestamp()
                    : null;
                await col.add(data);
                this._toast(isPublished ? '✅ تم نشر المقال بنجاح' : '📝 تم حفظ المسودة', 'success');
            }

            this.closeModal();
            await this.loadArticles();
        } catch (err) {
            console.error('❌ handleSubmit:', err);
            this._toast('❌ حدث خطأ: ' + err.message, 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> حفظ المقال`;
            }
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

// Hook into admin init - called after Firebase auth succeeds
const _origShowDashboard = AdminManager.prototype.showDashboard;
AdminManager.prototype.showDashboard = function () {
    _origShowDashboard.call(this);
    blogAdmin.init();
};

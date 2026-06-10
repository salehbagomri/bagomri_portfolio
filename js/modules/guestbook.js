// ============================================
// GUESTBOOK MODULE - وحدة دفتر الزوار
// ============================================

class GuestbookManager {
    constructor() {
        this.commentForm = null;
        this.commentsList = null;
        this.commentsListener = null;
        this.loadedCommentIds = new Set();
        this.initialCommentsCount = 6; // عرض 6 تعليقات أولاً
        this.allComments = [];
        this.isExpanded = false;
    }

    init() {
        this.commentForm = document.getElementById('commentForm');
        this.commentsList = document.getElementById('commentsList');

        if (this.commentForm) {
            this.setupCommentForm();
        }

        if (this.commentsList) {
            this.loadComments();
            this.setupRealtimeListener();
            this.setupReactionHandlers();
        }
    }

    // ============================================
    // REACTIONS SETUP
    // ============================================
    
    setupReactionHandlers() {
        // استخدام event delegation للأزرار الديناميكية
        document.addEventListener('click', async (e) => {
            const reactionBtn = e.target.closest('.reaction-btn');
            if (reactionBtn && this.commentsList.contains(reactionBtn)) {
                e.preventDefault();
                await this.handleReaction(reactionBtn);
            }
        });
    }

    async handleReaction(button) {
        const commentId = button.dataset.commentId;
        const reactionType = button.dataset.reaction;
        const visitorId = firebaseService.getOrCreateVisitorId();

        // تعطيل الزر مؤقتاً
        button.disabled = true;

        try {
            const result = await firebaseService.toggleReaction(commentId, reactionType, visitorId);
            
            // تحديث UI
            const commentCard = button.closest('.comment-card');
            if (commentCard) {
                const allBtns = commentCard.querySelectorAll('.reaction-btn');
                allBtns.forEach(btn => btn.classList.remove('active'));
                
                if (result.action === 'added' || result.action === 'changed') {
                    button.classList.add('active');
                }
                
                // تحديث العدادات
                const likeBtn = commentCard.querySelector('[data-reaction="like"]');
                const loveBtn = commentCard.querySelector('[data-reaction="love"]');
                const fireBtn = commentCard.querySelector('[data-reaction="fire"]');
                
                if (likeBtn) likeBtn.querySelector('.reaction-count').textContent = result.reactions.like || 0;
                if (loveBtn) loveBtn.querySelector('.reaction-count').textContent = result.reactions.love || 0;
                if (fireBtn) fireBtn.querySelector('.reaction-count').textContent = result.reactions.fire || 0;
            }
        } catch (error) {
            console.error('Error handling reaction:', error);
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'حدث خطأ، حاول مرة أخرى'
                : 'An error occurred, please try again';
            notificationManager.error(message);
        } finally {
            button.disabled = false;
        }
    }

    // ============================================
    // COMMENT FORM - نموذج التعليق
    // ============================================

    setupCommentForm() {
        this.commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCommentSubmit();
        });
    }

    async handleCommentSubmit() {
        const nameInput = document.getElementById('commentName');
        const textInput = document.getElementById('commentText');
        const submitBtn = this.commentForm.querySelector('button[type="submit"]');

        const name = nameInput.value.trim();
        const text = textInput.value.trim();

        // التحقق
        if (!name || !text) {
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'الرجاء ملء جميع الحقول'
                : 'Please fill all fields';
            notificationManager.error(message);
            return;
        }

        // تعطيل الزر أثناء الإرسال
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        try {
            // إضافة التعليق إلى Firebase
            await firebaseService.addComment(name, text);

            // رسالة نجاح
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'تم إضافة تعليقك بنجاح!'
                : 'Your comment was added successfully!';
            notificationManager.success(message);

            // مسح النموذج
            nameInput.value = '';
            textInput.value = '';

        } catch (error) {
            console.error('Error submitting comment:', error);
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'حدث خطأ، حاول مرة أخرى'
                : 'An error occurred, please try again';
            notificationManager.error(message);
        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    // ============================================
    // LOAD COMMENTS - تحميل التعليقات
    // ============================================

    async loadComments() {
        try {
            const comments = await firebaseService.getComments(50, 'trending');
            
            this.allComments = comments;
            this.displayComments(comments);
            
        } catch (error) {
            console.error('❌ Error loading comments:', error);
            this.showEmptyState();
        }
    }

    displayComments(comments) {
        if (!comments || comments.length === 0) {
            this.showEmptyState();
            return;
        }

        const currentLang = languageManager.getCurrentLanguage();
        const visibleComments = comments.slice(0, this.initialCommentsCount);
        const hiddenComments = comments.slice(this.initialCommentsCount);

        // عرض جميع التعليقات في Grid واحد
        let html = '';
        
        // التعليقات المرئية
        visibleComments.forEach(comment => {
            if (comment.id) this.loadedCommentIds.add(comment.id);
            html += this.createCommentHTML(comment, false);
        });
        
        // التعليقات المخفية
        hiddenComments.forEach(comment => {
            if (comment.id) this.loadedCommentIds.add(comment.id);
            html += this.createCommentHTML(comment, true);
        });

        this.commentsList.innerHTML = html;
        
        // إضافة زر الكشف بعد Grid إذا كان هناك تعليقات مخفية
        if (hiddenComments.length > 0) {
            const revealSection = document.createElement('div');
            revealSection.setAttribute('class', 'reveal-comments-section');
            
            const buttonHTML = '<button class="btn-reveal-comments glass-effect" id="revealCommentsBtn">' +
                '<span class="reveal-icon">' +
                '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<line x1="12" y1="8" x2="12" y2="16"></line>' +
                '<line x1="8" y1="12" x2="16" y2="12"></line>' +
                '</svg>' +
                '</span>' +
                '<span class="reveal-text" data-ar="اكتشف ' + hiddenComments.length + ' تعليق آخر" data-en="Discover ' + hiddenComments.length + ' more comments">' +
                'اكتشف ' + hiddenComments.length + ' تعليق آخر' +
                '</span>' +
                '<span class="reveal-count">' + hiddenComments.length + '</span>' +
                '</button>' +
                '<div class="reveal-hint" data-ar="تعليقات رائعة بانتظارك!" data-en="Amazing comments awaiting you!">' +
                'تعليقات رائعة بانتظارك!' +
                '</div>';
            
            revealSection.innerHTML = buttonHTML;
            this.commentsList.parentElement.insertBefore(revealSection, this.commentsList.nextSibling);
        }
        
        // إضافة event listener للزر
        const revealBtn = document.getElementById('revealCommentsBtn');
        if (revealBtn) {
            revealBtn.addEventListener('click', () => this.toggleHiddenComments());
        }
    }

    toggleHiddenComments() {
        this.isExpanded = !this.isExpanded;
        const hiddenComments = document.querySelectorAll('.hidden-comment');
        const revealSection = document.querySelector('.reveal-comments-section');
        
        if (this.isExpanded) {
            // إظهار التعليقات المخفية
            hiddenComments.forEach(comment => {
                comment.classList.add('visible');
            });
            
            // إخفاء زر الكشف
            if (revealSection) {
                revealSection.style.opacity = '0';
                revealSection.style.pointerEvents = 'none';
                setTimeout(() => {
                    revealSection.style.display = 'none';
                }, 300);
            }
        } else {
            // إخفاء التعليقات
            hiddenComments.forEach(comment => {
                comment.classList.remove('visible');
            });
            
            // إظهار زر الكشف
            if (revealSection) {
                revealSection.style.display = 'block';
                setTimeout(() => {
                    revealSection.style.opacity = '1';
                    revealSection.style.pointerEvents = 'auto';
                }, 10);
            }
        }
    }

    createCommentHTML(comment, isHidden = false) {
        const avatar = comment.name.charAt(0).toUpperCase();
        const timeAgo = this.getTimeAgo(comment.timestamp);
        const visitorId = firebaseService.getOrCreateVisitorId();
        const userReaction = comment.reactedBy?.find(r => r.visitorId === visitorId);

        const reactions = comment.reactions || { like: 0, love: 0, fire: 0 };
        const hiddenClass = isHidden ? ' hidden-comment' : '';

        return `
            <div class="comment-card glass-effect${hiddenClass}" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">
                        <div class="author-avatar">${avatar}</div>
                        <div class="author-info">
                            <div class="author-name">${this.escapeHtml(comment.name)}</div>
                            <div class="comment-date">${timeAgo}</div>
                        </div>
                    </div>
                </div>
                <p class="comment-text">${this.escapeHtml(comment.text)}</p>
                <div class="comment-reactions">
                    <div class="reaction-group">
                        <button class="reaction-btn ${userReaction?.type === 'like' ? 'active' : ''}" 
                                data-reaction="like" 
                                data-comment-id="${comment.id}">
                            <span class="reaction-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                                </svg>
                            </span>
                            <span class="reaction-count">${reactions.like || 0}</span>
                        </button>
                        <button class="reaction-btn ${userReaction?.type === 'love' ? 'active' : ''}" 
                                data-reaction="love" 
                                data-comment-id="${comment.id}">
                            <span class="reaction-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                            </span>
                            <span class="reaction-count">${reactions.love || 0}</span>
                        </button>
                        <button class="reaction-btn ${userReaction?.type === 'fire' ? 'active' : ''}" 
                                data-reaction="fire" 
                                data-comment-id="${comment.id}">
                            <span class="reaction-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                                </svg>
                            </span>
                            <span class="reaction-count">${reactions.fire || 0}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showEmptyState() {
        const currentLang = languageManager.getCurrentLanguage();
        const message = currentLang === 'ar'
            ? 'لا توجد تعليقات حتى الآن. كن أول من يترك تعليقاً!'
            : 'No comments yet. Be the first to leave a comment!';

        this.commentsList.innerHTML = `
            <div class="comments-empty">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <p>${message}</p>
            </div>
        `;
    }

    // ============================================
    // REALTIME LISTENER - المستمع الحي
    // ============================================

    setupRealtimeListener() {
        // الاستماع للتعليقات الجديدة
        this.commentsListener = firebaseService.listenToComments((type, comment) => {
            if (type === 'added') {
                // تجاهل التعليقات المحملة مسبقاً
                if (!this.loadedCommentIds.has(comment.id)) {
                    this.handleNewComment(comment);
                    this.loadedCommentIds.add(comment.id);
                }
            }
        });
    }

    handleNewComment(comment) {
        // إضافة التعليق الجديد في الأعلى
        if (this.commentsList) {
            // إزالة empty state إن وجد
            const emptyState = this.commentsList.querySelector('.comments-empty');
            if (emptyState) {
                emptyState.remove();
            }

            // إضافة التعليق الجديد
            const commentHTML = this.createCommentHTML(comment);
            this.commentsList.insertAdjacentHTML('afterbegin', commentHTML);

            // إظهار إشعار للزوار الآخرين (ليس لصاحب التعليق)
            const visitorId = firebaseService.getOrCreateVisitorId();
            if (comment.name !== visitorId) {
                notificationManager.newComment(comment.name);
            }
        }
    }

    // ============================================
    // UTILITY FUNCTIONS - دوال مساعدة
    // ============================================

    getTimeAgo(timestamp) {
        const now = new Date();
        const commentDate = new Date(timestamp);
        const diffMs = now - commentDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        const currentLang = languageManager.getCurrentLanguage();

        if (diffMins < 1) {
            return currentLang === 'ar' ? 'الآن' : 'Just now';
        } else if (diffMins < 60) {
            return currentLang === 'ar' 
                ? `منذ ${diffMins} ${diffMins === 1 ? 'دقيقة' : 'دقائق'}`
                : `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
            return currentLang === 'ar'
                ? `منذ ${diffHours} ${diffHours === 1 ? 'ساعة' : 'ساعات'}`
                : `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else {
            return currentLang === 'ar'
                ? `منذ ${diffDays} ${diffDays === 1 ? 'يوم' : 'أيام'}`
                : `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    destroy() {
        // إلغاء المستمع عند الضرورة
        if (this.commentsListener) {
            this.commentsListener();
        }
    }
}

// إنشاء نسخة واحدة
const guestbookManager = new GuestbookManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = guestbookManager;
}

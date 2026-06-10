// ============================================
// NOTIFICATIONS MODULE - وحدة الإشعارات
// ============================================

class NotificationManager {
    constructor() {
        this.container = null;
        this.activeToasts = new Set();
        this.maxToasts = 5;
    }

    init() {
        this.container = document.getElementById('toastContainer');
        
        if (!this.container) {
            this.createContainer();
        }

        console.log('✅ Notification Manager initialized');
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.id = 'toastContainer';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================

    show(message, type = 'info', duration = 5000) {
        // إزالة أقدم Toast إذا وصلنا للحد الأقصى
        if (this.activeToasts.size >= this.maxToasts) {
            const oldestToast = Array.from(this.activeToasts)[0];
            this.remove(oldestToast);
        }

        const toast = this.createToast(message, type);
        this.container.appendChild(toast);
        this.activeToasts.add(toast);

        // إظهار التوست مع تأثير
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        }, 10);

        // إزالة تلقائية بعد المدة المحددة
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    createToast(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} glass-effect`;
        toast.style.opacity = '0';
        toast.style.transform = document.documentElement.dir === 'rtl' ? 'translateX(-100%)' : 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease';

        const icon = this.getIcon(type);
        const title = this.getTitle(type);

        toast.innerHTML = `
            <div class="toast-icon">${icon}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
            <div class="toast-progress"></div>
        `;

        // إضافة مستمع للإغلاق
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => this.remove(toast));

        return toast;
    }

    remove(toast) {
        if (!toast || !this.activeToasts.has(toast)) return;

        toast.classList.add('toast-leaving');
        toast.style.opacity = '0';
        toast.style.transform = document.documentElement.dir === 'rtl' ? 'translateX(-100%)' : 'translateX(100%)';

        setTimeout(() => {
            toast.remove();
            this.activeToasts.delete(toast);
        }, 300);
    }

    getIcon(type) {
        const icons = {
            success: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            warning: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>`,
            info: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };

        return icons[type] || icons.info;
    }

    getTitle(type) {
        const currentLang = languageManager.getCurrentLanguage();
        
        const titles = {
            success: {
                ar: 'نجح!',
                en: 'Success!'
            },
            error: {
                ar: 'خطأ!',
                en: 'Error!'
            },
            warning: {
                ar: 'تحذير!',
                en: 'Warning!'
            },
            info: {
                ar: 'معلومة',
                en: 'Info'
            }
        };

        return titles[type][currentLang] || titles.info[currentLang];
    }

    // ============================================
    // CONVENIENCE METHODS
    // ============================================

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }

    // إشعار خاص بالتعليق الجديد
    newComment(name) {
        const currentLang = languageManager.getCurrentLanguage();
        const message = currentLang === 'ar' 
            ? `قام ${name} للتو بترك تعليق!`
            : `${name} just left a comment!`;
        
        return this.show(message, 'info', 4000);
    }

    // إشعار زائر جديد
    newVisitor() {
        const currentLang = languageManager.getCurrentLanguage();
        const message = currentLang === 'ar' 
            ? 'زائر جديد انضم للموقع!'
            : 'A new visitor joined the site!';
        
        return this.show(message, 'info', 3000);
    }
}

// إنشاء نسخة واحدة
const notificationManager = new NotificationManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = notificationManager;
}

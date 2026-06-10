// ============================================
// MAIN APP - التطبيق الرئيسي
// ============================================

class App {
    constructor() {
        this.isInitialized = false;
        this.loadingScreen = null;
    }

    // ============================================
    // INITIALIZATION - التهيئة
    // ============================================

    async init() {
        try {
            // عرض شاشة التحميل
            this.loadingScreen = document.getElementById('loadingScreen');

            // 1. تهيئة Firebase
            const firebaseInitialized = firebaseService.init();
            if (!firebaseInitialized) {
                console.warn('⚠️ Firebase not initialized. Some features may not work.');
            }

            // 2. تهيئة الثيمات
            themeManager.init();

            // 3. تهيئة اللغات
            languageManager.init();

            // 4. تهيئة التنقل
            navigationManager.init();

            // 5. تهيئة الحركات
            animationManager.init();

            // 6. تهيئة الإشعارات
            notificationManager.init();

            // 7. تهيئة البورتفوليو
            portfolioManager.init();

            // 8. تهيئة المختبر
            labManager.init();

            // 9. تهيئة دفتر الزوار
            try {
                guestbookManager.init();
            } catch (guestbookError) {
                console.error('⚠️ Guestbook error:', guestbookError);
            }

            // 10. تهيئة نموذج التواصل
            contactManager.init();

            // 11. تحديث عداد الزوار
            await this.updateVisitorCounter();

            // 12. إخفاء شاشة التحميل
            await this.hideLoadingScreen();

            this.isInitialized = true;

            // إشعار ترحيبي (اختياري)
            // this.showWelcomeNotification();

        } catch (error) {
            console.error('❌ Error initializing app:', error);
            await this.hideLoadingScreen();
        }
    }

    // ============================================
    // LOADING SCREEN - شاشة التحميل
    // ============================================

    async hideLoadingScreen() {
        return new Promise((resolve) => {
            // انتظر حتى يتم تحميل المحتوى بالكامل
            setTimeout(() => {
                if (this.loadingScreen) {
                    this.loadingScreen.classList.add('hidden');
                    
                    // إزالة العنصر بعد انتهاء الانتقال
                    setTimeout(() => {
                        this.loadingScreen.remove();
                        resolve();
                    }, 500);
                } else {
                    resolve();
                }
            }, 800);
        });
    }

    // ============================================
    // VISITOR COUNTER - عداد الزوار
    // ============================================

    async updateVisitorCounter() {
        try {
            const count = await firebaseService.incrementVisitorCount();
            const counterElement = document.getElementById('visitorCount');
            
            if (counterElement) {
                counterElement.setAttribute('data-target', count);
                this.animateCounter(counterElement, count);
            }
        } catch (error) {
            console.error('Error updating visitor counter:', error);
        }
    }

    animateCounter(element, target) {
        let current = 0;
        const increment = Math.ceil(target / 50);
        const duration = 1500;
        const stepTime = duration / 50;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target;
                clearInterval(timer);
            } else {
                element.textContent = current;
            }
        }, stepTime);
    }

    // ============================================
    // WELCOME NOTIFICATION - إشعار الترحيب
    // ============================================

    showWelcomeNotification() {
        // إظهار إشعار ترحيبي بعد ثانيتين
        setTimeout(() => {
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'مرحباً بك في بورتفوليو Bagomri! 👋'
                : 'Welcome to Bagomri\'s Portfolio! 👋';
            
            notificationManager.info(message, 4000);
        }, 2000);
    }

    // ============================================
    // PAGE TRACKING - تتبع الصفحات
    // ============================================

    trackPageView() {
        const pageName = window.location.pathname;
        firebaseService.trackPageView(pageName);
    }

    // ============================================
    // EVENT LISTENERS - مستمعي الأحداث
    // ============================================

    setupGlobalEventListeners() {
        // تتبع تغيير الهاش
        window.addEventListener('hashchange', () => {
            this.trackPageView();
        });

        // منع النقر بالزر الأيمن على الصور (اختياري)
        // document.addEventListener('contextmenu', (e) => {
        //     if (e.target.tagName === 'IMG') {
        //         e.preventDefault();
        //     }
        // });

        // معالجة الأخطاء العامة
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        // معالجة الوعود المرفوضة
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    // ============================================
    // UTILITIES - دوال مساعدة
    // ============================================

    // تحديث العنوان بناءً على القسم
    updatePageTitle(section) {
        const currentLang = languageManager.getCurrentLanguage();
        const titles = {
            home: {
                ar: 'الرئيسية - Bagomri',
                en: 'Home - Bagomri'
            },
            portfolio: {
                ar: 'المشاريع - Bagomri',
                en: 'Portfolio - Bagomri'
            },
            lab: {
                ar: 'المختبر - Bagomri',
                en: 'Lab - Bagomri'
            },
            services: {
                ar: 'الخدمات - Bagomri',
                en: 'Services - Bagomri'
            },
            contact: {
                ar: 'تواصل - Bagomri',
                en: 'Contact - Bagomri'
            }
        };

        if (titles[section]) {
            document.title = titles[section][currentLang];
        }
    }
}

// ============================================
// START THE APP - بدء التطبيق
// ============================================

// إنشاء نسخة من التطبيق
const app = new App();

// بدء التطبيق عند تحميل الصفحة
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app.init();
    });
} else {
    app.init();
}

// جعل التطبيق متاحاً عالمياً للتصحيح
window.app = app;

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = app;
}

// ============================================
// LANGUAGE MODULE - وحدة اللغات
// ============================================

class LanguageManager {
    constructor() {
        this.currentLang = 'ar';
        this.langToggleBtn = null;
        this.translations = {
            ar: {},
            en: {}
        };
    }

    init() {
        this.langToggleBtn = document.getElementById('langToggle');
        
        // تحميل اللغة المحفوظة
        this.loadSavedLanguage();
        
        // إضافة مستمع للنقر
        if (this.langToggleBtn) {
            this.langToggleBtn.addEventListener('click', () => this.toggleLanguage());
        }

        console.log('✅ Language Manager initialized');
    }

    loadSavedLanguage() {
        const savedLang = localStorage.getItem('language') || siteConfig.settings.defaultLanguage;
        this.setLanguage(savedLang, false);
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
        this.setLanguage(newLang, true);
    }

    setLanguage(lang, animate = true) {
        this.currentLang = lang;
        
        // تحديث HTML attributes
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        
        // تحديث جميع العناصر القابلة للترجمة
        this.updateAllTranslatableElements();

        // إضافة تأثير انتقالي
        if (animate) {
            document.body.style.opacity = '0';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 150);
        }

        // حفظ التفضيل
        localStorage.setItem('language', lang);

        // إطلاق حدث مخصص
        window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }

    updateAllTranslatableElements() {
        // تحديث العناصر باستخدام data attributes
        const elements = document.querySelectorAll('[data-ar], [data-en]');
        
        elements.forEach(element => {
            const arText = element.getAttribute('data-ar');
            const enText = element.getAttribute('data-en');
            
            if (this.currentLang === 'ar' && arText) {
                element.textContent = arText;
            } else if (this.currentLang === 'en' && enText) {
                element.textContent = enText;
            }
        });

        // تحديث placeholders
        const placeholderElements = document.querySelectorAll('[data-ar-placeholder], [data-en-placeholder]');
        
        placeholderElements.forEach(element => {
            const arPlaceholder = element.getAttribute('data-ar-placeholder');
            const enPlaceholder = element.getAttribute('data-en-placeholder');
            
            if (this.currentLang === 'ar' && arPlaceholder) {
                element.placeholder = arPlaceholder;
            } else if (this.currentLang === 'en' && enPlaceholder) {
                element.placeholder = enPlaceholder;
            }
        });
    }

    getCurrentLanguage() {
        return this.currentLang;
    }

    translate(key) {
        // يمكن توسيع هذا لاحقاً لنظام ترجمة أكثر تعقيداً
        return this.translations[this.currentLang][key] || key;
    }

    // دالة مساعدة للحصول على النص حسب اللغة الحالية
    getText(arText, enText) {
        return this.currentLang === 'ar' ? arText : enText;
    }
}

// إنشاء نسخة واحدة
const languageManager = new LanguageManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = languageManager;
}

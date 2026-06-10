// ============================================
// THEME MODULE - وحدة الثيمات
// ============================================

class ThemeManager {
    constructor() {
        this.currentTheme = 'dark';
        this.themeToggleBtn = null;
    }

    init() {
        this.themeToggleBtn = document.getElementById('themeToggle');
        
        // تحميل الثيم المحفوظ
        this.loadSavedTheme();
        
        // إضافة مستمع للنقر
        if (this.themeToggleBtn) {
            this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        }

        console.log('✅ Theme Manager initialized');
    }

    loadSavedTheme() {
        const savedTheme = localStorage.getItem('theme') || siteConfig.settings.defaultTheme;
        this.setTheme(savedTheme, false);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme, true);
    }

    setTheme(theme, animate = true) {
        this.currentTheme = theme;
        
        // تطبيق الثيم
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
            document.body.classList.remove('theme-light');
        } else {
            document.body.classList.add('theme-light');
            document.body.classList.remove('theme-dark');
        }

        // إضافة تأثير الانتقال
        if (animate) {
            document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 300);
        }

        // حفظ التفضيل
        localStorage.setItem('theme', theme);

        // إطلاق حدث مخصص
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// إنشاء نسخة واحدة
const themeManager = new ThemeManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = themeManager;
}

// ============================================
// NAVIGATION MODULE - وحدة التنقل
// ============================================

class NavigationManager {
    constructor() {
        this.navbar = null;
        this.navToggle = null;
        this.navMenu = null;
        this.navLinks = [];
        this.isMenuOpen = false;
        this.lastScrollTop = 0;
    }

    init() {
        this.navbar = document.getElementById('navbar');
        this.navToggle = document.getElementById('navToggle');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');

        // إضافة مستمعات الأحداث
        this.setupEventListeners();
        
        // معالجة التمرير
        this.handleScroll();

        console.log('✅ Navigation Manager initialized');
    }

    setupEventListeners() {
        // زر القائمة على الموبايل
        if (this.navToggle) {
            this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        }

        // روابط التنقل
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e, link));
        });

        // التمرير
        window.addEventListener('scroll', () => this.handleScroll());

        // إغلاق القائمة عند النقر خارجها
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        
        if (this.isMenuOpen) {
            this.navMenu.classList.add('active');
            this.navToggle.classList.add('active');
            document.body.style.overflow = 'hidden';
        } else {
            this.navMenu.classList.remove('active');
            this.navToggle.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    closeMobileMenu() {
        if (this.isMenuOpen) {
            this.toggleMobileMenu();
        }
    }

    handleNavLinkClick(e, link) {
        e.preventDefault();
        
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            // إزالة active من جميع الروابط
            this.navLinks.forEach(l => l.classList.remove('active'));
            
            // إضافة active للرابط المنقور
            link.classList.add('active');
            
            // التمرير إلى القسم
            const offset = 80; // ارتفاع navbar
            const targetPosition = targetSection.offsetTop - offset;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // إغلاق القائمة على الموبايل
            this.closeMobileMenu();
        }
    }

    handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // إضافة/إزالة كلاس scrolled
        if (scrollTop > 50) {
            this.navbar?.classList.add('scrolled');
        } else {
            this.navbar?.classList.remove('scrolled');
        }

        // تحديث الرابط النشط بناءً على الموضع
        this.updateActiveLink();

        this.lastScrollTop = scrollTop;
    }

    updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    handleClickOutside(e) {
        if (this.isMenuOpen && 
            !this.navMenu.contains(e.target) && 
            !this.navToggle.contains(e.target)) {
            this.closeMobileMenu();
        }
    }
}

// إنشاء نسخة واحدة
const navigationManager = new NavigationManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = navigationManager;
}

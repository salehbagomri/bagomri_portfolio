// ============================================
// ANIMATIONS MODULE - وحدة الحركات
// ============================================

class AnimationManager {
    constructor() {
        this.observedElements = new Set();
        this.observer = null;
        this.typingElement = null;
        this.typingTexts = [];
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.isDeleting = false;
    }

    init() {
        this.setupScrollAnimations();
        this.setupTypingEffect();
        this.animateCounters();
    }

    // ============================================
    // SCROLL ANIMATIONS
    // ============================================

    setupScrollAnimations() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('aos-animate');
                    this.observedElements.add(entry.target);
                }
            });
        }, options);

        // مراقبة جميع العناصر مع data-aos
        const animatedElements = document.querySelectorAll('[data-aos]');
        animatedElements.forEach(el => this.observer.observe(el));
    }

    // دالة لإعادة مراقبة العناصر الجديدة
    observeNewElements() {
        if (!this.observer) return;
        
        const animatedElements = document.querySelectorAll('[data-aos]:not(.aos-observed)');
        animatedElements.forEach(el => {
            this.observer.observe(el);
            el.classList.add('aos-observed');
        });
    }

    // ============================================
    // TYPING EFFECT - تأثير الكتابة
    // ============================================

    setupTypingEffect() {
        this.typingElement = document.querySelector('.typing-text');
        
        if (!this.typingElement) return;

        // الحصول على النصوص من التكوين
        const currentLang = languageManager.getCurrentLanguage();
        this.typingTexts = siteConfig.typingTexts[currentLang];

        // بدء التأثير
        this.typeText();

        // إعادة التهيئة عند تغيير اللغة
        window.addEventListener('languageChanged', (e) => {
            this.typingTexts = siteConfig.typingTexts[e.detail.lang];
            this.currentTextIndex = 0;
            this.currentCharIndex = 0;
            this.isDeleting = false;
            this.typingElement.textContent = '';
            this.typeText();
        });
    }

    typeText() {
        if (!this.typingElement || this.typingTexts.length === 0) return;

        const currentText = this.typingTexts[this.currentTextIndex];
        const speed = siteConfig.settings.typingSpeed;

        if (!this.isDeleting) {
            // كتابة النص
            this.typingElement.textContent = currentText.substring(0, this.currentCharIndex + 1);
            this.currentCharIndex++;

            if (this.currentCharIndex === currentText.length) {
                // انتهى كتابة النص، انتظر ثم ابدأ الحذف
                setTimeout(() => {
                    this.isDeleting = true;
                    this.typeText();
                }, siteConfig.settings.typingDelay);
                return;
            }
        } else {
            // حذف النص
            this.typingElement.textContent = currentText.substring(0, this.currentCharIndex - 1);
            this.currentCharIndex--;

            if (this.currentCharIndex === 0) {
                // انتهى الحذف، انتقل للنص التالي
                this.isDeleting = false;
                this.currentTextIndex = (this.currentTextIndex + 1) % this.typingTexts.length;
                setTimeout(() => this.typeText(), 500);
                return;
            }
        }

        setTimeout(() => this.typeText(), this.isDeleting ? speed / 2 : speed);
    }

    // ============================================
    // COUNTER ANIMATION - تحريك الأرقام
    // ============================================

    animateCounters() {
        const counters = document.querySelectorAll('.counter-number');
        
        counters.forEach(counter => {
            const updateCounter = () => {
                const target = parseInt(counter.getAttribute('data-target') || 0);
                const current = parseInt(counter.textContent || 0);
                const increment = Math.ceil(target / 100);

                if (current < target) {
                    counter.textContent = Math.min(current + increment, target);
                    setTimeout(updateCounter, 20);
                } else {
                    counter.textContent = target;
                }
            };

            // بدء التحريك عند الظهور
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            });

            observer.observe(counter);
        });
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    fadeIn(element, duration = 300) {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const increment = 50 / duration;
        
        const fade = setInterval(() => {
            opacity += increment;
            element.style.opacity = opacity;
            
            if (opacity >= 1) {
                clearInterval(fade);
                element.style.opacity = '1';
            }
        }, 50);
    }

    fadeOut(element, duration = 300) {
        let opacity = 1;
        const increment = 50 / duration;
        
        const fade = setInterval(() => {
            opacity -= increment;
            element.style.opacity = opacity;
            
            if (opacity <= 0) {
                clearInterval(fade);
                element.style.display = 'none';
                element.style.opacity = '0';
            }
        }, 50);
    }

    slideIn(element, direction = 'left', duration = 300) {
        element.style.transform = direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.transition = `transform ${duration}ms ease`;
            element.style.transform = 'translateX(0)';
        }, 10);
    }

    // تأثير الظهور مع التكبير
    scaleIn(element, duration = 300) {
        element.style.transform = 'scale(0.8)';
        element.style.opacity = '0';
        element.style.display = 'block';
        
        setTimeout(() => {
            element.style.transition = `all ${duration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 10);
    }
}

// إنشاء نسخة واحدة
const animationManager = new AnimationManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = animationManager;
}

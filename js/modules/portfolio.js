// ============================================
// PORTFOLIO MODULE - وحدة المشاريع
// ============================================

class PortfolioManager {
    constructor() {
        this.filterButtons = [];
        this.portfolioItems = [];
        this.currentFilter = 'all';
        this.projects = [];
    }

    init() {
        this.filterButtons = document.querySelectorAll('.filter-btn');
        this.portfolioItems = document.querySelectorAll('.portfolio-item');
        
        // تحميل المشاريع
        this.loadProjects();
        
        // إعداد الفلاتر
        this.setupFilters();
    }

    // ============================================
    // PROJECT DATA - بيانات المشاريع
    // ============================================

    async loadProjects() {
        try {
            const firestoreProjects = await firebaseService.getProjects();
            if (firestoreProjects && firestoreProjects.length > 0) {
                this.projects = firestoreProjects;
                this.renderFeaturedProjects();
                this.renderAllProjects();
                this.setupFilters();
                return;
            }
        } catch (e) {}

        // fallback: المشاريع الافتراضية
        this.projects = [
            {
                id: 1,
                title: {
                    ar: 'كويك شات',
                    en: 'QuickChat'
                },
                description: {
                    ar: 'تطبيق ذكي لفتح محادثات واتساب بدون حفظ الرقم مع قوالب رسائل وسجل الأرقام',
                    en: 'Smart app to open WhatsApp chats without saving numbers with message templates and history'
                },
                fullDescription: {
                    ar: 'QuickChat هو تطبيق فلاتر احترافي يحل مشكلة حفظ مئات الأرقام فقط للمراسلة على واتساب. مثالي لأصحاب الأعمال والمتاجر الإلكترونية وفرق المبيعات. يوفر التطبيق تجربة سريعة وسلسة مع دعم كامل للعربية والإنجليزية، ووضع داكن وفاتح، مع ضمان كامل للخصوصية.',
                    en: 'QuickChat is a professional Flutter app that solves the problem of saving hundreds of numbers just to message on WhatsApp. Perfect for business owners, e-commerce stores, and sales teams. The app provides a fast and smooth experience with full Arabic and English support, dark and light mode, with complete privacy guarantee.'
                },
                category: 'flutter',
                image: 'assets/quickchat/quickchat.jpg',
                logo: 'assets/quickchat/screenshots/logo-0.png',
                screenshots: {
                    mobile: [
                        'assets/quickchat/quickchat.jpg',
                        'assets/quickchat/screenshots/SC-1.jpg',
                        'assets/quickchat/screenshots/SC-2.jpg',
                        'assets/quickchat/screenshots/SC-3.jpg',
                        'assets/quickchat/screenshots/SC-4.jpg',
                        'assets/quickchat/screenshots/SC-5.jpg'
                    ],
                    desktop: [
                        'assets/quickchat/quickchat.jpg',
                        'assets/quickchat/screenshots/desktop/SC-1-desktop.jpg',
                        'assets/quickchat/screenshots/desktop/SC-2-desktop.jpg',
                        'assets/quickchat/screenshots/desktop/SC-3-desktop.jpg',
                        'assets/quickchat/screenshots/desktop/SC-4-desktop.jpg',
                        'assets/quickchat/screenshots/desktop/SC-5-desktop.jpg'
                    ]
                },
                tags: ['Flutter', 'Firebase', 'Dart', 'Mobile'],
                featured: true,
                date: '2025-11-11',
                role: {
                    ar: 'مطور فل ستاك',
                    en: 'Full Stack Developer'
                },
                features: {
                    ar: [
                        'مراسلة فورية بدون حفظ الرقم',
                        'دعم 195+ دولة مع اختيار ذكي',
                        '10 قوالب رسائل جاهزة للاستخدام',
                        'إنشاء وتعديل قوالب مخصصة',
                        'سجل الأرقام الأخيرة مع إمكانية الحذف',
                        'دعم واتساب العادي وبزنس',
                        'واجهة عصرية بوضع فاتح وداكن',
                        'دعم كامل للعربية والإنجليزية',
                        'حجم صغير وسريع (20 ميجا فقط)',
                        'خصوصية كاملة بدون جمع بيانات'
                    ],
                    en: [
                        'Instant messaging without saving numbers',
                        'Support for 195+ countries with smart selection',
                        '10 ready-to-use message templates',
                        'Create and edit custom templates',
                        'Recent numbers history with deletion option',
                        'Support for regular and business WhatsApp',
                        'Modern interface with light and dark mode',
                        'Full Arabic and English support',
                        'Small and fast size (only 20MB)',
                        'Complete privacy without data collection'
                    ]
                },
                links: {
                    github: 'https://github.com/salehbagomri',
                    playstore: 'https://play.google.com/store/apps/details?id=com.bagomri.quickchat'
                }
            },
            {
                id: 2,
                title: {
                    ar: 'تطبيق التجارة الإلكترونية',
                    en: 'E-Commerce App'
                },
                description: {
                    ar: 'تطبيق متكامل للتسوق الإلكتروني مبني بـ Flutter',
                    en: 'Complete e-commerce shopping app built with Flutter'
                },
                category: 'flutter',
                image: 'assets/images/projects/project1.jpg',
                tags: ['Flutter', 'Firebase', 'Stripe'],
                featured: true,
                links: {
                    github: '#',
                    demo: '#',
                    case_study: '#'
                }
            },
            {
                id: 3,
                title: {
                    ar: 'تصميم تطبيق بنكي',
                    en: 'Banking App Design'
                },
                description: {
                    ar: 'تصميم UI/UX احترافي لتطبيق بنكي مع دراسة حالة كاملة',
                    en: 'Professional UI/UX design for banking app with complete case study'
                },
                category: 'uiux',
                image: 'assets/images/projects/project2.jpg',
                tags: ['UI/UX', 'Figma', 'Prototyping'],
                featured: false,
                links: {
                    figma: '#',
                    case_study: '#'
                }
            },
            {
                id: 4,
                title: {
                    ar: 'هوية بصرية لشركة تقنية',
                    en: 'Tech Company Branding'
                },
                description: {
                    ar: 'هوية بصرية متكاملة لشركة تقنية ناشئة',
                    en: 'Complete visual identity for a tech startup'
                },
                category: 'graphics',
                image: 'assets/images/projects/project3.jpg',
                tags: ['Branding', 'Logo', 'Graphics'],
                featured: true,
                links: {
                    behance: '#',
                    dribbble: '#'
                }
            }
        ];

        this.renderFeaturedProjects();
        this.renderAllProjects();
        this.setupFilters();
    }

    // ============================================
    // RENDERING - العرض
    // ============================================

    renderFeaturedProjects() {
        const container = document.getElementById('featuredProjects');
        if (!container) return;

        const featured = this.projects.filter(p => p.featured);
        const currentLang = languageManager.getCurrentLanguage();

        const html = featured.map(project => `
            <div class="featured-card glass-effect" data-aos="fade-up">
                <div class="featured-image">
                    <img src="${project.image}" alt="${project.title[currentLang]}" loading="lazy">
                    <div class="featured-overlay">
                        <button class="btn btn-primary" onclick="portfolioManager.openProject('${project.id}')">
                            <span data-ar="عرض المشروع" data-en="View Project">عرض المشروع</span>
                        </button>
                    </div>
                </div>
                <span class="featured-category">${this.getCategoryName(project.category)}</span>
                <h3 class="featured-title" data-ar="${project.title.ar}" data-en="${project.title.en}">${project.title.ar}</h3>
                <p class="featured-description" data-ar="${project.description.ar}" data-en="${project.description.en}">${project.description.ar}</p>
                <div class="card-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `).join('');

        container.innerHTML = html;

        // إعادة مراقبة العناصر الجديدة للـ animations
        if (typeof animationManager !== 'undefined') {
            setTimeout(() => {
                animationManager.observeNewElements();
            }, 100);
        }

        // تحديث الترجمات
        languageManager.updateAllTranslatableElements();
    }

    renderAllProjects() {
        const container = document.getElementById('portfolioGrid');
        if (!container) return;

        const currentLang = languageManager.getCurrentLanguage();

        container.innerHTML = this.projects.map(project => `
            <div class="portfolio-item show" data-category="${project.category}" data-aos="fade-up">
                <div class="portfolio-card glass-effect" onclick="portfolioManager.openProject('${project.id}')">
                    <div class="portfolio-image">
                        <img src="${project.image}" alt="${project.title[currentLang]}" loading="lazy">
                        <span class="portfolio-badge badge-${project.category}">${this.getCategoryName(project.category)}</span>
                    </div>
                    <div class="portfolio-info">
                        <h3 class="portfolio-title" data-ar="${project.title.ar}" data-en="${project.title.en}">${project.title.ar}</h3>
                        <p class="portfolio-description" data-ar="${project.description.ar}" data-en="${project.description.en}">${project.description.ar}</p>
                        <div class="portfolio-tech">
                            ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                        </div>
                        <div class="portfolio-footer">
                            <div class="portfolio-links">
                                ${project.links.github ? `<a href="${project.links.github}" target="_blank" class="portfolio-link" onclick="event.stopPropagation()" title="GitHub"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>` : ''}
                                <button class="portfolio-link" onclick="event.stopPropagation(); portfolioManager.openProject('${project.id}')" title="${currentLang === 'ar' ? 'عرض التفاصيل' : 'View Details'}">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // تحديث portfolioItems بعد عرض المشاريع
        this.portfolioItems = document.querySelectorAll('.portfolio-item');
    }

    // ============================================
    // FILTERING - الفلترة
    // ============================================

    setupFilters() {
        this.filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                this.filterProjects(filter);
                
                // تحديث الزر النشط
                this.filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    filterProjects(category) {
        this.currentFilter = category;
        
        this.portfolioItems.forEach(item => {
            const itemCategory = item.getAttribute('data-category');
            
            if (category === 'all' || itemCategory === category) {
                item.classList.remove('hide');
                item.classList.add('show');
            } else {
                item.classList.remove('show');
                item.classList.add('hide');
            }
        });
    }

    getCategoryName(category) {
        const currentLang = languageManager.getCurrentLanguage();
        const names = {
            flutter: { ar: 'Flutter', en: 'Flutter' },
            uiux: { ar: 'UI/UX', en: 'UI/UX' },
            graphics: { ar: 'جرافيك', en: 'Graphics' }
        };
        return names[category][currentLang];
    }

    // ============================================
    // PROJECT MODAL - عرض تفاصيل المشروع
    // ============================================

    openProject(projectId) {
        const project = this.projects.find(p => String(p.id) === String(projectId));
        if (!project) return;

        this.showProjectModal(project);
    }

    showProjectModal(project) {
        const currentLang = languageManager.getCurrentLanguage();
        
        // Detect device type
        const isMobile = window.innerWidth <= 768;
        let screenshots = project.screenshots
            ? (typeof project.screenshots === 'object' && project.screenshots.mobile && project.screenshots.desktop
                ? (isMobile ? project.screenshots.mobile : project.screenshots.desktop)
                : (Array.isArray(project.screenshots) ? project.screenshots : []))
            : [];

        // إذا لا توجد لقطات، استخدم الصورة الرئيسية
        if (screenshots.length === 0 && project.image) {
            screenshots = [project.image];
        }
        
        // إنشاء modal
        const modal = document.createElement('div');
        modal.className = 'project-modal';
        modal.innerHTML = `
            <div class="modal-overlay" onclick="portfolioManager.closeProjectModal()"></div>
            <div class="modal-container glass-effect">
                <button class="modal-close" onclick="portfolioManager.closeProjectModal()">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                
                <div class="modal-content">
                    <!-- Header -->
                    <div class="modal-header">
                        ${project.logo ? `<img src="${project.logo}" alt="Logo" class="modal-logo">` : ''}
                        <div class="modal-header-text">
                            <h2 class="modal-title">${project.title[currentLang]}</h2>
                            <div class="modal-meta">
                                <span class="modal-category">${this.getCategoryName(project.category)}</span>
                                <span class="modal-date">${project.date || ''}</span>
                                ${project.role ? `<span class="modal-role">${project.role[currentLang]}</span>` : ''}
                            </div>
                        </div>
                    </div>

                    <!-- Screenshots Gallery -->
                    ${screenshots.length > 0 ? `
                        <div class="modal-gallery">
                            <div class="gallery-main">
                                <img src="${screenshots[0]}" alt="Screenshot 1" id="mainGalleryImage">
                                <button class="gallery-nav gallery-prev" onclick="portfolioManager.prevScreenshot()">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15 18 9 12 15 6"></polyline>
                                    </svg>
                                </button>
                                <button class="gallery-nav gallery-next" onclick="portfolioManager.nextScreenshot()">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 18 15 12 9 6"></polyline>
                                    </svg>
                                </button>
                            </div>
                            <div class="gallery-thumbnails">
                                ${screenshots.map((img, index) => `
                                    <img src="${img}" alt="Thumbnail ${index + 1}" 
                                         class="gallery-thumb ${index === 0 ? 'active' : ''}"
                                         onclick="portfolioManager.selectScreenshot(${index})">
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Description -->
                    <div class="modal-description">
                        <h3 data-ar="نظرة عامة" data-en="Overview">نظرة عامة</h3>
                        <p>${project.fullDescription ? project.fullDescription[currentLang] : project.description[currentLang]}</p>
                    </div>

                    <!-- Features -->
                    ${project.features ? `
                        <div class="modal-features">
                            <h3 data-ar="المميزات الرئيسية" data-en="Key Features">المميزات الرئيسية</h3>
                            <div class="features-grid">
                                ${project.features[currentLang].map(feature => `
                                    <div class="feature-item glass-effect">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                        <span>${feature}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}

                    <!-- Technologies -->
                    <div class="modal-tech">
                        <h3 data-ar="التقنيات المستخدمة" data-en="Technologies Used">التقنيات المستخدمة</h3>
                        <div class="tech-tags">
                            ${project.tags.map(tag => `<span class="tech-tag">${tag}</span>`).join('')}
                        </div>
                    </div>

                    <!-- Links -->
                    <div class="modal-actions">
                        ${project.links.github ? `
                            <a href="${project.links.github}" target="_blank" class="btn btn-secondary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span data-ar="GitHub" data-en="GitHub">GitHub</span>
                            </a>
                        ` : ''}
                        ${project.links.playstore ? `
                            <a href="${project.links.playstore}" target="_blank" class="btn btn-primary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.207-3.19L3.622.8a1.48 1.48 0 0 0-.48-.8l10.402 10.989zm0 2.067L3.137 23.177c.148-.129.28-.278.39-.444l13.144-7.57-3.127-3.107z"/>
                                </svg>
                                <span data-ar="تحميل من سوق بلاي" data-en="Download from Play Store">تحميل من سوق بلاي</span>
                            </a>
                        ` : ''}
                        ${project.links.demo ? `
                            <a href="${project.links.demo}" target="_blank" class="btn btn-primary">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                    <polyline points="15 3 21 3 21 9"></polyline>
                                    <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                <span data-ar="معاينة مباشرة" data-en="Live Demo">معاينة مباشرة</span>
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Store current project screenshots
        this.currentScreenshots = screenshots;
        this.currentScreenshotIndex = 0;
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Fade in animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);

        // Start auto-slide
        this.startAutoSlide();

        // Update translations
        languageManager.updateAllTranslatableElements();
    }

    closeProjectModal() {
        const modal = document.querySelector('.project-modal');
        if (modal) {
            // Stop auto-slide
            this.stopAutoSlide();
            
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
                document.body.style.overflow = '';
            }, 300);
        }
    }

    // Auto-slide functionality
    startAutoSlide() {
        // Clear any existing interval
        this.stopAutoSlide();
        
        // Start new interval - change image every 3 seconds
        this.autoSlideInterval = setInterval(() => {
            this.nextScreenshot();
        }, 3000);
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    // Gallery navigation
    selectScreenshot(index) {
        this.currentScreenshotIndex = index;
        const mainImage = document.getElementById('mainGalleryImage');
        const thumbnails = document.querySelectorAll('.gallery-thumb');
        
        // Reset auto-slide timer when user manually selects
        this.startAutoSlide();
        
        if (mainImage && this.currentScreenshots[index]) {
            mainImage.style.opacity = '0';
            setTimeout(() => {
                mainImage.src = this.currentScreenshots[index];
                mainImage.style.opacity = '1';
            }, 200);
        }
        
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }

    nextScreenshot() {
        if (this.currentScreenshots.length === 0) return;
        this.currentScreenshotIndex = (this.currentScreenshotIndex + 1) % this.currentScreenshots.length;
        this.selectScreenshot(this.currentScreenshotIndex);
    }

    prevScreenshot() {
        if (this.currentScreenshots.length === 0) return;
        this.currentScreenshotIndex = (this.currentScreenshotIndex - 1 + this.currentScreenshots.length) % this.currentScreenshots.length;
        this.selectScreenshot(this.currentScreenshotIndex);
    }
}

// إنشاء نسخة واحدة
const portfolioManager = new PortfolioManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = portfolioManager;
}

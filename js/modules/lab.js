// ============================================
// LAB MODULE - وحدة المختبر
// ============================================

class LabManager {
    constructor() {
        this.labProjects = [];
    }

    init() {
        this.loadLabProjects();
        console.log('✅ Lab Manager initialized');
    }

    loadLabProjects() {
        const currentLang = languageManager.getCurrentLanguage();
        
        // مشاريع تجريبية للمختبر
        this.labProjects = [
            {
                id: 1,
                title: {
                    ar: 'تطبيق الطقس',
                    en: 'Weather App'
                },
                description: {
                    ar: 'تطبيق Flutter لعرض حالة الطقس مع تصميم حديث',
                    en: 'Flutter weather app with modern design'
                },
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
                </svg>`,
                image: 'assets/images/lab/weather-app.jpg',
                techStack: ['Flutter', 'API', 'Dart'],
                stats: {
                    stars: 45,
                    forks: 12,
                    downloads: 230
                },
                links: {
                    appStore: '#',
                    playStore: '#',
                    github: 'https://github.com/yourusername/weather-app'
                }
            },
            {
                id: 2,
                title: {
                    ar: 'لوحة تحكم إدارية',
                    en: 'Admin Dashboard'
                },
                description: {
                    ar: 'تصميم تفاعلي لوحة تحكم إدارية على Figma',
                    en: 'Interactive admin dashboard design in Figma'
                },
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>`,
                image: 'assets/images/lab/dashboard.jpg',
                techStack: ['Figma', 'UI/UX', 'Prototyping'],
                stats: {
                    views: 1250,
                    likes: 89,
                    comments: 23
                },
                links: {
                    figma: 'https://figma.com/@yourusername/dashboard',
                    demo: '#'
                }
            },
            {
                id: 3,
                title: {
                    ar: 'مكتبة أيقونات',
                    en: 'Icon Library'
                },
                description: {
                    ar: 'مجموعة من 500+ أيقونة SVG مجانية',
                    en: 'Collection of 500+ free SVG icons'
                },
                icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>`,
                image: 'assets/images/lab/icons.jpg',
                techStack: ['SVG', 'Illustrator', 'Design'],
                stats: {
                    downloads: 5420,
                    stars: 156,
                    forks: 34
                },
                links: {
                    github: 'https://github.com/yourusername/icon-library',
                    demo: '#',
                    download: '#'
                }
            }
        ];

        this.renderLabProjects();
    }

    renderLabProjects() {
        const container = document.getElementById('labProjects');
        if (!container) return;

        const currentLang = languageManager.getCurrentLanguage();

        container.innerHTML = this.labProjects.map(project => `
            <div class="lab-card glass-effect" data-aos="fade-up">
                <div class="lab-glow"></div>
                
                <div class="lab-icon">
                    ${project.icon}
                </div>
                
                ${project.image ? `
                    <div class="lab-image">
                        <img src="${project.image}" alt="${project.title[currentLang]}" loading="lazy">
                    </div>
                ` : ''}
                
                <h3 class="lab-title">${project.title[currentLang]}</h3>
                <p class="lab-description">${project.description[currentLang]}</p>
                
                <div class="lab-tech-stack">
                    ${project.techStack.map(tech => `
                        <span class="lab-tech-item glass-effect">${tech}</span>
                    `).join('')}
                </div>
                
                <div class="lab-actions">
                    ${project.links.appStore ? `
                        <a href="${project.links.appStore}" class="lab-action-btn primary" target="_blank">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                            </svg>
                            <span data-ar="App Store" data-en="App Store">App Store</span>
                        </a>
                    ` : ''}
                    
                    ${project.links.playStore ? `
                        <a href="${project.links.playStore}" class="lab-action-btn primary" target="_blank">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                            </svg>
                            <span data-ar="Google Play" data-en="Google Play">Google Play</span>
                        </a>
                    ` : ''}
                    
                    ${project.links.github ? `
                        <a href="${project.links.github}" class="lab-action-btn github" target="_blank">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            <span data-ar="عرض الكود" data-en="View Code">View Code</span>
                        </a>
                    ` : ''}
                    
                    ${project.links.figma ? `
                        <a href="${project.links.figma}" class="lab-action-btn figma" target="_blank">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M15.852 8.981h-4.588V0h4.588c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.491-4.49 4.491zM12.735 7.51h3.117c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-3.117V7.51zm0 1.471H8.148c-2.476 0-4.49-2.014-4.49-4.49S5.672 0 8.148 0h4.588v8.981zm-4.587-7.51c-1.665 0-3.019 1.355-3.019 3.019s1.354 3.02 3.019 3.02h3.117V1.471H8.148zm4.587 15.019H8.148c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h4.588v8.98zM8.148 8.981c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h3.117V8.981H8.148zM8.172 24c-2.489 0-4.515-2.014-4.515-4.49s2.014-4.49 4.49-4.49h4.588v4.441c0 2.503-2.047 4.539-4.563 4.539zm-.024-7.51a3.023 3.023 0 0 0-3.019 3.019c0 1.665 1.365 3.019 3.044 3.019 1.705 0 3.093-1.376 3.093-3.068v-2.97H8.148zm7.704 0h-.098c-2.476 0-4.49-2.014-4.49-4.49s2.014-4.49 4.49-4.49h.098c2.476 0 4.49 2.014 4.49 4.49s-2.014 4.49-4.49 4.49zm-.098-7.509c-1.665 0-3.019 1.355-3.019 3.019s1.355 3.019 3.019 3.019h.098c1.665 0 3.019-1.355 3.019-3.019s-1.355-3.019-3.019-3.019h-.098z"/>
                            </svg>
                            <span data-ar="افتح في Figma" data-en="Open in Figma">Open in Figma</span>
                        </a>
                    ` : ''}
                    
                    ${project.links.demo ? `
                        <a href="${project.links.demo}" class="lab-action-btn demo" target="_blank">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <span data-ar="عرض تجريبي" data-en="Live Demo">Live Demo</span>
                        </a>
                    ` : ''}
                </div>
                
                ${project.stats ? `
                    <div class="lab-stats">
                        ${project.stats.stars !== undefined ? `
                            <div class="lab-stat">
                                <span class="stat-value">${project.stats.stars}</span>
                                <span class="stat-label" data-ar="نجمة" data-en="Stars">Stars</span>
                            </div>
                        ` : ''}
                        ${project.stats.forks !== undefined ? `
                            <div class="lab-stat">
                                <span class="stat-value">${project.stats.forks}</span>
                                <span class="stat-label" data-ar="فرع" data-en="Forks">Forks</span>
                            </div>
                        ` : ''}
                        ${project.stats.downloads !== undefined ? `
                            <div class="lab-stat">
                                <span class="stat-value">${project.stats.downloads}</span>
                                <span class="stat-label" data-ar="تحميل" data-en="Downloads">Downloads</span>
                            </div>
                        ` : ''}
                        ${project.stats.views !== undefined ? `
                            <div class="lab-stat">
                                <span class="stat-value">${project.stats.views}</span>
                                <span class="stat-label" data-ar="مشاهدة" data-en="Views">Views</span>
                            </div>
                        ` : ''}
                        ${project.stats.likes !== undefined ? `
                            <div class="lab-stat">
                                <span class="stat-value">${project.stats.likes}</span>
                                <span class="stat-label" data-ar="إعجاب" data-en="Likes">Likes</span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}
            </div>
        `).join('');

        // تحديث الترجمات
        languageManager.updateAllTranslatableElements();
    }
}

// إنشاء نسخة واحدة
const labManager = new LabManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = labManager;
}

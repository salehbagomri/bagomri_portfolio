/**
 * Portfolio Module - Bagomri Portfolio
 */

// ── Project Data ─────────────────────────────────────────────
const PROJECTS = [
  {
    id: 'ybb',
    titleAr: 'بنك الدم اليمني',
    titleEn: 'Yemen Blood Bank',
    descAr: 'تطبيق يربط المتبرعين بالدم بالمرضى في اليمن مع تنبيهات فورية وخرائط.',
    descEn: 'App connecting blood donors with patients in Yemen with real-time alerts and maps.',
    category: 'flutter',
    tags: ['Flutter', 'Firebase', 'Maps'],
    icon: 'heart-pulse',
    iconColor: '#DC2626',
    iconBg: '#FEE2E2',
    githubUrl: '',
    storeUrl: '',
  },
  {
    id: 'kotlin-1',
    titleAr: 'تطبيق أندرويد بـ Kotlin',
    titleEn: 'Android Kotlin App',
    descAr: 'تطبيق Android بُني بـ Kotlin وJetpack Compose مع بنية MVVM نظيفة وRoom Database.',
    descEn: 'Android app built with Kotlin and Jetpack Compose, clean MVVM architecture and Room Database.',
    category: 'kotlin',
    tags: ['Kotlin', 'Jetpack Compose', 'Room', 'MVVM'],
    icon: 'smartphone',
    iconColor: '#221461',
    iconBg: '#EEF0FF',
    githubUrl: '',
    storeUrl: '',
  },
  {
    id: 'flutter-2',
    titleAr: 'تطبيق Flutter 2',
    titleEn: 'Flutter App 2',
    descAr: 'تطبيق متعدد المنصات بواجهة مستخدم أنيقة وتكامل مع Firebase.',
    descEn: 'Cross-platform app with elegant UI and Firebase integration.',
    category: 'flutter',
    tags: ['Flutter', 'Dart', 'Firebase'],
    icon: 'layers',
    iconColor: '#0284C7',
    iconBg: '#E0F2FE',
    githubUrl: '',
    storeUrl: '',
  },
];

// ── Current language helper ───────────────────────────────────
function isArabic() {
  return document.documentElement.lang !== 'en';
}

// ── Build a single project card HTML ─────────────────────────
function buildProjectCard(project) {
  const ar = isArabic();
  const title = ar ? project.titleAr : project.titleEn;
  const desc  = ar ? project.descAr  : project.descEn;

  // Tags HTML
  const tagsHtml = project.tags
    .map(t => `<span style="
      display:inline-block;
      font-size:0.72rem;
      font-weight:500;
      color:var(--text-muted);
      background:var(--border-light);
      padding:2px 8px;
      border-radius:var(--radius-full);
      ">${t}</span>`)
    .join('');

  // Links HTML
  let linksHtml = '';
  if (project.githubUrl) {
    linksHtml += `
      <a href="${project.githubUrl}" target="_blank" rel="noopener">
        <i data-lucide="github"></i>
        <span data-ar="الكود" data-en="Code">${ar ? 'الكود' : 'Code'}</span>
      </a>`;
  }
  if (project.storeUrl) {
    linksHtml += `
      <a href="${project.storeUrl}" target="_blank" rel="noopener">
        <i data-lucide="external-link"></i>
        <span data-ar="المتجر" data-en="Store">${ar ? 'المتجر' : 'Store'}</span>
      </a>`;
  }

  // Category label
  const catLabel = project.category === 'kotlin'
    ? 'Kotlin & Android'
    : 'Flutter';

  return `
    <div class="project-card" data-category="${project.category}">
      <div class="project-card-img" style="background:${project.iconBg};">
        <i data-lucide="${project.icon}" style="width:40px;height:40px;color:${project.iconColor};"></i>
      </div>
      <div class="project-card-body">
        <span class="project-card-tag">${catLabel}</span>
        <h3 class="project-card-title">${title}</h3>
        <p class="project-card-desc">${desc}</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;">${tagsHtml}</div>
        ${linksHtml ? `<div class="project-card-links">${linksHtml}</div>` : ''}
      </div>
    </div>`;
}

// ── Render all / filtered projects ───────────────────────────
function renderProjects(filter = 'all') {
  const grid = document.getElementById('portfolioGrid');
  if (!grid) return;

  const filtered = filter === 'all'
    ? PROJECTS
    : PROJECTS.filter(p => p.category === filter);

  if (filtered.length === 0) {
    const ar = isArabic();
    grid.innerHTML = `
      <div class="portfolio-empty">
        <i data-lucide="folder-open"></i>
        <p>${ar ? 'لا توجد مشاريع في هذه الفئة بعد.' : 'No projects in this category yet.'}</p>
      </div>`;
  } else {
    grid.innerHTML = filtered.map(buildProjectCard).join('');
  }

  // Refresh Lucide icons for new cards
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Trigger animations on new cards
  if (typeof refreshAnimations === 'function') refreshAnimations();
}

// ── Filter buttons logic ──────────────────────────────────────
function initFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderProjects(btn.dataset.filter || 'all');
    });
  });
}

// ── Main init ─────────────────────────────────────────────────
function initPortfolio() {
  renderProjects('all');
  initFilterButtons();

  // Re-render when language changes to update text
  document.getElementById('langToggle')?.addEventListener('click', () => {
    setTimeout(() => {
      const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
      renderProjects(activeFilter);
    }, 50);
  });
}

/**
 * Navigation Module — Navbar scroll effect, mobile menu, active links
 */
function initNavigation() {
  const navbar    = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const allNavLinks = document.querySelectorAll('.nav-link');

  // ── Navbar scroll shadow ──────────────────────────────────
  function onScroll() {
    if (window.scrollY > 10) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    updateActiveLink();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ── Mobile menu toggle ────────────────────────────────────
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      // Swap icon
      navToggle.innerHTML = isOpen
        ? '<i data-lucide="x"></i>'
        : '<i data-lucide="menu"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // Close mobile menu when a link is clicked
  allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      if (navToggle) {
        navToggle.innerHTML = '<i data-lucide="menu"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileMenu?.classList.contains('open') &&
      !mobileMenu.contains(e.target) &&
      !navToggle?.contains(e.target)
    ) {
      mobileMenu.classList.remove('open');
      if (navToggle) {
        navToggle.innerHTML = '<i data-lucide="menu"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  });

  // ── Active link on scroll ─────────────────────────────────
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const scrollY = window.scrollY + 80;
    let currentId = '';

    sections.forEach((section) => {
      if (scrollY >= section.offsetTop) {
        currentId = section.id;
      }
    });

    allNavLinks.forEach((link) => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  updateActiveLink();
}

// Expose globally
window.initNavigation = initNavigation;

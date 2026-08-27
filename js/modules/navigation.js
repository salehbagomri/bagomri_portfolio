/**
 * Navigation Module - Navbar scroll effect, mobile menu, active links
 */
function initNavigation() {
  const navbar     = document.getElementById('navbar');
  const navToggle  = document.getElementById('navToggle');
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
    navToggle.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

      // Swap icon safely
      navToggle.innerHTML = isOpen
        ? '<i data-lucide="x"></i>'
        : '<i data-lucide="menu"></i>';

      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    });
  }

  // Close mobile menu when any nav link is clicked
  allNavLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (mobileMenu?.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        if (navToggle) {
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.innerHTML = '<i data-lucide="menu"></i>';
          if (typeof lucide !== 'undefined') lucide.createIcons();
        }
      }
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!mobileMenu?.classList.contains('open')) return;

    // If clicked inside menu or on toggle button, do nothing
    if (mobileMenu.contains(e.target) || navToggle?.contains(e.target) || e.target === navToggle) {
      return;
    }

    // Otherwise close menu
    mobileMenu.classList.remove('open');
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.innerHTML = '<i data-lucide="menu"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu?.classList.contains('open')) {
      mobileMenu.classList.remove('open');
      if (navToggle) {
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.innerHTML = '<i data-lucide="menu"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    }
  });

  // ── Active link on scroll / page match ────────────────────
  const sections = document.querySelectorAll('section[id]');
  const isSinglePage = sections.length > 0;
  const currentPath = (window.location.pathname || '').toLowerCase();

  function updateActiveLink() {
    if (currentPath.includes('blog') || currentPath.includes('article')) {
      allNavLinks.forEach((link) => {
        const href = (link.getAttribute('href') || '').toLowerCase();
        if (href.includes('blog')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
      return;
    }

    if (!isSinglePage) return;

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
      if (href === '#' + currentId) {
        link.classList.add('active');
      }
    });
  }

  updateActiveLink();
}

// Expose globally
window.initNavigation = initNavigation;

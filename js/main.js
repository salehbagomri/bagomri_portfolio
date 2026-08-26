/**
 * Main Entry Point - Bagomri Portfolio
 * Initializes all modules in correct order.
 */

document.addEventListener('DOMContentLoaded', () => {

  // 1. Theme (light only, clean state)
  if (typeof initTheme === 'function') initTheme();

  // 2. Language
  if (typeof initLanguage === 'function') initLanguage();

  // 3. Navigation
  if (typeof initNavigation === 'function') initNavigation();

  // 4. Animations (IntersectionObserver)
  if (typeof initAnimations === 'function') initAnimations();

  // 5. Portfolio (renders project cards)
  if (typeof initPortfolio === 'function') initPortfolio();

  // 5.1 Blog preview (renders latest articles from Firestore)
  if (typeof blogManager !== 'undefined') blogManager.initHomepageBlog();

  // 6. Contact form
  if (typeof initContact === 'function') initContact();

  // 7. Notifications
  if (typeof initNotifications === 'function') initNotifications();

  // 8. Firebase (visitor counter + data)
  if (typeof initFirebase === 'function') initFirebase();

  // 9. Lucide Icons - render after all dynamic content
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // 10. Hide loading screen
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    setTimeout(() => {
      loadingScreen.classList.add('hidden');
    }, 600);
  }

  // 11. Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const navHeight = document.getElementById('navbar')?.offsetHeight || 64;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});

// Re-init Lucide after any dynamic content update
window.reinitLucide = function () {
  if (typeof lucide !== 'undefined') lucide.createIcons();
};

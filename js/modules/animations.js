/**
 * Animations Module - IntersectionObserver based AOS
 */
function initAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-aos]').forEach((el) => {
    observer.observe(el);
  });
}

// Re-run after dynamic content loads (portfolio cards, etc.)
function refreshAnimations() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
  );

  document.querySelectorAll('[data-aos]:not(.aos-visible)').forEach((el) => {
    observer.observe(el);
  });
}

// Expose globally
window.initAnimations = initAnimations;
window.refreshAnimations = refreshAnimations;

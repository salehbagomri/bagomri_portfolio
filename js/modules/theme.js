/**
 * Theme Module — Light theme only (no dark mode)
 * Kept for compatibility, does nothing except ensure clean state.
 */
function initTheme() {
  // Remove any leftover dark theme classes
  document.body.classList.remove('theme-dark', 'theme-light');
  document.documentElement.removeAttribute('data-theme');
  // Force light meta theme color
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) metaTheme.setAttribute('content', '#221461');
}

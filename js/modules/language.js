/**
 * Language Module — Arabic (RTL) / English (LTR) toggle
 */
const LANG_KEY = 'bagomri_lang';

function initLanguage() {
  const saved = localStorage.getItem(LANG_KEY) || 'ar';
  applyLanguage(saved);

  const btn = document.getElementById('langToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const current = document.documentElement.lang || 'ar';
      const next = current === 'ar' ? 'en' : 'ar';
      applyLanguage(next);
      localStorage.setItem(LANG_KEY, next);
    });
  }
}

function applyLanguage(lang) {
  const isAr = lang === 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = isAr ? 'rtl' : 'ltr';

  // Translate all elements with data-ar / data-en
  document.querySelectorAll('[data-ar], [data-en]').forEach((el) => {
    const text = isAr ? el.dataset.ar : el.dataset.en;
    if (text !== undefined) el.textContent = text;
  });

  // Translate placeholders
  document.querySelectorAll('[data-ar-placeholder], [data-en-placeholder]').forEach((el) => {
    const ph = isAr ? el.dataset.arPlaceholder : el.dataset.enPlaceholder;
    if (ph !== undefined) el.placeholder = ph;
  });

  // Update blog read-more arrows direction
  document.querySelectorAll('.blog-read-more [data-lucide]').forEach((icon) => {
    icon.setAttribute('data-lucide', isAr ? 'arrow-left' : 'arrow-right');
  });

  // Refresh Lucide icons after direction change
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Compatibility shim — exposes getCurrentLanguage() for legacy modules
const languageManager = {
  getCurrentLanguage: () => document.documentElement.lang || 'ar',
};

// Expose initLanguage globally
window.initLanguage = initLanguage;
window.applyLanguage = applyLanguage;
window.languageManager = languageManager;

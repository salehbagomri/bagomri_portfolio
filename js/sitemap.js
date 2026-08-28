/**
 * Dynamic Sitemap Generator
 * js/sitemap.js — generates sitemap content for /sitemap.xml
 * NOTE: On Firebase Hosting (static), we generate sitemap.xml as a static file
 * that gets re-generated on deploy via the build script.
 * This script generates & injects sitemap into DOM for the sitemap.xml served file.
 */

const SITE_URL = 'https://bagomri.com';

const STATIC_PAGES = [
  { loc: '/',        priority: '1.0', changefreq: 'weekly'  },
  { loc: '/blog',    priority: '0.9', changefreq: 'daily'   },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms',   priority: '0.3', changefreq: 'yearly'  },
];

async function buildSitemap() {
  let urls = STATIC_PAGES.map(p => `
  <url>
    <loc>${SITE_URL}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`).join('');

  try {
    const { initializeApp, getApps } = firebase;
    const db = firebase.firestore();

    const snap = await db.collection('articles')
      .where('published', '==', true)
      .orderBy('publishedAt', 'desc')
      .get();

    snap.docs.forEach(doc => {
      const data = doc.data();
      const slug = data.slug;
      if (!slug) return;

      const ts = data.updatedAt || data.publishedAt;
      const lastmod = ts && ts.toDate
        ? ts.toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      urls += `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });
  } catch (e) {
    console.warn('Sitemap: could not fetch articles from Firestore', e);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

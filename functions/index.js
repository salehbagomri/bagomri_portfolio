/**
 * sitemap - Firebase Cloud Function
 * Route: /sitemap.xml (via firebase.json rewrite)
 *
 * Dynamically fetches all published articles from Firestore
 * and returns a valid XML sitemap on every request.
 *
 * No manual update needed - sitemap always reflects live data.
 */

const { onRequest } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');

initializeApp();

const SITE_URL = 'https://bagomri.com';

/** Static pages always included in the sitemap */
const STATIC_PAGES = [
  { loc: '/',        priority: '1.0', changefreq: 'weekly'  },
  { loc: '/blog',    priority: '0.9', changefreq: 'daily'   },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms',   priority: '0.3', changefreq: 'yearly'  },
];

/** Format a Firestore Timestamp or Date to ISO date string (YYYY-MM-DD) */
function toISODate(value) {
  if (!value) return new Date().toISOString().split('T')[0];
  const date = value instanceof Timestamp ? value.toDate() : new Date(value);
  return date.toISOString().split('T')[0];
}

/** Escape special characters for XML */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Build one <url> block */
function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = [`  <url>`, `    <loc>${escapeXml(loc)}</loc>`];
  if (lastmod)    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority)   lines.push(`    <priority>${priority}</priority>`);
  lines.push(`  </url>`);
  return lines.join('\n');
}

exports.sitemap = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 15,
    memory: '128MiB',
  },
  async (req, res) => {
    try {
      const db = getFirestore();

      // 1. Build static page entries
      const entries = STATIC_PAGES.map(p =>
        urlEntry({
          loc: `${SITE_URL}${p.loc}`,
          changefreq: p.changefreq,
          priority: p.priority,
        })
      );

      // 2. Fetch published articles from Firestore
      const snap = await db
        .collection('articles')
        .where('published', '==', true)
        .orderBy('publishedAt', 'desc')
        .get();

      let articleCount = 0;
      snap.forEach(doc => {
        const data = doc.data();
        const slug = data.slug;
        if (!slug) return; // skip articles without slug

        const lastmod = toISODate(data.updatedAt || data.publishedAt);

        entries.push(urlEntry({
          loc: `${SITE_URL}/blog/${escapeXml(slug)}`,
          lastmod,
          changefreq: 'monthly',
          priority: '0.7',
        }));
        articleCount++;
      });

      console.log(`Sitemap generated: ${STATIC_PAGES.length} static + ${articleCount} articles`);

      // 3. Build final XML
      const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...entries,
        '</urlset>',
      ].join('\n');

      // 4. Return XML with correct headers
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.set('Cache-Control', 'public, max-age=3600, s-maxage=3600'); // cache 1 hour
      res.status(200).send(xml);
    } catch (err) {
      console.error('Sitemap generation error:', err);
      // On error, return a minimal valid sitemap (don't break search engines)
      const fallback = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...STATIC_PAGES.map(p =>
          urlEntry({ loc: `${SITE_URL}${p.loc}`, priority: p.priority })
        ),
        '</urlset>',
      ].join('\n');
      res.set('Content-Type', 'application/xml; charset=utf-8');
      res.status(200).send(fallback);
    }
  }
);

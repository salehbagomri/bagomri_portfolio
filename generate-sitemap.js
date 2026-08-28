/**
 * generate-sitemap.js
 * ─────────────────────────────────────────────
 * Auto-run BEFORE every firebase deploy via predeploy hook in firebase.json.
 * Fetches all published articles from Firestore REST API (no auth needed for public data).
 * Writes sitemap.xml so search engines always get fresh URLs.
 *
 * Usage (auto via firebase.json predeploy):
 *   node generate-sitemap.js
 *
 * Manual usage:
 *   node generate-sitemap.js
 */

const https  = require('https');
const fs     = require('fs');
const path   = require('path');

// ── CONFIG ────────────────────────────────────────────────
const SITE_URL    = 'https://bagomri.com';
const PROJECT_ID  = 'bagomri-portfolio';
const OUTPUT_FILE = path.join(__dirname, 'sitemap.xml');

/** Static pages always in sitemap */
const STATIC_PAGES = [
  { loc: '/',        priority: '1.0', changefreq: 'weekly'  },
  { loc: '/blog',    priority: '0.9', changefreq: 'daily'   },
  { loc: '/privacy', priority: '0.3', changefreq: 'yearly'  },
  { loc: '/terms',   priority: '0.3', changefreq: 'yearly'  },
];

// ── HELPERS ───────────────────────────────────────────────
function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function urlEntry({ loc, lastmod, changefreq, priority }) {
  const lines = ['  <url>', `    <loc>${loc}</loc>`];
  if (lastmod)    lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority)   lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

function toISODate(value) {
  if (!value) return new Date().toISOString().split('T')[0];
  // Firestore REST API returns timestamps as { seconds, nanos } or ISO string
  if (value.seconds) return new Date(value.seconds * 1000).toISOString().split('T')[0];
  return new Date(value).toISOString().split('T')[0];
}

/** Fetch all published articles via Firestore REST API */
function fetchPublishedArticles() {
  return new Promise((resolve, reject) => {
    // Firestore REST API — structured query
    const body = JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'articles' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'published' },
            op: 'EQUAL',
            value: { booleanValue: true },
          },
        },
        orderBy: [{ field: { fieldPath: 'publishedAt' }, direction: 'DESCENDING' }],
        select: {
          fields: [
            { fieldPath: 'slug' },
            { fieldPath: 'publishedAt' },
            { fieldPath: 'updatedAt' },
          ],
        },
      },
    });

    const options = {
      hostname: 'firestore.googleapis.com',
      path: `/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const results = JSON.parse(data);
          const articles = [];

          results.forEach(item => {
            if (!item.document) return; // skip empty results
            const fields = item.document.fields || {};
            const slug = fields.slug?.stringValue;
            if (!slug) return;

            const updatedAt   = fields.updatedAt?.timestampValue;
            const publishedAt = fields.publishedAt?.timestampValue;
            const lastmod     = toISODate(updatedAt || publishedAt);

            articles.push({ slug, lastmod });
          });

          resolve(articles);
        } catch (e) {
          reject(new Error('Failed to parse Firestore response: ' + e.message));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ── MAIN ──────────────────────────────────────────────────
async function generateSitemap() {
  console.log('🗺️  Generating sitemap.xml...');

  // 1. Static pages
  const entries = STATIC_PAGES.map(p =>
    urlEntry({
      loc: `${SITE_URL}${p.loc}`,
      changefreq: p.changefreq,
      priority: p.priority,
    })
  );

  // 2. Articles from Firestore
  let articleCount = 0;
  try {
    const articles = await fetchPublishedArticles();
    for (const { slug, lastmod } of articles) {
      entries.push(urlEntry({
        loc: `${SITE_URL}/blog/${escapeXml(slug)}`,
        lastmod,
        changefreq: 'monthly',
        priority: '0.7',
      }));
      articleCount++;
    }
    console.log(`   ✅ Fetched ${articleCount} published article(s) from Firestore`);
  } catch (err) {
    console.warn(`   ⚠️  Could not fetch articles: ${err.message}`);
    console.warn('   ℹ️  Sitemap will contain static pages only.');
  }

  // 3. Build XML
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '', // trailing newline
  ].join('\n');

  // 4. Write file
  fs.writeFileSync(OUTPUT_FILE, xml, 'utf8');

  const totalUrls = STATIC_PAGES.length + articleCount;
  console.log(`   📄 sitemap.xml written — ${totalUrls} URL(s) total`);
  console.log(`   📍 Output: ${OUTPUT_FILE}`);
}

generateSitemap().catch(err => {
  console.error('❌ Sitemap generation failed:', err.message);
  // Don't exit with error — let deploy continue with existing sitemap
  process.exit(0);
});

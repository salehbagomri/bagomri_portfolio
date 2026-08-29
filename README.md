# 🚀 Bagomri Portfolio & Blog — Saleh Bagomri

<div align="center">

**Official Portfolio & Technical Blog of Saleh Bagomri**  
*Kotlin & Android Developer (Former Flutter Developer)*

[Live Website](https://bagomri.com) • [Blog](https://bagomri.com/blog.html) • [Admin Panel](https://bagomri.com/admin.html)

</div>

---

## 🌟 Key Features

- 📱 **Kotlin & Android First** — Showcasing native Android development (Kotlin, Jetpack Compose, Coroutines, MVVM, Clean Architecture) alongside cross-platform Flutter experience.
- ⚡ **Direct Firestore REST Engine** — Ultra-fast data fetching (~100ms) with zero WebSocket connection stalls, fully immune to network restrictions and ISP proxy blocks.
- 🖼️ **In-App Lightbox Gallery** — Interactive full-screen screenshot viewer with keyboard navigation, counter, and touch-friendly controls.
- 🎨 **Clean Light Design System** — Built on high-performance Vanilla CSS with modern typography (`Inter` + `Noto Sans Arabic`) and `Lucide` vector icons.
- 🌐 **Bilingual (RTL / LTR)** — Seamless instant switching between Arabic and English with complete typography, layout, and meta adaptation.
- 📝 **Dynamic Firestore Blog Engine** — Real-time articles with slug-based routing, category filtering, reading time calculation, and SEO-optimized HTML rendering.
- 💼 **Dynamic Portfolio Engine** — Live projects fetched from Firestore with targeted software filters (`Kotlin & Android`, `Flutter`), screenshots galleries, and modal details.
- ⚙️ **Modern Admin Control Panel** — Secure administration dashboard for managing projects, articles, image uploads to Cloudinary CDN, draft/published status, and stats overview.
- 📬 **Interactive Contact System** — Contact form integrated with EmailJS for direct inbox notifications and Firestore archive.
- 🗺️ **Automated Sitemap Generation** — Predeploy hook generates dynamic, search-engine-ready `sitemap.xml` directly from published Firestore articles.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Core** | Semantic HTML5, Modular Vanilla JavaScript (ES6+ Modules) |
| **Styling** | Vanilla CSS3 Design System with CSS Variables (`css/main.css`) |
| **Data Fetching** | Direct Firestore REST API (HTTPS GET/POST) + LocalStorage 0ms Cache |
| **Icons & Fonts** | Lucide Icons, FontAwesome SVG, Google Fonts (`Inter`, `Noto Sans Arabic`) |
| **Backend & Auth** | Firebase Firestore, Firebase Authentication, Firebase Hosting |
| **Media Hosting** | Cloudinary CDN (`dk5buckt1` cloud) |
| **Messaging** | EmailJS Browser SDK |
| **Monetization & SEO** | Google AdSense (`ads.txt`), OpenGraph / Schema.org JSON-LD, Dynamic `sitemap.xml` |

---

## 📁 Project Structure

```
bagomri_portfolio/
├── index.html              # Main homepage (Hero, About, Portfolio, Blog Preview, Contact)
├── blog.html               # Blog listing page with search and category filters
├── article.html            # Dynamic single article view (slug-based routing & SEO)
├── admin.html              # Admin Control Panel for projects and articles management
├── privacy.html            # Privacy policy page (AdSense & GDPR compliant)
├── terms.html              # Terms of service page
├── ads.txt & app-ads.txt   # Google AdSense verification files
├── generate-sitemap.js     # Predeploy script that dynamically builds sitemap.xml
├── sitemap.xml             # Auto-generated XML sitemap
│
├── assets/                 # Static media assets
│   ├── images/             # Logos, profile photos, and fallback banners
│   ├── icons/              # Verified SVG brand icons
│   └── files/              # Resume / CV PDF (saleh-bagomri-cv.pdf)
│
├── css/                    # Compiled and core stylesheets
│   ├── main.css            # Primary design system and shared components
│   ├── blog.css            # Blog listing specific styles
│   └── article.css         # Article reader typography and syntax styles
│
├── js/                     # JavaScript application logic
│   ├── config.js           # Firebase and Cloudinary configuration
│   ├── main.js             # Client-side bootstrap and module orchestrator
│   ├── admin.js            # Admin panel projects management logic
│   ├── blog-admin.js       # Admin panel blog management logic
│   └── modules/            # Reusable ES6 client modules
│       ├── firebase.js     # Direct REST API service & Firebase client
│       ├── portfolio.js    # Dynamic projects fetching, lightbox & modal
│       ├── blog.js         # Articles engine, preview & single view
│       ├── language.js     # RTL/LTR and bilingual translation engine
│       ├── navigation.js   # Sticky navbar and mobile drawer handler
│       ├── contact.js      # Form validation and EmailJS dispatch
│       ├── notifications.js# Toast notifications system
│       └── animations.js   # IntersectionObserver scroll animations
│
├── firestore.rules         # Security rules for Firestore collections
├── firestore.indexes.json  # Composite index definitions
├── firebase.json           # Firebase Hosting & predeploy build configuration
└── package.json            # Tooling and scripts
```

---

## 🚀 Local Development & Deployment

1. **Clone the repository**:
   ```bash
   git clone https://github.com/salehbagomri/bagomri_portfolio.git
   cd bagomri_portfolio
   ```

2. **Serve locally**:
   ```bash
   npx serve .
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Deploy to Firebase Hosting**:
   ```bash
   firebase deploy --only hosting
   ```
   *(The predeploy hook will automatically run `generate-sitemap.js` and publish the latest `sitemap.xml`)*

---

## 🔒 Security & Firestore Rules

- **Projects & Articles**: Publicly readable via direct REST API and client SDK (`allow read: if true;` for published articles). Create, update, and delete actions require admin authentication (`allow write: if request.auth != null;`).
- **Contacts**: Write-only for visitors with strict schema validation. Read/delete restricted to authenticated administrators.
- **Analytics**: Write-only for anonymous traffic logging.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — © 2026 **Saleh Bagomri**.

# 🚀 Bagomri Portfolio — Saleh Bagomri

<div align="center">

**Official Portfolio & Blog of Saleh Bagomri**  
*Kotlin & Android Developer*

[Live Website](https://bagomri.com) • [Blog](https://bagomri.com/blog.html) • [Admin Panel](https://bagomri.com/admin.html)

</div>

---

## 🌟 Key Features

- 📱 **Kotlin & Android First** — Showcasing native Android development, Jetpack Compose, MVVM architecture, and cross-platform Flutter experience.
- 🎨 **Clean Light Design System** — Built on high-performance Vanilla CSS with modern typography (`Inter` + `Noto Sans Arabic`) and `Lucide` icons.
- 🌐 **Bilingual (RTL / LTR)** — Seamless instant switching between Arabic and English with full typography and layout adaptation.
- 📝 **Dynamic Firestore Blog** — Real-time articles engine with slug-based routing, category filtering, reading time estimates, and rich HTML rendering.
- 💼 **Dynamic Portfolio Engine** — Live projects fetched from Firestore with multi-category filters, full screenshots galleries, features checklists, and interactive modal dialogs.
- ⚙️ **Modern Admin Control Panel** — Protected administration dashboard for managing projects, articles, image uploads to Cloudinary, draft/published status, and stats overview.
- 📬 **Interactive Contact System** — Contact form integrated with EmailJS and Firestore storage with validation.
- ⚡ **Zero Framework Overhead** — Blazing fast load times using native HTML5, modular Vanilla ES6 JavaScript, and lightweight assets.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Core** | Semantic HTML5, Modular Vanilla JavaScript (ES6+ Modules) |
| **Styling** | Vanilla CSS3 Design System with CSS Variables (`css/main.css`) |
| **Icons & Fonts** | Lucide Icons, Google Fonts (`Inter`, `Noto Sans Arabic`) |
| **Backend & Auth** | Firebase Firestore, Firebase Authentication, Firebase Hosting |
| **Media Hosting** | Cloudinary CDN (`dk5buckt1` cloud, unsigned preset) |
| **Messaging** | EmailJS Browser SDK |

---

## 📁 Project Structure

```
bagomri_portfolio/
├── index.html              # Main homepage (Hero, About, Portfolio, Blog Preview, Contact)
├── blog.html               # Blog listing page with search and category filters
├── article.html            # Dynamic single article view (slug-based routing)
├── admin.html              # Admin Control Panel for projects and articles management
├── privacy.html            # Privacy policy page
├── terms.html              # Terms of service page
├── ads.txt & app-ads.txt   # AdSense verification files
│
├── assets/                 # Static media assets
│   ├── images/             # Logos, profile photos, and fallback banners
│   ├── icons/              # SVG icons
│   └── fonts/              # Local webfonts
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
│       ├── firebase.js     # Firestore service & visitor analytics
│       ├── portfolio.js    # Dynamic projects fetching, rendering & modal
│       ├── blog.js         # Articles engine, preview & single view
│       ├── language.js     # RTL/LTR and bilingual translation engine
│       ├── navigation.js   # Sticky navbar and mobile drawer handler
│       ├── contact.js      # Form validation and EmailJS dispatch
│       ├── notifications.js# Toast notifications system
│       ├── animations.js   # IntersectionObserver scroll animations
│       └── theme.js        # Light theme enforcement helper
│
├── docs/                   # Developer documentation & setup guides
│   ├── ARCHITECTURE.md     # System architecture and data flow
│   ├── DECISIONS.md        # Architectural decision records (ADR)
│   ├── EMAILJS_SETUP.md    # Email service configuration instructions
│   ├── QUICKSTART.md       # Local development setup guide
│   └── TASKS.md            # Feature roadmap and tasks list
│
├── firestore.rules         # Security rules for Firestore collections
├── firestore.indexes.json  # Composite index definitions
├── firebase.json           # Firebase Hosting configuration
└── package.json            # NPM scripts and tooling dependencies
```

---

## 🚀 Local Development

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

3. **Deploy to Firebase**:
   ```bash
   firebase deploy --only hosting
   ```

---

## 🔒 Security & Firestore Rules

- **Projects & Articles**: Publicly readable (`allow read: if true;`). Create, update, and delete actions require admin authentication (`allow write: if request.auth != null;`).
- **Contacts**: Write-only for visitors with strict schema validation. Read/delete restricted to administrators.
- **Visitors Counter**: Protected atomic increments for unique daily visitor tracking.

---

## 📄 License

© 2026 **Saleh Bagomri**. All rights reserved.

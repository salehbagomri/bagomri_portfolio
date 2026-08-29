# 🚀 Bagomri Portfolio & Technical Blog

A high-performance, modular portfolio and engineering blog platform engineered for **Saleh Bagomri** (Kotlin & Android Developer). Built with native web standards, zero framework overhead, direct Firestore REST integration, and complete bilingual (Arabic & English) optimization.

[![Website](https://img.shields.io/badge/Live_Website-bagomri.com-221461?style=for-the-badge&logo=google-chrome&logoColor=white)](https://bagomri.com)
[![Firebase](https://img.shields.io/badge/Hosted_on-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-MIT-059669?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web_SPA-4F46E5?style=for-the-badge)](https://bagomri.com)

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Data Flow](#-architecture--data-flow)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Local Development & Deployment](#-local-development--deployment)
- [Security & Performance Engineering](#-security--performance-engineering)
- [Author & Connect](#-author--connect)
- [License](#-license)

---

## 📖 Overview

The **Bagomri Portfolio** is designed to provide an executive showcase of production mobile applications (Kotlin, Jetpack Compose, Flutter) and in-depth software engineering articles.

Unlike conventional portfolios built on heavy client-side frameworks, this platform is engineered with **Modular Vanilla ES6 JavaScript** and a **Tailored CSS Design System**. It achieves 0ms instant cached rendering and ultra-fast ~100ms real-time data synchronization via direct Cloud Firestore REST APIs, completely immune to WebSocket connection limits or regional ISP throttles.

---

## 🌟 Key Features

### 📱 Engineering Showcase (Kotlin & Android First)
- **Targeted Categorization:** Filter projects by `Kotlin & Android` and `Flutter`.
- **In-App Lightbox Gallery:** Interactive full-screen screenshot preview with keyboard navigation, counter, and mobile gesture support.
- **Detailed Modal Specs:** Role breakdown, project timeline, technical features checklist, GitHub repository links, and Google Play Store deep links.

### 📝 Dynamic Technical Blog Engine
- **Direct REST Data Engine:** Instant article retrieval using Firestore REST `runQuery` endpoints.
- **Slug-Based Routing:** Clean, search-engine-friendly URLs (`/blog` and `/article?slug=...`).
- **Reading Time & Meta:** Dynamic calculation of reading estimates, tag filtering, and publication date formatting.

### 🌐 Native Bilingual Engine (Arabic & English)
- **Instant Toggle:** Bidirectional typography and layout flipping between RTL (Arabic) and LTR (English).
- **Persistent State:** User language preference remembered via `localStorage` across all pages.

### ⚙️ Full-Featured Admin Control Panel
- **Authenticated Dashboard:** Protected admin portal for managing projects and blog posts.
- **Rich Markdown / HTML Support:** Create, preview, edit, and publish technical articles.
- **Cloudinary CDN Integration:** Direct unsigned image uploading for project assets and article banners.

### 📬 Direct Inquiries & Notifications
- **Contact Pipeline:** Validated contact form integrated with **EmailJS** for instant inbox notifications and Firestore archival.

### 🗺️ Dynamic Automated Sitemap
- **Predeploy Hook:** Generates an updated `sitemap.xml` directly from published Firestore articles prior to each hosting deployment.

---

## 🏗️ Architecture & Data Flow

```
[ Visitor / Client Browser ]
             │
             ├── 1. Instant Cache Check (localStorage: 0ms Render)
             ├── 2. Direct HTTPS REST API GET/POST (Firestore: ~100ms)
             │
             ▼
┌────────────────────────────────────────────────────────┐
│               Bagomri Client Platform                  │
│                                                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
│  │ Portfolio.js  │ │    Blog.js    │ │  Language.js  │ │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ │
│          │                 │                 │         │
│          ▼                 ▼                 ▼         │
│  ┌───────────────────────────────────────────────────┐ │
│  │     Direct REST Fetcher & Local Cache Engine      │ │
│  └─────────────────────────┬─────────────────────────┘ │
└────────────────────────────┼───────────────────────────┘
                             │
                             ▼
┌────────────────────────────────────────────────────────┐
│             Google Cloud / Firebase Edge               │
│                                                        │
│  ┌───────────────────┐       ┌──────────────────────┐  │
│  │ Firebase Hosting  │       │ Cloud Firestore REST │  │
│  └───────────────────┘       └──────────────────────┘  │
│  ┌───────────────────┐       ┌──────────────────────┐  │
│  │ Firebase Auth     │       │ EmailJS Dispatcher   │  │
│  └───────────────────┘       └──────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Core Architecture** | Semantic HTML5, Modular ES6+ JavaScript | High-performance, zero-framework footprint |
| **Styling & Theme** | Vanilla CSS3 Variables (`css/main.css`) | Custom light design system, glassmorphism, responsive grid |
| **Data Engine** | Cloud Firestore REST API + LocalStorage | Instant 0ms cache with fast ~100ms cloud synchronization |
| **Cloud Hosting** | Firebase Hosting | Global CDN with custom domain SSL (`bagomri.com`) |
| **Media Delivery** | Cloudinary CDN | High-resolution image hosting and thumbnail optimization |
| **Email Delivery** | EmailJS Browser SDK | Client-side form delivery without standalone servers |
| **Icons & Typography** | Lucide Icons, FontAwesome SVG, Google Fonts | `Inter` and `Noto Sans Arabic` typography |
| **Monetization & SEO** | Google AdSense (`ads.txt`), JSON-LD | OpenGraph metadata, Schema.org Person & Article schemas |

---

## 📁 Project Directory Structure

```
bagomri_portfolio/
├── index.html              # Homepage (Hero, About, Portfolio Grid, Blog Preview, Contact)
├── blog.html               # Blog directory with search, category filtering & pagination
├── article.html            # Article reading view (slug routing, syntax styling, SEO)
├── admin.html              # Protected Admin Control Panel for projects and articles
├── privacy.html            # Privacy Policy (AdSense & GDPR compliant)
├── terms.html              # Terms and Conditions
├── ads.txt & app-ads.txt   # Google AdSense publisher verification files
├── generate-sitemap.js     # Automated predeploy script for dynamic sitemap.xml
├── sitemap.xml             # Auto-generated XML sitemap
│
├── assets/                 # Static production assets
│   ├── images/             # Vector logo (`logo.svg`) and profile photo (`profile.png`)
│   ├── icons/              # Verified brand SVGs (`behance-brands-solid-full.svg`)
│   └── files/              # Downloadable Resume (`saleh-bagomri-cv.pdf`)
│
├── css/                    # Stylesheets
│   ├── main.css            # Primary design system, components & lightbox
│   ├── blog.css            # Blog directory specific styling
│   └── article.css         # Article typography and code highlight styling
│
├── js/                     # Application scripts
│   ├── config.js           # Firebase, Cloudinary & global site configuration
│   ├── main.js             # Client bootstrap and module lifecycle orchestrator
│   ├── admin.js            # Admin panel project CRUD logic
│   ├── blog-admin.js       # Admin panel article management and editor
│   └── modules/            # Modular ES6 components
│       ├── firebase.js     # Direct REST API client and Auth service
│       ├── portfolio.js    # Dynamic project rendering, lightbox gallery & modal
│       ├── blog.js         # Articles engine, preview builder & single view
│       ├── language.js     # Bilingual translation engine (Arabic/English)
│       ├── navigation.js   # Sticky navbar and mobile drawer handler
│       ├── contact.js      # Form validation and EmailJS dispatch
│       ├── notifications.js# Toast notification banner system
│       └── animations.js   # IntersectionObserver scroll animations
│
├── firestore.rules         # Cloud Firestore security rules
├── firestore.indexes.json  # Database composite indexes
├── firebase.json           # Firebase Hosting and predeploy hooks
└── package.json            # Tooling and scripts
```

---

## 🚀 Local Development & Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/salehbagomri/bagomri_portfolio.git
cd bagomri_portfolio
```

### 2. Run Locally
You can serve the directory using any static file server:
```bash
npx serve .
```
Navigate to `http://localhost:3000` in your web browser.

### 3. Deploy to Firebase
Deploy to live production with automatic sitemap generation:
```bash
firebase deploy --only hosting
```

---

## 🔒 Security & Performance Engineering

- **Clean Security Rules:** Firestore rules enforce authenticated write access for projects and articles, while contact submissions are write-only with rigorous schema validation.
- **Direct REST Querying:** Eliminates persistent duplex channel stalls (`Listen/channel`) on constrained mobile networks.
- **Zero Framework Overhead:** Clean, hand-crafted JavaScript ensures sub-second Time to Interactive (TTI) on all devices.
- **Search Engine Optimization (SEO):** Full OpenGraph tags, Twitter Cards, Schema.org JSON-LD microdata, and automatic sitemap updates.

---

## 👨‍💻 Author & Connect

**Saleh Bagomri**  
*Kotlin & Android Developer | Computer Science Graduate*

- 🌐 **Portfolio:** [bagomri.com](https://bagomri.com)
- 🐙 **GitHub:** [@salehbagomri](https://github.com/salehbagomri)
- 💼 **LinkedIn:** [salehbagomri](https://www.linkedin.com/in/salehbagomri)
- 🎨 **Behance:** [salehbbagomri](https://www.behance.net/salehbbagomri)
- 💬 **WhatsApp:** [+967 770 727 055](https://wa.me/967770727055)
- 📧 **Email:** [s.bagomri@gmail.com](mailto:s.bagomri@gmail.com)

---

## 📄 License

This project is open-source software licensed under the [MIT License](LICENSE).  
Copyright (c) 2026 **Saleh Bagomri**.

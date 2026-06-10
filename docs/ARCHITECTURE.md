# بنية المشروع التقنية

## نظرة عامة
بورتفوليو ويب SPA (Single Page Application) ثنائي اللغة (عربي/إنجليزي) ثنائي الثيم (داكن/فاتح)، مبني بـ Vanilla JavaScript مع Firebase كـ backend لإدارة الزوار والتعليقات ونماذج التواصل.

---

## البنية المعمارية
```
index.html  (UI Layer — هيكل الصفحة الوحيدة)
    ↓
js/main.js — App class (Orchestrator)
    ↓ يُهيّئ بالترتيب
js/modules/*.js — 10 Feature Managers
    ↓ عمليات قاعدة البيانات
js/modules/firebase.js — Firebase Service Layer
    ↓
Firestore Database (eur3/Europe) + Firebase Hosting
```

---

## الـ Modules الرئيسية

| Module | المسار | الوظيفة |
|--------|--------|---------|
| App | `js/main.js` | Controller رئيسي، يُهيّئ الـ managers بالترتيب |
| Firebase | `js/modules/firebase.js` | جميع عمليات Firestore (visitors, comments, contacts, analytics) |
| Theme | `js/modules/theme.js` | Dark/Light theme مع localStorage للحفظ |
| Language | `js/modules/language.js` | تبديل AR/EN مع RTL/LTR عبر data attributes |
| Navigation | `js/modules/navigation.js` | Navbar، تحديد القسم النشط، scroll behavior |
| Animations | `js/modules/animations.js` | AOS (Animate On Scroll) + micro-interactions |
| Portfolio | `js/modules/portfolio.js` | Grid المشاريع، فلترة (Flutter/UI-UX/Graphic)، modal تفصيلي |
| Lab | `js/modules/lab.js` | قسم المختبر — روابط تفاعلية (GitHub, Figma, App Store) |
| Guestbook | `js/modules/guestbook.js` | نظام التعليقات مع ردود الفعل (emoji reactions) |
| Contact | `js/modules/contact.js` | نموذج التواصل + تحقق + Firestore + EmailJS |
| Notifications | `js/modules/notifications.js` | نظام Toast notifications |

---

## بنية SASS

| الطبقة | المسار | المحتوى |
|--------|--------|---------|
| abstracts | `sass/abstracts/` | متغيرات الألوان والخطوط والـ spacing + mixins قابلة للإعادة |
| base | `sass/base/` | تعريف الخطوط، reset عام، keyframe animations |
| components | `sass/components/` | أزرار، بطاقات، نماذج، modals، toasts |
| layout | `sass/layout/` | شريط التنقل (Navbar) |
| pages | `sass/pages/` | أنماط مخصصة لكل قسم (home, portfolio, lab, services, contact) |

الناتج النهائي: `css/main.css` — لا تعدّله مباشرة، شغّل `npm run sass` بعد أي تعديل SASS.

---

## Firebase Collections وقواعد الأمان

| Collection | Read | Create | Update | Delete |
|-----------|------|--------|--------|--------|
| `visitors` | عام | أنونيموس (firstVisit, lastVisit, visitCount) | أنونيموس | لا |
| `comments` | عام (approved=true فقط) | أنونيموس (name: 2-50، text: 3-500 حرف) | reactions & reactedBy فقط | لا |
| `contacts` | ممنوع (admin فقط) | أنونيموس (name, email, subject, message بقيود صارمة) | لا | لا |
| `analytics` | ممنوع | أنونيموس | لا | لا |

Firestore index: `comments` مرتب بـ `approved ASC` + `timestamp DESC`

---

## الثوابت والإعدادات المهمة

```javascript
// جميعها في js/config.js — لا تكتب هنا القيم الحساسة

Firebase project ID : 'bagomri-portfolio'   // js/config.js
Firestore region   : 'eur3' (Europe)        // firebase.json
Default language   : 'ar'                   // siteConfig.settings
Default theme      : 'dark'                 // siteConfig.settings
Animation speed    : 300ms                  // siteConfig.settings
Toast duration     : 5000ms                 // siteConfig.settings
EmailJS service    : 'service_bagomri'      // emailConfig
```

---

## تدفق البيانات — مثال (نموذج التواصل)
1. المستخدم يملأ النموذج في `index.html` (قسم Contact)
2. `contactManager` يتحقق من صحة البيانات
3. `firebaseService.saveContact()` يحفظ في Firestore → `contacts/`
4. `emailConfig` يرسل إشعار بريدي عبر EmailJS إلى s.bagomri@gmail.com
5. `notificationManager.success()` يعرض Toast للمستخدم

---

## قرارات تقنية مهمة
راجع `docs/DECISIONS.md` للتفاصيل الكاملة.

| القرار | البديل المرفوض | السبب المختصر |
|--------|---------------|--------------|
| Vanilla JS | React / Vue | بورتفوليو ثابت لا يحتاج state معقد |
| Firebase | خادم مخصص | مجاني، بدون إدارة خادم |
| SASS | CSS عادي | متغيرات ومixins لإدارة الثيم |
| eur3 (Europe) | us-central | latency أقل للجمهور العربي |
| Graphik Arabic محلي | Google Fonts | أداء أفضل بدون external request |

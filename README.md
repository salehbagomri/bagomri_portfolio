# 🎨 Bagomri Portfolio - بورتفوليو احترافي ثلاثي التخصص

<div dir="rtl">

بورتفوليو شخصي استثنائي يعكس الخبرة في ثلاث مجالات مترابطة:
- 📱 **تطوير Flutter**
- 🎨 **تصميم UI/UX**
- ✨ **تصميم الجرافيك**

</div>

---

## ✨ المميزات الرئيسية

### 🎯 التصميم والواجهة
- ✅ **Glassmorphism Effect** - تأثير زجاجي سائد في جميع العناصر
- ✅ **Dark/Light Theme** - ثيم داكن وفاتح مع تبديل سلس
- ✅ **RTL/LTR Support** - دعم كامل للعربية والإنجليزية
- ✅ **Responsive Design** - متجاوب بالكامل على جميع الأجهزة
- ✅ **Smooth Animations** - حركات انتقالية ناعمة ومايكرو-تفاعلات
- ✅ **Custom Fonts** - خط Graphik Arabic بجميع الأوزان

### 🚀 الوظائف التفاعلية
- ✅ **عداد الزوار** - يتتبع الزوار الفريدين باستخدام Firebase
- ✅ **نظام التعليقات** - دفتر زوار تفاعلي مع Firestore
- ✅ **إشعارات حية** - Toast notifications للتعليقات الجديدة
- ✅ **نموذج التواصل** - مع Smart Validation وربط Firebase
- ✅ **نظام الفلترة** - لتصنيف المشاريع (Flutter, UI/UX, Graphics)
- ✅ **Typing Effect** - تأثير كتابة متحرك في Hero Section

### 📱 الصفحات والأقسام
1. **الصفحة الرئيسية** - Hero section قوي مع 3 مشاريع مميزة
2. **صفحة المشاريع** - Portfolio كامل مع Case Studies
3. **مختبر الأعمال** - روابط تفاعلية للمشاريع (GitHub, Figma, App Store)
4. **الخدمات** - عرض تفصيلي للخدمات المقدمة
5. **التواصل** - نموذج ذكي مع معلومات التواصل

---

## 🛠️ التقنيات المستخدمة

### Frontend
- **HTML5** - بنية دلالية حديثة
- **SASS/SCSS** - CSS منظم ومعياري
- **Vanilla JavaScript** - JS نظيف ومنظم بوحدات (Modules)

### Backend & Database
- **Firebase Hosting** - استضافة سريعة وآمنة
- **Firebase Firestore** - قاعدة بيانات حية (Real-time)
- **Firebase Functions** - (اختياري) لإرسال الإيميلات

### الأدوات والمكتبات
- **Firebase SDK 10.7.1** - للتكامل مع Firebase
- **Google Fonts** - للخطوط المخصصة
- **SVG Icons** - أيقونات قابلة للتوسع

---

## 📁 هيكل المشروع

```
bagomri_portfolio/
│
├── index.html                 # الصفحة الرئيسية
│
├── assets/
│   ├── fonts/                 # ضع ملفات Graphik Arabic هنا
│   │   ├── GraphikArabic-Light.woff2
│   │   ├── GraphikArabic-Regular.woff2
│   │   ├── GraphikArabic-Medium.woff2
│   │   ├── GraphikArabic-Semibold.woff2
│   │   ├── GraphikArabic-Bold.woff2
│   │   └── GraphikArabic-Black.woff2
│   │
│   ├── images/
│   │   ├── logo.svg           # ضع الشعار هنا ⭐
│   │   ├── projects/          # صور المشاريع
│   │   └── lab/               # صور مشاريع المختبر
│   │
│   └── icons/                 # أيقونات إضافية
│
├── sass/
│   ├── abstracts/
│   │   ├── _variables.scss    # المتغيرات (ألوان، خطوط، إلخ)
│   │   └── _mixins.scss       # Mixins قابلة للاستخدام
│   │
│   ├── base/
│   │   ├── _fonts.scss        # تعريف الخطوط
│   │   ├── _base.scss         # Styles أساسية
│   │   └── _animations.scss   # Keyframes والحركات
│   │
│   ├── layout/
│   │   └── _navigation.scss   # Navbar والتنقل
│   │
│   ├── components/
│   │   └── _components.scss   # Buttons, Cards, Forms, Toasts
│   │
│   ├── pages/
│   │   ├── _home.scss         # Hero والصفحة الرئيسية
│   │   ├── _portfolio.scss    # صفحة المشاريع
│   │   ├── _lab-services.scss # Lab والخدمات
│   │   └── _contact.scss      # Contact والFooter
│   │
│   └── main.scss              # الملف الرئيسي
│
├── css/
│   └── main.css               # ملف CSS المترجم (compile من SASS)
│
├── js/
│   ├── config.js              # إعدادات Firebase والموقع
│   │
│   ├── modules/
│   │   ├── firebase.js        # خدمات Firebase
│   │   ├── theme.js           # إدارة الثيمات
│   │   ├── language.js        # إدارة اللغات
│   │   ├── navigation.js      # التنقل والNavbar
│   │   ├── animations.js      # الحركات والتأثيرات
│   │   ├── notifications.js   # Toast notifications
│   │   ├── portfolio.js       # إدارة المشاريع
│   │   ├── lab.js             # مختبر الأعمال
│   │   ├── guestbook.js       # دفتر الزوار
│   │   └── contact.js         # نموذج التواصل
│   │
│   └── main.js                # الملف الرئيسي للتطبيق
│
├── firebase.json              # إعدادات Firebase Hosting
├── firestore.rules            # قواعد أمان Firestore
├── firestore.indexes.json     # فهارس Firestore
├── .firebaserc                # مشروع Firebase
│
└── README.md                  # هذا الملف
```

---

## 🚀 خطوات التثبيت والنشر

### 1️⃣ الإعداد الأولي

<div dir="rtl">

#### أ. إعداد Firebase:
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. أنشئ مشروع جديد
3. فعّل **Firestore Database**
4. فعّل **Firebase Hosting**
5. انسخ إعدادات Firebase الخاصة بك

#### ب. تحديث الإعدادات:
افتح `js/config.js` وضع إعدادات Firebase:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

#### ج. تحديث معلوماتك:
في `js/config.js`، حدّث معلومات التواصل:

```javascript
contact: {
    email: 'your-email@domain.com',
    social: {
        github: 'https://github.com/yourusername',
        linkedin: 'https://linkedin.com/in/yourusername',
        // إلخ...
    }
}
```

</div>

### 2️⃣ إضافة المحتوى

<div dir="rtl">

#### الشعار (Logo):
- ضع ملف الشعار SVG في: `assets/images/logo.svg`

#### الخطوط (Fonts):
- ضع ملفات خط Graphik Arabic في: `assets/fonts/`
- الملفات المطلوبة:
  - GraphikArabic-Light.woff2
  - GraphikArabic-Regular.woff2
  - GraphikArabic-Medium.woff2
  - GraphikArabic-Semibold.woff2
  - GraphikArabic-Bold.woff2
  - GraphikArabic-Black.woff2

#### المشاريع:
- أضف صور المشاريع في: `assets/images/projects/`
- حدّث بيانات المشاريع في: `js/modules/portfolio.js`

</div>

### 3️⃣ ترجمة SASS إلى CSS

```bash
# تثبيت SASS (إذا لم يكن مثبتاً)
npm install -g sass

# ترجمة SASS
sass sass/main.scss css/main.css

# أو استخدم Watch mode للتطوير
sass --watch sass/main.scss:css/main.css
```

### 4️⃣ النشر على Firebase Hosting

```bash
# تثبيت Firebase CLI
npm install -g firebase-tools

# تسجيل الدخول
firebase login

# تهيئة المشروع
firebase init

# اختر:
# - Firestore
# - Hosting

# نشر القواعد الأمنية والموقع
firebase deploy

# أو نشر الموقع فقط
firebase deploy --only hosting
```

### 5️⃣ ربط دومين مخصص

<div dir="rtl">

1. اذهب إلى **Firebase Console** → **Hosting**
2. اضغط على "Add custom domain"
3. اتبع التعليمات لربط الدومين
4. انتظر حتى ينتشر SSL (قد يستغرق ساعات)

</div>

---

## 🔒 قواعد الأمان (Security Rules)

<div dir="rtl">

تم إعداد قواعد أمان صارمة في `firestore.rules`:

### التعليقات (Comments):
- ✅ **القراءة**: مسموح للجميع (التعليقات المعتمدة فقط)
- ✅ **الكتابة**: مسموح للجميع مع قيود:
  - الاسم: 2-50 حرف
  - النص: 3-500 حرف
- ❌ **التعديل والحذف**: ممنوع للزوار

### نموذج التواصل (Contacts):
- ❌ **القراءة**: ممنوع للجميع (Console فقط)
- ✅ **الكتابة**: مسموح مع قيود:
  - الاسم: 2-100 حرف
  - البريد: email صحيح
  - الموضوع: 3-200 حرف
  - الرسالة: 10-2000 حرف
- ❌ **التعديل والحذف**: ممنوع

### عداد الزوار (Visitors):
- ✅ **القراءة**: مسموح للجميع
- ✅ **الكتابة**: مسموح (create & update فقط)

</div>

---

## ⚙️ التخصيص والتعديل

### تغيير الألوان:
افتح `sass/abstracts/_variables.scss` وعدّل:

```scss
$color-primary: #6366F1;      // اللون الأساسي
$color-secondary: #EC4899;    // اللون الثانوي
$color-accent: #8B5CF6;       // لون التمييز
```

### تغيير الخطوط:
إذا أردت استخدام خط مختلف:
1. عدّل `sass/base/_fonts.scss`
2. حدّث المتغير `$font-primary` في `_variables.scss`

### إضافة صفحات:
1. أضف HTML في `index.html`
2. أنشئ SCSS جديد في `sass/pages/`
3. استورد الملف في `sass/main.scss`

---

## 🎯 نصائح للأداء

<div dir="rtl">

### الصور:
- استخدم صيغ حديثة: **WebP** للصور، **SVG** للأيقونات
- ضغط الصور قبل الرفع
- استخدم `loading="lazy"` للصور

### الخطوط:
- استخدم `font-display: swap`
- حمّل الأوزان المستخدمة فقط

### JavaScript:
- تم تنظيم الكود في وحدات منفصلة
- استخدم `defer` عند تحميل السكريبتات

### SASS:
- استخدم المتغيرات لتجنب التكرار
- استفد من الـ Mixins للكود المتكرر

</div>

---

## 📝 قائمة المهام

- [x] البنية الأساسية (HTML)
- [x] نظام الثيمات (Dark/Light)
- [x] دعم اللغات (AR/EN)
- [x] تكامل Firebase
- [x] عداد الزوار
- [x] نظام التعليقات
- [x] الإشعارات الحية
- [x] نموذج التواصل
- [x] صفحة المشاريع مع الفلترة
- [x] صفحة المختبر
- [ ] إضافة المحتوى الفعلي
- [ ] اختبار شامل
- [ ] تحسين SEO
- [ ] إضافة Analytics

---

## 🐛 المشاكل الشائعة والحلول

<div dir="rtl">

### ❌ Firebase لا يعمل:
- تأكد من إضافة إعدادات Firebase الصحيحة في `config.js`
- تأكد من تفعيل Firestore في Console
- راجع قواعد الأمان في `firestore.rules`

### ❌ الخطوط لا تظهر:
- تأكد من وضع ملفات الخطوط في المسار الصحيح
- راجع مسارات الخطوط في `sass/base/_fonts.scss`

### ❌ الـ CSS لا يعمل:
- تأكد من ترجمة SASS إلى CSS
- راجع المسار في `index.html` (`css/main.css`)

### ❌ الإشعارات لا تظهر:
- افتح Console وتأكد من عدم وجود أخطاء JavaScript
- تأكد من تحميل جميع الملفات بشكل صحيح

</div>

---

## 📧 الدعم والتواصل

إذا واجهت أي مشكلة أو لديك استفسار:
- **البريد**: contact@bagomri.com
- **GitHub**: [github.com/yourusername](https://github.com/yourusername)

---

## 📜 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE) - يمكنك استخدامه بحرية لمشاريعك الشخصية أو التجارية.

---

## 🙏 شكر خاص

<div dir="rtl">

- **Firebase** - للاستضافة وقاعدة البيانات المجانية
- **SASS** - لتنظيم وتطوير CSS بشكل احترافي
- **جميع مستخدمي الموقع** - لدعمكم المستمر

</div>

---

<div align="center">

### صُنع بـ ❤️ بواسطة Bagomri

**إذا أعجبك المشروع، لا تنسَ إضافة ⭐ على GitHub!**

</div>

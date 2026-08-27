# 🚀 دليل البدء السريع - Quick Start Guide

<div dir="rtl">

## ⚡ البدء في 5 خطوات

### 1️⃣ إعداد Firebase

```bash
# افتح Firebase Console
https://console.firebase.google.com/

# أنشئ مشروع جديد → فعّل Firestore → فعّل Hosting
# انسخ إعدادات Firebase
```

**حدّث `js/config.js`:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    // ... باقي الإعدادات
};
```

---

### 2️⃣ إضافة المحتوى

#### ✅ الشعار (Logo):
```
assets/images/logo.svg  ← ضع شعارك هنا
```

#### ✅ الخطوط (Fonts):
```
assets/fonts/
├── GraphikArabic-Light.woff2
├── GraphikArabic-Regular.woff2
├── GraphikArabic-Medium.woff2
├── GraphikArabic-Semibold.woff2
├── GraphikArabic-Bold.woff2
└── GraphikArabic-Black.woff2
```

#### ✅ المشاريع (Projects):
عدّل `js/modules/portfolio.js` وأضف مشاريعك.

---

### 3️⃣ تثبيت الأدوات

```bash
# تثبيت npm packages
npm install

# تثبيت SASS (إن لم يكن مثبتاً)
npm install -g sass

# تثبيت Firebase CLI
npm install -g firebase-tools
```

---

### 4️⃣ ترجمة SASS

```bash
# ترجمة SASS مرة واحدة
npm run sass

# أو تشغيل Watch Mode للتطوير
npm run sass:watch
```

---

### 5️⃣ النشر

```bash
# تسجيل دخول Firebase
firebase login

# تهيئة المشروع (مرة واحدة)
firebase init

# نشر الموقع
npm run firebase:deploy
```

---

## 📝 أوامر مفيدة

### تطوير محلي:
```bash
# تشغيل SASS Watch
npm run sass:watch

# تشغيل Firebase Serve (معاينة محلية)
npm run firebase:serve
```

### النشر:
```bash
# نشر كامل
npm run firebase:deploy

# نشر Hosting فقط
npm run firebase:deploy:hosting

# نشر Firestore Rules فقط
npm run firebase:deploy:rules
```

---

## ✏️ تخصيص سريع

### تغيير الألوان:
```scss
// sass/abstracts/_variables.scss
$color-primary: #6366F1;    // ← غيّر هذا
$color-secondary: #EC4899;  // ← وهذا
```

### تحديث معلومات التواصل:
```javascript
// js/config.js
contact: {
    email: 'your-email@domain.com',    // ← بريدك
    social: {
        github: 'https://github.com/...',     // ← حساباتك
        linkedin: 'https://linkedin.com/...',
        // ...
    }
}
```

### إضافة مشروع جديد:
```javascript
// js/modules/portfolio.js
this.projects = [
    {
        id: 4,
        title: { ar: 'اسم المشروع', en: 'Project Name' },
        description: { ar: 'وصف...', en: 'Description...' },
        category: 'flutter', // أو 'uiux' أو 'graphics'
        image: 'assets/images/projects/project4.jpg',
        tags: ['Flutter', 'Firebase'],
        featured: true,
        links: {
            github: '#',
            demo: '#'
        }
    }
];
```

---

## 🔍 فحص الأخطاء

### CSS لا يعمل؟
```bash
# تأكد من ترجمة SASS
npm run sass

# تأكد من وجود css/main.css
ls css/main.css
```

### Firebase لا يعمل؟
```javascript
// افتح Console في المتصفح (F12)
// ابحث عن أخطاء Firebase

// تأكد من الإعدادات في config.js
```

### الخطوط لا تظهر؟
```bash
# تأكد من وجود الملفات
ls assets/fonts/

# تأكد من المسارات في sass/base/_fonts.scss
```

---

## 📦 ملفات مهمة

| الملف | الوظيفة |
|------|---------|
| `js/config.js` | إعدادات Firebase والموقع |
| `sass/abstracts/_variables.scss` | الألوان والخطوط |
| `js/modules/portfolio.js` | بيانات المشاريع |
| `firestore.rules` | قواعد الأمان |

---

## 🆘 مشاكل شائعة

### ❌ "Firebase not initialized"
**الحل:** حدّث `firebaseConfig` في `js/config.js`

### ❌ "Permission denied" في Firestore
**الحل:** راجع `firestore.rules` ونفّذ:
```bash
firebase deploy --only firestore:rules
```

### ❌ الصور لا تظهر
**الحل:** تأكد من المسارات الصحيحة:
```
assets/images/projects/project1.jpg
```

---

## 🎯 الخطوات التالية

1. ✅ أضف محتواك (مشاريع، صور)
2. ✅ خصّص الألوان والخطوط
3. ✅ اختبر جميع الميزات محلياً
4. ✅ انشر على Firebase
5. ✅ اربط دومينك المخصص

---

## 📞 تحتاج مساعدة؟

راجع `README.md` للتفاصيل الكاملة.

**Good Luck! 🚀**

</div>

# CLAUDE.md — تعليمات الوكيل الثابتة

## هوية المشروع
- **الاسم:** Bagomri Portfolio
- **النوع:** Web App (HTML5 + SASS/SCSS + Vanilla JS + Firebase)
- **الهدف:** بورتفوليو احترافي ثلاثي التخصص لعرض مشاريع Flutter وUI/UX والجرافيك
- **المرحلة الحالية:** Production (البنية مكتملة، المحتوى قيد الإضافة)

---

## القواعد الصارمة (لا تخالفها أبداً)

### Git
- بعد كل تعديل ناجح: `git add . && git commit -m "[وصف موجز]" && git push`
- صيغة رسالة الـ commit: `[نوع]: [وصف] — [سبب موجز إن لزم]`
- أنواع: `feat` / `fix` / `refactor` / `docs` / `chore`
- لا ترفع كود مكسور أو يحتوي أخطاء

### قبل أي تعديل
1. اقرأ الملف المعني كاملاً أولاً
2. تحقق من `docs/ARCHITECTURE.md` إن كان التعديل يمس البنية
3. لا تعيد اختراع العجلة — ابحث في الكود الموجود أولاً

### بعد كل تعديل
1. تحقق من عدم وجود أخطاء في المتصفح (console)
2. ارفع على Git
3. حدّث `docs/TASKS.md` إن أكملت مهمة

---

## التقنيات المستخدمة
```
- HTML5 (RTL/LTR support via data-ar/data-en attributes)
- SASS/SCSS → يُترجم إلى css/main.css (لا تعدّله مباشرة)
- Vanilla JavaScript — OOP class-based modules
- Firebase Hosting + Firestore (eur3/Europe)
- EmailJS (إشعارات البريد عند استلام رسائل التواصل)
- AOS (Animate On Scroll library)
- Graphik Arabic (خط مخصص محلي، 6 أوزان)
```

---

## بنية المجلدات المهمة
```
js/
  config.js       ← جميع الإعدادات (Firebase, EmailJS, site settings)
  main.js         ← App class + تسلسل التهيئة (10 managers)
  modules/        ← theme, language, navigation, animations,
                     notifications, portfolio, lab, guestbook,
                     contact, firebase

sass/
  abstracts/      ← _variables.scss (ألوان/خطوط/spacing) + _mixins.scss
  base/           ← _fonts.scss, _base.scss, _animations.scss
  components/     ← _components.scss, _project-modal.scss
  layout/         ← _navigation.scss
  pages/          ← _home.scss, _portfolio.scss, _lab-services.scss, _contact.scss

css/
  main.css        ← ناتج التحويل — لا تعدّله يدوياً أبداً

assets/
  fonts/          ← Graphik Arabic (12 ملف woff/woff2)
  images/         ← logo.svg, profile.png, مجلدات المشاريع
  icons/          ← SVG icons (flutter, figma, illustrator, إلخ)
  quickchat/      ← صور مشروع Quickchat

docs/             ← ARCHITECTURE.md, TASKS.md, DECISIONS.md
```

---

## نمط الكود المطلوب
- كل module هو class instance يُهيَّأ في `js/main.js → App.init()`
- الدعم ثنائي اللغة: استخدم `data-ar="..."` و `data-en="..."` في HTML
- بعد أي تعديل SASS شغّل: `npm run sass`
- الإعدادات العامة (ألوان، breakpoints): في `sass/abstracts/_variables.scss`
- بيانات المشاريع: في `js/modules/portfolio.js`
- معلومات التواصل والروابط: في `js/config.js`

---

## ما يجب تجنبه
- لا تعدل `css/main.css` مباشرة — يُولَّد من SASS تلقائياً
- لا تضف npm dependencies بدون موافقة
- لا تنشر API keys أو secrets في console.log
- لا تعيد كتابة ملفات كاملة إذا كان التعديل جزئياً
- لا تغيّر هيكل JS modules بدون سبب واضح

---

## للمزيد من السياق راجع
- `docs/ARCHITECTURE.md` ← البنية التفصيلية والـ modules
- `docs/TASKS.md` ← المهام الحالية والمكتملة
- `docs/DECISIONS.md` ← لماذا اخترنا X على Y

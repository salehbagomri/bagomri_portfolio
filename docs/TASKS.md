# سجل المهام

> آخر تحديث: 2026-06-10

---

## 🔄 قيد التنفيذ (الآن)

- [ ] إضافة محتوى المشاريع الحقيقي — `js/modules/portfolio.js`
- [ ] إضافة صور المشاريع بالدقة المناسبة — `assets/images/projects/`
- [ ] ربط حسابات التواصل الاجتماعي (GitHub / LinkedIn) — `js/config.js` → `siteConfig.contact.social`

---

## 📋 المهام القادمة (Backlog)

### الأولوية العالية
- [ ] اختبار نموذج التواصل على الإنتاج (Firebase + EmailJS معاً)
- [ ] SEO: إضافة `<meta>` tags كاملة + Open Graph في `index.html`
- [ ] تحويل صور المشاريع إلى WebP لتحسين الأداء
- [ ] اختبار التوافق مع المتصفحات (Safari, Firefox, Chrome, Edge)

### الأولوية المتوسطة
- [ ] مراجعة Firestore analytics بعد شهر من الإطلاق الفعلي
- [ ] إضافة `loading="lazy"` لجميع الصور في `index.html`
- [ ] مراجعة Firestore security rules بعد أول 100 زيارة
- [ ] إنشاء favicon مخصص بصيغ متعددة (ico, png, svg)

---

## ✅ المكتملة

### Phase 1 — البنية الكاملة للموقع
- [x] هيكل HTML5 الأساسي مع دعم RTL/LTR عبر `data-ar` / `data-en`
- [x] نظام الثيمات Dark/Light مع حفظ التفضيل في localStorage
- [x] دعم ثنائية اللغة (العربية/الإنجليزية) مع قلب اتجاه الصفحة
- [x] تكامل Firebase (Hosting + Firestore)
- [x] عداد الزوار الفريدين مع animation للأرقام
- [x] نظام دفتر الزوار (Guestbook) مع ردود الفعل (emoji reactions)
- [x] إشعارات Toast في الوقت الفعلي لأي تعليق جديد
- [x] نموذج التواصل مع تحقق من البيانات + حفظ في Firestore + EmailJS
- [x] صفحة المشاريع مع الفلترة (Flutter / UI-UX / Graphic)
- [x] قسم المختبر (Lab) مع روابط تفاعلية
- [x] تصميم Glassmorphism
- [x] خط Graphik Arabic المخصص (6 أوزان، hosted locally)
- [x] Firestore security rules (visitors, comments, contacts, analytics)
- [x] Firestore indexes (comments: approved + timestamp)
- [x] نشر على Firebase Hosting
- [x] ملفات التوثيق (CLAUDE.md, ARCHITECTURE.md, TASKS.md, DECISIONS.md)

---

## 🐛 الأخطاء المعروفة (Known Bugs)

| الخطأ | الملف | الأولوية | الحالة |
|-------|-------|---------|--------|
| لا توجد أخطاء مسجّلة حتى الآن | — | — | — |

---

## 📝 ملاحظات للوكيل
- المرحلة الحالية تركيزها على: **إضافة المحتوى الحقيقي** (مشاريع، صور، روابط)
- لا تلمس: `css/main.css` مباشرة — يُولَّد من SASS
- انتبه لـ: بعد أي تعديل SASS شغّل `npm run sass` أولاً قبل الاختبار
- انتبه لـ: Firestore rules تتطلب re-deploy عند التعديل (`npm run firebase:deploy:rules`)

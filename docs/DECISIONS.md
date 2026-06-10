# سجل القرارات التقنية (ADR)

> هذا الملف يحفظ *لماذا* اتُخذ كل قرار،
> لمنع الوكيل من "تحسينه" بشكل خاطئ لاحقاً.

---

## ADR-001: Vanilla JavaScript بدلاً من React أو Vue

**التاريخ:** 2024
**الحالة:** مُعتمد

**السياق:**
المشروع بورتفوليو شخصي ثابت (static portfolio)، يعرض معلومات ومشاريع دون حاجة لـ state management معقد أو تحديثات متكررة للواجهة.

**القرار:**
Vanilla JavaScript مع نمط OOP (class-based modules) — كل module هو class instance منفصل.

**السبب:**
لا توجد تبعيات ثقيلة (zero build step لـ JS)، bundle size أصغر، تحميل أسرع، وسهولة صيانة لموقع بسيط نسبياً.

**العواقب:**
- إيجابي: أداء ممتاز، لا يحتاج node_modules لـ JS، سهل القراءة لأي مطور
- سلبي: لا إعادة استخدام مكونات UI (components)، كود HTML أطول، لا hot reload

---

## ADR-002: Firebase بدلاً من خادم مخصص

**التاريخ:** 2024
**الحالة:** مُعتمد

**السياق:**
الموقع يحتاج backend لثلاث وظائف: عداد الزوار، نظام التعليقات، استلام نماذج التواصل.

**القرار:**
Firebase Hosting + Firestore (realtime NoSQL database).

**السبب:**
مجاني لحجم المشروع الحالي (Spark plan)، بدون إدارة خادم أو SSL أو updates، الأمان عبر Firestore rules بدون backend code، وتحديث البيانات في الوقت الفعلي للتعليقات.

**العواقب:**
- إيجابي: لا تكاليف hosting، تحديث فوري، أمان جاهز، نشر بـ command واحد
- سلبي: تبعية كاملة على Google Firebase، حدود free tier (50K reads/day)، لا تحكم كامل في البنية التحتية

---

## ADR-003: SASS بدلاً من CSS عادي

**التاريخ:** 2024
**الحالة:** مُعتمد

**السياق:**
الموقع له تصميم Glassmorphism معقد مع ثيمين (داكن/فاتح) وثنائية اتجاه (RTL/LTR)، مما يتطلب متغيرات ألوان كثيرة وأنماطاً قابلة للإعادة.

**القرار:**
SASS/SCSS مع بنية منظمة: abstracts → base → components → layout → pages.

**السبب:**
متغيرات مركزية (`_variables.scss`) تجعل تغيير الألوان أو breakpoints يدوياً في مكان واحد، والـ mixins تتجنب تكرار CSS المعقد (كـ glassmorphism effect).

**العواقب:**
- إيجابي: تعديل الثيم من مكان واحد، كود منظم وقابل للصيانة، mixins للأنماط المتكررة
- سلبي: يحتاج build step (`npm run sass`)، لا يمكن تعديل `css/main.css` مباشرة

---

## ADR-004: Firestore region eur3 (Europe) بدلاً من us-central

**التاريخ:** 2024
**الحالة:** مُعتمد

**السياق:**
عند إنشاء Firestore database يجب اختيار المنطقة الجغرافية للخادم، وهذا القرار دائم لا يمكن تغييره بعد الإنشاء.

**القرار:**
`eur3` — Europe (multi-region).

**السبب:**
الجمهور المستهدف في المنطقة العربية (الشرق الأوسط وشمال أفريقيا) يجد Europe أقرب latency من us-central، كما أن eur3 هو multi-region مما يوفر availability أعلى.

**العواقب:**
- إيجابي: latency أفضل للمستخدمين العرب، availability عالية (multi-region)
- سلبي: latency أعلى للزوار من أمريكا، لا يوجد خيار Middle East في Firebase (حتى تاريخ القرار)

---

## ADR-005: خط Graphik Arabic محلي بدلاً من Google Fonts

**التاريخ:** 2024
**الحالة:** مُعتمد

**السياق:**
الموقع يحتاج خطاً عربياً ذا هوية بصرية احترافية ومميزة يناسب تصميم الـ portfolio.

**القرار:**
Graphik Arabic hosted locally في `assets/fonts/` بـ 6 أوزان (Light, Regular, Medium, Semibold, Bold, Black) بصيغتي woff وwoff2.

**السبب:**
هوية بصرية مميزة لا يمكن الحصول عليها من Google Fonts العامة، وأداء أفضل (لا external DNS lookup ولا network request إضافي عند التحميل)، ولا اعتماد على توفر خادم خارجي.

**العواقب:**
- إيجابي: أداء أفضل (محلي)، هوية بصرية فريدة، يعمل offline
- سلبي: حجم أكبر للـ assets (12 ملف، ~500KB)، يحتاج ترخيص استخدام الخط

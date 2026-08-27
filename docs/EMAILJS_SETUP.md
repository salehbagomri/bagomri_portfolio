# 📧 دليل إعداد EmailJS - إرسال الإيميلات

<div dir="rtl">

## 🎯 لماذا EmailJS؟

عندما يرسل أحدهم رسالة عبر نموذج التواصل في موقعك:
1. ✅ تُحفظ الرسالة في Firebase Firestore
2. ✅ تُرسل نسخة **مباشرة إلى إيميلك** (s.bagomri@gmail.com)

---

## 🚀 خطوات الإعداد (5 دقائق)

### 1️⃣ **إنشاء حساب EmailJS**

انتقل إلى: **https://www.emailjs.com**

- اضغط **Sign Up** (التسجيل مجاني 100%)
- سجّل بأي إيميل
- فعّل حسابك من الإيميل

---

### 2️⃣ **إضافة Email Service (Gmail)**

بعد تسجيل الدخول:

1. من Dashboard، اضغط **Add New Service**
2. اختر **Gmail**
3. اضغط **Connect Account**
4. سجّل دخول بحساب **s.bagomri@gmail.com**
5. اسمح بالصلاحيات
6. انسخ **Service ID** (مثال: `service_abc123`)

---

### 3️⃣ **إنشاء Email Template**

1. من القائمة، اضغط **Email Templates**
2. اضغط **Create New Template**
3. استخدم هذا القالب:

```
Subject: رسالة جديدة من {{from_name}}

From: {{from_name}}
Email: {{from_email}}
Subject: {{subject}}

Message:
{{message}}

---
تم الإرسال من موقع Bagomri Portfolio
```

4. احفظ واحصل على **Template ID** (مثال: `template_xyz789`)

---

### 4️⃣ **الحصول على Public Key**

1. من القائمة، اضغط **Account** → **General**
2. ابحث عن **Public Key**
3. انسخه (مثال: `user_ABCxyz123`)

---

### 5️⃣ **تحديث الكود**

افتح **`js/config.js`** وعدّل:

```javascript
const emailConfig = {
    serviceId: 'service_abc123',      // ضع Service ID هنا
    templateId: 'template_xyz789',    // ضع Template ID هنا
    publicKey: 'user_ABCxyz123'       // ضع Public Key هنا
};
```

---

### 6️⃣ **النشر**

```powershell
npm run deploy
```

---

## ✅ **اختبار الإعداد**

1. افتح موقعك
2. اذهب لقسم **Contact**
3. املأ النموذج وأرسل
4. تحقق من إيميلك **s.bagomri@gmail.com**
5. يجب أن تصلك الرسالة خلال ثواني!

---

## 🔥 **البديل: استقبال الرسائل من Firebase**

إذا لم ترغب في إعداد EmailJS، يمكنك:

### **الطريقة 1: Firebase Console**

1. افتح: https://console.firebase.google.com
2. اختر مشروعك
3. اذهب إلى **Firestore Database**
4. ستجد collection اسمه **contacts**
5. كل رسالة جديدة تظهر هنا فوراً!

### **الطريقة 2: إشعارات Firebase (متقدم)**

يمكنك إعداد Firebase Cloud Functions لإرسال إشعار push أو إيميل تلقائي عند كل رسالة جديدة.

---

## 📊 **الفرق بين الحلول**

| الميزة | Firebase فقط | Firebase + EmailJS |
|-------|-------------|------------------|
| **حفظ الرسائل** | ✅ | ✅ |
| **إشعار فوري بالإيميل** | ❌ | ✅ |
| **سهولة الإعداد** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **التكلفة** | مجاني | مجاني (200 إيميل/شهر) |

---

## 🆘 **مشاكل شائعة**

### ❌ "EmailJS not configured"

**الحل:** تأكد من تحديث `js/config.js` بالمفاتيح الصحيحة

### ❌ الإيميل لا يصل

**الحل:** 
1. تحقق من Spam/Junk
2. تأكد من Service ID و Template ID صحيحين
3. افتح Console في المتصفح (F12) وابحث عن أخطاء

### ❌ "Rate limit exceeded"

**الحل:** الباقة المجانية تسمح بـ 200 إيميل/شهر. للمزيد، ترقية الحساب.

---

## 💡 **نصائح**

1. ✅ فعّل **Auto-reply** في EmailJS لإرسال رد تلقائي للمرسل
2. ✅ خصّص Email Template ليبدو احترافي
3. ✅ أضف **Email Notifications** في Gmail لتنبيهك فوراً

---

## 📞 **المساعدة**

لأي مشكلة، راجع:
- 📘 **EmailJS Docs:** https://www.emailjs.com/docs
- 🎥 **فيديو شرح:** ابحث في YouTube عن "EmailJS setup"

---

**جاهز! الآن ستستقبل كل رسالة على إيميلك مباشرة! 📬**

</div>

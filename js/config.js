// ============================================
// FIREBASE CONFIGURATION
// ============================================
// 🔥 ضع إعدادات Firebase الخاصة بك هنا
// يمكنك الحصول على هذه الإعدادات من Firebase Console

  const firebaseConfig = {
    apiKey: "AIzaSyAq2Se9IfuQaRqqVLCCqtcv_g9pmpsjhIg",
    authDomain: "bagomri-portfolio.firebaseapp.com",
    projectId: "bagomri-portfolio",
    storageBucket: "bagomri-portfolio.firebasestorage.app",
    messagingSenderId: "1000768713097",
    appId: "1:1000768713097:web:fb16ec9d7a0f5163347158"
  };




// ============================================
// EMAILJS CONFIGURATION
// ============================================
// 📧 للحصول على هذه المفاتيح:
// 1. سجل في https://www.emailjs.com (مجاني)
// 2. أنشئ Email Service (Gmail مثلاً)
// 3. أنشئ Email Template
// 4. انسخ: Service ID, Template ID, Public Key

const emailConfig = {
    serviceId: 'service_bagomri',
    templateId: 'template_07zd54e',
    publicKey: 'bmkUYAEmXOaUDbVt2'
};


// ============================================
// SITE CONFIGURATION
// ============================================

const siteConfig = {
    // معلومات الموقع الأساسية
    siteName: {
        ar: 'Bagomri',
        en: 'Bagomri'
    },
    siteDescription: {
        ar: 'مطور Flutter، مصمم UI/UX، ومصمم جرافيك',
        en: 'Flutter Developer, UI/UX Designer, & Graphic Designer'
    },
    
    // معلومات التواصل
    contact: {
        email: 's.bagomri@gmail.com',
        whatsapp: '+967770727055',
        location: {
            ar: 'السعودية',
            en: 'Saudi Arabia'
        },
        social: {
            github: 'https://github.com/salehbagomri',
            behance: 'https://www.behance.net/salehbbagomri',
            instagram: 'https://instagram.com/salehbagomri',
            linkedin: 'https://www.linkedin.com/in/salehbagomri'
        }
    },
    
    // نصوص الكتابة المتحركة (Typing Effect)
    typingTexts: {
        ar: [
            'مطور Flutter',
            'مصمم UI/UX',
            'مصمم جرافيك',
            'صانع تجارب رقمية'
        ],
        en: [
            'Flutter Developer',
            'UI/UX Designer',
            'Graphic Designer',
            'Digital Experience Creator'
        ]
    },
    
    // إعدادات عامة
    settings: {
        defaultLanguage: 'ar',
        defaultTheme: 'dark',
        animationSpeed: 300,
        toastDuration: 5000,
        typingSpeed: 100,
        typingDelay: 2000
    }
};

// تصدير التكوينات
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, emailConfig, siteConfig };
}

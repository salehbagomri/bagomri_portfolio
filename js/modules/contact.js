// ============================================
// CONTACT MODULE - وحدة التواصل
// ============================================

class ContactManager {
    constructor() {
        this.contactForm = null;
        this.formInputs = {};
    }

    init() {
        this.contactForm = document.getElementById('contactForm');

        if (this.contactForm) {
            this.formInputs = {
                name: document.getElementById('contactName'),
                email: document.getElementById('contactEmail'),
                subject: document.getElementById('contactSubject'),
                message: document.getElementById('contactMessage')
            };

            this.setupContactForm();
        }

        console.log('✅ Contact Manager initialized');
    }

    // ============================================
    // FORM SETUP - إعداد النموذج
    // ============================================

    setupContactForm() {
        // التحقق الحي من المدخلات
        Object.values(this.formInputs).forEach(input => {
            if (input) {
                input.addEventListener('blur', () => this.validateInput(input));
                input.addEventListener('input', () => this.clearError(input));
            }
        });

        // معالجة الإرسال
        this.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleFormSubmit();
        });
    }

    // ============================================
    // VALIDATION - التحقق
    // ============================================

    validateInput(input) {
        const value = input.value.trim();
        const errorElement = input.parentElement.querySelector('.form-error');
        const currentLang = languageManager.getCurrentLanguage();

        let error = '';

        switch(input.id) {
            case 'contactName':
                if (!value) {
                    error = currentLang === 'ar' ? 'الاسم مطلوب' : 'Name is required';
                } else if (value.length < 2) {
                    error = currentLang === 'ar' ? 'الاسم قصير جداً' : 'Name is too short';
                }
                break;

            case 'contactEmail':
                if (!value) {
                    error = currentLang === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
                } else if (!this.isValidEmail(value)) {
                    error = currentLang === 'ar' ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address';
                }
                break;

            case 'contactSubject':
                if (!value) {
                    error = currentLang === 'ar' ? 'الموضوع مطلوب' : 'Subject is required';
                } else if (value.length < 3) {
                    error = currentLang === 'ar' ? 'الموضوع قصير جداً' : 'Subject is too short';
                }
                break;

            case 'contactMessage':
                if (!value) {
                    error = currentLang === 'ar' ? 'الرسالة مطلوبة' : 'Message is required';
                } else if (value.length < 10) {
                    error = currentLang === 'ar' ? 'الرسالة قصيرة جداً' : 'Message is too short';
                }
                break;
        }

        if (error) {
            this.showError(input, errorElement, error);
            return false;
        } else {
            this.clearError(input);
            return true;
        }
    }

    validateAllInputs() {
        let isValid = true;
        Object.values(this.formInputs).forEach(input => {
            if (input && !this.validateInput(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    showError(input, errorElement, message) {
        input.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('active');
        }
    }

    clearError(input) {
        input.classList.remove('error');
        const errorElement = input.parentElement.querySelector('.form-error');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('active');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // ============================================
    // FORM SUBMISSION - إرسال النموذج
    // ============================================

    async handleFormSubmit() {
        // التحقق من جميع الحقول
        if (!this.validateAllInputs()) {
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'الرجاء تصحيح الأخطاء'
                : 'Please correct the errors';
            notificationManager.error(message);
            return;
        }

        const submitBtn = this.contactForm.querySelector('.btn-submit');
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');

        // جمع البيانات
        const formData = {
            name: this.formInputs.name.value.trim(),
            email: this.formInputs.email.value.trim(),
            subject: this.formInputs.subject.value.trim(),
            message: this.formInputs.message.value.trim()
        };

        try {
            // إرسال عبر EmailJS (إن كان مفعّل)
            if (typeof emailjs !== 'undefined' && emailConfig && emailConfig.serviceId !== 'YOUR_SERVICE_ID') {
                await this.sendViaEmailJS(formData);
            }

            // إرسال البيانات إلى Firebase
            await firebaseService.submitContactForm(formData);

            // رسالة نجاح
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'تم إرسال رسالتك بنجاح! سأتواصل معك قريباً.'
                : 'Your message was sent successfully! I\'ll get back to you soon.';
            notificationManager.success(message, 6000);

            // مسح النموذج
            this.contactForm.reset();

        } catch (error) {
            console.error('Error submitting contact form:', error);
            const currentLang = languageManager.getCurrentLanguage();
            const message = currentLang === 'ar'
                ? 'حدث خطأ في الإرسال. حاول مرة أخرى.'
                : 'An error occurred. Please try again.';
            notificationManager.error(message);

        } finally {
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
        }
    }

    // ============================================
    // EMAILJS INTEGRATION - إرسال عبر EmailJS
    // ============================================

    async sendViaEmailJS(formData) {
        try {
            // Initialize EmailJS
            emailjs.init(emailConfig.publicKey);

            // إرسال الإيميل
            const response = await emailjs.send(
                emailConfig.serviceId,
                emailConfig.templateId,
                {
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject,
                    message: formData.message,
                    to_email: siteConfig.contact.email
                }
            );

            console.log('✅ Email sent successfully via EmailJS:', response);
            return response;

        } catch (error) {
            console.warn('⚠️ EmailJS not configured or failed:', error);
            // لا نوقف العملية، فقط نسجل الخطأ
        }
    }
}

// إنشاء نسخة واحدة
const contactManager = new ContactManager();

// تصدير
if (typeof module !== 'undefined' && module.exports) {
    module.exports = contactManager;
}

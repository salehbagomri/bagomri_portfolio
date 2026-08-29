// ============================================
// FIREBASE MODULE
// ============================================

class FirebaseService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.storage = null;
        this.projectId = (typeof firebaseConfig !== 'undefined' && firebaseConfig.projectId) ? firebaseConfig.projectId : 'bagomri-portfolio';
        this.collections = {
            projects: 'projects',
            contacts: 'contacts',
            articles: 'articles',
            analytics: 'analytics'
        };
    }

    // ── Helper: Parse Firestore REST field values ─────────────
    _parseFirestoreValue(val) {
        if (!val || typeof val !== 'object') return val;
        if ('stringValue' in val) return val.stringValue;
        if ('booleanValue' in val) return val.booleanValue;
        if ('integerValue' in val) return parseInt(val.integerValue, 10);
        if ('doubleValue' in val) return parseFloat(val.doubleValue);
        if ('timestampValue' in val) return val.timestampValue;
        if ('nullValue' in val) return null;
        if ('arrayValue' in val) {
            return (val.arrayValue.values || []).map(v => this._parseFirestoreValue(v));
        }
        if ('mapValue' in val) {
            const res = {};
            const fields = val.mapValue.fields || {};
            for (const k in fields) {
                res[k] = this._parseFirestoreValue(fields[k]);
            }
            return res;
        }
        return val;
    }

    _parseFirestoreDoc(doc) {
        if (!doc) return null;
        const id = doc.name ? doc.name.split('/').pop() : '';
        const data = { id };
        const fields = doc.fields || {};
        for (const k in fields) {
            data[k] = this._parseFirestoreValue(fields[k]);
        }
        return data;
    }

    // تهيئة Firebase
    init() {
        try {
            if (typeof firebase === 'undefined') return false;
            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            if (!this.db && typeof firebase.firestore === 'function') {
                this.db = firebase.firestore();
                try {
                    this.db.settings({
                        experimentalForceLongPolling: true,
                        merge: true
                    });
                } catch (settingsErr) {
                    // Settings can only be set once
                }
            }
            if (typeof firebase.auth === 'function' && !this.auth) this.auth = firebase.auth();
            if (typeof firebase.storage === 'function' && !this.storage) this.storage = firebase.storage();
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            return false;
        }
    }

    // ============================================
    // AUTH - المصادقة
    // ============================================

    async loginAdmin(email, password) {
        return await this.auth.signInWithEmailAndPassword(email, password);
    }

    async logoutAdmin() {
        return await this.auth.signOut();
    }

    onAuthStateChanged(callback) {
        if (!this.auth) return;
        return this.auth.onAuthStateChanged(callback);
    }

    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }

    // ============================================
    // PROJECTS CRUD - إدارة المشاريع
    // ============================================

    async getProjects() {
        // 1. Try ultra-fast direct REST API (immune to WebSocket blocks & 100ms response)
        try {
            const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/${this.collections.projects}`;
            const res = await fetch(url);
            if (res.ok) {
                const json = await res.json();
                const docs = (json.documents || []).map(doc => this._parseFirestoreDoc(doc));
                docs.sort((a, b) => {
                    const orderA = typeof a.order === 'number' ? a.order : 10;
                    const orderB = typeof b.order === 'number' ? b.order : 10;
                    return orderA - orderB;
                });
                return docs;
            }
        } catch (restErr) {
            console.warn('⚠️ REST getProjects failed, falling back to SDK:', restErr.message);
        }

        // 2. Fallback to SDK if available
        try {
            if (this.db) {
                const snapshot = await this.db.collection(this.collections.projects)
                    .orderBy('order', 'asc')
                    .get();
                return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            }
        } catch (error) {
            console.error('Error getting projects via SDK:', error);
        }
        return [];
    }

    async addProject(data) {
        const doc = {
            ...data,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        const ref = await this.db.collection(this.collections.projects).add(doc);
        return ref.id;
    }

    async updateProject(id, data) {
        await this.db.collection(this.collections.projects).doc(id).update({
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    }

    async deleteProject(id) {
        await this.db.collection(this.collections.projects).doc(id).delete();
    }

    // ============================================
    // STORAGE - رفع الصور
    // ============================================

    async uploadImage(file, folder = 'project-images') {
        if (!this.storage) throw new Error('Firebase Storage not initialized');
        const name = `${folder}/${Date.now()}_${file.name}`;
        const ref = this.storage.ref(name);
        await ref.put(file);
        return await ref.getDownloadURL();
    }

    // ============================================
    // CONTACT FORM - نموذج التواصل
    // ============================================

    async submitContactForm(formData) {
        try {
            const contact = {
                name: formData.name.trim(),
                email: formData.email.trim(),
                subject: formData.subject.trim(),
                message: formData.message.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            };
            
            const docRef = await this.db.collection('contacts').add(contact);
            
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error submitting contact form:', error);
            throw error;
        }
    }

    // ============================================
    // ANALYTICS - التحليلات
    // ============================================

    async trackPageView(pageName) {
        try {
            if (this.db) {
                await this.db.collection('analytics').add({
                    page: pageName,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    userAgent: navigator.userAgent,
                    language: document.documentElement.lang
                });
            }
        } catch (error) {
            console.error('Error tracking page view:', error);
        }
    }
}

// إنشاء نسخة واحدة من الخدمة
const firebaseService = new FirebaseService();

// تصدير الخدمة
if (typeof module !== 'undefined' && module.exports) {
    module.exports = firebaseService;
}

// Main init function called by main.js
function initFirebase() {
    firebaseService.init();
}

// Expose globally
window.initFirebase = initFirebase;
window.firebaseService = firebaseService;


// ============================================
// FIREBASE MODULE
// ============================================

class FirebaseService {
    constructor() {
        this.db = null;
        this.collections = {
            visitors: 'visitors',
            comments: 'comments',
            contacts: 'contacts'
        };
    }

    // تهيئة Firebase
    init() {
        try {
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            return true;
        } catch (error) {
            console.error('❌ Firebase initialization error:', error);
            return false;
        }
    }

    // ============================================
    // VISITOR COUNTER - عداد الزوار
    // ============================================

    async incrementVisitorCount() {
        try {
            const visitorId = this.getOrCreateVisitorId();
            const visitorRef = this.db.collection(this.collections.visitors).doc(visitorId);
            
            const doc = await visitorRef.get();
            
            if (!doc.exists) {
                // زائر جديد
                await visitorRef.set({
                    firstVisit: firebase.firestore.FieldValue.serverTimestamp(),
                    lastVisit: firebase.firestore.FieldValue.serverTimestamp(),
                    visitCount: 1
                });
            } else {
                // زائر عائد
                await visitorRef.update({
                    lastVisit: firebase.firestore.FieldValue.serverTimestamp(),
                    visitCount: firebase.firestore.FieldValue.increment(1)
                });
            }
            
            return await this.getTotalVisitors();
        } catch (error) {
            console.error('Error incrementing visitor:', error);
            return 0;
        }
    }

    async getTotalVisitors() {
        try {
            const snapshot = await this.db.collection(this.collections.visitors).get();
            return snapshot.size;
        } catch (error) {
            console.error('Error getting visitor count:', error);
            return 0;
        }
    }

    getOrCreateVisitorId() {
        let visitorId = localStorage.getItem('visitorId');
        
        if (!visitorId) {
            visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('visitorId', visitorId);
        }
        
        return visitorId;
    }

    // ============================================
    // COMMENTS - التعليقات
    // ============================================

    async addComment(name, text) {
        try {
            const comment = {
                name: name.trim(),
                text: text.trim(),
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                approved: true,
                reactions: {
                    like: 0,
                    love: 0,
                    fire: 0
                },
                reactedBy: [] // لتتبع من تفاعل (visitor IDs)
            };
            
            const docRef = await this.db.collection(this.collections.comments).add(comment);
            
            return {
                id: docRef.id,
                ...comment,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Error adding comment:', error);
            throw error;
        }
    }

    async getComments(limit = 50, orderBy = 'trending') {
        try {
            let query = this.db.collection(this.collections.comments)
                .where('approved', '==', true);
            
            // ترتيب حسب النوع
            if (orderBy === 'trending') {
                // حساب مجموع التفاعلات في الكود
                query = query.orderBy('timestamp', 'desc');
            } else {
                query = query.orderBy('timestamp', 'desc');
            }
            
            const snapshot = await query.limit(limit).get();
            
            const comments = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                comments.push({
                    id: doc.id,
                    name: data.name,
                    text: data.text,
                    timestamp: data.timestamp?.toDate() || new Date(),
                    reactions: data.reactions || { like: 0, love: 0, fire: 0 },
                    reactedBy: data.reactedBy || []
                });
            });
            
            // فرز حسب التفاعلات إذا كان trending
            if (orderBy === 'trending') {
                comments.sort((a, b) => {
                    const aTotal = (a.reactions.like || 0) + (a.reactions.love || 0) + (a.reactions.fire || 0);
                    const bTotal = (b.reactions.like || 0) + (b.reactions.love || 0) + (b.reactions.fire || 0);
                    return bTotal - aTotal;
                });
            }
            
            return comments;
        } catch (error) {
            console.error('Error getting comments:', error);
            return [];
        }
    }

    // إضافة أو إزالة تفاعل
    async toggleReaction(commentId, reactionType, visitorId) {
        try {
            const commentRef = this.db.collection(this.collections.comments).doc(commentId);
            const commentDoc = await commentRef.get();
            
            if (!commentDoc.exists) {
                throw new Error('Comment not found');
            }
            
            const data = commentDoc.data();
            const reactions = data.reactions || { like: 0, love: 0, fire: 0 };
            const reactedBy = data.reactedBy || [];
            
            // تحقق إذا كان الزائر تفاعل مسبقاً
            const existingReaction = reactedBy.find(r => r.visitorId === visitorId);
            
            if (existingReaction) {
                // إذا نفس النوع، أزله
                if (existingReaction.type === reactionType) {
                    reactions[reactionType] = Math.max(0, reactions[reactionType] - 1);
                    const newReactedBy = reactedBy.filter(r => r.visitorId !== visitorId);
                    await commentRef.update({ reactions, reactedBy: newReactedBy });
                    return { action: 'removed', reactions };
                } else {
                    // غيّر نوع التفاعل
                    reactions[existingReaction.type] = Math.max(0, reactions[existingReaction.type] - 1);
                    reactions[reactionType] = (reactions[reactionType] || 0) + 1;
                    const newReactedBy = reactedBy.map(r => 
                        r.visitorId === visitorId ? { visitorId, type: reactionType } : r
                    );
                    await commentRef.update({ reactions, reactedBy: newReactedBy });
                    return { action: 'changed', reactions };
                }
            } else {
                // أضف تفاعل جديد
                reactions[reactionType] = (reactions[reactionType] || 0) + 1;
                reactedBy.push({ visitorId, type: reactionType });
                await commentRef.update({ reactions, reactedBy });
                return { action: 'added', reactions };
            }
        } catch (error) {
            console.error('Error toggling reaction:', error);
            throw error;
        }
    }

    // الاستماع للتعليقات الجديدة في الوقت الفعلي
    listenToComments(callback) {
        try {
            return this.db.collection(this.collections.comments)
                .where('approved', '==', true)
                .orderBy('timestamp', 'desc')
                .onSnapshot(snapshot => {
                    snapshot.docChanges().forEach(change => {
                        if (change.type === 'added') {
                            const data = change.doc.data();
                            const comment = {
                                id: change.doc.id,
                                name: data.name,
                                text: data.text,
                                timestamp: data.timestamp?.toDate() || new Date()
                            };
                            callback('added', comment);
                        }
                    });
                }, error => {
                    console.error('Error listening to comments:', error);
                });
        } catch (error) {
            console.error('Error setting up comment listener:', error);
            return null;
        }
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
            
            const docRef = await this.db.collection(this.collections.contacts).add(contact);
            
            // هنا يمكنك استدعاء Cloud Function لإرسال إيميل
            // await this.sendEmailNotification(contact);
            
            return {
                success: true,
                id: docRef.id
            };
        } catch (error) {
            console.error('Error submitting contact form:', error);
            throw error;
        }
    }

    // يمكن استخدام Cloud Function لإرسال الإيميل
    async sendEmailNotification(contactData) {
        // This would call a Firebase Cloud Function
        // Example implementation would go here
        return true;
    }

    // ============================================
    // ANALYTICS - التحليلات
    // ============================================

    async trackPageView(pageName) {
        try {
            await this.db.collection('analytics').add({
                page: pageName,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userAgent: navigator.userAgent,
                language: document.documentElement.lang
            });
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

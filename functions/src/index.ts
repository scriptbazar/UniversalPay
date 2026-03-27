
import { auth } from "firebase-functions";
import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getFirestore, WriteBatch } from "firebase-admin/firestore";

if (!admin.apps.length) {
    admin.initializeApp();
}
const db = getFirestore();

const createUserDocument = async (batch: WriteBatch, user: admin.auth.UserRecord) => {
    const role = "merchant";
    const namePart = user.displayName || user.email?.split('@')[0] || `user${user.uid.substring(0, 6)}`;
    let handle = namePart.toLowerCase().replace(/[^a-z0-9]/g, '');

    let handleExists = true;
    let counter = 1;
    while (handleExists) {
        const handleQuery = await db.collection('users').where('handle', '==', handle).get();
        if (handleQuery.empty) {
            handleExists = false;
        } else {
            handle = `${namePart.toLowerCase().replace(/[^a-z0-9]/g, '')}${counter}`;
            counter++;
        }
    }

    const userDocRef = db.collection('users').doc(user.uid);
    batch.set(userDocRef, {
        uid: user.uid,
        email: user.email,
        fullName: user.displayName || 'New User',
        avatar: user.photoURL || `https://placehold.co/96x96.png?text=${(user.displayName || 'U').charAt(0)}`,
        role: role,
        status: 'Active',
        plan: 'Free',
        kycStatus: "Not Started",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        handle: handle,
        handleLastUpdatedAt: null,
        handleEditCount: 0,
        walletBalance: 0,
    });
    
    await admin.auth().setCustomUserClaims(user.uid, { role });
};

exports.addDefaultRoleClaim = auth.user().onCreate(async (user) => {
  const batch = db.batch();
  try {
    await createUserDocument(batch, user);
    
    const auditLogRef = db.collection('audit_logs').doc();
    batch.set(auditLogRef, {
        type: 'USER_CREATED',
        message: `New user signed up: ${user.email} (uid: ${user.uid}). Assigned default role: 'merchant'.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'INFO',
        details: {
            targetUser: user.uid,
        }
    });

    await batch.commit();
  } catch (error) {
    console.error(`Error processing new user: ${user.uid}`, error);
  }
});

// Secure Server-Side Transaction Processing
exports.onTransactionCreated = onDocumentCreated("transactions/{transactionId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;
    const data = snapshot.data();
    const transactionId = event.params.transactionId;

    if (data.status === 'Success') {
        const merchantId = data.merchantId;
        const amount = Number(data.amount);

        const merchantRef = db.collection('users').doc(merchantId);
        const merchantDoc = await merchantRef.get();
        
        if (!merchantDoc.exists) return;
        const merchantName = merchantDoc.data()?.fullName || 'Your Merchant';

        // 1. Update merchant's wallet balance
        await merchantRef.update({
            walletBalance: admin.firestore.FieldValue.increment(amount)
        });

        // 2. Create Invoice
        await db.collection('invoices').add({
            merchantId,
            merchantName,
            customerName: data.customerName || data.customerEmail,
            customerEmail: data.customerEmail,
            issueDate: new Date().toISOString().split("T")[0],
            dueDate: new Date().toISOString().split("T")[0],
            items: [{ description: `Payment via ${data.method}`, amount }],
            totalAmount: amount,
            status: 'Paid',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // 3. Create/Update Customer
        const customerEmail = data.customerEmail;
        const customersCol = db.collection('customers');
        const customerQuery = await customersCol.where('email', '==', customerEmail).where('merchantId', '==', merchantId).get();

        if (customerQuery.empty) {
            await customersCol.add({
                merchantId,
                merchantName,
                email: customerEmail,
                name: data.customerName || 'New Customer',
                avatar: `https://placehold.co/40x40.png?text=${(data.customerName || 'N').charAt(0)}`,
                totalSpent: amount,
                transactions: 1,
                lastSeen: new Date().toLocaleDateString(),
                joinedDate: new Date().toISOString().split("T")[0]
            });
        } else {
            const customerDoc = customerQuery.docs[0];
            await customerDoc.ref.update({
                totalSpent: admin.firestore.FieldValue.increment(amount),
                transactions: admin.firestore.FieldValue.increment(1),
                lastSeen: new Date().toLocaleDateString()
            });
        }

        // 4. Audit Log
        await db.collection('audit_logs').add({
            type: 'PAYMENT_RECEIVED',
            level: 'INFO',
            message: `Payment of $${amount} received from ${customerEmail}.`,
            details: {
                amount,
                customer: customerEmail,
                transactionId,
                targetUser: merchantId,
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
});

exports.setAdminRole = onCall(async (request) => {
  if (!request.auth || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can set user roles.');
  }
  const callingUserUid = request.auth.uid;
  const callingUserEmail = request.auth.token.email || 'Unknown';
  const { uid: targetUid, role: newRole } = request.data;
  if (!targetUid || !newRole || !['admin', 'merchant'].includes(newRole)) {
    throw new HttpsError('invalid-argument', 'Valid "uid" and "role" are required.');
  }
  try {
    const targetUser = await admin.auth().getUser(targetUid);
    await admin.auth().setCustomUserClaims(targetUid, { role: newRole });
    await db.collection('users').doc(targetUid).update({ role: newRole });
    await db.collection('audit_logs').add({
        type: 'ROLE_CHANGE',
        message: `Admin ${callingUserEmail} (${callingUserUid}) changed role of ${targetUser.email} (${targetUid}) to ${newRole}.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'CRITICAL',
        details: { targetUser: targetUid, changedBy: callingUserUid, newRole }
    });
    return { success: true };
  } catch (error) {
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});

exports.updateUserStatus = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can update user status.');
    }
    const { uid: targetUid, status: newStatus } = request.data;
    if (!targetUid || !newStatus || !['Active', 'Suspended'].includes(newStatus)) {
        throw new HttpsError('invalid-argument', 'Valid "uid" and "status" are required.');
    }
    try {
        await db.collection('users').doc(targetUid).update({ status: newStatus });
        await admin.auth().updateUser(targetUid, { disabled: newStatus === 'Suspended' });
        const callingUserEmail = request.auth.token.email || 'Unknown';
        const targetUser = await admin.auth().getUser(targetUid);
        await db.collection('audit_logs').add({
            type: 'STATUS_CHANGE',
            message: `Admin ${callingUserEmail} updated status of ${targetUser.email} to ${newStatus}.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            level: 'CRITICAL',
            details: { targetUser: targetUid, changedBy: request.auth.uid, newStatus }
        });
        return { success: true };
    } catch (error) {
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});

exports.updateMerchantProfile = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to update your profile.');
    }
    const uid = request.auth.uid;
    const dataToUpdate = request.data;
    delete dataToUpdate.role;
    delete dataToUpdate.status;
    delete dataToUpdate.handle;
    delete dataToUpdate.walletBalance;
    try {
        await db.collection('users').doc(uid).update(dataToUpdate);
        await db.collection('audit_logs').add({
            type: 'MERCHANT_PROFILE_UPDATE',
            level: 'INFO',
            message: `Merchant ${request.auth.token.email} (${uid}) updated their profile.`,
            details: { targetUser: uid }, 
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});

exports.upgradeSubscriptionPlan = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const uid = request.auth.uid;
    const { planName } = request.data;
    try {
        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        const currentPlan = userDoc.data()?.plan || 'Free';
        await userDocRef.update({ plan: planName });
        await db.collection('audit_logs').add({
            type: 'SUBSCRIPTION_CHANGE',
            level: 'MAJOR',
            message: `Merchant ${request.auth.token.email} (${uid}) upgraded from ${currentPlan} to ${planName}.`,
            details: { from: currentPlan, to: planName, targetUser: uid },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});

exports.updateMerchantHandle = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const uid = request.auth.uid;
    const { handle } = request.data;
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
        handle: handle,
        handleLastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        handleEditCount: admin.firestore.FieldValue.increment(1)
    });
    return { success: true };
});

exports.syncAuthToFirestore = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can perform this action.');
    }
    const listUsersResult = await admin.auth().listUsers(1000);
    return { success: true, message: `Sync triggered for ${listUsersResult.users.length} users.` };
});

exports.getSecuritySettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    const doc = await db.collection('platform').doc('settings').get();
    return doc.data()?.security || {};
});

exports.getPaymentSettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    const doc = await db.collection('platform').doc('settings').get();
    return doc.data()?.payment || {};
});

exports.updateSecuritySettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    await db.collection('platform').doc('settings').set({ security: request.data }, { merge: true });
    return { success: true };
});

exports.updatePaymentSettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    await db.collection('platform').doc('settings').set({ payment: request.data }, { merge: true });
    return { success: true };
});

exports.updateGeneralSettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    await db.collection('platform').doc('settings').set({ general: request.data }, { merge: true });
    return { success: true };
});

exports.getSubscriptionPlans = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'Login required.');
    const snapshot = await db.collection('subscriptionPlans').orderBy('price').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

exports.adjustWalletBalance = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    const { uid, adjustmentAmount, type } = request.data;
    const merchantRef = db.collection('users').doc(uid);
    const amount = type === 'credit' ? Number(adjustmentAmount) : -Number(adjustmentAmount);
    await merchantRef.update({ walletBalance: admin.firestore.FieldValue.increment(amount) });
    await db.collection('audit_logs').add({
        type: 'WALLET_ADJUSTMENT',
        level: 'CRITICAL',
        message: `Admin manually performed a ${type} of $${adjustmentAmount} for user ${uid}.`,
        details: { targetUser: uid, amount: adjustmentAmount, type },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
});

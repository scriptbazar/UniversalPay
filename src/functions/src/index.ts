
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { auth } from "firebase-functions";
import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";

// This check prevents the app from being initialized multiple times, which causes an error.
if (!admin.apps.length) {
    admin.initializeApp();
}
const db = getFirestore();

// This Cloud Function is the SINGLE SOURCE OF TRUTH for creating a user's database record.
// It is triggered when a new user is created in Firebase Authentication.
exports.addDefaultRoleClaim = auth.user().onCreate(async (user) => {
  const role = "merchant"; // Default role
  const batch = db.batch();
  
  // 1. Create the user document in Firestore
  const userDocRef = db.collection('users').doc(user.uid);
  const handle = `${(user.displayName || user.email?.split('@')[0] || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}-${user.uid.substring(0, 6)}`;
  
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

  // 2. Create an audit log for the user creation
  const auditLogRef = db.collection('audit_logs').doc();
  batch.set(auditLogRef, {
      type: 'USER_CREATED',
      message: `New user signed up: ${user.email} (uid: ${user.uid}). Assigned default role: '${role}'.`,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      level: 'INFO',
      details: {
          targetUser: user.uid,
      }
  });

  try {
    // 3. Commit the database changes
    await batch.commit();
    console.log(`Firestore document created for user: ${user.uid}`);

    // 4. Set the custom claim *after* the database write is successful
    await admin.auth().setCustomUserClaims(user.uid, { role });
    console.log(`Custom claim set for user: ${user.uid}`);
    
  } catch (error) {
    console.error(`FATAL: Error processing new user ${user.uid}:`, error);
  }
});


// Callable function to set a user's role to admin
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
    console.error(`Error setting role for user ${targetUid}:`, error);
    throw new HttpsError('internal', 'An internal error occurred.');
  }
});

// Callable function to update a user's status
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
        console.error(`Error updating status for user ${targetUid}:`, error);
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});


// Callable function for a merchant to update their own profile
exports.updateMerchantProfile = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to update your profile.');
    }
    const uid = request.auth.uid;
    const dataToUpdate = request.data;
    if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
        throw new HttpsError('invalid-argument', 'No update data provided.');
    }
    
    // Prevent self-elevation or changing critical fields
    delete dataToUpdate.role;
    delete dataToUpdate.status;
    delete dataToUpdate.handle;
    delete dataToUpdate.walletBalance;

    try {
        await db.collection('users').doc(uid).set(dataToUpdate, { merge: true });
        await db.collection('audit_logs').add({
            type: 'MERCHANT_PROFILE_UPDATE',
            level: 'INFO',
            message: `Merchant ${request.auth.token.email} (${uid}) updated their profile.`,
            details: { targetUser: uid }, 
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        console.error(`Error updating profile for user ${uid}:`, error);
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});

// Callable function for a merchant to upgrade their subscription plan
exports.upgradeSubscriptionPlan = onCall(async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to upgrade your plan.');
    }
    const uid = request.auth.uid;
    const { planName } = request.data;
    if (!planName || !['Free', 'Pro', 'Premium'].includes(planName)) {
        throw new HttpsError('invalid-argument', 'A valid plan name is required.');
    }

    try {
        const userDocRef = db.collection('users').doc(uid);
        const userDoc = await userDocRef.get();
        const currentPlan = userDoc.data()?.plan || 'Free';
        if (currentPlan === planName) {
             throw new HttpsError('failed-precondition', 'You are already on this plan.');
        }
        await userDocRef.update({ plan: planName });
        await db.collection('audit_logs').add({
            type: 'SUBSCRIPTION_CHANGE',
            level: 'MAJOR',
            message: `Merchant ${request.auth.token.email} (${uid}) upgraded from ${currentPlan} to ${planName}.`,
            details: { from: currentPlan, to: planName, targetUser: uid },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { success: true };
    } catch (error: any) {
        if (error instanceof HttpsError) throw error;
        throw new HttpsError('internal', 'An internal error occurred.');
    }
});

// Callable function for a merchant to update their handle
exports.updateMerchantHandle = onCall(async (request) => {
    if (!request.auth) throw new HttpsError('unauthenticated', 'You must be logged in.');
    const uid = request.auth.uid;
    const { handle } = request.data;
    if (!handle || handle.length < 3 || !/^[a-z0-9-]+$/.test(handle)) {
        throw new HttpsError('invalid-argument', 'Handle must be 3+ chars, lowercase letters, numbers, hyphens.');
    }

    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data();
    if (!userData) throw new HttpsError('not-found', 'User not found.');

    const handleQuery = await db.collection('users').where('handle', '==', handle).get();
    if (!handleQuery.empty && handleQuery.docs[0].id !== uid) {
        throw new HttpsError('already-exists', 'This handle is already taken.');
    }

    const lastUpdated = userData.handleLastUpdatedAt?.toDate();
    const editCount = userData.handleEditCount || 0;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    let newEditCount = lastUpdated && lastUpdated < threeMonthsAgo ? 0 : editCount;
    if (newEditCount >= 3) {
        throw new HttpsError('resource-exhausted', 'You have reached your handle edit limit.');
    }

    await userRef.update({
        handle: handle,
        handleLastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
        handleEditCount: newEditCount + 1
    });

    return { success: true };
});

// Callable function to sync Auth users to Firestore
exports.syncAuthToFirestore = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can perform this action.');
    }
    try {
        const listUsersResult = await admin.auth().listUsers(1000);
        const allUsers = listUsersResult.users;
        const allUserIds = allUsers.map(user => user.uid);
        if (allUserIds.length === 0) return { success: true, message: "No users in Auth.", created: 0, checked: 0 };
        const usersCollection = db.collection('users');
        const firestoreUserIds = new Set<string>();
        for (let i = 0; i < allUserIds.length; i += 30) {
            const batchIds = allUserIds.slice(i, i + 30);
            if (batchIds.length > 0) {
                const firestoreUserDocs = await usersCollection.where(admin.firestore.FieldPath.documentId(), 'in', batchIds).get();
                firestoreUserDocs.docs.forEach(doc => firestoreUserIds.add(doc.id));
            }
        }
        const missingUserIds = allUserIds.filter(uid => !firestoreUserIds.has(uid));
        if (missingUserIds.length === 0) return { success: true, message: "All users are in sync.", created: 0, checked: allUsers.length };
        
        let createdCount = 0;
        for (const uid of missingUserIds) {
            const userRecord = allUsers.find(u => u.uid === uid);
            if (userRecord) {
                 const handle = `${(userRecord.displayName || userRecord.email?.split('@')[0] || `user`).toLowerCase().replace(/[^a-z0-9]/g, '')}-${userRecord.uid.substring(0, 6)}`;
                 await db.collection('users').doc(userRecord.uid).set({
                    uid: userRecord.uid,
                    email: userRecord.email,
                    fullName: userRecord.displayName || 'New User',
                    avatar: userRecord.photoURL || `https://placehold.co/96x96.png?text=${(userRecord.displayName || 'U').charAt(0)}`,
                    role: "merchant",
                    status: 'Active',
                    plan: 'Free',
                    kycStatus: "Not Started",
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    handle: handle,
                    handleLastUpdatedAt: null,
                    handleEditCount: 0,
                    walletBalance: 0,
                });
                await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'merchant' });
                createdCount++;
            }
        }
        
        return { success: true, message: `Sync complete.`, created: createdCount, checked: allUsers.length };
    } catch (error) {
        console.error("Error syncing Auth to Firestore:", error);
        throw new HttpsError('internal', 'An error occurred while syncing users.');
    }
});


// ===== Settings Functions =====

const settingsDocRef = db.collection('platform').doc('settings');

exports.getSecuritySettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can view settings.');
    }
    const doc = await settingsDocRef.get();
    return doc.data()?.security || {};
});

exports.getPaymentSettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can view settings.');
    }
    const doc = await settingsDocRef.get();
    return doc.data()?.payment || {};
});

exports.updateSecuritySettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can update settings.');
    }
    await settingsDocRef.set({ security: request.data }, { merge: true });
    return { success: true };
});

exports.updatePaymentSettings = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') {
        throw new HttpsError('permission-denied', 'Only admins can update settings.');
    }
    await settingsDocRef.set({ payment: request.data }, { merge: true });
    return { success: true };
});

// ===== Subscription Plan Management Functions =====

exports.getSubscriptionPlans = onCall(async () => {
    const snapshot = await db.collection('subscriptionPlans').orderBy('price').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

exports.createSubscriptionPlan = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    await db.collection('subscriptionPlans').add(request.data);
    return { success: true };
});

exports.updateSubscriptionPlan = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    const { id, ...planData } = request.data;
    if (!id) throw new HttpsError('invalid-argument', 'Plan ID is required.');
    await db.collection('subscriptionPlans').doc(id).update(planData);
    return { success: true };
});

exports.deleteSubscriptionPlan = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Admin only.');
    const { id } = request.data;
    if (!id) throw new HttpsError('invalid-argument', 'Plan ID is required.');
    await db.collection('subscriptionPlans').doc(id).delete();
    return { success: true };
});

// ===== New User Management Functions =====
exports.updateUserRole = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Only admins can update roles.');
    const { uid, role } = request.data;
    await admin.auth().setCustomUserClaims(uid, { role });
    await db.collection('users').doc(uid).update({ role });
    // Audit log can be added here
    return { success: true };
});

exports.adjustWalletBalance = onCall(async (request) => {
    if (!request.auth || request.auth.token.role !== 'admin') throw new HttpsError('permission-denied', 'Only admins can adjust wallets.');
    const { uid, adjustmentAmount, type } = request.data;
    // In a real app, this would be a transactional update to a wallet document.
    // For this demo, we are just logging the action.
    await db.collection('audit_logs').add({
        type: 'WALLET_ADJUSTMENT',
        level: 'CRITICAL',
        message: `Admin manually performed a ${type} of $${adjustmentAmount} for user ${uid}.`,
        details: { targetUser: uid, amount: adjustmentAmount, type },
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
});


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
import { onCall, HttpsError } from "firebase-functions/v2/https"; // onCall import added
import { getFirestore } from "firebase-admin/firestore";

admin.initializeApp();
const db = getFirestore();


// This function now only assigns a default 'merchant' role upon creation.
// It also creates an audit log for the new user.
exports.addDefaultRoleClaim = auth.user().onCreate(async (user) => {
  const role = "merchant"; // Default role for all new users

  try {
    await admin.auth().setCustomUserClaims(user.uid, {
      role: role,
    });
    
    // Create an audit log for new user creation
    await db.collection('audit_logs').add({
        type: 'USER_CREATED',
        message: `New user signed up: ${user.email} (uid: ${user.uid}). Assigned default role: 'merchant'.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'INFO',
    });

    console.log(`Custom claim '${role}' set for user: ${user.uid}`);
  } catch (error) {
    console.error(`Error setting custom claim for user: ${user.uid}`, error);
  }
});

// New callable function to set a user's role to admin
exports.setAdminRole = onCall(async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callingUserUid = request.auth.uid;
  const callingUserEmail = request.auth.token.email || 'Unknown';


  // SECURITY FIX: Enforce that only existing admins can call this function.
  if (request.auth.token.role !== 'admin') {
     await db.collection('audit_logs').add({
        type: 'SECURITY_ALERT',
        message: `Non-admin user ${callingUserEmail} (${callingUserUid}) attempted to set an admin role.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'SECURITY_ALERT',
    });
    throw new HttpsError(
      'permission-denied',
      'Only admins can set user roles.'
    );
  }

  const targetUid = request.data.uid;
  const targetEmail = request.data.email; // Assuming target email is passed for logging

  if (!targetUid || !targetEmail) {
    throw new HttpsError('invalid-argument', 'The function must be called with "uid" and "email" arguments.');
  }

  try {
    // Set custom claim in Firebase Auth
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });

    // Also update the role in Firestore user document (optional, but good for consistency)
    const userRef = db.collection('users').doc(targetUid);
    await userRef.update({ role: 'admin' });
    
    // Create an audit log entry
    await db.collection('audit_logs').add({
        type: 'ROLE_CHANGE',
        message: `Admin ${callingUserEmail} (${callingUserUid}) promoted ${targetEmail} (${targetUid}) to admin.`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'CRITICAL',
    });


    console.log(`User ${targetUid} has been assigned the 'admin' role.`);
    return { success: true };
  } catch (error) {
    console.error(`Error setting admin role for user ${targetUid}:`, error);
    // Log failure as well
     await db.collection('audit_logs').add({
        type: 'ERROR',
        message: `Admin ${callingUserEmail} (${callingUserUid}) failed to promote ${targetEmail} (${targetUid}) to admin.`,
        error: (error as Error).message,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        level: 'ERROR',
    });
    throw new HttpsError('internal', 'An internal error occurred while setting the admin role.');
  }
});


// Callable function for a merchant to update their own profile
exports.updateMerchantProfile = onCall(async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to update your profile.');
    }

    const uid = request.auth.uid;
    const userEmail = request.auth.token.email || 'Unknown';
    const dataToUpdate = request.data;

    // 2. Data Validation (simple check)
    if (!dataToUpdate || Object.keys(dataToUpdate).length === 0) {
        throw new HttpsError('invalid-argument', 'No update data provided.');
    }
    
    // 3. Security Check: Prevent users from changing their own role or status
    if (dataToUpdate.role) {
        delete dataToUpdate.role;
    }
     if (dataToUpdate.status) {
        delete dataToUpdate.status;
    }

    try {
        const userDocRef = db.collection('users').doc(uid);

        // **FIX:** Use `setDoc` with `merge: true` instead of `updateDoc`.
        // This will create the document if it doesn't exist, or update it if it does.
        // It prevents the "No document to update" error which can cause an "internal" error.
        await userDocRef.set(dataToUpdate, { merge: true });


        // Create an audit log for the profile update
        await db.collection('audit_logs').add({
            type: 'MERCHANT_PROFILE_UPDATE',
            level: 'INFO',
            message: `Merchant ${userEmail} (${uid}) updated their profile.`,
            details: {
                ...dataToUpdate,
                targetUser: uid,
            }, 
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: 'Profile updated successfully.' };

    } catch (error) {
        console.error(`Error updating profile for user ${uid}:`, error);
        throw new HttpsError('internal', 'An internal error occurred while updating the profile.');
    }
});

// Callable function for a merchant to upgrade their subscription plan
exports.upgradeSubscriptionPlan = onCall(async (request) => {
    // 1. Authentication Check
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'You must be logged in to upgrade your plan.');
    }

    const uid = request.auth.uid;
    const userEmail = request.auth.token.email || 'Unknown';
    const { planName } = request.data;

    // 2. Data Validation
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

        // Update the user's plan in Firestore
        await userDocRef.update({ plan: planName });

        // Create an audit log for the subscription change
        await db.collection('audit_logs').add({
            type: 'SUBSCRIPTION_CHANGE',
            level: 'MAJOR',
            message: `Merchant ${userEmail} (${uid}) upgraded their plan from ${currentPlan} to ${planName}.`,
            details: {
                from: currentPlan,
                to: planName,
                targetUser: uid, // Add the targetUser field
            },
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { success: true, message: 'Plan upgraded successfully.' };

    } catch (error: any) {
        console.error(`Error upgrading plan for user ${uid}:`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError('internal', 'An internal error occurred while upgrading the plan.');
    }
});

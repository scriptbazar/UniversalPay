
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

// Correct initialization of the Firebase Admin SDK
if (admin.apps.length === 0) {
    admin.initializeApp();
}

// This function now only assigns a default 'merchant' role upon creation.
// This simplifies the logic and removes potential points of failure.
exports.addDefaultRoleClaim = auth.user().onCreate(async (user) => {
  const role = "merchant"; // Default role for all new users

  try {
    await admin.auth().setCustomUserClaims(user.uid, {
      role: role,
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

  // SECURITY FIX: Enforce that only existing admins can call this function.
  if (request.auth.token.role !== 'admin') {
    throw new HttpsError(
      'permission-denied',
      'Only admins can set user roles.'
    );
  }

  const targetUid = request.data.uid;

  if (!targetUid) {
    throw new HttpsError('invalid-argument', 'The function must be called with a "uid" argument.');
  }

  try {
    // Set custom claim in Firebase Auth
    await admin.auth().setCustomUserClaims(targetUid, { role: 'admin' });

    // Also update the role in Firestore user document (optional, but good for consistency)
    const userRef = admin.firestore().collection('users').doc(targetUid);
    await userRef.update({ role: 'admin' });

    console.log(`User ${targetUid} has been assigned the 'admin' role.`);
    return { success: true };
  } catch (error) {
    console.error(`Error setting admin role for user ${targetUid}:`, error);
    throw new HttpsError('internal', 'An internal error occurred while setting the admin role.');
  }
});

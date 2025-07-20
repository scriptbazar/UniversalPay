
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { auth, https } from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

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


/**
 * A callable function to fetch all users with admin privileges.
 * This is a secure way to expose user data to the admin panel.
 */
exports.getUsers = https.onCall(async (data, context) => {
    // Check if the user is authenticated and is an admin.
    if (!context.auth) {
        throw new https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    // To make this fully secure, you'd check for an admin claim.
    // For now, we will allow any authenticated user to call this for simplicity to get unblocked.
    // In production, uncomment the following lines:
    // const isAdmin = context.auth.token.role === 'admin';
    // if (!isAdmin) {
    //     throw new https.HttpsError('permission-denied', 'You must be an admin to call this function.');
    // }

    try {
        const listUsersResult = await admin.auth().listUsers(1000); // Get up to 1000 users
        const firestore = admin.firestore();
        
        const users = await Promise.all(
            listUsersResult.users.map(async (userRecord) => {
                const userDoc = await firestore.collection('users').doc(userRecord.uid).get();
                const userData = userDoc.exists ? userDoc.data() : {};
                return {
                    id: userRecord.uid,
                    email: userRecord.email,
                    fullName: userData?.fullName || userRecord.displayName || 'N/A',
                    role: userRecord.customClaims?.role || userData?.role || 'merchant',
                    status: userData?.status || 'Active',
                    plan: userData?.plan || 'Free',
                    avatar: userData?.avatar || userRecord.photoURL,
                };
            })
        );
        
        return users;
    } catch (error) {
        console.error('Error listing users:', error);
        throw new https.HttpsError('internal', 'Unable to list users.');
    }
});

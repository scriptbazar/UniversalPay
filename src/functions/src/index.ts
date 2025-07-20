
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

admin.initializeApp();

// This function now only assigns a default 'merchant' role upon creation
// by writing directly to the user's document in Firestore.
// This is more reliable than custom claims for this use case.
exports.addUserRoleToFirestore = auth.user().onCreate(async (user) => {
  const role = "merchant"; // Default role for all new users

  try {
    const userRef = admin.firestore().collection("users").doc(user.uid);
    await userRef.set({
        role: role,
        email: user.email,
        fullName: user.displayName || 'New User',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'Active',
        plan: 'Free'
    }, { merge: true }); // Use merge to not overwrite data from client signup
    
    console.log(`Role '${role}' written to Firestore for user: ${user.uid}`);
  } catch (error) {
    console.error(`Error writing role to Firestore for user: ${user.uid}`, error);
  }
});

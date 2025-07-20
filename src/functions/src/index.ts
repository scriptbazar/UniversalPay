
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

// This function assigns a role to new users and creates their document in Firestore.
// It makes the VERY FIRST user an 'admin', and all subsequent users 'merchant'.
exports.addUserRoleToFirestore = auth.user().onCreate(async (user) => {
  const usersCollection = admin.firestore().collection("users");
  
  // Check if this is the first user document being created.
  // We check for 2 because this function runs AFTER the user is created in Auth,
  // but before the document might be written from the client.
  // A count of 1 or 0 means this is the first real user.
  const snapshot = await usersCollection.limit(2).get();
  
  const role = (snapshot.size <= 1) ? "admin" : "merchant";

  try {
    const userRef = usersCollection.doc(user.uid);
    // Use set with merge:true. This creates the document if it doesn't exist,
    // or updates it without overwriting existing fields if the client created it first.
    await userRef.set({
        role: role,
        email: user.email,
        fullName: user.displayName || 'New User',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'Active',
        plan: 'Free'
    }, { merge: true });
    
    console.log(`Role '${role}' written to Firestore for user: ${user.uid}`);
    
    // Also set the custom claim on the user's auth token
    await admin.auth().setCustomUserClaims(user.uid, { role: role });
    console.log(`Custom claim '${role}' set for user: ${user.uid}`);

  } catch (error) {
    console.error(`Error processing new user setup for user: ${user.uid}`, error);
  }
});

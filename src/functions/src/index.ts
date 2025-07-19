
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

// This Cloud Function triggers whenever a new user is created.
// It assigns the 'merchant' custom claim by default.
// The admin role is now set via a dedicated server action in the app
// to avoid complexity with environment variables.
exports.addRoleClaim = auth.user().onCreate(async (user) => {
  const defaultRole = "merchant";

  try {
    await admin.auth().setCustomUserClaims(user.uid, {
      role: defaultRole,
    });
    console.log(`Custom claim '${defaultRole}' set for new user: ${user.uid}`);
  } catch (error) {
    console.error(`Error setting custom claim for user: ${user.uid}`, error);
  }
});

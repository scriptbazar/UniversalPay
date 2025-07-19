
/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */
import { auth, config } from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// This Cloud Function triggers whenever a new user is created.
// It checks if the new user's email matches the admin email set in the config.
// If it matches, it assigns the 'admin' custom claim.
// Otherwise, it assigns the 'merchant' custom claim by default.
exports.addRoleClaim = auth.user().onCreate(async (user) => {
  if (user.email) {
    // Get the admin email from Functions config
    const adminEmail = config().user?.admin_email;

    let role = "merchant"; // Default role
    if (adminEmail && user.email === adminEmail) {
      role = "admin";
    }

    try {
      await admin.auth().setCustomUserClaims(user.uid, {
        role: role,
      });
      console.log(`Custom claim '${role}' set for user: ${user.uid}`);
    } catch (error) {
      console.error(`Error setting custom claim for user: ${user.uid}`, error);
    }
  }
});

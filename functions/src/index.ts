
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

// IMPORTANT: Replace this with your actual admin email address.
const adminEmail = '[ADMIN_EMAIL_HERE]';

// This Cloud Function triggers whenever a new user is created.
// It checks if the new user's email matches the admin email.
// If it matches, it assigns the 'admin' custom claim.
// Otherwise, it assigns the 'merchant' custom claim by default.
exports.addRoleClaim = auth.user().onCreate(async (user) => {
  let role = "merchant"; // Default role
  
  if (user.email && user.email === adminEmail) {
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
});


/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onCall } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { auth } from "firebase-functions/v1";
import * as admin from "firebase-admin";

admin.initializeApp();

// On sign up, add a 'merchant' custom claim to the user
exports.addMerchantClaim = auth.user().onCreate(async (user) => {
  if (user.email) {
    try {
      await admin.auth().setCustomUserClaims(user.uid, {
        role: "merchant",
      });
      logger.info(`Custom claim 'merchant' set for user: ${user.uid}`);
      return;
    } catch (error) {
      logger.error(
        `Error setting custom claim for user: ${user.uid}`,
        error
      );
    }
  }
});

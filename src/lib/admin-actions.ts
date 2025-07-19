
'use server';

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK only if it's not already initialized
if (!admin.apps.length) {
    // When running on Firebase Hosting, the SDK is automatically initialized
    // with the correct project configuration.
    try {
        admin.initializeApp();
    } catch (e) {
        console.error('Firebase Admin initialization error', e);
    }
}

/**
 * Sets the 'admin' custom claim on a user if their email matches the
 * one specified in the environment variables. This is a secure server-side action.
 * @param uid The UID of the user to check and potentially grant admin rights.
 * @returns An object indicating success or failure.
 */
export async function setAdminClaimForCurrentUser(uid: string) {
    try {
        // This environment variable should be set in your hosting environment's settings.
        const adminEmail = process.env.ADMIN_EMAIL; 
        if (!adminEmail) {
            console.log('ADMIN_EMAIL environment variable is not set. Skipping admin claim check.');
            return { success: true, message: 'Admin email not configured.' };
        }

        const user = await admin.auth().getUser(uid);
        
        // If the user's email matches the admin email, set the custom claim.
        if (user.email === adminEmail) {
            if (user.customClaims?.role !== 'admin') {
                await admin.auth().setCustomUserClaims(uid, { role: 'admin' });
                console.log(`Admin role granted to ${user.email}`);
                return { success: true, message: `Admin role granted to ${user.email}` };
            }
            return { success: true, message: 'User is already an admin.' };
        }
        
        return { success: true, message: 'User is not the designated admin.' };

    } catch (error: any) {
        console.error("Error in setAdminClaimForCurrentUser:", error);
        // Do not expose detailed error messages to the client
        return { success: false, error: "An internal error occurred while setting user claims." };
    }
}

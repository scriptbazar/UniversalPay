
'use server';

import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';

// --- IMPORTANT ---
// This is a temporary measure to initialize the admin user.
// For security, you might want to remove this file after its first successful use.

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  try {
    // When running in a Firebase environment, it's often initialized automatically.
    // If not, it uses GOOGLE_APPLICATION_CREDENTIALS environment variable.
    admin.initializeApp();
  } catch (e) {
    console.error('Firebase Admin initialization error', e);
  }
}

// --- CONFIGURATION ---
// --- PUT YOUR ADMIN EMAIL HERE ---
const ADMIN_EMAIL = 'PUT_YOUR_ADMIN_EMAIL_HERE';
// --------------------

export async function grantAdminRole(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    if (ADMIN_EMAIL === 'PUT_YOUR_ADMIN_EMAIL_HERE' || !ADMIN_EMAIL) {
        return { success: false, error: 'Admin email has not been configured in the server action file (app/make-admin/actions.ts).' };
    }
      
    const adminAuth = getAuth();
    
    // Get the user by email from Firebase Admin SDK
    const userRecord = await adminAuth.getUserByEmail(ADMIN_EMAIL);
    const uid = userRecord.uid;

    // Check if the user already has the admin role
    if (userRecord.customClaims && userRecord.customClaims['role'] === 'admin') {
      return { success: true, message: `User ${ADMIN_EMAIL} already has the admin role.` };
    }

    // Set the custom claim
    await adminAuth.setCustomUserClaims(uid, { role: 'admin' });

    return { success: true, message: `Admin role has been granted to ${ADMIN_EMAIL}. Please log out and log back in.` };
  } catch (error: any) {
    console.error('Error in grantAdminRole:', error);
    if (error.code === 'auth/user-not-found') {
        return { success: false, error: `The specified admin email "${ADMIN_EMAIL}" does not exist in Firebase Authentication.` };
    }
    return { success: false, error: 'An internal error occurred: ' + error.message };
  }
}

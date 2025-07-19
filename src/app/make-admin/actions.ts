'use server';

import * as admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { auth as clientAuth } from '@/lib/firebase'; // Client auth to get current user

// --- IMPORTANT ---
// This is a temporary measure to initialize the admin user.
// For security, you might want to remove this file after its first successful use.

// Initialize Firebase Admin SDK if not already done
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // Service account credentials can be set as environment variables
      // GOOGLE_APPLICATION_CREDENTIALS points to the service account JSON file
      // Or you can initialize with credentials directly if needed
    });
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
    const currentUser = clientAuth.currentUser;
    if (!currentUser) {
      return { success: false, error: 'No user is logged in.' };
    }

    const uid = currentUser.uid;
    const userEmail = currentUser.email;

    if (userEmail !== ADMIN_EMAIL) {
      return { success: false, error: `Only the designated admin (${ADMIN_EMAIL}) can perform this action.` };
    }
    
    // Get the user by UID from Firebase Admin SDK
    const adminAuth = getAuth();
    const userRecord = await adminAuth.getUser(uid);

    // Check if the user already has the admin role
    if (userRecord.customClaims && userRecord.customClaims['role'] === 'admin') {
      return { success: true, message: 'User already has the admin role.' };
    }

    // Set the custom claim
    await adminAuth.setCustomUserClaims(uid, { role: 'admin' });

    return { success: true, message: `Admin role has been granted to ${userEmail}.` };
  } catch (error: any) {
    console.error('Error in grantAdminRole:', error);
    return { success: false, error: 'An internal error occurred: ' + error.message };
  }
}


'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import admin from 'firebase-admin';

// This is a simplified check. In a real app, you'd initialize admin only once.
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // If your functions are in the same project, you might not need credentials here
      // when deployed on Firebase/Google Cloud. For local dev, you'd use a service account.
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

/**
 * Updates a user's role in Firestore and their custom claim in Firebase Auth.
 * @param uid The UID of the user to update.
 * @param role The new role to assign ('admin' or 'merchant').
 * @param adminUid The UID of the admin making the change, for audit purposes.
 * @returns An object indicating success or failure.
 */
export async function updateUserRole(uid: string, role: 'admin' | 'merchant', adminUid: string) {
    if (!uid || !role) {
        return { success: false, error: 'User ID and role are required.' };
    }

    try {
        // 1. Update the custom claim in Firebase Auth
        await admin.auth().setCustomUserClaims(uid, { role });
        
        // 2. Update the role in the Firestore document
        const userDocRef = doc(db, "users", uid);
        await updateDoc(userDocRef, { role });

        // 3. (Optional but recommended) Add an audit log
        const targetUser = await admin.auth().getUser(uid);
        const adminUser = await admin.auth().getUser(adminUid);
        await db.collection('audit_logs').add({
            type: 'ROLE_CHANGE',
            level: 'CRITICAL',
            message: `Admin ${adminUser.email} (${adminUid}) changed role of ${targetUser.email} (${uid}) to ${role}.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Revalidate paths to ensure UI updates
        revalidatePath(`/dashboard/users/${uid}`);
        revalidatePath(`/dashboard/users`);

        return { success: true };

    } catch (error: any) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update user role. Please check server logs." };
    }
}

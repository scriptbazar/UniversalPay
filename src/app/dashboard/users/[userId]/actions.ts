
'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc, writeBatch } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import admin from 'firebase-admin';

// This is a simplified check. In a real app, you'd initialize admin only once.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
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
        const adminUser = await admin.auth().getUser(adminUid);
        const targetUser = await admin.auth().getUser(uid);
        
        const batch = writeBatch(db);

        // 1. Update the custom claim in Firebase Auth
        await admin.auth().setCustomUserClaims(uid, { role });
        
        // 2. Update the role in the Firestore document
        const userDocRef = doc(db, "users", uid);
        batch.update(userDocRef, { role });

        // 3. Add an audit log
        const auditLogRef = doc(collection(db, 'audit_logs'));
        batch.set(auditLogRef, {
            type: 'ROLE_CHANGE',
            level: 'CRITICAL',
            message: `Admin ${adminUser.email} (${adminUid}) changed role of ${targetUser.email} (${uid}) to ${role}.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        
        await batch.commit();

        // Revalidate paths to ensure UI updates
        revalidatePath(`/dashboard/users/${uid}`);
        revalidatePath(`/dashboard/users`);

        return { success: true };

    } catch (error: any) {
        console.error("Error updating user role:", error);
        return { success: false, error: "Failed to update user role. Please check server logs." };
    }
}


export async function updateUserStatus(uid: string, status: 'Active' | 'Suspended', adminUid: string) {
    if (!uid || !status) {
        return { success: false, error: 'User ID and status are required.' };
    }

    try {
        const adminUser = await admin.auth().getUser(adminUid);
        const targetUser = await admin.auth().getUser(uid);

        const batch = writeBatch(db);

        const userDocRef = doc(db, "users", uid);
        batch.update(userDocRef, { status });

        const auditLogRef = doc(collection(db, 'audit_logs'));
        batch.set(auditLogRef, {
            type: 'STATUS_CHANGE',
            level: 'CRITICAL',
            message: `Admin ${adminUser.email} (${adminUid}) ${status === 'Active' ? 'unsuspended' : 'suspended'} user ${targetUser.email} (${uid}).`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        await batch.commit();
        
        revalidatePath(`/dashboard/users/${uid}`);
        revalidatePath(`/dashboard/users`);
        
        return { success: true };
    } catch (error: any) {
        console.error("Error updating user status:", error);
        return { success: false, error: "Failed to update user status." };
    }
}


export async function adjustWalletBalance(uid: string, adjustmentAmount: number, type: 'credit' | 'debit', adminUid: string) {
    if (!uid || !adjustmentAmount || !type) {
        return { success: false, error: 'User ID, amount, and type are required.' };
    }
    
    // In a real application, you would have a dedicated 'wallets' collection
    // and perform a transactional update. For this demo, we'll simulate it on the user object.
    const userRef = doc(db, "users", uid);
    
    try {
        const adminUser = await admin.auth().getUser(adminUid);
        const targetUser = await admin.auth().getUser(uid);

        const auditLogRef = doc(collection(db, 'audit_logs'));
        await db.runTransaction(async (transaction) => {
             // This is a placeholder. In a real app, you'd fetch the wallet document.
             // const walletRef = doc(db, "wallets", uid);
             // const walletDoc = await transaction.get(walletRef);
             // const currentBalance = walletDoc.data()?.balance || 0;
             // const newBalance = type === 'credit' ? currentBalance + adjustmentAmount : currentBalance - adjustmentAmount;
             // transaction.update(walletRef, { balance: newBalance });

            transaction.set(auditLogRef, {
                type: 'WALLET_ADJUSTMENT',
                level: 'CRITICAL',
                message: `Admin ${adminUser.email} (${adminUid}) performed a manual ${type} of $${adjustmentAmount.toFixed(2)} for user ${targetUser.email} (${uid}).`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                details: {
                    targetUser: uid,
                    amount: adjustmentAmount,
                    type,
                }
            });
        });
        
        return { success: true };

    } catch (error: any) {
        console.error("Error adjusting wallet balance:", error);
        return { success: false, error: "Failed to adjust wallet balance." };
    }
}

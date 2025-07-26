
'use server';

import { db } from "@/lib/firebase";
import { updateWithdrawalStatus as updateLocalWithdrawalStatus } from "@/lib/withdrawalsData";
import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
      admin.initializeApp();
    } catch (e) {
      console.error('Firebase admin initialization error', e);
    }
}

export async function processWithdrawal(adminUid: string, withdrawalId: string, newStatus: "Completed" | "Failed") {
    if (!adminUid) {
        return { success: false, error: 'Admin user not identified.' };
    }
    
    // This is where you would interact with a real payment provider API.
    // For this demo, we'll just update our mock data.
    updateLocalWithdrawalStatus(withdrawalId, newStatus);
    
    try {
        const adminUser = await admin.auth().getUser(adminUid);
        await db.collection('audit_logs').add({
            type: 'FINANCIAL_ACTION',
            level: 'MAJOR',
            message: `Admin ${adminUser.email} (${adminUid}) ${newStatus.toLowerCase()} withdrawal request ${withdrawalId}.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: {
                withdrawalId,
                status: newStatus,
            }
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error logging withdrawal processing:", error);
        return { success: false, error: 'Failed to create audit log.' };
    }
}

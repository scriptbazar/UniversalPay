
'use server';

import { db, admin } from '@/lib/firebaseAdmin';

export async function logSubscriptionChange(adminUid: string, action: 'created' | 'updated' | 'deleted', planName: string, details?: any) {
    if (!adminUid) {
        return { success: false, error: 'Admin user not identified.' };
    }
    try {
        const adminUser = await admin.auth().getUser(adminUid);
        await db.collection('audit_logs').add({
            type: 'SUBSCRIPTION_PLAN_CHANGE',
            level: 'MAJOR',
            message: `Admin ${adminUser.email} (${adminUid}) ${action} the '${planName}' subscription plan.`,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            details: details || {}
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error logging subscription change:", error);
        return { success: false, error: 'Failed to create audit log.' };
    }
}

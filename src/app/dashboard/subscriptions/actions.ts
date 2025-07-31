
'use server';

import { db } from "@/lib/firebase";
import admin from 'firebase-admin';
import serviceAccount from "../../../../serviceAccountKey.json";

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

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

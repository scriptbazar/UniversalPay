
'use server';

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";

export async function logSubscriptionChange(adminUid: string, action: 'created' | 'updated' | 'deleted', planName: string, details?: any) {
    if (!adminUid) {
        return { success: false, error: 'Admin user not identified.' };
    }
    
    try {
        const functions = getFunctions(app);
        const logFunction = httpsCallable(functions, 'logSubscriptionChange');
        await logFunction({ adminUid, action, planName, details });
        return { success: true };
    } catch (error: any) {
        console.error("Error calling logSubscriptionChange function:", error);
        return { success: false, error: "Failed to create audit log via Cloud Function." };
    }
}

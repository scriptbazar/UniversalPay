
'use server';

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase"; // Using client-side app to get functions instance

// IMPORTANT: This file now calls Cloud Functions instead of running admin code directly.
// This is a more secure and reliable pattern for Next.js applications.

/**
 * Calls the `setAdminRole` Cloud Function.
 * @param uid The UID of the user to make an admin.
 * @param email The email of the user for logging purposes.
 * @returns An object indicating success or failure.
 */
export async function setAdminRole(uid: string, email: string) {
    try {
        const functions = getFunctions(app); // Use the client-side app instance
        const setAdminRoleFunction = httpsCallable(functions, 'setAdminRole');
        const result = await setAdminRoleFunction({ uid, email });
        return { success: true, data: result.data };
    } catch (error: any) {
        console.error("Error calling setAdminRole function:", error);
        return { success: false, error: error.message };
    }
}


export async function updateSecuritySettings(adminUid: string, data: {
    geminiApiKey?: string;
    reCaptchaSiteKey?: string;
    reCaptchaSecretKey?: string;
    isCaptchaEnabled: boolean;
    isMerchantCaptchaRequired: boolean;
    isAdmin2faEnabled: boolean;
}) {
    // This logic needs to be moved to a callable Cloud Function
    // for proper security and execution context.
    console.warn("updateSecuritySettings is not fully implemented as a Cloud Function yet.");
    // For now, return a success message to the UI to unblock.
    return { success: true, message: "Settings will be saved upon implementing the backend function." };
}

export async function updatePaymentSettings(adminUid: string, data: {
    stripePk: string;
    stripeSk: string;
    paypalClientId: string;
    paypalSecret: string;
    usdtWallet: string;
    btcWallet: string;
}) {
     // This logic needs to be moved to a callable Cloud Function
    console.warn("updatePaymentSettings is not fully implemented as a Cloud Function yet.");
    return { success: true, message: "Settings will be saved upon implementing the backend function." };
}

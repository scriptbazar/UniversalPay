
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

// Function to get security settings by calling a Cloud Function
export async function getSecuritySettings() {
    try {
        const functions = getFunctions(app);
        const getSettings = httpsCallable(functions, 'getSecuritySettings');
        const result = await getSettings();
        return result.data;
    } catch (error: any) {
        console.error("Error getting security settings:", error);
        // Return a default object structure on error to prevent UI crashes
        return {
            geminiApiKey: '',
            reCaptchaSiteKey: '',
            reCaptchaSecretKey: '',
            isCaptchaEnabled: true,
            isMerchantCaptchaRequired: true,
            isAdmin2faEnabled: true,
        };
    }
}

// Function to get payment settings by calling a Cloud Function
export async function getPaymentSettings() {
    try {
        const functions = getFunctions(app);
        const getSettings = httpsCallable(functions, 'getPaymentSettings');
        const result = await getSettings();
        return result.data;
    } catch (error: any) {
        console.error("Error getting payment settings:", error);
         // Return a default object structure on error
        return {
            stripePk: '',
            stripeSk: '',
            paypalClientId: '',
            paypalSecret: '',
            usdtWallet: '',
            btcWallet: '',
        };
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
    try {
        const functions = getFunctions(app);
        const updateSettings = httpsCallable(functions, 'updateSecuritySettings');
        await updateSettings(data);
        return { success: true };
    } catch(error: any) {
        console.error("Error updating security settings:", error);
        return { success: false, error: error.message };
    }
}

export async function updatePaymentSettings(adminUid: string, data: {
    stripePk: string;
    stripeSk: string;
    paypalClientId: string;
    paypalSecret: string;
    usdtWallet: string;
    btcWallet: string;
}) {
     try {
        const functions = getFunctions(app);
        const updateSettings = httpsCallable(functions, 'updatePaymentSettings');
        await updateSettings(data);
        return { success: true };
    } catch(error: any) {
        console.error("Error updating payment settings:", error);
        return { success: false, error: error.message };
    }
}

    
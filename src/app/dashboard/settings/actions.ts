
'use server';

import { db, admin } from '@/lib/firebaseAdmin';

// This is a simplified check. In a real app, you'd initialize admin only once.
if (!admin.apps.length) {
  try {
    admin.initializeApp();
  } catch (e) {
    console.error('Firebase admin initialization error', e);
  }
}

const settingsDocRef = db.collection('platform_settings').doc('global');

/**
 * Retrieves a specific group of settings from the Firestore database.
 * @param settingsGroup - The key for the settings object (e.g., 'security', 'payment').
 * @returns The settings object or an empty object if not found.
 */
async function getSettingsGroup(settingsGroup: string): Promise<any> {
    try {
        const doc = await settingsDocRef.get();
        if (doc.exists) {
            const data = doc.data();
            return data?.[settingsGroup] || {};
        }
        return {};
    } catch (error) {
        console.error(`Failed to read ${settingsGroup} settings:`, error);
        throw new Error(`Could not read ${settingsGroup} settings from the database.`);
    }
}

/**
 * Updates a specific group of settings in the Firestore database.
 * @param settingsGroup - The key for the settings object (e.g., 'security', 'payment').
 * @param updates - The data to update.
 */
async function updateSettingsGroup(settingsGroup: string, updates: Record<string, any>) {
    try {
        await settingsDocRef.set({
            [settingsGroup]: updates
        }, { merge: true });
        return { success: true };
    } catch (error) {
        console.error(`Failed to write ${settingsGroup} settings to database:`, error);
        throw new Error(`Could not update ${settingsGroup} settings in the database.`);
    }
}


export async function getSecuritySettings() {
    const securitySettings = await getSettingsGroup('security');
    return {
        geminiApiKey: securitySettings.geminiApiKey || '',
        reCaptchaSiteKey: securitySettings.reCaptchaSiteKey || '',
        reCaptchaSecretKey: securitySettings.reCaptchaSecretKey || '',
        isCaptchaEnabled: securitySettings.isCaptchaEnabled !== false, // default to true
        isMerchantCaptchaRequired: securitySettings.isMerchantCaptchaRequired !== false, // default to true
        isAdmin2faEnabled: securitySettings.isAdmin2faEnabled !== false, // default to true
    };
}


export async function updateSecuritySettings(adminUid: string, data: {
    geminiApiKey?: string;
    reCaptchaSiteKey?: string;
    reCaptchaSecretKey?: string;
    isCaptchaEnabled: boolean;
    isMerchantCaptchaRequired: boolean;
    isAdmin2faEnabled: boolean;
}) {
    const result = await updateSettingsGroup('security', data);

    if (result.success) {
        try {
            const adminUser = await admin.auth().getUser(adminUid);
            await db.collection('audit_logs').add({
                type: 'SECURITY_SETTINGS_UPDATED',
                level: 'CRITICAL',
                message: `Admin ${adminUser.email} (${adminUid}) updated global security settings.`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                details: {
                    // Avoid logging sensitive keys
                    isCaptchaEnabled: data.isCaptchaEnabled,
                    isMerchantCaptchaRequired: data.isMerchantCaptchaRequired,
                    isAdmin2faEnabled: data.isAdmin2faEnabled,
                }
            });
        } catch(e) {
            console.error("Failed to write audit log for security update.", e)
        }
    }
    return result;
}

export async function getPaymentSettings() {
    const paymentSettings = await getSettingsGroup('payment');
    return {
        stripePk: paymentSettings.stripePk || '',
        stripeSk: paymentSettings.stripeSk || '',
        paypalClientId: paymentSettings.paypalClientId || '',
        paypalSecret: paymentSettings.paypalSecret || '',
        usdtWallet: paymentSettings.usdtWallet || '',
        btcWallet: paymentSettings.btcWallet || '',
    };
}

export async function updatePaymentSettings(adminUid: string, data: {
    stripePk: string;
    stripeSk: string;
    paypalClientId: string;
    paypalSecret: string;
    usdtWallet: string;
    btcWallet: string;
}) {
    const result = await updateSettingsGroup('payment', data);

    if (result.success) {
        try {
            const adminUser = await admin.auth().getUser(adminUid);
            await db.collection('audit_logs').add({
                type: 'PAYMENT_SETTINGS_UPDATED',
                level: 'CRITICAL',
                message: `Admin ${adminUser.email} (${adminUid}) updated payment gateway settings.`,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            });
        } catch(e) {
            console.error("Failed to write audit log for payment settings update.", e)
        }
    }
    return result;
}

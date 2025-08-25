
'use server';

import { getFunctions, httpsCallable } from "firebase/functions";
import { app } from "@/lib/firebase";
import { revalidatePath } from "next/cache";

const functions = getFunctions(app);

/**
 * Calls the `updateUserRole` Cloud Function.
 * @param uid The UID of the user to update.
 * @param role The new role to assign ('admin' or 'merchant').
 * @returns An object indicating success or failure.
 */
export async function updateUserRole(uid: string, role: 'admin' | 'merchant') {
    try {
        const updateUserRoleFunction = httpsCallable(functions, 'updateUserRole');
        await updateUserRoleFunction({ uid, role });
        revalidatePath(`/dashboard/users/${uid}`);
        revalidatePath(`/dashboard/users`);
        return { success: true };
    } catch (error: any) {
        console.error("Error calling updateUserRole function:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Calls the `updateUserStatus` Cloud Function.
 * @param uid The UID of the user to update.
 * @param status The new status to assign ('Active' or 'Suspended').
 * @returns An object indicating success or failure.
 */
export async function updateUserStatus(uid: string, status: 'Active' | 'Suspended') {
    try {
        const updateUserStatusFunction = httpsCallable(functions, 'updateUserStatus');
        await updateUserStatusFunction({ uid, status });
        revalidatePath(`/dashboard/users/${uid}`);
        revalidatePath(`/dashboard/users`);
        return { success: true };
    } catch (error: any) {
        console.error("Error calling updateUserStatus function:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Calls the `adjustWalletBalance` Cloud Function.
 * @param uid The UID of the user whose wallet to adjust.
 * @param adjustmentAmount The amount to credit or debit.
 * @param type The type of adjustment ('credit' or 'debit').
 * @returns An object indicating success or failure.
 */
export async function adjustWalletBalance(uid: string, adjustmentAmount: number, type: 'credit' | 'debit') {
    try {
        const adjustWalletBalanceFunction = httpsCallable(functions, 'adjustWalletBalance');
        await adjustWalletBalanceFunction({ uid, adjustmentAmount, type });
        // Revalidating the user page might be useful if the balance is displayed there.
        revalidatePath(`/dashboard/users/${uid}`);
        return { success: true };
    } catch (error: any) {
        console.error("Error calling adjustWalletBalance function:", error);
        return { success: false, error: error.message };
    }
}

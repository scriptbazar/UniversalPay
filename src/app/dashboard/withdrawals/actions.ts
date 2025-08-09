
"use server"
import { revalidatePath } from "next/cache";
import { db, admin } from "@/lib/firebaseAdmin";
import { collection, addDoc, serverTimestamp, doc, updateDoc, writeBatch } from "firebase/firestore";

// Define the Withdrawal type
export type Withdrawal = {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'Pending' | 'Completed' | 'Failed';
  createdAt: any;
  userId: string;
};

/**
 * Creates a new withdrawal request.
 * @param withdrawalData - The data for the new withdrawal.
 * @returns An object with the success status and the new withdrawal data or an error message.
 */
export async function createWithdrawal(withdrawalData: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>) {
  try {
    const newWithdrawal = {
      ...withdrawalData,
      status: 'Pending' as const,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "withdrawals"), newWithdrawal);
    revalidatePath("/merchant/withdrawals");
    return { success: true, withdrawal: { ...newWithdrawal, id: docRef.id } };
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return { success: false, error: "Failed to create withdrawal." };
  }
}

/**
 * Processes a withdrawal request by updating its status and logging the action.
 * @param withdrawalId - The ID of the withdrawal to process.
 * @param newStatus - The new status of the withdrawal ('Completed' or 'Failed').
 * @param adminUid - The UID of the admin performing the action.
 * @returns An object with the success status or an error message.
 */
export async function processWithdrawal(withdrawalId: string, newStatus: 'Completed' | 'Failed', adminUid: string) {
    if (!withdrawalId || !newStatus || !adminUid) {
        return { success: false, error: 'Withdrawal ID, new status, and admin UID are required.' };
    }
    
    const withdrawalRef = doc(db, "withdrawals", withdrawalId);
    
    try {
        const adminUser = await admin.auth().getUser(adminUid);
        const withdrawalDoc = await withdrawalRef.get();

        if (!withdrawalDoc.exists()) {
            return { success: false, error: 'Withdrawal request not found.' };
        }
        
        const withdrawalData = withdrawalDoc.data();
        const targetUser = await admin.auth().getUser(withdrawalData.merchantId);
        
        const batch = writeBatch(db);

        // 1. Update the withdrawal status
        batch.update(withdrawalRef, { status: newStatus });

        // In a real app, if the withdrawal is successful, you'd perform the actual fund transfer here.
        // If it fails, you might credit the amount back to the user's wallet.

        // 2. Create an audit log
        const auditLogRef = doc(collection(db, 'audit_logs'));
        batch.set(auditLogRef, {
            type: 'FINANCIAL_ACTION',
            level: 'CRITICAL',
            message: `Admin ${adminUser.email} (${adminUid}) ${newStatus.toLowerCase()} withdrawal of $${withdrawalData.amount} for user ${targetUser.email} (${withdrawalData.merchantId}).`,
            timestamp: serverTimestamp(),
            details: {
                withdrawalId: withdrawalId,
                targetUser: withdrawalData.merchantId,
                amount: withdrawalData.amount,
                newStatus: newStatus
            }
        });

        await batch.commit();

        revalidatePath("/dashboard/withdrawals"); // Revalidate the path to update caches
        return { success: true };
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return { success: false, error: "Failed to process withdrawal." };
    }
}


"use server"
import { revalidatePath } from "next/cache";
import { db, admin } from "@/lib/firebaseAdmin";
import { collection, addDoc, serverTimestamp, doc, updateDoc } from "firebase/firestore";

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
 * Processes a withdrawal request by updating its status. This should be a Cloud Function.
 * @param withdrawalId - The ID of the withdrawal to process.
 * @param newStatus - The new status of the withdrawal.
 * @returns An object with the success status or an error message.
 */
export async function processWithdrawal(withdrawalId: string, newStatus: 'Completed' | 'Failed') {
    if (!withdrawalId || !newStatus) {
        return { success: false, error: 'Withdrawal ID and new status are required.' };
    }
    try {
        const withdrawalRef = doc(db, "withdrawals", withdrawalId);
        
        // In a real app, you would have logic here to actually transfer the money
        // before marking the withdrawal as complete. For now, we'll just update the status.

        await updateDoc(withdrawalRef, { status: newStatus });
        revalidatePath("/dashboard/withdrawals");
        return { success: true };
    } catch (error) {
        console.error("Error processing withdrawal:", error);
        return { success: false, error: "Failed to process withdrawal." };
    }
}

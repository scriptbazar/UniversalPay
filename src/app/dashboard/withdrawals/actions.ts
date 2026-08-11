import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from "firebase/firestore";

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
 * Creates a new withdrawal request with input validation.
 * @param withdrawalData - The data for the new withdrawal.
 */
export async function createWithdrawal(withdrawalData: Omit<Withdrawal, 'id' | 'createdAt' | 'status'>) {
  try {
    if (!withdrawalData.amount || withdrawalData.amount <= 0) {
      return { success: false, error: "Withdrawal amount must be greater than $0." };
    }
    if (!withdrawalData.accountNumber || withdrawalData.accountNumber.trim().length < 4) {
      return { success: false, error: "Valid bank account or wallet address is required." };
    }
    const newWithdrawal = {
      ...withdrawalData,
      status: 'Pending' as const,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "withdrawals"), newWithdrawal);
    return { success: true, withdrawal: { ...newWithdrawal, id: docRef.id } };
  } catch (error: any) {
    console.error("Error creating withdrawal:", error);
    return { success: false, error: error.message || "Failed to create withdrawal request." };
  }
}

/**
 * Processes a withdrawal request by updating its status in Firestore.
 */
export async function processWithdrawal(withdrawalId: string, newStatus: 'Completed' | 'Failed', adminUid: string) {
    if (!withdrawalId || !newStatus || !adminUid) {
        return { success: false, error: 'Withdrawal ID, new status, and admin UID are required.' };
    }
    
    try {
        const withdrawalRef = doc(db, "withdrawals", withdrawalId);
        await updateDoc(withdrawalRef, { 
            status: newStatus,
            processedBy: adminUid,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error: any) {
        console.error("Error processing withdrawal:", error);
        return { success: false, error: error.message || "Failed to process withdrawal." };
    }
}

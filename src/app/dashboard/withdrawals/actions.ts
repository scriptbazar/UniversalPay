"use server"
import { revalidatePath } from "next/cache";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Define the Withdrawal type
export type Withdrawal = {
  id: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'Pending' | 'Completed' | 'Failed';
  date: string;
  userId: string;
};

/**
 * Creates a new withdrawal request.
 * @param withdrawalData - The data for the new withdrawal.
 * @returns An object with the success status and the new withdrawal data or an error message.
 */
export async function createWithdrawal(withdrawalData: Omit<Withdrawal, 'id' | 'date' | 'status'>) {
  try {
    const newWithdrawal = {
      ...withdrawalData,
      status: 'Pending' as const,
      date: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "withdrawals"), newWithdrawal);
    revalidatePath("/merchant/withdrawals");
    return { success: true, withdrawal: { ...newWithdrawal, id: docRef.id } };
  } catch (error) {
    console.error("Error creating withdrawal:", error);
    return { success: false, error: "Failed to create withdrawal." };
  }
}

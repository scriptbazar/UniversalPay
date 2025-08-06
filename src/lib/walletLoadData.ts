import { db } from './firebase';
import { collection, addDoc, getDocs, doc, updateDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';

export type WalletLoadRequest = {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  amount: string;
  currency: 'USD';
  method: string; // Method used for payment
  transactionId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: any; // Firestore Timestamp
};


// In a real app, you would fetch this data from Firestore.
// The functions are kept for structural consistency, but they no longer use hardcoded data.
export const getWalletLoadRequests = async (): Promise<WalletLoadRequest[]> => {
  const requestsRef = collection(db, "walletLoadRequests");
  const q = query(requestsRef, orderBy("createdAt", "desc"));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletLoadRequest));
};

export const addWalletLoadRequest = async (requestData: Omit<WalletLoadRequest, 'id' | 'createdAt' | 'status'>): Promise<void> => {
  await addDoc(collection(db, "walletLoadRequests"), {
    ...requestData,
    createdAt: serverTimestamp(),
    status: "Pending",
  });
};

export const updateWalletLoadRequestStatus = async (id: string, status: "Approved" | "Rejected"): Promise<void> => {
  const requestRef = doc(db, "walletLoadRequests", id);
  await updateDoc(requestRef, { status });
};

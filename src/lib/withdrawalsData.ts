
import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

export type Withdrawal = {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: number;
  currency: string;
  destination: string;
  status: "Pending" | "Completed" | "Failed";
  createdAt: any; // Can be a Date or Firestore Timestamp
  transactionId?: string; // Optional field for withdrawal transaction
};

const toDateSafe = (dateFieldValue: any): Date => {
  if (dateFieldValue instanceof Timestamp) {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue.toDate === 'function') {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue === 'string') {
    const date = new Date(dateFieldValue);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  if (dateFieldValue && typeof dateFieldValue === 'number') {
    return new Date(dateFieldValue);
  }
  return new Date(); 
};

const generateRandomId = (prefix: string) => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${randomNum}`;
};

// Function to get all withdrawals, sorted by most recent first
export const getWithdrawals = async (): Promise<Withdrawal[]> => {
  const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  const withdrawals: Withdrawal[] = [];
  querySnapshot.forEach((doc) => {
    withdrawals.push({ id: doc.id, ...doc.data(), createdAt: toDateSafe(doc.data().createdAt) } as Withdrawal);
  });
  return withdrawals;
};

// Function to get withdrawals for a specific merchant
export const getMerchantWithdrawals = async (merchantId: string): Promise<Withdrawal[]> => {
    const q = query(collection(db, 'withdrawals'), where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const withdrawals: Withdrawal[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        withdrawals.push({ 
            id: doc.id, 
            ...data,
            createdAt: toDateSafe(data.createdAt) 
        } as Withdrawal);
    });
    return withdrawals;
};

// Function to add a new withdrawal
export const addWithdrawal = async (newWithdrawalData: Omit<Withdrawal, 'id' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, 'withdrawals'), {
    ...newWithdrawalData,
    createdAt: serverTimestamp(),
  });
};

// Function to update the status of a withdrawal
export const updateWithdrawalStatus = async (id: string, newStatus: "Completed" | "Failed"): Promise<void> => {
  const withdrawalRef = doc(db, 'withdrawals', id);
  const updateData: { status: "Completed" | "Failed"; transactionId?: string } = { status: newStatus };
  if (newStatus === 'Completed') {
    updateData.transactionId = generateRandomId("UVWDTRX");
  }
  await updateDoc(withdrawalRef, updateData);
};

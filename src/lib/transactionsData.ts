
import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    query, 
    where, 
    orderBy
} from 'firebase/firestore';

export type Transaction = {
    id: string;
    merchantId: string;
    customerEmail: string;
    amount: string;
    status: "Success" | "Failed" | "Pending";
    method: "UPI" | "Crypto" | "Link" | "Page";
    date: string;
    sourceId?: string; // ID of the payment link or page
};


// Function to get all transactions (for admin)
export const getAllTransactions = async (): Promise<Transaction[]> => {
  const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  return transactions;
};

// Function to get transactions for a specific merchant
export const getMerchantTransactions = async (merchantId: string): Promise<Transaction[]> => {
  const q = query(collection(db, 'transactions'), where('merchantId', '==', merchantId), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  return transactions;
};

// Function to get transactions for a specific link/page
export const getTransactionsBySource = async (sourceId: string): Promise<Transaction[]> => {
  const q = query(collection(db, 'transactions'), where('sourceId', '==', sourceId), orderBy('date', 'desc'));
  const querySnapshot = await getDocs(q);
  const transactions: Transaction[] = [];
  querySnapshot.forEach((doc) => {
    transactions.push({ id: doc.id, ...doc.data() } as Transaction);
  });
  return transactions;
};


// Function to add a new transaction
export const addTransaction = async (newTxData: Omit<Transaction, 'id'>): Promise<void> => {
  await addDoc(collection(db, 'transactions'), newTxData);
};

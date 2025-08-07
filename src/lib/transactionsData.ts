
'use client';

import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    getDoc, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp
} from 'firebase/firestore';

export type Transaction = {
  id: string;
  sourceId: string; // This could be a payment link ID, invoice ID, etc.
  merchantId: string;
  amount: number;
  currency: string;
  customerName: string;
  customerEmail: string;
  status: 'succeeded' | 'pending' | 'failed';
  createdAt: any; 
};

// Function to get all transactions for a specific source (e.g., a payment link)
export const getTransactionsBySource = async (sourceId: string): Promise<Transaction[]> => {
    const transactionsCol = collection(db, 'transactions');
    const q = query(transactionsCol, where('sourceId', '==', sourceId), orderBy('createdAt', 'desc'));
    
    const transactionSnapshot = await getDocs(q);
    const transactionList = transactionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    return transactionList;
};

// Function to get a single transaction by its ID
export const getTransactionById = async (id: string): Promise<Transaction | null> => {
    const docRef = doc(db, 'transactions', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Transaction;
    }
    return null;
};

// Function to add a new transaction
export const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, 'transactions'), {
    ...newTransactionData,
    createdAt: serverTimestamp(),
  });
};

// Function to update a transaction
export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
    const docRef = doc(db, 'transactions', id);
await updateDoc(docRef, updates);
};

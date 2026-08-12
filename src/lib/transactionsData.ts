
'use client';

import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp,
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { toDateSafe } from './utils';

export type Transaction = {
  id: string;
  sourceId: string;
  merchantId: string;
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail: string;
  status: 'Success' | 'Pending' | 'Failed';
  createdAt: any; 
  method: string;
  date: any;
};

export const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<void> => {
  // FINANCIAL SECURITY: Logic moved to Cloud Function trigger 'onTransactionCreated'
  // Client only saves the record to the database.
  await addDoc(collection(db, 'transactions'), {
    ...newTransactionData,
    amount: Number(newTransactionData.amount),
    date: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
};

export const getTransactionsBySource = async (sourceId: string): Promise<Transaction[]> => {
  try {
    const q = query(collection(db, 'transactions'), where('sourceId', '==', sourceId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      date: toDateSafe(d.data().date),
      createdAt: toDateSafe(d.data().createdAt),
    } as Transaction));
  } catch {
    return [];
  }
};

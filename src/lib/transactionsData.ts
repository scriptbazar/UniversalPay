
'use client';

import { db } from './firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp,
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

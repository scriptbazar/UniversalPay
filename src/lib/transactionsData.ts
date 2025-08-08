
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
import { addInvoice } from './invoicesData';
import { addDoc as addAuditLogDoc } from 'firebase/firestore';


export type Transaction = {
  id: string;
  sourceId: string; // This could be a payment link ID, invoice ID, etc.
  merchantId: string;
  amount: number;
  currency: string;
  customerName?: string;
  customerEmail: string;
  status: 'Success' | 'Pending' | 'Failed';
  createdAt: any; 
  method: string;
  date: any; // Storing as a server timestamp
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

// Function to add a new transaction and trigger post-payment actions
export const addTransaction = async (newTransactionData: Omit<Transaction, 'id' | 'createdAt' | 'date'>): Promise<void> => {
  const transactionRef = await addDoc(collection(db, 'transactions'), {
    ...newTransactionData,
    createdAt: serverTimestamp(),
    date: serverTimestamp(), // CRITICAL FIX: Storing as a server timestamp
  });

  // Post-payment actions for successful transactions
  if (newTransactionData.status === 'Success') {
    const merchantDoc = await getDoc(doc(db, 'users', newTransactionData.merchantId));
    const merchantName = merchantDoc.exists() ? merchantDoc.data().fullName : 'Your Merchant';
    
    // 1. Create an invoice
    await addInvoice({
      merchantId: newTransactionData.merchantId,
      merchantName: merchantName,
      customerName: newTransactionData.customerName || newTransactionData.customerEmail,
      customerEmail: newTransactionData.customerEmail,
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0], // Due immediately
      items: [{ description: `Payment via ${newTransactionData.method}`, amount: Number(newTransactionData.amount) }],
      status: 'Paid',
    });

    // 2. Create an audit log entry for the merchant
    await addAuditLogDoc(collection(db, 'audit_logs'), {
        type: 'PAYMENT_RECEIVED',
        level: 'INFO',
        message: `Payment of $${newTransactionData.amount} received from ${newTransactionData.customerEmail}.`,
        details: {
            amount: newTransactionData.amount,
            customer: newTransactionData.customerEmail,
            transactionId: transactionRef.id,
            targetUser: newTransactionData.merchantId,
        },
        timestamp: serverTimestamp(),
    });

    // 3. TODO: Update merchant's wallet balance
    // This should ideally be a Cloud Function triggered by the creation of a new transaction document
    // to ensure security and transactional integrity.
    // For now, this is a placeholder for the logic.
    console.log(`Wallet update needed for merchant ${newTransactionData.merchantId} for amount ${newTransactionData.amount}`);
  }
};


// Function to update a transaction
export const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<void> => {
    const docRef = doc(db, 'transactions', id);
    await updateDoc(docRef, updates);
};

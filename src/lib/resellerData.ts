
'use client';

import { db, app } from './firebase';
import { collection, getDocs, query, where, orderBy, Timestamp, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

export type SubMerchant = {
    id: string;
    name: string;
    email: string;
    sales: string;
    commission: string;
    status: 'Active' | 'Inactive';
};

export type Transaction = {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantEmail: string;
    customerEmail: string;
    amount: number;
    date: Date;
    method: 'UPI' | 'Crypto' | 'Link' | 'Page';
    status: 'Success' | 'Pending' | 'Failed';
};

export type ResellerRequest = {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantEmail: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Timestamp;
};


// In a real application, sub-merchants would be identified by a 'resellerId' field.
// For this demo, we'll fetch all users with the 'reseller' role.
export const getSubMerchants = async (resellerId?: string): Promise<SubMerchant[]> => {
    const usersRef = collection(db, "users");
    // This is a simplified query. A real-world scenario would be more complex.
    const q = query(usersRef, where("role", "==", "reseller"));
    const querySnapshot = await getDocs(q);
    
    // In a real app, sales and commission would be calculated fields.
    const merchants = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().fullName || 'N/A',
        email: doc.data().email,
        sales: (Math.random() * 5000).toFixed(2), // Placeholder
        commission: '5%', // Placeholder
        status: doc.data().status || 'Active'
    } as SubMerchant));
    
    // If resellerId is provided, filter out the reseller themselves.
    return resellerId ? merchants.filter(m => m.id !== resellerId) : merchants;
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


export const getAllSubMerchantTransactions = async (resellerId?: string): Promise<Transaction[]> => {
    const transactionsRef = collection(db, "transactions");
    let q;
    // In a real app, you would fetch transactions for merchants whose resellerId matches.
    // This is a simplified fetch of all transactions.
    if (resellerId) {
        // This is complex. You'd first get all sub-merchants, then query their transactions.
        // For this demo, we'll fetch all non-admin transactions and simulate.
        q = query(transactionsRef, where("merchantId", "!=", "admin_user_id_placeholder"), orderBy("date", "desc"));
    } else {
        q = query(transactionsRef, orderBy("date", "desc"));
    }

    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            merchantId: data.merchantId,
            merchantName: 'A Sub-Merchant', // Placeholder
            merchantEmail: 'merchant@example.com', // Placeholder
            customerEmail: data.customerEmail,
            amount: parseFloat(data.amount),
            date: toDateSafe(data.date),
            method: data.method,
            status: data.status,
        } as Transaction;
    });

    return transactions;
};

export const createResellerRequest = async (merchantId: string, merchantName: string, merchantEmail: string) => {
    // Check if a pending request already exists
    const requestsRef = collection(db, 'resellerRequests');
    const q = query(requestsRef, where('merchantId', '==', merchantId), where('status', '==', 'pending'));
    const existingRequests = await getDocs(q);
    if (!existingRequests.empty) {
        throw new Error('You already have a pending request.');
    }

    await addDoc(requestsRef, {
        merchantId,
        merchantName,
        merchantEmail,
        status: 'pending',
        createdAt: serverTimestamp(),
    });
};

export const getResellerRequests = async (): Promise<ResellerRequest[]> => {
    const requestsRef = collection(db, 'resellerRequests');
    const q = query(requestsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ResellerRequest));
};

export const handleResellerRequest = async (requestId: string, merchantId: string, action: 'approve' | 'reject') => {
    const functions = getFunctions(app);
    const handleRequest = httpsCallable(functions, 'handleResellerRequest');
    try {
        await handleRequest({ requestId, merchantId, action });
        return { success: true };
    } catch (error: any) {
        console.error("Error handling reseller request:", error);
        return { success: false, error: error.message };
    }
};

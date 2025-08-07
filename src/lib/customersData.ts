
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from './firebase';

export type Customer = {
    id: string;
    merchantId: string;
    merchantName: string;
    email: string;
    name: string;
    avatar: string;
    totalSpent: number;
    transactions: number;
    lastSeen: string;
    joinedDate: string;
};

export type CustomerTransaction = {
    id: string;
    amount: string;
    status: 'Success' | 'Failed';
    date: string;
    method: 'UPI' | 'Crypto' | 'Page' | 'Link';
}

export const getAllCustomers = async (): Promise<Customer[]> => {
    const customersRef = collection(db, 'customers');
    const q = query(customersRef);
    const querySnapshot = await getDocs(q);
    const customers = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Customer));
    return customers;
};

export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
    const customerRef = doc(db, 'customers', customerId);
    const docSnap = await getDoc(customerRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Customer;
    }
    return null;
};

export const getTransactionsByCustomerId = async (customerId: string): Promise<CustomerTransaction[]> => {
    const transactionsRef = collection(db, 'transactions');
    const q = query(transactionsRef, where('customerId', '==', customerId));
    const querySnapshot = await getDocs(q);
    const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as CustomerTransaction));
    return transactions;
};

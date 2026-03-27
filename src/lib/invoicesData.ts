
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
    serverTimestamp,
} from 'firebase/firestore';
import { toDateSafe } from './utils';

export type InvoiceItem = {
  description: string;
  amount: number;
};

export type Invoice = {
  id: string;
  merchantId: string;
  merchantName: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  totalAmount: number;
  status: "Pending" | "Paid" | "Overdue";
  createdAt: any;
};

const checkOverdueInvoices = (invoices: Invoice[]): Invoice[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return invoices.map(invoice => {
        if (invoice.status === 'Pending' && new Date(invoice.dueDate) < today) {
            return { ...invoice, status: 'Overdue' };
        }
        return invoice;
    });
};

export const getInvoices = async (merchantId?: string): Promise<Invoice[]> => {
    const invoicesCol = collection(db, 'invoices');
    const q = merchantId 
        ? query(invoicesCol, where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'))
        : query(invoicesCol, orderBy('createdAt', 'desc'));
    
    const invoiceSnapshot = await getDocs(q);
    const invoiceList = invoiceSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: toDateSafe(doc.data().createdAt)
    } as Invoice));
    
    return checkOverdueInvoices(invoiceList);
};

export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    const invoiceRef = doc(db, 'invoices', id);
    const invoiceSnap = await getDoc(invoiceRef);
    if (invoiceSnap.exists()) {
        // FIX: Changed doc.data() to invoiceSnap.data()
        const data = invoiceSnap.data();
        const invoice = { 
            id: invoiceSnap.id, 
            ...data, 
            createdAt: toDateSafe(data.createdAt) 
        } as Invoice;
        const [processedInvoice] = checkOverdueInvoices([invoice]);
        return processedInvoice;
    } else {
        return null;
    }
};

export const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'createdAt' | 'totalAmount'>): Promise<void> => {
  const totalAmount = newInvoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  await addDoc(collection(db, 'invoices'), {
    ...newInvoiceData,
    totalAmount,
    createdAt: serverTimestamp(),
  });
};

export const updateInvoiceStatus = async (id: string, status: "Paid" | "Pending" | "Overdue"): Promise<void> => {
  const invoiceRef = doc(db, 'invoices', id);
  await updateDoc(invoiceRef, { status });
};

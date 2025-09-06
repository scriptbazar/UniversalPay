
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
    Timestamp
} from 'firebase/firestore';

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

// Helper function to check for overdue invoices.
// This should ideally run on a server-side cron job in a real app.
const checkOverdueInvoices = (invoices: Invoice[]): Invoice[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to the start of the day
    return invoices.map(invoice => {
        if (invoice.status === 'Pending' && new Date(invoice.dueDate) < today) {
            // This would ideally be an update call to Firestore
            // For now, we'll just modify the state for display
            return { ...invoice, status: 'Overdue' };
        }
        return invoice;
    });
};

// Function to get all invoices (for admin) or invoices for a specific merchant
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
    
    // Client-side check for overdue status for display purposes
    const processedInvoices = checkOverdueInvoices(invoiceList);
    return processedInvoices;
};

// Function to get a single invoice by its ID
export const getInvoiceById = async (id: string): Promise<Invoice | null> => {
    const invoiceRef = doc(db, 'invoices', id);
    const invoiceSnap = await getDoc(invoiceRef);
    if (invoiceSnap.exists()) {
        const invoice = { id: invoiceSnap.id, ...invoiceSnap.data(), createdAt: toDateSafe(invoiceSnap.data().createdAt) } as Invoice;
        const [processedInvoice] = checkOverdueInvoices([invoice]);
        return processedInvoice;
    } else {
        return null;
    }
};

// Function to add a new invoice
export const addInvoice = async (newInvoiceData: Omit<Invoice, 'id' | 'createdAt' | 'totalAmount'>): Promise<void> => {
  const totalAmount = newInvoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  await addDoc(collection(db, 'invoices'), {
    ...newInvoiceData,
    totalAmount,
    createdAt: serverTimestamp(),
  });
};

// Function to update the status of an invoice
export const updateInvoiceStatus = async (id: string, status: "Paid" | "Pending" | "Overdue"): Promise<void> => {
  const invoiceRef = doc(db, 'invoices', id);
  await updateDoc(invoiceRef, { status });
};

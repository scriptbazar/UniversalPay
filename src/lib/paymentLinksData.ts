
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

export type PaymentLink = {
  id: string;
  slug: string;
  merchantId: string;
  title: string;
  description: string;
  url: string;
  type: 'Fixed' | 'Dynamic';
  amount: number | null;
  isActive: boolean;
  createdAt: any; // Can be a Date or Firestore Timestamp
  payments: number;
  brandColor: string;
  collectPhone: boolean;
};

// Function to get all links (for admin) or links for a specific merchant
export const getPaymentLinks = async (merchantId?: string): Promise<PaymentLink[]> => {
    const linksCol = collection(db, 'paymentLinks');
    const q = merchantId 
        ? query(linksCol, where('merchantId', '==', merchantId), orderBy('createdAt', 'desc'))
        : query(linksCol, orderBy('createdAt', 'desc'));
    
    const linkSnapshot = await getDocs(q);
    const linkList = linkSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentLink));
    return linkList;
};

export const getPaymentLinkBySlug = async (slug: string): Promise<PaymentLink | null> => {
    const q = query(collection(db, 'paymentLinks'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as PaymentLink;
    }
    return null;
};

export const getPaymentLinkById = async (id: string): Promise<PaymentLink | null> => {
    const docRef = doc(db, 'paymentLinks', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as PaymentLink;
    }
    return null;
};

export const addPaymentLink = async (newLinkData: Omit<PaymentLink, 'id' | 'createdAt'>): Promise<void> => {
  await addDoc(collection(db, 'paymentLinks'), {
    ...newLinkData,
    createdAt: serverTimestamp(),
  });
};

export const updatePaymentLink = async (id: string, updates: Partial<PaymentLink>): Promise<void> => {
    const docRef = doc(db, 'paymentLinks', id);
    await updateDoc(docRef, updates);
};

    
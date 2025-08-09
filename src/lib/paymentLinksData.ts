
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
    onSnapshot
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
  imageUrl: string | null;
  isPage?: boolean; // To distinguish between links and pages
};

// Function to get all links (for admin) or links for a specific merchant
export const getPaymentLinks = (
    merchantId?: string, 
    isPage: boolean = false, 
    callback?: (links: PaymentLink[], error?: Error) => void
): (() => void) => {
    const linksCol = collection(db, 'paymentLinks');
    let q;

    if (merchantId) {
        q = query(linksCol, where('merchantId', '==', merchantId), where('isPage', '==', isPage), orderBy('createdAt', 'desc'));
    } else {
        // Admin view
        q = query(linksCol, where('isPage', '==', isPage), orderBy('createdAt', 'desc'));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const linkList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PaymentLink));
        if (callback) {
            callback(linkList);
        }
    }, (error) => {
        console.error("Error fetching payment links:", error);
        if (callback) {
            callback([], error);
        }
    });

    return unsubscribe;
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

// CRITICAL FIX: Changed createdAt to use serverTimestamp for correct ordering and querying.
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

    

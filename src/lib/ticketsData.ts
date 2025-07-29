
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
    arrayUnion
} from 'firebase/firestore';

export type TicketReply = {
  author: 'Admin' | string; // Admin or merchant name
  message: string;
  createdAt: string;
};

export type Ticket = {
  id: string;
  merchantId: string;
  merchantName: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
  updatedAt: string;
  replies: TicketReply[];
};

// Function to get all tickets, or tickets for a specific merchant
export const getTickets = async (merchantId?: string): Promise<Ticket[]> => {
    const ticketsCol = collection(db, 'tickets');
    let q;
    if (merchantId) {
        q = query(ticketsCol, where('merchantId', '==', merchantId), orderBy('updatedAt', 'desc'));
    } else {
        q = query(ticketsCol, orderBy('updatedAt', 'desc'));
    }
    const ticketSnapshot = await getDocs(q);
    const ticketList = ticketSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
    return ticketList;
};

// Function to get a single ticket by its ID
export const getTicketById = async (id: string): Promise<Ticket | null> => {
    const ticketRef = doc(db, 'tickets', id);
    const ticketSnap = await getDoc(ticketRef);
    if (ticketSnap.exists()) {
        return { id: ticketSnap.id, ...ticketSnap.data() } as Ticket;
    } else {
        return null;
    }
};

// Function to add a new ticket
export const addTicket = async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'replies'>): Promise<void> => {
    const now = new Date();
    const createdAt = now.toISOString();
    now.setSeconds(now.getSeconds() + 5); 
    const autoReplyCreatedAt = now.toISOString();

    const autoReply = {
        author: 'Admin',
        message: `Hi ${newTicketData.merchantName}, thank you for reaching out. We have received your ticket and our team is looking into it. We will get back to you as soon as possible.`,
        createdAt: autoReplyCreatedAt,
    };

    await addDoc(collection(db, 'tickets'), {
        ...newTicketData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'Open',
        replies: [autoReply],
    });
};

// Function to add a reply to a ticket
export const addReply = async (ticketId: string, replyData: Omit<TicketReply, 'createdAt'>): Promise<void> => {
    const ticketRef = doc(db, 'tickets', ticketId);
    
    const newReply: TicketReply = {
      ...replyData,
      createdAt: new Date().toISOString(),
    };
    
    await updateDoc(ticketRef, {
        replies: arrayUnion(newReply),
        updatedAt: serverTimestamp(),
        status: replyData.author === 'Admin' ? 'In Progress' : 'Open',
    });
};

// Function to update a ticket's status or priority
export const updateTicket = async (ticketId: string, updates: Partial<Pick<Ticket, 'status' | 'priority'>>) => {
    const ticketRef = doc(db, 'tickets', ticketId);
    await updateDoc(ticketRef, {
        ...updates,
        updatedAt: serverTimestamp()
    });
};

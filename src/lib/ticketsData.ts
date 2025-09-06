
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
    arrayUnion,
    Timestamp
} from 'firebase/firestore';

export type TicketReply = {
  author: 'Admin' | string;
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
  createdAt: Date;
  updatedAt: Date;
  replies: TicketReply[];
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


// Function to get all tickets, or tickets for a specific merchant
export const getTickets = async (merchantId?: string): Promise<Ticket[]> => {
    console.log(`Fetching tickets for merchantId: ${merchantId}`);
    const ticketsCol = collection(db, 'tickets');
    let q;
    // Temporarily removing orderBy to diagnose the issue.
    if (merchantId) {
        q = query(ticketsCol, where('merchantId', '==', merchantId));
    } else {
        q = query(ticketsCol);
    }
    try {
        const ticketSnapshot = await getDocs(q);
        const ticketList = ticketSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                createdAt: toDateSafe(data.createdAt),
                updatedAt: toDateSafe(data.updatedAt),
            } as Ticket;
        });
        console.log('Successfully fetched tickets (without ordering):', ticketList);
        return ticketList;
    } catch (error) {
        console.error("Error fetching tickets: ", error);
        throw error;
    }
};

// Function to get a single ticket by its ID
export const getTicketById = async (id: string): Promise<Ticket | null> => {
    console.log(`Fetching ticket with id: ${id}`);
    const ticketRef = doc(db, 'tickets', id);
    try {
        const ticketSnap = await getDoc(ticketRef);
        if (ticketSnap.exists()) {
            const data = ticketSnap.data();
            const ticketData = {
                id: ticketSnap.id,
                ...data,
                createdAt: toDateSafe(data.createdAt),
                updatedAt: toDateSafe(data.updatedAt),
            } as Ticket;
            console.log('Successfully fetched ticket:', ticketData);
            return ticketData;
        } else {
            console.log('No such ticket found!');
            return null;
        }
    } catch (error) {
        console.error("Error fetching ticket by id: ", error);
        throw error;
    }
};

// Function to add a new ticket
export const addTicket = async (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<void> => {
    console.log('Attempting to add new ticket:', newTicketData);
    const now = new Date();
    const autoReplyCreatedAt = new Date(now.getTime() + 5000).toISOString();

    const autoReply = {
        author: 'Admin',
        message: `Hi ${newTicketData.merchantName}, thank you for reaching out. We have received your ticket and our team is looking into it. We will get back to you as soon as possible.`,
        createdAt: autoReplyCreatedAt,
    };

    try {
        await addDoc(collection(db, 'tickets'), {
            ...newTicketData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            replies: [autoReply],
        });
        console.log('Ticket added successfully to Firestore.');
    } catch (error) {
        console.error("Error adding ticket to Firestore: ", error);
        throw error;
    }
};

// Function to add a reply to a ticket
export const addReply = async (ticketId: string, replyData: Omit<TicketReply, 'createdAt'>): Promise<void> => {
    console.log(`Adding reply to ticket ${ticketId}:`, replyData);
    const ticketRef = doc(db, 'tickets', ticketId);
    
    const newReply: TicketReply = {
      ...replyData,
      createdAt: new Date().toISOString(),
    };
    
    try {
        await updateDoc(ticketRef, {
            replies: arrayUnion(newReply),
            updatedAt: serverTimestamp(),
            status: replyData.author === 'Admin' ? 'In Progress' : 'Open',
        });
        console.log('Reply added successfully.');
    } catch (error) {
        console.error("Error adding reply: ", error);
        throw error;
    }
};

// Function to update a ticket's status or priority
export const updateTicket = async (ticketId: string, updates: Partial<Pick<Ticket, 'status' | 'priority'>>) => {
    console.log(`Updating ticket ${ticketId} with:`, updates);
    const ticketRef = doc(db, 'tickets', ticketId);
    try {
        await updateDoc(ticketRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        console.log('Ticket updated successfully.');
    } catch (error) {
        console.error("Error updating ticket: ", error);
        throw error;
    }
};

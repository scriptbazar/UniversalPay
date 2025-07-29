
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

const generateRandomId = (prefix: string) => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}${randomNum}`;
};


let tickets: Ticket[] = [
  {
    id: generateRandomId('UVPAYTKT-'),
    merchantId: 'merch_123',
    merchantName: 'John Doe',
    subject: 'Issue with USDT Withdrawal',
    message: "I tried to withdraw 500 USDT to my wallet but it's been pending for over 3 hours. Can you please check what's wrong? The destination address is correct.",
    status: 'Open',
    priority: 'High',
    createdAt: '2023-11-10T09:00:00Z',
    updatedAt: '2023-11-10T09:00:05Z',
    replies: [
      {
        author: 'Admin',
        message: 'Hi John Doe, thank you for reaching out to us. We have received your ticket and our team is looking into it. We will get back to you as soon as possible.',
        createdAt: '2023-11-10T09:00:05Z',
      },
    ],
  },
  {
    id: generateRandomId('UVPAYTKT-'),
    merchantId: 'merch_456',
    merchantName: 'CreativeGoods',
    subject: 'How to enable SEPA payments?',
    message: 'I have customers from Europe who want to pay via SEPA bank transfer. How can I enable this option on my checkout?',
    status: 'In Progress',
    priority: 'Medium',
    createdAt: '2023-11-09T14:30:00Z',
    updatedAt: '2023-11-09T15:00:00Z',
    replies: [
      {
        author: 'Admin',
        message: 'Hello! You can enable SEPA transfers from your Settings -> Payment Methods page. Let us know if you face any issues.',
        createdAt: '2023-11-09T15:00:00Z',
      },
    ],
  },
   {
    id: generateRandomId('UVPAYTKT-'),
    merchantId: 'merch_123',
    merchantName: 'John Doe',
    subject: 'API Key not working',
    message: 'I have regenerated my API key, but the new one is giving an authentication error. The old one is not working either.',
    status: 'Closed',
    priority: 'High',
    createdAt: '2023-11-08T10:00:00Z',
    updatedAt: '2023-11-08T12:05:00Z',
    replies: [
      {
        author: 'Admin',
        message: 'Hi John, it seems there was a caching issue. It should be resolved now. Please try again.',
        createdAt: '2023-11-08T11:00:00Z',
      },
      {
        author: 'John Doe',
        message: 'Yes, it is working now. Thank you!',
        createdAt: '2023-11-08T12:05:00Z',
      },
    ],
  },
];

// Function to get all tickets, sorted by most recently updated
export const getTickets = (): Ticket[] => {
  return [...tickets].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

// Function to get a single ticket by its ID
export const getTicketById = (id: string): Ticket | undefined => {
  return tickets.find(ticket => ticket.id === id);
};

// Function to add a new ticket
export const addTicket = (newTicketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'replies'>): void => {
  const now = new Date();
  const createdAt = now.toISOString();
  // Automatic reply is sent 5 seconds after ticket creation to simulate a real system
  now.setSeconds(now.getSeconds() + 5); 
  const autoReplyCreatedAt = now.toISOString();

  const newTicket: Ticket = {
    ...newTicketData,
    id: generateRandomId('UVPAYTKT-'),
    createdAt: createdAt,
    updatedAt: createdAt,
    status: 'Open',
    replies: [
        {
            author: 'Admin',
            message: `Hi ${newTicketData.merchantName}, thank you for reaching out to us. We have received your ticket and our team is looking into it. We will get back to you as soon as possible.`,
            createdAt: autoReplyCreatedAt,
        }
    ],
  };
  tickets.unshift(newTicket);
  // After adding the auto-reply, set the update time to the same as creation to keep it at the top
  newTicket.updatedAt = createdAt;
};

// Function to add a reply to a ticket
export const addReply = (ticketId: string, replyData: Omit<TicketReply, 'createdAt'>): void => {
  const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
  if (ticketIndex !== -1) {
    const now = new Date().toISOString();
    const newReply: TicketReply = {
      ...replyData,
      createdAt: now,
    };
    
    // Create a new ticket object to avoid direct mutation
    const updatedTicket = {
        ...tickets[ticketIndex],
        replies: [...tickets[ticketIndex].replies, newReply],
        updatedAt: now,
        status: replyData.author === 'Admin' ? 'In Progress' as const : 'Open' as const,
    };
    
    // Replace the old ticket with the updated one
    tickets[ticketIndex] = updatedTicket;
  }
};

// Function to update a ticket's status or priority
export const updateTicket = (ticketId: string, updates: Partial<Pick<Ticket, 'status' | 'priority'>>) => {
  const ticketIndex = tickets.findIndex(ticket => ticket.id === ticketId);
  if (ticketIndex !== -1) {
    const updatedTicket = {
      ...tickets[ticketIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    tickets[ticketIndex] = updatedTicket;
  }
};

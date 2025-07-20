
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

let tickets: Ticket[] = [
  {
    id: 'TKT-001',
    merchantId: 'merch_123',
    merchantName: 'John Doe',
    subject: 'Issue with USDT Withdrawal',
    message: "I tried to withdraw 500 USDT to my wallet but it's been pending for over 3 hours. Can you please check what's wrong? The destination address is correct.",
    status: 'Open',
    priority: 'High',
    createdAt: '2023-11-10T09:00:00Z',
    updatedAt: '2023-11-10T11:00:00Z',
    replies: [
      {
        author: 'Admin',
        message: 'Hi John, we are looking into this. There seems to be some network congestion. We will update you shortly.',
        createdAt: '2023-11-10T11:00:00Z',
      },
    ],
  },
  {
    id: 'TKT-002',
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
    id: 'TKT-003',
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
  const now = new Date().toISOString();
  const newTicket: Ticket = {
    ...newTicketData,
    id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
    createdAt: now,
    updatedAt: now,
    status: 'Open',
    replies: [],
  };
  tickets.unshift(newTicket);
};

// Function to add a reply to a ticket
export const addReply = (ticketId: string, replyData: Omit<TicketReply, 'createdAt'>): void => {
  const ticket = getTicketById(ticketId);
  if (ticket) {
    const now = new Date().toISOString();
    ticket.replies.push({
      ...replyData,
      createdAt: now,
    });
    ticket.updatedAt = now;
    if(replyData.author === 'Admin') {
        ticket.status = 'In Progress';
    }
  }
};

// Function to update a ticket's status or priority
export const updateTicket = (ticketId: string, updates: Partial<Pick<Ticket, 'status' | 'priority'>>) => {
  const ticket = getTicketById(ticketId);
  if (ticket) {
    if (updates.status) {
        ticket.status = updates.status;
    }
    if (updates.priority) {
        ticket.priority = updates.priority;
    }
    ticket.updatedAt = new Date().toISOString();
  }
};

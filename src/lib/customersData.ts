
export type Customer = {
    id: string;
    merchantId: string;
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

const allCustomers: Customer[] = [
    { id: 'cust_1', merchantId: 'user_1', email: 'liam@example.com', name: 'Liam Johnson', avatar: 'https://placehold.co/96x96.png?text=L', totalSpent: 250.00, transactions: 5, lastSeen: '2 days ago', joinedDate: '2023-01-15' },
    { id: 'cust_2', merchantId: 'user_1', email: 'olivia@example.com', name: 'Olivia Smith', avatar: 'https://placehold.co/96x96.png?text=O', totalSpent: 150.00, transactions: 3, lastSeen: '1 day ago', joinedDate: '2023-03-22' },
    { id: 'cust_3', merchantId: 'user_2', email: 'noah@example.com', name: 'Noah Williams', avatar: 'https://placehold.co/96x96.png?text=N', totalSpent: 350.00, transactions: 8, lastSeen: '5 days ago', joinedDate: '2022-11-10' },
    { id: 'cust_4', merchantId: 'user_3', email: 'emma@example.com', name: 'Emma Brown', avatar: 'https://placehold.co/96x96.png?text=E', totalSpent: 450.00, transactions: 12, lastSeen: '10 hours ago', joinedDate: '2023-05-01' },
    { id: 'cust_5', merchantId: 'user_2', email: 'ava@example.com', name: 'Ava Jones', avatar: 'https://placehold.co/96x96.png?text=A', totalSpent: 200.00, transactions: 4, lastSeen: '1 week ago', joinedDate: '2023-02-18' },
    { id: 'cust_6', merchantId: 'user_1', email: 'william@example.com', name: 'William Garcia', avatar: 'https://placehold.co/96x96.png?text=W', totalSpent: 120.50, transactions: 2, lastSeen: '3 days ago', joinedDate: '2023-06-30' },
    { id: 'cust_7', merchantId: 'user_4', email: 'sophia@example.com', name: 'Sophia Miller', avatar: 'https://placehold.co/96x96.png?text=S', totalSpent: 550.75, transactions: 15, lastSeen: '6 hours ago', joinedDate: '2022-09-05' },
    { id: 'cust_8', merchantId: 'user_4', email: 'james@example.com', name: 'James Davis', avatar: 'https://placehold.co/96x96.png?text=J', totalSpent: 80.00, transactions: 1, lastSeen: '2 weeks ago', joinedDate: '2023-08-12' },
];


const allTransactions: CustomerTransaction[] = [
    { id: 'TXN101', amount: '50.00', status: 'Success', date: '2023-11-10', method: 'Page' },
    { id: 'TXN102', amount: '25.50', status: 'Success', date: '2023-10-22', method: 'Link' },
    { id: 'TXN103', amount: '100.00', status: 'Success', date: '2023-09-05', method: 'Page' },
    { id: 'TXN104', amount: '14.50', status: 'Failed', date: '2023-08-18', method: 'UPI' },
    { id: 'TXN105', amount: '60.00', status: 'Success', date: '2023-07-30', method: 'Crypto' },
    { id: 'TXN201', amount: '150.00', status: 'Success', date: '2023-11-12', method: 'UPI' },
    { id: 'TXN202', amount: '200.00', status: 'Success', date: '2023-10-25', method: 'Crypto' },
];

export const getAllCustomers = async (): Promise<Customer[]> => {
    // In a real app, this would fetch from Firestore
    return Promise.resolve(allCustomers);
};

export const getCustomerById = async (customerId: string): Promise<Customer | null> => {
    // In a real app, this would fetch from Firestore
    const customer = allCustomers.find(c => c.id === customerId);
    return Promise.resolve(customer || null);
};

export const getTransactionsByCustomerId = async (customerId: string): Promise<CustomerTransaction[]> => {
    // In a real app, this would fetch from Firestore where customerId matches
    // For now, we'll return a generic list for any valid customerId
    const customer = allCustomers.find(c => c.id === customerId);
    return Promise.resolve(customer ? allTransactions : []);
};


import * as admin from "firebase-admin";

const toTimestamp = (dateString: string) => admin.firestore.Timestamp.fromDate(new Date(dateString));

const customers = [
    {
        merchantId: 'user_1',
        merchantName: 'Liam Johnson',
        email: 'liam.j@example.com',
        name: 'Alex Green',
        avatar: 'https://placehold.co/40x40.png?text=AG',
        totalSpent: 185.50,
        transactions: 3,
        lastSeen: '2023-10-28',
        joinedDate: '2023-09-01'
    },
    {
        merchantId: 'user_2',
        merchantName: 'Olivia Smith',
        email: 'olivia.s@example.com',
        name: 'Ben Carter',
        avatar: 'https://placehold.co/40x40.png?text=BC',
        totalSpent: 450.00,
        transactions: 2,
        lastSeen: '2023-11-01',
        joinedDate: '2023-08-15'
    },
];

const transactions = [
    { id: 'TXN101', merchantId: 'user_1', customerId: 'cust_1', customerEmail: 'alex.g@example.com', amount: '50.00', currency: 'USD', status: 'Success', date: toTimestamp('2023-11-10'), method: 'Page' },
    { id: 'TXN102', merchantId: 'user_1', customerId: 'cust_1', customerEmail: 'alex.g@example.com', amount: '25.50', status: 'Success', date: toTimestamp('2023-10-22'), method: 'Link' },
    { id: 'TXN103', merchantId: 'user_2', customerId: 'cust_2', customerEmail: 'ben.c@example.com', amount: '100.00', status: 'Success', date: toTimestamp('2023-09-05'), method: 'Page' },
    { id: 'TXN104', merchantId: 'user_1', customerId: 'cust_1', customerEmail: 'alex.g@example.com', amount: '14.50', status: 'Failed', date: toTimestamp('2023-08-18'), method: 'UPI' },
    { id: 'TXN105', merchantId: 'user_2', customerId: 'cust_2', customerEmail: 'ben.c@example.com', amount: '60.00', status: 'Success', date: toTimestamp('2023-07-30'), method: 'Crypto' },
];

const invoices = [
    { merchantId: 'user_1', merchantName: 'Liam Johnson', customerName: 'Alex Green', customerEmail: 'alex.g@example.com', issueDate: '2023-11-01', dueDate: '2023-11-15', items: [{ description: 'Web Design Services', amount: 1200 }], totalAmount: 1200, status: 'Pending', createdAt: toTimestamp('2023-11-01') },
    { merchantId: 'user_2', merchantName: 'Olivia Smith', customerName: 'Ben Carter', customerEmail: 'ben.c@example.com', issueDate: '2023-10-15', dueDate: '2023-10-30', items: [{ description: 'Monthly Retainer', amount: 500 }], totalAmount: 500, status: 'Paid', createdAt: toTimestamp('2023-10-15') },
];

const paymentLinks = [
    { merchantId: 'user_1', slug: 't-shirt-sale', title: 'T-Shirt Sale', url: '/pay/t-shirt-sale', type: 'Fixed', amount: 25.00, isActive: true, payments: 15, isPage: false, brandColor: '#3498db', collectPhone: false, imageUrl: null, createdAt: toTimestamp('2023-10-20') },
    { merchantId: 'user_2', slug: 'donation-drive', title: 'Donation Drive', url: '/pay/donation-drive', type: 'Dynamic', amount: null, isActive: true, payments: 30, isPage: true, brandColor: '#2ecc71', collectPhone: true, imageUrl: 'https://placehold.co/512x512.png', createdAt: toTimestamp('2023-11-05') },
];

const tickets = [
    { merchantId: 'user_1', merchantName: 'Liam Johnson', subject: 'Issue with Payout', message: 'My last payout is still pending.', status: 'Open', priority: 'High', createdAt: toTimestamp('2023-11-08'), updatedAt: toTimestamp('2023-11-08'), replies: [] },
    { merchantId: 'user_2', merchantName: 'Olivia Smith', subject: 'API Key Help', message: 'I need help integrating the API.', status: 'In Progress', priority: 'Medium', createdAt: toTimestamp('2023-11-07'), updatedAt: toTimestamp('2023-11-09'), replies: [{ author: 'Admin', message: 'I am looking into this for you.', createdAt: '2023-11-09T10:00:00Z' }] },
];

const withdrawals = [
    { merchantId: 'user_1', merchantName: 'Liam Johnson', amount: 500, currency: 'USD', destination: 'Bank of America - **** 5678', status: 'Completed', createdAt: toTimestamp('2023-11-05') },
    { merchantId: 'user_2', merchantName: 'Olivia Smith', amount: 250, currency: 'USDT', destination: 'TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc', status: 'Pending', createdAt: toTimestamp('2023-11-10') },
];

const walletLoadRequests = [
    { merchantId: 'user_1', merchantName: 'Liam Johnson', merchantEmail: 'liam.j@example.com', amount: '200.00', currency: 'USD', method: 'Bank Transfer', transactionId: 'BANK-LIAM-123', status: 'Approved', createdAt: toTimestamp('2023-11-01') },
    { merchantId: 'user_2', merchantName: 'Olivia Smith', merchantEmail: 'olivia.s@example.com', amount: '1000.00', currency: 'USD', method: 'Crypto (USDT)', transactionId: 'CRYPTO-OLIVIA-456', status: 'Pending', createdAt: toTimestamp('2023-11-09') },
];

export const initialData = {
    customers,
    transactions,
    invoices,
    paymentLinks,
    tickets,
    withdrawals,
    walletLoadRequests,
};

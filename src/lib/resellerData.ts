
export type SubMerchant = {
    id: string;
    name: string;
    email: string;
    sales: string;
    commission: string;
    status: 'Active' | 'Inactive';
};

export type Transaction = {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantEmail: string;
    customerEmail: string;
    amount: number;
    date: string;
    method: 'UPI' | 'Crypto' | 'Link' | 'Page';
    status: 'Success' | 'Pending' | 'Failed';
};

// These functions are now placeholders. In a real app, this data would come from a database.
export const getSubMerchants = (): SubMerchant[] => {
    return [];
};

export const getAllSubMerchantTransactions = (): Transaction[] => {
    return [];
};

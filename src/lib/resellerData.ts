
export type SubMerchant = {
    id: string;
    name: string;
    email: string;
    sales: string;
    commission: string;
    status: "Active" | "Inactive";
};

const subMerchants: SubMerchant[] = [
  {
    id: "user_1",
    name: "MyStore.com",
    email: "contact@mystore.com",
    sales: "12500.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_2",
    name: "AnotherShop",
    email: "sales@anothershop.io",
    sales: "8200.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_3",
    name: "CreativeGoods",
    email: "support@creative.co",
    sales: "4500.00",
    commission: "7%",
    status: "Inactive",
  },
  {
    id: "sub_4",
    name: "TechGadgets",
    email: "info@techgadgets.com",
    sales: "22000.00",
    commission: "4.5%",
    status: "Active",
  },
  {
    id: "sub_5",
    name: "FashionHub",
    email: "contact@fashionhub.com",
    sales: "9500.00",
    commission: "6%",
    status: "Active",
  },
  {
    id: "sub_6",
    name: "BookwormDen",
    email: "orders@bookwormden.com",
    sales: "3200.00",
    commission: "8%",
    status: "Active",
  },
  {
    id: "sub_7",
    name: "HomeDecorCo",
    email: "sales@homedecor.co",
    sales: "0.00",
    commission: "5%",
    status: "Inactive",
  },
];

export type Transaction = {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantEmail: string;
    amount: number;
    date: string;
    method: 'UPI' | 'Crypto' | 'Page' | 'Link';
    status: 'Success' | 'Failed' | 'Pending';
};

const allSubMerchantTransactions: Transaction[] = [
    { id: 'UVRLP911202311', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 50.00, date: '2023-11-10', method: 'Page', status: 'Success' },
    { id: 'UVRLP911202312', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 75.00, date: '2023-11-10', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202313', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 120.00, date: '2023-11-09', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202314', merchantId: 'sub_4', merchantName: 'TechGadgets', merchantEmail: 'info@techgadgets.com', amount: 200.00, date: '2023-11-09', method: 'Crypto', status: 'Pending' },
    { id: 'UVRLP911202315', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 30.00, date: '2023-11-08', method: 'Page', status: 'Failed' },
    { id: 'UVRLP911202316', merchantId: 'sub_5', merchantName: 'FashionHub', merchantEmail: 'contact@fashionhub.com', amount: 85.50, date: '2023-11-08', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202317', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 250.00, date: '2023-11-07', method: 'Crypto', status: 'Success' },
    { id: 'UVRLP911202318', merchantId: 'sub_6', merchantName: 'BookwormDen', merchantEmail: 'orders@bookwormden.com', amount: 15.00, date: '2023-11-07', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202319', merchantId: 'sub_4', merchantName: 'TechGadgets', merchantEmail: 'info@techgadgets.com', amount: 450.00, date: '2023-11-06', method: 'Page', status: 'Success' },
    { id: 'UVRLP911202320', merchantId: 'sub_5', merchantName: 'FashionHub', merchantEmail: 'contact@fashionhub.com', amount: 125.00, date: '2023-11-06', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202321', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 99.99, date: '2023-11-05', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202322', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 40.00, date: '2023-11-05', method: 'Crypto', status: 'Failed' },
];

export const getSubMerchants = (): SubMerchant[] => {
    return subMerchants;
}

export const getAllSubMerchantTransactions = (): Transaction[] => {
    return allSubMerchantTransactions;
}


// In a real application, this file would handle all interactions with a 'transactions' collection in Firestore.
// For this demo, we'll create a shared mock data source that can be imported by both admin and merchant pages
// to simulate a shared database.

export type Transaction = {
    id: string;
    merchantId: string;
    customerEmail: string;
    amount: string;
    status: "Success" | "Failed" | "Pending";
    method: "UPI" | "Crypto" | "Link" | "Page";
    date: string;
};

const allTransactionsData: Transaction[] = Array.from({ length: 50 }, (_, i) => {
    const statuses = ["Success", "Failed", "Pending"] as const;
    const methods = ["UPI", "Crypto", "Link", "Page"] as const;
    const day = 28 - Math.floor(i / 2);
    const dateStr = `2023-11-${day < 10 ? '0' + day : day}`;
    return {
        id: `UVRLP${123456789 + i}`,
        merchantId: `merch_${i % 5}`, // Assign to one of 5 mock merchants
        customerEmail: `customer${i + 1}@example.com`,
        amount: ((i + 1) * 12.34).toFixed(2),
        status: statuses[i % 3],
        method: methods[i % 4],
        date: dateStr,
    };
});

// Function to get all transactions (for admin)
export const getAllTransactions = (): Transaction[] => {
  return allTransactionsData;
};

// Function to get transactions for a specific merchant
export const getMerchantTransactions = (merchantId: string): Transaction[] => {
  // In a real Firestore query, this would be: query(collection(db, 'transactions'), where('merchantId', '==', merchantId))
  // For now, we filter the mock data.
  // We'll use a placeholder check as we don't have a real merchant session.
  return allTransactionsData.filter(tx => tx.merchantId === 'merch_0' || tx.merchantId === 'merch_1');
};

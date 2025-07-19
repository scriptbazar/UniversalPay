
export type Withdrawal = {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: string;
  currency: string;
  destination: string;
  status: "Pending" | "Completed" | "Failed";
  date: string;
};

// This acts as a simple in-memory database.
let withdrawals: Withdrawal[] = [
  { id: "UVRLP789012345", merchantName: "MyStore.com", merchantId: "merch_123", amount: "500.00", currency: "USDT", destination: "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc", status: "Completed", date: "2023-10-25" },
  { id: "UVRLP890123456", merchantName: "CreativeGoods", merchantId: "merch_456", amount: "1200.00", currency: "USDT", destination: "TXkLgSAz4TSiS5i2i2c4i5YJz5xQ8vYfBc", status: "Pending", date: "2023-10-27" },
  { id: "UVRLP901234567", merchantName: "AnotherShop", merchantId: "merch_789", amount: "1000.00", currency: "INR", destination: "XXXX-XXXX-1234", status: "Completed", date: "2023-10-20" },
  { id: "UVRLP012345678", merchantName: "MyStore.com", merchantId: "merch_123", amount: "250.00", currency: "BTC", destination: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", status: "Completed", date: "2023-10-18" },
  { id: "UVRLP112233445", merchantName: "AnotherShop", merchantId: "merch_789", amount: "750.00", currency: "USDT", destination: "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc", status: "Failed", date: "2023-10-15" },
  { id: "UVRLP223344556", merchantName: "TechGadgets", merchantId: "merch_101", amount: "300.00", currency: "USDT", destination: "TDRS2s4i5YJz5xQ8vYfBcGoce3yYdHjC5yYwY", status: "Pending", date: "2023-10-28" },
  { id: "UVRLP334455667", merchantName: "FashionHub", merchantId: "merch_202", amount: "850.00", currency: "INR", destination: "XXXX-XXXX-5678", status: "Pending", date: "2023-10-28" },
];

// Function to get all withdrawals, sorted by most recent first
export const getWithdrawals = (): Withdrawal[] => {
  return [...withdrawals].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Function to add a new withdrawal
export const addWithdrawal = (newWithdrawalData: Omit<Withdrawal, 'id' | 'date'>): void => {
  const newWithdrawal: Withdrawal = {
    ...newWithdrawalData,
    id: `UVRLP${Math.floor(100000000 + Math.random() * 900000000)}`,
    date: new Date().toISOString().split("T")[0],
  };
  withdrawals.push(newWithdrawal);
};

// Function to update the status of a withdrawal
export const updateWithdrawalStatus = (id: string, newStatus: "Completed" | "Failed"): void => {
  withdrawals = withdrawals.map(w =>
    w.id === id ? { ...w, status: newStatus } : w
  );
};


export type WalletLoadRequest = {
  id: string;
  merchantId: string;
  merchantName: string;
  amount: string;
  currency: 'USD';
  transactionId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
};

let walletLoadRequests: WalletLoadRequest[] = [
  {
    id: "WLR-001",
    merchantId: "merch_123",
    merchantName: "MyStore.com",
    amount: "1000.00",
    currency: "USD",
    transactionId: "PAYID12345678",
    status: "Pending",
    createdAt: new Date('2023-11-10T10:00:00Z').toISOString(),
  },
  {
    id: "WLR-002",
    merchantId: "merch_456",
    merchantName: "CreativeGoods",
    amount: "500.00",
    currency: "USD",
    transactionId: "DEPOSIT98765",
    status: "Approved",
    createdAt: new Date('2023-11-09T15:00:00Z').toISOString(),
  },
   {
    id: "WLR-003",
    merchantId: "merch_123",
    merchantName: "MyStore.com",
    amount: "2500.00",
    currency: "USD",
    transactionId: "REF11223344",
    status: "Rejected",
    createdAt: new Date('2023-11-08T12:00:00Z').toISOString(),
  },
];

export const getWalletLoadRequests = (): WalletLoadRequest[] => {
  return [...walletLoadRequests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const addWalletLoadRequest = (requestData: Omit<WalletLoadRequest, 'id' | 'createdAt' | 'status'>): void => {
  const newRequest: WalletLoadRequest = {
    ...requestData,
    id: `WLR-${String(walletLoadRequests.length + 1).padStart(3, '0')}`,
    createdAt: new Date().toISOString(),
    status: "Pending",
  };
  walletLoadRequests.unshift(newRequest);
};

export const updateWalletLoadRequestStatus = (id: string, status: "Approved" | "Rejected"): void => {
  const index = walletLoadRequests.findIndex(req => req.id === id);
  if (index !== -1) {
    walletLoadRequests[index].status = status;
  }
};

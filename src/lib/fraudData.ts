
export type Transaction = {
    id: string;
    user: string;
    ip: string;
    amount: string;
    riskScore: number;
    reason: string;
    status: "Flagged" | "Held" | "Blocked" | "KYC Requested";
    timestamp: string;
};

const generateRandomId = (prefix: string) => {
    const randomNum = Math.floor(10000000 + Math.random() * 90000000);
    return `${prefix}${randomNum}`;
};

const suspiciousTransactionsData: Transaction[] = [
  {
    id: generateRandomId("UVPAYTRX"),
    user: "user_1",
    ip: "123.45.67.89",
    amount: "1500.00",
    riskScore: 95,
    reason: "High frequency",
    status: "Flagged",
    timestamp: "2023-10-26 10:00:00",
  },
  {
    id: generateRandomId("UVPAYTRX"),
    user: "user_2",
    ip: "98.76.54.32",
    amount: "50.00",
    riskScore: 80,
    reason: "Geo mismatch",
    status: "Held",
    timestamp: "2023-10-26 10:05:00",
  },
  {
    id: generateRandomId("UVPAYTRX"),
    user: "user_3",
    ip: "111.222.111.222",
    amount: "200.00",
    riskScore: 70,
    reason: "Bot-like activity",
    status: "Flagged",
    timestamp: "2023-10-26 10:10:00",
  },
  {
    id: generateRandomId("UVPAYTRX"),
    user: "user_4",
    ip: "123.45.67.89",
    amount: "3000.00",
    riskScore: 99,
    reason: "High frequency, Large amount",
    status: "Blocked",
    timestamp: "2023-10-26 10:15:00",
  },
];

export const getSuspiciousTransactions = (): Transaction[] => {
    return suspiciousTransactionsData;
};

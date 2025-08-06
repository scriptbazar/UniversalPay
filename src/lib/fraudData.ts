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

// This function is now a placeholder. In a real app, this data would come from
// a database or a fraud detection service.
export const getSuspiciousTransactions = (): Transaction[] => {
    return [];
};

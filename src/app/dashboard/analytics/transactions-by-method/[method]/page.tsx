
'use client';

import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

// Mock data generation function - in a real app, this would be an API call
const generateMockTransactions = () => {
    return Array.from({ length: 150 }, (_, i) => {
        const methods = ["UPI", "Crypto", "Page", "Link"];
        const success = Math.random() > 0.1;
        return {
            id: `UVRLP${987654321 - i}`,
            merchant: `Merchant ${i % 4 + 1}`,
            merchantId: `user_${(i%4)+1}`,
            customerEmail: `customer${i + 1}@example.com`,
            amount: (Math.random() * 500 + 10).toFixed(2),
            date: new Date(2023, 10, (i % 28) + 1).toISOString().split('T')[0],
            method: methods[i % 4],
            status: success ? 'Success' : 'Failed'
        }
    });
};

type Transaction = ReturnType<typeof generateMockTransactions>[0];

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Success': return 'default';
        case 'Failed': return 'destructive';
        default: return 'secondary';
    }
};

export default function TransactionsByMethodPage() {
    const params = useParams();
    const { toast } = useToast();
    const method = params.method as string;

    const [allMockTransactions, setAllMockTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    useEffect(() => {
        // Generate data on the client side to avoid hydration issues
        setAllMockTransactions(generateMockTransactions());
    }, []);

    const pageTitle = method ? `${method.charAt(0).toUpperCase() + method.slice(1)} Transactions` : 'Transactions';

    const methodTransactions = useMemo(() => {
        if (!allMockTransactions.length || !method) return [];
        return allMockTransactions.filter(tx => tx.method.toLowerCase() === method.toLowerCase());
    }, [method, allMockTransactions]);

    const handleRowClick = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: `${text} has been copied to your clipboard.`,
        });
    };

    return (
        <div className="space-y-6">
            <Link href="/dashboard/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                    <CardDescription>A list of all transactions for this payment method. Click a row for details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {methodTransactions.map(tx => (
                                <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{tx.id}</TableCell>
                                    <TableCell>{tx.merchant}</TableCell>
                                    <TableCell>{tx.customerEmail}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                    </TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className="text-right">${tx.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {methodTransactions.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No transactions found for this method.</p>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Transaction Details</DialogTitle>
                        <DialogDescription>
                            Full details for transaction {selectedTransaction?.id}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedTransaction && (
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Transaction ID:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-semibold">{selectedTransaction.id}</span>
                                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.id, 'Transaction ID')} />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Merchant:</span>
                                <span className="font-semibold">{selectedTransaction.merchant}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Customer Email:</span>
                                <div className="flex items-center gap-2">
                                     <span className="font-semibold">{selectedTransaction.customerEmail}</span>
                                     <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.customerEmail, 'Customer Email')} />
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-semibold">${selectedTransaction.amount}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-between gap-2">
                        <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>Close</Button>
                        {selectedTransaction && (
                        <Button asChild>
                            <Link href={`/dashboard/users/${selectedTransaction.merchantId}`}>View Merchant Profile</Link>
                        </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


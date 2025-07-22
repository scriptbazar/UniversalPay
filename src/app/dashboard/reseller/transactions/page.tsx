
'use client';

import { useState, useMemo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft, Copy } from 'lucide-react';

type Transaction = {
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

export default function SubMerchantTransactionsPage() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>(allSubMerchantTransactions);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const paginatedTransactions = transactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success': return 'default';
            case 'pending': return 'secondary';
            case 'failed': return 'destructive';
            default: return 'outline';
        }
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
            <Link href="/dashboard/reseller" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Reseller Dashboard
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>All Sub-Merchant Transactions</CardTitle>
                    <CardDescription>
                        A complete list of all payments processed through your sub-merchants.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTransactions.map(tx => (
                                <TableRow key={tx.id} className="cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                                    <TableCell className="font-medium">{tx.id}</TableCell>
                                    <TableCell>{tx.merchantName}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                    </TableCell>
                                    <TableCell>{tx.method}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {transactions.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No transactions found.
                        </div>
                     )}
                </CardContent>
                <CardFooter>
                     <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}. Total {transactions.length} transactions.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardFooter>
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
                            <span className="font-semibold">{selectedTransaction.merchantName}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-semibold">${selectedTransaction.amount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Method:</span>
                            <span className="font-semibold">{selectedTransaction.method}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold">{selectedTransaction.date}</span>
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

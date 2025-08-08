
'use client';

import { useState, useMemo, useEffect } from 'react';
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
import { ArrowLeft, Copy, Search } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { type Transaction, getAllSubMerchantTransactions } from '@/lib/resellerData';
import { Timestamp } from 'firebase/firestore';

const toDateSafe = (dateFieldValue: any): Date => {
  if (dateFieldValue instanceof Timestamp) {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue === 'string') {
    const date = new Date(dateFieldValue);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  if (dateFieldValue && typeof dateFieldValue === 'number') {
    return new Date(dateFieldValue);
  }
  return new Date(); 
};

export default function SubMerchantTransactionsPage() {
    const { toast } = useToast();
    const [allSubMerchantTransactions, setAllSubMerchantTransactions] = useState<Transaction[]>([]);

    useEffect(() => {
        const fetchedTransactions = getAllSubMerchantTransactions().map(tx => ({
            ...tx,
            date: toDateSafe(tx.date)
        }));
        setAllSubMerchantTransactions(fetchedTransactions);
    }, []);

    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const filteredTransactions = useMemo(() => {
        let filtered = allSubMerchantTransactions;

        if (filter !== 'all') {
            filtered = filtered.filter(tx => tx.method.toLowerCase() === filter.toLowerCase());
        }

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.merchantEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [filter, searchTerm, allSubMerchantTransactions]);
    
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
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
    
    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <Link href="/dashboard/reseller" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Reseller Dashboard
            </Link>
            <Tabs value={filter} onValueChange={handleFilterChange}>
                 <div className="flex flex-wrap items-center gap-4">
                    <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="UPI">UPI</TabsTrigger>
                        <TabsTrigger value="Crypto">Crypto</TabsTrigger>
                        <TabsTrigger value="Link">Link</TabsTrigger>
                        <TabsTrigger value="Page">Page</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow flex justify-end items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="search"
                             placeholder="Search ID, Merchant, Email..."
                             className="pl-8 w-64"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                    </div>
                </div>
                <Card className='mt-4'>
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
                                        <TableCell>{tx.date.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {filteredTransactions.length === 0 && (
                            <div className="text-center p-8 text-muted-foreground">
                                No transactions found for the selected filters.
                            </div>
                         )}
                    </CardContent>
                    <CardFooter>
                         <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-muted-foreground">
                                Page {currentPage} of {totalPages}. Total {filteredTransactions.length} transactions.
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
            </Tabs>
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
                            <span className="font-semibold">{selectedTransaction.date.toLocaleString()}</span>
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


'use client';

import { ArrowLeft, Copy, Search, File } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";

type Transaction = {
    id: string;
    customerEmail: string;
    amount: string;
    date: Date;
    method: string;
    status: 'Success' | 'Failed' | 'Pending';
};

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


const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Success': return 'default';
        case 'Failed': return 'destructive';
        default: return 'secondary';
    }
};

export default function MonthlyTransactionsPage() {
    const params = useParams();
    const { toast } = useToast();
    const monthSlug = params.month as string;
    
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setLoading(true);
                const transQuery = query(
                    collection(db, "transactions"), 
                    where("merchantId", "==", user.uid),
                    orderBy("date", "desc")
                );

                const unsubscribeSnapshot = onSnapshot(transQuery, (snapshot) => {
                    const fetched = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        date: toDateSafe(doc.data().date)
                    } as Transaction));
                    
                    const monthIndex = new Date(Date.parse(monthSlug +" 1, 2020")).getMonth();

                    const monthlyTransactions = fetched.filter(tx => tx.date.getMonth() === monthIndex);
                    
                    setTransactions(monthlyTransactions);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching transactions:", error);
                    toast({ variant: 'destructive', title: 'Error', description: 'Could not load transaction data.' });
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, [monthSlug, toast]);


    const filteredTransactions = useMemo(() => {
        let filtered = transactions;
        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    }, [transactions, searchTerm]);

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

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
    
    const pageTitle = monthSlug === 'all' ? `All Transactions` : `Transactions for ${monthSlug.charAt(0).toUpperCase() + monthSlug.slice(1)}`;

    return (
        <div className="space-y-6">
            <Link href="/merchant/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                        <CardDescription>A list of all transactions for the selected month. Click a row for details.</CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="search"
                             placeholder="Search ID, Customer..."
                             className="pl-8 w-64"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                        <Button size="sm" variant="outline" className="h-9 gap-1">
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading transactions...</TableCell></TableRow>
                            ) : paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map(tx => (
                                    <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">{tx.id}</TableCell>
                                        <TableCell>{tx.customerEmail}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                        </TableCell>
                                        <TableCell>{tx.date.toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">${tx.amount}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">No transactions found for this month.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
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
                                <span className="text-muted-foreground">Customer:</span>
                                <div className="text-right">
                                    <p className="font-semibold">{selectedTransaction.customerEmail}</p>
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


'use client';

import { ArrowLeft, Copy, Download, Search, File } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useParams, notFound } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Timestamp, collection, query, where, onSnapshot, orderBy, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Customer, CustomerTransaction } from '@/lib/customersData';
import { Skeleton } from "@/components/ui/skeleton";

const toDateSafe = (dateFieldValue: any): Date => {
  if (dateFieldValue instanceof Timestamp) {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue.toDate === 'string') {
    const date = new Date(dateFieldValue);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  if (dateFieldValue && typeof dateFieldValue.toDate === 'number') {
    return new Date(dateFieldValue);
  }
  return new Date(); 
};


const getStatusBadgeVariant = (status: string) => {
    return status === 'Success' ? 'default' : 'destructive';
};

export default function CustomerTransactionsPage() {
    const params = useParams();
    const customerId = params.customerId as string;
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<CustomerTransaction[]>([]);
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<CustomerTransaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!customerId) return;
        setLoading(true);

        const fetchCustomer = async () => {
             const customerRef = doc(db, 'customers', customerId);
             const docSnap = await getDoc(customerRef);
             if (docSnap.exists()) {
                setCustomer({ id: docSnap.id, ...docSnap.data() } as Customer);
             } else {
                 notFound();
             }
        }
        fetchCustomer();

        const transQuery = query(collection(db, 'transactions'), where('customerId', '==', customerId), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(transQuery, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                date: toDateSafe(d.data().date).toLocaleDateString()
            } as CustomerTransaction));
            setTransactions(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching customer transactions:", error);
            toast({ variant: 'destructive', title: 'Error', description: "Could not load transactions." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [customerId, toast]);

    const filteredTransactions = useMemo(() => {
        if (!searchTerm) {
            return transactions;
        }
        return transactions.filter(tx =>
            tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);
    
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${label} Copied!` });
    };

    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-6">
            <Link href={`/merchant/customers/${customerId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Profile
            </Link>

             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transaction History for {customer?.name || 'Customer'}</CardTitle>
                        <CardDescription>A complete list of all payments from this customer.</CardDescription>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="search"
                             placeholder="Search transactions..."
                             className="pl-8 w-48"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                       <Button size="sm" variant="outline" className="h-9 gap-1">
                          <Download className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                       </Button>
                   </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: 3}).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-6 w-full"/></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full"/></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full"/></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full"/></TableCell>
                                    <TableCell><Skeleton className="h-6 w-full"/></TableCell>
                                </TableRow>
                                ))
                            ) : paginatedTransactions.map(tx => (
                                <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedTransaction(tx)}>
                                    <TableCell className="font-medium">{tx.id}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell>{tx.method}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right">${tx.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!loading && filteredTransactions.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No transactions found for this customer.
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}
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
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-semibold">{selectedTransaction.method}</span>
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
    )
}


'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import {
  File,
  Search,
  Copy
} from "lucide-react";
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useSearchParams } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';

type Transaction = {
    id: string;
    merchantId: string;
    customerEmail: string;
    status: string;
    method: string;
    date: Date; // Changed to Date to reflect the transformed data
    amount: string;
};

// Helper function to safely convert a Firestore timestamp or other date format to a Date object
const toDateSafe = (dateFieldValue: any): Date => {
  if (dateFieldValue instanceof Timestamp) {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue === 'string') {
    return new Date(dateFieldValue);
  }
  if (dateFieldValue && typeof dateFieldValue === 'number') {
    return new Date(dateFieldValue);
  }
  return new Date(); 
};

function PaymentsComponent() {
    const searchParams = useSearchParams();
    const initialFilter = searchParams.get('filter') || 'all';

    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState(initialFilter);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const merchantId = user.uid;
                const transactionsCollectionRef = collection(db, "transactions");
                const q = query(
                    transactionsCollectionRef,
                    where("merchantId", "==", merchantId),
                    orderBy("date", "desc")
                );

                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    const fetchedTransactions = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        date: toDateSafe(doc.data().date) // Use the safe conversion function
                    } as Transaction));
                    setTransactions(fetchedTransactions);
                    setLoading(false);
                }, (error) => {
                    console.error("Error fetching merchant transactions:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Failed to fetch transactions. Check console and Firebase rules.",
                    });
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setTransactions([]);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [toast]);

    useEffect(() => {
        setFilter(initialFilter);
    }, [initialFilter]);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        const filterLower = filter.toLowerCase();
        const statusFilters = ['success', 'pending', 'failed'];
        const methodFilters = ['upi', 'crypto', 'link', 'page', 'card'];
        
        if (statusFilters.includes(filterLower)) {
            filtered = filtered.filter(tx => tx.status.toLowerCase() === filterLower);
        } else if (methodFilters.includes(filterLower)) {
            filtered = filtered.filter(tx => tx.method.toLowerCase() === filterLower);
        }

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (dateRange?.from) {
            filtered = filtered.filter(tx => tx.date >= dateRange.from!);
        }
        if (dateRange?.to) {
            filtered = filtered.filter(tx => tx.date <= dateRange.to!);
        }

        return filtered;
    }, [transactions, filter, searchTerm, dateRange]);
    
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = filteredTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        setCurrentPage(1);
    };
    
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
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
                <p className="text-muted-foreground">Search, filter, and view all your transactions.</p>
            </div>
            <Tabs value={filter} onValueChange={handleFilterChange}>
                <div className="flex flex-wrap items-center gap-4">
                    <TabsList className="flex-wrap h-auto">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="success">Success</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="failed">Failed</TabsTrigger>
                        <TabsTrigger value="upi">UPI</TabsTrigger>
                        <TabsTrigger value="crypto">Crypto</TabsTrigger>
                        <TabsTrigger value="card">Card</TabsTrigger>
                        <TabsTrigger value="link">Link</TabsTrigger>
                        <TabsTrigger value="page">Page</TabsTrigger>
                    </TabsList>
                    <div className="flex-grow flex justify-end items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="search"
                             placeholder="Search ID or Email..."
                             className="pl-8 w-48"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-auto justify-start text-left font-normal">
                                    <span>
                                        {dateRange?.from ? (
                                            dateRange.to ? (
                                                <>
                                                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                                                </>
                                            ) : (
                                                format(dateRange.from, "LLL dd, y")
                                            )
                                        ) : (
                                            "Filter by date"
                                        )}
                                    </span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    initialFocus
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button size="sm" variant="outline" className="h-9 gap-1">
                            <File className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                        </Button>
                    </div>
                </div>
                <Card className='mt-4'>
                    <CardHeader>
                        <CardTitle>Transaction History</CardTitle>
                        <CardDescription>
                            A complete list of all payments processed through your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center">Loading transactions...</TableCell>
                                    </TableRow>
                                ) : paginatedTransactions.map(tx => (
                                    <TableRow key={tx.id} className="cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                                        <TableCell className="font-medium">{tx.id}</TableCell>
                                        <TableCell>{tx.customerEmail}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                        </TableCell>
                                        <TableCell>{tx.method}</TableCell>
                                        <TableCell>{tx.date.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">${tx.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {!loading && filteredTransactions.length === 0 && (
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
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-semibold">{selectedTransaction.method}</span>
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

export default function MerchantPaymentsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PaymentsComponent />
        </Suspense>
    );
}

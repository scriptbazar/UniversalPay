
'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  File,
  Search,
  Copy,
  ListFilter
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { collection, getDocs, query, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';

type Transaction = {
    id: string;
    merchantId: string;
    customerEmail: string;
    status: string;
    method: string;
    date: Date; 
    amount: string;
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

const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'success', label: 'Success Transactions' },
    { value: 'pending', label: 'Pending Transactions' },
    { value: 'failed', label: 'Failed Transactions' },
    { value: 'upi', label: 'UPI Transactions' },
    { value: 'crypto', label: 'Crypto Transactions' },
    { value: 'card', label: 'Card Transactions' },
    { value: 'link', label: 'Link Transactions' },
    { value: 'page', label: 'Page Transactions' },
];

export default function AllTransactionsPage() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const transactionsQuery = query(collection(db, "transactions"), orderBy("date", "desc"));
        
        const unsubscribe = onSnapshot(transactionsQuery, (querySnapshot) => {
            const fetchedTransactions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: toDateSafe(doc.data().date)
            } as Transaction));
            setTransactions(fetchedTransactions);
            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch transactions:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load transaction data.' });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

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
                tx.merchantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

    const currentFilterLabel = filterOptions.find(f => f.value === filter)?.label || 'Filter by';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">All Transactions</h1>
                <p className="text-muted-foreground">Search, filter, and view all transactions across the platform.</p>
            </div>
            <Card>
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Transaction History</CardTitle>
                            <CardDescription>
                                A complete list of all payments processed through the platform.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input
                                 type="search"
                                 placeholder="Search ID, Merchant, Email..."
                                 className="pl-8 w-40"
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                               />
                            </div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-auto justify-start text-left font-normal h-9">
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
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-9 gap-1">
                                    <ListFilter className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                                        {currentFilterLabel}
                                    </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {filterOptions.map(option => (
                                         <DropdownMenuCheckboxItem
                                            key={option.value}
                                            checked={filter === option.value}
                                            onCheckedChange={() => handleFilterChange(option.value)}
                                        >
                                            {option.label}
                                        </DropdownMenuCheckboxItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button size="sm" variant="outline" className="h-9 gap-1">
                                <File className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: 5}).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : paginatedTransactions.map(tx => (
                                <TableRow key={tx.id} className="cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                                    <TableCell className="font-medium">{tx.id}</TableCell>
                                    <TableCell>{tx.merchantId}</TableCell>
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
                            <span className="text-muted-foreground">Merchant ID:</span>
                            <span className="font-semibold">{selectedTransaction.merchantId}</span>
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

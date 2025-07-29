
'use client';

import { ArrowLeft, Copy, Download, Mail, Phone, Calendar, DollarSign, CreditCard, Search, File, Percent, Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


type Customer = {
    id: string;
    email: string;
    name: string;
    avatar: string;
    totalSpent: number;
    transactions: number;
    lastSeen: string;
    joinedDate: string;
};

type Transaction = {
    id: string;
    amount: string;
    status: 'Success' | 'Failed';
    date: string;
    method: 'UPI' | 'Crypto' | 'Page' | 'Link';
}

const mockCustomer: Customer = {
    id: 'cust_1',
    email: 'liam@example.com',
    name: 'Liam Johnson',
    avatar: 'https://placehold.co/96x96.png?text=L',
    totalSpent: 250.00,
    transactions: 5,
    lastSeen: '2 days ago',
    joinedDate: '2023-01-15',
};

const mockTransactions: Transaction[] = [
    { id: 'TXN101', amount: '50.00', status: 'Success', date: '2023-11-10', method: 'Page' },
    { id: 'TXN102', amount: '25.50', status: 'Success', date: '2023-10-22', method: 'Link' },
    { id: 'TXN103', amount: '100.00', status: 'Success', date: '2023-09-05', method: 'Page' },
    { id: 'TXN104', amount: '14.50', status: 'Failed', date: '2023-08-18', method: 'UPI' },
    { id: 'TXN105', amount: '60.00', status: 'Success', date: '2023-07-30', method: 'Crypto' },
];

const getStatusBadgeVariant = (status: string) => {
    return status === 'Success' ? 'default' : 'destructive';
};

export default function CustomerDetailPage() {
    const params = useParams();
    const customerId = params.customerId as string;
    const { toast } = useToast();
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const itemsPerPage = 5;

    useEffect(() => {
        // In a real app, you would fetch this data based on customerId
        setCustomer(mockCustomer);
        setTransactions(mockTransactions);
    }, [customerId]);
    
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

    if (!customer) {
        return <div>Loading...</div>;
    }
    
    const successfulTxns = transactions.filter(tx => tx.status === 'Success').length;
    const successRate = customer.transactions > 0 ? ((successfulTxns / customer.transactions) * 100).toFixed(1) : "0.0";
    const avgTxnValue = customer.transactions > 0 ? (customer.totalSpent / successfulTxns).toFixed(2) : "0.00";


    return (
        <div className="space-y-6">
            <Link href="/merchant/customers" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Customers
            </Link>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                    <Image src={customer.avatar} width={96} height={96} alt={customer.name} className="rounded-full" data-ai-hint="user avatar" />
                </div>
                <div className="flex-grow">
                    <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <Mail className="h-4 w-4" /> {customer.email}
                            <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(customer.email, 'Email')} />
                        </span>
                        <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Joined: {new Date(customer.joinedDate).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            
             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${customer.totalSpent.toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.transactions}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Transaction Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${avgTxnValue}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Last Seen</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{customer.lastSeen}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Transaction History</CardTitle>
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
                            {paginatedTransactions.map(tx => (
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
    );
}

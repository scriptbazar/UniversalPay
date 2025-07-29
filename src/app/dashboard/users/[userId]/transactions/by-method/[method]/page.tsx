
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

// Mock data generation function
const generateMockTransactions = () => {
    const allTransactions = [];
    const methods = ["UPI", "Crypto", "Page", "Link"];
    for (let i = 0; i < 50; i++) {
        const success = Math.random() > 0.1;
        const method = methods[i % 4];
        allTransactions.push({
            id: `UVRLP${123456789 + i}`,
            customerName: `Customer ${i + 1}`,
            customerEmail: `customer${i + 1}@example.com`,
            amount: (Math.random() * 500 + 10).toFixed(2),
            date: new Date(2023, 10, 28 - (i % 28)).toISOString().split('T')[0],
            status: success ? 'Success' : 'Failed',
            method: method,
        });
    }
    return allTransactions;
};

type Transaction = ReturnType<typeof generateMockTransactions>[0];

const allMockTransactions = generateMockTransactions();

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Success': return 'default';
        case 'Failed': return 'destructive';
        default: return 'secondary';
    }
};

export default function UserTransactionsByMethodPage() {
    const params = useParams();
    const { toast } = useToast();
    const userId = params.userId as string;
    const method = params.method as string;

    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const pageTitle = method ? `${method.charAt(0).toUpperCase() + method.slice(1)} Transactions` : 'Transactions';
    
    // Function to create a consistent 8-digit number from the userId
    const formatUserId = (uid: string) => {
        if (!uid) return '';
        let hash = 0;
        for (let i = 0; i < uid.length; i++) {
            const char = uid.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0; // Convert to 32bit integer
        }
        const shortId = Math.abs(hash).toString().substring(0, 8).padEnd(8, '0');
        return `UVPAYM${shortId}`;
    };

    const formattedUserId = useMemo(() => formatUserId(userId), [userId]);


    const filteredTransactions = useMemo(() => {
        let filtered = allMockTransactions.filter(tx => tx.method.toLowerCase() === method.toLowerCase());
        
        if (searchTerm) {
            filtered = filtered.filter(tx => 
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }, [method, searchTerm]);

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

    return (
        <div className="space-y-6">
            <Link href={`/dashboard/users/${userId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to User Profile
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center">
                   <div className="grid gap-2">
                        <CardTitle className="text-2xl">{pageTitle} for {formattedUserId}</CardTitle>
                        <CardDescription>A list of all transactions for this user and payment method.</CardDescription>
                   </div>
                   <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="search"
                             placeholder="Search ID, Name, Email..."
                             className="pl-8 w-48"
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
                            {paginatedTransactions.map(tx => (
                                <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{tx.id}</TableCell>
                                    <TableCell>{tx.customerName}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                    </TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className="text-right">${tx.amount}</TableCell>
                                </TableRow>
                            ))}
                             {filteredTransactions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No transactions found.
                                    </TableCell>
                                </TableRow>
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
                                    <p className="font-semibold">{selectedTransaction.customerName}</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Email:</span>
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
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


'use client';

import { ArrowLeft, Copy, Search, File } from "lucide-react"; // Import Search and File
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
import { Input } from "@/components/ui/input"; // Import Input

// Mock data generation function - in a real app, this would be an API call
const generateMockTransactions = () => {
    return Array.from({ length: 150 }, (_, i) => {
        const methods = ["UPI", "Crypto", "Page", "Link"];
        const success = Math.random() > 0.1;
        const day = 28 - Math.floor(i / 6);
        return {
            id: `UVRLP${987654321 - i}`,
            customerEmail: `customer${i + 1}@example.com`,
            amount: (Math.random() * 500 + 10).toFixed(2),
            date: new Date(2023, 10, day).toISOString().split('T')[0],
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
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        // Generate data on the client side to avoid hydration issues
        setAllMockTransactions(generateMockTransactions());
    }, []);

    const pageTitle = method ? `${method.charAt(0).toUpperCase() + method.slice(1)} Transactions` : 'Transactions';

    const filteredTransactions = useMemo(() => {
        let filtered = allMockTransactions.filter(tx => tx.method.toLowerCase() === method.toLowerCase());

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }, [method, allMockTransactions, searchTerm]);

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
            <Link href="/merchant/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                        <CardDescription>A list of all transactions for this payment method. Click a row for details.</CardDescription>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
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
                    {filteredTransactions.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">No transactions found for the selected filters.</p>
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


'use client';

import { ArrowLeft, Copy, Search, File } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp } from "firebase/firestore";

// Mock data generation function
const generateMockTransactions = () => {
    return Array.from({ length: 12 * 50 }, (_, i) => {
        const monthIndex = Math.floor(i / 50);
        const year = 2023 - Math.floor(i / (12 * 10)); // Distribute across a few years
        const months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
        const success = Math.random() > 0.1;
        const methods = ["UPI", "Crypto", "Page", "Link"];
        return {
            id: `UVRLP${123456789 + i}`,
            customerName: `Customer ${i + 1}`,
            customerEmail: `customer${i + 1}@example.com`,
            amount: (Math.random() * 500 + 10).toFixed(2),
            date: new Date(year, monthIndex, (i % 28) + 1).toISOString().split('T')[0],
            month: months[monthIndex],
            status: success ? 'Success' : 'Failed',
            method: methods[i % 4],
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

export default function MonthlyTransactionsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const month = params.month as string;

    const [allMockTransactions, setAllMockTransactions] = useState<Transaction[]>([]);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [availableYears, setAvailableYears] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                const currentYear = new Date().getFullYear();
                let startYear = currentYear;

                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.createdAt && data.createdAt instanceof Timestamp) {
                        startYear = data.createdAt.toDate().getFullYear();
                    }
                }
                
                const years: string[] = [];
                for (let y = startYear; y <= currentYear; y++) {
                    years.push(y.toString());
                }
                setAvailableYears(years.reverse());
                setSelectedYear(currentYear.toString());
            }
            setLoading(false);
        });

        // Generate mock data on mount
        setAllMockTransactions(generateMockTransactions());

        return () => unsubscribe();
    }, []);
    

    const monthlyTransactions = useMemo(() => {
        let filtered = allMockTransactions.filter(tx => tx.month.toLowerCase() === month.toLowerCase());
        
        if(selectedYear !== 'all') {
            filtered = filtered.filter(tx => new Date(tx.date).getFullYear().toString() === selectedYear);
        }

        if (searchTerm) {
            filtered = filtered.filter(tx => 
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        return filtered;
    }, [month, allMockTransactions, searchTerm, selectedYear]);

    const totalPages = Math.ceil(monthlyTransactions.length / itemsPerPage);
    const paginatedTransactions = monthlyTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const pageTitle = `Transactions for ${month.charAt(0).toUpperCase() + month.slice(1)} ${selectedYear !== 'all' ? selectedYear : ''}`;


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
            <Link href="/merchant/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            <Card>
                <CardHeader className="flex flex-row items-center">
                   <div className="grid gap-2">
                        <CardTitle className="text-2xl">{pageTitle}</CardTitle>
                        <CardDescription>A list of all transactions for the selected period. Click a row for details.</CardDescription>
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
                        <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-[120px] h-9">
                                <SelectValue placeholder="Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.length > 0 ? (
                                    availableYears.map(year => (
                                        <SelectItem key={year} value={year}>{year}</SelectItem>
                                    ))
                                ) : (
                                     <SelectItem value={new Date().getFullYear().toString()} disabled>
                                        {new Date().getFullYear()}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
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
                                <TableHead>Method</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">Loading transactions...</TableCell>
                                </TableRow>
                            ) : paginatedTransactions.length > 0 ? (
                                paginatedTransactions.map(tx => (
                                    <TableRow key={tx.id} onClick={() => handleRowClick(tx)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">{tx.id}</TableCell>
                                        <TableCell>{tx.customerName}</TableCell>
                                        <TableCell>{tx.method}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                        </TableCell>
                                        <TableCell>{tx.date}</TableCell>
                                        <TableCell className="text-right">${tx.amount}</TableCell>
                                    </TableRow>
                                ))
                             ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No transactions found for this month or filter.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}. Total {monthlyTransactions.length} transactions.
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

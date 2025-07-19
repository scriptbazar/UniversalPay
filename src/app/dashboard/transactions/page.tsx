
'use client';

import { useState, useMemo } from 'react';
import {
  File,
  ListFilter,
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  TabsContent,
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

const allTransactionsData = Array.from({ length: 50 }, (_, i) => {
    const statuses = ["Success", "Failed", "Pending"] as const;
    const methods = ["UPI", "Crypto", "Card", "Link"] as const;
    const date = new Date(2023, 10, 28 - Math.floor(i / 2));
    return {
        id: `UVRLP${123456789 + i}`,
        merchant: `Merchant ${i % 4 + 1}`,
        customerEmail: `customer${i + 1}@example.com`,
        amount: (Math.random() * 500 + 10).toFixed(2),
        status: statuses[i % 3],
        method: methods[i % 4],
        date: date.toISOString().split('T')[0],
    };
});

type Transaction = typeof allTransactionsData[0];

export default function AllTransactionsPage() {
    const { toast } = useToast();
    const [transactions, setTransactions] = useState<Transaction[]>(allTransactionsData);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

    const filteredTransactions = useMemo(() => {
        let filtered = transactions;

        if (filter !== 'all') {
            filtered = filtered.filter(tx => tx.status.toLowerCase() === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter(tx =>
                tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
                tx.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (dateRange?.from) {
            filtered = filtered.filter(tx => new Date(tx.date) >= dateRange.from!);
        }
        if (dateRange?.to) {
            filtered = filtered.filter(tx => new Date(tx.date) <= dateRange.to!);
        }

        return filtered;
    }, [transactions, filter, searchTerm, dateRange]);
    
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
                <p className="text-muted-foreground">Search, filter, and view all transactions across the platform.</p>
            </div>
            <Tabs value={filter} onValueChange={setFilter}>
                <div className="flex items-center">
                    <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="success">Success</TabsTrigger>
                        <TabsTrigger value="pending">Pending</TabsTrigger>
                        <TabsTrigger value="failed">Failed</TabsTrigger>
                    </TabsList>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="relative">
                           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                           <Input
                             type="search"
                             placeholder="Search ID, merchant, email..."
                             className="pl-8"
                             value={searchTerm}
                             onChange={(e) => setSearchTerm(e.target.value)}
                           />
                        </div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
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
                                            "Filter by date range"
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
                            A complete list of all payments processed through the platform.
                        </CardDescription>
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
                                {filteredTransactions.map(tx => (
                                    <TableRow key={tx.id} className="cursor-pointer" onClick={() => setSelectedTransaction(tx)}>
                                        <TableCell className="font-medium">{tx.id}</TableCell>
                                        <TableCell>{tx.merchant}</TableCell>
                                        <TableCell>{tx.customerEmail}</TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                                        </TableCell>
                                        <TableCell>{tx.method}</TableCell>
                                        <TableCell>{tx.date}</TableCell>
                                        <TableCell className="text-right">${tx.amount}</TableCell>
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
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>{filteredTransactions.length}</strong> transactions.
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
                        <span className="font-semibold">{selectedTransaction.merchant}</span>
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


'use client';

import { ArrowLeft, CreditCard, DollarSign, Download, Hash, Landmark, MoreVertical, Percent, Shield, User, UserX, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";


const merchant = {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    plan: "Pro",
    status: "Active",
    avatar: "https://placehold.co/80x80.png?text=JD",
    role: "Merchant",
    joinedDate: "2023-01-15",
    lastLogin: "2023-10-27 10:00 AM",
};

const stats = {
    revenue: "45,231.89",
    walletBalance: "5,430.50",
    availableToWithdraw: "5,200.00",
    successRate: "98.2%",
};

const paymentMethodData = [
  { name: 'UPI', value: 20050, color: '#0088FE' },
  { name: 'Crypto', value: 15125, color: '#00C49F' },
  { name: 'Cards', value: 8056.89, color: '#FFBB28' },
  { name: 'Payment Links', value: 2000, color: '#FF8042' },
];

type Transaction = {
    id: string;
    amount: string;
    currency: string;
    method: string;
    status: string;
    date: string;
};

const allTransactions: Transaction[] = [
    { id: "pay_1", amount: "250.00", currency: "USD", method: "Crypto", status: "Success", date: "2023-11-01" },
    { id: "pay_2", amount: "150.00", currency: "INR", method: "UPI", status: "Success", date: "2023-11-01" },
    { id: "pay_3", amount: "350.00", currency: "INR", method: "UPI", status: "Failed", date: "2023-11-02" },
    { id: "pay_4", amount: "800.00", currency: "USD", method: "Cards", status: "Success", date: "2023-11-02" },
    { id: "pay_5", amount: "1200.00", currency: "USD", method: "Payment Links", status: "Success", date: "2023-11-03" },
    { id: "pay_6", amount: "600.00", currency: "USD", method: "Crypto", status: "Success", date: "2023-11-04" },
    { id: "pay_7", amount: "50.00", currency: "INR", method: "UPI", status: "Success", date: "2023-11-05" },
    { id: "pay_8", amount: "1500.00", currency: "USD", method: "Cards", status: "Success", date: "2023-11-05" },
    { id: "pay_9", amount: "800.00", currency: "USD", method: "Payment Links", status: "Success", date: "2023-11-06" },
    { id: "pay_10", amount: "200.00", currency: "INR", method: "UPI", status: "Success", date: "2023-11-06" },
    { id: "pay_11", amount: "300.00", currency: "INR", method: "UPI", status: "Success", date: "2023-11-07" },
    { id: "pay_12", amount: "400.00", currency: "INR", method: "UPI", status: "Failed", date: "2023-11-08" },
    { id: "pay_13", amount: "500.00", currency: "INR", method: "UPI", status: "Success", date: "2023-11-09" },
    { id: "pay_14", amount: "600.00", currency: "USD", method: "Crypto", status: "Success", date: "2023-11-10" },
    { id: "pay_15", amount: "700.00", currency: "USD", method: "Cards", status: "Success", date: "2023-11-11" },
];

const recentTransactions = allTransactions.slice(0, 3);

type Withdrawal = {
  id: string;
  amount: string;
  currency: string;
  destinationType: string;
  destination: string;
  status: "Completed" | "Pending" | "Failed";
  date: string;
};

const withdrawalHistory: Withdrawal[] = [
    { id: "wd_1", amount: "500.00", currency: "USDT", destinationType: "Crypto Wallet", destination: "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc", status: "Completed", date: "2023-10-25" },
    { id: "wd_2", amount: "1000.00", currency: "INR", destinationType: "Bank Account", destination: "XXXX-XXXX-1234", status: "Pending", date: "2023-11-01" },
    { id: "wd_3", amount: "250.00", currency: "BTC", destinationType: "Crypto Wallet", destination: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", status: "Failed", date: "2023-10-18" },
    { id: "wd_4", amount: "750.00", currency: "USDT", destinationType: "Crypto Wallet", destination: "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc", status: "Completed", date: "2023-10-15" },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

type DialogType = 'revenue' | 'wallet' | 'withdraw' | 'success' | 'method' | 'transaction' | 'withdrawalDetail' | null;


export default function UserDetailPage({ params }: { params: { userId: string } }) {
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
  
  const [selectedMethod, setSelectedMethod] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState(allTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handlePieClick = (data: any) => {
    const method = data.name;
    setSelectedMethod(method);
    setFilteredTransactions(allTransactions.filter(t => t.method === method));
    setCurrentPage(1);
    setDialogOpen('method');
  };
  
  const handleTransactionRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen('transaction');
  };
  
  const handleWithdrawalRowClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDialogOpen('withdrawalDetail');
  };

  const openStatDialog = (type: DialogType) => {
    if (type === 'revenue') {
      setFilteredTransactions(allTransactions.filter(t => t.status === 'Success'));
      setCurrentPage(1);
    }
    setDialogOpen(type);
  };

  const paginatedTransactions = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return filteredTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'UPI') {
      return `₹${value.toLocaleString()}`;
    }
    return `$${value.toLocaleString()}`;
  };


  return (
    <div className="space-y-6">
        <Link href="/dashboard/users" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to All Users
        </Link>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
                 <Image src={merchant.avatar} width={96} height={96} alt={merchant.name} className="rounded-full" data-ai-hint="user avatar" />
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{merchant.name}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline"><UserX className="mr-2 h-4 w-4"/> Suspend Merchant</Button>
                        <Button variant="outline">Login As User</Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Change Plan</DropdownMenuItem>
                                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete Merchant</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <p className="text-muted-foreground">{merchant.email}</p>
                 <div className="flex items-center gap-4 mt-2">
                    <Badge variant={merchant.status === 'Active' ? 'default' : 'outline'}>{merchant.status}</Badge>
                    <Badge variant="secondary">Plan: {merchant.plan}</Badge>
                    <span className="text-sm text-muted-foreground">Joined: {merchant.joinedDate}</span>
                </div>
            </div>
        </div>
        <Separator/>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card onClick={() => openStatDialog('revenue')} className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue}</div>
                </CardContent>
            </Card>
            <Card onClick={() => openStatDialog('wallet')} className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Wallet Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.walletBalance}</div>
                </CardContent>
            </Card>
            <Card onClick={() => openStatDialog('withdraw')} className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available to Withdraw</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.availableToWithdraw}</div>
                </CardContent>
            </Card>
            <Card onClick={() => openStatDialog('success')} className="cursor-pointer hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.successRate}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Payment Method Mix</CardTitle>
                    <CardDescription>Breakdown of transactions by type. Click a slice to view details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie 
                                data={paymentMethodData} 
                                dataKey="value" 
                                nameKey="name" 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={80} 
                                label 
                                onClick={handlePieClick}
                                className="cursor-pointer"
                            >
                                {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={formatTooltipValue} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>The latest transactions from this merchant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map(p => (
                                <TableRow key={p.id} onClick={() => handleTransactionRowClick(p)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-medium">{p.id}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                                </TableCell>
                                <TableCell>{p.method}</TableCell>
                                <TableCell>{p.date}</TableCell>
                                <TableCell className="text-right">${p.amount} {p.currency}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Full withdrawal history for this merchant.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Withdrawal ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawalHistory.map(w => (
                            <TableRow key={w.id} onClick={() => handleWithdrawalRowClick(w)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-medium">{w.id}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                                </TableCell>
                                <TableCell>{w.date}</TableCell>
                                <TableCell className="text-right">${w.amount} {w.currency}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Transaction List Dialog (For Revenue and Payment Method) */}
        <Dialog open={dialogOpen === 'method' || dialogOpen === 'revenue'} onOpenChange={() => setDialogOpen(null)}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{dialogOpen === 'revenue' ? 'All Successful Transactions' : `${selectedMethod} Transactions`}</DialogTitle>
                     <DialogDescription>
                        A complete list of transactions. Click a row to see details.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedTransactions.map(p => (
                                <TableRow key={p.id} onClick={() => handleTransactionRowClick(p)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{p.id}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                                    </TableCell>
                                    <TableCell>{p.date}</TableCell>
                                    <TableCell className="text-right">${p.amount} {p.currency}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 <DialogFooter className="flex justify-between items-center w-full pt-4">
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
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Transaction Detail Dialog */}
        <Dialog open={dialogOpen === 'transaction'} onOpenChange={() => setDialogOpen(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                </DialogHeader>
                {selectedTransaction && (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Transaction ID:</span>
                            <span className="font-mono font-semibold">{selectedTransaction.id}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-semibold">${selectedTransaction.amount} {selectedTransaction.currency}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Method:</span>
                            <span className="font-semibold">{selectedTransaction.method}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold">{selectedTransaction.date}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                        </div>
                    </div>
                )}
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Withdrawal Detail Dialog */}
        <Dialog open={dialogOpen === 'withdrawalDetail'} onOpenChange={() => setDialogOpen(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Withdrawal Details</DialogTitle>
                </DialogHeader>
                {selectedWithdrawal && (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Withdrawal ID:</span>
                            <span className="font-mono font-semibold">{selectedWithdrawal.id}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-semibold">${selectedWithdrawal.amount} {selectedWithdrawal.currency}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Destination Type:</span>
                            <span className="font-semibold">{selectedWithdrawal.destinationType}</span>
                        </div>
                         <Separator/>
                         <div className="flex flex-col space-y-2">
                            <span className="text-muted-foreground">Destination Address:</span>
                            <span className="font-mono font-semibold break-all">{selectedWithdrawal.destination}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-semibold">{selectedWithdrawal.date}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={getStatusBadgeVariant(selectedWithdrawal.status)}>{selectedWithdrawal.status}</Badge>
                        </div>
                    </div>
                )}
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Other Stat Dialogs */}
        <Dialog open={['wallet', 'withdraw', 'success'].includes(dialogOpen || '')} onOpenChange={() => setDialogOpen(null)}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                     {dialogOpen === 'wallet' && <DialogTitle>Wallet Balance Details</DialogTitle>}
                     {dialogOpen === 'withdraw' && <DialogTitle>Available to Withdraw Details</DialogTitle>}
                     {dialogOpen === 'success' && <DialogTitle>Success Rate Details</DialogTitle>}
                </DialogHeader>
                 <div className="space-y-4 py-4">
                    {dialogOpen === 'wallet' && (
                        <>
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Credits:</span> <span className="font-semibold">$50,123.45</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Debits (Withdrawals + Fees):</span> <span className="font-semibold">$44,692.95</span></div>
                            <Separator/>
                            <div className="flex justify-between font-bold text-lg"><span>Current Balance:</span> <span>${stats.walletBalance}</span></div>
                        </>
                    )}
                     {dialogOpen === 'withdraw' && (
                        <>
                             <div className="flex justify-between"><span className="text-muted-foreground">Wallet Balance:</span> <span className="font-semibold">${stats.walletBalance}</span></div>
                             <div className="flex justify-between"><span className="text-muted-foreground">Pending Settlements:</span> <span className="font-semibold">-$230.50</span></div>
                             <Separator/>
                            <div className="flex justify-between font-bold text-lg"><span>Available to Withdraw:</span> <span>${stats.availableToWithdraw}</span></div>
                            <p className="text-xs text-muted-foreground pt-2">This is the amount you can currently withdraw. It excludes payments that are still being processed.</p>
                        </>
                    )}
                    {dialogOpen === 'success' && (
                         <>
                            <div className="flex justify-between"><span className="text-muted-foreground">Total Transactions Attempted:</span> <span className="font-semibold">{allTransactions.length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Successful Transactions:</span> <span className="font-semibold">{allTransactions.filter(t => t.status === 'Success').length}</span></div>
                            <div className="flex justify-between"><span className="text-muted-foreground">Failed Transactions:</span> <span className="font-semibold">{allTransactions.filter(t => t.status === 'Failed').length}</span></div>
                            <Separator/>
                            <div className="flex justify-between font-bold text-lg"><span>Success Rate:</span> <span>{stats.successRate}</span></div>
                        </>
                    )}
                 </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

    

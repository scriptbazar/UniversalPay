
'use client';

import { ArrowLeft, CreditCard, DollarSign, Download, Hash, Landmark, MoreVertical, Percent, Shield, User, UserCheck, UserX, Wallet, Copy, MinusCircle, PlusCircle, Briefcase, Mail, Phone, Calendar, ShieldCheck as ShieldIcon, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter, useParams, notFound } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateUserRole, updateUserStatus, adjustWalletBalance } from './actions';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from "firebase/firestore";

// MOCK DATA - This will be replaced by dynamic data where needed
const stats = {
    revenue: "45,231.89",
    walletBalance: "5,430.50",
    availableToWithdraw: "5,200.00",
    successRate: "98.2%",
};

const revenueData = [
    { name: 'Jan', revenue: 4230, monthIndex: 0 },
    { name: 'Feb', revenue: 3120, monthIndex: 1 },
    { name: 'Mar', revenue: 5890, monthIndex: 2 },
    { name: 'Apr', revenue: 4500, monthIndex: 3 },
    { name: 'May', revenue: 6200, monthIndex: 4 },
    { name: 'Jun', revenue: 7100, monthIndex: 5 },
];


const paymentMethodData = [
  { name: 'UPI', value: 20050, color: '#0088FE' },
  { name: 'Crypto', value: 15125, color: '#00C49F' },
  { name: 'Page', value: 8056.89, color: '#FFBB28' },
  { name: 'Link', value: 2000, color: '#FF8042' },
];

type Transaction = {
    id: string;
    amount: string;
    currency: string;
    method: string;
    status: string;
    date: Date;
};

const allTransactions: Transaction[] = [
    { id: "UVRLP111111111", amount: "250.00", currency: "USD", method: "Crypto", status: "Success", date: new Date(2023, 0, 15) },
    { id: "UVRLP222222222", amount: "150.00", currency: "INR", method: "UPI", status: "Success", date: new Date(2023, 1, 10) },
    { id: "UVRLP333333333", amount: "350.00", currency: "INR", method: "UPI", status: "Failed", date: new Date(2023, 2, 5) },
    { id: "UVRLP444444444", amount: "800.00", currency: "USD", method: "Page", status: "Success", date: new Date(2023, 3, 20) },
    { id: "UVRLP555555555", amount: "1200.00", currency: "USD", method: "Link", status: "Success", date: new Date(2023, 4, 1) },
    { id: "UVRLP666666666", amount: "450.00", currency: "USD", method: "Page", status: "Success", date: new Date(2023, 5, 12) },
];


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
    { id: "UVRLP789012345", amount: "500.00", currency: "USDT", destinationType: "Crypto Wallet", destination: "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc", status: "Completed", date: "2023-10-25" },
    { id: "UVRLP890123456", amount: "1000.00", currency: "INR", destinationType: "Bank Account", destination: "XXXX-XXXX-1234", status: "Pending", date: "2023-11-01" },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
        case 'active':
        case 'verified':
            return 'default';
        case 'pending':
        case 'pending approval':
            return 'secondary';
        case 'suspended':
        case 'not started':
            return 'destructive';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

type DialogType = 'transaction' | 'withdrawalDetail' | null;

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
    businessName?: string;
    plan?: string;
    status: "Active" | "Suspended";
    avatar?: string;
    role?: string;
    kycStatus?: "Verified" | "Pending Approval" | "Not Started";
    createdAt?: Timestamp;
}

export default function UserDetailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [merchant, setMerchant] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

  const [txCurrentPage, setTxCurrentPage] = useState(1);
  const [wdCurrentPage, setWdCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [walletBalance, setWalletBalance] = useState(parseFloat(stats.walletBalance.replace(/,/g, '')));
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [joinedDate, setJoinedDate] = useState('N/A');

  useEffect(() => {
    if (!userId) return;

    const fetchUser = async () => {
        setLoading(true);
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            userData.id = userDocSnap.id;
            setMerchant(userData);
            if (userData.createdAt) {
                setJoinedDate(userData.createdAt.toDate().toLocaleDateString());
            }
        } else {
            setMerchant(null);
            notFound();
        }
        setLoading(false);
    };

    fetchUser();
  }, [userId]);


  const handleToggleSuspend = async () => {
    if (!merchant || !auth.currentUser) return;
    const newStatus = merchant.status === 'Active' ? 'Suspended' : 'Active';
    const result = await updateUserStatus(merchant.id, newStatus, auth.currentUser.uid);

    if (result.success) {
        setMerchant(prev => prev ? { ...prev, status: newStatus } : null);
        toast({
            title: `Merchant ${newStatus}`,
            description: `${merchant.fullName} has been ${newStatus.toLowerCase()}.`
        });
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  };
  
  const handleRoleChange = async (newRole: 'admin' | 'merchant') => {
      if (!merchant || !auth.currentUser) return;
      const result = await updateUserRole(merchant.id, newRole, auth.currentUser.uid);
      
      if (result.success) {
        setMerchant(prev => prev ? { ...prev, role: newRole } : null);
        toast({
            title: 'Role Updated!',
            description: `${merchant.fullName} is now a ${newRole}.`
        });
      } else {
         toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
  };

  const handleWalletAdjustment = async (type: 'credit' | 'debit') => {
      const amount = parseFloat(adjustmentAmount);
      if (isNaN(amount) || amount <= 0) {
          toast({ variant: 'destructive', title: 'Invalid Amount' });
          return;
      }

      if (type === 'debit' && amount > walletBalance) {
          toast({ variant: 'destructive', title: 'Insufficient Balance' });
          return;
      }

      if (!auth.currentUser || !merchant) return;
      
      const result = await adjustWalletBalance(merchant.id, amount, type, auth.currentUser.uid);

      if (result.success) {
        const newBalance = type === 'credit' ? walletBalance + amount : walletBalance - amount;
        setWalletBalance(newBalance);
        toast({ title: `Balance Updated!`, description: `New balance is $${newBalance.toFixed(2)}`});
        setAdjustmentAmount('');
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
  };

  const handleLoginAsUser = () => {
    toast({
        title: "Redirecting...",
        description: `Logging you in as ${merchant?.fullName}.`
    });
    router.push('/merchant/dashboard');
  };

  const handleTransactionRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen('transaction');
  };
  
  const handleWithdrawalRowClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDialogOpen('withdrawalDetail');
  };

  const paginatedTransactions = useMemo(() => {
      return allTransactions.slice(0, itemsPerPage);
  }, []);

  const txTotalPages = Math.ceil(allTransactions.length / itemsPerPage);
  
  const paginatedWithdrawals = useMemo(() => {
      return withdrawalHistory.slice(0, itemsPerPage);
  }, []);

  const wdTotalPages = Math.ceil(withdrawalHistory.length / itemsPerPage);

  const formatTooltipValue = (value: number, name: string) => {
    if (name === 'UPI') {
      return `₹${value.toLocaleString()}`;
    }
    return `$${value.toLocaleString()}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handlePieClick = (data: any) => {
    const methodName = data.name;
    router.push(`/dashboard/users/${userId}/transactions/by-method/${methodName.toLowerCase()}`);
  };

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    const monthSlug = payload.name.toLowerCase();
    router.push(`/dashboard/users/${userId}/transactions/by-month/${monthSlug}`);
  };


  if (loading) {
    return <div className="flex-grow flex items-center justify-center">Loading user details...</div>;
  }
  
  if (!merchant) {
    return <div className="flex-grow flex items-center justify-center">User not found.</div>;
  }

  return (
    <div className="space-y-6">
        <Link href="/dashboard/users" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to All Users
        </Link>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
                 <Image src={merchant.avatar || `https://placehold.co/96x96.png?text=${merchant.fullName.charAt(0)}`} width={96} height={96} alt={merchant.fullName} className="rounded-full" data-ai-hint="user avatar" />
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{merchant.fullName}</h1>
                    <div className="flex gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="default" variant="outline">
                                    Actions
                                <MoreVertical className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={handleLoginAsUser}>
                                    <LogIn className="mr-2 h-4 w-4" />
                                    Login As User
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(merchant.role === 'admin' ? 'merchant' : 'admin')}>
                                    <ShieldIcon className="mr-2 h-4 w-4" />
                                    {merchant.role === 'admin' ? 'Make Merchant' : 'Make Admin'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleToggleSuspend}>
                                   {merchant.status === 'Active' ? <UserX className="mr-2 h-4 w-4"/> : <UserCheck className="mr-2 h-4 w-4"/>}
                                   {merchant.status === 'Active' ? 'Suspend Merchant' : 'Unsuspend Merchant'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Change Plan</DropdownMenuItem>
                                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">Delete Merchant</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {merchant.email} <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(merchant.email, 'Email')} /></span>
                    {merchant.mobile && <span className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {merchant.mobile}</span>}
                    {merchant.businessName && <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> {merchant.businessName}</span>}
                </div>
                 <div className="flex items-center gap-4 mt-2">
                    <Badge variant={getStatusBadgeVariant(merchant.status)}>{merchant.status}</Badge>
                    <Badge variant="secondary">Plan: {merchant.plan || 'Free'}</Badge>
                    <Badge variant={merchant.role === 'admin' ? 'destructive' : 'outline'}>Role: {merchant.role || 'merchant'}</Badge>
                    <Badge variant={getStatusBadgeVariant(merchant.kycStatus || 'Not Started')}>KYC: {merchant.kycStatus || 'Not Started'}</Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Joined: {joinedDate}</span>
                </div>
            </div>
        </div>
        
        <Tabs defaultValue="overview">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
                <TabsTrigger value="wallet">Wallet Management</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.revenue}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available Wallet Balance</CardTitle>
                            <Wallet className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${walletBalance.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Available to Withdraw</CardTitle>
                            <Landmark className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${stats.availableToWithdraw}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                            <Percent className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.successRate}</div>
                        </CardContent>
                    </Card>
                </div>
                <div className="grid lg:grid-cols-5 gap-6 mt-6">
                    <Card className="lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Revenue Over Time</CardTitle>
                            <CardDescription>Click a bar to view transactions for that month.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={revenueData} onClick={handleBarClick}>
                                    <XAxis
                                    dataKey="name"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    />
                                    <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${'${value/1000}'}K`}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                                        cursor={{fill: 'hsl(var(--muted))'}}
                                    />
                                    <Legend iconType="circle" />
                                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Payment Method Mix</CardTitle>
                            <CardDescription>Click a slice for details.</CardDescription>
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
                                            <Cell key={`cell-${'${index}'}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={formatTooltipValue} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
             <TabsContent value="transactions" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>All Transactions</CardTitle>
                        <CardDescription>The full transaction history for this merchant.</CardDescription>
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
                                {paginatedTransactions.map(p => (
                                    <TableRow key={p.id} onClick={() => handleTransactionRowClick(p)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{p.id}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                                    </TableCell>
                                    <TableCell>{p.method}</TableCell>
                                    <TableCell>{p.date.toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">${p.amount} {p.currency}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                     <CardFooter>
                        <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-muted-foreground">
                                Page {txCurrentPage} of {txTotalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setTxCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={txCurrentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setTxCurrentPage(prev => Math.min(prev + 1, txTotalPages))}
                                    disabled={txCurrentPage === txTotalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
             </TabsContent>
              <TabsContent value="withdrawals" className="mt-4">
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
                                {paginatedWithdrawals.map(w => (
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
                     <CardFooter>
                        <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-muted-foreground">
                                Page {wdCurrentPage} of {wdTotalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setWdCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={wdCurrentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setWdCurrentPage(prev => Math.min(prev + 1, wdTotalPages))}
                                    disabled={wdCurrentPage === wdTotalPages}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardFooter>
                </Card>
             </TabsContent>
             <TabsContent value="wallet" className="mt-4">
                 <Card>
                    <CardHeader>
                        <CardTitle>Wallet Management</CardTitle>
                        <CardDescription>Manually adjust the merchant's wallet balance.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                            <Wallet className="w-6 h-6 text-muted-foreground"/>
                            <span className="text-muted-foreground">Current Balance:</span>
                            <span className="text-2xl font-bold">${walletBalance.toFixed(2)}</span>
                        </div>
                        <Separator/>
                        <div className="space-y-2">
                            <Label htmlFor="adjustment-amount">Adjustment Amount (USD)</Label>
                            <Input
                                id="adjustment-amount"
                                type="number"
                                placeholder="e.g., 100.00"
                                value={adjustmentAmount}
                                onChange={(e) => setAdjustmentAmount(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => handleWalletAdjustment('credit')}>
                                <PlusCircle className="mr-2 h-4 w-4"/> Credit (Add Funds)
                            </Button>
                            <Button variant="destructive" onClick={() => handleWalletAdjustment('debit')}>
                                <MinusCircle className="mr-2 h-4 w-4"/> Debit (Remove Funds)
                            </Button>
                        </div>
                    </CardContent>
                </Card>
             </TabsContent>
        </Tabs>
        
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
                            <span className="font-mono font-semibold flex items-center gap-2">
                                {selectedTransaction.id}
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.id, 'Transaction ID')} />
                            </span>
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
                            <span className="font-semibold">{selectedTransaction.date.toLocaleDateString()}</span>
                        </div>
                        <Separator/>
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                        </div>
                    </div>
                )}
                 <DialogFooter className="sm:justify-between gap-2">
                    <Button variant="ghost" onClick={() => setDialogOpen(null)}>Close</Button>
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
                            <span className="font-mono font-semibold flex items-center gap-2">
                                {selectedWithdrawal.id}
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedWithdrawal.id, 'Withdrawal ID')} />
                            </span>
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
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-semibold break-all">{selectedWithdrawal.destination}</span>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground flex-shrink-0" onClick={() => copyToClipboard(selectedWithdrawal.destination, 'Destination Address')} />
                            </div>
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
    </div>
  )
}

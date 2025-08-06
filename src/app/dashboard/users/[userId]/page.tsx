
'use client';

import { ArrowLeft, CreditCard, DollarSign, Download, Hash, Landmark, MoreVertical, Percent, Shield, User, UserCheck, UserX, Wallet, Copy, MinusCircle, PlusCircle, Briefcase, Mail, Phone, Calendar, ShieldCheck as ShieldIcon, LogIn, LayoutGrid, KeyRound, Trash2, Settings, ArrowRight, Users as UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
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
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, collection, query, where, getDocs } from "firebase/firestore";
import { type Customer, getAllCustomers } from '@/lib/customersData';

type Transaction = {
    id: string;
    amount: string;
    currency: string;
    method: string;
    status: string;
    date: Date;
    merchantId?: string; // Add merchantId for filtering
};

const allTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
    id: `UVRLP${111111111 + i}`,
    amount: (Math.random() * 500).toFixed(2),
    currency: i % 2 === 0 ? "USD" : "INR",
    method: ["Crypto", "UPI", "Page", "Link"][i % 4],
    status: ["Success", "Failed", "Pending"][i % 3],
    date: new Date(2023, i % 12, (i % 28) + 1),
    merchantId: `user_${(i % 5) + 1}`, // Assign to one of 5 mock users
}));


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
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [merchantCount, setMerchantCount] = useState(0);
  
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
  
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [walletAdjustment, setWalletAdjustment] = useState({ amount: '', type: 'credit' });

  const [txCurrentPage, setTxCurrentPage] = useState(1);
  const [wdCurrentPage, setWdCurrentPage] = useState(1);
  const [custCurrentPage, setCustCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [joinedDate, setJoinedDate] = useState('N/A');

  const formattedUserId = useMemo(() => {
    if (!userId) return '';
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    const shortId = Math.abs(hash).toString().substring(0, 8).padEnd(8, '0');
    return `UVPAYM${shortId}`;
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
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

            if (userData.role === 'admin') {
                const merchantsQuery = query(collection(db, "users"), where("role", "==", "merchant"));
                const merchantsSnapshot = await getDocs(merchantsQuery);
                setMerchantCount(merchantsSnapshot.size);
            } else {
                const allCustomers = await getAllCustomers();
                const merchantCustomers = allCustomers.filter(c => c.merchantId === userId);
                setCustomers(merchantCustomers);
            }

        } else {
            setMerchant(null);
            notFound();
        }
        setLoading(false);
    };

    fetchUserData();
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

  const handleTransactionRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen('transaction');
  };
  
  const handleWithdrawalRowClick = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setDialogOpen('withdrawalDetail');
  };

  const userTransactions = useMemo(() => {
      if (!userId) return [];
      return allTransactions.filter(tx => tx.merchantId === userId);
  }, [userId]);

  const paginatedTransactions = useMemo(() => {
    return userTransactions.slice(
        (txCurrentPage - 1) * itemsPerPage,
        txCurrentPage * itemsPerPage
    );
}, [userTransactions, txCurrentPage]);

const txTotalPages = useMemo(() => {
    return Math.ceil(userTransactions.length / itemsPerPage);
}, [userTransactions]);
  
  const paginatedWithdrawals = useMemo(() => {
      return withdrawalHistory.slice(0, itemsPerPage);
  }, []);

  const wdTotalPages = Math.ceil(withdrawalHistory.length / itemsPerPage);

  const paginatedCustomers = useMemo(() => {
    return customers.slice(
        (custCurrentPage - 1) * itemsPerPage,
        custCurrentPage * itemsPerPage
    );
  }, [customers, custCurrentPage]);

  const custTotalPages = useMemo(() => {
      return Math.ceil(customers.length / itemsPerPage);
  }, [customers]);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };
  
  const handleWalletAdjustment = async () => {
      if (!merchant || !auth.currentUser || !walletAdjustment.amount) return;
      const amount = parseFloat(walletAdjustment.amount);
      if (isNaN(amount) || amount <= 0) {
          toast({ variant: 'destructive', title: 'Invalid Amount' });
          return;
      }

      const result = await adjustWalletBalance(merchant.id, amount, walletAdjustment.type as 'credit' | 'debit', auth.currentUser.uid);
      if (result.success) {
          toast({ title: 'Wallet Adjusted', description: `Successfully performed a ${walletAdjustment.type} of $${amount}.` });
          setWalletAdjustment({ amount: '', type: 'credit' });
          // Note: In a real app, you would also refetch the wallet balance here.
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
  }

  const successRate = useMemo(() => {
      if (userTransactions.length === 0) return "0.0%";
      const successfulTxns = userTransactions.filter(tx => tx.status === 'Success').length;
      return `${((successfulTxns / userTransactions.length) * 100).toFixed(1)}%`;
  }, [userTransactions]);


  if (loading) {
    return <div className="flex-grow flex items-center justify-center">Loading user details...</div>;
  }
  
  if (!merchant) {
    return <div className="flex-grow flex items-center justify-center">User not found.</div>;
  }

  const isAdminProfile = merchant.role === 'admin';

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
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{merchant.fullName}</h1>
                        <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                           <Hash className="h-4 w-4" />
                           {formattedUserId}
                           <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(formattedUserId, 'Merchant ID')} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="default" variant="outline">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Actions
                                <MoreVertical className="h-4 w-4 ml-2" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {merchant.role === 'admin' ? (
                                    <>
                                        <DropdownMenuItem>
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={handleToggleSuspend}>
                                        {merchant.status === 'Active' ? <UserX className="mr-2 h-4 w-4"/> : <UserCheck className="mr-2 h-4 w-4"/>}
                                        {merchant.status === 'Active' ? 'Suspend Merchant' : 'Unsuspend Merchant'}
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem>
                                            <Briefcase className="mr-2 h-4 w-4" />
                                            Change Plan
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <KeyRound className="mr-2 h-4 w-4" />
                                            Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Merchant
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {merchant.email} <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(merchant.email, 'Email')} /></span>
                    {merchant.mobile && <span className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {merchant.mobile} <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(merchant.mobile!, 'Mobile Number')} /></span>}
                    {merchant.businessName && <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> {merchant.businessName}</span>}
                </div>
                 <div className="flex items-center gap-4 mt-2">
                    <Badge variant={getStatusBadgeVariant(merchant.status)}>
                        {merchant.status === 'Active' ? <UserCheck className="mr-1 h-3 w-3" /> : <UserX className="mr-1 h-3 w-3" />}
                        {merchant.status}
                    </Badge>
                    <Badge variant="secondary"><Briefcase className="mr-1 h-3 w-3" /> Plan: {merchant.plan || 'Free'}</Badge>
                    <Badge variant={merchant.role === 'admin' ? 'destructive' : 'outline'}>
                        <Shield className="mr-1 h-3 w-3" />
                        Role: {merchant.role || 'merchant'}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(merchant.kycStatus || 'Not Started')}>
                        <ShieldIcon className="mr-1 h-3 w-3" />
                        KYC: {merchant.kycStatus || 'Not Started'}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Joined: {joinedDate}</span>
                </div>
            </div>
        </div>
        
        <Tabs defaultValue="overview">
            <TabsList className="gap-2">
                <TabsTrigger value="overview" className="gap-2"><LayoutGrid className="h-4 w-4" />Overview</TabsTrigger>
                {isAdminProfile ? (
                     <>
                        <TabsTrigger value="transactions" className="gap-2" asChild><Link href="/dashboard/transactions">All Transactions</Link></TabsTrigger>
                        <TabsTrigger value="customers" className="gap-2" asChild><Link href="/dashboard/customers">All Customers</Link></TabsTrigger>
                        <TabsTrigger value="withdrawals" className="gap-2" asChild><Link href="/dashboard/withdrawals">All Withdrawals</Link></TabsTrigger>
                    </>
                ) : (
                    <>
                        <TabsTrigger value="transactions" className="gap-2"><CreditCard className="h-4 w-4" />Transactions</TabsTrigger>
                        <TabsTrigger value="customers" className="gap-2"><UsersIcon className="h-4 w-4" />Customers</TabsTrigger>
                        <TabsTrigger value="withdrawals" className="gap-2"><Landmark className="h-4 w-4" />Withdrawals</TabsTrigger>
                        <TabsTrigger value="wallet" className="gap-2"><Wallet className="h-4 w-4" />Wallet Management</TabsTrigger>
                    </>
                )}
            </TabsList>
            <TabsContent value="overview" className="mt-4 space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card asChild>
                         <Link href={`/dashboard/users/${userId}/transactions/by-month/all`} className="cursor-pointer hover:bg-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">$4,523.89</div>
                                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card asChild>
                       <Link href={`/dashboard/users/${userId}/transactions/by-month/all`} className="cursor-pointer hover:bg-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Successful Transactions</CardTitle>
                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+{userTransactions.filter(t => t.status === 'Success').length}</div>
                                <p className="text-xs text-muted-foreground">+18.1% from last month</p>
                            </CardContent>
                        </Link>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">All Customers</CardTitle>
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{customers.length}</div>
                            <p className="text-xs text-muted-foreground">+2 since last month</p>
                        </CardContent>
                    </Card>
                    {isAdminProfile ? (
                        <Card asChild>
                             <Link href="/dashboard/users" className="cursor-pointer hover:bg-muted/50">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">All Merchants</CardTitle>
                                    <UsersIcon className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{merchantCount}</div>
                                    <p className="text-xs text-muted-foreground">Total merchants on the platform.</p>
                                </CardContent>
                            </Link>
                        </Card>
                    ) : (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                                <Percent className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{successRate}</div>
                                <p className="text-xs text-muted-foreground">+1.2% from last month</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Transactions</CardTitle>
                            <CardDescription>This merchant's 5 most recent transactions.</CardDescription>
                        </div>
                        <Button asChild variant="outline">
                            <Link href="#">
                                View All <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
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
                                {userTransactions.slice(0, 5).map(p => (
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
                                {userTransactions.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No transactions found for this merchant.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
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
                                {paginatedTransactions.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No transactions found for this merchant.
                                        </TableCell>
                                    </TableRow>
                                )}
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
              <TabsContent value="customers" className="mt-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Merchant's Customers</CardTitle>
                        <CardDescription>A list of all customers who have transacted with this merchant.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Transactions</TableHead>
                                    <TableHead className="text-right">Total Spent</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedCustomers.map(customer => (
                                    <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/customers/${customer.id}`)}>
                                        <TableCell>
                                            <div className="font-medium">{customer.name}</div>
                                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                                        </TableCell>
                                        <TableCell>{customer.transactions}</TableCell>
                                        <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                                {paginatedCustomers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center">
                                            No customers found for this merchant.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                         <div className="flex justify-between items-center w-full">
                            <div className="text-xs text-muted-foreground">
                                Page {custCurrentPage} of {custTotalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setCustCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={custCurrentPage === 1}
                                >
                                    Previous
                                </Button>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setCustCurrentPage(prev => Math.min(prev + 1, custTotalPages))}
                                    disabled={custCurrentPage === custTotalPages}
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
                        <CardDescription>Manually adjust the wallet balance for this merchant. These actions are logged.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Card>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">Current Wallet Balance</p>
                                    {/* This is a placeholder value. A real app would fetch this from the database. */}
                                    <p className="text-3xl font-bold">$1,234.56</p>
                                </div>
                                 <Wallet className="h-12 w-12 text-muted-foreground" />
                            </CardContent>
                        </Card>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <Label htmlFor="adjustment-amount">Adjustment Amount (USD)</Label>
                                <Input 
                                    id="adjustment-amount" 
                                    type="number" 
                                    placeholder="e.g., 50.00" 
                                    value={walletAdjustment.amount}
                                    onChange={(e) => setWalletAdjustment({...walletAdjustment, amount: e.target.value})}
                                />
                            </div>
                            <div className="space-y-4">
                                <Label>Action Type</Label>
                                <div className="flex gap-2">
                                     <Button 
                                        variant={walletAdjustment.type === 'credit' ? 'default' : 'outline'} 
                                        className="w-full"
                                        onClick={() => setWalletAdjustment({...walletAdjustment, type: 'credit'})}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4"/> Credit (Add)
                                    </Button>
                                     <Button 
                                        variant={walletAdjustment.type === 'debit' ? 'destructive' : 'outline'} 
                                        className="w-full"
                                        onClick={() => setWalletAdjustment({...walletAdjustment, type: 'debit'})}
                                    >
                                         <MinusCircle className="mr-2 h-4 w-4"/> Debit (Subtract)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleWalletAdjustment} disabled={!walletAdjustment.amount}>Apply Adjustment</Button>
                    </CardFooter>
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

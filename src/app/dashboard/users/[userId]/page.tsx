
'use client';

import { ArrowLeft, CreditCard, DollarSign, Download, Hash, Landmark, MoreVertical, Percent, Shield, User, UserCheck, UserX, Wallet, Copy, MinusCircle, PlusCircle, Briefcase, Mail, Phone, Calendar, ShieldCheck as ShieldIcon, LogIn, LayoutGrid, KeyRound, Trash2, Settings } from "lucide-react";
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
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, Timestamp } from "firebase/firestore";

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

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
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
                                <DropdownMenuItem onClick={() => handleRoleChange(merchant.role === 'admin' ? 'merchant' : 'admin')}>
                                    <ShieldIcon className="mr-2 h-4 w-4" />
                                    {merchant.role === 'admin' ? 'Make Merchant' : 'Make Admin'}
                                </DropdownMenuItem>
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
        
        <Tabs defaultValue="transactions">
            <TabsList>
                <TabsTrigger value="transactions" className="gap-2"><CreditCard className="h-4 w-4" />Transactions</TabsTrigger>
                <TabsTrigger value="withdrawals" className="gap-2"><Landmark className="h-4 w-4" />Withdrawals</TabsTrigger>
            </TabsList>
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

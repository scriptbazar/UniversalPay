
'use client';

import { ArrowLeft, Copy, User as UserIcon, CreditCard, Image as ImageIcon, Mail, Landmark, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type Transaction = { 
    id: string; 
    merchant: string; 
    merchantId: string;
    merchantEmail: string; // Added for details
    amount: string; 
    date: string; 
    month: string; 
    status: 'Successful' | 'Failed';
    method: string; // Added for details
};
type User = { 
    id: string; 
    name: string; 
    email: string; 
    avatar: string; 
    joined: string; 
    month: string;
    status: 'Active' | 'Suspended';
    plan: 'Free' | 'Pro' | 'Premium';
};

const generateMockData = () => {
    const months = ["jan", "feb", "mar", "apr", "may", "jun"];
    const users: User[] = [];
    const transactions: Transaction[] = [];
    const plans: User['plan'][] = ['Free', 'Pro', 'Premium'];

    for (let i = 0; i < 50; i++) {
        const monthIndex = i % 6;
        const month = months[monthIndex];
        users.push({
            id: `user_${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i+1}@example.com`,
            avatar: `https://placehold.co/40x40.png?text=U${i+1}`,
            joined: new Date(2023, monthIndex, (i % 28) + 1).toLocaleDateString(),
            month: month,
            status: Math.random() > 0.1 ? 'Active' : 'Suspended',
            plan: plans[i % 3]
        });
    }

    const methods = ["UPI", "Crypto", "Page", "Link"];
    for (let i = 0; i < 150; i++) {
         const monthIndex = i % 6;
         const month = months[monthIndex];
         const success = Math.random() > 0.2;
         const merchantIndex = i % 10 + 1;
         transactions.push({
            id: `txn_${i + 1}`,
            merchant: `Merchant ${merchantIndex}`,
            merchantId: `user_${merchantIndex}`,
            merchantEmail: `merchant${merchantIndex}@example.com`,
            amount: (Math.random() * 200 + 10).toFixed(2),
            date: new Date(2023, monthIndex, (i % 28) + 1).toLocaleDateString(),
            month: month,
            status: success ? 'Successful' : 'Failed',
            method: methods[i % 4],
         });
    }

    return { users, transactions };
};


type DetailDialogContent = {
    type: 'user' | 'transaction';
    data: User | Transaction;
} | null;

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Successful': 
        case 'Active':
            return 'default';
        case 'Failed': 
        case 'Suspended':
            return 'destructive';
        default: return 'secondary';
    }
};

export default function AnalyticsDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const slug = params.slug as string;
    
    const [title, setTitle] = useState('');
    const [data, setData] = useState<(User | Transaction)[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [dialogContent, setDialogContent] = useState<DetailDialogContent>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    useEffect(() => {
        if (!slug) return;

        // Generate data on the client side to avoid hydration issues
        const { users, transactions } = generateMockData();

        const [type, month] = slug.split('_');
        
        let pageTitle = '';
        let fetchedData: (User | Transaction)[] = [];
        let tableColumns: any[] = [];
        
        const monthName = month ? month.charAt(0).toUpperCase() + month.slice(1) : 'All';
        
        switch(type) {
            case 'new-users':
                pageTitle = `New Users in ${monthName}`;
                fetchedData = users.filter(u => month === 'all' || u.month === month);
                tableColumns = [
                    { header: 'Merchant', accessor: 'name' },
                    { header: 'Joined On', accessor: 'joined' },
                    { header: 'Plan', accessor: 'plan' },
                    { header: 'Status', accessor: 'status' },
                ];
                break;
            case 'total-transactions':
                pageTitle = `Total Transactions in ${monthName}`;
                fetchedData = transactions.filter(t => month === 'all' || t.month === month);
                 tableColumns = [
                    { header: 'Transaction ID', accessor: 'id' },
                    { header: 'Merchant', accessor: 'merchant' },
                    { header: 'Date', accessor: 'date' },
                    { header: 'Status', accessor: 'status' },
                    { header: 'Amount', accessor: 'amount', isNumeric: true },
                ];
                break;
            case 'successful-transactions':
                pageTitle = `Successful Transactions in ${monthName}`;
                fetchedData = transactions.filter(t => t.status === 'Successful' && (month === 'all' || t.month === month));
                tableColumns = [
                    { header: 'Transaction ID', accessor: 'id' },
                    { header: 'Merchant', accessor: 'merchant' },
                    { header: 'Date', accessor: 'date' },
                    { header: 'Amount', accessor: 'amount', isNumeric: true },
                ];
                break;
            case 'new-merchants': // from stat card
                 pageTitle = 'All New Merchants';
                 fetchedData = users;
                 tableColumns = [
                    { header: 'Merchant', accessor: 'name' },
                    { header: 'Joined On', accessor: 'joined' },
                    { header: 'Plan', accessor: 'plan' },
                    { header: 'Status', accessor: 'status' },
                ];
                 break;
        }

        setTitle(pageTitle);
        setData(fetchedData);
        setColumns(tableColumns);
    }, [slug]);
    
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const paginatedData = data.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    const handleRowClick = (item: User | Transaction) => {
        if ('email' in item && 'joined' in item) { // It's a User
            setDialogContent({ type: 'user', data: item });
        } else { // It's a Transaction
            setDialogContent({ type: 'transaction', data: item as Transaction });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: `${label} Copied!` });
    };

    return (
        <div className="space-y-6">
            <Link href="/dashboard/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">{title}</CardTitle>
                    <CardDescription>A list of all records for this metric. Click a row for details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map(col => (
                                    <TableHead key={col.accessor} className={col.isNumeric ? 'text-right' : ''}>
                                        {col.header}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.map((item) => (
                                <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-muted/50">
                                    {columns.map(col => (
                                        <TableCell key={col.accessor} className={col.isNumeric ? 'text-right' : ''}>
                                            {col.accessor === 'name' || col.accessor === 'merchant' ? (
                                                <div className="flex items-center gap-2">
                                                    <Image src={'avatar' in item ? (item as User).avatar : `https://placehold.co/40x40.png?text=M`} alt={(item as any).name || (item as any).merchant} width={40} height={40} className="rounded-full" data-ai-hint="user avatar" />
                                                    <div>
                                                        <p className="font-medium">{(item as any).name || (item as any).merchant}</p>
                                                        <p className="text-xs text-muted-foreground">{'email' in item ? (item as User).email : (item as Transaction).merchantEmail}</p>
                                                    </div>
                                                </div>
                                            ) : col.accessor === 'status' ? (
                                                <Badge variant={getStatusBadgeVariant((item as any).status)}>
                                                    {(item as any).status}
                                                </Badge>
                                             ) : col.accessor === 'plan' ? (
                                                <Badge variant="secondary">
                                                    {(item as User).plan}
                                                </Badge>
                                            ) : col.accessor === 'amount' ? (
                                                `$${(item as Transaction).amount}`
                                            ) : (
                                                (item as any)[col.accessor]
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {data.length === 0 && (
                        <p className="p-4 text-center text-muted-foreground">No data found.</p>
                    )}
                </CardContent>
                 <div className="p-4 border-t flex justify-between items-center w-full">
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
            </Card>

            <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogContent?.type === 'user' ? 'Merchant Details' : 'Transaction Details'}
                        </DialogTitle>
                         <DialogDescription>
                            Full details for this record.
                        </DialogDescription>
                    </DialogHeader>
                    {dialogContent?.type === 'user' && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Image src={(dialogContent.data as User).avatar} alt={(dialogContent.data as User).name} width={64} height={64} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <h3 className="text-lg font-semibold">{(dialogContent.data as User).name}</h3>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground">{(dialogContent.data as User).email}</p>
                                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard((dialogContent.data as User).email, 'Email')} />
                                    </div>
                                     <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>ID: {(dialogContent.data as User).id}</span>
                                        <Copy className="h-3 w-3 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard((dialogContent.data as User).id, 'User ID')} />
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-muted-foreground"/> <span>Status:</span> <Badge variant={getStatusBadgeVariant((dialogContent.data as User).status)}>{(dialogContent.data as User).status}</Badge></div>
                                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground"/> <span>Plan:</span> <span className="font-semibold">{(dialogContent.data as User).plan}</span></div>
                                <div className="flex justify-between items-center col-span-2">
                                    <span className="text-muted-foreground">Joined On:</span>
                                    <span className="font-semibold">{(dialogContent.data as User).joined}</span>
                                </div>
                            </div>
                        </div>
                    )}
                     {dialogContent?.type === 'transaction' && (
                        <div className="py-4 space-y-4">
                           <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Transaction ID:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">{dialogContent.data.id}</span>
                                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(dialogContent.data.id, 'Transaction ID')} />
                                </div>
                            </div>
                            <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Merchant:</span>
                                <div className="text-right">
                                    <p className="font-semibold">{(dialogContent.data as Transaction).merchant}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground">{(dialogContent.data as Transaction).merchantEmail}</p>
                                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard((dialogContent.data as Transaction).merchantEmail, 'Email')} />
                                    </div>
                                </div>
                            </div>
                             <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-semibold">${(dialogContent.data as Transaction).amount}</span>
                            </div>
                            <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Method:</span>
                                <span className="font-semibold">{(dialogContent.data as Transaction).method}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={getStatusBadgeVariant((dialogContent.data as Transaction).status)}>{(dialogContent.data as Transaction).status}</Badge>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Date:</span>
                                <span className="font-semibold">{(dialogContent.data as Transaction).date}</span>
                            </div>
                        </div>
                    )}
                    <DialogFooter className="sm:justify-between gap-2">
                         <Button variant="ghost" onClick={() => setDialogContent(null)}>Close</Button>
                         {(dialogContent?.type === 'transaction' || dialogContent?.type === 'user') && (
                            <Button asChild>
                                <Link href={`/dashboard/users/${(dialogContent.data as any).merchantId || (dialogContent.data as any).id}`}>View Full Profile</Link>
                            </Button>
                         )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}


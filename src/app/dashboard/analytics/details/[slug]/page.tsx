
'use client';

import { ArrowLeft, Copy, User as UserIcon, CreditCard, Image as ImageIcon, Mail, Landmark, ShieldCheck, FileText } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";

type Transaction = {
    id: string;
    merchant: string; // This will now be merchantId
    merchantId: string;
    merchantEmail: string;
    amount: string;
    date: string;
    month: string;
    status: 'Successful' | 'Failed' | 'Pending';
    method: string;
};
type User = {
    id: string;
    fullName: string;
    email: string;
    avatar: string;
    createdAt: Timestamp;
    month: string;
    status: 'Active' | 'Suspended';
    plan: 'Free' | 'Pro' | 'Premium';
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
        case 'Pending':
            return 'destructive';
        default: return 'secondary';
    }
};

// Helper to format date and extract month
const formatDateAndMonth = (timestamp: Timestamp | Date) => {
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    const month = date.toLocaleString('default', { month: 'short' }).toLowerCase();
    const dateString = date.toLocaleDateString();
    return { dateString, month };
};

function AnalyticsDetailPageContent() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const slug = params.slug as string;
    const source = searchParams.get('source');
    const linkTitle = searchParams.get('title');

    const [title, setTitle] = useState('');
    const [data, setData] = useState<(User | Transaction)[]>([]);
    const [columns, setColumns] = useState<any[]>([]);
    const [dialogContent, setDialogContent] = useState<DetailDialogContent>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;

        const fetchData = async () => {
            setLoading(true);
            const [type, month] = slug.split('_');

            let pageTitle = '';
            let fetchedData: (User | Transaction)[] = [];
            let tableColumns: any[] = [];
            const monthName = month && month !== 'all' ? month.charAt(0).toUpperCase() + month.slice(1) : 'All Time';

            try {
                if (type === 'new-users' || type === 'new-merchants') {
                    const usersQuery = query(collection(db, "users"));
                    const usersSnapshot = await getDocs(usersQuery);
                    const allUsers = usersSnapshot.docs.map(doc => {
                        const data = doc.data();
                        const { dateString, month: docMonth } = formatDateAndMonth(data.createdAt);
                        return { id: doc.id, ...data, joined: dateString, month: docMonth } as User;
                    });
                    
                    fetchedData = allUsers.filter(u => month === 'all' || u.month === month);
                    pageTitle = type === 'new-users' ? `New Users in ${monthName}` : 'All New Merchants';
                    tableColumns = [
                        { header: 'Merchant', accessor: 'fullName' },
                        { header: 'Joined On', accessor: 'joined' },
                        { header: 'Plan', accessor: 'plan' },
                        { header: 'Status', accessor: 'status' },
                    ];

                } else if (type.includes('transactions')) {
                    const txQuery = query(collection(db, "transactions"));
                    const txSnapshot = await getDocs(txQuery);
                    const allTransactions = txSnapshot.docs.map(doc => {
                         const data = doc.data();
                         const { dateString, month: docMonth } = formatDateAndMonth(data.date);
                         return { id: doc.id, ...data, date: dateString, month: docMonth, merchant: data.merchantId } as Transaction;
                    });

                    let filteredTransactions = allTransactions;
                    if (type === 'successful-transactions') {
                        pageTitle = linkTitle ? `Successful Transactions for '${linkTitle}'` : `Successful Transactions in ${monthName}`;
                        filteredTransactions = allTransactions.filter(t => t.status === 'Successful');
                    } else {
                        pageTitle = `Total Transactions in ${monthName}`;
                    }

                    fetchedData = filteredTransactions.filter(t => month === 'all' || t.month === month);
                     tableColumns = [
                        { header: 'Transaction ID', accessor: 'id' },
                        { header: 'Merchant', accessor: 'merchantId' },
                        { header: 'Date', accessor: 'date' },
                        { header: 'Method', accessor: 'method' },
                        { header: 'Status', accessor: 'status' },
                        { header: 'Amount', accessor: 'amount', isNumeric: true },
                    ];
                }

                setTitle(pageTitle);
                setData(fetchedData);
                setColumns(tableColumns);

            } catch (error) {
                console.error("Error fetching data:", error);
                toast({ variant: "destructive", title: "Error", description: "Could not fetch analytics details." });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [slug, linkTitle, toast]);

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

    const backLink = source === 'payment-links' ? '/merchant/payment-links' : '/dashboard/analytics';
    const backLinkText = source === 'payment-links' ? 'Back to All Payment Links' : 'Back to Analytics';


    return (
        <div className="space-y-6">
            <Link href={backLink} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                {backLinkText}
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
                            {loading ? (
                                <TableRow><TableCell colSpan={columns.length} className="text-center h-24">Loading data...</TableCell></TableRow>
                            ) : paginatedData.map((item) => (
                                <TableRow key={item.id} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-muted/50">
                                    {columns.map(col => (
                                        <TableCell key={col.accessor} className={col.isNumeric ? 'text-right' : ''}>
                                            {col.accessor === 'fullName' || col.accessor === 'merchantId' ? (
                                                <div className="flex items-center gap-2">
                                                    <Image src={'avatar' in item ? (item as User).avatar : `https://placehold.co/40x40.png?text=M`} alt={(item as any).fullName || (item as any).merchant} width={40} height={40} className="rounded-full" data-ai-hint="user avatar" />
                                                    <div>
                                                        <p className="font-medium">{(item as any).fullName || (item as any).merchantId}</p>
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
                    {!loading && data.length === 0 && (
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
                                <Image src={(dialogContent.data as User).avatar} alt={(dialogContent.data as User).fullName} width={64} height={64} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <h3 className="text-lg font-semibold">{(dialogContent.data as User).fullName}</h3>
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
                                    <span className="font-semibold">{(dialogContent.data as User).createdAt.toDate().toLocaleDateString()}</span>
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
                                    <p className="font-semibold">{(dialogContent.data as Transaction).merchantId}</p>
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

export default function AnalyticsDetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AnalyticsDetailPageContent />
        </Suspense>
    )
}

    
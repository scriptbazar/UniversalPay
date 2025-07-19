
'use client';

import { ArrowLeft, Copy, User as UserIcon, CreditCard, Image as ImageIcon } from "lucide-react";
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

// --- MOCK DATA ---
const allMockTransactions = Array.from({ length: 6 * 50 }, (_, i) => {
    const monthIndex = Math.floor(i / 50);
    const months = ["jan", "feb", "mar", "apr", "may", "jun"];
    const success = i % 5 !== 0; // Make some fail
    return {
        id: `txn_${i + 1}`,
        merchant: `Merchant ${i % 4 + 1}`,
        amount: (Math.random() * 500 + 10).toFixed(2),
        date: `2023-10-${28-Math.floor(i/2)}`,
        month: months[monthIndex],
        status: success ? 'Successful' : 'Failed'
    }
});

const mockNewMerchants = Array.from({ length: 12 }, (_, i) => {
    const monthIndex = i % 6;
    const months = ["jan", "feb", "mar", "apr", "may", "jun"];
    return {
    id: `user_${i + 1}`,
    name: `Merchant ${i + 1}`,
    email: `merchant${i + 1}@example.com`,
    avatar: `https://placehold.co/40x40.png?text=M${i+1}`,
    joined: `2023-10-${28-i}`,
    month: months[monthIndex],
}});

type Transaction = typeof allMockTransactions[0];
type User = typeof mockNewMerchants[0];
// --- END MOCK DATA ---

type DetailDialogContent = {
    type: 'user' | 'transaction';
    data: User | Transaction;
} | null;

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Successful': return 'default';
        case 'Failed': return 'destructive';
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
        
        const [type, month] = slug.split('_');
        const monthMap: { [key: string]: number } = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5 };
        const monthIndex = monthMap[month];
        
        let pageTitle = '';
        let fetchedData: (User | Transaction)[] = [];
        let tableColumns: any[] = [];
        
        const monthName = month.charAt(0).toUpperCase() + month.slice(1);
        
        switch(type) {
            case 'new-users':
                pageTitle = `New Users in ${monthName}`;
                fetchedData = mockNewMerchants.filter(u => month === 'all' || u.month === month);
                tableColumns = [
                    { header: 'Merchant', accessor: 'name' },
                    { header: 'Joined On', accessor: 'joined' },
                ];
                break;
            case 'total-transactions':
                pageTitle = `Total Transactions in ${monthName}`;
                fetchedData = allMockTransactions.filter(t => month === 'all' || t.month === month);
                 tableColumns = [
                    { header: 'Transaction ID', accessor: 'id' },
                    { header: 'Status', accessor: 'status' },
                    { header: 'Amount', accessor: 'amount', isNumeric: true },
                ];
                break;
            case 'successful-transactions':
                pageTitle = `Successful Transactions in ${monthName}`;
                fetchedData = allMockTransactions.filter(t => t.status === 'Successful' && (month === 'all' || t.month === month));
                tableColumns = [
                    { header: 'Transaction ID', accessor: 'id' },
                    { header: 'Merchant', accessor: 'merchant' },
                    { header: 'Amount', accessor: 'amount', isNumeric: true },
                ];
                break;
            case 'new-merchants': // from stat card
                 pageTitle = 'All New Merchants';
                 fetchedData = mockNewMerchants;
                 tableColumns = [
                    { header: 'Merchant', accessor: 'name' },
                    { header: 'Joined On', accessor: 'joined' },
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
        if ('email' in item) { // It's a User
            setDialogContent({ type: 'user', data: item });
        } else { // It's a Transaction
            setDialogContent({ type: 'transaction', data: item });
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
                                            {col.accessor === 'name' ? (
                                                <div className="flex items-center gap-2">
                                                    <Image src={(item as User).avatar} alt={(item as User).name} width={40} height={40} className="rounded-full" data-ai-hint="user avatar" />
                                                    <div>
                                                        <p className="font-medium">{(item as User).name}</p>
                                                        <p className="text-xs text-muted-foreground">{(item as User).email}</p>
                                                    </div>
                                                </div>
                                            ) : col.accessor === 'status' ? (
                                                <Badge variant={getStatusBadgeVariant((item as Transaction).status)}>
                                                    {(item as Transaction).status}
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
                    </DialogHeader>
                    {dialogContent?.type === 'user' && (
                        <div className="py-4 space-y-4">
                            <div className="flex items-center gap-4">
                                <Image src={(dialogContent.data as User).avatar} alt={(dialogContent.data as User).name} width={64} height={64} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <h3 className="text-lg font-semibold">{(dialogContent.data as User).name}</h3>
                                    <p className="text-sm text-muted-foreground">{(dialogContent.data as User).email}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Joined On:</span>
                                <span className="font-semibold">{(dialogContent.data as User).joined}</span>
                            </div>
                        </div>
                    )}
                     {dialogContent?.type === 'transaction' && (
                        <div className="py-4 space-y-4">
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Transaction ID:</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono">{(dialogContent.data as Transaction).id}</span>
                                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard((dialogContent.data as Transaction).id, 'Transaction ID')} />
                                </div>
                            </div>
                             <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Amount:</span>
                                <span className="font-semibold">${(dialogContent.data as Transaction).amount}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status:</span>
                                <Badge variant={getStatusBadgeVariant((dialogContent.data as Transaction).status)}>{(dialogContent.data as Transaction).status}</Badge>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogContent(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

    
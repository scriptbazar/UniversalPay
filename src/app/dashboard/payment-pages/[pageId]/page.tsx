
'use client';

import { ArrowLeft, CreditCard, DollarSign, Shield, Link2, ExternalLink, User, Copy, Calendar, Mail, AppWindow, BadgeEuro } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPaymentLinkBySlug, type PaymentLink } from "@/lib/paymentLinksData";
import { notFound } from "next/navigation";

type Transaction = {
    id: string;
    customer: string;
    amount: string;
    currency: string;
    status: "Success" | "Flagged" | "Failed";
    date: string;
};

const allTransactions: Transaction[] = [
    { id: "UVRLP101101101", customer: "customer_a@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-05" },
    { id: "UVRLP102102102", customer: "customer_b@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-05" },
    { id: "UVRLP103103103", customer: "customer_c@mail.com", amount: "50.00", currency: "USD", status: "Flagged", date: "2023-11-04" },
    { id: "UVRLP104104104", customer: "customer_d@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-04" },
    { id: "UVRLP105105105", customer: "customer_e@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-03" },
    { id: "UVRLP106106106", customer: "customer_f@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-03" },
    { id: "UVRLP107107107", customer: "suspicious_user@mail.com", amount: "1500.00", currency: "USD", status: "Flagged", date: "2023-11-02" },
];

const successfulTransactions = allTransactions.filter(tx => tx.status === 'Success');
const fraudulentTransactions = allTransactions.filter(tx => tx.status === 'Flagged');

const getStatusBadgeVariant = (status: Transaction["status"]) => {
    switch (status) {
        case 'Success':
            return 'default';
        case 'Flagged':
            return 'destructive';
        case 'Failed':
            return 'secondary';
        default:
            return 'outline';
    }
};

export default function PaymentPageDetailPage({ params }: { params: { pageId: string } }) {
  const { toast } = useToast();
  const [linkDetails, setLinkDetails] = useState<PaymentLink | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [dialogContent, setDialogContent] = useState<{ title: string; description: string; data: React.ReactNode } | null>(null);


  useEffect(() => {
    const link = getPaymentLinkBySlug(params.pageId);
    if (link) {
      setLinkDetails(link);
    } else {
        notFound();
    }
  }, [params.pageId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handleTransactionRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }
  
  if (!linkDetails) {
    // This can be a loading state in a real app
    return null;
  }
  
  const totalVolume = linkDetails.payments * (linkDetails.amount || 50);
  const averagePayment = linkDetails.payments > 0 ? totalVolume / linkDetails.payments : 0;
  
  const handleCardClick = (type: 'volume' | 'payments' | 'avg' | 'fraud') => {
    switch (type) {
        case 'volume':
        case 'payments':
            setDialogContent({
                title: "Successful Payments",
                description: "A list of all successful payments made via this page.",
                data: (
                    <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {successfulTransactions.map(tx => <TableRow key={tx.id} onClick={() => handleTransactionRowClick(tx)} className="cursor-pointer">
                                <TableCell>{tx.id}</TableCell>
                                <TableCell>{tx.customer}</TableCell>
                                <TableCell className="text-right">${tx.amount}</TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                )
            });
            break;
        case 'avg':
             setDialogContent({
                title: "Average Payment Value",
                description: "This is the average value of all successful payments.",
                 data: (
                    <div className="space-y-2 text-center p-4">
                        <p className="text-4xl font-bold">${averagePayment.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">Calculated from {successfulTransactions.length} successful payments totalling ${totalVolume.toFixed(2)}.</p>
                    </div>
                 )
            });
            break;
        case 'fraud':
             setDialogContent({
                title: "Fraud Alerts",
                description: "A list of all payments flagged for suspicious activity.",
                data: (
                     <Table>
                        <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Customer</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {fraudulentTransactions.map(tx => <TableRow key={tx.id} onClick={() => handleTransactionRowClick(tx)} className="cursor-pointer">
                                <TableCell>{tx.id}</TableCell>
                                <TableCell>{tx.customer}</TableCell>
                                <TableCell className="text-right">${tx.amount}</TableCell>
                                </TableRow>)}
                        </TableBody>
                    </Table>
                )
            });
            break;
    }
  };


  return (
    <div className="space-y-6">
        <Link href="/dashboard/payment-pages" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to All Payment Pages
        </Link>
        
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <AppWindow className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-2xl">{linkDetails.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <a href={linkDetails.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        {linkDetails.url} <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(`${window.location.origin}${linkDetails.url}`, 'Payment Page URL')} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                           <Badge variant={linkDetails.isActive ? 'default' : 'secondary'}>{linkDetails.isActive ? 'Active' : 'Inactive'}</Badge>
                           <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" /> Created: {new Date(linkDetails.createdAt).toLocaleDateString()}</span>
                           <Link href={`/dashboard/users/user_1`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                             <User className="h-4 w-4" /> MyStore.com
                           </Link>
                        </div>
                    </div>
                    <Button variant="outline">Deactivate Page</Button>
                </div>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card onClick={() => handleCardClick('volume')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${totalVolume.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card onClick={() => handleCardClick('payments')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{linkDetails.payments}</div>
                </CardContent>
            </Card>
            <Card onClick={() => handleCardClick('avg')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Payment Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${averagePayment.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card onClick={() => handleCardClick('fraud')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">2</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Transactions via this Page</CardTitle>
                <CardDescription>All payments made using this payment page. Click a row for details.</CardDescription>
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
                        {allTransactions.map(p => (
                            <TableRow key={p.id} onClick={() => handleTransactionRowClick(p)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-medium">{p.id}</TableCell>
                                <TableCell>{p.customer}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                                </TableCell>
                                <TableCell>{p.date}</TableCell>
                                <TableCell className="text-right">${p.amount} {p.currency}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        {/* Dialog for a single transaction detail */}
        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transaction Details</DialogTitle>
                     {selectedTransaction && <DialogDescription>Details for transaction {selectedTransaction.id}</DialogDescription>}
                </DialogHeader>
                {selectedTransaction && (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">ID:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono">{selectedTransaction.id}</span>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.id, 'Transaction ID')} />
                            </div>
                        </div>
                       <div className="flex justify-between items-center">
                           <span className="text-muted-foreground">Customer:</span>
                           <div className="flex items-center gap-2">
                               <span>{selectedTransaction.customer}</span>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.customer, 'Customer Email')} />
                            </div>
                        </div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">${selectedTransaction.amount} {selectedTransaction.currency}</span></div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Date:</span> <span>{selectedTransaction.date}</span></div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge></div>
                    </div>
                )}
                 <DialogFooter className="sm:justify-between gap-2">
                    <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>Close</Button>
                    <Button asChild>
                        <Link href={`/dashboard/users/user_1`}>View Merchant Profile</Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        
        {/* Dialog for Stat Cards */}
        <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>{dialogContent?.title}</DialogTitle>
                    <DialogDescription>{dialogContent?.description}</DialogDescription>
                </DialogHeader>
                <div className="py-4 max-h-[60vh] overflow-y-auto">
                    {dialogContent?.data}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}

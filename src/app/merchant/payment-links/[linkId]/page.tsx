
'use client';

import { ArrowLeft, CreditCard, DollarSign, Shield, Link2, ExternalLink, User, Copy, Calendar, Mail, Eye, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPaymentLinkById, type PaymentLink } from "@/lib/paymentLinksData";
import { getTransactionsBySource, type Transaction } from "@/lib/transactionsData";
import { notFound, useParams, useRouter } from "next/navigation";


const getStatusBadgeVariant = (status: Transaction["status"]) => {
    switch (status) {
        case 'Success':
            return 'default';
        case 'Failed':
            return 'destructive';
        default:
            return 'secondary';
    }
};

export default function PaymentLinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const linkId = params.linkId as string;
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<Transaction | null>(null);
  const [linkDetails, setLinkDetails] = useState<PaymentLink | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const link = await getPaymentLinkById(linkId);
      if (link) {
        setLinkDetails(link);
        const linkTransactions = await getTransactionsBySource(link.id);
        setTransactions(linkTransactions);
      } else {
        notFound();
      }
      setLoading(false);
    }
    fetchData();
  }, [linkId]);

  const copyToClipboard = (text: string, label: string) => {
    const fullUrl = text.startsWith('/') ? `${window.location.origin}${text}` : text;
    navigator.clipboard.writeText(fullUrl);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handlePaymentRowClick = (payment: Transaction) => {
    setSelectedPayment(payment);
  }

  const analytics = useMemo(() => {
    const successfulTxns = transactions.filter(t => t.status === 'Success');
    const totalVolume = successfulTxns.reduce((acc, p) => acc + parseFloat(p.amount), 0);
    const averagePayment = successfulTxns.length > 0 ? (totalVolume / successfulTxns.length).toFixed(2) : "0.00";
    return {
      totalVolume,
      successfulPayments: successfulTxns.length,
      averagePayment
    };
  }, [transactions]);


  if (loading || !linkDetails) {
    return <div>Loading...</div>; // Or a skeleton loader
  }

  return (
    <div className="space-y-6">
        <Link href="/merchant/payment-links" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to All Payment Links
        </Link>
        
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <Link2 className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-2xl">{linkDetails.title}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <a href={linkDetails.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                        {linkDetails.url} <ExternalLink className="h-3 w-3" />
                                    </a>
                                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(linkDetails.url, 'Payment Link')} />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                           <Badge variant={linkDetails.isActive ? 'default' : 'secondary'}>{linkDetails.isActive ? 'Active' : 'Inactive'}</Badge>
                           <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" /> Created: {new Date(linkDetails.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button asChild variant="secondary">
                            <Link href={linkDetails.url} target="_blank">
                                <Eye className="mr-2 h-4 w-4"/> View Link
                            </Link>
                        </Button>
                        <Button variant="outline"><PowerOff className="mr-2 h-4 w-4"/> Deactivate Link</Button>
                    </div>
                </div>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${analytics.totalVolume.toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analytics.successfulPayments}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Payment Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${analytics.averagePayment}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Transactions via this Link</CardTitle>
                <CardDescription>All payments made using this payment link.</CardDescription>
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
                        {transactions.map(p => (
                            <TableRow key={p.id} onClick={() => handlePaymentRowClick(p)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="font-medium">{p.id}</TableCell>
                                <TableCell>{p.customerEmail}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                                </TableCell>
                                <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">${p.amount}</TableCell>
                            </TableRow>
                        ))}
                         {transactions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No transactions found for this link yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                     {selectedPayment && <DialogDescription>Details for transaction {selectedPayment.id}</DialogDescription>}
                </DialogHeader>
                {selectedPayment && (
                    <div className="space-y-4 py-4">
                        <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">ID:</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono">{selectedPayment.id}</span>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedPayment.id, 'Payment ID')} />
                            </div>
                        </div>
                       <div className="flex justify-between items-center">
                           <span className="text-muted-foreground">Customer:</span>
                           <div className="flex items-center gap-2">
                               <span>{selectedPayment.customerEmail}</span>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedPayment.customerEmail, 'Customer Email')} />
                            </div>
                        </div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">${selectedPayment.amount}</span></div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Date:</span> <span>{new Date(selectedPayment.date).toLocaleString()}</span></div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusBadgeVariant(selectedPayment.status)}>{selectedPayment.status}</Badge></div>
                    </div>
                )}
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setSelectedPayment(null)}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

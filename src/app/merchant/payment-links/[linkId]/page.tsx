
'use client';

import { ArrowLeft, CreditCard, DollarSign, Shield, Link2, ExternalLink, User, Copy, Calendar, Mail, Eye, PowerOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getPaymentLinkById, type PaymentLink } from "@/lib/paymentLinksData";
import { notFound } from "next/navigation";


type Payment = {
    id: string;
    customer: string;
    amount: string;
    currency: string;
    status: "Success" | "Flagged" | "Failed";
    date: string;
};

const allPayments: Payment[] = [
    { id: "pay_1", customer: "customer_a@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-10-26" },
    { id: "pay_2", customer: "customer_b@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-10-26" },
    { id: "pay_3", customer: "customer_c@mail.com", amount: "50.00", currency: "USD", status: "Flagged", date: "2023-10-27" },
    { id: "pay_4", customer: "customer_d@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-10-27" },
];

const getStatusBadgeVariant = (status: Payment["status"]) => {
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


export default function PaymentLinkDetailPage({ params }: { params: { linkId: string } }) {
  const { toast } = useToast();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [linkDetails, setLinkDetails] = useState<PaymentLink | null>(null);

  useEffect(() => {
    const link = getPaymentLinkById(params.linkId);
    if (link) {
      setLinkDetails(link);
    } else {
        notFound();
    }
  }, [params.linkId]);

  const copyToClipboard = (text: string, label: string) => {
    const fullUrl = text.startsWith('/') ? `${window.location.origin}${text}` : text;
    navigator.clipboard.writeText(fullUrl);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handlePaymentRowClick = (payment: Payment) => {
    setSelectedPayment(payment);
  }

  if (!linkDetails) {
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

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${(allPayments.filter(p=>p.status === 'Success').reduce((acc, p) => acc + parseFloat(p.amount), 0)).toFixed(2)}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{linkDetails.payments}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{allPayments.filter(p=>p.status === 'Flagged').length}</div>
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
                            <TableHead>Payment ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {allPayments.map(p => (
                            <TableRow key={p.id} onClick={() => handlePaymentRowClick(p)} className="cursor-pointer hover:bg-muted/50">
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

        <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Payment Details</DialogTitle>
                     {selectedPayment && <DialogDescription>Details for payment {selectedPayment.id}</DialogDescription>}
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
                               <span>{selectedPayment.customer}</span>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedPayment.customer, 'Customer Email')} />
                            </div>
                        </div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">${selectedPayment.amount} {selectedPayment.currency}</span></div>
                       <div className="flex justify-between items-center"><span className="text-muted-foreground">Date:</span> <span>{selectedPayment.date}</span></div>
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

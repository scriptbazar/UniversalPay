
'use client';

import { ArrowLeft, CreditCard, DollarSign, Shield, Link2, ExternalLink, User, Copy, Calendar, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const linkDetails = {
    id: "plink_1",
    title: "T-Shirt Sale",
    url: "https://universalpay.com/pay/t-shirt-sale",
    status: "Active",
    merchant: {
        id: "user_1",
        name: "MyStore.com",
    },
    createdAt: "2023-10-26",
    expiresAt: "2023-11-10",
    volume: "3000.00",
    payments: 120,
    fraudAlerts: 2,
};

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


export default function PaymentLinkDetailPage({ params }: { params: { linkId: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const averagePayment = linkDetails.payments > 0 ? (parseFloat(linkDetails.volume) / linkDetails.payments).toFixed(2) : "0.00";

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handleCardClick = (type: 'successful' | 'fraud' | 'avg' | 'volume') => {
     const sourceQuery = '?source=payment-links';
     switch (type) {
         case 'successful':
         case 'volume':
             router.push(`/dashboard/analytics/details/successful-transactions_all${sourceQuery}`);
             break;
         case 'fraud':
             router.push(`/dashboard/fraud-detection`); // Redirect to main fraud page for now
             break;
         case 'avg':
              // Avg value doesn't need a list, can show a dialog or be static
             toast({ title: 'Average Payment Value', description: `$${averagePayment}` });
             break;
     }
  };

  const handleTransactionRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }


  return (
    <div className="space-y-6">
        <Link href="/dashboard/payment-links" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
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
                           <Badge variant={linkDetails.status === 'Active' ? 'default' : 'secondary'}>{linkDetails.status}</Badge>
                           <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4" /> Created: {linkDetails.createdAt}</span>
                            <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4 text-destructive" /> Expires: {linkDetails.expiresAt}</span>
                           <Link href={`/dashboard/users/${linkDetails.merchant.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                             <User className="h-4 w-4" /> {linkDetails.merchant.name}
                           </Link>
                        </div>
                    </div>
                    <Button variant="outline">Deactivate Link</Button>
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
                    <div className="text-2xl font-bold">${linkDetails.volume}</div>
                </CardContent>
            </Card>
            <Card onClick={() => handleCardClick('successful')} className="cursor-pointer hover:bg-muted/50 transition-colors">
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
                    <div className="text-2xl font-bold">${averagePayment}</div>
                </CardContent>
            </Card>
            <Card onClick={() => handleCardClick('fraud')} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Fraud Alerts</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{linkDetails.fraudAlerts}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Transactions via this Link</CardTitle>
                <CardDescription>All payments made using this payment link. Click a row for details.</CardDescription>
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
                        <Link href={`/dashboard/users/${linkDetails.merchant.id}`}>View Merchant Profile</Link>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

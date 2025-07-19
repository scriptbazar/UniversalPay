
'use client';

import { ArrowLeft, CreditCard, DollarSign, Shield, Link2, ExternalLink, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

const linkDetails = {
    id: "plink_1",
    title: "T-Shirt Sale",
    url: "https://transactwave.com/pay/t-shirt-sale",
    status: "Active",
    merchant: {
        id: "user_1",
        name: "MyStore.com",
    },
    createdAt: "2023-10-26",
    volume: "3000.00",
    payments: 120,
    fraudAlerts: 2,
};

const recentTransactions = [
    { id: "pay_101", customer: "customer_a@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-05" },
    { id: "pay_102", customer: "customer_b@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-05" },
    { id: "pay_103", customer: "customer_c@mail.com", amount: "25.00", currency: "USD", status: "Flagged", date: "2023-11-04" },
    { id: "pay_104", customer: "customer_d@mail.com", amount: "25.00", currency: "USD", status: "Success", date: "2023-11-04" },
];

export default function PaymentLinkDetailPage({ params }: { params: { linkId: string } }) {

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
                                <a href={linkDetails.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                                    {linkDetails.url} <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                           <Badge variant={linkDetails.status === 'Active' ? 'default' : 'secondary'}>{linkDetails.status}</Badge>
                           <span className="text-sm text-muted-foreground">Created: {linkDetails.createdAt}</span>
                           <Link href={`/dashboard/users/${linkDetails.merchant.id}`} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
                             <User className="h-4 w-4" /> {linkDetails.merchant.name}
                           </Link>
                        </div>
                    </div>
                    <Button variant="outline">Deactivate Link</Button>
                </div>
            </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${linkDetails.volume}</div>
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
                    <div className="text-2xl font-bold">{linkDetails.fraudAlerts}</div>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest transactions made through this link.</CardDescription>
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
                        {recentTransactions.map(p => (
                            <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.id}</TableCell>
                                <TableCell>{p.customer}</TableCell>
                                <TableCell>
                                    <Badge variant={p.status === 'Success' ? 'default' : p.status === 'Flagged' ? 'destructive' : 'secondary'}>{p.status}</Badge>
                                </TableCell>
                                <TableCell>{p.date}</TableCell>
                                <TableCell className="text-right">${p.amount} {p.currency}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}

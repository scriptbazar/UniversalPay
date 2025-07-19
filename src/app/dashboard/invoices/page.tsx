
'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { type Invoice, getInvoices } from "@/lib/invoicesData";
import { useRouter } from "next/navigation";

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const router = useRouter();

    useEffect(() => {
        setInvoices(getInvoices());
    }, []);

    const handleRowClick = (invoiceId: string) => {
        // In a real app, you might have a different detail view for admin
        // For now, we can just log it or disable it.
        console.log(`Admin viewing invoice: ${invoiceId}`);
        // router.push(`/dashboard/invoices/${invoiceId}`);
    };


  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices and billing history.</p>
        </div>
        <Separator />
      
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>All Invoices</CardTitle>
                <CardDescription>A list of all invoices across the platform.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
            </div>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.id} onClick={() => handleRowClick(invoice.id)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>{invoice.merchantName}</TableCell>
                        <TableCell>{invoice.customerName}</TableCell>
                        <TableCell>{invoice.issueDate}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${invoice.totalAmount.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}


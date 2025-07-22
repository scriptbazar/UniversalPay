
'use client';

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, PlusCircle, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { type Invoice, getInvoices } from "@/lib/invoicesData";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

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
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        setInvoices(getInvoices());
    }, []);
    
    const filteredInvoices = useMemo(() => {
        if (!searchTerm) {
            return invoices;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return invoices.filter(invoice => 
            invoice.id.toLowerCase().includes(lowercasedFilter) ||
            invoice.merchantName.toLowerCase().includes(lowercasedFilter) ||
            invoice.customerName.toLowerCase().includes(lowercasedFilter) ||
            invoice.customerEmail.toLowerCase().includes(lowercasedFilter)
        );
    }, [invoices, searchTerm]);

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
            <CardHeader>
                <div className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>All Invoices</CardTitle>
                        <CardDescription>A list of all invoices across the platform.</CardDescription>
                    </div>
                    <div className="flex gap-2 items-center">
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by ID, Merchant, Customer..."
                                className="pl-8 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
                    </div>
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
                {filteredInvoices.map((invoice) => (
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
                {filteredInvoices.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={6} className="text-center h-24">
                            No invoices found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}

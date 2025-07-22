
'use client';

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, PlusCircle, Search, FileText, CheckCircle, Clock, XCircle, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { type Invoice, getInvoiceById, getInvoices } from "@/lib/invoicesData";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

const getStatusInfo = (status: Invoice['status']): { variant: 'default' | 'secondary' | 'destructive', icon: React.ReactNode } => {
    switch (status) {
        case 'Paid':
            return { variant: 'default', icon: <CheckCircle className="mr-2 h-4 w-4" /> };
        case 'Pending':
            return { variant: 'secondary', icon: <Clock className="mr-2 h-4 w-4" /> };
        case 'Overdue':
            return { variant: 'destructive', icon: <XCircle className="mr-2 h-4 w-4" /> };
        default:
            return { variant: 'secondary', icon: <Clock className="mr-2 h-4 w-4" /> };
    }
};


export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

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
        const invoice = getInvoiceById(invoiceId);
        if (invoice) {
            setSelectedInvoice(invoice);
        }
    };
    
    const handleDownloadPdf = () => {
        const input = document.getElementById('invoice-dialog-content');
        if (input && selectedInvoice) {
          html2canvas(input, { scale: 2 }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${selectedInvoice.id}.pdf`);
          });
        }
    };

    const statusInfo = selectedInvoice ? getStatusInfo(selectedInvoice.status) : null;


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
                        <CardDescription>A list of all invoices across the platform. Click a row for details.</CardDescription>
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
        
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
            <DialogContent className="max-w-2xl">
                 <div id="invoice-dialog-content" className="p-6 md:p-10 bg-background">
                    {selectedInvoice && (
                        <>
                             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                                <div>
                                <div className="flex items-center gap-4">
                                    <FileText className="h-10 w-10 text-muted-foreground" />
                                    <div>
                                    <h1 className="text-3xl font-bold">Invoice</h1>
                                    <p className="font-mono text-muted-foreground">{selectedInvoice.id}</p>
                                    </div>
                                </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end gap-2">
                                    {statusInfo && (
                                        <Badge variant={statusInfo.variant} className="text-base px-4 py-1 flex items-center">
                                            {statusInfo.icon}
                                            {selectedInvoice.status}
                                        </Badge>
                                    )}
                                    <div className='text-right'>
                                        <p className="text-sm text-muted-foreground">Issued: {selectedInvoice.issueDate}</p>
                                        <p className="text-sm text-muted-foreground">Due: {selectedInvoice.dueDate}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator className="my-8" />
                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h2 className="font-semibold mb-2">Billed To:</h2>
                                    <p className="font-semibold text-lg">{selectedInvoice.customerName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedInvoice.customerEmail}</p>
                                </div>
                                <div className="text-left md:text-right">
                                    <h2 className="font-semibold mb-2">From:</h2>
                                    <p className="font-semibold text-lg">{selectedInvoice.merchantName}</p>
                                </div>
                            </div>
                            <div className="rounded-lg border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedInvoice.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{item.description}</TableCell>
                                                <TableCell className="text-right">${item.amount.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex justify-end mt-6">
                                <div className="w-full max-w-sm space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Tax (0%)</span>
                                        <span>$0.00</span>
                                    </div>
                                    <Separator/>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span >Total</span>
                                        <span>${selectedInvoice.totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                 </div>
                 <div className="flex justify-end gap-2 p-6 pt-0">
                    <Button variant="outline" onClick={() => setSelectedInvoice(null)}>Close</Button>
                    <Button onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}

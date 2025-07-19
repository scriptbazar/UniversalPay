
'use client';

import { ArrowLeft, Download, Mail, CheckCircle, Clock, XCircle, FileText, User, Calendar, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getInvoiceById, type Invoice } from '@/lib/invoicesData';
import { notFound, useParams } from 'next/navigation';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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

export default function InvoiceDetailPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;
  const invoice = getInvoiceById(invoiceId);

  if (!invoice) {
    return notFound();
  }
  
  const statusInfo = getStatusInfo(invoice.status);

  const handleDownloadPdf = () => {
    const input = document.getElementById('invoice-card');
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`invoice-${invoice.id}.pdf`);
      });
    }
  };


  return (
    <div className="space-y-6">
      <div className='flex justify-between items-center'>
        <Link href="/merchant/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4"/>
          Back to All Invoices
        </Link>
        <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleDownloadPdf}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
            {invoice.status !== 'Paid' && <Button><Mail className="mr-2 h-4 w-4"/> Send Reminder</Button>}
        </div>
      </div>
      
      <Card id="invoice-card" className="p-6 md:p-10">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-4">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <div>
                  <h1 className="text-3xl font-bold">Invoice</h1>
                  <p className="font-mono text-muted-foreground">{invoice.id}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
                 <Badge variant={statusInfo.variant} className="text-base px-4 py-1 flex items-center">
                    {statusInfo.icon}
                    {invoice.status}
                </Badge>
                 <div className='text-right'>
                    <p className="text-sm text-muted-foreground">Issued: {invoice.issueDate}</p>
                    <p className="text-sm text-muted-foreground">Due: {invoice.dueDate}</p>
                 </div>
            </div>
        </div>

        <Separator className="my-8" />
        
        <div className="grid md:grid-cols-2 gap-8 mb-8">
             <div>
                <h2 className="font-semibold mb-2">Billed To:</h2>
                <p className="font-semibold text-lg">{invoice.customerName}</p>
                <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
            </div>
             <div className="text-left md:text-right">
                <h2 className="font-semibold mb-2">From:</h2>
                <p className="font-semibold text-lg">{invoice.merchantName}</p>
                <a href={`https://transactwave.com/pay/${invoice.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 md:justify-end">
                    View Payment Link <ExternalLink className="h-3 w-3" />
                </a>
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
                    {invoice.items.map((item, index) => (
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
                    <span>${invoice.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (0%)</span>
                    <span>$0.00</span>
                </div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg">
                    <span >Total</span>
                    <span>${invoice.totalAmount.toFixed(2)}</span>
                </div>
            </div>
        </div>
         <Separator className="my-8"/>
        <div className='text-center text-sm text-muted-foreground'>
            <p>Thank you for your business!</p>
            {invoice.status === 'Pending' && <Button variant="default" size="lg" className='mt-4'>Pay Now</Button>}
        </div>
      </Card>
    </div>
  );
}

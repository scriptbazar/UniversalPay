
'use client';

import { ArrowLeft, Download, Mail, CheckCircle, Clock, XCircle, FileText, User, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getInvoiceById, type Invoice } from '@/lib/invoicesData';
import { notFound, useParams } from 'next/navigation';

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

  return (
    <div className="space-y-6">
      <Link href="/merchant/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4"/>
        Back to All Invoices
      </Link>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <div>
                  <CardTitle className="text-2xl">Invoice {invoice.id}</CardTitle>
                  <CardDescription>Issued on: {invoice.issueDate}</CardDescription>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
                 <Badge variant={statusInfo.variant} className="text-base px-4 py-1 flex items-center">
                    {statusInfo.icon}
                    {invoice.status}
                </Badge>
                 <p className="text-sm text-muted-foreground">Due on: {invoice.dueDate}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
            <Separator className="my-4" />
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                 <div className="flex items-start gap-4">
                    <User className="w-5 h-5 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-muted-foreground">Billed To</p>
                        <p className="font-semibold">{invoice.customerName}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                    </div>
                </div>
                 <div className="flex items-start gap-4 md:justify-end">
                    <Calendar className="w-5 h-5 text-primary mt-1" />
                    <div>
                        <p className="text-sm text-muted-foreground">Payment Link</p>
                        <a href="#" className="font-semibold text-primary hover:underline">
                            {`https://transactwave.com/pay/${invoice.id}`}
                        </a>
                    </div>
                </div>
            </div>

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
            <Separator className="my-4"/>
             <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg">
                        <span >Total</span>
                        <span>${invoice.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
             <Separator className="my-6"/>
            <div className="flex justify-end gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
                {invoice.status === 'Pending' && <Button><Mail className="mr-2 h-4 w-4"/> Send Reminder</Button>}
                {invoice.status === 'Pending' && <Button variant="secondary">Mark as Paid</Button>}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

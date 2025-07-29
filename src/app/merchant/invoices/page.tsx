
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { type Invoice, getInvoices, addInvoice } from "@/lib/invoicesData";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";


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

function CreateInvoiceForm({ setOpen, onInvoiceCreated }: { setOpen: (open: boolean) => void; onInvoiceCreated: () => void; }) {
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
        return;
    }
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const merchantName = userDoc.exists() ? userDoc.data().fullName : 'Your Business';
    
    const newInvoice = {
      customerName,
      customerEmail,
      items: [{ description: "Service or Product", amount: parseFloat(amount) }],
      status: "Pending" as "Pending" | "Paid" | "Overdue",
      issueDate: new Date().toISOString().split("T")[0],
      dueDate,
      merchantId: user.uid,
      merchantName: merchantName
    };
    await addInvoice(newInvoice);
    toast({
      title: "Invoice Created",
      description: `Invoice for ${customerName} has been created successfully.`,
    });
    onInvoiceCreated();
    setOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Customer Name</Label>
        <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerEmail">Customer Email</Label>
        <Input id="customerEmail" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (USD)</Label>
        <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
      </div>
      <DialogFooter>
        <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
        <Button type="submit">Create Invoice</Button>
      </DialogFooter>
    </form>
  );
}


function CreateInvoiceDialog({ onInvoiceCreated }: { onInvoiceCreated: () => void; }) {
    const [open, setOpen] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");

    if (isDesktop) {
        return (
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Create Invoice</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                    <DialogTitle>Create New Invoice</DialogTitle>
                    <DialogDescription>
                        Fill in the details below to create and send a new invoice.
                    </DialogDescription>
                    </DialogHeader>
                    <CreateInvoiceForm setOpen={setOpen} onInvoiceCreated={onInvoiceCreated} />
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4"/> Create Invoice</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="text-left">
                    <DrawerTitle>Create New Invoice</DrawerTitle>
                    <DrawerDescription>
                        Fill in the details below to create and send a new invoice.
                    </DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    <CreateInvoiceForm setOpen={setOpen} onInvoiceCreated={onInvoiceCreated} />
                </div>
            </DrawerContent>
        </Drawer>
    );
}

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchInvoices = async () => {
        setLoading(true);
        const user = auth.currentUser;
        if (user) {
            const merchantInvoices = await getInvoices(user.uid);
            setInvoices(merchantInvoices);
        }
        setLoading(false);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                fetchInvoices();
            } else {
                router.push('/login');
            }
        });
        return () => unsubscribe();
    }, [router]);

    const handleRowClick = (invoiceId: string) => {
        router.push(`/merchant/invoices/${invoiceId}`);
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
                <CardTitle>Your Invoices</CardTitle>
                <CardDescription>A list of all invoices for your account.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
                <CreateInvoiceDialog onInvoiceCreated={fetchInvoices} />
            </div>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading invoices...</TableCell></TableRow>
                ) : invoices.length > 0 ? (
                    invoices.map((invoice) => (
                        <TableRow key={invoice.id} onClick={() => handleRowClick(invoice.id)} className="cursor-pointer hover:bg-muted/50">
                            <TableCell className="font-medium">{invoice.id.substring(0, 10)}...</TableCell>
                            <TableCell>{invoice.customerName}</TableCell>
                            <TableCell>{invoice.issueDate}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">${invoice.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={5} className="h-24 text-center">No invoices found.</TableCell></TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}

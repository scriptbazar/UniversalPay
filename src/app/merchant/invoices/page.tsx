'use client';

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Search } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { toDateSafe } from "@/lib/utils";

type Invoice = { id: string; invoiceNumber: string; customerName: string; customerEmail: string; amount: string; currency: string; status: string; dueDate: any; createdAt: any; items?: any[]; merchantId: string; };

const DEMO_INVOICES: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-001', customerName: 'Alice Corp', customerEmail: 'alice@corp.com', amount: '499.00', currency: 'USD', status: 'Paid', dueDate: new Date(), createdAt: new Date(), merchantId: 'demo' },
  { id: '2', invoiceNumber: 'INV-002', customerName: 'Bob Ventures', customerEmail: 'bob@ventures.io', amount: '1200.00', currency: 'USD', status: 'Pending', dueDate: new Date(), createdAt: new Date(), merchantId: 'demo' },
  { id: '3', invoiceNumber: 'INV-003', customerName: 'Carol Design', customerEmail: 'carol@design.co', amount: '350.00', currency: 'USD', status: 'Overdue', dueDate: new Date(), createdAt: new Date(), merchantId: 'demo' },
];

const statusColor = (s: string) => s === 'Paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : s === 'Overdue' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

export default function MerchantInvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Invoice | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid || 'demo_merchant_uid';
      try {
        const q = query(collection(db, 'invoices'), where('merchantId', '==', uid), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            setInvoices(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDateSafe(d.data().createdAt), dueDate: toDateSafe(d.data().dueDate) } as Invoice)));
          } else {
            setInvoices(DEMO_INVOICES);
          }
          setLoading(false);
        }, () => { setInvoices(DEMO_INVOICES); setLoading(false); });
        return () => unsub();
      } catch { setInvoices(DEMO_INVOICES); setLoading(false); }
    });
    return () => unsubAuth();
  }, []);

  const handlePrint = () => {
    if (!selected) return;
    const content = `Invoice ${selected.invoiceNumber} - ${selected.customerName} - $${selected.amount}`;
    toast({ title: 'Print Preview', description: content });
    window.print();
  };

  const filtered = invoices.filter(inv => !search || inv.customerName?.toLowerCase().includes(search.toLowerCase()) || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><FileText className="h-6 w-6" /> My Invoices</h1>
        <p className="text-muted-foreground">View and manage invoices issued from your merchant account.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All invoices generated under your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by customer or invoice number..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader><TableRow><TableHead>Invoice #</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Due Date</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                )) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No invoices found.</TableCell></TableRow>
                ) : filtered.map(inv => (
                  <TableRow key={inv.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(inv)}>
                    <TableCell className="font-mono text-xs">{inv.invoiceNumber}</TableCell>
                    <TableCell><div className="font-medium">{inv.customerName}</div><div className="text-xs text-muted-foreground">{inv.customerEmail}</div></TableCell>
                    <TableCell className="font-semibold">${inv.amount}</TableCell>
                    <TableCell><Badge className={statusColor(inv.status)}>{inv.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{inv.dueDate instanceof Date ? inv.dueDate.toLocaleDateString() : '-'}</TableCell>
                    <TableCell><Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setSelected(inv); }}><Download className="h-4 w-4" /></Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Invoice {selected?.invoiceNumber}</DialogTitle></DialogHeader>
          {selected && (
            <div ref={printRef} className="space-y-4">
              <div className="flex justify-between text-sm">
                <div><p className="font-semibold text-lg">UniversalPay</p><p className="text-muted-foreground">support@universalpay.com</p></div>
                <div className="text-right"><p className="font-mono font-bold">{selected.invoiceNumber}</p><Badge className={statusColor(selected.status)}>{selected.status}</Badge></div>
              </div>
              <Separator />
              <div className="text-sm space-y-1">
                <p className="font-semibold">Bill To:</p>
                <p>{selected.customerName}</p>
                <p className="text-muted-foreground">{selected.customerEmail}</p>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Total Amount</span><span>${selected.amount} {selected.currency}</span></div>
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" onClick={handlePrint}><Download className="h-4 w-4 mr-2" /> Download / Print</Button>
                <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

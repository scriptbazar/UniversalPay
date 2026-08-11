'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Landmark, Plus } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { toDateSafe } from "@/lib/utils";

type Withdrawal = { id: string; amount: string; method: string; address: string; status: string; createdAt: Date; merchantId: string; };

const statusColor = (s: string) => s === 'Approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : s === 'Rejected' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';

export default function MerchantWithdrawalsPage() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('USDT TRC20');
  const [address, setAddress] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [merchantId, setMerchantId] = useState<string>('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid || 'demo_merchant_uid';
      setMerchantId(uid);
      try {
        const q = query(collection(db, 'withdrawals'), where('merchantId', '==', uid), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, (snap) => {
          setWithdrawals(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDateSafe(d.data().createdAt) } as Withdrawal)));
          setLoading(false);
        }, () => setLoading(false));
        return () => unsub();
      } catch { setLoading(false); }
    });
    return () => unsubAuth();
  }, []);

  const handleSubmit = async () => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) { toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid withdrawal amount.' }); return; }
    if (!address.trim()) { toast({ variant: 'destructive', title: 'Missing Address', description: 'Please enter your wallet address or bank details.' }); return; }
    if (num < 10) { toast({ variant: 'destructive', title: 'Minimum $10', description: 'Minimum withdrawal amount is $10.' }); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'withdrawals'), { amount: num.toFixed(2), method, address, status: 'Pending', merchantId, createdAt: serverTimestamp() });
      toast({ title: 'Withdrawal Requested', description: `Your request for $${num.toFixed(2)} via ${method} has been submitted.` });
      setOpen(false); setAmount(''); setAddress('');
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit withdrawal request.' }); }
    setSubmitting(false);
  };

  const pending = withdrawals.filter(w => w.status === 'Pending').reduce((s, w) => s + parseFloat(w.amount || '0'), 0);
  const approved = withdrawals.filter(w => w.status === 'Approved').reduce((s, w) => s + parseFloat(w.amount || '0'), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Landmark className="h-6 w-6" /> Withdrawals</h1>
          <p className="text-muted-foreground">Request and track your fund withdrawals.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> Request Withdrawal</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Withdrawn</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">${approved.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Pending Requests</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-yellow-500">${pending.toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{withdrawals.length}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Withdrawal History</CardTitle><CardDescription>All your withdrawal requests and their current status.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader><TableRow><TableHead>Amount</TableHead><TableHead>Method</TableHead><TableHead>Address / Details</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                )) : withdrawals.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No withdrawals yet. Click "Request Withdrawal" to get started.</TableCell></TableRow>
                ) : withdrawals.map(w => (
                  <TableRow key={w.id}>
                    <TableCell className="font-bold">${w.amount}</TableCell>
                    <TableCell>{w.method}</TableCell>
                    <TableCell className="font-mono text-xs max-w-[180px] truncate">{w.address}</TableCell>
                    <TableCell><Badge className={statusColor(w.status)}>{w.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{w.createdAt instanceof Date ? w.createdAt.toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Withdrawal</DialogTitle><DialogDescription>Minimum withdrawal is $10. Processing takes 24-72 hours.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Amount (USD)</Label><Input type="number" placeholder="e.g. 500" min="10" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} /></div>
            <div className="space-y-2"><Label>Withdrawal Method</Label>
              <Select value={method} onValueChange={setMethod}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="USDT TRC20">USDT TRC20</SelectItem>
                <SelectItem value="USDT ERC20">USDT ERC20</SelectItem>
                <SelectItem value="Bitcoin BTC">Bitcoin BTC</SelectItem>
                <SelectItem value="Bank Transfer">Bank Transfer (SWIFT)</SelectItem>
                <SelectItem value="UPI">UPI / IMPS</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-2"><Label>Wallet Address / Bank Details</Label><Input placeholder="Enter your wallet address or account details" value={address} onChange={e => setAddress(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Request'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

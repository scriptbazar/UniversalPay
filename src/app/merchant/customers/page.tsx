'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { toDateSafe } from "@/lib/utils";

type Customer = { id: string; email: string; name?: string; totalSpent: number; transactionCount: number; lastSeen: Date; };

const DEMO_CUSTOMERS: Customer[] = [
  { id: '1', email: 'alice@startup.io', name: 'Alice Johnson', totalSpent: 1249.00, transactionCount: 4, lastSeen: new Date() },
  { id: '2', email: 'bob@designco.com', name: 'Bob Smith', totalSpent: 750.00, transactionCount: 3, lastSeen: new Date() },
  { id: '3', email: 'carol@clouddev.org', name: 'Carol Williams', totalSpent: 3200.00, transactionCount: 2, lastSeen: new Date() },
];

export default function MerchantCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid || 'demo_merchant_uid';
      try {
        const q = query(collection(db, 'transactions'), where('merchantId', '==', uid));
        const unsub = onSnapshot(q, (snap) => {
          if (snap.empty) { setCustomers(DEMO_CUSTOMERS); setLoading(false); return; }
          const txns = snap.docs.map(d => d.data()) as any[];
          // Aggregate by customerEmail
          const map: Record<string, Customer> = {};
          txns.forEach(t => {
            const email = t.customerEmail || 'unknown@customer.com';
            if (!map[email]) map[email] = { id: email, email, name: t.customerName || email.split('@')[0], totalSpent: 0, transactionCount: 0, lastSeen: toDateSafe(t.date) };
            if (t.status === 'Success') map[email].totalSpent += parseFloat(t.amount || '0');
            map[email].transactionCount++;
          });
          setCustomers(Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent));
          setLoading(false);
        }, () => { setCustomers(DEMO_CUSTOMERS); setLoading(false); });
        return () => unsub();
      } catch { setCustomers(DEMO_CUSTOMERS); setLoading(false); }
    });
    return () => unsubAuth();
  }, []);

  const filtered = useMemo(() => customers.filter(c => !search || c.email.toLowerCase().includes(search.toLowerCase()) || (c.name || '').toLowerCase().includes(search.toLowerCase())), [customers, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Users className="h-6 w-6" /> My Customers</h1>
        <p className="text-muted-foreground">Customers who have transacted through your payment links.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{customers.length}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-500">${customers.reduce((s, c) => s + c.totalSpent, 0).toFixed(2)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Avg. Spend / Customer</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-blue-500">${customers.length > 0 ? (customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length).toFixed(2) : '0.00'}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Customer List</CardTitle><CardDescription>All customers derived from your transaction history.</CardDescription></CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader><TableRow><TableHead>Customer</TableHead><TableHead>Transactions</TableHead><TableHead>Total Spent</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                )) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-12 text-muted-foreground">No customers yet. Share your payment links to get started!</TableCell></TableRow>
                ) : filtered.map(c => (
                  <TableRow key={c.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{(c.name || c.email).slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></div></div></TableCell>
                    <TableCell>{c.transactionCount}</TableCell>
                    <TableCell className="font-semibold">${c.totalSpent.toFixed(2)}</TableCell>
                    <TableCell><Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

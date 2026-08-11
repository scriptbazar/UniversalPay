'use client';

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, CreditCard } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { toDateSafe } from "@/lib/utils";

type Payment = {
    id: string;
    merchantId: string;
    customerEmail: string;
    amount: string;
    method: string;
    status: 'Success' | 'Failed' | 'Pending';
    date: Date;
};

const DEMO_PAYMENTS: Payment[] = [
    { id: 'TXN-8810', merchantId: 'demo', customerEmail: 'alice@startup.io', amount: '499.00', method: 'USDT TRC20', status: 'Success', date: new Date() },
    { id: 'TXN-8811', merchantId: 'demo', customerEmail: 'bob@designco.com', amount: '250.00', method: 'UPI Pay', status: 'Success', date: new Date() },
    { id: 'TXN-8812', merchantId: 'demo', customerEmail: 'carol@clouddev.org', amount: '1200.00', method: 'Crypto BTC', status: 'Success', date: new Date() },
    { id: 'TXN-8813', merchantId: 'demo', customerEmail: 'dave@fintech.net', amount: '89.00', method: 'UPI GPay', status: 'Failed', date: new Date() },
    { id: 'TXN-8814', merchantId: 'demo', customerEmail: 'eve@saas.app', amount: '3200.00', method: 'USDT ERC20', status: 'Pending', date: new Date() },
];

const statusBadge = (status: string) => {
    if (status === 'Success') return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Success</Badge>;
    if (status === 'Failed') return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="secondary">Pending</Badge>;
};

export default function MerchantPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        const unsubAuth = onAuthStateChanged(auth, (user) => {
            const uid = user?.uid || 'demo_merchant_uid';
            try {
                const q = query(
                    collection(db, 'transactions'),
                    where('merchantId', '==', uid),
                    orderBy('date', 'desc')
                );
                const unsubSnap = onSnapshot(q, (snap) => {
                    if (!snap.empty) {
                        setPayments(snap.docs.map(d => ({ id: d.id, ...d.data(), date: toDateSafe(d.data().date) } as Payment)));
                    } else {
                        setPayments(DEMO_PAYMENTS);
                    }
                    setLoading(false);
                }, () => { setPayments(DEMO_PAYMENTS); setLoading(false); });
                return () => unsubSnap();
            } catch {
                setPayments(DEMO_PAYMENTS);
                setLoading(false);
            }
        });
        return () => unsubAuth();
    }, []);

    const filtered = useMemo(() => payments.filter(p => {
        const matchSearch = !search || p.customerEmail.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || p.status.toLowerCase() === statusFilter;
        return matchSearch && matchStatus;
    }), [payments, search, statusFilter]);

    const totalRevenue = payments.filter(p => p.status === 'Success').reduce((s, p) => s + parseFloat(p.amount || '0'), 0);
    const successCount = payments.filter(p => p.status === 'Success').length;
    const successRate = payments.length > 0 ? Math.round((successCount / payments.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><CreditCard className="h-6 w-6" /> My Payments</h1>
                <p className="text-muted-foreground">View and track all payment transactions for your account.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Transactions</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{payments.length}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-green-500">{successRate}%</div></CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>All payments processed through your merchant account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by email or transaction ID..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="overflow-x-auto rounded-md border border-border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>{Array.from({ length: 6 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                                )) : filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">No payments found.</TableCell></TableRow>
                                ) : filtered.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-mono text-xs">{p.id}</TableCell>
                                        <TableCell>{p.customerEmail}</TableCell>
                                        <TableCell className="font-semibold">${p.amount}</TableCell>
                                        <TableCell>{p.method}</TableCell>
                                        <TableCell>{statusBadge(p.status)}</TableCell>
                                        <TableCell className="text-muted-foreground text-xs">{p.date instanceof Date ? p.date.toLocaleDateString() : String(p.date)}</TableCell>
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

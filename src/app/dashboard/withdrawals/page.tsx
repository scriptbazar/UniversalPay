
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { collection, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import type { Withdrawal } from "./actions";
import { processWithdrawal } from "./actions";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { onAuthStateChanged } from 'firebase/auth';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { toDateSafe } from '@/lib/utils';

const getStatusBadgeVariant = (status: Withdrawal["status"]) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'Pending': return 'secondary';
        case 'Failed': return 'destructive';
        default: return 'outline';
    }
};

export default function AdminWithdrawalsPage() {
    const { toast } = useToast();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null);


    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const idTokenResult = await user.getIdTokenResult(true);
                const userIsAdmin = !!idTokenResult.claims.role && idTokenResult.claims.role === 'admin';
                setIsAdmin(userIsAdmin);

                if (userIsAdmin) {
                    const withdrawalsCollectionRef = collection(db, "withdrawals");
                    const q = query(withdrawalsCollectionRef, orderBy('createdAt', 'desc'));
                    
                    const unsubscribeSnapshots = onSnapshot(q, (querySnapshot) => {
                        const withdrawalsList: Withdrawal[] = querySnapshot.docs.map(doc => ({ 
                            id: doc.id, 
                            ...doc.data(),
                            createdAt: toDateSafe(doc.data().createdAt)
                         } as Withdrawal));
                        setWithdrawals(withdrawalsList);
                        setLoading(false);
                    }, (error) => {
                        console.error("Error fetching withdrawals:", error);
                        toast({
                            title: "Error",
                            description: "Failed to fetch withdrawals. Check console and Firebase rules.",
                            variant: "destructive",
                        });
                        setLoading(false);
                    });
                    return () => unsubscribeSnapshots();
                } else {
                    setLoading(false);
                    setWithdrawals([]);
                }
            } else {
                setLoading(false);
            }
        });
        
        return () => unsubscribeAuth();
    }, [toast]);


    const handleProcessWithdrawal = async (id: string, newStatus: 'Completed' | 'Failed') => {
        setIsProcessing(id);
        const adminUser = auth.currentUser;
        if (!adminUser) {
            toast({ variant: 'destructive', title: 'Authentication Error', description: 'Admin user not found.' });
            setIsProcessing(null);
            return;
        }

        const result = await processWithdrawal(id, newStatus, adminUser.uid);
        if (result.success) {
            toast({
                title: "Success",
                description: `Withdrawal has been marked as ${newStatus}.`,
            });
        } else {
             toast({
                title: "Error",
                description: result.error || "Failed to process withdrawal.",
                variant: "destructive",
            });
        }
        setIsProcessing(null);
    };
    
    const filteredWithdrawals = useMemo(() => {
        let filtered = withdrawals;

        if (filter !== 'all') {
            filtered = filtered.filter(w => w.status.toLowerCase() === filter);
        }

        if (searchTerm) {
            filtered = filtered.filter(w => 
                w.accountName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                w.userId?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [withdrawals, filter, searchTerm]);

    if (!isAdmin && !loading) {
        return (
            <div className="text-center p-8 text-destructive">
                You do not have the necessary permissions to view this page.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Withdrawal Requests</CardTitle>
                            <CardDescription>Review and process all merchant withdrawal requests.</CardDescription>
                        </div>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by name or user ID..."
                                className="pl-8 w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                     <Tabs value={filter} onValueChange={setFilter} className="mt-4">
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="pending">Pending</TabsTrigger>
                            <TabsTrigger value="completed">Completed</TabsTrigger>
                            <TabsTrigger value="failed">Failed</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User ID</TableHead>
                                <TableHead>Account Name</TableHead>
                                <TableHead>Bank</TableHead>
                                <TableHead>Account Number</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20 ml-auto" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell><Skeleton className="h-8 w-36" /></TableCell>
                                </TableRow>
                                ))
                            ) : filteredWithdrawals.map(w => (
                                <TableRow key={w.id}>
                                    <TableCell>{w.userId}</TableCell>
                                    <TableCell>{w.accountName}</TableCell>
                                    <TableCell>{w.bankName}</TableCell>
                                    <TableCell>{w.accountNumber}</TableCell>
                                    <TableCell className="text-right">${w.amount.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        {w.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleProcessWithdrawal(w.id, 'Completed')} disabled={isProcessing === w.id}>
                                                    {isProcessing === w.id ? 'Processing...' : 'Approve'}
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleProcessWithdrawal(w.id, 'Failed')} disabled={isProcessing === w.id}>
                                                     {isProcessing === w.id ? 'Processing...' : 'Decline'}
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {!loading && filteredWithdrawals.length === 0 && (
                        <div className="text-center p-8 text-muted-foreground">
                            No withdrawals match your search criteria.
                        </div>
                    )}
                </CardContent>
                 <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing {filteredWithdrawals.length} of {withdrawals.length} withdrawals.
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

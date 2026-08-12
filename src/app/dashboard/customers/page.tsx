
'use client';

import { ArrowLeft, Download, Search, User, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { getDocs, collection, query, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 50;

export type Customer = {
    id: string;
    merchantId: string;
    merchantName: string;
    email: string;
    name: string;
    avatar: string;
    totalSpent: number;
    transactions: number;
    lastSeen: string;
    joinedDate: string;
};

export default function AllCustomersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [cursors, setCursors] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const fetchPage = async (cursor?: QueryDocumentSnapshot<DocumentData>) => {
        setLoading(true);
        try {
            let q = query(
                collection(db, 'customers'),
                orderBy('name'),
                limit(PAGE_SIZE + 1)
            );
            if (cursor) q = query(q, startAfter(cursor));

            const snap = await getDocs(q);
            const docs = snap.docs.slice(0, PAGE_SIZE);
            setHasMore(snap.docs.length > PAGE_SIZE);

            const allCustomers: Customer[] = docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
            setCustomers(allCustomers);

            if (docs.length > 0) {
                setCursors(prev => {
                    const updated = [...prev];
                    updated[currentPage] = docs[docs.length - 1];
                    return updated;
                });
            }
        } catch (error: any) {
            console.error("Failed to fetch customers:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load customers data.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleNextPage = () => {
        const cursor = cursors[currentPage];
        if (!cursor) return;
        setCurrentPage(p => p + 1);
        fetchPage(cursor);
    };

    const handlePrevPage = () => {
        if (currentPage === 0) return;
        const prevPage = currentPage - 1;
        setCurrentPage(prevPage);
        fetchPage(prevPage === 0 ? undefined : cursors[prevPage - 1]);
    };

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return customers;
        const lower = searchTerm.toLowerCase();
        return customers.filter(c =>
            c.name?.toLowerCase().includes(lower) ||
            c.email?.toLowerCase().includes(lower) ||
            c.merchantId?.toLowerCase().includes(lower)
        );
    }, [customers, searchTerm]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><User /> All Customers</h1>
                <p className="text-muted-foreground">A list of all customers across all merchants.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">All Platform Customers</CardTitle>
                            <CardDescription>Server-paginated · {PAGE_SIZE} customers per page</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input
                                 type="search"
                                 placeholder="Search by name, email, or merchant ID..."
                                 className="pl-8 w-48"
                                 value={searchTerm}
                                 onChange={e => setSearchTerm(e.target.value)}
                               />
                            </div>
                           <Button size="sm" variant="outline" className="h-9 gap-1">
                              <Download className="h-3.5 w-3.5" />
                              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                           </Button>
                       </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto rounded-md border border-border">
                        <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Merchant ID</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead className="text-right">Total Spent (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        {[1,2,3,4].map(j => <TableCell key={j}><Skeleton className="h-10 w-full" /></TableCell>)}
                                    </TableRow>
                                ))
                            ) : filteredCustomers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                        {searchTerm ? 'No customers match your search.' : 'No customers found.'}
                                    </TableCell>
                                </TableRow>
                            ) : filteredCustomers.map(customer => (
                                <TableRow
                                    key={customer.id}
                                    onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                    className="cursor-pointer hover:bg-muted/50"
                                >
                                    <TableCell>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/users/${customer.merchantId}`} onClick={e => e.stopPropagation()} className="hover:underline font-mono text-xs">
                                            {customer.merchantId}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{customer.transactions}</TableCell>
                                    <TableCell className="text-right font-semibold">${customer.totalSpent?.toFixed(2) ?? '0.00'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage + 1} · {customers.length} customers loaded
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage === 0 || loading}>
                                <ChevronLeft className="h-4 w-4" /> Previous
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={!hasMore || loading}>
                                Next <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

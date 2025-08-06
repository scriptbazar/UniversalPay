'use client';

import { ArrowLeft, Copy, Download, Search } from "lucide-react";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import type { Customer } from "@/lib/customersData";
import { getAllCustomers } from "@/lib/customersData";


export default function CustomersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoading(true);
                const allCustomers = await getAllCustomers();
                const merchantCustomers = allCustomers.filter(c => c.merchantId === user.uid);
                setCustomers(merchantCustomers);
                setLoading(false);
            } else {
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [router]);
    
    const filteredCustomers = useMemo(() => {
        if (!searchTerm) {
            return customers;
        }
        return customers.filter(customer => 
            customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customers, searchTerm]);

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (customer: Customer) => {
        router.push(`/merchant/customers/${customer.id}`);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Your Customers</h1>
                <p className="text-muted-foreground">A list of all your customers and their spending habits.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl">All Customers</CardTitle>
                         <div className="flex items-center gap-2">
                            <div className="relative">
                               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                               <Input
                                 type="search"
                                 placeholder="Search by name or email..."
                                 className="pl-8 w-64"
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Joined Date</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead className="text-right">Total Spent (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">Loading customers...</TableCell>
                                </TableRow>
                            ) : paginatedCustomers.map(customer => (
                                <TableRow key={customer.id} onClick={() => handleRowClick(customer)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </TableCell>
                                    <TableCell>{new Date(customer.joinedDate).toLocaleDateString()}</TableCell>
                                    <TableCell>{customer.transactions}</TableCell>
                                    <TableCell>{customer.lastSeen}</TableCell>
                                    <TableCell className="text-right font-semibold">${customer.totalSpent.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {!loading && filteredCustomers.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}. Total {filteredCustomers.length} customers.
                        </div>
                        <div className="flex items-center gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}

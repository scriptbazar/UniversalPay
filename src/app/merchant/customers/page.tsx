
'use client';

import { ArrowLeft, Copy, Download, Search } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

type Customer = {
    id: string;
    email: string;
    name: string;
    totalSpent: number;
    transactions: number;
    lastSeen: string;
};

const initialTopCustomers: Customer[] = [
    { id: 'cust_1', email: 'liam@example.com', name: 'Liam Johnson', totalSpent: 250.00, transactions: 5, lastSeen: '2 days ago' },
    { id: 'cust_2', email: 'olivia@example.com', name: 'Olivia Smith', totalSpent: 150.00, transactions: 3, lastSeen: '1 day ago' },
    { id: 'cust_3', email: 'noah@example.com', name: 'Noah Williams', totalSpent: 350.00, transactions: 8, lastSeen: '5 days ago' },
    { id: 'cust_4', email: 'emma@example.com', name: 'Emma Brown', totalSpent: 450.00, transactions: 12, lastSeen: '10 hours ago' },
    { id: 'cust_5', email: 'ava@example.com', name: 'Ava Jones', totalSpent: 200.00, transactions: 4, lastSeen: '1 week ago' },
    { id: 'cust_6', email: 'william@example.com', name: 'William Garcia', totalSpent: 120.50, transactions: 2, lastSeen: '3 days ago' },
    { id: 'cust_7', email: 'sophia@example.com', name: 'Sophia Miller', totalSpent: 550.75, transactions: 15, lastSeen: '6 hours ago' },
    { id: 'cust_8', email: 'james@example.com', name: 'James Davis', totalSpent: 80.00, transactions: 1, lastSeen: '2 weeks ago' },
];

export default function CustomersPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<Customer[]>(initialTopCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
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
            <Link href="/merchant/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Your Customers</CardTitle>
                            <CardDescription>A list of all your customers and their spending habits.</CardDescription>
                        </div>
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
                                <TableHead>Transactions</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead className="text-right">Total Spent (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCustomers.map(customer => (
                                <TableRow key={customer.id} onClick={() => handleRowClick(customer)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                                    </TableCell>
                                    <TableCell>{customer.transactions}</TableCell>
                                    <TableCell>{customer.lastSeen}</TableCell>
                                    <TableCell className="text-right font-semibold">${customer.totalSpent.toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                            {filteredCustomers.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
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

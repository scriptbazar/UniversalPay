
'use client';

import { ArrowLeft, Search, Download } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';

type Subscriber = {
    id: string;
    email: string;
    name: string;
    plan: 'Free' | 'Pro' | 'Premium';
    status: 'Active' | 'Cancelled' | 'Past Due';
    nextBillingDate: string;
};

const initialSubscribers: Subscriber[] = [
    { id: 'sub_1', email: 'liam@example.com', name: 'Liam Johnson', plan: 'Pro', status: 'Active', nextBillingDate: '2023-12-15' },
    { id: 'sub_2', email: 'olivia@example.com', name: 'Olivia Smith', plan: 'Premium', status: 'Active', nextBillingDate: '2023-12-22' },
    { id: 'sub_3', email: 'noah@example.com', name: 'Noah Williams', plan: 'Pro', status: 'Cancelled', nextBillingDate: 'N/A' },
    { id: 'sub_4', email: 'emma@example.com', name: 'Emma Brown', plan: 'Free', status: 'Active', nextBillingDate: 'N/A' },
    { id: 'sub_5', email: 'ava@example.com', name: 'Ava Jones', plan: 'Premium', status: 'Past Due', nextBillingDate: '2023-11-10' },
    { id: 'sub_6', email: 'william@example.com', name: 'William Garcia', plan: 'Pro', status: 'Active', nextBillingDate: '2023-12-01' },
    { id: 'sub_7', email: 'sophia@example.com', name: 'Sophia Miller', plan: 'Pro', status: 'Active', nextBillingDate: '2023-12-05' },
];

const getStatusBadgeVariant = (status: Subscriber['status']) => {
    switch (status) {
        case 'Active': return 'default';
        case 'Past Due': return 'destructive';
        case 'Cancelled': return 'secondary';
        default: return 'outline';
    }
};

export default function SubscriptionsPage() {
    const router = useRouter();
    const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const filteredSubscribers = useMemo(() => {
        if (!searchTerm) {
            return subscribers;
        }
        return subscribers.filter(subscriber => 
            subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [subscribers, searchTerm]);

    const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
    const paginatedSubscribers = filteredSubscribers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleRowClick = (subscriber: Subscriber) => {
        router.push(`/merchant/customers/${subscriber.id}`);
    };

    return (
        <div className="space-y-6">
            <Link href="/merchant/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
            </Link>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">Your Subscribers</CardTitle>
                            <CardDescription>A list of all your customers with active and past subscriptions.</CardDescription>
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
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Next Billing Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedSubscribers.map(subscriber => (
                                <TableRow key={subscriber.id} onClick={() => handleRowClick(subscriber)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell>
                                        <div className="font-medium">{subscriber.name}</div>
                                        <div className="text-sm text-muted-foreground">{subscriber.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={subscriber.plan === 'Premium' ? 'default' : subscriber.plan === 'Pro' ? 'secondary' : 'outline'}>
                                            {subscriber.plan}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusBadgeVariant(subscriber.status)}>
                                            {subscriber.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{subscriber.nextBillingDate}</TableCell>
                                </TableRow>
                            ))}
                            {filteredSubscribers.length === 0 && (
                                 <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No subscribers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                    <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}. Total {filteredSubscribers.length} subscribers.
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

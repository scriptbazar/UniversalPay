'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { getTickets, type Ticket } from '@/lib/ticketsData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';


const getStatusVariant = (status: Ticket['status']) => {
  switch (status) {
    case 'Open': return 'destructive';
    case 'In Progress': return 'secondary';
    case 'Closed': return 'default';
    default: return 'outline';
  }
};

const getPriorityVariant = (priority: Ticket['priority']) => {
  switch (priority) {
    case 'High': return 'destructive';
    case 'Medium': return 'secondary';
    case 'Low': return 'outline';
    default: return 'outline';
  }
};

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            try {
                const fetchedTickets = await getTickets();
                setTickets(fetchedTickets);
            } catch (err: any) {
                console.error("Caught error in component:", err);
                setError(`Failed to fetch tickets. Please check console for details. Firebase Error: ${err.message}`);
            }
        } else {
            setError("Authentication error. Please log in again.");
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRowClick = (ticketId: string) => {
    router.push(`/dashboard/support/${ticketId}`);
  };

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
        if (filter === 'all') return true;
        return ticket.status.toLowerCase().replace(' ', '-') === filter;
    });
  }, [tickets, filter]);

  const ticketCounts = useMemo(() => {
    const counts = {
        all: tickets.length,
        open: 0,
        inProgress: 0,
        closed: 0,
    };
    tickets.forEach(ticket => {
        if (ticket.status === 'Open') counts.open++;
        else if (ticket.status === 'In Progress') counts.inProgress++;
        else if (ticket.status === 'Closed') counts.closed++;
    });
    return counts;
  }, [tickets]);


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-muted-foreground">Manage and respond to merchant support requests.</p>
      </div>
      <Separator />

      {error && (
          <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="all">All ({ticketCounts.all})</TabsTrigger>
          <TabsTrigger value="open">Open ({ticketCounts.open})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({ticketCounts.inProgress})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({ticketCounts.closed})</TabsTrigger>
        </TabsList>
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>All Merchant Tickets</CardTitle>
            <CardDescription>A list of all support tickets submitted by merchants.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow>
                        <TableCell colSpan={6}>
                           <Skeleton className="h-24 w-full" />
                        </TableCell>
                    </TableRow>
                ) : !error && filteredTickets.length > 0 ? (
                    filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id} onClick={() => handleRowClick(ticket.id)} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono">{ticket.id.substring(0, 10)}...</TableCell>
                        <TableCell>{ticket.merchantName}</TableCell>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                        </TableCell>
                        <TableCell>
                        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                         <TableCell colSpan={6} className="h-24 text-center">
                           {error ? "An error occurred. See message above." : "No tickets found."}
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}

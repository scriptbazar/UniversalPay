
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getTickets, addTicket, type Ticket } from '@/lib/ticketsData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';


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

function CreateTicketDialog({ onTicketCreated }: { onTicketCreated: () => void; }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<Ticket['priority']>('Medium');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!subject || !message) {
        toast({ variant: 'destructive', title: 'Please fill all fields.' });
        setIsLoading(false);
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        toast({ variant: 'destructive', title: 'You must be logged in to create a ticket.'});
        setIsLoading(false);
        return;
    }
    
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    const merchantName = userDoc.exists() ? userDoc.data().fullName : 'Unknown Merchant';
    
    await addTicket({
      subject,
      message,
      priority,
      merchantId: user.uid,
      merchantName: merchantName,
    });

    toast({ title: 'Ticket Created', description: 'Our team will get back to you shortly.' });
    onTicketCreated();
    setOpen(false);
    setSubject('');
    setMessage('');
    setPriority('Medium');
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Support Ticket</DialogTitle>
          <DialogDescription>Describe your issue, and our team will assist you.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Ticket['priority'])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} required rows={6} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? "Submitting..." : "Submit Ticket"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function MerchantSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const router = useRouter();

  const fetchTickets = async () => {
    const user = auth.currentUser;
    if (user) {
        const fetchedTickets = await getTickets(user.uid);
        setTickets(fetchedTickets);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            fetchTickets();
        } else {
            router.push('/login');
        }
    });
    return () => unsubscribe();
  }, [router]);

  const handleRowClick = (ticketId: string) => {
    router.push(`/merchant/support/${ticketId}`);
  };

  const filteredTickets = useMemo(() => {
    let filtered = tickets;
    if (filter !== 'all') {
        filtered = filtered.filter(ticket => ticket.status.toLowerCase().replace(' ', '-') === filter);
    }
    if (searchTerm) {
        filtered = filtered.filter(ticket => 
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return filtered;
  }, [tickets, filter, searchTerm]);

  const paginatedTickets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTickets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

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
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">Create and track your support requests here.</p>
      </div>
      <Separator />

      <Tabs value={filter} onValueChange={setFilter}>
        <div className="flex justify-between items-center">
            <TabsList>
            <TabsTrigger value="all">All ({ticketCounts.all})</TabsTrigger>
            <TabsTrigger value="open">Open ({ticketCounts.open})</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress ({ticketCounts.inProgress})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({ticketCounts.closed})</TabsTrigger>
            </TabsList>
            <CreateTicketDialog onTicketCreated={fetchTickets} />
        </div>
        <Card className="mt-4">
            <CardHeader>
                <div className='flex justify-between items-center'>
                    <div>
                        <CardTitle>Your Tickets</CardTitle>
                        <CardDescription>A list of all your support tickets.</CardDescription>
                    </div>
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by subject or ID..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Ticket ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Last Updated</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {paginatedTickets.map((ticket) => (
                    <TableRow key={ticket.id} onClick={() => handleRowClick(ticket.id)} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-mono">{ticket.id.substring(0, 10)}...</TableCell>
                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority}</Badge>
                    </TableCell>
                    <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                ))}
                 {paginatedTickets.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No tickets found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
            </CardContent>
            <CardFooter>
                <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-muted-foreground">
                        Page {currentPage} of {totalPages}
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
      </Tabs>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, MessageSquare, LifeBuoy, Copy, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getTicketById, addReply, updateTicket, type Ticket, type TicketReply } from '@/lib/ticketsData';
import { notFound, useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


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

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function AdminTicketDetailPage() {
  const params = useParams();
  const ticketId = params.ticketId as string;
  const { toast } = useToast();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchedTicket = getTicketById(ticketId);
    if (fetchedTicket) {
      setTicket(fetchedTicket);
    }
    setIsLoading(false);
  }, [ticketId]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading ticket...</div>;
  }

  if (!ticket) {
    return notFound();
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    addReply(ticket.id, {
      author: 'Admin',
      message: replyMessage,
    });

    const updatedTicket = getTicketById(ticket.id);
    if (updatedTicket) setTicket(updatedTicket);
    setReplyMessage('');
    toast({ title: 'Reply Sent!' });
  };
  
  const handleStatusChange = (newStatus: Ticket['status']) => {
      updateTicket(ticket.id, { status: newStatus });
      const updatedTicket = getTicketById(ticket.id);
      if (updatedTicket) setTicket(updatedTicket);
      toast({ title: "Status Updated" });
  };

  const handlePriorityChange = (newPriority: Ticket['priority']) => {
      updateTicket(ticket.id, { priority: newPriority });
      const updatedTicket = getTicketById(ticket.id);
      if (updatedTicket) setTicket(updatedTicket);
      toast({ title: "Priority Updated" });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard/support" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to All Tickets
      </Link>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                  <div>
                    <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority} Priority</Badge>
                    <CardTitle className="mt-2 text-2xl">{ticket.subject}</CardTitle>
                    <CardDescription>
                        From <Link href={`/dashboard/users/${ticket.merchantId}`} className="font-medium text-primary hover:underline">{ticket.merchantName}</Link> on {formatDate(ticket.createdAt)}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(ticket.status)} className="text-base">{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                
                {/* Initial Message */}
                 <div className="flex items-start gap-4">
                    <Avatar>
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                        <div className="bg-muted p-4 rounded-lg rounded-tl-none">
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold">{ticket.merchantName}</p>
                                <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                            </div>
                            <p className="text-sm">{ticket.message}</p>
                        </div>
                    </div>
                </div>

                {ticket.replies.map((reply, index) => (
                  <div key={index} className={`flex items-start gap-4 ${reply.author === 'Admin' ? 'flex-row-reverse' : ''}`}>
                     <Avatar>
                        <AvatarFallback>
                           {reply.author === 'Admin' ? <Shield/> : <User />}
                        </AvatarFallback>
                    </Avatar>
                     <div className="w-full">
                        <div className={`p-4 rounded-lg ${reply.author === 'Admin' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className="font-bold">{reply.author}</p>
                                <p className={`text-xs opacity-80`}>{new Date(reply.createdAt).toLocaleString()}</p>
                            </div>
                            <p className="text-sm">{reply.message}</p>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {ticket.status !== 'Closed' && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Post a Reply</h3>
                     <form onSubmit={handleReplySubmit} className="grid gap-4">
                        <Textarea 
                          placeholder="Type your response here..."
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                          rows={5}
                        />
                        <div className="flex justify-end">
                            <Button type="submit">Send Reply</Button>
                        </div>
                    </form>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ticket Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Ticket ID</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono">{ticket.id}</span>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(ticket.id, 'Ticket ID')} />
                        </div>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Last Updated</span>
                        <span className="font-semibold">{new Date(ticket.updatedAt).toLocaleDateString()}</span>
                    </div>
                     <Separator />
                     <div className="space-y-2">
                        <Label>Status</Label>
                        <Select value={ticket.status} onValueChange={handleStatusChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Open">Open</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Low">Low</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

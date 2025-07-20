
'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, User, Calendar, MessageSquare, LifeBuoy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { getTicketById, addReply, type Ticket, type TicketReply } from '@/lib/ticketsData';
import { notFound, useParams } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

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
    });
};

export default function MerchantTicketDetailPage() {
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
    return <div>Loading...</div>;
  }

  if (!ticket) {
    return notFound();
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    addReply(ticket.id, {
      author: ticket.merchantName, // Use merchant name for replies
      message: replyMessage,
    });

    const updatedTicket = getTicketById(ticket.id);
    if (updatedTicket) setTicket(updatedTicket);
    setReplyMessage('');
    toast({ title: 'Reply Sent!' });
  };

  return (
    <div className="space-y-6">
      <Link href="/merchant/support" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" />
        Back to All Tickets
      </Link>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                  <div>
                    <Badge variant={getPriorityVariant(ticket.priority)}>{ticket.priority} Priority</Badge>
                    <CardTitle className="mt-2 text-2xl">{ticket.subject}</CardTitle>
                  </div>
                  <Badge variant={getStatusVariant(ticket.status)} className="text-base">{ticket.status}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <p className="text-sm text-muted-foreground">{ticket.message}</p>
                </div>
                {ticket.replies.map((reply, index) => (
                  <div key={index} className={`flex gap-4 ${reply.author === 'Admin' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`p-4 rounded-lg max-w-xl ${reply.author === 'Admin' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                      <p className="font-bold">{reply.author}</p>
                      <p className="text-sm">{reply.message}</p>
                      <p className="text-xs text-right mt-2 opacity-70">{new Date(reply.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {ticket.status !== 'Closed' && (
                <>
                  <Separator className="my-6" />
                  <form onSubmit={handleReplySubmit}>
                    <h3 className="text-lg font-semibold mb-2">Post a Reply</h3>
                    <Textarea 
                      placeholder="Type your response here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={5}
                    />
                    <Button type="submit" className="mt-4">Send Reply</Button>
                  </form>
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
                    <div className="flex items-center gap-2">
                        <LifeBuoy className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono">{ticket.id}</span>
                    </div>
                     <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>Created: {formatDate(ticket.createdAt)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

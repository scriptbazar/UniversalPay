'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LifeBuoy, Plus } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { toDateSafe } from "@/lib/utils";

type Ticket = { id: string; subject: string; category: string; status: string; priority: string; createdAt: Date; merchantId: string; };

const statusColor = (s: string) => s === 'Open' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : s === 'Resolved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
const priorityColor = (p: string) => p === 'High' ? 'destructive' : p === 'Medium' ? 'secondary' : 'outline';

export default function MerchantSupportPage() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Payments');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [merchantId, setMerchantId] = useState<string | null>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid || 'demo_merchant_uid';
      setMerchantId(uid);
      try {
        const q = query(collection(db, 'supportTickets'), where('merchantId', '==', uid), orderBy('createdAt', 'desc'));
        const unsubSnap = onSnapshot(q, (snap) => {
          setTickets(snap.docs.map(d => ({ id: d.id, ...d.data(), createdAt: toDateSafe(d.data().createdAt) } as Ticket)));
          setLoading(false);
        }, () => setLoading(false));
        return () => unsubSnap();
      } catch { setLoading(false); }
    });
    return () => unsubAuth();
  }, []);

  const handleSubmit = async () => {
    if (!subject.trim() || !description.trim()) { toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in subject and description.' }); return; }
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'supportTickets'), { subject, category, priority, description, status: 'Open', merchantId, createdAt: serverTimestamp() });
      toast({ title: 'Ticket Submitted', description: 'Our team will respond shortly.' });
      setOpen(false); setSubject(''); setDescription('');
    } catch { toast({ variant: 'destructive', title: 'Error', description: 'Failed to submit ticket.' }); }
    setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><LifeBuoy className="h-6 w-6" /> Support Tickets</h1>
          <p className="text-muted-foreground">View and manage your support requests.</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Ticket</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>My Tickets</CardTitle><CardDescription>All support tickets you have submitted.</CardDescription></CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border border-border">
            <Table>
              <TableHeader><TableRow><TableHead>Subject</TableHead><TableHead>Category</TableHead><TableHead>Priority</TableHead><TableHead>Status</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 5 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                )) : tickets.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No tickets yet. Click "New Ticket" to get help.</TableCell></TableRow>
                ) : tickets.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.subject}</TableCell>
                    <TableCell>{t.category}</TableCell>
                    <TableCell><Badge variant={priorityColor(t.priority) as any}>{t.priority}</Badge></TableCell>
                    <TableCell><Badge className={statusColor(t.status)}>{t.status}</Badge></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{t.createdAt instanceof Date ? t.createdAt.toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Submit Support Ticket</DialogTitle><DialogDescription>Describe your issue and our team will respond within 24 hours.</DialogDescription></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Subject</Label><Input placeholder="Brief description of the issue" value={subject} onChange={e => setSubject(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Category</Label>
                <Select value={category} onValueChange={setCategory}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="Payments">Payments</SelectItem><SelectItem value="Withdrawals">Withdrawals</SelectItem>
                  <SelectItem value="Account">Account</SelectItem><SelectItem value="Technical">Technical</SelectItem><SelectItem value="Other">Other</SelectItem>
                </SelectContent></Select>
              </div>
              <div className="space-y-2"><Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                  <SelectItem value="Low">Low</SelectItem><SelectItem value="Medium">Medium</SelectItem><SelectItem value="High">High</SelectItem>
                </SelectContent></Select>
              </div>
            </div>
            <div className="space-y-2"><Label>Description</Label><Textarea placeholder="Explain your issue in detail..." rows={4} value={description} onChange={e => setDescription(e.target.value)} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Ticket'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

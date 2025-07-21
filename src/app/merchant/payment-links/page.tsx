
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Link2, MoreVertical, Trash2, Calendar, Clock, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

type TempLink = {
  id: string;
  url: string;
  amount: number;
  description: string;
  createdAt: Date;
  expiresAt: Date;
  status: 'Active' | 'Expired' | 'Paid';
};

export default function PaymentLinksPage() {
  const { toast } = useToast();
  const [links, setLinks] = useState<TempLink[]>([]);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all fields.',
      });
      return;
    }

    const now = new Date();
    const expires = new Date(now);
    expires.setDate(now.getDate() + 7);

    const newLink: TempLink = {
      id: `tmplink_${Date.now()}`,
      url: `/pay/temp/${Date.now()}`, // Simple unique URL
      amount: parseFloat(amount),
      description,
      createdAt: now,
      expiresAt: expires,
      status: 'Active',
    };
    
    setLinks(prev => [newLink, ...prev]);

    setAmount('');
    setDescription('');
    
    toast({
      title: 'Success!',
      description: 'New payment link has been created and is valid for 7 days.',
    });
  };
  
  const copyToClipboard = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: 'Copied to clipboard!', description: fullUrl });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
        <p className="text-muted-foreground">Quickly generate temporary payment links for specific amounts. Links are valid for 7 days.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Link</CardTitle>
              <CardDescription>Generate a one-time or multi-use link.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateLink}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g., 50.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="description">Description (for your reference)</Label>
                  <Input
                    id="description"
                    placeholder="e.g., Payment for Invoice #123"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" type="submit">
                  <Link2 className="mr-2 h-4 w-4" /> Generate Link
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Active Links</CardTitle>
              <CardDescription>A list of your recently created payment links.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Expires In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.length === 0 ? (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            No active links. Create one to get started.
                        </TableCell>
                    </TableRow>
                  ) : links.map((link) => {
                    const expiresIn = Math.ceil((link.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    return (
                        <TableRow key={link.id}>
                        <TableCell>
                            <div className="font-medium">{link.description}</div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                                {link.url}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="secondary">${link.amount.toFixed(2)}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground"/> {expiresIn > 0 ? `${expiresIn} days` : 'Expired'}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-end items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.url)}>
                                    <Copy className="mr-2 h-4 w-4"/> Copy
                                </Button>
                                <Button size="icon" variant="destructive" onClick={() => setLinks(prev => prev.filter(l => l.id !== link.id))}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                        </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

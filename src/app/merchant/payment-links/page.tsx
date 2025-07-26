
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Link2, MoreVertical, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';

// Mock data, in a real app this would come from an API
const initialLinks = [
  { id: 'plink_1', url: 'https://universalpay.com/pay/t-shirt-sale', amount: '25.00', status: 'Active', payments: 120, createdAt: '2023-11-05' },
  { id: 'plink_2', url: 'https://universalpay.com/pay/donation', amount: 'Dynamic', status: 'Active', payments: 50, createdAt: '2023-11-04' },
  { id: 'plink_3', url: 'https://universalpay.com/pay/workshop', amount: '100.00', status: 'Inactive', payments: 75, createdAt: '2023-11-01' },
];

export default function PaymentLinksPage() {
  const { toast } = useToast();
  const [links, setLinks] = useState(initialLinks);
  
  // Form state
  const [isDynamic, setIsDynamic] = useState(false);
  const [amount, setAmount] = useState('');

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDynamic && !amount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please set a fixed amount or enable dynamic amount.',
      });
      return;
    }
    const newLink = {
      id: `plink_${Math.random().toString(36).substr(2, 9)}`,
      url: `https://universalpay.com/pay/${Math.random().toString(36).substr(2, 9)}`,
      amount: isDynamic ? 'Dynamic' : parseFloat(amount).toFixed(2),
      status: 'Active',
      payments: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setLinks([newLink, ...links]);
    setAmount('');
    toast({
      title: 'Success!',
      description: 'New payment link has been created.',
    });
  };
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied to clipboard!', description: url });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
        <p className="text-muted-foreground">Create and manage temporary links to accept payments from anyone. Links are valid for 7 days.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Link</CardTitle>
              <CardDescription>Generate a new link to share with your customers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateLink}>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="type-switch">Dynamic Amount</Label>
                    <p className="text-xs text-muted-foreground">Allow customers to enter the amount.</p>
                  </div>
                  <Switch
                    id="type-switch"
                    checked={isDynamic}
                    onCheckedChange={setIsDynamic}
                  />
                </div>

                {!isDynamic && (
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 25.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" type="submit">
                  <Link2 className="mr-2 h-4 w-4" /> Create Link
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Payment Links</CardTitle>
              <CardDescription>Here is a list of all your created links.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          <Link href={`/merchant/payment-links/${link.id}`} className="truncate hover:underline">
                            .../{link.url.split('/').pop()}
                          </Link>
                          <Copy className="h-4 w-4 cursor-pointer text-muted-foreground" onClick={() => copyToClipboard(link.url)} />
                        </div>
                      </TableCell>
                      <TableCell>{link.amount}</TableCell>
                      <TableCell>
                        <Badge variant={link.status === 'Active' ? 'default' : 'secondary'}>
                          {link.status}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant="outline">{link.payments}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => copyToClipboard(link.url)}>
                              <Copy className="mr-2 h-4 w-4" /> Copy Link
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Switch className="mr-2 h-4 w-4" /> {link.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

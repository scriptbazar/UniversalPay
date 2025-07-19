
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Link2, MoreVertical, Trash2, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type PaymentLink = {
  id: string;
  title: string;
  url: string;
  type: 'Fixed' | 'Dynamic';
  amount: string | null;
  isActive: boolean;
  createdAt: string;
  singleUse: boolean;
};

const initialLinks: PaymentLink[] = [
  {
    id: 'plink_1',
    title: 'T-Shirt Sale',
    url: 'https://universalpay.com/pay/t-shirt-sale',
    type: 'Fixed',
    amount: '25.00',
    isActive: true,
    createdAt: '2023-10-26',
    singleUse: true,
  },
  {
    id: 'plink_2',
    title: 'General Donation',
    url: 'https://universalpay.com/pay/donation',
    type: 'Dynamic',
    amount: null,
    isActive: true,
    createdAt: '2023-10-25',
    singleUse: false,
  },
  {
    id: 'plink_3',
    title: 'Workshop Registration',
    url: 'https://universalpay.com/pay/workshop',
    type: 'Fixed',
    amount: '100.00',
    isActive: false,
    createdAt: '2023-10-22',
    singleUse: false,
  },
];

export default function PaymentLinksPage() {
  const { toast } = useToast();
  const [links, setLinks] = useState<PaymentLink[]>(initialLinks);
  const [title, setTitle] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSingleUse, setIsSingleUse] = useState(false);

  const handleCreateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || (!isDynamic && !amount)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const newLink: PaymentLink = {
      id: `plink_${Date.now()}`,
      title,
      url: `https://universalpay.com/pay/${title.toLowerCase().replace(/\s+/g, '-')}`,
      type: isDynamic ? 'Dynamic' : 'Fixed',
      amount: isDynamic ? null : parseFloat(amount).toFixed(2),
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      singleUse: isSingleUse,
    };

    setLinks((prev) => [newLink, ...prev]);
    setTitle('');
    setIsDynamic(false);
    setAmount('');
    setIsSingleUse(false);
    toast({
      title: 'Success!',
      description: 'New payment link has been created.',
    });
  };
  
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied to clipboard!' });
  };

  const simulatePayment = (linkId: string) => {
    setLinks(prevLinks => {
      const link = prevLinks.find(l => l.id === linkId);
      if (link && link.singleUse) {
        toast({
          title: "Payment Successful & Link Deactivated",
          description: `Link "${link.title}" was a single-use link and is now inactive.`
        });
        return prevLinks.map(l => l.id === linkId ? { ...l, isActive: false } : l);
      } else if (link) {
         toast({
          title: "Payment Successful",
          description: `Payment received for link "${link.title}".`
        });
      }
      return prevLinks;
    });
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
        <p className="text-muted-foreground">Create and manage links to accept payments from anyone.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Link</CardTitle>
              <CardDescription>Generate a new link to share with your customers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateLink}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Link Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., T-Shirt Sale, Donation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="type-switch">Dynamic Price</Label>
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
                 <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="single-use-switch">Single Use Only</Label>
                    <p className="text-xs text-muted-foreground">Link will expire after one payment.</p>
                  </div>
                  <Switch
                    id="single-use-switch"
                    checked={isSingleUse}
                    onCheckedChange={setIsSingleUse}
                  />
                </div>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {link.url}
                            <Copy className="h-3 w-3 cursor-pointer" onClick={() => copyToClipboard(link.url)} />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant="outline">{link.type}</Badge>
                          {link.singleUse && <Badge variant="destructive">Single Use</Badge>}
                        </div>
                      </TableCell>
                       <TableCell>{link.amount ? `$${link.amount}` : 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={link.isActive ? 'default' : 'secondary'}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end items-center gap-2">
                            <Button size="sm" variant="outline" disabled={!link.isActive} onClick={() => simulatePayment(link.id)}>
                                <IndianRupee className="mr-2 h-4 w-4" /> Pay
                            </Button>
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
                                  <Switch className="mr-2 h-4 w-4" checked={link.isActive} onCheckedChange={() => {
                                    setLinks(links.map(l => l.id === link.id ? {...l, isActive: !l.isActive} : l));
                                  }}/> {link.isActive ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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

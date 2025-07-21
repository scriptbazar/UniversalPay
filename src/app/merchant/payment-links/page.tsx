
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
import { Copy, Link2, MoreVertical, Trash2, IndianRupee, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { addPaymentLink, getPaymentLinks, type PaymentLink } from '@/lib/paymentLinksData';

export default function PaymentLinksPage() {
  const { toast } = useToast();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [amount, setAmount] = useState('');
  const [brandColor, setBrandColor] = useState('#29ABE2');
  const [collectPhone, setCollectPhone] = useState(false);

  const fetchLinks = () => {
    setLinks(getPaymentLinks());
  }

  useEffect(() => {
    fetchLinks();
  }, []);

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

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const newLink = {
      title,
      description,
      slug,
      url: `/pay/${slug}`,
      type: isDynamic ? 'Dynamic' : 'Fixed',
      amount: isDynamic ? null : parseFloat(amount),
      isActive: true,
      brandColor,
      collectPhone,
      payments: 0,
      createdAt: new Date().toISOString(),
    };
    
    addPaymentLink(newLink as PaymentLink);
    fetchLinks(); // Re-fetch links to include the new one

    setTitle('');
    setDescription('');
    setIsDynamic(false);
    setAmount('');
    setBrandColor('#29ABE2');
    setCollectPhone(false);
    
    toast({
      title: 'Success!',
      description: 'New payment page has been created.',
    });
  };
  
  const copyToClipboard = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: 'Copied to clipboard!', description: fullUrl });
  };

  const simulatePayment = (linkId: string) => {
    const link = links.find(l => l.id === linkId);
    if (link) {
      toast({
        title: "Payment Successful",
        description: `Payment received for page "${link.title}".`
      });
       const updatedLinks = links.map(l => 
        l.id === linkId ? { ...l, payments: l.payments + 1 } : l
      );
      // In a real app, this update would come from a backend.
      // For now, we simulate by just updating local state for the demo.
      setLinks(updatedLinks);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Pages</h1>
        <p className="text-muted-foreground">Create and manage custom pages to accept payments from anyone.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Page</CardTitle>
              <CardDescription>Generate a new page to share with your customers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateLink}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Page Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., T-Shirt Sale, Donation"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what the payment is for."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

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
                
                 <div className="space-y-2">
                    <Label htmlFor="brand-color">Brand Color</Label>
                    <div className="flex items-center gap-2">
                        <Input 
                            id="brand-color-hex" 
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="w-32"
                        />
                        <div className="relative">
                            <input 
                                id="brand-color" 
                                type="color" 
                                value={brandColor}
                                onChange={(e) => setBrandColor(e.target.value)}
                                className="h-10 w-10 p-1 appearance-none bg-background border rounded-md cursor-pointer"
                            />
                        </div>
                    </div>
                </div>

                 <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <Label htmlFor="collect-phone">Collect Phone Number</Label>
                    <p className="text-xs text-muted-foreground">Add a phone number field to the page.</p>
                  </div>
                  <Switch
                    id="collect-phone"
                    checked={collectPhone}
                    onCheckedChange={setCollectPhone}
                  />
                </div>

              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" type="submit">
                  <Link2 className="mr-2 h-4 w-4" /> Create Page
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Payment Pages</CardTitle>
              <CardDescription>Here is a list of all your created pages.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Payments</TableHead>
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
                        <Badge variant="secondary">{link.payments}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={link.isActive ? 'default' : 'secondary'}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                         <div className="flex justify-end items-center gap-2">
                            <Button asChild size="sm" variant="outline">
                                <Link href={link.url} target="_blank"><Eye className="mr-2 h-4 w-4"/> View</Link>
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
                                    // In a real app, this would be an API call
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


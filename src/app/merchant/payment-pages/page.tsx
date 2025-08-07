
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
import { Copy, Link2, MoreVertical, Trash2, IndianRupee, Eye, AppWindow, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { addPaymentLink, getPaymentLinks, updatePaymentLink, type PaymentLink } from '@/lib/paymentLinksData';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import Image from 'next/image';


export default function PaymentPagesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isDynamic, setIsDynamic] = useState(false);
  const [amount, setAmount] = useState('');
  const [brandColor, setBrandColor] = useState('#29ABE2');
  const [collectPhone, setCollectPhone] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchLinks = async (uid: string) => {
    setLoading(true);
    const merchantLinks = await getPaymentLinks(uid);
    setLinks(merchantLinks);
    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        fetchLinks(user.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
      return;
    }

    if (!title || (!isDynamic && !amount)) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields.',
      });
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    await addPaymentLink({
      merchantId: user.uid,
      title,
      description,
      slug,
      url: `/pay/${slug}`,
      type: isDynamic ? 'Dynamic' : 'Fixed',
      amount: isDynamic ? null : parseFloat(amount),
      isActive: true,
      brandColor,
      collectPhone,
      imageUrl: imageUrl, // Save image URL
      payments: 0,
      createdAt: Timestamp.now(), 
    });
    
    await fetchLinks(user.uid);

    setTitle('');
    setDescription('');
    setIsDynamic(false);
    setAmount('');
    setBrandColor('#29ABE2');
    setCollectPhone(false);
    setImageUrl(null);
    
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

  const handleRowClick = (pageId: string) => {
    router.push(`/merchant/payment-pages/${pageId}`);
  };

  const handleToggleActive = async (link: PaymentLink) => {
    await updatePaymentLink(link.id, { isActive: !link.isActive });
    await fetchLinks(auth.currentUser!.uid);
    toast({
      title: `Page ${!link.isActive ? 'activated' : 'deactivated'}`,
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Pages</h1>
        <p className="text-muted-foreground">Create and manage custom pages to accept payments from anyone. These pages have lifetime validity.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Page</CardTitle>
              <CardDescription>Generate a new page to share with your customers.</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreatePage}>
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
                 <div className="space-y-2">
                    <Label>Product Image</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center border overflow-hidden">
                        {imageUrl ? (
                                <Image src={imageUrl} alt="Product" width={96} height={96} className="object-cover" data-ai-hint="product image" />
                            ) : (
                                <Upload className="w-8 h-8 text-muted-foreground" />
                            )}
                        </div>
                        <Input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                        <Button variant="outline" type="button" onClick={() => document.getElementById('image-upload')?.click()}>Upload Image</Button>
                    </div>
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
                  <AppWindow className="mr-2 h-4 w-4" /> Create Page
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
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading pages...</TableCell></TableRow>
                  ) : links.map((link) => (
                    <TableRow key={link.id} onClick={() => handleRowClick(link.slug)} className="cursor-pointer">
                      <TableCell>
                        <div className="font-medium">{link.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {link.url}
                            <Copy className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); copyToClipboard(link.url); }} />
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
                            <Button asChild size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                                <Link href={link.url} target="_blank"><Eye className="mr-2 h-4 w-4"/> View</Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyToClipboard(link.url); }}>
                                  <Copy className="mr-2 h-4 w-4" /> Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleActive(link) }}>
                                  <Switch className="mr-2 h-4 w-4" checked={link.isActive} readOnly/> {link.isActive ? 'Deactivate' : 'Activate'}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={(e) => e.stopPropagation()}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!loading && links.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                You haven't created any payment pages yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

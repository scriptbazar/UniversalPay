
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Copy, Link2, MoreVertical, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { type PaymentLink, updatePaymentLink, getPaymentLinks as fetchLinksFromDb } from '@/lib/paymentLinksData';

export function PaymentLinksManager({ userType }: { userType: 'admin' | 'merchant' }) {
  const { toast } = useToast();
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isDynamic, setIsDynamic] = useState(false);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
        if (userType === 'admin') {
            setLoading(true);
            unsubscribe = fetchLinksFromDb(undefined, false, (fetchedLinks, error) => {
                if (error) {
                    toast({ variant: "destructive", title: "Error", description: "Failed to fetch payment links." });
                } else {
                    setLinks(fetchedLinks);
                }
                setLoading(false);
            });
        } else if (user) {
            setLoading(true);
            unsubscribe = fetchLinksFromDb(user.uid, false, (fetchedLinks, error) => {
                if (error) {
                    toast({ variant: "destructive", title: "Error", description: "Failed to fetch your payment links." });
                } else {
                    setLinks(fetchedLinks);
                }
                setLoading(false);
            });
        } else if (userType === 'merchant') {
            setLoading(false);
            router.push('/login');
        }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribe) {
            unsubscribe();
        }
    };
}, [router, toast, userType]);


  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (userType === 'merchant' && !user) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to create a link.' });
        return;
    }

    if (!title || (!isDynamic && !amount)) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please provide a title and set a fixed amount or enable dynamic amount.' });
      return;
    }

    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    try {
        await addDoc(collection(db, "paymentLinks"), {
            merchantId: user?.uid || 'admin_created',
            title,
            description: 'A custom payment link.',
            slug,
            url: `/pay/${slug}`,
            type: isDynamic ? 'Dynamic' : 'Fixed',
            amount: isDynamic ? null : parseFloat(amount),
            isActive: true,
            isPage: false,
            brandColor: '#29ABE2', 
            collectPhone: false,
            payments: 0,
            createdAt: Timestamp.now(),
        });
        
        setAmount('');
        setTitle('');
        toast({ title: 'Success!', description: 'New payment link has been created.' });
    } catch (error) {
        console.error("Error creating payment link:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to create payment link." });
    }
  };
  
  const copyToClipboard = (url: string) => {
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl);
    toast({ title: 'Copied to clipboard!', description: fullUrl });
  };

  const handleRowClick = (linkId: string) => {
    const path = userType === 'admin' ? `/dashboard/payment-links/${linkId}` : `/merchant/payment-links/${linkId}`;
    router.push(path);
  };

  const handleToggleActive = async (link: PaymentLink) => {
    try {
        await updatePaymentLink(link.id, { isActive: !link.isActive });
        toast({ title: `Link ${!link.isActive ? 'activated' : 'deactivated'}` });
    } catch (error) {
        console.error("Error toggling link status:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to update link status." });
    }
  }

  const handleDeleteLink = async (linkId: string) => {
      try {
          const linkRef = doc(db, "paymentLinks", linkId);
          await deleteDoc(linkRef);
          toast({ title: 'Link deleted!', description: 'The payment link has been successfully deleted.' });
      } catch (error) {
           console.error("Error deleting payment link:", error);
            toast({ variant: "destructive", title: "Error", description: "Failed to delete payment link." });
      }
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8 items-start">
        {userType === 'merchant' && (
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
                        placeholder="e.g., T-Shirt Sale"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
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
                </CardContent>
                <div className="p-6 pt-0">
                    <Button className="w-full" type="submit">
                    <Link2 className="mr-2 h-4 w-4" /> Create Link
                    </Button>
                </div>
                </form>
            </Card>
            </div>
        )}

        <div className={userType === 'merchant' ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader>
              <CardTitle>{userType === 'admin' ? 'All Platform Links' : 'Your Payment Links'}</CardTitle>
              <CardDescription>{userType === 'admin' ? 'A list of links from all merchants.' : 'A list of your created links.'}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    {userType === 'admin' && <TableHead>Merchant</TableHead>}
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payments</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={userType === 'admin' ? 6 : 5} className="h-24 text-center">Loading links...</TableCell></TableRow>
                  ) : links.map((link) => (
                    <TableRow key={link.id} onClick={() => handleRowClick(link.id)} className="cursor-pointer">
                      <TableCell>
                        <div className="font-medium flex items-center gap-2">
                          <span className="truncate hover:underline">
                            {link.title}
                          </span>
                        </div>
                         <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {link.url}
                            <Copy className="h-3 w-3 cursor-pointer" onClick={(e) => { e.stopPropagation(); copyToClipboard(link.url); }} />
                        </div>
                      </TableCell>
                      {userType === 'admin' && <TableCell>{link.merchantId.substring(0, 10)}...</TableCell>}
                      <TableCell>{link.amount !== null ? `$${link.amount.toFixed(2)}` : 'Dynamic'}</TableCell>
                      <TableCell>
                        <Badge variant={link.isActive ? 'default' : 'secondary'}>
                          {link.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                       <TableCell>
                        <Badge variant="outline">{link.payments}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                                <Link href={link.url} target="_blank" className="flex items-center">
                                    <Eye className="mr-2 h-4 w-4" /> View Link
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); copyToClipboard(link.url); }}>
                              <Copy className="mr-2 h-4 w-4" /> Copy Link
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleActive(link); }}>
                               <Switch
                                    className="mr-2 h-4 w-4 pointer-events-none"
                                    checked={link.isActive}
                                />
                              {link.isActive ? 'Deactivate' : 'Activate'}
                             </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteLink(link.id); }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                   {!loading && links.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={userType === 'admin' ? 6 : 5} className="text-center h-24">
                                No payment links found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
  );
}

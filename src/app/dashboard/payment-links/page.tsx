'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { PaymentLink } from '@/lib/paymentLinksData';


export default function AdminPaymentLinksPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const linksCollectionRef = collection(db, "paymentLinks");
    const q = query(linksCollectionRef, orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedLinks: PaymentLink[] = [];
        querySnapshot.forEach((doc) => {
            fetchedLinks.push({ id: doc.id, ...doc.data() } as PaymentLink);
        });
        setLinks(fetchedLinks);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);


  const handleRowClick = (linkId: string) => {
    router.push(`/dashboard/payment-links/${linkId}`);
  };

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch = searchTerm === '' || 
                            link.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (link.isActive ? 'active' : 'inactive') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [links, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links Monitoring</h1>
        <p className="text-muted-foreground">Oversee all payment links created across the platform.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
                <CardTitle>All Platform Links</CardTitle>
                <CardDescription>A complete list of payment links created by all merchants.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by title or merchant..."
                        className="pl-8 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Link Title</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Total Payments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                 <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Loading links...</TableCell>
                </TableRow>
              ) : filteredLinks.map((link) => (
                <TableRow key={link.id} onClick={() => handleRowClick(link.id)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>{link.merchantId}</TableCell>
                  <TableCell>
                    <Badge variant={"outline"}>
                      {link.payments}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.isActive ? 'default' : 'secondary'}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.createdAt.toDate().toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
               {!loading && filteredLinks.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">
                        No links found for the current filters.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

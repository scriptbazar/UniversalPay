
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { type PaymentLink } from '@/lib/paymentLinksData';
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPaymentPagesPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const linksCollectionRef = collection(db, "paymentLinks");
    // Corrected query to only fetch pages
    const q = query(linksCollectionRef, where("isPage", "==", true), orderBy("createdAt", "desc"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedLinks: PaymentLink[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            fetchedLinks.push({ 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate() // Convert Timestamp to Date
            } as PaymentLink);
        });
        setLinks(fetchedLinks);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching payment pages: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRowClick = (slug: string) => {
    // The detail page uses the slug, not the ID, for routing
    if (slug) {
        router.push(`/dashboard/payment-pages/${slug}`);
    }
  };

  const filteredLinks = useMemo(() => {
    if (!Array.isArray(links)) {
        return [];
    }
    return links.filter(link => {
      const matchesSearch = searchTerm === '' || 
                            link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            link.merchantId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || (link.isActive ? 'active' : 'inactive') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [links, searchTerm, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Pages Monitoring</h1>
        <p className="text-muted-foreground">Oversee all payment pages created across the platform.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
           <div className="flex justify-between items-center">
                <div>
                    <CardTitle>All Platform Pages</CardTitle>
                    <CardDescription>A complete list of payment pages created by all merchants.</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title or merchant ID..."
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
                <TableHead>Page Title</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Total Payments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : filteredLinks.map((link) => (
                <TableRow key={link.id} onClick={() => handleRowClick(link.slug)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>{link.merchantId}</TableCell>
                  <TableCell>{link.payments}</TableCell>
                  <TableCell>
                    <Badge variant={link.isActive ? "default" : "secondary"}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                </TableRow>
              ))}
               {!loading && filteredLinks.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                        No pages found for the current filters.
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

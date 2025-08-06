
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getPaymentLinks, type PaymentLink } from "@/lib/paymentLinksData";
import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPaymentPagesPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLinks() {
        setLoading(true);
        // Fetch data asynchronously and update state
        const fetchedLinks = await getPaymentLinks();
        setLinks(fetchedLinks);
        setLoading(false);
    }
    fetchLinks();
  }, []);

  const handleRowClick = (linkId: string) => {
    router.push(`/dashboard/payment-pages/${linkId}`);
  };

  const filteredLinks = useMemo(() => {
    // Ensure links is an array before filtering
    if (!Array.isArray(links)) {
        return [];
    }
    return links.filter(link => {
      const matchesSearch = searchTerm === '' || link.title.toLowerCase().includes(searchTerm.toLowerCase());
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
                            placeholder="Search by title..."
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
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">Loading pages...</TableCell>
                </TableRow>
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
                  <TableCell>{new Date(link.createdAt?.toDate()).toLocaleDateString()}</TableCell>
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

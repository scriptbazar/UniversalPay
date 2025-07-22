'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const allLinks = [
  { id: 'plink_1', merchant: 'MyStore.com', title: 'T-Shirt Sale', payments: 120, fraud: 2, status: 'Active', expiresAt: '2023-11-10' },
  { id: 'plink_2', merchant: 'CreativeGoods', title: 'General Donation', payments: 50, fraud: 0, status: 'Active', expiresAt: '2023-11-09' },
  { id: 'plink_3', merchant: 'AnotherShop', title: 'Workshop Registration', payments: 75, fraud: 5, status: 'Inactive', expiresAt: '2023-11-06' },
  { id: 'plink_4', merchant: 'MyStore.com', title: 'Ebook Download', payments: 250, fraud: 1, status: 'Active', expiresAt: '2023-11-05' },
];

export default function AdminPaymentLinksPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleRowClick = (linkId: string) => {
    router.push(`/dashboard/payment-links/${linkId}`);
  };

  const filteredLinks = useMemo(() => {
    return allLinks.filter(link => {
      const matchesSearch = searchTerm === '' || 
                            link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            link.merchant.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || link.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

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
                <TableHead>Fraudulent Payments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow key={link.id} onClick={() => handleRowClick(link.id)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>{link.merchant}</TableCell>
                  <TableCell>{link.payments}</TableCell>
                  <TableCell>
                    <Badge variant={link.fraud > 0 ? "destructive" : "outline"}>
                      {link.fraud}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={link.status === 'Active' ? 'default' : 'secondary'}>
                      {link.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{link.expiresAt}</TableCell>
                </TableRow>
              ))}
               {filteredLinks.length === 0 && (
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

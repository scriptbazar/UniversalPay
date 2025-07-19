
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const allLinks = [
  { id: 'plink_1', merchant: 'MyStore.com', title: 'T-Shirt Sale', payments: 120, fraud: 2, status: 'Active', createdAt: '2023-10-26' },
  { id: 'plink_2', merchant: 'CreativeGoods', title: 'General Donation', payments: 50, fraud: 0, status: 'Active', createdAt: '2023-10-25' },
  { id: 'plink_3', merchant: 'AnotherShop', title: 'Workshop Registration', payments: 75, fraud: 5, status: 'Inactive', createdAt: '2023-10-22' },
  { id: 'plink_4', merchant: 'MyStore.com', title: 'Ebook Download', payments: 250, fraud: 1, status: 'Active', createdAt: '2023-10-21' },
];

export default function AdminPaymentLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links Monitoring</h1>
        <p className="text-muted-foreground">Oversee all payment links created across the platform.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Platform Links</CardTitle>
          <CardDescription>A complete list of payment links created by all merchants.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Link Title</TableHead>
                <TableHead>Payments</TableHead>
                <TableHead>Fraudulent Payments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell className="font-medium">{link.merchant}</TableCell>
                  <TableCell>{link.title}</TableCell>
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
                  <TableCell>{link.createdAt}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

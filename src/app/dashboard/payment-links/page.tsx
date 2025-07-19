
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";

const allLinks = [
  { id: 'plink_1', merchant: 'MyStore.com', title: 'T-Shirt Sale', payments: 120, fraud: 2, status: 'Active', expiresAt: '2023-11-10' },
  { id: 'plink_2', merchant: 'CreativeGoods', title: 'General Donation', payments: 50, fraud: 0, status: 'Active', expiresAt: '2023-11-09' },
  { id: 'plink_3', merchant: 'AnotherShop', title: 'Workshop Registration', payments: 75, fraud: 5, status: 'Inactive', expiresAt: '2023-11-06' },
  { id: 'plink_4', merchant: 'MyStore.com', title: 'Ebook Download', payments: 250, fraud: 1, status: 'Active', expiresAt: '2023-11-05' },
];

export default function AdminPaymentLinksPage() {
  const router = useRouter();

  const handleRowClick = (linkId: string) => {
    router.push(`/dashboard/payment-links/${linkId}`);
  };

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
                <TableHead>Link Title</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Total Payments</TableHead>
                <TableHead>Fraudulent Payments</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allLinks.map((link) => (
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

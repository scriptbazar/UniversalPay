
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { getPaymentLinks, type PaymentLink } from "@/lib/paymentLinksData";
import { useEffect, useState } from "react";

const allLinks = getPaymentLinks();

export default function AdminPaymentPagesPage() {
  const router = useRouter();
  const [links, setLinks] = useState<PaymentLink[]>([]);

  useEffect(() => {
    // In a real app, this would fetch from a database.
    // Here we are using local data.
    setLinks(getPaymentLinks());
  }, []);

  const handleRowClick = (linkId: string) => {
    router.push(`/dashboard/payment-pages/${linkId}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Pages Monitoring</h1>
        <p className="text-muted-foreground">Oversee all payment pages created across the platform.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Platform Pages</CardTitle>
          <CardDescription>A complete list of payment pages created by all merchants.</CardDescription>
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
              {links.map((link) => (
                <TableRow key={link.id} onClick={() => handleRowClick(link.slug)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{link.title}</TableCell>
                  <TableCell>MyStore.com</TableCell>
                  <TableCell>{link.payments}</TableCell>
                  <TableCell>
                    <Badge variant={link.isActive ? "default" : "secondary"}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(link.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, DollarSign, Percent, Copy, User, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

export type SubMerchant = {
    id: string;
    name: string;
    email: string;
    sales: string;
    commission: string;
    status: 'Active' | 'Inactive';
};

export default function ResellerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subMerchants, setSubMerchants] = useState<SubMerchant[]>([]);

  useEffect(() => {
    // In a real app, you would fetch this from your database
    // For now, it's an empty array since mock data is removed.
    setSubMerchants([]);
  }, []);

  const totalSales = subMerchants.reduce((acc, m) => acc + parseFloat(m.sales), 0);

  const handleRowClick = (merchantId: string) => {
    router.push(`/dashboard/users/${merchantId}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reseller Dashboard</h1>
        <p className="text-muted-foreground">Manage your sub-merchants, track sales, and assign commissions.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => router.push('/dashboard/users')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subMerchants.length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/transactions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Merchant Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Total sales this month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/transactions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,260.00</div>
            <p className="text-xs text-muted-foreground">Earned this month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/commissions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Commission Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~5.5%</div>
            <p className="text-xs text-muted-foreground">Across all sub-merchants</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sub-Merchants</CardTitle>
            <CardDescription>A list of all merchants under your reseller account. Click a row for details.</CardDescription>
          </div>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Invite Merchant</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subMerchants.length > 0 ? subMerchants.map((merchant) => (
                <TableRow key={merchant.id} onClick={() => handleRowClick(merchant.id)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{merchant.name}</div>
                    <div className="text-sm text-muted-foreground">{merchant.email}</div>
                  </TableCell>
                  <TableCell>${parseFloat(merchant.sales).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell>{merchant.commission}</TableCell>
                  <TableCell>
                    <Badge variant={merchant.status === "Active" ? "default" : "secondary"}>
                      {merchant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                        No sub-merchants found.
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

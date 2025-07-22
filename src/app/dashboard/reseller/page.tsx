
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, DollarSign, Percent, Copy, User, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

type SubMerchant = {
    id: string;
    name: string;
    email: string;
    sales: string;
    commission: string;
    status: "Active" | "Inactive";
};

const subMerchants: SubMerchant[] = [
  {
    id: "user_1",
    name: "MyStore.com",
    email: "contact@mystore.com",
    sales: "12500.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_2",
    name: "AnotherShop",
    email: "sales@anothershop.io",
    sales: "8200.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_3",
    name: "CreativeGoods",
    email: "support@creative.co",
    sales: "4500.00",
    commission: "7%",
    status: "Inactive",
  },
  {
    id: "sub_4",
    name: "TechGadgets",
    email: "info@techgadgets.com",
    sales: "22000.00",
    commission: "4.5%",
    status: "Active",
  },
  {
    id: "sub_5",
    name: "FashionHub",
    email: "contact@fashionhub.com",
    sales: "9500.00",
    commission: "6%",
    status: "Active",
  },
  {
    id: "sub_6",
    name: "BookwormDen",
    email: "orders@bookwormden.com",
    sales: "3200.00",
    commission: "8%",
    status: "Active",
  },
  {
    id: "sub_7",
    name: "HomeDecorCo",
    email: "sales@homedecor.co",
    sales: "0.00",
    commission: "5%",
    status: "Inactive",
  },
];

type Transaction = {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantEmail: string;
    amount: number;
    date: string;
    method: 'UPI' | 'Crypto' | 'Page' | 'Link';
    status: 'Success' | 'Failed' | 'Pending';
};

const allSubMerchantTransactions: Transaction[] = [
    { id: 'UVRLP911202311', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 50.00, date: '2023-11-10', method: 'Page', status: 'Success' },
    { id: 'UVRLP911202312', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 75.00, date: '2023-11-10', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202313', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 120.00, date: '2023-11-09', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202314', merchantId: 'sub_4', merchantName: 'TechGadgets', merchantEmail: 'info@techgadgets.com', amount: 200.00, date: '2023-11-09', method: 'Crypto', status: 'Pending' },
    { id: 'UVRLP911202315', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 30.00, date: '2023-11-08', method: 'Page', status: 'Failed' },
    { id: 'UVRLP911202316', merchantId: 'sub_5', merchantName: 'FashionHub', merchantEmail: 'contact@fashionhub.com', amount: 85.50, date: '2023-11-08', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202317', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 250.00, date: '2023-11-07', method: 'Crypto', status: 'Success' },
    { id: 'UVRLP911202318', merchantId: 'sub_6', merchantName: 'BookwormDen', merchantEmail: 'orders@bookwormden.com', amount: 15.00, date: '2023-11-07', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202319', merchantId: 'sub_4', merchantName: 'TechGadgets', merchantEmail: 'info@techgadgets.com', amount: 450.00, date: '2023-11-06', method: 'Page', status: 'Success' },
    { id: 'UVRLP911202320', merchantId: 'sub_5', merchantName: 'FashionHub', merchantEmail: 'contact@fashionhub.com', amount: 125.00, date: '2023-11-06', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202321', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 99.99, date: '2023-11-05', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202322', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 40.00, date: '2023-11-05', method: 'Crypto', status: 'Failed' },
];

const getStatusBadgeVariant = (status: Transaction["status"]) => {
    switch (status) {
        case 'Success':
            return 'default';
        case 'Pending':
            return 'secondary';
        case 'Failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function ResellerPage() {
  const router = useRouter();
  const { toast } = useToast();

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
              {subMerchants.map((merchant) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

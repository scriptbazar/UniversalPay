
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Withdrawal = {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: string;
  currency: string;
  destination: string;
  status: "Pending" | "Completed" | "Failed";
  date: string;
};

const initialWithdrawals: Withdrawal[] = [
  { id: "wd_1", merchantName: "MyStore.com", merchantId: "merch_123", amount: "500.00", currency: "USDT", destination: "T...xyz", status: "Completed", date: "2023-10-25" },
  { id: "wd_5", merchantName: "CreativeGoods", merchantId: "merch_456", amount: "1200.00", currency: "USDT", destination: "T...abc", status: "Pending", date: "2023-10-27" },
  { id: "wd_2", merchantName: "AnotherShop", merchantId: "merch_789", amount: "1000.00", currency: "USDT", destination: "T...xyz", status: "Completed", date: "2023-10-20" },
  { id: "wd_3", merchantName: "MyStore.com", merchantId: "merch_123", amount: "250.00", currency: "INR", destination: "Bank A/c ...1234", status: "Completed", date: "2023-10-18" },
  { id: "wd_4", merchantName: "AnotherShop", merchantId: "merch_789", amount: "750.00", currency: "USDT", destination: "T...xyz", status: "Failed", date: "2023-10-15" },
];

const getStatusBadgeVariant = (status: Withdrawal["status"]) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function AdminWithdrawalsPage() {
    const { toast } = useToast();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);

    const handleAction = (id: string, newStatus: "Completed" | "Failed") => {
        setWithdrawals(prev => 
            prev.map(w => w.id === id ? { ...w, status: newStatus } : w)
        );
        toast({
            title: `Withdrawal ${newStatus}`,
            description: `The withdrawal request (ID: ${id}) has been updated.`,
        });
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Withdrawals</h1>
        <p className="text-muted-foreground">Approve or reject withdrawal requests from merchants.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>A list of all withdrawal requests across the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{w.merchantName}</div>
                    <div className="text-xs text-muted-foreground">{w.merchantId}</div>
                  </TableCell>
                  <TableCell>{w.date}</TableCell>
                  <TableCell>{w.destination}</TableCell>
                  <TableCell>${w.amount} {w.currency}</TableCell>
                   <TableCell>
                    <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {w.status === "Pending" && (
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200" onClick={() => handleAction(w.id, 'Completed')}>
                                <Check className="h-4 w-4 mr-2" />Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleAction(w.id, 'Failed')}>
                                <X className="h-4 w-4 mr-2" />Reject
                            </Button>
                        </div>
                    )}
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

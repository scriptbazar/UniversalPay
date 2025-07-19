
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWalletLoadRequests, addWalletLoadRequest, type WalletLoadRequest } from "@/lib/walletLoadData";

const getStatusBadgeVariant = (status: WalletLoadRequest["status"]) => {
  switch (status) {
    case 'Approved':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function MerchantWalletPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<WalletLoadRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const currentBalance = 5430.50; // Placeholder value

  const fetchMerchantRequests = () => {
     // In a real app, you'd get the merchantId from the user session.
     setRequests(getWalletLoadRequests().filter(w => w.merchantId === "merch_123"));
  }

  useEffect(() => {
    fetchMerchantRequests();
  }, []);

  const handleRequestLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !transactionId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount and transaction ID.",
      });
      return;
    }

    addWalletLoadRequest({
        amount: numericAmount.toFixed(2),
        currency: "USD",
        transactionId: transactionId,
        merchantId: "merch_123", // Hardcoded for this example
        merchantName: "MyStore.com", // Hardcoded for this example
    });
    
    fetchMerchantRequests(); // Re-fetch to show the new request
    setAmount("");
    setTransactionId("");
    
    toast({
        title: "Request Submitted",
        description: `Your request to load $${numericAmount.toFixed(2)} is being reviewed.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet balance and load funds.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Load Wallet</CardTitle>
              <CardDescription>Request to add funds to your wallet.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRequestLoad}>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                        <Wallet className="w-6 h-6 text-muted-foreground"/>
                        <span className="text-2xl font-bold">${currentBalance.toFixed(2)}</span>
                        <span className="text-muted-foreground">USD</span>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount to Load (USD)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="e.g., 500.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Your Payment Transaction ID</Label>
                  <Input 
                    id="transactionId" 
                    type="text" 
                    placeholder="e.g., PAYID123456" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required 
                  />
                   <p className="text-xs text-muted-foreground">
                    Please transfer funds to our company bank account and enter the transaction ID here.
                  </p>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" type="submit">Request Wallet Load</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Load History</CardTitle>
              <CardDescription>A record of all your wallet load requests.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.id}</TableCell>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>${req.amount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

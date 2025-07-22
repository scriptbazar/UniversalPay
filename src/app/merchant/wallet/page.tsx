'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, Copy, Banknote, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWalletLoadRequests, addWalletLoadRequest, type WalletLoadRequest } from "@/lib/walletLoadData";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [method, setMethod] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WalletLoadRequest | null>(null);
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
    if (isNaN(numericAmount) || numericAmount <= 0 || !transactionId || !method) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount, transaction ID, and select a payment method.",
      });
      return;
    }

    addWalletLoadRequest({
        amount: numericAmount.toFixed(2),
        currency: "USD",
        method: method,
        transactionId: transactionId,
        merchantId: "merch_123", // Hardcoded for this example
        merchantName: "MyStore.com", // Hardcoded for this example
        merchantEmail: "contact@mystore.com",
    });
    
    fetchMerchantRequests(); // Re-fetch to show the new request
    setAmount("");
    setTransactionId("");
    setMethod("");
    
    toast({
        title: "Request Submitted",
        description: `Your request to load $${numericAmount.toFixed(2)} is being reviewed.`,
    });
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
                  <Label htmlFor="method">Payment Method Used</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select method used" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Crypto (USDT)">Crypto (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                   <p className="text-xs text-muted-foreground">
                    Please transfer funds to our company account first.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Sent (USD)</Label>
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
              <CardDescription>A record of all your wallet load requests. Click row for details.</CardDescription>
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
                    <TableRow key={req.id} onClick={() => setSelectedRequest(req)} className="cursor-pointer hover:bg-muted/50">
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
      
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                {selectedRequest && <DialogDescription>Details for wallet load request {selectedRequest.id}.</DialogDescription>}
            </DialogHeader>
            {selectedRequest && (
                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Request ID:</span>
                        <span className="font-mono font-semibold">{selectedRequest.id}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-semibold">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-semibold">{selectedRequest.method}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${selectedRequest.amount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reference ID:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{selectedRequest.transactionId}</span>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedRequest.transactionId, 'Reference ID')} />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

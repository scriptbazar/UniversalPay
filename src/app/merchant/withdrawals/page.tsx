
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Withdrawal, getMerchantWithdrawals, addWithdrawal } from "@/lib/withdrawalsData";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";


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

export default function WithdrawalsPage() {
  const { toast } = useToast();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const processingFee = 0.50;
  const [merchantName, setMerchantName] = useState('Your Business');
  const [loading, setLoading] = useState(true);

  const fetchMerchantWithdrawals = async (merchantId: string) => {
    setLoading(true);
    const data = await getMerchantWithdrawals(merchantId);
    setWithdrawals(data);
    setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                setMerchantName(userDoc.data().fullName || 'Your Business');
            }
            fetchMerchantWithdrawals(user.uid);
        }
    });

    return () => unsubscribe();
  }, []);

  const handleWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to request a withdrawal." });
        return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !method) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount and select a method.",
      });
      return;
    }

    const newWithdrawal: Omit<Withdrawal, 'id' | 'createdAt'> = {
        amount: numericAmount,
        currency: method === "bank_inr" ? "INR" : "USDT",
        destination: method === "bank_inr" ? "Bank A/c ...5678" : "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc",
        status: "Pending",
        merchantId: user.uid,
        merchantName: merchantName,
    };

    await addWithdrawal(newWithdrawal);
    await fetchMerchantWithdrawals(user.uid); // Re-fetch to show the new request

    setAmount("");
    setMethod("");
    toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of ${newWithdrawal.amount} ${newWithdrawal.currency} is being processed.`,
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
        <h1 className="text-3xl font-bold tracking-tight">Withdrawals</h1>
        <p className="text-muted-foreground">Manage your funds and view withdrawal history.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
              <CardDescription>Withdraw funds to your linked accounts.</CardDescription>
            </CardHeader>
            <form onSubmit={handleWithdrawal}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Available Balance</Label>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                        <DollarSign className="w-6 h-6 text-muted-foreground"/>
                        <span className="text-2xl font-bold">5,430.50</span>
                        <span className="text-muted-foreground">USD</span>
                    </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="e.g., 500.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="text-sm space-y-1 p-3 rounded-md border bg-muted/50">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Processing Fee:</span>
                        <span>${processingFee.toFixed(2)}</span>
                    </div>
                     <Separator className="my-1"/>
                    <div className="flex justify-between font-bold">
                        <span>Total to be debited:</span>
                        <span>${(parseFloat(amount || "0") + processingFee).toFixed(2)}</span>
                    </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Withdrawal Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select a destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto_usdt">USDT Wallet (T...vYfBc)</SelectItem>
                      <SelectItem value="bank_inr">Indian Bank Account (...1234)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" type="submit">Request Withdrawal</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal History</CardTitle>
              <CardDescription>A record of all your past withdrawals. Click row for details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                     <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <Skeleton className="w-full h-10" />
                        </TableCell>
                    </TableRow>
                  ) : withdrawals.length > 0 ? (
                    withdrawals.map((w) => (
                    <TableRow key={w.id} onClick={() => setSelectedWithdrawal(w)} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium font-mono">{w.id.substring(0, 12)}...</TableCell>
                      <TableCell>{w.createdAt.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>{w.destination}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${w.amount} {w.currency}</TableCell>
                    </TableRow>
                  ))
                  ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            No withdrawal requests found.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
       <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdrawal Details</DialogTitle>
            {selectedWithdrawal && <DialogDescription>Details for withdrawal request {selectedWithdrawal.id.substring(0, 12)}...</DialogDescription>}
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Request ID:</span>
                 <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{selectedWithdrawal.id}</span>
                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedWithdrawal.id, 'Request ID')} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-semibold">{new Date(selectedWithdrawal.createdAt?.toDate()).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Amount:</span>
                <span className="font-semibold">${selectedWithdrawal.amount} {selectedWithdrawal.currency}</span>
              </div>
              <Separator />
              <div className="flex flex-col space-y-2">
                <span className="text-muted-foreground">Destination:</span>
                <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold break-all">{selectedWithdrawal.destination}</span>
                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground flex-shrink-0" onClick={() => copyToClipboard(selectedWithdrawal.destination, 'Destination Address')} />
                </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={getStatusBadgeVariant(selectedWithdrawal.status)}>{selectedWithdrawal.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedWithdrawal(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

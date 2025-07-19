
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
import { DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type Withdrawal, getWithdrawals, addWithdrawal } from "@/lib/withdrawalsData";

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

  useEffect(() => {
    // Filter withdrawals to show only those belonging to a hypothetical merchant
    // In a real app, you'd get the merchantId from the user session.
    setWithdrawals(getWithdrawals().filter(w => ["merch_456", "merch_101", "merch_202"].includes(w.merchantId)));
  }, []);

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !method) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter amount and select a method.",
      });
      return;
    }

    const newWithdrawal: Omit<Withdrawal, 'id' | 'date'> = {
        amount: parseFloat(amount).toFixed(2),
        currency: method === "bank_inr" ? "INR" : "USDT",
        destination: method === "bank_inr" ? "Bank A/c ...5678" : "T...def",
        status: "Pending",
        merchantId: "merch_202", // Hardcoded for this example
        merchantName: "FashionHub", // Hardcoded for this example
    };

    addWithdrawal(newWithdrawal);
    setWithdrawals(getWithdrawals().filter(w => ["merch_456", "merch_101", "merch_202"].includes(w.merchantId)));

    setAmount("");
    setMethod("");
    toast({
        title: "Withdrawal Initiated",
        description: `Your withdrawal of ${newWithdrawal.amount} ${newWithdrawal.currency} is being processed.`,
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
                <div className="space-y-2">
                  <Label htmlFor="method">Withdrawal Method</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select a destination" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="crypto_usdt">USDT Wallet (T...abc)</SelectItem>
                      <SelectItem value="bank_inr">Indian Bank Account (...5678)</SelectItem>
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
              <CardDescription>A record of all your past withdrawals.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((w) => (
                    <TableRow key={w.id}>
                      <TableCell className="font-medium">{w.id}</TableCell>
                      <TableCell>{w.date}</TableCell>
                      <TableCell>{w.destination}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${w.amount} {w.currency}</TableCell>
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

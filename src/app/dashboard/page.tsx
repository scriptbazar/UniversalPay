
'use client';

import {
  Activity,
  DollarSign,
  Users,
  CreditCard,
  ShieldAlert,
  Copy,
} from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import React, { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const data = [
  { name: "Jan", total: 4230, monthIndex: 0 },
  { name: "Feb", total: 3120, monthIndex: 1 },
  { name: "Mar", total: 5890, monthIndex: 2 },
  { name: "Apr", total: 4500, monthIndex: 3 },
  { name: "May", total: 6200, monthIndex: 4 },
  { name: "Jun", total: 7100, monthIndex: 5 },
  { name: "Jul", total: 6800, monthIndex: 6 },
  { name: "Aug", total: 7500, monthIndex: 7 },
  { name: "Sep", total: 6400, monthIndex: 8 },
  { name: "Oct", total: 8100, monthIndex: 9 },
  { name: "Nov", total: 8500, monthIndex: 10 },
  { name: "Dec", total: 9200, monthIndex: 11 },
];

const allTransactions = Array.from({ length: 150 }, (_, i) => {
    const monthIndex = Math.floor(i / (150/12));
    const date = new Date(2023, monthIndex, (i % 28) + 1);
    return {
        id: `UVRLP${123456789 + i}`,
        name: `Customer ${i + 1}`,
        email: `customer${i + 1}@example.com`,
        amount: (Math.random() * 500 + 20).toFixed(2),
        status: Math.random() > 0.1 ? "Success" : "Failed",
        date: date,
        monthIndex: monthIndex,
    }
});

const recentSignups = [
    { id: 'user_1', name: 'Liam Johnson', email: 'liam@example.com', plan: 'Pro' },
    { id: 'user_2', name: 'CreativeGoods', email: 'support@creative.co', plan: 'Free' },
    { id: 'user_3', name: 'MyStore.com', email: 'contact@mystore.com', plan: 'Pro' },
    { id: 'user_4', name: 'AnotherShop', email: 'sales@anothershop.io', plan: 'Premium' },
];

type Transaction = typeof allTransactions[0];


export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const adminName = "Admin"; // Placeholder for the admin's name

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [monthlyTransactions, setMonthlyTransactions] = useState<{ month: string, transactions: Transaction[] } | null>(null);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);


  const handleRowClick = (userId: string) => {
    router.push(`/dashboard/users/${userId}`);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    const month = payload.name;
    const monthIndex = payload.monthIndex;

    const transactionsForMonth = allTransactions.filter(tx => tx.monthIndex === monthIndex);
    setMonthlyTransactions({ month, transactions: transactionsForMonth });
  };
  
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome {adminName}!</h1>
        <p className="text-muted-foreground">Welcome back, {adminName}. Here's an overview of your Payment gateway.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" asChild>
          <Link href="/dashboard/analytics">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Platform Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1,452,231.89</div>
              <p className="text-xs text-muted-foreground">
                +15.2% from last month
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/dashboard/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Merchants
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              +201 since last month
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsAllTransactionsOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+572,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => router.push('/dashboard/fraud-detection')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Fraud Alerts
            </CardTitle>
            <ShieldAlert className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              -5% from last week
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
             <CardDescription>
                Overview of new merchants and transaction volume.
              </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data} onClick={handleBarClick}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar
                  dataKey="total"
                  fill="currentColor"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary cursor-pointer"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="p-6 pb-4">
                <CardTitle>Recent Merchant Signups</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="px-6">Merchant</TableHead>
                            <TableHead className="text-right px-6">Plan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentSignups.map((signup) => (
                            <TableRow key={signup.email} onClick={() => handleRowClick(signup.id)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell className="px-6 py-4">
                                    <div className="font-medium">{signup.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {signup.email}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right px-6 py-4">
                                    <Badge variant={signup.plan === 'Free' ? 'secondary' : 'default'} className="capitalize">{signup.plan}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

       <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              Full details for transaction {selectedTransaction?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4 py-4">
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction ID:</span>
                   <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{selectedTransaction.id}</span>
                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.id, 'Transaction ID')} />
                    </div>
              </div>
              <Separator />
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer:</span>
                  <div className="flex items-center gap-2">
                      <div className="text-right">
                          <p className="font-semibold">{selectedTransaction.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedTransaction.email}</p>
                      </div>
                      <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.email, 'Customer Email')} />
                  </div>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">${selectedTransaction.amount}</span>
              </div>
              <Separator />
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedTransaction.status === 'Success' ? 'default' : 'destructive'}>{selectedTransaction.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!monthlyTransactions} onOpenChange={() => setMonthlyTransactions(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transactions for {monthlyTransactions?.month}</DialogTitle>
            <DialogDescription>
                A list of all transactions that occurred in {monthlyTransactions?.month}.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {monthlyTransactions?.transactions.map((tx) => (
                        <TableRow key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer">
                            <TableCell className="font-medium">{tx.id}</TableCell>
                            <TableCell>{tx.name}</TableCell>
                            <TableCell>
                                <Badge variant={tx.status === 'Success' ? 'default' : 'destructive'}>{tx.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">${tx.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {monthlyTransactions?.transactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No transactions found for {monthlyTransactions.month}.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonthlyTransactions(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isAllTransactionsOpen} onOpenChange={setIsAllTransactionsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>All Platform Transactions</DialogTitle>
            <DialogDescription>
                A complete list of all transactions processed across the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allTransactions.map((tx) => (
                        <TableRow key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer">
                            <TableCell className="font-medium">{tx.id}</TableCell>
                            <TableCell>{tx.name}</TableCell>
                            <TableCell>
                                <Badge variant={tx.status === 'Success' ? 'default' : 'destructive'}>{tx.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">${tx.amount}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllTransactionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

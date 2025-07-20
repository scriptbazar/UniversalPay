
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

// --- MOCK DATA REMOVED ---
const chartData: any[] = [];
const allTransactions: any[] = [];
const recentSignups: any[] = [];
type Transaction = { id: string; name: string; email: string; amount: string; status: string; date: Date };
// --- END MOCK DATA REMOVED ---


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

    // In a real app, you would fetch transactions for the selected month.
    setMonthlyTransactions({ month, transactions: [] });
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
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                No data available
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data available
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsAllTransactionsOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data available
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              No data available
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
              <BarChart data={chartData} onClick={handleBarClick}>
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
                        {recentSignups.length > 0 ? recentSignups.map((signup) => (
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
                        )) : (
                           <TableRow>
                               <TableCell colSpan={2} className="text-center p-8">No recent signups.</TableCell>
                           </TableRow>
                        )}
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

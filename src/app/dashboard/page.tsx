
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
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import React, { useState, useEffect } from "react";

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
import Image from "next/image";

type Transaction = { id: string; name: string; email: string; amount: string; status: 'Success' | 'Failed'; date: Date };
type Signup = { id: string; name: string; email: string; plan: string; status: string; avatar: string };

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const adminName = "Admin"; // Placeholder for the admin's name

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedSignup, setSelectedSignup] = useState<Signup | null>(null);
  const [monthlyTransactions, setMonthlyTransactions] = useState<{ month: string, transactions: Transaction[] } | null>(null);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);

  // State for mock data to avoid hydration errors
  const [chartData, setChartData] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentSignups, setRecentSignups] = useState<Signup[]>([]);

  useEffect(() => {
    // Generate mock data on the client side
    const generateAllTransactions = (): Transaction[] => {
      return Array.from({ length: 50 }, (_, i) => {
          const monthIndex = Math.floor(i / 4);
          const date = new Date(2023, monthIndex, (i % 28) + 1);
          return {
              id: `TXN${12345 + i}`,
              name: `Customer ${i + 1}`,
              email: `customer${i + 1}@example.com`,
              amount: (Math.random() * 500 + 20).toFixed(2),
              status: Math.random() > 0.1 ? "Success" : "Failed",
              date: date
          }
      });
    };

    const allTxns = generateAllTransactions();
    setAllTransactions(allTxns);
    
    setRecentSignups([
      { id: "user_1", name: "Alice Johnson", email: "alice@example.com", plan: "Pro", status: "Active", avatar: "https://placehold.co/40x40.png?text=A" },
      { id: "user_2", name: "Bob Williams", email: "bob@example.com", plan: "Free", status: "Active", avatar: "https://placehold.co/40x40.png?text=B" },
      { id: "user_3", name: "Charlie Brown", email: "charlie@example.com", plan: "Premium", status: "Suspended", avatar: "https://placehold.co/40x40.png?text=C" },
      { id: "user_4", name: "Diana Miller", email: "diana@example.com", plan: "Pro", status: "Active", avatar: "https://placehold.co/40x40.png?text=D" },
    ]);

    setChartData([
      { name: 'Jan', revenue: Math.floor(Math.random() * 5000) + 1000, newUsers: Math.floor(Math.random() * 30) + 10, monthIndex: 0 },
      { name: 'Feb', revenue: Math.floor(Math.random() * 5000) + 1000, newUsers: Math.floor(Math.random() * 30) + 10, monthIndex: 1 },
      { name: 'Mar', revenue: Math.floor(Math.random() * 5000) + 1000, newUsers: Math.floor(Math.random() * 30) + 10, monthIndex: 2 },
      { name: 'Apr', revenue: Math.floor(Math.random() * 5000) + 1000, newUsers: Math.floor(Math.random() * 30) + 10, monthIndex: 3 },
      { name: 'May', revenue: Math.floor(Math.random() * 5000) + 1000, newUsers: Math.floor(Math.random() * 30) + 10, monthIndex: 4 },
      { name: 'Jun', revenue: Math.floor(Math.random() * 5000) + 1000, newUsers: Math.floor(Math.random() * 30) + 10, monthIndex: 5 },
    ]);

  }, []);

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

    const transactionsForMonth = allTransactions.filter(tx => tx.date.getMonth() === monthIndex);
    setMonthlyTransactions({ month, transactions: transactionsForMonth });
  };
  
  const successfulTransactions = allTransactions.filter(tx => tx.status === 'Success');
  
  const getStatusBadgeVariant = (status: string) => {
    return status === 'Active' ? 'default' : 'destructive';
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
              <div className="text-2xl font-bold">${successfulTransactions.reduce((acc, tx) => acc + parseFloat(tx.amount), 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                from {successfulTransactions.length} successful transactions
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
            <div className="text-2xl font-bold">{recentSignups.length}</div>
            <p className="text-xs text-muted-foreground">
              +4 in the last week
            </p>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setIsAllTransactionsOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              Total attempted transactions
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
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Review required
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
             <CardDescription>
                Click on a bar to see monthly transaction details.
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
                  yAxisId="left"
                  orientation="left"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value/1000}K`}
                />
                 <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                    contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 'var(--radius)' 
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  name="Revenue"
                />
                 <Bar
                  yAxisId="right"
                  dataKey="newUsers"
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  name="New Users"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-2xl">Recent Merchant Signups</CardTitle>
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
                            <TableRow key={signup.email} onClick={() => setSelectedSignup(signup)} className="cursor-pointer hover:bg-muted/50">
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
             {allTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No transactions found.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAllTransactionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedSignup} onOpenChange={() => setSelectedSignup(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merchant Details</DialogTitle>
            <DialogDescription>
              Details for merchant {selectedSignup?.name}.
            </DialogDescription>
          </DialogHeader>
          {selectedSignup && (
             <div className="space-y-4 py-4">
               <div className="flex items-center gap-4">
                  <Image src={selectedSignup.avatar} alt={selectedSignup.name} width={64} height={64} className="rounded-full" data-ai-hint="user avatar" />
                  <div>
                    <h3 className="text-lg font-semibold">{selectedSignup.name}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground">{selectedSignup.email}</p>
                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedSignup.email, 'Email')} />
                    </div>
                  </div>
               </div>
               <Separator />
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <p className="text-sm text-muted-foreground">Plan</p>
                   <p className="font-semibold">{selectedSignup.plan}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-sm text-muted-foreground">Status</p>
                   <Badge variant={getStatusBadgeVariant(selectedSignup.status)}>{selectedSignup.status}</Badge>
                 </div>
               </div>
             </div>
          )}
          <DialogFooter className="justify-between">
             <Button variant="outline" onClick={() => setSelectedSignup(null)}>Close</Button>
             <Button variant="default" asChild>
                <Link href={`/dashboard/users/${selectedSignup?.id}`}>View Full Profile</Link>
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


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

type Transaction = { id: string; name: string; email: string; amount: string; status: 'Success' | 'Failed'; date: Date; method: string; merchantId: string; };
type Signup = { id: string; name: string; email: string; plan: string; status: string; avatar: string; role?: string; };

export default function AdminDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const adminName = "Admin"; // Placeholder for the admin's name

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedSignup, setSelectedSignup] = useState<Signup | null>(null);

  // State for mock data to avoid hydration errors
  const [chartData, setChartData] = useState<any[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentSignups, setRecentSignups] = useState<Signup[]>([]);
  const [dialogContent, setDialogContent] = useState<{ title: string; data: React.ReactNode } | null>(null);


  useEffect(() => {
    // Generate mock data on the client side
    const generateAllTransactions = (): Transaction[] => {
      const methods = ["UPI", "Crypto", "Page", "Link"];
      return Array.from({ length: 50 }, (_, i) => {
          const monthIndex = Math.floor(i / 4);
          const date = new Date(2023, monthIndex, (i % 28) + 1);
          return {
              id: `TXN${12345 + i}`,
              name: `Customer ${i + 1}`,
              email: `customer${i + 1}@example.com`,
              amount: (Math.random() * 500 + 20).toFixed(2),
              status: Math.random() > 0.1 ? "Success" : "Failed",
              date: date,
              method: methods[i % 4],
              merchantId: `user_${(i%4)+1}`
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
      { name: 'Jan', revenue: 4000, newUsers: 24, totalTransactions: 400, monthIndex: 0 },
      { name: 'Feb', revenue: 3000, newUsers: 18, totalTransactions: 350, monthIndex: 1 },
      { name: 'Mar', revenue: 5000, newUsers: 32, totalTransactions: 500, monthIndex: 2 },
      { name: 'Apr', revenue: 4500, newUsers: 28, totalTransactions: 480, monthIndex: 3 },
      { name: 'May', revenue: 6000, newUsers: 40, totalTransactions: 550, monthIndex: 4 },
      { name: 'Jun', revenue: 5800, newUsers: 35, totalTransactions: 520, monthIndex: 5 },
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
    const month = payload.name.toLowerCase();

    const monthDetails = (
        <div className="space-y-4">
            <Button
                variant="outline"
                className="w-full justify-between h-auto py-3 text-base"
                onClick={() => {
                    router.push(`/dashboard/analytics/details/new-users_${month}`);
                    setDialogContent(null);
                }}
            >
                <span>Total Users</span>
                <span className="font-bold">{payload.newUsers}</span>
            </Button>
            <Button
                variant="outline"
                className="w-full justify-between h-auto py-3 text-base"
                onClick={() => {
                    router.push(`/dashboard/analytics/details/total-transactions_${month}`);
                    setDialogContent(null);
                }}
            >
                <span>Total Transactions</span>
                <span className="font-bold">{payload.totalTransactions}</span>
            </Button>
        </div>
    );
    setDialogContent({
        title: `Summary for ${payload.name}`,
        data: monthDetails,
    });
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
        <Card asChild>
          <Link href="/dashboard/analytics" className="cursor-pointer hover:bg-muted/50 transition-colors">
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
        <Card asChild>
          <Link href="/dashboard/users" className="cursor-pointer hover:bg-muted/50 transition-colors">
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
          </Link>
        </Card>
        <Card asChild>
          <Link href="/dashboard/transactions" className="cursor-pointer hover:bg-muted/50 transition-colors">
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
          </Link>
        </Card>
        <Card asChild>
          <Link href="/dashboard/fraud-detection" className="cursor-pointer hover:bg-muted/50 transition-colors">
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
          </Link>
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
                  <span className="text-muted-foreground">Method:</span>
                  <span className="font-semibold">{selectedTransaction.method}</span>
              </div>
              <Separator />
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={selectedTransaction.status === 'Success' ? 'default' : 'destructive'}>{selectedTransaction.status}</Badge>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>Close</Button>
            {selectedTransaction && (
              <Button asChild>
                <Link href={`/dashboard/users/${selectedTransaction.merchantId}`}>View Merchant Profile</Link>
              </Button>
            )}
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
          <DialogFooter className="sm:justify-between gap-2">
             <Button variant="ghost" onClick={() => setSelectedSignup(null)}>Close</Button>
             <Button variant="default" asChild>
                <Link href={`/dashboard/users/${selectedSignup?.id}`}>View Full Profile</Link>
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>{dialogContent?.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {dialogContent?.data}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setDialogContent(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

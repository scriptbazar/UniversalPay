
'use client';

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Copy,
} from "lucide-react"
import React, { useState, useEffect, useMemo } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import Link from "next/link"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, limit, onSnapshot, getDocs, Timestamp } from "firebase/firestore";
import { toDateSafe } from "@/lib/utils";


type Transaction = {
    id: string;
    merchantId: string;
    customerEmail: string;
    status: "Success" | "Failed" | "Pending";
    method: string;
    date: Date;
    amount: string;
};


export default function Dashboard() {
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactionsData, setRecentTransactionsData] = useState<Transaction[]>([]);
  const [merchantName, setMerchantName] = useState("Merchant");
  const [chartData, setChartData] = useState<any[]>([]);
  const [customerCount, setCustomerCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setMerchantName(userDoc.data().fullName || "Merchant");
            }

            // Fetch merchant's transactions
            const transactionsCol = collection(db, "transactions");
            const q = query(
                transactionsCol,
                where("merchantId", "==", user.uid),
                orderBy("date", "desc")
            );

            const unsubscribeTransactions = onSnapshot(q, (querySnapshot) => {
                const fetchedTransactions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    date: toDateSafe(doc.data().date),
                } as Transaction));
                setAllTransactions(fetchedTransactions);
                setRecentTransactionsData(fetchedTransactions.slice(0, 5)); // Get top 5 recent transactions

                // Process data for the chart
                const monthlyData: { [key: string]: { revenue: number }} = {};
                 fetchedTransactions.forEach(tx => {
                    const month = tx.date.toLocaleString('default', { month: 'short' });
                     if (!monthlyData[month]) {
                      monthlyData[month] = { revenue: 0 };
                    }
                    if (tx.status === 'Success') {
                      monthlyData[month].revenue += parseFloat(tx.amount);
                    }
                  });

                const chartDataArray = Object.keys(monthlyData).map(month => ({
                    name: month,
                    ...monthlyData[month]
                  })).sort((a, b) => {
                      // Sort by month name (simple alphabetical for now, can improve with date parsing if needed)
                      const monthsOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      return monthsOrder.indexOf(a.name) - monthsOrder.indexOf(b.name);
                  });
                setChartData(chartDataArray);

            }, (error) => {
                console.error("Error fetching merchant transactions:", error);
                 toast({
                    variant: "destructive",
                    title: "Failed to load transactions",
                    description: error.message,
                });
            });

            // Fetch customer count
            const customersCol = collection(db, "customers");
            const customerQuery = query(customersCol, where("merchantId", "==", user.uid));
            const customerSnapshot = await getDocs(customerQuery);
            setCustomerCount(customerSnapshot.size);

            return () => unsubscribeTransactions(); // Cleanup listener

        } else {
            setMerchantName("Merchant");
            setAllTransactions([]);
            setRecentTransactionsData([]);
            setChartData([]);
        }
    });
    return () => unsubscribe(); // Cleanup auth listener
  }, [toast]);


  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    const monthSlug = payload.name.toLowerCase();
    router.push(`/merchant/analytics/transactions/${monthSlug}`);
  };
  
    const getStatusBadgeVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'success': return 'default';
            case 'pending': return 'secondary';
            case 'failed': return 'destructive';
            default: return 'outline';
        }
    };

  // Calculate total revenue from fetched transactions
  const totalRevenue = useMemo(() => {
    return allTransactions
      .filter(tx => tx.status === 'Success')
      .reduce((acc, tx) => acc + parseFloat(tx.amount), 0)
      .toFixed(2);
  }, [allTransactions]);

  const successRate = useMemo(() => {
      if (allTransactions.length === 0) return "0.0%";
      const successfulTxns = allTransactions.filter(tx => tx.status === 'Success').length;
      return `${((successfulTxns / allTransactions.length) * 100).toFixed(1)}%`;
  }, [allTransactions]);


  return (
    <div className="flex flex-col gap-4">
        <div className="mb-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back, {merchantName}!</h1>
            <p className="text-muted-foreground">Here's an overview of your account and recent activity.</p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card asChild className="cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Link href="/merchant/analytics">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue}</div>
              <p className="text-xs text-muted-foreground">
                All-time successful payments
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card asChild className="cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Link href="/merchant/customers">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{customerCount}</div>
              <p className="text-xs text-muted-foreground">
                Total customers who paid you
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card asChild className="cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Link href="/merchant/payments">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Total transactions attempted
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card asChild className="cursor-pointer hover:bg-muted/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <Link href="/merchant/analytics">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Success Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}</div>
              <p className="text-xs text-muted-foreground">
                Of all attempted transactions
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Click on a month to view its transactions.</CardDescription>
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
                    tickFormatter={(value) => `$${value/1000}K`}
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
                    <Legend iconType="circle" />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Recent Transactions</CardTitle>
              <Button asChild variant="link" className="text-sm">
                <Link href="/merchant/payments">
                    View all
                </Link>
              </Button>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactionsData.length > 0 ? recentTransactionsData.map((tx) => (
                    <TableRow key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer">
                        <TableCell>
                            <div className="font-medium">{tx.customerEmail}</div>
                        </TableCell>
                        <TableCell className="text-right">${tx.amount}</TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                         <TableCell colSpan={2} className="text-center p-4">No recent transactions.</TableCell>
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
                  <span className="text-muted-foreground">Customer Email:</span>
                  <div className="flex items-center gap-2">
                      <div className="text-right">
                          <p className="text-sm text-muted-foreground">{selectedTransaction.customerEmail}</p>
                      </div>
                      <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.customerEmail, 'Customer Email')} />
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
                  <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
              </div>
               <Separator />
              <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-semibold">{selectedTransaction.date.toLocaleString()}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

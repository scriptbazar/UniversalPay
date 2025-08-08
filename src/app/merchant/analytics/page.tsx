
'use client';

import { DollarSign, Users, CreditCard, Percent, Copy, ExternalLink, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, Bar, BarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, onSnapshot, Timestamp, limit } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

type Transaction = {
    id: string;
    method: string;
    amount: string;
    date: Date;
    status: 'Successful' | 'Failed' | 'Pending';
};

type Customer = {
    id: string;
    email: string;
    name: string;
    totalSpent: number;
};

const toDateSafe = (dateFieldValue: any): Date => {
  if (!dateFieldValue) return new Date();
  if (dateFieldValue instanceof Date) {
    return dateFieldValue;
  }
  if (dateFieldValue.toDate && typeof dateFieldValue.toDate === 'function') {
    return dateFieldValue.toDate();
  }
  if (typeof dateFieldValue === 'string' || typeof dateFieldValue === 'number') {
    const date = new Date(dateFieldValue);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return new Date();
};

export default function AnalyticsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<Customer[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [stats, setStats] = useState({
      totalRevenue: 0,
      totalTransactions: 0,
      successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        router.push('/login');
        return;
      }

      setLoading(true);

      const transactionsRef = collection(db, "transactions");
      const transQuery = query(transactionsRef, where("merchantId", "==", user.uid), orderBy("date", "desc"));
      
      const unsubscribeTransactions = onSnapshot(transQuery, (querySnapshot) => {
        const transactions = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            date: toDateSafe(data.date)
          } as Transaction;
        });

        const successfulTxns = transactions.filter(t => t.status === 'Successful');
        const totalRevenue = successfulTxns.reduce((acc, t) => acc + parseFloat(t.amount), 0);
        const successRate = transactions.length > 0 ? (successfulTxns.length / transactions.length) * 100 : 0;
        
        setStats({
          totalRevenue,
          totalTransactions: transactions.length,
          successRate
        });

        const monthlyRevenue: { [key: string]: number } = {};
        successfulTxns.forEach(tx => {
          const month = tx.date.toLocaleString('default', { month: 'short' });
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(tx.amount);
        });
        const revenueChartData = Object.keys(monthlyRevenue).map(month => ({ name: month, revenue: monthlyRevenue[month] }));
        setRevenueData(revenueChartData);

        const methodCounts: { [key: string]: number } = {};
        successfulTxns.forEach(tx => {
          methodCounts[tx.method] = (methodCounts[tx.method] || 0) + 1;
        });
        const paymentMethodChartData = Object.keys(methodCounts).map((method) => ({
          name: method,
          value: methodCounts[method],
          color: { UPI: '#0088FE', Crypto: '#00C49F', Page: '#FFBB28', Link: '#FF8042', Card: '#AF69EE' }[method] || '#8884d8'
        }));
        setPaymentMethodData(paymentMethodChartData);
      }, (error) => {
          console.error("Error fetching transactions: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load transaction data.' });
      });

      const customersRef = collection(db, "customers");
      const customerQuery = query(customersRef, where("merchantId", "==", user.uid), orderBy("totalSpent", "desc"), limit(5));
      const unsubscribeCustomers = onSnapshot(customerQuery, (snapshot) => {
        const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
        setTopCustomers(customers);
        setLoading(false); // Set loading to false after both fetches are initiated
      }, (error) => {
          console.error("Error fetching customers: ", error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not load customer data.' });
          setLoading(false);
      });
      
      return () => {
        unsubscribeTransactions();
        unsubscribeCustomers();
      };
    });

    return () => unsubscribeAuth();
  }, [router, toast]);

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    const monthSlug = payload.name.toLowerCase();
    router.push(`/merchant/analytics/transactions/${monthSlug}`);
  };

  const handlePieClick = (data: any) => {
     const methodName = data.name;
     router.push(`/merchant/analytics/transactions-by-method/${methodName.toLowerCase()}`);
  };
  
  const handleCustomerClick = (customer: Customer) => {
    router.push(`/merchant/customers/${customer.id}`);
  };
  
  const handleStatCardClick = (stat: 'revenue' | 'transactions' | 'success' | 'customers') => {
    switch (stat) {
      case 'revenue':
        router.push('/merchant/analytics/revenue');
        break;
      case 'transactions':
        router.push('/merchant/payments');
        break;
      case 'success':
        router.push('/merchant/payments?filter=success');
        break;
      case 'customers':
         router.push('/merchant/customers');
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Analytics</h1>
        <p className="text-muted-foreground">Insights into your revenue, customers, and transaction performance.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => handleStatCardClick('revenue')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">Total from successful transactions</p>}
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/merchant/payments')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.totalTransactions}</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">All transaction attempts</p>}
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/merchant/payments?filter=success')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>}
            {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">Based on all transaction attempts</p>}
          </CardContent>
        </Card>
         <Card onClick={() => handleStatCardClick('customers')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">{topCustomers.length}</div>}
            <p className="text-xs text-muted-foreground">View your most frequent payers.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Click a bar to see transaction details for that month. Shows successful transactions only.</CardDescription>
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-[350px] w-full" /> :
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData} onClick={handleBarClick}>
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
                  tickFormatter={(value) => `$${value / 1000}K`} 
                />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  cursor={{fill: 'hsl(var(--muted))'}}
                />
                <Legend />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
            }
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Payment Methods Breakdown</CardTitle>
                <CardDescription>Distribution of successful transactions by type. Click a slice for details.</CardDescription>
            </CardHeader>
            <CardContent>
                 {loading ? <Skeleton className="h-[350px] w-full" /> :
                <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                        <Pie 
                            data={paymentMethodData} 
                            dataKey="value" 
                            nameKey="name" 
                            cx="50%" 
                            cy="50%" 
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            onClick={handlePieClick} 
                            className="cursor-pointer" 
                            stroke="none"
                        >
                            {paymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ 
                                backgroundColor: 'hsl(var(--background))', 
                                border: 'none',
                                borderRadius: 'var(--radius)' 
                            }}
                        />
                         <Legend />
                    </PieChart>
                </ResponsiveContainer>
                }
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex justify-between items-center">
                <div>
                    <CardTitle>Top Customers</CardTitle>
                    <CardDescription>Your most valuable customers by total amount spent.</CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/merchant/customers">View All <ArrowRight className="ml-2 h-4 w-4"/></Link>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                  <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead className="text-right">Total Spent</TableHead>
                  </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={2}><Skeleton className="h-10 w-full" /></TableCell></TableRow>
                ) : topCustomers.length > 0 ? (
                    topCustomers.map(customer => (
                      <TableRow key={customer.email} onClick={() => handleCustomerClick(customer)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </TableCell>
                          <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                ) : (
                    <TableRow><TableCell colSpan={2} className="text-center h-24">No customers found yet.</TableCell></TableRow>
                )}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


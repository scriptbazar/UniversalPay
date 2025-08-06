'use client';

import { DollarSign, Users, CreditCard, Percent, Copy, ExternalLink, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, Bar, BarChart, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

type Transaction = {
    id: string;
    method: string;
    amount: string;
    date: string;
    status: 'Successful' | 'Failed';
};

type TopCustomer = {
    email: string;
    name: string;
    totalSpent: number;
    id: string;
};

export default function AnalyticsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            setLoading(true);
            const transactionsRef = collection(db, "transactions");
            const q = query(transactionsRef, where("merchantId", "==", user.uid), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const transactions = querySnapshot.docs.map(doc => doc.data());

            // Process revenue data
            const monthlyRevenue: { [key: string]: number } = {};
            transactions.forEach(tx => {
                if(tx.status === 'Successful') {
                    const month = new Date(tx.date).toLocaleString('default', { month: 'short' });
                    if (!monthlyRevenue[month]) {
                        monthlyRevenue[month] = 0;
                    }
                    monthlyRevenue[month] += parseFloat(tx.amount);
                }
            });
            const revenueChartData = Object.keys(monthlyRevenue).map(month => ({ name: month, revenue: monthlyRevenue[month] }));
            setRevenueData(revenueChartData);

            // Process payment method data
            const methodCounts: { [key: string]: number } = {};
            transactions.forEach(tx => {
                 if(tx.status === 'Successful') {
                    if(!methodCounts[tx.method]) {
                        methodCounts[tx.method] = 0;
                    }
                    methodCounts[tx.method]++;
                 }
            });
            const paymentMethodChartData = Object.keys(methodCounts).map(method => ({
                name: method,
                value: methodCounts[method],
                color: {UPI: '#0088FE', Crypto: '#00C49F', Page: '#FFBB28', Link: '#FF8042'}[method] || '#8884d8'
            }));
            setPaymentMethodData(paymentMethodChartData);
            
            // Process top customers
            // This is a simplified version. In a real app, this might be a more complex aggregation.
            const customerSpending: { [key: string]: { total: number, name: string } } = {};
            const customersRef = collection(db, "customers"); // Assuming you have a customers collection
            const customerQuery = query(customersRef, where("merchantId", "==", user.uid));
            const customerSnapshot = await getDocs(customerQuery);
            const customers = customerSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

            setTopCustomers(customers.sort((a,b) => b.totalSpent - a.totalSpent).slice(0, 5));

            setLoading(false);
        }
    });

    return () => unsubscribe();
  }, []);

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    const monthName = payload.name;
    const monthSlug = monthName.toLowerCase();
    router.push(`/merchant/analytics/transactions/${monthSlug}`);
  };

  const handlePieClick = (data: any) => {
     const methodName = data.name;
     router.push(`/merchant/analytics/transactions-by-method/${methodName.toLowerCase()}`);
  };
  
  const handleCustomerClick = (customer: TopCustomer) => {
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


  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
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
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/merchant/payments')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/merchant/payments?filter=success')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last month</p>
          </CardContent>
        </Card>
         <Card onClick={() => handleStatCardClick('customers')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topCustomers.length}</div>
            <p className="text-xs text-muted-foreground">View your most frequent payers.</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
            <CardDescription>Click a bar to see transaction details for that month.</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
         <Card>
            <CardHeader>
                <CardTitle>Payment Methods Breakdown</CardTitle>
                <CardDescription>Distribution of transactions by type. Click a slice for details.</CardDescription>
            </CardHeader>
            <CardContent>
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
                  {topCustomers.map(customer => (
                      <TableRow key={customer.email} onClick={() => handleCustomerClick(customer)} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                              <div className="font-medium">{customer.name}</div>
                              <div className="text-sm text-muted-foreground">{customer.email}</div>
                          </TableCell>
                          <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                      </TableRow>
                  ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

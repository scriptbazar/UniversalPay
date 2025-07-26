
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

type Transaction = {
    id: string;
    method: string;
    amount: string;
    date: string;
    status: 'Successful' | 'Failed';
};

const mockTransactions: Transaction[] = Array.from({ length: 100 }, (_, i) => {
    const monthIndex = Math.floor(i / 8); // Spread across 12 months
    const date = new Date(2023, monthIndex, (i % 28) + 1);
    return {
        id: `TXN20${i + 1}`,
        method: ['UPI', 'Crypto', 'Page', 'Link'][i % 4],
        amount: (Math.random() * 250).toFixed(2),
        date: date.toISOString().split('T')[0], // YYYY-MM-DD
        status: Math.random() > 0.2 ? 'Successful' : 'Failed'
    };
});

const initialRevenueData = [
  { name: 'Jan', revenue: 4000, monthIndex: 0 },
  { name: 'Feb', revenue: 3000, monthIndex: 1 },
  { name: 'Mar', revenue: 5000, monthIndex: 2 },
  { name: 'Apr', revenue: 4500, monthIndex: 3 },
  { name: 'May', revenue: 6000, monthIndex: 4 },
  { name: 'Jun', revenue: 5500, monthIndex: 5 },
  { name: 'Jul', revenue: 6200, monthIndex: 6 },
  { name: 'Aug', revenue: 7000, monthIndex: 7 },
  { name: 'Sep', revenue: 6800, monthIndex: 8 },
  { name: 'Oct', revenue: 7500, monthIndex: 9 },
  { name: 'Nov', revenue: 7100, monthIndex: 10 },
  { name: 'Dec', revenue: 8000, monthIndex: 11 },
];

type TopCustomer = {
    email: string;
    name: string;
    totalSpent: number;
};

const initialTopCustomers: TopCustomer[] = [
    { email: 'liam@example.com', name: 'Liam Johnson', totalSpent: 250.00 },
    { email: 'olivia@example.com', name: 'Olivia Smith', totalSpent: 150.00 },
    { email: 'noah@example.com', name: 'Noah Williams', totalSpent: 350.00 },
    { email: 'emma@example.com', name: 'Emma Brown', totalSpent: 450.00 },
    { email: 'ava@example.com', name: 'Ava Jones', totalSpent: 200.00 },
];

const initialPaymentMethodData = [
    { name: 'UPI', value: 400, color: '#0088FE' },
    { name: 'Crypto', value: 300, color: '#00C49F' },
    { name: 'Page', value: 300, color: '#FFBB28' },
    { name: 'Link', value: 150, color: '#FF8042' },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Successful': return 'default';
        case 'Failed': return 'destructive';
        default: return 'secondary';
    }
};

const PaginatedTransactionTable = ({ transactions }: { transactions: Transaction[] }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(transactions.length / itemsPerPage);

    const paginatedData = transactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedData.map(tx => (
                        <TableRow key={tx.id}>
                            <TableCell>{tx.id}</TableCell>
                            <TableCell>${tx.amount}</TableCell>
                            <TableCell>{tx.date}</TableCell>
                            <TableCell><Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="flex justify-between items-center w-full pt-4">
                <div className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default function AnalyticsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [dialogContent, setDialogContent] = useState<{ title: string; description: string; data: React.ReactNode; } | null>(null);
  
  useEffect(() => {
    // Set data on client-side to avoid hydration errors
    setRevenueData(initialRevenueData);
    setTopCustomers(initialTopCustomers);
    setPaymentMethodData(initialPaymentMethodData);
  }, []);

  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
    const month = payload.name;
    const monthIndex = payload.monthIndex;

    const transactionsForMonth = mockTransactions.filter(tx => new Date(tx.date).getMonth() === monthIndex);
    
    setDialogContent({
        title: `Transactions for ${month}`,
        description: `A list of all transactions that occurred in ${month}.`,
        data: <PaginatedTransactionTable transactions={transactionsForMonth} />
    });
  };

  const handlePieClick = (data: any) => {
     const methodName = data.name;
     const transactions = mockTransactions.filter(t => t.method === methodName);
     setDialogContent({ 
        title: `${methodName} Transactions`, 
        description: `List of recent transactions made via ${methodName}.`, 
        data: <PaginatedTransactionTable transactions={transactions} />
    });
  };
  
  const handleCustomerClick = (customer: TopCustomer) => {
    router.push(`/merchant/customers/${customer.email.split('@')[0]}`);
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
        const successfulTxns = mockTransactions.filter(t => t.status === 'Successful').length;
        const totalTxns = mockTransactions.length;
        
        const openTxnList = (filter: 'success' | 'failed' | 'all') => {
            router.push(`/merchant/payments?filter=${filter}`);
        };

        setDialogContent({
          title: "Success Rate Details",
          description: "Breakdown of your transaction success rate. Click a row to view details.",
          data: (
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-between h-auto py-2" onClick={() => openTxnList('all')}>
                  <span>Total Transactions:</span> <span className="font-bold">{totalTxns}</span>
              </Button>
              <Button variant="ghost" className="w-full justify-between h-auto py-2" onClick={() => openTxnList('success')}>
                  <span>Successful Transactions:</span> <span className="font-bold">{successfulTxns}</span>
              </Button>
               <Button variant="ghost" className="w-full justify-between h-auto py-2" onClick={() => openTxnList('failed')}>
                  <span>Failed Transactions:</span> <span className="font-bold">{totalTxns - successfulTxns}</span>
              </Button>
              <Separator className="my-2"/>
              <div className="flex justify-between text-lg p-2"><span>Success Rate:</span> <span className="font-bold">98.2%</span></div>
            </div>
          )
        });
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
        <Card onClick={() => handleStatCardClick('transactions')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('success')} className="cursor-pointer hover:bg-muted/50 transition-colors">
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
                        <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} label onClick={handlePieClick} className="cursor-pointer">
                            {paymentMethodData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                         <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Your most valuable customers by total amount spent. Click a row for details.</CardDescription>
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
      
      <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>{dialogContent?.title}</DialogTitle>
                <DialogDescription>{dialogContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                {dialogContent?.data}
            </div>
            <DialogFooter>
                <Button onClick={() => setDialogContent(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

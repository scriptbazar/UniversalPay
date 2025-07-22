
'use client';

import { DollarSign, Users, CreditCard, CheckCircle, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Transaction = {
    id: string;
    method: string;
    amount: string;
    date: string;
    status: 'Successful' | 'Failed';
};

const mockTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
    id: `TXN10${i + 1}`,
    method: ['UPI', 'Crypto', 'Page', 'Bank Transfer'][i % 4],
    amount: (Math.random() * 500).toFixed(2),
    date: `2023-11-${(i % 10) + 1}`,
    status: Math.random() > 0.2 ? 'Successful' : 'Failed'
}));

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
  const router = useRouter();
  const [dialogContent, setDialogContent] = useState<{ title: string; description: string; data: React.ReactNode; } | null>(null);

  // State for mock data to avoid hydration errors
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate mock data on the client side
    setRevenueData([
        { month: 'Jan', revenue: 4000, newUsers: 24, totalTransactions: 400, successfulTransactions: 380 },
        { month: 'Feb', revenue: 3000, newUsers: 18, totalTransactions: 350, successfulTransactions: 320 },
        { month: 'Mar', revenue: 5000, newUsers: 32, totalTransactions: 500, successfulTransactions: 480 },
        { month: 'Apr', revenue: 4500, newUsers: 28, totalTransactions: 480, successfulTransactions: 450 },
        { month: 'May', revenue: 6000, newUsers: 40, totalTransactions: 550, successfulTransactions: 530 },
        { month: 'Jun', revenue: 5800, newUsers: 35, totalTransactions: 520, successfulTransactions: 510 },
    ]);

    setPaymentMethodData([
        { name: 'UPI', value: 400, color: '#0088FE' },
        { name: 'Crypto', value: 300, color: '#00C49F' },
        { name: 'Page', value: 300, color: '#FFBB28' },
        { name: 'Bank Transfer', value: 200, color: '#FF8042' },
    ]);

    setGeoData([
        { country: 'India', flag: 'in', volume: 120500, transactions: 1250, merchants: 45 },
        { country: 'United States', flag: 'us', volume: 85200, transactions: 890, merchants: 22 },
        { country: 'United Kingdom', flag: 'gb', volume: 45300, transactions: 512, merchants: 15 },
        { country: 'Germany', flag: 'de', volume: 32100, transactions: 450, merchants: 18 },
        { country: 'Australia', flag: 'au', volume: 28000, transactions: 300, merchants: 8 },
    ]);
  }, []);

  
  const handleStatCardClick = (stat: string) => {
     switch(stat) {
         case 'volume':
             setDialogContent({ title: 'Total Volume Details', description: 'This is the sum of all successful transactions across the platform.', data: <p className="text-2xl font-bold">$2,86,300</p> });
             break;
         case 'payments':
             router.push(`/dashboard/analytics/details/successful-transactions_all`);
             break;
         case 'merchants':
            router.push(`/dashboard/analytics/details/new-merchants_all`);
             break;
        case 'avg_transaction':
            setDialogContent({ title: 'Average Transaction Value', description: 'The average value of a single transaction.', data: <p className="text-2xl font-bold">$125.50</p> });
            break;
     }
  };

    const handleBarClick = (data: any) => {
        if (!data || !data.activePayload) return;
        const payload = data.activePayload[0].payload;
        const monthSlug = payload.month.toLowerCase();

        setDialogContent({
            title: `Details for ${payload.month}`,
            description: `A snapshot of performance in ${payload.month}. Click a number to see details.`,
            data: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Revenue:</span> <span className="font-bold">${payload.revenue.toLocaleString()}</span></div>
                    
                    <Button variant="link" className="p-0 h-auto justify-between w-full" onClick={() => router.push(`/dashboard/analytics/details/new-users_${monthSlug}`)}>
                        <span>New Users:</span> <span className="font-bold">{payload.newUsers}</span>
                    </Button>
                    
                    <Button variant="link" className="p-0 h-auto justify-between w-full" onClick={() => router.push(`/dashboard/analytics/details/total-transactions_${monthSlug}`)}>
                       <span>Total Transactions:</span> <span className="font-bold">{payload.totalTransactions}</span>
                    </Button>

                    <Button variant="link" className="p-0 h-auto justify-between w-full" onClick={() => router.push(`/dashboard/analytics/details/successful-transactions_${monthSlug}`)}>
                        <span>Successful Transactions:</span> <span className="font-bold">{payload.successfulTransactions}</span>
                    </Button>
                </div>
            )
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

  const handleCountryClick = (country: any) => {
     router.push('/dashboard/users');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">An overview of the entire UniversalPay platform's performance.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => handleStatCardClick('volume')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,86,300</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('payments')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,670</div>
            <p className="text-xs text-muted-foreground">+12.4% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('merchants')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+177</div>
            <p className="text-xs text-muted-foreground">+8.1% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('avg_transaction')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$125.50</div>
            <p className="text-xs text-muted-foreground">+1.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & User Growth</CardTitle>
            <CardDescription>Monthly revenue and new merchant signups. Click on a bar to see details.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData} onClick={handleBarClick}>
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}K`} />
                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
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
                <Bar yAxisId="left" dataKey="revenue" fill="hsl(var(--primary))" name="Revenue" radius={[4, 4, 0, 0]} className="cursor-pointer" />
                <Bar yAxisId="right" dataKey="newUsers" fill="hsl(var(--accent))" name="New Users" radius={[4, 4, 0, 0]} className="cursor-pointer" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Breakdown by payment type. Click a slice for details.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={handlePieClick} className="cursor-pointer">
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
            <CardTitle>Geographical Performance</CardTitle>
            <CardDescription>Top countries by transaction volume.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Country</TableHead>
                        <TableHead>Volume (USD)</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Merchants</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {geoData.length > 0 ? geoData.map(geo => (
                        <TableRow key={geo.country}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Image src={`https://flagcdn.com/w40/${geo.flag.toLowerCase()}.png`} alt={`${geo.country} flag`} width={24} height={16} />
                                {geo.country}
                            </TableCell>
                            <TableCell>${geo.volume.toLocaleString()}</TableCell>
                            <TableCell>{geo.transactions.toLocaleString()}</TableCell>
                            <TableCell>{geo.merchants.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleCountryClick(geo)}>View Merchants</Button>
                            </TableCell>
                        </TableRow>
                    )) : (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center">No geographical data available.</TableCell>
                        </TableRow>
                    )}
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

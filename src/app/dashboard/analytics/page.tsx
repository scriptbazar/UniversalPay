
'use client';

import { DollarSign, Users, CreditCard, CheckCircle, Percent, Copy, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, where, Timestamp, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

const toDateSafe = (dateFieldValue: any): Date => {
  if (dateFieldValue instanceof Timestamp) {
    return dateFieldValue.toDate();
  }
  if (dateFieldValue && typeof dateFieldValue === 'string') {
    const date = new Date(dateFieldValue);
    if (!isNaN(date.getTime())) {
        return date;
    }
  }
  if (dateFieldValue && typeof dateFieldValue === 'number') {
    return new Date(dateFieldValue);
  }
  return new Date(); 
};

type Transaction = {
    id: string;
    method: string;
    amount: string;
    date: any; 
    status: 'Successful' | 'Failed' | 'Pending';
    customerEmail: string;
    merchantId: string;
};

type User = {
    id: string;
    country?: string;
    createdAt: any; 
};

const getStatusBadgeVariant = (status: string) => {
    switch (status) {
        case 'Successful': return 'default';
        case 'Failed': return 'destructive';
        default: return 'secondary';
    }
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dialogContent, setDialogContent] = useState<{ title: string; description: string; data: React.ReactNode; type: 'month' | 'payment-method' } | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [stats, setStats] = useState({
      totalVolume: 0,
      successfulPayments: 0,
      newMerchants: 0,
      avgTransaction: 0
  });

  const [geoCurrentPage, setGeoCurrentPage] = useState(1);
  const geoItemsPerPage = 5;

  useEffect(() => {
    setLoading(true);

    const usersQuery = query(collection(db, "users"));
    const transactionsQuery = query(collection(db, "transactions"));

    const unsubscribeUsers = onSnapshot(usersQuery, (usersSnapshot) => {
        const allUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        
        const unsubscribeTransactions = onSnapshot(transactionsQuery, (transactionsSnapshot) => {
            const allTransactions = transactionsSnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data(),
                date: toDateSafe(doc.data().date)
            } as Transaction));

            // --- Process Stats ---
            const successfulTxns = allTransactions.filter(t => t.status === 'Successful');
            const totalVolume = successfulTxns.reduce((acc, t) => acc + parseFloat(t.amount), 0);
            const successfulPayments = successfulTxns.length;
            const newMerchants = allUsers.length;
            const avgTransaction = successfulPayments > 0 ? totalVolume / successfulPayments : 0;
            setStats({ totalVolume, successfulPayments, newMerchants, avgTransaction });

            // --- Process Revenue Chart Data ---
            const monthlyData: { [key: string]: { revenue: number, newUsers: number, totalTransactions: number, successfulTransactions: number }} = {};
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            allTransactions.forEach(tx => {
                const date = toDateSafe(tx.date);
                const month = monthNames[date.getMonth()];
                if (!monthlyData[month]) {
                    monthlyData[month] = { revenue: 0, newUsers: 0, totalTransactions: 0, successfulTransactions: 0 };
                }
                monthlyData[month].totalTransactions++;
                if (tx.status === 'Successful') {
                    monthlyData[month].revenue += parseFloat(tx.amount);
                    monthlyData[month].successfulTransactions++;
                }
            });
             allUsers.forEach(user => {
                const date = toDateSafe(user.createdAt);
                const month = monthNames[date.getMonth()];
                 if (monthlyData[month]) {
                    monthlyData[month].newUsers++;
                }
            });

            const revenueChartData = monthNames.map(month => ({
                month: month,
                ... (monthlyData[month] || { revenue: 0, newUsers: 0, totalTransactions: 0, successfulTransactions: 0 })
            }));
            setRevenueData(revenueChartData);

            // --- Process Payment Method Chart ---
            const paymentMethods: { [key: string]: number } = {};
            successfulTxns.forEach(tx => {
                paymentMethods[tx.method] = (paymentMethods[tx.method] || 0) + 1;
            });
            const paymentMethodChartData = Object.keys(paymentMethods).map((name) => ({
                name,
                value: paymentMethods[name],
                color: { UPI: '#0088FE', Crypto: '#00C49F', Page: '#FFBB28', Link: '#FF8042', Card: '#AF69EE' }[name] || '#8884d8'
            }));
            setPaymentMethodData(paymentMethodChartData);

            // --- Process Geo Data ---
            const geoDistribution: { [key: string]: { volume: number, transactions: number, merchants: number, flag: string } } = {};
            allUsers.forEach(user => {
                if(user.country) {
                    if (!geoDistribution[user.country]) {
                        geoDistribution[user.country] = { volume: 0, transactions: 0, merchants: 0, flag: user.country.toLowerCase() };
                    }
                    geoDistribution[user.country].merchants++;
                }
            });
            successfulTxns.forEach(tx => {
                const user = allUsers.find(u => u.id === tx.merchantId);
                if (user?.country && geoDistribution[user.country]) {
                    geoDistribution[user.country].volume += parseFloat(tx.amount);
                    geoDistribution[user.country].transactions++;
                }
            });

            const geoChartData = Object.keys(geoDistribution).map(country => ({
                country,
                ...geoDistribution[country]
            })).sort((a, b) => b.volume - a.volume);
            setGeoData(geoChartData);

            setLoading(false);
        }, (error) => {
            console.error("Failed to fetch transactions:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not load platform transactions.' });
            setLoading(false);
        });

        return () => unsubscribeTransactions();
    }, (error) => {
        console.error("Failed to fetch users:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not load users data.' });
        setLoading(false);
    });

    return () => unsubscribeUsers();
  }, [toast]);

    const geoTotalPages = Math.ceil(geoData.length / geoItemsPerPage);
    const paginatedGeoData = geoData.slice(
      (geoCurrentPage - 1) * geoItemsPerPage,
      geoCurrentPage * geoItemsPerPage
    );

  const handleStatCardClick = (stat: string) => {
     switch(stat) {
         case 'volume':
             router.push(`/dashboard/analytics/details/total-transactions_all`);
             break;
         case 'payments':
             router.push(`/dashboard/analytics/details/successful-transactions_all`);
             break;
         case 'merchants':
            router.push(`/dashboard/users`);
             break;
        case 'avg_transaction':
            setDialogContent({ title: 'Average Transaction Value', description: 'The average value of a single transaction.', data: <p className="text-center p-4">Average Value: <span className="font-bold">${stats.avgTransaction.toFixed(2)}</span></p>, type: 'month' });
            break;
     }
  };

    const handleBarClick = (data: any) => {
        if (!data || !data.activePayload) return;
        const payload = data.activePayload[0].payload;
        const monthSlug = payload.month.toLowerCase();
        
        const monthDetails = (
             <div className="space-y-3 text-base">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-bold">${payload.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                    <Button variant="link" className="p-0 h-auto text-base" onClick={() => router.push(`/dashboard/analytics/details/new-users_${monthSlug}`)}>
                        New Users:
                    </Button>
                    <span className="font-bold text-primary">{payload.newUsers}</span>
                </div>
                 <div className="flex justify-between items-center">
                     <Button variant="link" className="p-0 h-auto text-base" onClick={() => router.push(`/dashboard/analytics/details/total-transactions_${monthSlug}`)}>
                        Total Transactions:
                    </Button>
                    <span className="font-bold text-primary">{payload.totalTransactions}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <Button variant="link" className="p-0 h-auto text-base" onClick={() => router.push(`/dashboard/analytics/details/successful-transactions_${monthSlug}`)}>
                        Successful Transactions:
                    </Button>
                    <span className="font-bold text-primary">{payload.successfulTransactions}</span>
                </div>
            </div>
        )
        setDialogContent({
            title: `Details for ${payload.month}`,
            description: `A snapshot of performance in ${payload.month}. Click a number to see details.`,
            data: monthDetails,
            type: 'month'
        });
    };

  const handlePieClick = (data: any) => {
     const methodName = data.name;
     router.push(`/dashboard/analytics/transactions-by-method/${methodName.toLowerCase()}`);
  };

  const handleCountryClick = (country: any) => {
     router.push(`/dashboard/users/country/${country.country}`);
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
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
             {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+15.2% from last month</p>}
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('payments')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.successfulPayments.toLocaleString()}</div>}
             {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+12.4% from last month</p>}
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('merchants')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.newMerchants.toLocaleString()}</div>}
             {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+8.1% from last month</p>}
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('avg_transaction')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats.avgTransaction.toFixed(2)}</div>}
             {loading ? <Skeleton className="h-4 w-1/2 mt-1" /> : <p className="text-xs text-muted-foreground">+1.2% from last month</p>}
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
            {loading ? <Skeleton className="h-[300px] w-full" /> : 
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
            }
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Breakdown by payment type. Click a slice for details.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-[300px] w-full" /> : 
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label onClick={handlePieClick} className="cursor-pointer" stroke="none">
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
            <CardTitle>Geographical Performance</CardTitle>
            <CardDescription>Top countries by transaction volume.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? <Skeleton className="h-48 w-full" /> : 
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
                    {paginatedGeoData.length > 0 ? paginatedGeoData.map(geo => (
                        <TableRow key={geo.country}>
                            <TableCell className="font-medium flex items-center gap-2">
                                <Image src={`https://flagcdn.com/w40/${geo.flag.toLowerCase()}.png`} alt={`${geo.country} flag`} width={24} height={16} data-ai-hint="country flag" />
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
            }
        </CardContent>
        { !loading && geoData.length > 0 &&
        <CardFooter>
            <div className="flex justify-between items-center w-full">
                <div className="text-xs text-muted-foreground">
                    Page {geoCurrentPage} of {geoTotalPages}
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setGeoCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={geoCurrentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setGeoCurrentPage(prev => Math.min(prev + 1, geoTotalPages))}
                        disabled={geoCurrentPage === geoTotalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardFooter>
        }
      </Card>
      
       <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
        <DialogContent className={dialogContent?.type === 'month' ? 'max-w-md' : 'max-w-xl'}>
            <DialogHeader>
                <DialogTitle>{dialogContent?.title}</DialogTitle>
                <DialogDescription>{dialogContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[60vh] overflow-y-auto">
                 {dialogContent?.data ? dialogContent.data : (
                    <p className="text-center text-muted-foreground p-4">No data to display.</p>
                 )}
            </div>
             <DialogFooter className="sm:justify-between">
                <Button onClick={() => setDialogContent(null)} variant="secondary">Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

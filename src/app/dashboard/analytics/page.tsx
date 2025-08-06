'use client';

import { DollarSign, Users, CreditCard, CheckCircle, Percent, Copy } from "lucide-react";
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
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";

type Transaction = {
    id: string;
    method: string;
    amount: string;
    date: string;
    status: 'Successful' | 'Failed';
    customerEmail: string;
    merchantId: string;
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
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State for Geo Data pagination
  const [geoCurrentPage, setGeoCurrentPage] = useState(1);
  const geoItemsPerPage = 5;
  
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        // In a real app, these would be aggregated queries from your backend/database
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
            { name: 'Link', value: 200, color: '#FF8042' },
        ]);

        setGeoData([
            { country: 'India', flag: 'in', volume: 120500, transactions: 1250, merchants: 45 },
            { country: 'United States', flag: 'us', volume: 85200, transactions: 890, merchants: 22 },
            { country: 'United Kingdom', flag: 'gb', volume: 45300, transactions: 512, merchants: 15 },
            { country: 'Germany', flag: 'de', volume: 32100, transactions: 450, merchants: 18 },
            { country: 'Australia', flag: 'au', volume: 28000, transactions: 300, merchants: 8 },
            { country: 'Canada', flag: 'ca', volume: 25400, transactions: 280, merchants: 12 },
        ]);
        setLoading(false);
    }
    fetchData();
  }, []);

    const geoTotalPages = Math.ceil(geoData.length / geoItemsPerPage);
    const paginatedGeoData = geoData.slice(
      (geoCurrentPage - 1) * geoItemsPerPage,
      geoCurrentPage * geoItemsPerPage
    );


  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} Copied!` });
  };
  
  const handleStatCardClick = (stat: string) => {
     switch(stat) {
         case 'volume':
             router.push(`/dashboard/analytics/details/total-transactions_all`);
             break;
         case 'payments':
             router.push(`/dashboard/analytics/details/successful-transactions_all`);
             break;
         case 'merchants':
            router.push(`/dashboard/analytics/details/new-users_all`);
             break;
        case 'avg_transaction':
            setDialogContent({ title: 'Average Transaction Value', description: 'The average value of a single transaction.', data: <p className="text-center p-4">Average Value: <span className="font-bold">$125.50</span></p>, type: 'month' });
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
                    {paginatedGeoData.length > 0 ? paginatedGeoData.map(geo => (
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
                                <span className="font-semibold">{selectedTransaction.customerEmail}</span>
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

    </div>
  );
}

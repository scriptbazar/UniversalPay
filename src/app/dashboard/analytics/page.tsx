
'use client';

import { DollarSign, Users, CreditCard, CheckCircle, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

const allMockTransactions = Array.from({ length: 6 * 50 }, (_, i) => {
    const monthIndex = Math.floor(i / 50);
    const success = Math.random() > 0.1;
    return {
        id: `txn_${i + 1}`,
        merchant: `Merchant ${i % 4 + 1}`,
        amount: (Math.random() * 500 + 10).toFixed(2),
        date: `2023-10-${28-Math.floor(i/2)}`,
        monthIndex: monthIndex,
        status: success ? 'Successful' : 'Failed'
    }
});


const revenueData = [
  { month: "Jan", revenue: 4000, newUsers: 24, totalTransactions: 400, successfulTransactions: 390, monthIndex: 0 },
  { month: "Feb", revenue: 3000, newUsers: 13, totalTransactions: 350, successfulTransactions: 340, monthIndex: 1 },
  { month: "Mar", revenue: 5000, newUsers: 84, totalTransactions: 500, successfulTransactions: 490, monthIndex: 2 },
  { month: "Apr", revenue: 4500, newUsers: 45, totalTransactions: 480, successfulTransactions: 470, monthIndex: 3 },
  { month: "May", revenue: 6000, newUsers: 56, totalTransactions: 600, successfulTransactions: 580, monthIndex: 4 },
  { month: "Jun", revenue: 5500, newUsers: 34, totalTransactions: 550, successfulTransactions: 540, monthIndex: 5 },
];

const paymentMethodData = [
  { name: 'UPI', value: 400, color: '#0088FE' },
  { name: 'Crypto', value: 300, color: '#00C49F' },
  { name: 'Cards', value: 300, color: '#FFBB28' },
  { name: 'Payment Links', value: 250, color: '#FF8042' },
];

const geoData = [
    { country: 'India', volume: 40000, transactions: 1200, merchants: 250, flag: 'IN' },
    { country: 'United States', volume: 25000, transactions: 800, merchants: 150, flag: 'US' },
    { country: 'United Kingdom', volume: 15000, transactions: 500, merchants: 80, flag: 'GB' },
    { country: 'Germany', volume: 10000, transactions: 300, merchants: 50, flag: 'DE' },
    { country: 'UAE', volume: 8000, transactions: 250, merchants: 40, flag: 'AE' },
];

const mockNewMerchants = Array.from({ length: 12 }, (_, i) => ({
    id: `user_${i + 1}`,
    name: `Merchant ${i + 1}`,
    email: `merchant${i + 1}@example.com`,
    avatar: `https://placehold.co/40x40.png?text=M${i+1}`,
    joined: `2023-10-${28-i}`,
    monthIndex: i % 6,
}));

const mockSuccessfulPayments = allMockTransactions.filter(tx => tx.status === 'Successful');


type DialogContent = {
  title: string;
  description: string;
  data: React.ReactNode;
} | null;


export default function AnalyticsPage() {
  const router = useRouter();
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedMerchants = useMemo(() => {
      const startIndex = (currentPage - 1) * itemsPerPage;
      return mockNewMerchants.slice(startIndex, startIndex + itemsPerPage);
  }, [currentPage]);

  const totalPages = Math.ceil(mockNewMerchants.length / itemsPerPage);

  const handleStatCardClick = (stat: string) => {
     switch(stat) {
         case 'volume':
             setDialogContent({ title: 'Total Volume Details', description: 'This is the sum of all successful transactions across the platform.', data: <p className="text-2xl font-bold">$1,452,231.89</p> });
             break;
         case 'payments':
             setDialogContent({ 
                 title: 'All Successful Payments', 
                 description: 'A list of all successful transactions on the platform.', 
                 data: (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockSuccessfulPayments.slice(0,10).map(tx => ( // Show first 10 for brevity
                                <TableRow key={tx.id}>
                                    <TableCell>{tx.id}</TableCell>
                                    <TableCell>{tx.merchant}</TableCell>
                                    <TableCell>{tx.date}</TableCell>
                                    <TableCell className="text-right">${tx.amount}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                 )
             });
             break;
         case 'merchants':
            setCurrentPage(1);
             setDialogContent({ 
                 title: 'New Merchants (Last 30 Days)', 
                 description: 'A list of new merchants who joined recently. Click to view details.', 
                 data: <NewMerchantsList/>
             });
             break;
        case 'avg_transaction':
            setDialogContent({ title: 'Average Transaction Value', description: 'The average value of a single transaction.', data: <p className="text-2xl font-bold">$25.40</p> });
            break;
     }
  };
  
    const showListDialog = (title: string, data: any[], type: 'merchant' | 'transaction') => {
        setDialogContent({
            title: title,
            description: `A list of ${title.toLowerCase()}.`,
            data: (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{type === 'merchant' ? 'Merchant' : 'Transaction ID'}</TableHead>
                            <TableHead>{type === 'merchant' ? 'Joined On' : 'Status'}</TableHead>
                            {type === 'transaction' && <TableHead className="text-right">Amount</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.slice(0, 20).map(item => ( // Show top 20
                            <TableRow key={item.id}>
                                {type === 'merchant' ? (
                                    <>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell>{item.joined}</TableCell>
                                    </>
                                ) : (
                                    <>
                                        <TableCell>{item.id}</TableCell>
                                        <TableCell><Badge variant={item.status === 'Successful' ? 'default' : 'destructive'}>{item.status}</Badge></TableCell>
                                        <TableCell className="text-right">${item.amount}</TableCell>
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )
        });
    };

    const handleBarClick = (data: any) => {
        if (!data || !data.activePayload) return;
        const payload = data.activePayload[0].payload;

        const monthlyMerchants = mockNewMerchants.filter(m => m.monthIndex === payload.monthIndex);
        const monthlyTransactions = allMockTransactions.filter(t => t.monthIndex === payload.monthIndex);
        const monthlySuccessfulTransactions = monthlyTransactions.filter(t => t.status === 'Successful');

        setDialogContent({
            title: `Details for ${payload.month}`,
            description: `A snapshot of performance in ${payload.month}. Click a number to see details.`,
            data: (
                <div className="space-y-2">
                    <div className="flex justify-between"><span>Revenue:</span> <span className="font-bold">${payload.revenue.toLocaleString()}</span></div>
                    
                    <Button variant="link" className="p-0 h-auto justify-between w-full" onClick={() => showListDialog(`New Users in ${payload.month}`, monthlyMerchants, 'merchant')}>
                        <span>New Users:</span> <span className="font-bold">{payload.newUsers}</span>
                    </Button>
                    
                    <Button variant="link" className="p-0 h-auto justify-between w-full" onClick={() => router.push(`/dashboard/analytics/transactions/${payload.month}`)}>
                       <span>Total Transactions:</span> <span className="font-bold">{payload.totalTransactions}</span>
                    </Button>

                    <Button variant="link" className="p-0 h-auto justify-between w-full" onClick={() => showListDialog(`Successful Transactions in ${payload.month}`, monthlySuccessfulTransactions, 'transaction')}>
                        <span>Successful Transactions:</span> <span className="font-bold">{payload.successfulTransactions}</span>
                    </Button>
                </div>
            )
        });
    };

  const handlePieClick = (data: any) => {
     setDialogContent({ 
        title: `${data.name} Transactions`, 
        description: `List of recent transactions made via ${data.name}.`, 
        data: (
            <p>List of {data.name} transactions would be displayed here.</p>
        )
    });
  };

  const handleCountryClick = (country: typeof geoData[0]) => {
     router.push('/dashboard/users');
  };
  
  function NewMerchantsList() {
    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Merchant</TableHead>
                        <TableHead>Joined On</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {paginatedMerchants.map(merchant => (
                        <TableRow key={merchant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(`/dashboard/users/${merchant.id}`)}>
                            <TableCell className="flex items-center gap-2">
                                <Image src={merchant.avatar} alt={merchant.name} width={40} height={40} className="rounded-full" data-ai-hint="user avatar" />
                                <div>
                                    <p className="font-medium">{merchant.name}</p>
                                    <p className="text-xs text-muted-foreground">{merchant.email}</p>
                                </div>
                            </TableCell>
                            <TableCell>{merchant.joined}</TableCell>
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
  }


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
            <div className="text-2xl font-bold">$1,452,231.89</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('payments')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">572,234</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('merchants')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 since last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => handleStatCardClick('avg_transaction')} className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25.40</div>
            <p className="text-xs text-muted-foreground">-2.1% from last month</p>
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
                <YAxis yAxisId="left" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                <YAxis yAxisId="right" orientation="right" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
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
                    {geoData.map(geo => (
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
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!dialogContent} onOpenChange={() => setDialogContent(null)}>
        <DialogContent className="max-w-2xl">
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


'use client';

import { DollarSign, Users, CreditCard, CheckCircle, Percent } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const revenueData = [
  { month: "Jan", revenue: 4000, newUsers: 24, totalTransactions: 400, successfulTransactions: 390 },
  { month: "Feb", revenue: 3000, newUsers: 13, totalTransactions: 350, successfulTransactions: 340 },
  { month: "Mar", revenue: 5000, newUsers: 84, totalTransactions: 500, successfulTransactions: 490 },
  { month: "Apr", revenue: 4500, newUsers: 45, totalTransactions: 480, successfulTransactions: 470 },
  { month: "May", revenue: 6000, newUsers: 56, totalTransactions: 600, successfulTransactions: 580 },
  { month: "Jun", revenue: 5500, newUsers: 34, totalTransactions: 550, successfulTransactions: 540 },
];

const paymentMethodData = [
  { name: 'UPI', value: 400, color: '#0088FE' },
  { name: 'Crypto', value: 300, color: '#00C49F' },
  { name: 'Cards', value: 300, color: '#FFBB28' },
  { name: 'Payment Links', value: 250, color: '#FF8042' },
];

const geoData = [
    { country: 'India', volume: 40000, transactions: 1200, merchants: 250 },
    { country: 'United States', volume: 25000, transactions: 800, merchants: 150 },
    { country: 'United Kingdom', volume: 15000, transactions: 500, merchants: 80 },
    { country: 'Germany', volume: 10000, transactions: 300, merchants: 50 },
    { country: 'UAE', volume: 8000, transactions: 250, merchants: 40 },
]

type DialogContent = {
  title: string;
  description: string;
  data: React.ReactNode;
} | null;


export default function AnalyticsPage() {
  const [dialogContent, setDialogContent] = useState<DialogContent>(null);
  
  const handleStatCardClick = (stat: string) => {
     switch(stat) {
         case 'volume':
             setDialogContent({ title: 'Total Volume Details', description: 'This is the sum of all successful transactions across the platform.', data: <p className="text-2xl font-bold">$1,452,231.89</p> });
             break;
         case 'payments':
             setDialogContent({ title: 'Successful Payments Details', description: 'Total number of successful transactions.', data: <p className="text-2xl font-bold">572,234</p> });
             break;
         case 'merchants':
             setDialogContent({ title: 'New Merchants Details', description: 'Number of new merchants who joined in the last 30 days.', data: <p className="text-2xl font-bold">+573</p> });
             break;
        case 'avg_transaction':
            setDialogContent({ title: 'Average Transaction Value', description: 'The average value of a single transaction.', data: <p className="text-2xl font-bold">$25.40</p> });
            break;
     }
  };
  
  const handleBarClick = (data: any) => {
    if(!data || !data.activePayload) return;
    const payload = data.activePayload[0].payload;
     setDialogContent({ 
        title: `Details for ${payload.month}`, 
        description: `A snapshot of performance in ${payload.month}.`, 
        data: (
            <div className="space-y-2">
                <div className="flex justify-between"><span>Revenue:</span> <span className="font-bold">${payload.revenue.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>New Users:</span> <span className="font-bold">{payload.newUsers}</span></div>
                <div className="flex justify-between"><span>Total Transactions:</span> <span className="font-bold">{payload.totalTransactions}</span></div>
                <div className="flex justify-between"><span>Successful Transactions:</span> <span className="font-bold">{payload.successfulTransactions}</span></div>
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
     setDialogContent({ 
        title: `Merchants from ${country.country}`, 
        description: `A list of merchants operating from ${country.country}.`, 
        data: (
            <p>Showing {country.merchants} merchants from {country.country}.</p>
        )
    });
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
                            <TableCell className="font-medium">{geo.country}</TableCell>
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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>{dialogContent?.title}</DialogTitle>
                <DialogDescription>{dialogContent?.description}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
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


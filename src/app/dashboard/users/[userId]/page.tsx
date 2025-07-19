
'use client';

import { ArrowLeft, CreditCard, DollarSign, Download, Landmark, MoreVertical, Percent, Shield, User, UserX, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const merchant = {
    id: "user_1",
    name: "John Doe",
    email: "john@example.com",
    plan: "Pro",
    status: "Active",
    avatar: "https://placehold.co/80x80.png?text=JD",
    role: "Merchant",
    joinedDate: "2023-01-15",
    lastLogin: "2023-10-27 10:00 AM",
};

const stats = {
    revenue: "45,231.89",
    walletBalance: "5,430.50",
    availableToWithdraw: "5,200.00",
    successRate: "98.2%",
};

const paymentMethodData = [
  { name: 'UPI', value: 450, color: '#0088FE' },
  { name: 'Crypto', value: 300, color: '#00C49F' },
  { name: 'Cards', value: 300, color: '#FFBB28' },
  { name: 'Payment Links', value: 200, color: '#FF8042' },
];

const recentTransactions = [
    { id: "pay_1", amount: "250.00", currency: "USD", method: "Crypto (BTC)", status: "Success", date: "2023-11-01" },
    { id: "pay_2", amount: "150.00", currency: "INR", method: "UPI (PhonePe)", status: "Success", date: "2023-11-01" },
    { id: "pay_3", amount: "350.00", currency: "INR", method: "UPI (Paytm)", status: "Failed", date: "2023-11-02" },
];

const withdrawalHistory = [
    { id: "wd_1", amount: "500.00", currency: "USDT", status: "Completed", date: "2023-10-25" },
    { id: "wd_2", amount: "1000.00", currency: "INR", status: "Pending", date: "2023-11-01" },
    { id: "wd_3", amount: "250.00", currency: "BTC", status: "Failed", date: "2023-10-18" },
    { id: "wd_4", amount: "750.00", currency: "USDT", status: "Completed", date: "2023-10-15" },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function UserDetailPage({ params }: { params: { userId: string } }) {

  return (
    <div className="space-y-6">
        <Link href="/dashboard/users" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to All Users
        </Link>
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
                 <Image src={merchant.avatar} width={96} height={96} alt={merchant.name} className="rounded-full" data-ai-hint="user avatar" />
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">{merchant.name}</h1>
                    <div className="flex gap-2">
                        <Button variant="outline"><UserX className="mr-2 h-4 w-4"/> Suspend Merchant</Button>
                        <Button variant="outline">Login As User</Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button size="icon" variant="ghost">
                                <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Change Plan</DropdownMenuItem>
                                <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Delete Merchant</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <p className="text-muted-foreground">{merchant.email}</p>
                 <div className="flex items-center gap-4 mt-2">
                    <Badge variant={merchant.status === 'Active' ? 'default' : 'outline'}>{merchant.status}</Badge>
                    <Badge variant="secondary">Plan: {merchant.plan}</Badge>
                    <span className="text-sm text-muted-foreground">Joined: {merchant.joinedDate}</span>
                </div>
            </div>
        </div>
        <Separator/>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.revenue}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available Wallet Balance</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.walletBalance}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Available to Withdraw</CardTitle>
                    <Landmark className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${stats.availableToWithdraw}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                    <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{stats.successRate}</div>
                </CardContent>
            </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <Card className="lg:col-span-1">
                <CardHeader>
                    <CardTitle>Payment Method Mix</CardTitle>
                    <CardDescription>Breakdown of transactions by type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {paymentMethodData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>The latest transactions from this merchant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentTransactions.map(p => (
                                <TableRow key={p.id}>
                                <TableCell className="font-medium">{p.id}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(p.status)}>{p.status}</Badge>
                                </TableCell>
                                <TableCell>{p.method}</TableCell>
                                <TableCell>{p.date}</TableCell>
                                <TableCell className="text-right">${p.amount} {p.currency}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Withdrawal History</CardTitle>
                <CardDescription>Full withdrawal history for this merchant.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Withdrawal ID</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {withdrawalHistory.map(w => (
                            <TableRow key={w.id}>
                                <TableCell className="font-medium">{w.id}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                                </TableCell>
                                <TableCell>{w.date}</TableCell>
                                <TableCell className="text-right">${w.amount} {w.currency}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}

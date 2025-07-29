
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
import React, { useState, useEffect } from "react";

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
import { doc, getDoc } from "firebase/firestore";


const chartData = [
    { name: 'Jan', revenue: 4230, monthIndex: 0 },
    { name: 'Feb', revenue: 3120, monthIndex: 1 },
    { name: 'Mar', revenue: 5890, monthIndex: 2 },
    { name: 'Apr', revenue: 4500, monthIndex: 3 },
    { name: 'May', revenue: 6200, monthIndex: 4 },
    { name: 'Jun', revenue: 7100, monthIndex: 5 },
    { name: 'Jul', revenue: 6800, monthIndex: 6 },
    { name: 'Aug', revenue: 7500, monthIndex: 7 },
    { name: 'Sep', revenue: 6400, monthIndex: 8 },
    { name: 'Oct', revenue: 8100, monthIndex: 9 },
    { name: 'Nov', revenue: 8500, monthIndex: 10 },
    { name: 'Dec', revenue: 9200, monthIndex: 11 },
];

const generateAllTransactions = () => {
    const methods = ["UPI", "Crypto", "Page", "Link"];
    return Array.from({ length: 50 }, (_, i) => {
        const monthIndex = Math.floor(i / 4);
        const date = new Date(2023, monthIndex, (i % 28) + 1);
        return {
            id: `TXN${12345 + i}`,
            name: `Customer ${i + 1}`,
            email: `customer${i + 1}@example.com`,
            amount: (Math.random() * 500 + 20).toFixed(2),
            status: Math.random() > 0.1 ? "Success" : "Failed",
            date: date,
            method: methods[i % 4],
        }
    });
};

type Transaction = {
    id: string;
    name: string;
    email: string;
    amount: string;
    status: "Success" | "Failed";
    date: Date;
    method: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [recentTransactionsData, setRecentTransactionsData] = useState<Transaction[]>([]);
  const [merchantName, setMerchantName] = useState("Merchant");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setMerchantName(userDoc.data().fullName || "Merchant");
            }
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const generated = generateAllTransactions();
    setAllTransactions(generated);
    setRecentTransactionsData(generated.slice(-4).reverse());
  }, []);

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
        return status === 'Success' ? 'default' : 'destructive';
    };


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
              <div className="text-2xl font-bold">$45,231.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
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
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
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
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
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
              <div className="text-2xl font-bold">98.2%</div>
              <p className="text-xs text-muted-foreground">
                +2% from last month
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
                {recentTransactionsData.map((tx) => (
                    <TableRow key={tx.id} onClick={() => setSelectedTransaction(tx)} className="cursor-pointer">
                        <TableCell>
                            <div className="font-medium">{tx.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {tx.email}
                            </div>
                        </TableCell>
                        <TableCell className="text-right">${tx.amount}</TableCell>
                    </TableRow>
                ))}
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
                  <span className="text-muted-foreground">Customer:</span>
                  <div className="flex items-center gap-2">
                      <div className="text-right">
                          <p className="font-semibold">{selectedTransaction.name}</p>
                          <p className="text-sm text-muted-foreground">{selectedTransaction.email}</p>
                      </div>
                      <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.email, 'Customer Email')} />
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
                  <Badge variant={selectedTransaction.status === 'Success' ? 'default' : 'destructive'}>{selectedTransaction.status}</Badge>
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

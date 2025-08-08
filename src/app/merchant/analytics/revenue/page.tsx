
'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Transaction = {
    amount: string;
    status: 'Successful' | 'Failed' | 'Pending';
    date: any;
};

type MonthRevenue = {
  month: string;
  revenue: string;
  transactions: number;
  successRate: string;
  avgTransaction: string;
};

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

export default function RevenueDetailsPage() {
    const router = useRouter();
    const [monthlyData, setMonthlyData] = useState<MonthRevenue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setLoading(true);
                const transactionsRef = collection(db, "transactions");
                const q = query(transactionsRef, where("merchantId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                
                const transactions = querySnapshot.docs.map(doc => ({
                    ...doc.data(),
                    date: toDateSafe(doc.data().date)
                } as Transaction));

                const monthlyStats: { [key: string]: { revenue: number, total: number, successful: number } } = {};
                const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                transactions.forEach(tx => {
                    const date = tx.date;
                    const year = date.getFullYear();
                    const monthName = `${monthNames[date.getMonth()]} ${year}`; // Key includes year
                    
                    if (!monthlyStats[monthName]) {
                        monthlyStats[monthName] = { revenue: 0, total: 0, successful: 0 };
                    }
                    monthlyStats[monthName].total++;
                    if (tx.status === 'Successful') {
                        monthlyStats[monthName].revenue += parseFloat(tx.amount);
                        monthlyStats[monthName].successful++;
                    }
                });

                const formattedData = Object.keys(monthlyStats).map(month => {
                    const stats = monthlyStats[month];
                    return {
                        month: month,
                        revenue: stats.revenue.toFixed(2),
                        transactions: stats.total,
                        successRate: stats.total > 0 ? ((stats.successful / stats.total) * 100).toFixed(1) + '%' : '0.0%',
                        avgTransaction: stats.successful > 0 ? (stats.revenue / stats.successful).toFixed(2) : '0.00'
                    };
                });
                
                setMonthlyData(formattedData);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleRowClick = (monthData: MonthRevenue) => {
        // Pass only the month name to the next page, as it expects it
        const monthSlug = monthData.month.split(' ')[0].toLowerCase();
        router.push(`/merchant/analytics/transactions/${monthSlug}`);
    };

    return (
        <div className="space-y-6">
            <Link href="/merchant/analytics" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Analytics
            </Link>

            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">Monthly Revenue Breakdown</CardTitle>
                    <CardDescription>
                        A detailed breakdown of your monthly performance. Click a row to view all transactions for that month.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead>Success Rate</TableHead>
                                <TableHead>Avg. Transaction Value</TableHead>
                                <TableHead className="text-right">Revenue (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">Loading data...</TableCell></TableRow>
                            ) : monthlyData.length > 0 ? (
                                monthlyData.map(item => (
                                    <TableRow key={item.month} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-muted/50">
                                        <TableCell className="font-medium">{item.month}</TableCell>
                                        <TableCell>{item.transactions}</TableCell>
                                        <TableCell><Badge variant="outline">{item.successRate}</Badge></TableCell>
                                        <TableCell>${item.avgTransaction}</TableCell>
                                        <TableCell className="text-right font-semibold">${item.revenue}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-24">No revenue data available yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

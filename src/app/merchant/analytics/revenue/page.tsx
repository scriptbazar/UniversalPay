'use client';

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

const monthlyRevenueData = [
  { month: 'January', revenue: '4,000.00', transactions: 50, successRate: '95%', avgTransaction: '80.00' },
  { month: 'February', revenue: '3,000.00', transactions: 45, successRate: '92%', avgTransaction: '66.67' },
  { month: 'March', revenue: '5,000.00', transactions: 60, successRate: '98%', avgTransaction: '83.33' },
  { month: 'April', revenue: '4,500.00', transactions: 55, successRate: '96%', avgTransaction: '81.82' },
  { month: 'May', revenue: '6,000.00', transactions: 70, successRate: '99%', avgTransaction: '85.71' },
  { month: 'June', revenue: '5,500.00', transactions: 65, successRate: '97%', avgTransaction: '84.62' },
  { month: 'July', revenue: '6,200.00', transactions: 75, successRate: '98%', avgTransaction: '82.67' },
  { month: 'August', revenue: '7,000.00', transactions: 80, successRate: '99%', avgTransaction: '87.50' },
  { month: 'September', revenue: '6,800.00', transactions: 78, successRate: '97%', avgTransaction: '87.18' },
  { month: 'October', revenue: '7,500.00', transactions: 85, successRate: '98%', avgTransaction: '88.24' },
  { month: 'November', revenue: '7,100.00', transactions: 82, successRate: '96%', avgTransaction: '86.59' },
  { month: 'December', revenue: '8,000.00', transactions: 90, successRate: '99%', avgTransaction: '88.89' },
];

type MonthRevenue = typeof monthlyRevenueData[0];

export default function RevenueDetailsPage() {
    const router = useRouter();

    const handleRowClick = (monthData: MonthRevenue) => {
        router.push(`/merchant/analytics/transactions/${monthData.month.toLowerCase()}`);
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
                            {monthlyRevenueData.map(item => (
                                <TableRow key={item.month} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.month}</TableCell>
                                    <TableCell>{item.transactions}</TableCell>
                                    <TableCell><Badge variant="outline">{item.successRate}</Badge></TableCell>
                                    <TableCell>${item.avgTransaction}</TableCell>
                                    <TableCell className="text-right font-semibold">${item.revenue}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

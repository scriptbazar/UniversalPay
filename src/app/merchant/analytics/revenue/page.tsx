
'use client';

import { ArrowLeft, Copy } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const monthlyRevenueData = [
  { month: 'January', revenue: '4,000.00', transactions: 50, successRate: '95%' },
  { month: 'February', revenue: '3,000.00', transactions: 45, successRate: '92%' },
  { month: 'March', revenue: '5,000.00', transactions: 60, successRate: '98%' },
  { month: 'April', revenue: '4,500.00', transactions: 55, successRate: '96%' },
  { month: 'May', revenue: '6,000.00', transactions: 70, successRate: '99%' },
  { month: 'June', revenue: '5,500.00', transactions: 65, successRate: '97%' },
  { month: 'July', revenue: '6,200.00', transactions: 75, successRate: '98%' },
  { month: 'August', revenue: '7,000.00', transactions: 80, successRate: '99%' },
  { month: 'September', revenue: '6,800.00', transactions: 78, successRate: '97%' },
  { month: 'October', revenue: '7,500.00', transactions: 85, successRate: '98%' },
  { month: 'November', revenue: '7,100.00', transactions: 82, successRate: '96%' },
  { month: 'December', revenue: '8,000.00', transactions: 90, successRate: '99%' },
];

type MonthRevenue = typeof monthlyRevenueData[0];

export default function RevenueDetailsPage() {
    const { toast } = useToast();
    const [selectedMonth, setSelectedMonth] = useState<MonthRevenue | null>(null);

    const handleRowClick = (monthData: MonthRevenue) => {
        setSelectedMonth(monthData);
    };
    
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: `${text} has been copied to your clipboard.`,
        });
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
                    <CardDescription>A list of your revenue per month. Click a row for more details.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month</TableHead>
                                <TableHead>Transactions</TableHead>
                                <TableHead>Success Rate</TableHead>
                                <TableHead className="text-right">Revenue (USD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlyRevenueData.map(item => (
                                <TableRow key={item.month} onClick={() => handleRowClick(item)} className="cursor-pointer hover:bg-muted/50">
                                    <TableCell className="font-medium">{item.month}</TableCell>
                                    <TableCell>{item.transactions}</TableCell>
                                    <TableCell><Badge variant="outline">{item.successRate}</Badge></TableCell>
                                    <TableCell className="text-right">${item.revenue}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedMonth} onOpenChange={() => setSelectedMonth(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Revenue Details for {selectedMonth?.month}</DialogTitle>
                        <DialogDescription>
                            Full details for revenue in {selectedMonth?.month}.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedMonth && (
                        <div className="space-y-4 py-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Revenue:</span>
                                <span className="font-semibold">${selectedMonth.revenue}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Total Transactions:</span>
                                <span className="font-semibold">{selectedMonth.transactions}</span>
                            </div>
                            <Separator />
                             <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Success Rate:</span>
                                <Badge variant="secondary">{selectedMonth.successRate}</Badge>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedMonth(null)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

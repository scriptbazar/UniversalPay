
'use client';

import { DollarSign, Users, CreditCard, CheckCircle, Globe } from "lucide-react";
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
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { toDateSafe } from "@/lib/utils";
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { countries } from "@/lib/countries";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Mapping A2 to A3 for Map Support
const a2ToA3: Record<string, string> = {
    'IN': 'IND', 'US': 'USA', 'CA': 'CAN', 'GB': 'GBR', 'AU': 'AUS', 'DE': 'DEU', 'FR': 'FRA', 'CN': 'CHN', 'RU': 'RUS', 'JP': 'JPN', 'BR': 'BRA'
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

export default function AnalyticsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dialogContent, setDialogContent] = useState<{ title: string; description: string; data: React.ReactNode; type: 'month' | 'payment-method' } | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVolume: 0, successfulPayments: 0, newMerchants: 0, avgTransaction: 0 });
  const [geoCurrentPage, setGeoCurrentPage] = useState(1);
  const geoItemsPerPage = 5;
  const [tooltipContent, setTooltipContent] = useState<{ name: string, volume: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

            const successfulTxns = allTransactions.filter(t => t.status === 'Successful' || t.status === 'Success');
            const totalVolume = successfulTxns.reduce((acc, t) => acc + parseFloat(t.amount), 0);
            const successfulPayments = successfulTxns.length;
            const newMerchants = allUsers.length;
            const avgTransaction = successfulPayments > 0 ? totalVolume / successfulPayments : 0;
            setStats({ totalVolume, successfulPayments, newMerchants, avgTransaction });

            const monthlyData: any = {};
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            allTransactions.forEach(tx => {
                const date = toDateSafe(tx.date);
                const month = monthNames[date.getMonth()];
                if (!monthlyData[month]) monthlyData[month] = { revenue: 0, newUsers: 0, totalTransactions: 0, successfulTransactions: 0 };
                monthlyData[month].totalTransactions++;
                if (tx.status === 'Successful' || tx.status === 'Success') {
                    monthlyData[month].revenue += parseFloat(tx.amount);
                    monthlyData[month].successfulTransactions++;
                }
            });

            setRevenueData(monthNames.map(month => ({ month, ...(monthlyData[month] || { revenue: 0, newUsers: 0, totalTransactions: 0, successfulTransactions: 0 }) })));

            const paymentMethods: any = {};
            successfulTxns.forEach(tx => { paymentMethods[tx.method] = (paymentMethods[tx.method] || 0) + 1; });
            setPaymentMethodData(Object.keys(paymentMethods).map(name => ({ name, value: paymentMethods[name], color: '#8884d8' })));

            const geoDistribution: any = {};
            allUsers.forEach(user => {
                if(user.country) {
                    const countryInfo = countries.find(c => c.name === user.country);
                    const isoA3 = countryInfo ? a2ToA3[countryInfo.code] : '';
                    if (!geoDistribution[user.country]) {
                        geoDistribution[user.country] = { volume: 0, transactions: 0, merchants: 0, flag: countryInfo?.code || '', iso: isoA3 };
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
            setGeoData(Object.keys(geoDistribution).map(country => ({ country, ...geoDistribution[country] })).sort((a, b) => b.volume - a.volume));
            setLoading(false);
        });
        return () => unsubscribeTransactions();
    });
    return () => unsubscribeUsers();
  }, [toast]);

  const colorScale = useMemo(() => {
    if (geoData.length === 0) return () => "#EEE";
    return scaleQuantile<string>().domain(geoData.map(d => d.volume)).range(["#d1e6f1", "#94c6df", "#58a6cd", "#1c86bb", "#0067a1"]);
  }, [geoData]);

  return (
    <div className="space-y-6 relative">
      {tooltipContent && (
          <div className="fixed z-50 p-2 bg-popover border rounded shadow-md text-xs pointer-events-none" style={{ left: mousePos.x + 10, top: mousePos.y + 10 }}>
              <p className="font-bold">{tooltipContent.name}</p>
              <p>Volume: ${tooltipContent.volume}</p>
          </div>
      )}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground">Comprehensive performance overview.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/transactions')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>}
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/transactions')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.successfulPayments}</div>}
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => router.push('/dashboard/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">+{stats.newMerchants}</div>}
          </CardContent>
        </Card>
        <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-3/4" /> : <div className="text-2xl font-bold">${stats.avgTransaction.toFixed(2)}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Geographical Revenue</CardTitle>
            <CardDescription>Global distribution of volume.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {loading ? <Skeleton className="w-full h-full" /> : (
              <ComposableMap projectionConfig={{ scale: 140 }} style={{ width: "100%", height: "100%" }}>
                <Geographies geography={GEO_URL}>
                  {({ geographies }) => geographies.map((geo) => {
                    const countryData = geoData.find((s) => s.iso === geo.properties.ISO_A3);
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.y })}
                        onMouseEnter={() => setTooltipContent({ name: geo.properties.NAME, volume: countryData ? countryData.volume.toLocaleString() : '0' })}
                        onMouseLeave={() => setTooltipContent(null)}
                        style={{
                          default: { fill: countryData ? colorScale(countryData.volume) : "#EEE", outline: "none" },
                          hover: { fill: "#F53", outline: "none", cursor: 'pointer' }
                        }}
                      />
                    );
                  })}
                </Geographies>
              </ComposableMap>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Geographical Performance</CardTitle>
            <CardDescription>Top countries by volume.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Country</TableHead><TableHead>Volume (USD)</TableHead><TableHead className="text-right">Action</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {geoData.slice(0, 5).map(geo => (
                  <TableRow key={geo.country}>
                    <TableCell className="flex items-center gap-2">
                      <Image src={`https://flagcdn.com/w20/${geo.flag.toLowerCase()}.png`} alt="" width={20} height={15} />
                      {geo.country}
                    </TableCell>
                    <TableCell>${geo.volume.toLocaleString()}</TableCell>
                    <TableCell className="text-right"><Button variant="link" onClick={() => router.push(`/dashboard/users/country/${geo.country}`)}>View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

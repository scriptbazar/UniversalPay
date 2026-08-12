
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

// Comprehensive Mapping A2 to A3 for Map Support
const a2ToA3: Record<string, string> = {
    'AF': 'AFG', 'AX': 'ALA', 'AL': 'ALB', 'DZ': 'DZA', 'AS': 'ASM', 'AD': 'AND', 'AO': 'AGO', 'AI': 'AIA', 'AQ': 'ATA', 'AG': 'ATG',
    'AR': 'ARG', 'AM': 'ARM', 'AW': 'ABW', 'AU': 'AUS', 'AT': 'AUT', 'AZ': 'AZE', 'BS': 'BHS', 'BH': 'BHR', 'BD': 'BGD', 'BB': 'BRB',
    'BY': 'BLR', 'BE': 'BEL', 'BZ': 'BLZ', 'BJ': 'BEN', 'BM': 'BMU', 'BT': 'BTN', 'BO': 'BOL', 'BA': 'BIH', 'BW': 'BWA', 'BV': 'BVT',
    'BR': 'BRA', 'IO': 'IOT', 'BN': 'BRN', 'BG': 'BGR', 'BF': 'BFA', 'BI': 'BDI', 'KH': 'KHM', 'CM': 'CMR', 'CA': 'CAE', 'CV': 'CPV',
    'KY': 'CYM', 'CF': 'CAF', 'TD': 'TCD', 'CL': 'CHL', 'CN': 'CHN', 'CX': 'CXR', 'CC': 'CCK', 'CO': 'COL', 'KM': 'COM', 'CG': 'COG',
    'CD': 'COD', 'CK': 'COK', 'CR': 'CRI', 'CI': 'CIV', 'HR': 'HRV', 'CU': 'CUB', 'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'DJ': 'DJI',
    'DM': 'DMA', 'DO': 'DOM', 'EC': 'ECU', 'EG': 'EGY', 'SV': 'SLV', 'GQ': 'GNQ', 'ER': 'ERI', 'EE': 'EST', 'ET': 'ETH', 'FK': 'FLK',
    'FO': 'FRO', 'FJ': 'FJI', 'FI': 'FIN', 'FR': 'FRA', 'GF': 'GUF', 'PF': 'PYF', 'TF': 'ATF', 'GA': 'GAB', 'GM': 'GMB', 'GE': 'GEO',
    'DE': 'DEU', 'GH': 'GHA', 'GI': 'GIB', 'GR': 'GRC', 'GL': 'GRL', 'GD': 'GRD', 'GP': 'GLP', 'GU': 'GUM', 'GT': 'GTM', 'GG': 'GGY',
    'GN': 'GIN', 'GW': 'GNB', 'GY': 'GUY', 'HT': 'HTI', 'HM': 'HMD', 'VA': 'VAT', 'HN': 'HND', 'HK': 'HKG', 'HU': 'HUN', 'IS': 'ISL',
    'IN': 'IND', 'ID': 'IDN', 'IR': 'IRN', 'IQ': 'IRQ', 'IE': 'IRL', 'IM': 'IMN', 'IL': 'ISR', 'IT': 'ITA', 'JM': 'JAM', 'JP': 'JPN',
    'JE': 'JEY', 'JO': 'JOR', 'KZ': 'KAZ', 'KE': 'KEN', 'KI': 'KIR', 'KP': 'PRK', 'KR': 'KOR', 'KW': 'KWT', 'KG': 'KGZ', 'LA': 'LAO',
    'LV': 'LVA', 'LB': 'LBN', 'LS': 'LSO', 'LR': 'LBR', 'LY': 'LBY', 'LI': 'LIE', 'LT': 'LTU', 'LU': 'LUX', 'MO': 'MAC', 'MK': 'MKD',
    'MG': 'MDG', 'MW': 'MWI', 'MY': 'MYS', 'MV': 'MDV', 'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL', 'MQ': 'MTQ', 'MR': 'MRT', 'MU': 'MUS',
    'YT': 'MYT', 'MX': 'MEX', 'FM': 'FSM', 'MD': 'MDA', 'MC': 'MCO', 'MN': 'MNG', 'MS': 'MSR', 'MA': 'MAR', 'MZ': 'MOZ', 'MM': 'MMR',
    'NA': 'NAM', 'NR': 'NRU', 'NP': 'NPL', 'NL': 'NLD', 'AN': 'ANT', 'NC': 'NCL', 'NZ': 'NZL', 'NI': 'NIC', 'NE': 'NER', 'NG': 'NGA',
    'NU': 'NIU', 'NF': 'NFK', 'MP': 'MNP', 'NO': 'NOR', 'OM': 'OMN', 'PK': 'PAK', 'PW': 'PLW', 'PS': 'PSE', 'PA': 'PAN', 'PG': 'PNG',
    'PY': 'PRY', 'PE': 'PER', 'PH': 'PHL', 'PN': 'PCN', 'PL': 'POL', 'PT': 'PRT', 'PR': 'PRI', 'QA': 'QAT', 'RE': 'REU', 'RO': 'ROU',
    'RU': 'RUS', 'RW': 'RWA', 'SH': 'SHN', 'KN': 'KNA', 'LC': 'LCA', 'PM': 'SPM', 'VC': 'VCT', 'WS': 'WSM', 'SM': 'SMR', 'ST': 'STP',
    'SA': 'SAU', 'SN': 'SEN', 'CS': 'SCG', 'SC': 'SYC', 'SL': 'SLE', 'SG': 'SGP', 'SK': 'SVK', 'SI': 'SVN', 'SB': 'SLB', 'SO': 'SOM',
    'ZA': 'ZAF', 'GS': 'SGS', 'ES': 'ESP', 'LK': 'LKA', 'SD': 'SDN', 'SR': 'SUR', 'SJ': 'SJM', 'SZ': 'SWZ', 'SE': 'SWE', 'CH': 'CHE',
    'SY': 'SYR', 'TW': 'TWN', 'TJ': 'TJK', 'TZ': 'TZA', 'TH': 'THA', 'TL': 'TLS', 'TG': 'TGO', 'TK': 'TKL', 'TO': 'TON', 'TT': 'TTO',
    'TN': 'TUN', 'TR': 'TUR', 'TM': 'TKM', 'TC': 'TCA', 'TV': 'TUV', 'UG': 'UGA', 'UA': 'UKR', 'AE': 'ARE', 'GB': 'GBR', 'US': 'USA',
    'UM': 'UMI', 'UY': 'URY', 'UZ': 'UZB', 'VU': 'VUT', 'VE': 'VEN', 'VN': 'VNM', 'VG': 'VGB', 'VI': 'VIR', 'WF': 'WLF', 'EH': 'ESH',
    'YE': 'YEM', 'ZM': 'ZMB', 'ZW': 'ZWE'
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
  const [loading, setLoading] = useState(true);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [paymentMethodData, setPaymentMethodData] = useState<any[]>([]);
  const [geoData, setGeoData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalVolume: 0, successfulPayments: 0, newMerchants: 0, avgTransaction: 0 });
  const [tooltipContent, setTooltipContent] = useState<{ name: string, volume: string } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setLoading(true);
    let allUsersData: User[] = [];
    let allTransactionsData: Transaction[] = [];

    const processData = () => {
        const successfulTxns = allTransactionsData.filter(t => t.status === 'Successful' || t.status === 'Success');
        const totalVolume = successfulTxns.reduce((acc, t) => acc + parseFloat(t.amount || '0'), 0);
        const successfulPayments = successfulTxns.length;
        const newMerchants = allUsersData.length;
        const avgTransaction = successfulPayments > 0 ? totalVolume / successfulPayments : 0;
        setStats({ totalVolume, successfulPayments, newMerchants, avgTransaction });

        const monthlyData: any = {};
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        allTransactionsData.forEach(tx => {
            const date = toDateSafe(tx.date);
            const month = monthNames[date.getMonth()];
            if (!monthlyData[month]) monthlyData[month] = { revenue: 0, newUsers: 0, totalTransactions: 0, successfulTransactions: 0 };
            monthlyData[month].totalTransactions++;
            if (tx.status === 'Successful' || tx.status === 'Success') {
                monthlyData[month].revenue += parseFloat(tx.amount || '0');
                monthlyData[month].successfulTransactions++;
            }
        });
        setRevenueData(monthNames.map(month => ({ month, ...(monthlyData[month] || { revenue: 0, newUsers: 0, totalTransactions: 0, successfulTransactions: 0 }) })));

        const paymentMethods: any = {};
        successfulTxns.forEach(tx => { paymentMethods[tx.method] = (paymentMethods[tx.method] || 0) + 1; });
        setPaymentMethodData(Object.keys(paymentMethods).map(name => ({ name, value: paymentMethods[name], color: '#8884d8' })));

        const geoDistribution: any = {};
        allUsersData.forEach(user => {
            if (user.country) {
                const countryInfo = countries.find(c => c.name === user.country);
                const isoA3 = countryInfo ? a2ToA3[countryInfo.code] : '';
                if (!geoDistribution[user.country]) {
                    geoDistribution[user.country] = { volume: 0, transactions: 0, merchants: 0, flag: countryInfo?.code || '', iso: isoA3 };
                }
                geoDistribution[user.country].merchants++;
            }
        });
        successfulTxns.forEach(tx => {
            const user = allUsersData.find(u => u.id === tx.merchantId);
            if (user?.country && geoDistribution[user.country]) {
                geoDistribution[user.country].volume += parseFloat(tx.amount || '0');
                geoDistribution[user.country].transactions++;
            }
        });
        setGeoData(Object.keys(geoDistribution).map(country => ({ country, ...geoDistribution[country] })).sort((a, b) => b.volume - a.volume));
        setLoading(false);
    };

    const unsubscribeUsers = onSnapshot(query(collection(db, "users")), (usersSnapshot) => {
        allUsersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        processData();
    }, (err) => { console.warn('Users snapshot:', err); setLoading(false); });

    const unsubscribeTransactions = onSnapshot(collection(db, "transactions"), (transactionsSnapshot) => {
        allTransactionsData = transactionsSnapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(), date: toDateSafe(doc.data().date)
        } as Transaction));
        processData();
    }, (err) => { console.warn('Transactions snapshot:', err); setLoading(false); });

    return () => {
        unsubscribeUsers();
        unsubscribeTransactions();
    };
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
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Platform revenue trend over time.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Distribution of successful transactions by method.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : paymentMethodData.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No payment data yet.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {paymentMethodData.map((_, idx) => (
                      <Cell key={idx} fill={['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444'][idx % 6]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [v, 'Transactions']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
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
                        onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
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
                      {geo.flag && <Image src={`https://flagcdn.com/w20/${geo.flag.toLowerCase()}.png`} alt="" width={20} height={15} />}
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

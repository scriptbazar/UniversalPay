'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, CreditCard, Users, Activity } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { toDateSafe } from "@/lib/utils";

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

const DEMO_MONTHLY = [
  { name: 'Jan', revenue: 12400, transactions: 45 },
  { name: 'Feb', revenue: 18900, transactions: 62 },
  { name: 'Mar', revenue: 24500, transactions: 80 },
  { name: 'Apr', revenue: 31200, transactions: 105 },
  { name: 'May', revenue: 42800, transactions: 138 },
];
const DEMO_METHODS = [
  { name: 'USDT TRC20', value: 45 },
  { name: 'UPI Pay', value: 30 },
  { name: 'Crypto BTC', value: 15 },
  { name: 'Card', value: 10 },
];

export default function MerchantAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState(DEMO_MONTHLY);
  const [methodData, setMethodData] = useState(DEMO_METHODS);
  const [stats, setStats] = useState({ revenue: 0, transactions: 0, customers: 0, successRate: 0 });

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      const uid = user?.uid;
      if (!uid) { setLoading(false); return; }

      try {
        const q = query(collection(db, 'transactions'), where('merchantId', '==', uid));
        const unsubSnap = onSnapshot(q, (snap) => {
          if (snap.empty) { setLoading(false); return; }
          const txns = snap.docs.map(d => ({ ...d.data(), date: toDateSafe(d.data().date) })) as any[];
          const success = txns.filter(t => t.status === 'Success');
          const totalRevenue = success.reduce((s: number, t: any) => s + parseFloat(t.amount || '0'), 0);
          const successRate = txns.length > 0 ? Math.round((success.length / txns.length) * 100) : 0;
          const customers = new Set(txns.map((t: any) => t.customerEmail)).size;
          setStats({ revenue: totalRevenue, transactions: txns.length, customers, successRate });

          const monthly: any = {};
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          txns.forEach((t: any) => {
            const m = months[t.date.getMonth()];
            if (!monthly[m]) monthly[m] = { name: m, revenue: 0, transactions: 0 };
            monthly[m].transactions++;
            if (t.status === 'Success') monthly[m].revenue += parseFloat(t.amount || '0');
          });
          const arr = Object.values(monthly) as any[];
          if (arr.length > 0) setMonthlyData(arr);

          const methods: any = {};
          success.forEach((t: any) => { methods[t.method] = (methods[t.method] || 0) + 1; });
          const mArr = Object.keys(methods).map(name => ({ name, value: methods[name] }));
          if (mArr.length > 0) setMethodData(mArr);
          setLoading(false);
        }, () => setLoading(false));
        return () => unsubSnap();
      } catch { setLoading(false); }
    });
    return () => unsubAuth();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><TrendingUp className="h-6 w-6" /> My Analytics</h1>
        <p className="text-muted-foreground">Your personal revenue, transaction, and performance insights.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[{ label: 'Total Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: CreditCard, color: 'text-green-500' },
          { label: 'Transactions', value: stats.transactions, icon: Activity, color: 'text-blue-500' },
          { label: 'Unique Customers', value: stats.customers, icon: Users, color: 'text-purple-500' },
          { label: 'Success Rate', value: `${stats.successRate}%`, icon: TrendingUp, color: 'text-cyan-500' },
        ].map((s, i) => (
          <Card key={i}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              {loading ? <Skeleton className="h-8 w-24" /> : <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Monthly Revenue</CardTitle><CardDescription>Your revenue trend over time</CardDescription></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v / 1000}k`} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '6px' }} />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Methods</CardTitle><CardDescription>Breakdown by method used</CardDescription></CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-64 w-full" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={methodData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                    {methodData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

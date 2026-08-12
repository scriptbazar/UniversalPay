
'use client';

import { ArrowLeft, CreditCard, DollarSign, Download, Hash, Landmark, MoreVertical, Percent, Shield, User, UserCheck, UserX, Wallet, Copy, MinusCircle, PlusCircle, Briefcase, Mail, Phone, Calendar, ShieldCheck as ShieldIcon, LogIn, LayoutGrid, KeyRound, Trash2, Settings, ArrowRight, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, Timestamp, collection, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { countries } from "@/lib/countries";
import { Skeleton } from "@/components/ui/skeleton";
import { toDateSafe } from "@/lib/utils";

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
    businessName?: string;
    plan?: string;
    status: "Active" | "Suspended";
    avatar?: string;
    role?: string;
    kycStatus?: "Verified" | "Pending Approval" | "Not Started";
    createdAt?: Timestamp;
    country?: string;
}

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'completed':
        case 'success':
        case 'active':
        case 'verified':
            return 'default';
        case 'pending':
        case 'pending approval':
            return 'secondary';
        case 'suspended':
        case 'not started':
        case 'failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function MerchantProfilePage() {
  const { toast } = useToast();
  const router = useRouter();

  const [merchant, setMerchant] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [joinedDate, setJoinedDate] = useState('N/A');
  const [stats, setStats] = useState({ volume: 0, totalTxns: 0, successRate: 0 });
  const [recentActivity, setRecentActivity] = useState<Array<{ type: string; details: string; status: string; date: Date; route: string }>>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const formattedUserId = useMemo(() => {
    if (!merchant?.id) return '';
    let hash = 0;
    for (let i = 0; i < merchant.id.length; i++) {
        const char = merchant.id.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    const shortId = Math.abs(hash).toString().substring(0, 8).padEnd(8, '0');
    return `UVPAYM${shortId}`;
  }, [merchant?.id]);

    const countryCode = useMemo(() => {
        if (!merchant?.country) return null;
        const countryData = countries.find(c => c.name === merchant.country);
        return countryData?.code;
    }, [merchant?.country]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data() as UserProfile;
                userData.id = userDocSnap.id;
                setMerchant(userData);
                if (userData.createdAt) {
                    setJoinedDate(userData.createdAt.toDate().toLocaleDateString());
                }
            } else {
                setMerchant(null);
            }
        } else {
            router.push('/login');
        }
        setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
      const unsubAuth = onAuthStateChanged(auth, (user) => {
          if (!user) return;
          const q = query(
              collection(db, 'transactions'),
              where('merchantId', '==', user.uid),
              orderBy('date', 'desc'),
              limit(10)
          );
          const unsub = onSnapshot(q, (snap) => {
              const txns = snap.docs.map(d => ({ ...d.data(), id: d.id, date: toDateSafe(d.data().date) })) as any[];
              const success = txns.filter((t: any) => t.status === 'Success');
              const volume = success.reduce((s: number, t: any) => s + parseFloat(t.amount || '0'), 0);
              const rate = txns.length > 0 ? Math.round((success.length / txns.length) * 100) : 0;
              setStats({ volume, totalTxns: txns.length, successRate: rate });
  
              const activity = txns.slice(0, 5).map((t: any) => ({
                  type: 'Payment Received',
                  details: `From ${t.customerEmail || 'customer'} · $${t.amount}`,
                  status: t.status,
                  date: t.date,
                  route: '/merchant/payments'
              }));
              setRecentActivity(activity);
              setStatsLoading(false);
          }, () => setStatsLoading(false));
          return () => unsub();
      });
      return () => unsubAuth();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  if (loading) {
    return <div className="flex-grow flex items-center justify-center">Loading your profile...</div>;
  }
  
  if (!merchant) {
    return <div className="flex-grow flex items-center justify-center">Profile not found.</div>;
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
                 <Image src={merchant.avatar || `https://placehold.co/96x96.png?text=${merchant.fullName.charAt(0)}`} width={96} height={96} alt={merchant.fullName} className="rounded-full" data-ai-hint="user avatar" />
            </div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{merchant.fullName}</h1>
                        <div className="text-sm text-muted-foreground font-mono flex items-center gap-2">
                           <Hash className="h-4 w-4" />
                           {formattedUserId}
                           <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(formattedUserId, 'Merchant ID')} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <Button asChild variant="outline">
                           <Link href="/merchant/settings"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Link>
                         </Button>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <span className="flex items-center gap-2 text-muted-foreground"><Mail className="h-4 w-4" /> {merchant.email} <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(merchant.email, 'Email')} /></span>
                    {merchant.mobile && <span className="flex items-center gap-2 text-muted-foreground"><Phone className="h-4 w-4" /> {merchant.mobile} <Copy className="h-4 w-4 cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(merchant.mobile!, 'Mobile Number')} /></span>}
                    {merchant.businessName && <span className="flex items-center gap-2 text-muted-foreground"><Briefcase className="h-4 w-4" /> {merchant.businessName}</span>}
                     {merchant.country && countryCode && (
                        <span className="flex items-center gap-2 text-muted-foreground">
                            <Image src={`https://flagcdn.com/w20/${countryCode.toLowerCase()}.png`} width={20} height={15} alt={`${merchant.country} flag`} data-ai-hint="country flag" />
                            {merchant.country}
                        </span>
                    )}
                </div>
                 <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <Badge variant={getStatusBadgeVariant(merchant.status)}>
                        {merchant.status === 'Active' ? <UserCheck className="mr-1 h-3 w-3" /> : <UserX className="mr-1 h-3 w-3" />}
                        {merchant.status}
                    </Badge>
                    <Badge variant="outline">
                        <Shield className="mr-1 h-3 w-3" />
                        Role: {merchant.role || 'merchant'}
                    </Badge>
                    <Badge variant="secondary"><Briefcase className="mr-1 h-3 w-3" /> Plan: {merchant.plan || 'Free'}</Badge>
                    <Badge variant={getStatusBadgeVariant(merchant.kycStatus || 'Not Started')}>
                        <ShieldIcon className="mr-1 h-3 w-3" />
                        KYC: {merchant.kycStatus || 'Not Started'}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="h-4 w-4"/> Joined: {joinedDate}</span>
                </div>
            </div>
        </div>
        
        <Separator />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card asChild className="cursor-pointer hover:bg-muted/50 transition-colors">
                 <Link href="/merchant/payments">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Lifetime Volume</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-28" /> : <div className="text-2xl font-bold">${stats.volume.toFixed(2)}</div>}
                    </CardContent>
                </Link>
            </Card>
            <Card asChild className="cursor-pointer hover:bg-muted/50 transition-colors">
                <Link href="/merchant/payments">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold">{stats.totalTxns}</div>}
                    </CardContent>
                </Link>
            </Card>
            <Card asChild className="cursor-pointer hover:bg-muted/50 transition-colors">
                <Link href="/merchant/analytics">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl font-bold text-green-500">{stats.successRate}%</div>}
                    </CardContent>
                </Link>
            </Card>
            <Card asChild className="cursor-pointer hover:bg-muted/50 transition-colors">
                <Link href="/merchant/subscriptions">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{merchant.plan || 'Free'}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="hover:underline text-primary"><Link href="/pricing">Upgrade Plan →</Link></span>
                        </p>
                    </CardContent>
                </Link>
            </Card>
        </div>
        
         <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>A log of recent important events on your account.</CardDescription>
                </div>
                <Button asChild variant="outline">
                    <Link href="/merchant/payments">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {statsLoading ? Array.from({ length: 3 }).map((_, i) => (
                            <TableRow key={i}>{Array.from({ length: 4 }).map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}</TableRow>
                        )) : recentActivity.length === 0 ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No recent activity yet.</TableCell></TableRow>
                        ) : recentActivity.map((a, i) => (
                            <TableRow key={i} className="cursor-pointer hover:bg-muted/50" onClick={() => router.push(a.route)}>
                                <TableCell>{a.type}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">{a.details}</TableCell>
                                <TableCell>
                                    <Badge variant={a.status === 'Success' ? 'default' : a.status === 'Failed' ? 'destructive' : 'secondary'}>{a.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground text-xs">{a.date instanceof Date ? a.date.toLocaleDateString() : '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  )
}


'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, onSnapshot, Timestamp, where } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { Activity, ShieldCheck, Repeat, FileText, Landmark, DollarSign, CreditCard } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

type AuditLog = {
    id: string;
    type: string;
    message: string;
    level: 'INFO' | 'CRITICAL' | 'ERROR' | 'SECURITY_ALERT' | 'MAJOR';
    timestamp: Timestamp;
};

const getEventIcon = (type: string) => {
    switch (type) {
        case 'PAYMENT_RECEIVED': return <CreditCard className="h-4 w-4" />;
        case 'SUBSCRIPTION_CHANGE': return <Repeat className="h-4 w-4" />;
        case 'MERCHANT_PROFILE_UPDATE': return <FileText className="h-4 w-4" />;
        case 'FINANCIAL_ACTION': return <Landmark className="h-4 w-4" />;
        case 'WALLET_ADJUSTMENT': return <DollarSign className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
    }
}

export default function MerchantActivityPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const logsCollectionRef = collection(db, 'audit_logs');
                const q = query(logsCollectionRef, where('details.targetUser', '==', user.uid), orderBy('timestamp', 'desc'));

                const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
                    const logsData: AuditLog[] = [];
                    querySnapshot.forEach((doc) => {
                        logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
                    });
                    setLogs(logsData);
                    setLoading(false);
                    setError(null);
                }, (error) => {
                    console.error("Error fetching activity logs: ", error);
                    setError("Could not fetch your activity. Please try again later.");
                    setLoading(false);
                });

                return () => unsubscribeSnapshot();
            } else {
                setLoading(false);
                setError("You must be logged in to view your activity.");
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Activity /> My Account Activity
                </h1>
                <p className="text-muted-foreground">A record of important events and changes related to your account.</p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>A chronological record of events on your account.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date & Time</TableHead>
                                <TableHead>Event Type</TableHead>
                                <TableHead>Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">Loading your activity...</TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-destructive">{error}</TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">No activity found for your account.</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.timestamp?.toDate().toLocaleString() ?? 'No date'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="flex items-center gap-2">
                                                {getEventIcon(log.type)}
                                                {log.type.replace(/_/g, ' ').toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm">{log.message}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    
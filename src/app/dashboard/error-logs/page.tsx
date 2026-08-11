
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, onSnapshot, Timestamp, where, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toDateSafe } from '@/lib/utils';
import { AlertCircle, ShieldAlert, AlertTriangle } from 'lucide-react';

type AuditLog = {
    id: string;
    type: string;
    message: string;
    level: 'INFO' | 'CRITICAL' | 'ERROR' | 'SECURITY_ALERT' | 'MAJOR';
    timestamp: Timestamp;
};

const getLevelVariant = (level: AuditLog['level']) => {
    switch (level) {
        case 'CRITICAL':
        case 'SECURITY_ALERT':
        case 'ERROR':
            return 'destructive';
        default:
            return 'secondary';
    }
};

const getLevelIcon = (level: AuditLog['level']) => {
    switch(level) {
        case 'CRITICAL':
        case 'SECURITY_ALERT':
             return <ShieldAlert className="h-4 w-4" />;
        case 'ERROR':
            return <AlertCircle className="h-4 w-4" />;
        default:
             return <AlertTriangle className="h-4 w-4" />;
    }
}

export default function ErrorLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!db || !db.app) {
            setError("Firebase is not configured. Cannot fetch error logs.");
            setLoading(false);
            return;
        }

        const logsCollectionRef = collection(db, 'audit_logs');
        const q = query(
            logsCollectionRef, 
            where('level', 'in', ['ERROR', 'CRITICAL', 'SECURITY_ALERT']),
            orderBy('timestamp', 'desc'),
            limit(200)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logsData: AuditLog[] = [];
            querySnapshot.forEach((doc) => {
                logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
            });
            setLogs(logsData);
            setLoading(false);
            setError(null);
        }, (err) => {
            console.error("Error fetching error logs: ", err);
            setError("Could not fetch error logs. Check console and Firebase rules.");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <ShieldAlert /> Error Logs
                </h1>
                <p className="text-muted-foreground">Monitor critical errors and security alerts across the platform.</p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Critical Platform Events</CardTitle>
                    <CardDescription>A chronological record of system errors and security-related activities.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Event Description</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Loading error logs...</TableCell>
                                </TableRow>
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-destructive">{error}</TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No errors or critical events found.</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{toDateSafe(log.timestamp).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={getLevelVariant(log.level)} className="flex items-center gap-1 w-fit">
                                                {getLevelIcon(log.level)}
                                                {log.level}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{log.type}</Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">{log.message}</TableCell>
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

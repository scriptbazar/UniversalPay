
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, History, ShieldAlert, CheckCircle } from 'lucide-react';

type AuditLog = {
    id: string;
    type: string;
    message: string;
    level: 'INFO' | 'CRITICAL' | 'ERROR' | 'SECURITY_ALERT';
    timestamp: Timestamp;
};

const getLevelVariant = (level: AuditLog['level']) => {
    switch (level) {
        case 'CRITICAL':
        case 'SECURITY_ALERT':
            return 'destructive';
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
             return <CheckCircle className="h-4 w-4" />;
    }
}


export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const logsCollectionRef = collection(db, 'audit_logs');
        const q = query(logsCollectionRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logsData: AuditLog[] = [];
            querySnapshot.forEach((doc) => {
                logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
            });
            setLogs(logsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching audit logs: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <History /> Audit Logs
                </h1>
                <p className="text-muted-foreground">Track important events and changes across the platform.</p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Platform Activity</CardTitle>
                    <CardDescription>A chronological record of critical system and admin activities.</CardDescription>
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
                                    <TableCell colSpan={4} className="h-24 text-center">Loading logs...</TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No audit logs found.</TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>{log.timestamp?.toDate().toLocaleString()}</TableCell>
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

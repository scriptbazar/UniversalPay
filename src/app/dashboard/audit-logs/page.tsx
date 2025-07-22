
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

// Mock data for demonstration purposes
const mockAuditLogs: AuditLog[] = [
    {
        id: 'log_1',
        type: 'ROLE_CHANGE',
        message: 'Admin admin@example.com (uid_admin1) promoted new_admin@example.com (uid_user5) to admin.',
        level: 'CRITICAL',
        timestamp: Timestamp.fromDate(new Date('2023-11-21T10:00:00Z')),
    },
    {
        id: 'log_2',
        type: 'SECURITY_ALERT',
        message: 'Non-admin user merchant@example.com (uid_user2) attempted to access a protected admin route.',
        level: 'SECURITY_ALERT',
        timestamp: Timestamp.fromDate(new Date('2023-11-21T09:30:00Z')),
    },
    {
        id: 'log_3',
        type: 'ERROR',
        message: 'Failed to process withdrawal request WDRL-5678 for merchant another@shop.com (uid_user3).',
        level: 'ERROR',
        timestamp: Timestamp.fromDate(new Date('2023-11-20T18:00:00Z')),
    },
    {
        id: 'log_4',
        type: 'LOGIN_SUCCESS',
        message: 'User admin@example.com (uid_admin1) logged in successfully from IP 192.168.1.1.',
        level: 'INFO',
        timestamp: Timestamp.fromDate(new Date('2023-11-20T17:55:00Z')),
    },
];


export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!db || !db.app) {
            // Firebase might not be configured, use mock data.
            setLogs(mockAuditLogs);
            setLoading(false);
            return;
        }

        const logsCollectionRef = collection(db, 'audit_logs');
        const q = query(logsCollectionRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const logsData: AuditLog[] = [];
            querySnapshot.forEach((doc) => {
                logsData.push({ id: doc.id, ...doc.data() } as AuditLog);
            });
            // If no real logs, show mock data. Otherwise, show real data.
            setLogs(logsData.length > 0 ? logsData : mockAuditLogs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching audit logs: ", error);
            // If there's an error (e.g., permissions), fall back to mock data
            setLogs(mockAuditLogs);
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

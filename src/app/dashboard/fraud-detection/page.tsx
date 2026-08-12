'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Shield, DollarSign, User, Server, AlertCircle, Clock, CheckCircle, XCircle, Ban, FileWarning, Copy, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toDateSafe } from "@/lib/utils";

type Transaction = {
  id: string;
  user: string;
  ip: string;
  amount: number;
  riskScore: number;
  reason: string;
  status: "Flagged" | "Blocked" | "Held" | "KYC Requested" | "Approved";
  timestamp: string;
};


const getRiskBadgeVariant = (score: number) => {
    if (score > 90) return "destructive";
    if (score > 75) return "secondary";
    return "outline";
}

const getStatusBadgeVariant = (status: Transaction["status"]) => {
    if (status === "Blocked" || status === "Flagged") return "destructive";
    if (status === "Held") return "secondary";
    if (status === "KYC Requested") return "default";
    return "outline"
}


export default function FraudDetectionPage() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(db, "transactions"), where("status", "in", ["Flagged", "Blocked", "Held", "KYC Requested"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTransactions = snapshot.docs.map(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount || '0');
        // Deterministic risk score based on amount (higher amount = higher risk)
        const baseScore = Math.min(60 + Math.floor(amount / 50), 99);
        const statusReasonMap: Record<string, string> = {
          'Flagged': 'Suspicious transaction pattern detected',
          'Blocked': 'Transaction blocked by fraud filter',
          'Held': 'Manual review required — unusual activity',
          'KYC Requested': 'KYC verification pending for this merchant',
        };
        return {
          id: doc.id,
          ...data,
          user: data.merchantId || data.customerId || 'Unknown',
          ip: 'N/A',
          riskScore: baseScore,
          reason: statusReasonMap[data.status] || 'Flagged by automated system',
          timestamp: toDateSafe(data.date).toLocaleString(),
        } as Transaction;
      });
      setTransactions(fetchedTransactions);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAction = async (action: string, txId: string) => {
    const statusMap: Record<string, string> = {
      'Requested KYC': 'KYC Requested',
      'Block': 'Blocked',
      'Approve': 'Success',
      'Dismiss': 'Success',
    };
    const newStatus = statusMap[action] || action;
    try {
      await updateDoc(doc(db, 'transactions', txId), { status: newStatus });
      setTransactions(prev => prev.map(tx => tx.id === txId ? { ...tx, status: newStatus } : tx));
      const updatedTx = transactions.find(tx => tx.id === txId);
      if (updatedTx) setSelectedTx({ ...updatedTx, status: newStatus });
      toast({ title: 'Action Applied', description: `Transaction marked as ${newStatus}.` });
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to update transaction. Check Firestore permissions.' });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud & Risk Management</h1>
        <p className="text-muted-foreground">Monitor and manage suspicious activities on your account.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Suspicious Transactions</CardTitle>
          <CardDescription>
            Review transactions that have been flagged by our AI-powered risk engine. Click a row for details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User / IP</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading suspicious transactions...</TableCell></TableRow>
              ) : transactions.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center">No suspicious transactions found.</TableCell></TableRow>
              ) : (transactions.map((tx) => (
                <TableRow key={tx.id} onClick={() => setSelectedTx(tx)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.user} <br/> <span className="text-muted-foreground text-xs">{tx.ip}</span></TableCell>
                  <TableCell>${tx.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(tx.riskScore)}>{tx.riskScore}</Badge>
                  </TableCell>
                  <TableCell>{tx.reason}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(tx.status)}>{tx.status}</Badge>
                  </TableCell>
                  <TableCell>{tx.timestamp}</TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
                Reviewing suspicious transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTx && (
            <div className="space-y-4 py-4">
               <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{selectedTx.id}</span>
                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTx.id, 'Transaction ID')} />
                  </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> <span>User:</span> <span className="font-semibold">{selectedTx.user}</span></div>
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span>IP Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{selectedTx.ip}</span>
                    <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTx.ip, 'IP Address')} />
                  </div>
                </div>
                <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-muted-foreground" /> <span>Amount:</span> <span className="font-semibold">${selectedTx.amount}</span></div>
                <div className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> <span>Timestamp:</span> <span className="font-semibold">{selectedTx.timestamp}</span></div>
              </div>
              <Separator />
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-muted-foreground" /> <span>Risk Score:</span> <Badge variant={getRiskBadgeVariant(selectedTx.riskScore)}>{selectedTx.riskScore}</Badge></div>
                  <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-muted-foreground" /> <span>Status:</span> <Badge variant={getStatusBadgeVariant(selectedTx.status)}>{selectedTx.status}</Badge></div>
               </div>
               <div className="flex items-start gap-2 pt-2">
                 <FileWarning className="h-4 w-4 text-muted-foreground mt-1" />
                 <div>
                    <span className="text-muted-foreground">Reason for Flagging:</span>
                    <p className="font-semibold">{selectedTx.reason}</p>
                 </div>
               </div>

              <Separator />
              <div className="space-y-2">
                <h4 className="font-semibold">Take Action</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleAction('Approved Payment', selectedTx.id)}><CheckCircle className="mr-2 h-4 w-4"/> Approve Payment</Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction('Held Payment', selectedTx.id)}><XCircle className="mr-2 h-4 w-4"/> Hold Payment</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleAction('Blocked User', selectedTx.id)}><Ban className="mr-2 h-4 w-4"/> Block User</Button>
                  <Button variant="outline" size="sm" onClick={() => handleAction('Requested KYC', selectedTx.id)}><FileText className="mr-2 h-4 w-4"/> Request KYC</Button>
                </div>
              </div>

            </div>
          )}
          <DialogFooter className="sm:justify-between gap-2">
            <Button variant="ghost" onClick={() => setSelectedTx(null)}>Close</Button>
            {selectedTx && (
                <Button asChild>
                    <Link href={`/dashboard/users/${selectedTx.user}`}>View Merchant Profile</Link>
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

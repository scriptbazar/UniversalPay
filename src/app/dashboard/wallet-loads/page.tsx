
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWalletLoadRequests, updateWalletLoadRequestStatus, type WalletLoadRequest } from "@/lib/walletLoadData";

const getStatusBadgeVariant = (status: WalletLoadRequest["status"]) => {
  switch (status) {
    case 'Approved':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Rejected':
      return 'destructive';
    default:
      return 'outline';
  }
}

export default function AdminWalletLoadsPage() {
    const { toast } = useToast();
    const [requests, setRequests] = useState<WalletLoadRequest[]>([]);

    useEffect(() => {
        setRequests(getWalletLoadRequests());
    }, []);

    const handleAction = (id: string, newStatus: "Approved" | "Rejected") => {
        updateWalletLoadRequestStatus(id, newStatus);
        setRequests(getWalletLoadRequests()); // Refresh data
        toast({
            title: `Request ${newStatus}`,
            description: `The wallet load request (ID: ${id}) has been updated.`,
        });
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Load Requests</h1>
        <p className="text-muted-foreground">Approve or reject wallet load requests from merchants.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>All Requests</CardTitle>
          <CardDescription>A list of all wallet load requests from merchants.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference/Txn ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>{req.merchantName}</TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono">{req.transactionId}</TableCell>
                  <TableCell>${req.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === 'Pending' ? (
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-100" onClick={() => handleAction(req.id, "Approved")}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, "Rejected")}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Processed</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

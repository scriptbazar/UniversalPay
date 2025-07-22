
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, User, Calendar, DollarSign, Hash, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getWalletLoadRequests, updateWalletLoadRequestStatus, type WalletLoadRequest } from "@/lib/walletLoadData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";

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
    const [selectedRequest, setSelectedRequest] = useState<WalletLoadRequest | null>(null);

    useEffect(() => {
        setRequests(getWalletLoadRequests());
    }, []);

    const handleAction = (e: React.MouseEvent, id: string, newStatus: "Approved" | "Rejected") => {
        e.stopPropagation();
        updateWalletLoadRequestStatus(id, newStatus);
        setRequests(getWalletLoadRequests()); // Refresh data
        setSelectedRequest(null);
        toast({
            title: `Request ${newStatus}`,
            description: `The wallet load request (ID: ${id}) has been updated.`,
        });
    };
    
    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: `${text} has been copied to your clipboard.`,
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
          <CardDescription>A list of all wallet load requests from merchants. Click a row for details.</CardDescription>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedRequest(req)}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                      <div>{req.merchantName}</div>
                      <div className="text-xs text-muted-foreground">{req.merchantEmail}</div>
                  </TableCell>
                  <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="font-mono">{req.transactionId}</TableCell>
                  <TableCell>${req.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wallet Load Request</DialogTitle>
            {selectedRequest && <DialogDescription>Details for request {selectedRequest.id}.</DialogDescription>}
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Merchant:</span> 
                    <div className="text-right">
                        <Link href={`/dashboard/users/${selectedRequest.merchantId}`} className="font-semibold hover:underline">
                            {selectedRequest.merchantName}
                        </Link>
                         <div className="flex items-center gap-2 justify-end">
                            <p className="text-sm text-muted-foreground">{selectedRequest.merchantEmail}</p>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedRequest.merchantEmail, 'Merchant Email')} />
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Date:</span> <span className="font-semibold">{new Date(selectedRequest.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">${selectedRequest.amount}</span></div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Reference ID:</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{selectedRequest.transactionId}</span>
                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedRequest.transactionId, 'Reference ID')} />
                    </div>
                </div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
                {selectedRequest.status === 'Pending' && (
                    <>
                    <Separator className="my-4"/>
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" className="text-green-600 border-green-600 hover:bg-green-100" onClick={(e) => handleAction(e, selectedRequest!.id, "Approved")}>
                            <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button variant="destructive" onClick={(e) => handleAction(e, selectedRequest!.id, "Rejected")}>
                            <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                    </div>
                    </>
                )}
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            {selectedRequest && (
                <Button asChild>
                    <Link href={`/dashboard/users/${selectedRequest.merchantId}`}>View Profile</Link>
                </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

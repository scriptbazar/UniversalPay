'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, User, Calendar, DollarSign, Hash, Copy, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import Link from "next/link";
import { onSnapshot, collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateWalletLoadRequestStatus, type WalletLoadRequest } from "@/lib/walletLoadData";

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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const requestsRef = collection(db, "walletLoadRequests");
        const q = query(requestsRef, orderBy("createdAt", "desc"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const fetchedRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletLoadRequest));
            setRequests(fetchedRequests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching wallet load requests:", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to fetch wallet load requests."
            });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [toast]);

    const handleAction = async (e: React.MouseEvent, id: string, newStatus: "Approved" | "Rejected") => {
        e.stopPropagation();
        await updateWalletLoadRequestStatus(id, newStatus);
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
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading requests...</TableCell></TableRow>
              ) : requests.length > 0 ? requests.map((req) => (
                <TableRow key={req.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedRequest(req)}>
                  <TableCell className="font-medium">{req.id}</TableCell>
                  <TableCell>
                      <div>{req.merchantName}</div>
                      <div className="text-xs text-muted-foreground">{req.merchantEmail}</div>
                  </TableCell>
                  <TableCell>{req.createdAt.toDate().toLocaleDateString()}</TableCell>
                  <TableCell>{req.method}</TableCell>
                  <TableCell>${req.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center">No wallet load requests found.</TableCell></TableRow>
              )}
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
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Date:</span> <span className="font-semibold">{selectedRequest.createdAt.toDate().toLocaleString()}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Method:</span> <span className="font-semibold flex items-center gap-2"><CreditCard className="w-4 h-4" />{selectedRequest.method}</span></div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Amount:</span> <span className="font-semibold">${selectedRequest.amount}</span></div>
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Reference ID:</span>
                    <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold">{selectedRequest.transactionId}</span>
                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedRequest.transactionId, 'Reference ID')} />
                    </div>
                </div>
                <div className="flex justify-between items-center"><span className="text-muted-foreground">Status:</span> <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge></div>
            </div>
          )}
           <DialogFooter className="flex flex-row items-center justify-start gap-2 pt-4">
            {selectedRequest && (
                <Button asChild variant="default">
                    <Link href={`/dashboard/users/${selectedRequest.merchantId}`}>View Profile</Link>
                </Button>
            )}
            <div className="flex-grow" />
            {selectedRequest?.status === 'Pending' && (
                <>
                    <Button variant="destructive" onClick={(e) => handleAction(e, selectedRequest!.id, "Rejected")}>
                        <X className="h-4 w-4 mr-1" /> Reject
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={(e) => handleAction(e, selectedRequest!.id, "Approved")}>
                        <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                </>
            )}
            <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

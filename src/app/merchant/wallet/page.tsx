'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Wallet, Copy, Banknote, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";

export type WalletLoadRequest = {
  id: string;
  merchantId: string;
  merchantName: string;
  merchantEmail: string;
  amount: string;
  currency: 'USD';
  method: string; // Method used for payment
  transactionId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: any;
};

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

export default function MerchantWalletPage() {
  const { toast } = useToast();
  const [requests, setRequests] = useState<WalletLoadRequest[]>([]);
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [method, setMethod] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<WalletLoadRequest | null>(null);
  const currentBalance = 5430.50; // Placeholder value
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMerchantRequests = async (uid: string) => {
     setLoading(true);
     const requestsRef = collection(db, "walletLoadRequests");
     const q = query(requestsRef, where("merchantId", "==", uid), orderBy("createdAt", "desc"));
     const querySnapshot = await getDocs(q);
     const fetchedRequests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WalletLoadRequest));
     setRequests(fetchedRequests);
     setLoading(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setCurrentUser(user);
            fetchMerchantRequests(user.uid);
        }
    });
    return () => unsubscribe();
  }, []);

  const handleRequestLoad = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to make a request.' });
        return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0 || !transactionId || !method) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid amount, transaction ID, and select a payment method.",
      });
      return;
    }
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const merchantName = userDoc.exists() ? userDoc.data().fullName : 'Your Business';
    const merchantEmail = userDoc.exists() ? userDoc.data().email : 'your-email@example.com';

    await addDoc(collection(db, "walletLoadRequests"), {
        amount: numericAmount.toFixed(2),
        currency: "USD",
        method: method,
        transactionId: transactionId,
        merchantId: user.uid,
        merchantName: merchantName,
        merchantEmail: merchantEmail,
        status: "Pending",
        createdAt: serverTimestamp(),
    });
    
    fetchMerchantRequests(user.uid); // Re-fetch to show the new request
    setAmount("");
    setTransactionId("");
    setMethod("");
    
    toast({
        title: "Request Submitted",
        description: `Your request to load $${numericAmount.toFixed(2)} is being reviewed.`,
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
        <h1 className="text-3xl font-bold tracking-tight">Wallet</h1>
        <p className="text-muted-foreground">Manage your wallet balance and load funds.</p>
      </div>
      <Separator />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Load Wallet</CardTitle>
              <CardDescription>Request to add funds to your wallet.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRequestLoad}>
              <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <div className="flex items-center gap-2 p-3 rounded-md bg-muted">
                        <Wallet className="w-6 h-6 text-muted-foreground"/>
                        <span className="text-2xl font-bold">${currentBalance.toFixed(2)}</span>
                        <span className="text-muted-foreground">USD</span>
                    </div>
                </div>
                 <div className="space-y-2">
                  <Label htmlFor="method">Payment Method Used</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="method">
                      <SelectValue placeholder="Select method used" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="Crypto (USDT)">Crypto (USDT)</SelectItem>
                    </SelectContent>
                  </Select>
                   <p className="text-xs text-muted-foreground">
                    Please transfer funds to our company account first.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount Sent (USD)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    placeholder="e.g., 500.00" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="transactionId">Your Payment Transaction ID</Label>
                  <Input 
                    id="transactionId" 
                    type="text" 
                    placeholder="e.g., PAYID12345678" 
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    required 
                  />
                </div>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full" type="submit">Request Wallet Load</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Wallet Load History</CardTitle>
              <CardDescription>A record of all your wallet load requests. Click row for details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Request ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading requests...</TableCell></TableRow>
                  ) : requests.length > 0 ? requests.map((req) => (
                    <TableRow key={req.id} onClick={() => setSelectedRequest(req)} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{req.id}</TableCell>
                      <TableCell>{req.createdAt.toDate().toLocaleDateString()}</TableCell>
                      <TableCell>${req.amount}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(req.status)}>{req.status}</Badge>
                      </TableCell>
                    </TableRow>
                  )) : (
                     <TableRow><TableCell colSpan={4} className="h-24 text-center">No requests found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Request Details</DialogTitle>
                {selectedRequest && <DialogDescription>Details for wallet load request {selectedRequest.id}.</DialogDescription>}
            </DialogHeader>
            {selectedRequest && (
                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Request ID:</span>
                        <span className="font-mono font-semibold">{selectedRequest.id}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-semibold">{selectedRequest.createdAt.toDate().toLocaleString()}</span>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-semibold">{selectedRequest.method}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${selectedRequest.amount}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reference ID:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-semibold">{selectedRequest.transactionId}</span>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedRequest.transactionId, 'Reference ID')} />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>{selectedRequest.status}</Badge>
                    </div>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

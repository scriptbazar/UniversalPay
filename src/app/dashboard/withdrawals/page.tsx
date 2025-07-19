
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X, Landmark, User, Calendar, DollarSign, Wallet, Hash, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { type Withdrawal, getWithdrawals, updateWithdrawalStatus } from "@/lib/withdrawalsData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

const getStatusBadgeVariant = (status: Withdrawal["status"]) => {
  switch (status) {
    case 'Completed':
      return 'default';
    case 'Pending':
      return 'secondary';
    case 'Failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

const truncateAddress = (address: string) => {
    if (address.length <= 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

export default function AdminWithdrawalsPage() {
    const { toast } = useToast();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
    const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);

    useEffect(() => {
        setWithdrawals(getWithdrawals());
    }, []);

    const handleAction = (e: React.MouseEvent, id: string, newStatus: "Completed" | "Failed") => {
        e.stopPropagation(); // Prevent row click event
        updateWithdrawalStatus(id, newStatus);
        setWithdrawals(getWithdrawals()); // Refresh data from source
        setSelectedWithdrawal(null); // Close the dialog
        toast({
            title: `Withdrawal ${newStatus}`,
            description: `The withdrawal request (ID: ${id}) has been updated.`,
        });
    };
    
    const handleRowClick = (withdrawal: Withdrawal) => {
        setSelectedWithdrawal(withdrawal);
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
            description: `${text} has been copied to your clipboard.`,
        });
    };

    const itemsPerPage = 5;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(withdrawals.length / itemsPerPage);
    const paginatedWithdrawals = withdrawals.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Withdrawals</h1>
        <p className="text-muted-foreground">Approve or reject withdrawal requests from merchants.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Requests</CardTitle>
          <CardDescription>A list of all withdrawal requests across the platform. Click a row to see details.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Merchant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWithdrawals.map((w) => (
                <TableRow key={w.id} onClick={() => handleRowClick(w)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{w.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{w.merchantName}</div>
                    <div className="text-xs text-muted-foreground">{w.merchantId}</div>
                  </TableCell>
                  <TableCell>{w.date}</TableCell>
                  <TableCell>{truncateAddress(w.destination)}</TableCell>
                  <TableCell>${w.amount} {w.currency}</TableCell>
                   <TableCell>
                    <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
         <CardFooter>
            <div className="flex justify-between items-center w-full">
                <div className="text-xs text-muted-foreground">
                    Showing <strong>{(currentPage - 1) * itemsPerPage + 1}-{(currentPage - 1) * itemsPerPage + paginatedWithdrawals.length}</strong> of <strong>{withdrawals.length}</strong> withdrawals
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </CardFooter>
      </Card>
      
      {selectedWithdrawal && (
        <Dialog open={!!selectedWithdrawal} onOpenChange={() => setSelectedWithdrawal(null)}>
            <DialogContent className="max-w-xl">
                 <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-4">
                                <Landmark className="h-8 w-8 text-muted-foreground" />
                                <div>
                                    <DialogTitle className="text-2xl">Withdrawal Details</DialogTitle>
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-muted-foreground font-mono">{selectedWithdrawal.id}</p>
                                        <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedWithdrawal.id, 'Request ID')} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Badge variant={getStatusBadgeVariant(selectedWithdrawal.status)} className="text-base px-4 py-1">{selectedWithdrawal.status}</Badge>
                    </div>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <User className="w-6 h-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Merchant</p>
                                <Link href={`/dashboard/users/${selectedWithdrawal.merchantId}`} className="font-semibold hover:underline">
                                    {selectedWithdrawal.merchantName}
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Calendar className="w-6 h-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Requested On</p>
                                <p className="font-semibold">{selectedWithdrawal.date}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <DollarSign className="w-6 h-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-semibold">${selectedWithdrawal.amount} {selectedWithdrawal.currency}</p>
                            </div>
                        </div>
                    </div>
                    <Separator/>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <Wallet className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Destination Type</p>
                                <p className="font-semibold">{selectedWithdrawal.destination.startsWith('bc1') ? 'Bitcoin Wallet' : selectedWithdrawal.destination.startsWith('T') ? 'USDT (TRC20) Wallet' : 'Bank Account'}</p> 
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Hash className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Destination Address</p>
                                <div className="flex items-center gap-2">
                                     <p className="font-semibold font-mono break-all">{selectedWithdrawal.destination}</p>
                                     <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground flex-shrink-0" onClick={() => copyToClipboard(selectedWithdrawal.destination, 'Destination Address')} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedWithdrawal.status === "Pending" && (
                        <>
                            <Separator />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Actions</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Please verify the transaction details before approving. This action cannot be undone.
                                </p>
                                <div className="flex gap-4">
                                    <Button size="lg" variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200" onClick={(e) => handleAction(e, selectedWithdrawal.id, "Completed")}>
                                        <Check className="mr-2 h-5 w-5" />Approve
                                    </Button>
                                    <Button size="lg" variant="destructive" onClick={(e) => handleAction(e, selectedWithdrawal.id, "Failed")}>
                                        <X className="mr-2 h-5 w-5" />Reject
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
      )}

    </div>
  );
}


'use client';

import { ArrowLeft, Landmark, Check, X, User, Calendar, DollarSign, Wallet, Hash, Ticket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Mock data - in a real app, you'd fetch this based on params.withdrawalId
const withdrawalDetails = {
    id: "wd_5",
    transactionId: "txn_wd_17000345",
    merchant: {
        id: "merch_456",
        name: "CreativeGoods",
    },
    amount: "1200.00",
    currency: "USDT",
    destinationType: "Crypto Wallet",
    destination: "TPAeJ1pGoce3yYdHjC5yYwYJz5xQ8vYfBc",
    status: "Pending" as "Pending" | "Completed" | "Failed",
    createdAt: "2023-10-27",
    processedAt: null,
};

const getStatusBadgeVariant = (status: "Pending" | "Completed" | "Failed") => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Pending': return 'secondary';
      case 'Failed': return 'destructive';
      default: return 'outline';
    }
}

export default function WithdrawalDetailPage({ params }: { params: { withdrawalId: string } }) {
  const { toast } = useToast();
  const [withdrawal, setWithdrawal] = useState(withdrawalDetails);

  const handleAction = (newStatus: "Completed" | "Failed") => {
    setWithdrawal(prev => ({ ...prev, status: newStatus }));
    toast({
        title: `Withdrawal ${newStatus}`,
        description: `The withdrawal request (ID: ${withdrawal.id}) has been updated.`,
    });
  };

  return (
    <div className="space-y-6">
        <Link href="/dashboard/withdrawals" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4"/>
            Back to All Withdrawals
        </Link>
        
        <Card>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-4">
                            <Landmark className="h-8 w-8 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-2xl">Withdrawal Details</CardTitle>
                                <p className="text-sm text-muted-foreground font-mono">{withdrawal.id}</p>
                            </div>
                        </div>
                    </div>
                     <Badge variant={getStatusBadgeVariant(withdrawal.status)} className="text-base px-4 py-1">{withdrawal.status}</Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Merchant</p>
                            <Link href={`/dashboard/users/${withdrawal.merchant.id}`} className="font-semibold hover:underline">
                                {withdrawal.merchant.name}
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Requested On</p>
                            <p className="font-semibold">{withdrawal.createdAt}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <DollarSign className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-muted-foreground">Amount</p>
                            <p className="font-semibold">{withdrawal.amount} {withdrawal.currency}</p>
                        </div>
                    </div>
                </div>
                <Separator className="my-6" />
                <div className="grid md:grid-cols-2 gap-6">
                     <div className="flex items-start gap-4">
                        <Wallet className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <p className="text-sm text-muted-foreground">Destination Type</p>
                            <p className="font-semibold">{withdrawal.destinationType}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Hash className="w-6 h-6 text-primary mt-1" />
                        <div>
                            <p className="text-sm text-muted-foreground">Destination Address</p>
                            <p className="font-semibold font-mono break-all">{withdrawal.destination}</p>
                        </div>
                    </div>
                </div>

                {withdrawal.status === "Completed" && withdrawal.transactionId && (
                     <>
                        <Separator className="my-6" />
                         <div className="flex items-start gap-4">
                            <Ticket className="w-6 h-6 text-primary mt-1" />
                            <div>
                                <p className="text-sm text-muted-foreground">Transaction ID</p>
                                <p className="font-semibold font-mono break-all">{withdrawal.transactionId}</p>
                            </div>
                        </div>
                    </>
                )}
                
                {withdrawal.status === "Pending" && (
                    <>
                        <Separator className="my-6"/>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Actions</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Please verify the transaction details before approving. This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <Button size="lg" variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200" onClick={() => handleAction("Completed")}>
                                    <Check className="mr-2 h-5 w-5" />Approve
                                </Button>
                                <Button size="lg" variant="destructive" onClick={() => handleAction("Failed")}>
                                    <X className="mr-2 h-5 w-5" />Reject
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
  )
}

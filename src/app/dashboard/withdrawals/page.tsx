
'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type Withdrawal = {
  id: string;
  merchantName: string;
  merchantId: string;
  amount: string;
  currency: string;
  destination: string;
  status: "Pending" | "Completed" | "Failed";
  date: string;
};

const initialWithdrawals: Withdrawal[] = [
  { id: "wd_1", merchantName: "MyStore.com", merchantId: "merch_123", amount: "500.00", currency: "USDT", destination: "T...xyz", status: "Completed", date: "2023-10-25" },
  { id: "wd_5", merchantName: "CreativeGoods", merchantId: "merch_456", amount: "1200.00", currency: "USDT", destination: "T...abc", status: "Pending", date: "2023-10-27" },
  { id: "wd_2", merchantName: "AnotherShop", merchantId: "merch_789", amount: "1000.00", currency: "USDT", destination: "T...xyz", status: "Completed", date: "2023-10-20" },
  { id: "wd_3", merchantName: "MyStore.com", merchantId: "merch_123", amount: "250.00", currency: "INR", destination: "Bank A/c ...1234", status: "Completed", date: "2023-10-18" },
  { id: "wd_4", merchantName: "AnotherShop", merchantId: "merch_789", amount: "750.00", currency: "USDT", destination: "T...xyz", status: "Failed", date: "2023-10-15" },
  { id: "wd_6", merchantName: "TechGadgets", merchantId: "merch_101", amount: "300.00", currency: "USDT", destination: "T...def", status: "Pending", date: "2023-10-28" },
  { id: "wd_7", merchantName: "FashionHub", merchantId: "merch_202", amount: "850.00", currency: "INR", destination: "Bank A/c ...5678", status: "Pending", date: "2023-10-28" },

];

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

export default function AdminWithdrawalsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);

    const handleAction = (e: React.MouseEvent, id: string, newStatus: "Completed" | "Failed") => {
        e.stopPropagation(); // Prevent row click event
        setWithdrawals(prev => 
            prev.map(w => w.id === id ? { ...w, status: newStatus } : w)
        );
        toast({
            title: `Withdrawal ${newStatus}`,
            description: `The withdrawal request (ID: ${id}) has been updated.`,
        });
    };
    
    const handleRowClick = (withdrawalId: string) => {
        router.push(`/dashboard/withdrawals/${withdrawalId}`);
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
          <CardDescription>A list of all withdrawal requests across the platform.</CardDescription>
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
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedWithdrawals.map((w) => (
                <TableRow key={w.id} onClick={() => handleRowClick(w.id)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{w.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{w.merchantName}</div>
                    <div className="text-xs text-muted-foreground">{w.merchantId}</div>
                  </TableCell>
                  <TableCell>{w.date}</TableCell>
                  <TableCell>{w.destination}</TableCell>
                  <TableCell>${w.amount} {w.currency}</TableCell>
                   <TableCell>
                    <Badge variant={getStatusBadgeVariant(w.status)}>{w.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {w.status === "Pending" && (
                        <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200" onClick={(e) => handleAction(e, w.id, 'Completed')}>
                                <Check className="h-4 w-4 mr-2" />Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={(e) => handleAction(e, w.id, 'Failed')}>
                                <X className="h-4 w-4 mr-2" />Reject
                            </Button>
                        </div>
                    )}
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
    </div>
  );
}

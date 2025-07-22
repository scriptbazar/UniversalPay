'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, DollarSign, Percent, Copy, User, CreditCard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import Image from "next/image";

type SubMerchant = {
    id: string;
    name: string;
    email: string;
    sales: string;
    commission: string;
    status: "Active" | "Inactive";
};

const subMerchants: SubMerchant[] = [
  {
    id: "user_1",
    name: "MyStore.com",
    email: "contact@mystore.com",
    sales: "12500.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_2",
    name: "AnotherShop",
    email: "sales@anothershop.io",
    sales: "8200.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_3",
    name: "CreativeGoods",
    email: "support@creative.co",
    sales: "4500.00",
    commission: "7%",
    status: "Inactive",
  },
  {
    id: "sub_4",
    name: "TechGadgets",
    email: "info@techgadgets.com",
    sales: "22000.00",
    commission: "4.5%",
    status: "Active",
  },
  {
    id: "sub_5",
    name: "FashionHub",
    email: "contact@fashionhub.com",
    sales: "9500.00",
    commission: "6%",
    status: "Active",
  },
  {
    id: "sub_6",
    name: "BookwormDen",
    email: "orders@bookwormden.com",
    sales: "3200.00",
    commission: "8%",
    status: "Active",
  },
  {
    id: "sub_7",
    name: "HomeDecorCo",
    email: "sales@homedecor.co",
    sales: "0.00",
    commission: "5%",
    status: "Inactive",
  },
];

type Transaction = {
    id: string;
    merchantId: string;
    merchantName: string;
    merchantEmail: string;
    amount: number;
    date: string;
    method: 'UPI' | 'Crypto' | 'Page' | 'Link';
    status: 'Success' | 'Failed' | 'Pending';
};

const allSubMerchantTransactions: Transaction[] = [
    { id: 'UVRLP911202311', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 50.00, date: '2023-11-10', method: 'Page', status: 'Success' },
    { id: 'UVRLP911202312', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 75.00, date: '2023-11-10', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202313', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 120.00, date: '2023-11-09', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202314', merchantId: 'sub_4', merchantName: 'TechGadgets', merchantEmail: 'info@techgadgets.com', amount: 200.00, date: '2023-11-09', method: 'Crypto', status: 'Pending' },
    { id: 'UVRLP911202315', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 30.00, date: '2023-11-08', method: 'Page', status: 'Failed' },
    { id: 'UVRLP911202316', merchantId: 'sub_5', merchantName: 'FashionHub', merchantEmail: 'contact@fashionhub.com', amount: 85.50, date: '2023-11-08', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202317', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 250.00, date: '2023-11-07', method: 'Crypto', status: 'Success' },
    { id: 'UVRLP911202318', merchantId: 'sub_6', merchantName: 'BookwormDen', merchantEmail: 'orders@bookwormden.com', amount: 15.00, date: '2023-11-07', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202319', merchantId: 'sub_4', merchantName: 'TechGadgets', merchantEmail: 'info@techgadgets.com', amount: 450.00, date: '2023-11-06', method: 'Page', status: 'Success' },
    { id: 'UVRLP911202320', merchantId: 'sub_5', merchantName: 'FashionHub', merchantEmail: 'contact@fashionhub.com', amount: 125.00, date: '2023-11-06', method: 'UPI', status: 'Success' },
    { id: 'UVRLP911202321', merchantId: 'user_1', merchantName: 'MyStore.com', merchantEmail: 'contact@mystore.com', amount: 99.99, date: '2023-11-05', method: 'Link', status: 'Success' },
    { id: 'UVRLP911202322', merchantId: 'sub_2', merchantName: 'AnotherShop', merchantEmail: 'sales@anothershop.io', amount: 40.00, date: '2023-11-05', method: 'Crypto', status: 'Failed' },
];

type DialogType = 'subMerchants' | 'avg_commission' | null;

const getStatusBadgeVariant = (status: Transaction["status"]) => {
    switch (status) {
        case 'Success':
            return 'default';
        case 'Pending':
            return 'secondary';
        case 'Failed':
            return 'destructive';
        default:
            return 'outline';
    }
};

export default function ResellerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
  const [selectedMerchant, setSelectedMerchant] = useState<SubMerchant | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalSales = subMerchants.reduce((acc, m) => acc + parseFloat(m.sales), 0);

  const handleRowClick = (merchantId: string) => {
    router.push(`/dashboard/users/${merchantId}`);
  };

  const handleSubMerchantRowClick = (merchant: SubMerchant) => {
    setSelectedMerchant(merchant);
  }

  const handleTransactionRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }

  const openDialog = (type: DialogType) => {
    setCurrentPage(1); // Reset page to 1 when opening a new dialog
    setDialogOpen(type);
  }

  // Memoized pagination logic for sub-merchants
  const paginatedSubMerchants = subMerchants.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );
  const totalSubMerchantPages = Math.ceil(subMerchants.length / itemsPerPage);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: `${label} Copied!`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reseller Dashboard</h1>
        <p className="text-muted-foreground">Manage your sub-merchants, track sales, and assign commissions.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => openDialog('subMerchants')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subMerchants.length}</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/transactions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Merchant Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Total sales this month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/transactions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,260.00</div>
            <p className="text-xs text-muted-foreground">Earned this month</p>
          </CardContent>
        </Card>
        <Card onClick={() => openDialog('avg_commission')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Commission Rate</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~5.5%</div>
            <p className="text-xs text-muted-foreground">Across all sub-merchants</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sub-Merchants</CardTitle>
            <CardDescription>A list of all merchants under your reseller account. Click a row for details.</CardDescription>
          </div>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Invite Merchant</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subMerchants.map((merchant) => (
                <TableRow key={merchant.id} onClick={() => handleRowClick(merchant.id)} className="cursor-pointer hover:bg-muted/50">
                  <TableCell>
                    <div className="font-medium">{merchant.name}</div>
                    <div className="text-sm text-muted-foreground">{merchant.email}</div>
                  </TableCell>
                  <TableCell>${parseFloat(merchant.sales).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                  <TableCell>{merchant.commission}</TableCell>
                  <TableCell>
                    <Badge variant={merchant.status === "Active" ? "default" : "secondary"}>
                      {merchant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog for Sub-Merchants List */}
      <Dialog open={dialogOpen === 'subMerchants'} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>All Sub-Merchants</DialogTitle>
                <DialogDescription>Click on a merchant to view their detailed dashboard.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedSubMerchants.map(merchant => (
                            <TableRow key={merchant.id} onClick={() => handleSubMerchantRowClick(merchant)} className="cursor-pointer hover:bg-muted/50">
                                <TableCell>
                                    <div className="font-medium">{merchant.name}</div>
                                    <div className="text-sm text-muted-foreground">{merchant.email}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={merchant.status === "Active" ? "default" : "secondary"}>
                                    {merchant.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
             <DialogFooter className="sm:justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalSubMerchantPages}
                </div>
                {totalSubMerchantPages > 1 && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalSubMerchantPages))} disabled={currentPage === totalSubMerchantPages}>Next</Button>
                    </div>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for Avg Commission Rate */}
       <Dialog open={dialogOpen === 'avg_commission'} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Average Commission Rate</DialogTitle>
                 <DialogDescription>This is a weighted average based on sales volume and individual commission rates.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                {subMerchants.map(m => (
                    <div key={m.id} className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">{m.name}</span>
                        <div className="text-right">
                           <p className="font-semibold">{m.commission}</p>
                           <p className="text-xs text-muted-foreground">on ${parseFloat(m.sales).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span>Average Rate:</span> <span>~5.5%</span></div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(null)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Selected Merchant Details */}
       <Dialog open={!!selectedMerchant} onOpenChange={() => setSelectedMerchant(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Sub-Merchant Details</DialogTitle>
                <DialogDescription>
                    Summary for {selectedMerchant?.name}.
                </DialogDescription>
            </DialogHeader>
            {selectedMerchant && (
                <div className="py-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <Image src={`https://placehold.co/64x64.png?text=${selectedMerchant.name.charAt(0)}`} alt={selectedMerchant.name} width={64} height={64} className="rounded-full" data-ai-hint="user avatar" />
                        <div>
                            <h3 className="text-lg font-semibold">{selectedMerchant.name}</h3>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-muted-foreground">{selectedMerchant.email}</p>
                                <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedMerchant.email, 'Email')} />
                            </div>
                        </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2"><Users className="h-4 w-4 text-muted-foreground"/> <span>Status:</span> <Badge variant={selectedMerchant.status === "Active" ? "default" : "secondary"}>{selectedMerchant.status}</Badge></div>
                        <div className="flex items-center gap-2"><Percent className="h-4 w-4 text-muted-foreground"/> <span>Commission:</span> <span className="font-semibold">{selectedMerchant.commission}</span></div>
                        <div className="flex items-center gap-2 col-span-2"><DollarSign className="h-4 w-4 text-muted-foreground"/> <span>Total Sales:</span> <span className="font-semibold">${parseFloat(selectedMerchant.sales).toLocaleString()}</span></div>
                    </div>
                </div>
            )}
            <DialogFooter className="sm:justify-between gap-2">
                <Button variant="ghost" onClick={() => setSelectedMerchant(null)}>Close</Button>
                {selectedMerchant && (
                    <Button asChild>
                        <Link href={`/dashboard/users/${selectedMerchant.id}`}>View Full Profile</Link>
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
      
       {/* Dialog for Selected Transaction Details */}
       <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>
                    Details for transaction {selectedTransaction?.id}.
                </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
                <div className="py-4 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Transaction ID:</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono">{selectedTransaction.id}</span>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.id, 'Transaction ID')} />
                        </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Merchant:</span>
                        <span className="font-semibold">{selectedTransaction.merchantName}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Customer Email:</span>
                         <div className="flex items-center gap-2">
                            <span className="font-semibold">{selectedTransaction.merchantEmail}</span>
                            <Copy className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground" onClick={() => copyToClipboard(selectedTransaction.merchantEmail, 'Customer Email')} />
                        </div>
                    </div>
                     <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-semibold">${selectedTransaction.amount.toFixed(2)}</span>
                    </div>
                     <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-semibold">{selectedTransaction.method}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>
                    </div>
                    <Separator />
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-semibold">{selectedTransaction.date}</span>
                    </div>
                </div>
            )}
            <DialogFooter className="sm:justify-between gap-2">
                <Button variant="ghost" onClick={() => setSelectedTransaction(null)}>Close</Button>
                {selectedTransaction && (
                    <Button asChild>
                        <Link href={`/dashboard/users/${selectedTransaction.merchantId}`}>View Merchant Profile</Link>
                    </Button>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

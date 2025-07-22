'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, DollarSign, Percent } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const subMerchants = [
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

const allSubMerchantTransactions = [
    { id: 'UVRLP911202311', merchantName: 'MyStore.com', amount: 50.00, date: '2023-11-10' },
    { id: 'UVRLP911202312', merchantName: 'AnotherShop', amount: 75.00, date: '2023-11-10' },
    { id: 'UVRLP911202313', merchantName: 'MyStore.com', amount: 120.00, date: '2023-11-09' },
    { id: 'UVRLP911202314', merchantName: 'TechGadgets', amount: 200.00, date: '2023-11-09' },
    { id: 'UVRLP911202315', merchantName: 'AnotherShop', amount: 30.00, date: '2023-11-08' },
    { id: 'UVRLP911202316', merchantName: 'FashionHub', amount: 85.50, date: '2023-11-08' },
    { id: 'UVRLP911202317', merchantName: 'MyStore.com', amount: 250.00, date: '2023-11-07' },
    { id: 'UVRLP911202318', merchantName: 'BookwormDen', amount: 15.00, date: '2023-11-07' },
    { id: 'UVRLP911202319', merchantName: 'TechGadgets', amount: 450.00, date: '2023-11-06' },
    { id: 'UVRLP911202320', merchantName: 'FashionHub', amount: 125.00, date: '2023-11-06' },
    { id: 'UVRLP911202321', merchantName: 'MyStore.com', amount: 99.99, date: '2023-11-05' },
    { id: 'UVRLP911202322', merchantName: 'AnotherShop', amount: 40.00, date: '2023-11-05' },
];

type DialogType = 'subMerchants' | 'sales' | 'commission' | 'avg_commission' | null;

export default function ResellerPage() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState<DialogType>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const totalSales = subMerchants.reduce((acc, m) => acc + parseFloat(m.sales), 0);

  const handleRowClick = (merchantId: string) => {
    router.push(`/dashboard/users/${merchantId}`);
  };

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

  // Memoized pagination logic for transactions
  const paginatedTransactions = allSubMerchantTransactions.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
  );
  const totalTransactionPages = Math.ceil(allSubMerchantTransactions.length / itemsPerPage);

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
        <Card onClick={() => openDialog('sales')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Merchant Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Total sales this month</p>
          </CardContent>
        </Card>
        <Card onClick={() => openDialog('commission')} className="cursor-pointer hover:bg-muted/50">
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
                            <TableRow key={merchant.id} onClick={() => handleRowClick(merchant.id)} className="cursor-pointer hover:bg-muted/50">
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
      
      {/* Dialog for Sub-Merchant Sales */}
      <Dialog open={dialogOpen === 'sales'} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent className="max-w-xl">
            <DialogHeader>
                <DialogTitle>All Sub-Merchant Transactions</DialogTitle>
                <DialogDescription>A list of all successful transactions from your sub-merchants.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Merchant</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedTransactions.map(tx => (
                            <TableRow key={tx.id}>
                                <TableCell className="font-mono">{tx.id}</TableCell>
                                <TableCell>{tx.merchantName}</TableCell>
                                <TableCell>{tx.date}</TableCell>
                                <TableCell className="text-right">${tx.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DialogFooter className="sm:justify-between pt-4">
                <div className="text-xs text-muted-foreground">
                    Page {currentPage} of {totalTransactionPages}
                </div>
                {totalTransactionPages > 1 && (
                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Previous</Button>
                        <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalTransactionPages))} disabled={currentPage === totalTransactionPages}>Next</Button>
                    </div>
                )}
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Commission Details */}
       <Dialog open={dialogOpen === 'commission'} onOpenChange={() => setDialogOpen(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Commission Breakdown</DialogTitle>
                 <DialogDescription>Details of your earnings for this month.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Sub-Merchant Sales:</span> <span className="font-semibold">${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Average Commission Rate:</span> <span className="font-semibold">~5.5%</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span>Total Commission Earned:</span> <span>$1,260.00</span></div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(null)}>Close</Button>
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

    </div>
  );
}

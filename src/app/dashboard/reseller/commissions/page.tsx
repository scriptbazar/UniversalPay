'use client';

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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

export default function CommissionsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    const totalPages = Math.ceil(subMerchants.length / itemsPerPage);
    const paginatedMerchants = subMerchants.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    
    return (
        <div className="space-y-6">
            <Link href="/dashboard/reseller" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                Back to Reseller Dashboard
            </Link>
             <Card>
                <CardHeader>
                    <CardTitle>Sub-Merchant Commissions</CardTitle>
                    <CardDescription>
                        A complete list of all your sub-merchants and their assigned commission rates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Sales (USD)</TableHead>
                                <TableHead className="text-right">Commission Rate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedMerchants.map(merchant => (
                                <TableRow key={merchant.id}>
                                    <TableCell>
                                        <div className="font-medium">{merchant.name}</div>
                                        <div className="text-sm text-muted-foreground">{merchant.email}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={merchant.status === 'Active' ? 'default' : 'secondary'}>{merchant.status}</Badge>
                                    </TableCell>
                                    <TableCell>${parseFloat(merchant.sales).toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-semibold">{merchant.commission}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
                 <CardFooter>
                     <div className="flex justify-between items-center w-full">
                        <div className="text-xs text-muted-foreground">
                            Page {currentPage} of {totalPages}. Total {subMerchants.length} merchants.
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

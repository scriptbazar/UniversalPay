
'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Copy, DollarSign, Percent, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { getSubMerchants, type SubMerchant } from '@/lib/resellerData';

export default function CommissionsPage() {
    const { toast } = useToast();
    const [subMerchants, setSubMerchants] = useState<SubMerchant[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedMerchant, setSelectedMerchant] = useState<SubMerchant | null>(null);
    const itemsPerPage = 10;
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const merchants = await getSubMerchants();
            setSubMerchants(merchants);
            setLoading(false);
        }
        fetchData();
    }, []);

    const totalPages = Math.ceil(subMerchants.length / itemsPerPage);
    const paginatedMerchants = subMerchants.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `${label} Copied!`,
        });
    };
    
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
                        A complete list of all your sub-merchants and their assigned commission rates. Click a row for details.
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
                             {loading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading merchants...</TableCell></TableRow>
                            ) : paginatedMerchants.length > 0 ? paginatedMerchants.map(merchant => (
                                <TableRow key={merchant.id} onClick={() => setSelectedMerchant(merchant)} className="cursor-pointer hover:bg-muted/50">
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
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No sub-merchants found.
                                    </TableCell>
                                </TableRow>
                            )}
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
        </div>
    );
}

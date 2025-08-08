'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, DollarSign, Percent, User, Check, X, ShieldQuestion } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { getSubMerchants, type SubMerchant, getResellerRequests, handleResellerRequest, type ResellerRequest } from "@/lib/resellerData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResellerPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [subMerchants, setSubMerchants] = useState<SubMerchant[]>([]);
  const [requests, setRequests] = useState<ResellerRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        setLoading(true);
        const [merchants, resellerRequests] = await Promise.all([
          getSubMerchants(),
          getResellerRequests()
        ]);
        setSubMerchants(merchants);
        setRequests(resellerRequests);
        setLoading(false);
    }
    fetchData();
  }, []);

  const totalSales = subMerchants.reduce((acc, m) => acc + parseFloat(m.sales), 0);

  const handleRowClick = (merchantId: string) => {
    router.push(`/dashboard/users/${merchantId}`);
  };

  const onRequestHandler = async (requestId: string, merchantId: string, action: 'approve' | 'reject') => {
      const result = await handleResellerRequest(requestId, merchantId, action);
      if(result.success) {
          toast({ title: 'Success', description: `Request has been ${action}d.`});
          // Refresh the data
          setRequests(await getResellerRequests());
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
  }


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reseller Dashboard</h1>
        <p className="text-muted-foreground">Manage your sub-merchants, track sales, and approve reseller requests.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card onClick={() => router.push('/dashboard/users?role=reseller')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resellers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{subMerchants.length}</div>}
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/transactions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Merchant Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">${totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>}
            <p className="text-xs text-muted-foreground">Total sales this month</p>
          </CardContent>
        </Card>
        <Card onClick={() => router.push('/dashboard/reseller/transactions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">$1,260.00</div>}
            <p className="text-xs text-muted-foreground">Earned this month</p>
          </CardContent>
        </Card>
         <Card onClick={() => router.push('/dashboard/reseller/commissions')} className="cursor-pointer hover:bg-muted/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <ShieldQuestion className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <Skeleton className="h-8 w-1/2" /> : <div className="text-2xl font-bold">{requests.filter(r => r.status === 'pending').length}</div>}
            <p className="text-xs text-muted-foreground">Awaiting your approval</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="merchants">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="merchants">Sub-Merchants</TabsTrigger>
          <TabsTrigger value="requests">Reseller Requests</TabsTrigger>
        </TabsList>
        <TabsContent value="merchants">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Sub-Merchants</CardTitle>
                    <CardDescription>A list of all merchants under your reseller program. Click a row for details.</CardDescription>
                </div>
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
                    {loading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading merchants...</TableCell></TableRow>
                    ) : subMerchants.length > 0 ? subMerchants.map((merchant) => (
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
            </Card>
        </TabsContent>
         <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Reseller Requests</CardTitle>
              <CardDescription>Approve or reject requests from merchants who want to join the reseller program.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Merchant</TableHead>
                    <TableHead>Requested On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {loading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading requests...</TableCell></TableRow>
                    ) : requests.length > 0 ? requests.map((request) => (
                    <TableRow key={request.id}>
                        <TableCell>
                            <Link href={`/dashboard/users/${request.merchantId}`} className="font-medium hover:underline">{request.merchantName}</Link>
                            <div className="text-sm text-muted-foreground">{request.merchantEmail}</div>
                        </TableCell>
                        <TableCell>{new Date(request.createdAt.toDate()).toLocaleDateString()}</TableCell>
                        <TableCell>
                            <Badge variant={request.status === 'pending' ? 'secondary' : request.status === 'approved' ? 'default' : 'destructive'}>
                                {request.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                           {request.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" onClick={() => onRequestHandler(request.id, request.merchantId, 'approve')} className="bg-green-600 hover:bg-green-700 text-white">
                                        <Check className="mr-2 h-4 w-4"/>Approve
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => onRequestHandler(request.id, request.merchantId, 'reject')}>
                                        <X className="mr-2 h-4 w-4"/>Reject
                                    </Button>
                                </div>
                           )}
                        </TableCell>
                    </TableRow>
                     )) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">
                                No reseller requests found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

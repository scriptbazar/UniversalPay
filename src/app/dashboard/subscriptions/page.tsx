
'use client';

import React, { useEffect, useState, useOptimistic } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, PlusCircle, Trash2, Users, FileText, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { auth, db } from '@/lib/firebase';
import { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from './actions';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export type Plan = {
    id?: string;
    name: string;
    price: string;
    transactions: string;
    features: string;
    api_quota: string;
};

type SubscribedMerchant = {
  id: string;
  fullName: string;
  email: string;
  plan: 'Free' | 'Pro' | 'Premium';
  status: 'Active' | 'Cancelled';
  createdAt: Timestamp;
};


function EditPlanDialog({ plan, onSave }: { plan: Plan; onSave: (updatedPlan: Plan) => void; }) {
    const [open, setOpen] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);
    const [formData, setFormData] = React.useState(plan);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {plan.name} Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" readOnly />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" value={formData.price} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="transactions" className="text-right">Transactions</Label>
                            <Input id="transactions" value={formData.transactions} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="features" className="text-right">Features</Label>
                            <Input id="features" value={formData.features} onChange={handleChange} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="api_quota" className="text-right">API Quota</Label>
                            <Input id="api_quota" value={formData.api_quota} onChange={handleChange} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" type="button" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function SubscriptionsPage() {
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [plans, setPlans] = React.useState<Plan[]>([]);
  const { toast } = useToast();
  const router = useRouter();
  const [subscribedMerchants, setSubscribedMerchants] = useState<SubscribedMerchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fetchPlans = async () => {
      setLoading(true);
      const fetchedPlans = await getSubscriptionPlans();
      setPlans(fetchedPlans);
      setLoading(false);
  }

  useEffect(() => {
    fetchPlans();
    
    // Fetch users with Pro or Premium plans
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("plan", "in", ["Pro", "Premium"]));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const merchants = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SubscribedMerchant));
        setSubscribedMerchants(merchants);
    }, (error) => {
        console.error("Error fetching subscribed merchants:", error);
    });

    return () => unsubscribe();
  }, []);


  const handleCreatePlan = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      const formData = new FormData(e.currentTarget);
      const newPlan: Plan = {
          name: formData.get('plan-name-create') as string,
          price: formData.get('plan-price-create') as string,
          transactions: formData.get('plan-txns-create') as string,
          features: formData.get('plan-features-create') as string,
          api_quota: formData.get('plan-api-quota-create') as string,
      };
      
      const result = await createSubscriptionPlan(newPlan);
      if (result.success) {
          await fetchPlans();
          toast({ title: 'Plan Created!', description: `${newPlan.name} has been added.`});
          setIsCreateOpen(false);
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
      setIsSubmitting(false);
  }

  const handleSavePlan = async (updatedPlan: Plan) => {
      const result = await updateSubscriptionPlan(updatedPlan);
       if (result.success) {
          await fetchPlans();
          toast({ title: 'Plan Updated!', description: `${updatedPlan.name} has been saved.`});
      } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
  }

  const handleDeletePlan = async (planId?: string) => {
    if (!planId) return;
    const result = await deleteSubscriptionPlan(planId);
    if (result.success) {
        await fetchPlans();
        toast({ variant: 'destructive', title: 'Plan Deleted!'});
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
  }

  const handleRowClick = (merchantId: string) => {
    router.push(`/dashboard/users/${merchantId}`);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Subscription Plans</h1>
        <p className="text-muted-foreground">Create, edit, or delete subscription tiers for your merchants.</p>
      </div>
      <Separator />

      <Tabs defaultValue="plans" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="plans" className="gap-2">
                <FileText className="h-4 w-4" />
                All Plans
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-2">
                <Users className="h-4 w-4" />
                Subscribed Merchants
            </TabsTrigger>
        </TabsList>
        <TabsContent value="plans" className="pt-4">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>All Plans</CardTitle>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                      <DialogTrigger asChild>
                        <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Plan</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Subscription Plan</DialogTitle>
                          <DialogDescription>
                            Define the details for a new subscription tier.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreatePlan}>
                            <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="plan-name-create" className="text-right">Name</Label>
                                <Input id="plan-name-create" name="plan-name-create" placeholder="e.g., Enterprise" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="plan-price-create" className="text-right">Price</Label>
                                <Input id="plan-price-create" name="plan-price-create" placeholder="$199/mo" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="plan-txns-create" className="text-right">Transactions</Label>
                                <Input id="plan-txns-create" name="plan-txns-create" placeholder="10,000/mo" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="plan-features-create" className="text-right">Features</Label>
                                <Input id="plan-features-create" name="plan-features-create" placeholder="Comma-separated features" className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="plan-api-quota-create" className="text-right">API Quota</Label>
                                <Input id="plan-api-quota-create" name="plan-api-quota-create" placeholder="e.g., 50,000 calls/mo" className="col-span-3" />
                            </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                     {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Plan
                                </Button>
                            </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Plan Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Transaction Limit</TableHead>
                                <TableHead>Features</TableHead>
                                <TableHead>API Quota</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                </TableRow>
                                ))
                            ) : plans.map(plan => (
                                <TableRow key={plan.id}>
                                    <TableCell className="font-medium"><Badge variant={plan.name === 'Pro' || plan.name === 'Premium' ? 'default' : 'secondary'}>{plan.name}</Badge></TableCell>
                                    <TableCell>{plan.price}</TableCell>
                                    <TableCell>{plan.transactions}</TableCell>
                                    <TableCell>{plan.features}</TableCell>
                                    <TableCell>{plan.api_quota}</TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <EditPlanDialog plan={plan} onSave={handleSavePlan} />
                                        <AlertDialog>
                                          <AlertDialogTrigger asChild>
                                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                                          </AlertDialogTrigger>
                                          <AlertDialogContent>
                                            <AlertDialogHeader>
                                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                              <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the <strong>{plan.name}</strong> plan and may affect users currently subscribed to it.
                                              </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                              <AlertDialogAction onClick={() => handleDeletePlan(plan.id)}>Delete Plan</AlertDialogAction>
                                            </AlertDialogFooter>
                                          </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                     {!loading && plans.length === 0 && (
                        <p className="text-center p-8 text-muted-foreground">No subscription plans found. Create one to get started.</p>
                     )}
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="merchants" className="pt-4">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users /> Subscribed Merchants
                    </CardTitle>
                    <CardDescription>
                        A list of merchants and their current subscription plans.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Merchant</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Subscribed On</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                                    <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                                </TableRow>
                                ))
                            ) : subscribedMerchants.length > 0 ? (
                                subscribedMerchants.map(merchant => (
                                    <TableRow key={merchant.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleRowClick(merchant.id)}>
                                        <TableCell>
                                            <div className="font-medium">{merchant.fullName}</div>
                                            <div className="text-sm text-muted-foreground">{merchant.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={merchant.plan === 'Pro' || merchant.plan === 'Premium' ? 'default' : 'secondary'}>
                                                {merchant.plan}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={merchant.status === 'Active' ? 'default' : 'outline'}>
                                                {merchant.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{merchant.createdAt?.toDate().toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={(e) => {e.stopPropagation(); handleRowClick(merchant.id)}}>View Profile</Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">No subscribed merchants found.</TableCell>
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

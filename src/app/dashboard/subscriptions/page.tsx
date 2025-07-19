
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, PlusCircle, Trash2 } from "lucide-react";
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

const subscriptionPlans = [
    { name: "Free", price: "$0/mo", transactions: "100/mo", features: "Basic UPI", api_quota: "1000 calls/mo" },
    { name: "Pro", price: "$49/mo", transactions: "1000/mo", features: "UPI & Crypto", api_quota: "10,000 calls/mo" },
    { name: "Premium", price: "$99/mo", transactions: "Unlimited", features: "White-Label", api_quota: "Unlimited" },
];

export default function SubscriptionsPage() {
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Subscription Plans</h1>
        <p className="text-muted-foreground">Create, edit, or delete subscription tiers for your merchants.</p>
      </div>
      <Separator />

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
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan-name-create" className="text-right">Name</Label>
                    <Input id="plan-name-create" placeholder="e.g., Enterprise" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan-price-create" className="text-right">Price</Label>
                    <Input id="plan-price-create" placeholder="$199/mo" className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan-txns-create" className="text-right">Transactions</Label>
                    <Input id="plan-txns-create" placeholder="10,000/mo" className="col-span-3" />
                  </div>
                   <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="plan-features-create" className="text-right">Features</Label>
                    <Input id="plan-features-create" placeholder="Comma-separated features" className="col-span-3" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                  <Button type="submit" onClick={() => setIsCreateOpen(false)}>Create Plan</Button>
                </DialogFooter>
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
                    {subscriptionPlans.map(plan => (
                        <TableRow key={plan.name}>
                            <TableCell className="font-medium"><Badge variant={plan.name === 'Pro' ? 'default' : plan.name === 'Premium' ? 'default' : 'secondary'}>{plan.name}</Badge></TableCell>
                            <TableCell>{plan.price}</TableCell>
                            <TableCell>{plan.transactions}</TableCell>
                            <TableCell>{plan.features}</TableCell>
                            <TableCell>{plan.api_quota}</TableCell>
                            <TableCell className="text-right space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                      <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit {plan.name} Plan</DialogTitle>
                                    </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="plan-name" className="text-right">Name</Label>
                                          <Input id="plan-name" defaultValue={plan.name} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="plan-price" className="text-right">Price</Label>
                                          <Input id="plan-price" defaultValue={plan.price} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="plan-txns" className="text-right">Transactions</Label>
                                          <Input id="plan-txns" defaultValue={plan.transactions} className="col-span-3" />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label htmlFor="plan-features" className="text-right">Features</Label>
                                          <Input id="plan-features" defaultValue={plan.features} className="col-span-3" />
                                        </div>
                                      </div>
                                    <DialogFooter>
                                      <Button variant="outline">Cancel</Button>
                                      <Button type="submit">Save Changes</Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

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
                                      <AlertDialogAction>Delete Plan</AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
    </div>
  );
}

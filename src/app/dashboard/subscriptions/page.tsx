import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Edit, PlusCircle, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

const subscriptionPlans = [
    { name: "Free", price: "$0/mo", transactions: "100/mo", features: "Basic UPI", api_quota: "1000 calls/mo" },
    { name: "Pro", price: "$49/mo", transactions: "1000/mo", features: "UPI & Crypto", api_quota: "10,000 calls/mo" },
    { name: "Premium", price: "$99/mo", transactions: "Unlimited", features: "White-Label", api_quota: "Unlimited" },
];

export default function SubscriptionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage your subscription plan and view features.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Your Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6 items-start">
            <div className="space-y-4">
                <div className="p-6 rounded-lg border bg-card-foreground/5">
                    <h3 className="text-2xl font-bold text-primary">Pro Plan</h3>
                    <p className="text-muted-foreground">Your plan renews on November 25, 2024.</p>
                </div>
                <Card>
                    <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between"><span className="text-muted-foreground">Transactions:</span> <strong>542 / 1000</strong></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">API Calls:</span> <strong>3,120 / 10,000</strong></div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-4">
                <h4 className="font-semibold">Features included in your plan:</h4>
                <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Up to 1000 transactions/month</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> UPI & Crypto Support</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> API & SDK Access</li>
                    <li className="flex items-center"><CheckCircle className="h-4 w-4 mr-2 text-green-500" /> Priority Email Support</li>
                </ul>
                <Button asChild><Link href="/pricing">Upgrade to Premium</Link></Button>
            </div>
        </CardContent>
      </Card>
      
      {/* This section would be conditionally rendered for admins */}
      <div className="space-y-6">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Admin: Manage Subscription Plans</h2>
            <p className="text-muted-foreground">Create, edit, or delete subscription tiers.</p>
        </div>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All Plans</CardTitle>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Create New Plan</Button>
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
                                <TableCell className="font-medium"><Badge variant={plan.name === 'Pro' ? 'default' : 'secondary'}>{plan.name}</Badge></TableCell>
                                <TableCell>{plan.price}</TableCell>
                                <TableCell>{plan.transactions}</TableCell>
                                <TableCell>{plan.features}</TableCell>
                                <TableCell>{plan.api_quota}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

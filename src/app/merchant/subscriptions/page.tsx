
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Repeat, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const subscriptionPlans = [
    {
        name: "Free",
        price: "$0",
        freq: "/month",
        description: "Perfect for getting started.",
        features: [
            "Up to 100 transactions/month",
            "Basic UPI Gateway Support",
            "Standard Fraud Detection",
            "Email Support",
        ],
        cta: "Your Current Plan",
        isCurrent: false,
    },
    {
        name: "Pro",
        price: "$49",
        freq: "/month",
        description: "For growing businesses.",
        features: [
            "Up to 1,000 transactions/month",
            "UPI & Crypto Support",
            "AI-Powered Fraud Detection",
            "Developer API & SDK Access",
            "Priority Email Support",
        ],
        cta: "Upgrade to Pro",
        isCurrent: true, // This is the merchant's current plan
    },
    {
        name: "Premium",
        price: "$99",
        freq: "/month",
        description: "For established businesses.",
        features: [
            "Unlimited transactions",
            "White-Label & Reseller Mode",
            "Advanced Fraud Controls",
            "All Country-Specific Methods",
            "24/7 Dedicated Support",
        ],
        cta: "Upgrade to Premium",
        isCurrent: false,
    },
];

const CurrentPlanDetails = () => (
    <Card>
        <CardHeader>
            <CardTitle>Your Current Subscription</CardTitle>
            <CardDescription>Details about your active plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                    <h3 className="text-xl font-bold">Pro Plan</h3>
                    <Badge variant="default" className="mt-1">Active</Badge>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold">$49<span className="text-base font-normal text-muted-foreground">/month</span></p>
                </div>
            </div>
            <div className="text-sm space-y-2">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Plan purchased on:</span>
                    <span className="font-medium">October 15, 2023</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Next renewal on:</span>
                    <span className="font-medium">November 15, 2023</span>
                </div>
                 <div className="flex justify-between">
                    <span className="text-muted-foreground">Transactions this month:</span>
                    <span className="font-medium">542 / 1,000</span>
                </div>
            </div>
             <Separator />
            <div className="flex gap-2">
                 <Button variant="outline">Cancel Subscription</Button>
            </div>
        </CardContent>
    </Card>
);


export default function SubscriptionPage() {
    const { toast } = useToast();

    const handleUpgrade = (planName: string) => {
        toast({
            title: "Upgrade Successful!",
            description: `You have successfully upgraded to the ${planName} plan.`,
        });
    };

    const currentPlan = subscriptionPlans.find(p => p.isCurrent) || subscriptionPlans[0];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Repeat /> My Subscription</h1>
                <p className="text-muted-foreground">Manage your subscription plan and view usage details.</p>
            </div>
            <Separator />
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <CurrentPlanDetails />
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upgrade Your Plan</CardTitle>
                            <CardDescription>Choose a plan that fits your business needs.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subscriptionPlans.filter(p => p.name !== currentPlan.name).map((plan) => (
                                <Card key={plan.name} className="flex flex-col">
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                        <div className="text-center my-4">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            <span className="text-muted-foreground">{plan.freq}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <ul className="space-y-3">
                                            {plan.features.map((feature) => (
                                                <li key={feature} className="flex items-start">
                                                    <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                                    <span className="text-sm text-muted-foreground">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                    <div className="p-6 pt-0">
                                         <Button className="w-full" onClick={() => handleUpgrade(plan.name)}>
                                            <Star className="mr-2 h-4 w-4"/> {plan.cta}
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

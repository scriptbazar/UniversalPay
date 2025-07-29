
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check, Repeat, Star } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { auth, db, app } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Skeleton } from '@/components/ui/skeleton';
import { getFunctions, httpsCallable } from 'firebase/functions';

type Plan = {
    name: string;
    price: string;
    freq: string;
    description: string;
    features: string[];
    cta: string;
};

const subscriptionPlans: Plan[] = [
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
    },
];

type CurrentPlanState = {
    name: string;
    price: string;
    freq: string;
    status: 'Active' | 'Cancelled';
    purchasedOn: string;
    renewsOn: string;
    transactionUsage: string;
};

const CurrentPlanDetails = ({ plan, loading }: { plan: CurrentPlanState; loading: boolean }) => {
    if (loading) {
        return (
             <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Separator />
                    <Skeleton className="h-10 w-32" />
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Current Subscription</CardTitle>
                <CardDescription>Details about your active plan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                    <div>
                        <h3 className="text-xl font-bold">{plan.name} Plan</h3>
                        <Badge variant={plan.status === 'Active' ? 'default' : 'destructive'} className="mt-1">{plan.status}</Badge>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{plan.price}<span className="text-base font-normal text-muted-foreground">{plan.freq}</span></p>
                    </div>
                </div>
                <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Plan purchased on:</span>
                        <span className="font-medium">{plan.purchasedOn}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Next renewal on:</span>
                        <span className="font-medium">{plan.renewsOn}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Transactions this month:</span>
                        <span className="font-medium">{plan.transactionUsage}</span>
                    </div>
                </div>
                <Separator />
                <div className="flex gap-2">
                    <Button variant="outline">Cancel Subscription</Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SubscriptionPage() {
    const { toast } = useToast();
    const [currentPlanName, setCurrentPlanName] = useState('Free'); // Default to Free
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists() && userDoc.data().plan) {
                    setCurrentPlanName(userDoc.data().plan);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleUpgrade = async (planName: string) => {
        const user = auth.currentUser;
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to upgrade.' });
            return;
        }

        setLoading(true);
        try {
            const functions = getFunctions(app);
            const upgradeSubscriptionPlan = httpsCallable(functions, 'upgradeSubscriptionPlan');
            const result = await upgradeSubscriptionPlan({ planName });

            if ((result.data as any).success) {
                 setCurrentPlanName(planName);
                 toast({
                    title: "Upgrade Successful!",
                    description: `You have successfully upgraded to the ${planName} plan.`,
                });
            } else {
                 throw new Error((result.data as any).error || 'An unknown error occurred.');
            }
        } catch (error: any) {
            console.error("Error upgrading plan: ", error);
            toast({ variant: 'destructive', title: 'Upgrade Failed', description: error.message || 'Could not update your subscription.' });
        } finally {
            setLoading(false);
        }
    };
    
    // Find the full details of the current plan
    const currentPlanDetails = subscriptionPlans.find(p => p.name === currentPlanName) || subscriptionPlans[0];
    
    // Placeholder data for the current plan details card, now using the correct plan details
    const planDetailsCardData: CurrentPlanState = {
        name: currentPlanDetails.name,
        price: currentPlanDetails.price,
        freq: currentPlanDetails.freq,
        status: 'Active',
        purchasedOn: 'October 15, 2023', // This can be fetched from user data in a real app
        renewsOn: 'November 15, 2023', // This can be calculated in a real app
        transactionUsage: '542 / 1,000', // This would come from usage stats
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Repeat /> My Subscription</h1>
                <p className="text-muted-foreground">Manage your subscription plan and view usage details.</p>
            </div>
            <Separator />
            
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <CurrentPlanDetails plan={planDetailsCardData} loading={loading} />
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upgrade Your Plan</CardTitle>
                            <CardDescription>Choose a plan that fits your business needs.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {subscriptionPlans.map((plan) => {
                                const isCurrent = plan.name === currentPlanName;
                                return (
                                    <Card key={plan.name} className={`flex flex-col ${isCurrent ? 'border-primary' : ''}`}>
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
                                            <Button className="w-full" onClick={() => handleUpgrade(plan.name)} disabled={isCurrent || loading}>
                                                {loading && !isCurrent ? 'Processing...' : isCurrent ? 'Your Current Plan' : <><Star className="mr-2 h-4 w-4"/> {plan.cta}</>}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

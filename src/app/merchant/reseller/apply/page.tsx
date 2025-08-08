
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, DollarSign, Percent, Users, ShieldCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { createResellerRequest } from "@/lib/resellerData";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";

export default function ApplyForResellerPage() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isRequested, setIsRequested] = useState(false);
    const [user, setUser] = useState<{ uid: string; fullName: string; email: string } | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if(currentUser) {
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                     setUser({
                        uid: currentUser.uid,
                        fullName: userDoc.data().fullName,
                        email: userDoc.data().email,
                     });
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const handleRequest = async () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in.' });
            return;
        }
        setIsLoading(true);
        try {
            await createResellerRequest(user.uid, user.fullName, user.email);
            toast({ title: 'Request Submitted!', description: 'Your request to join the reseller program has been sent for approval.' });
            setIsRequested(true);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Join the Reseller Program</h1>
                <p className="text-muted-foreground">Start your own payment gateway business powered by UniversalPay.</p>
            </div>
            <Separator />
            <Card>
                <CardHeader>
                    <CardTitle>Unlock Your Earning Potential</CardTitle>
                    <CardDescription>
                        Our reseller program is designed for entrepreneurs who want to offer payment solutions to their clients without the hassle of building from scratch.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-6 text-center">
                        <div className="space-y-2">
                            <Percent className="mx-auto h-10 w-10 text-primary" />
                            <h3 className="font-semibold">Earn Competitive Commissions</h3>
                            <p className="text-sm text-muted-foreground">Earn a percentage of every transaction processed by your sub-merchants.</p>
                        </div>
                        <div className="space-y-2">
                            <Users className="mx-auto h-10 w-10 text-primary" />
                            <h3 className="font-semibold">Onboard Unlimited Merchants</h3>
                            <p className="text-sm text-muted-foreground">There's no limit to how many clients you can bring onto your platform.</p>
                        </div>
                        <div className="space-y-2">
                            <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
                            <h3 className="font-semibold">Full White-Label Solution</h3>
                            <p className="text-sm text-muted-foreground">Use your own branding and domain to provide a seamless experience.</p>
                        </div>
                    </div>
                    <Separator />
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Program Highlights:</h3>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">Get a dedicated dashboard to manage your merchants.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">Set custom commission rates for each sub-merchant.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">Track sales and earnings in real-time.</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-500" />
                                <span className="text-muted-foreground">Reliable infrastructure and security handled by us.</span>
                            </li>
                        </ul>
                    </div>
                     <div className="pt-4">
                        {isRequested ? (
                             <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 p-6 text-center">
                                <CardTitle className="flex items-center justify-center gap-2 text-green-700 dark:text-green-400">
                                    <Check className="h-6 w-6"/>
                                    Request Submitted
                                </CardTitle>
                                <CardDescription className="text-green-600 dark:text-green-500 mt-2">
                                    Our team will review your request within 24-48 hours. You will be notified upon approval.
                                </CardDescription>
                            </Card>
                        ) : (
                             <Button size="lg" className="w-full" onClick={handleRequest} disabled={isLoading}>
                                {isLoading ? "Submitting..." : "Request to Join Program"}
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/countries";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recaptchaToken) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Please complete the reCAPTCHA challenge.",
      });
      return;
    }
    // Handle signup logic here
    // On successful signup, redirect to the merchant dashboard
    toast({
      title: "Account Created",
      description: "Welcome to TransactWave! Redirecting you to your dashboard.",
    });
    router.push('/merchant/dashboard');
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join TransactWave and start accepting payments today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" type="text" placeholder="John Doe" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" type="text" placeholder="johndoe" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="merchant@example.com" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" type="tel" placeholder="+91 98765 43210" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select required>
                    <SelectTrigger id="country">
                        <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                    <SelectContent>
                        {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code.toLowerCase()}>
                                {country.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" required />
            </div>
             <div className="flex justify-center">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY"}
                    onChange={(token) => setRecaptchaToken(token)}
                />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit">Create Account</Button>
             <p className="text-xs text-center text-muted-foreground px-4">
              By creating an account, you agree to our{' '}
              <Link href="#" className="underline hover:text-primary">Terms of Service</Link> and{' '}
              <Link href="#" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

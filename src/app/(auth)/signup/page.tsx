
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

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>Google</title>
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.84-4.24 1.84-5.18 0-9.4-4.22-9.4-9.4s4.22-9.4 9.4-9.4c2.6 0 4.52.98 5.96 2.32l2.44-2.44C19.42 1.62 16.2.5 12.48.5 5.82.5.5 5.82.5 12.5s5.32 12 11.98 12c3.24 0 5.96-1.08 7.94-3.02 2.06-2.06 2.62-5.12 2.62-8.32 0-.66-.06-1.3-.18-1.92h-10.8z"/>
    </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
        <title>GitHub</title>
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
    </svg>
);


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
      <Card className="w-full max-w-3xl shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Logo />
          </div>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join TransactWave and start accepting payments today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>
             <div className="flex justify-center pt-4">
                <ReCAPTCHA
                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY"}
                    onChange={(token) => setRecaptchaToken(token)}
                />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit">Create Account</Button>
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
                <Button variant="outline"><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
                <Button variant="outline"><GitHubIcon className="mr-2 h-4 w-4" /> GitHub</Button>
            </div>
             <p className="text-xs text-center text-muted-foreground px-4 pt-4">
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

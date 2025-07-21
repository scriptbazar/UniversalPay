
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
import { signInUser } from "@/lib/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Info } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);

  const isAdmin2faEnabled = process.env.NEXT_PUBLIC_ENABLE_ADMIN_2FA !== 'false';

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Pass 'admin' as loginType to enforce admin role check
      const { success, user, error } = await signInUser(email, password, 'admin');
      
      if (success && user) {
        if (isAdmin2faEnabled) {
            setShowOtp(true);
            toast({ title: "Verification Required", description: "Proceed to the next step." });
        } else {
            toast({ title: "Admin Login Successful", description: "Welcome back, Admin!" });
            router.push('/dashboard');
        }
      } else {
        toast({
          variant: "destructive",
          title: "Admin Login Failed",
          description: error || "Invalid credentials or not an admin account.",
        });
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Error",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleProceedToDashboard = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: "Admin Login Successful", description: "Welcome back, Admin!" });
    router.push('/dashboard');
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
      {!showOtp ? (
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleCredentialSubmit}>
            <CardContent className="space-y-4">
               <Alert>
                <ShieldCheck className="h-4 w-4" />
                <AlertTitle>Secure Access</AlertTitle>
                <AlertDescription>
                  This login page is for authorized administrators only.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Log In'}
              </Button>
               <p className="text-sm text-center text-muted-foreground mt-4">
                Not an admin?{' '}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                    Go to Merchant Login
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Logo />
            </div>
            <CardTitle className="text-2xl">Two-Step Verification</CardTitle>
            <CardDescription>This is a placeholder for a real 2FA implementation.</CardDescription>
          </CardHeader>
          <form onSubmit={handleProceedToDashboard}>
            <CardContent>
                <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Feature Not Implemented</AlertTitle>
                    <AlertDescription>
                        A real-world app would integrate an authenticator app or SMS-based OTP. For now, you can proceed to the dashboard.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button className="w-full" type="submit">Continue to Dashboard</Button>
              <Button variant="link" onClick={() => setShowOtp(false)}>Back to Login</Button>
            </CardFooter>
          </form>
        </Card>
      )}
    </div>
  );
}

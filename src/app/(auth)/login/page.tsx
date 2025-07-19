
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
import { Checkbox } from "@/components/ui/checkbox";

type LoginStep = 'credentials' | 'otp';
type UserType = 'admin' | 'merchant' | null;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [step, setStep] = useState<LoginStep>('credentials');
  const [userType, setUserType] = useState<UserType>(null);


  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isVerified) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Please verify that you are not a robot.",
      });
      return;
    }

    if (email === 'admin@transactwave.com' && password === 'admin123') {
      setUserType('admin');
      setStep('otp');
    } 
    else if (email.includes('@') && password) {
       setUserType('merchant');
       setStep('otp');
    }
    else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate OTP validation. In a real app, you'd call a server to verify.
    // For now, any 6-digit OTP is considered valid.
    if (otp.length === 6 && /^\d+$/.test(otp)) {
        if (userType === 'admin') {
            toast({
                title: "Admin Login Successful",
                description: "Welcome back, Admin!",
            });
            router.push('/dashboard');
        } else if (userType === 'merchant') {
            toast({
                title: "Login Successful",
                description: "Welcome back to your Merchant Dashboard!",
            });
            router.push('/merchant/dashboard');
        }
    } else {
        toast({
            variant: "destructive",
            title: "Invalid OTP",
            description: "Please enter a valid 6-digit OTP.",
        });
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
        {step === 'credentials' && (
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                <div className="flex justify-center mb-4">
                    <Logo />
                </div>
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleCredentialSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                        id="email" 
                        type="email" 
                        placeholder="admin@transactwave.com or merchant@example.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    </div>
                    <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="#" className="text-sm text-primary hover:underline">
                        Forgot password?
                        </Link>
                    </div>
                    <Input 
                        id="password" 
                        type="password" 
                        required 
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-md bg-muted/50">
                    <Checkbox id="captcha" onCheckedChange={(checked) => setIsVerified(checked as boolean)} />
                    <Label htmlFor="captcha" className="font-normal text-sm">I'm not a robot</Label>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit">Log In</Button>
                    <p className="text-sm text-center text-muted-foreground">
                    Don't have an account?{' '}
                    <Link href="/signup" className="font-semibold text-primary hover:underline">
                        Sign up
                    </Link>
                    </p>
                </CardFooter>
                </form>
            </Card>
        )}

        {step === 'otp' && (
             <Card className="w-full max-w-md shadow-xl">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl">Two-Step Verification</CardTitle>
                    <CardDescription>Enter the 6-digit code from your authenticator app.</CardDescription>
                </CardHeader>
                <form onSubmit={handleOtpSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp">One-Time Password</Label>
                            <Input 
                                id="otp" 
                                type="text"
                                maxLength={6}
                                placeholder="_ _ _ _ _ _" 
                                required 
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                className="text-center tracking-[0.5em]"
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex-col gap-4">
                        <Button className="w-full" type="submit">Verify</Button>
                        <Button variant="link" onClick={() => setStep('credentials')}>Back to Login</Button>
                    </CardFooter>
                </form>
            </Card>
        )}
    </div>
  );
}

    

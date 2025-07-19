
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
import { signInUser } from "@/lib/auth";

type LoginStep = 'credentials' | 'otp';

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


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [step, setStep] = useState<LoginStep>('credentials');
  const [user, setUser] = useState<any>(null); // To store user data after credential check
  const [isLoading, setIsLoading] = useState(false);


  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!recaptchaToken) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Please complete the reCAPTCHA challenge.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const { success, user, error } = await signInUser(email, password);
      
      if (success && user) {
        setUser(user);
        // Simulate OTP for now
        // In a real app, you might trigger an OTP service here
        if (user.role === 'admin') {
            toast({ title: "Admin Login Successful", description: "Welcome back, Admin!" });
            router.push('/dashboard');
        } else {
            toast({ title: "Login Successful", description: "Welcome back to your Merchant Dashboard!" });
            router.push('/merchant/dashboard');
        }
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || "Invalid credentials. Please try again.",
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

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This part is now mostly handled after successful login
    // Can be repurposed for actual 2FA
    if (otp.length === 6 && /^\d+$/.test(otp)) {
        if (user?.role === 'admin') {
            toast({ title: "Admin Login Successful", description: "Welcome back, Admin!" });
            router.push('/dashboard');
        } else {
            toast({ title: "Login Successful", description: "Welcome back to your Merchant Dashboard!" });
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

  const handleSocialLogin = () => {
    toast({
      title: "Feature not available",
      description: "Social login is not yet implemented.",
    });
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
                        placeholder="m@example.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
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
                        disabled={isLoading}
                    />
                    </div>
                    <div className="flex justify-center">
                       <ReCAPTCHA
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "YOUR_SITE_KEY"}
                            onChange={(token) => setRecaptchaToken(token)}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </Button>
                    <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 w-full">
                        <Button variant="outline" onClick={handleSocialLogin} disabled={isLoading}><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
                        <Button variant="outline" onClick={handleSocialLogin} disabled={isLoading}><GitHubIcon className="mr-2 h-4 w-4" /> GitHub</Button>
                    </div>
                    <p className="text-sm text-center text-muted-foreground mt-4">
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

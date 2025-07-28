
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
import { createUser, signInWithSocial } from "@/lib/auth";
import { GoogleIcon, GitHubIcon, FacebookIcon } from "@/components/icons";
import { Eye, EyeOff } from "lucide-react";


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      mobile: '',
      password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: value}));
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const { success, error } = await createUser(formData.email, formData.password, {
            fullName: formData.fullName,
            mobile: formData.mobile,
        });

        if (success) {
            toast({
                title: "Account Created",
                description: "Welcome to UniversalPay! Redirecting you to your dashboard.",
            });
            router.push('/merchant/dashboard');
        } else {
            toast({
                variant: "destructive",
                title: "Signup Failed",
                description: error,
            });
        }
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Signup Error",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleSocialSignup = async (provider: 'google' | 'github' | 'facebook') => {
    setIsLoading(true);
    try {
        const { success, user, error } = await signInWithSocial(provider);
        if (success && user) {
            toast({ title: "Account Created", description: `Welcome to UniversalPay, ${user.fullName}!` });
            router.push('/merchant/dashboard');
        } else {
            toast({
                variant: "destructive",
                title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Signup Failed`,
                description: error,
            });
        }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Signup Error",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <Link href="/" className="flex justify-center mb-4">
            <Logo />
          </Link>
          <CardTitle className="text-2xl">Create a Merchant Account</CardTitle>
          <CardDescription>Join UniversalPay and start accepting payments today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSignup}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input id="fullName" type="text" placeholder="John Doe" required value={formData.fullName} onChange={handleInputChange} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="merchant@example.com" required value={formData.email} onChange={handleInputChange} disabled={isLoading} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input id="mobile" type="tel" placeholder="+91 98765 43210" required value={formData.mobile} onChange={handleInputChange} disabled={isLoading} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'}
                            required 
                            value={formData.password} 
                            onChange={handleInputChange} 
                            disabled={isLoading}
                            className="pr-10"
                        />
                         <Button 
                            type="button"
                            variant="ghost" 
                            size="icon" 
                            className="absolute inset-y-0 right-0 h-full px-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={isLoading}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
            <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 w-full">
                <Button variant="outline" className="flex-grow" onClick={() => handleSocialSignup('google')} type="button" disabled={isLoading}><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
                <Button variant="outline" className="flex-grow" onClick={() => handleSocialSignup('github')} type="button" disabled={isLoading}><GitHubIcon className="mr-2 h-4 w-4" /> GitHub</Button>
                <Button variant="outline" className="flex-grow" onClick={() => handleSocialSignup('facebook')} type="button" disabled={isLoading}><FacebookIcon className="mr-2 h-4 w-4" /> Facebook</Button>
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

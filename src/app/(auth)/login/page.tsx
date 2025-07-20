
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
import { signInUser, signInWithSocial } from "@/lib/auth";

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

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Facebook</title>
      <path d="M22.675 0h-21.35C.59 0 0 .59 0 1.325v21.35C0 23.41.59 24 1.325 24H12.82v-9.29H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h5.713c.734 0 1.325-.59 1.325-1.325V1.325C24 .59 23.41 0 22.675 0z"/>
    </svg>
);


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, user, error } = await signInUser(email, password, 'merchant');
      
      if (success && user) {
        toast({ title: "Login Successful", description: "Welcome back to your Merchant Dashboard!" });
        router.push('/merchant/dashboard');
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error || "Invalid credentials or not a merchant account.",
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

  const handleSocialLogin = async (provider: 'google' | 'github' | 'facebook') => {
    setIsLoading(true);
    try {
        const { success, user, error } = await signInWithSocial(provider);
        if (success && user) {
            toast({ title: "Login Successful", description: `Welcome back, ${user.fullName}!` });
            router.push('/merchant/dashboard');
        } else {
            toast({
                variant: "destructive",
                title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Login Failed`,
                description: error,
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


  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
            <CardTitle className="text-2xl">Merchant Login</CardTitle>
            <CardDescription>Enter your credentials to access your merchant dashboard</CardDescription>
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
                <div className="flex flex-wrap justify-center gap-2 w-full">
                    <Button variant="outline" className="flex-grow" onClick={() => handleSocialLogin('google')} disabled={isLoading}><GoogleIcon className="mr-2 h-4 w-4" /> Google</Button>
                    <Button variant="outline" className="flex-grow" onClick={() => handleSocialLogin('github')} disabled={isLoading}><GitHubIcon className="mr-2 h-4 w-4" /> GitHub</Button>
                    <Button variant="outline" className="flex-grow" onClick={() => handleSocialLogin('facebook')} disabled={isLoading}><FacebookIcon className="mr-2 h-4 w-4" /> Facebook</Button>
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
    </div>
  );
}


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
import { Eye, EyeOff, LogIn } from "lucide-react";


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Pass 'merchant' as loginType to enforce correct role check
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

  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
            <CardHeader className="space-y-1 text-center">
              <Link href="/" className="flex justify-center mb-4">
                <Logo />
              </Link>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <LogIn className="h-6 w-6" /> Merchant Login
            </CardTitle>
            <CardDescription>Enter your credentials to access your merchant dashboard</CardDescription>
            </CardHeader>
            <form onSubmit={handleCredentialSubmit}>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="password" 
                            type={showPassword ? 'text' : 'password'}
                            required 
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                 <div className="text-right">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot Password?
                    </Link>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Log In'}
                </Button>
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

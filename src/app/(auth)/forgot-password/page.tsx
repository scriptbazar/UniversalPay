'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { sendPasswordReset } from "@/lib/auth";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, error } = await sendPasswordReset(email);
      
      if (success) {
        setIsSent(true);
      } else {
        toast({
          variant: "destructive",
          title: "Error Sending Email",
          description: error || "Could not send password reset email. Please try again.",
        });
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Request Failed",
            description: error.message || "An unexpected error occurred.",
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-xl">
          {!isSent ? (
            <>
              <CardHeader className="space-y-1 text-center">
                <Link href="/" className="flex justify-center mb-4">
                    <Logo />
                </Link>
                <CardTitle className="text-2xl">Reset Your Password</CardTitle>
                <CardDescription>Enter your email and we'll send you a link to get back into your account.</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
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
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button variant="outline" asChild>
                        <Link href="/login">Back to Login</Link>
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </CardFooter>
              </form>
            </>
          ) : (
             <CardContent className="p-8 text-center">
                <Link href="/" className="flex justify-center mb-6">
                    <Logo />
                </Link>
                <Mail className="mx-auto h-16 w-16 text-primary mb-4" />
                <CardTitle className="text-2xl mb-2">Check your email</CardTitle>
                <CardDescription className="mb-6">
                    We've sent a password reset link to <span className="font-bold text-foreground">{email}</span>. Please check your inbox and spam folder.
                </CardDescription>
                <Button variant="outline" asChild>
                    <Link href="/login">Back to Login</Link>
                </Button>
            </CardContent>
          )}
        </Card>
    </div>
  );
}

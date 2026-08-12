
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { createUser } from "@/lib/auth";
import { Eye, EyeOff, UserPlus, CheckCircle2, XCircle } from "lucide-react";

// Password strength checker
function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const map: Record<number, { label: string; color: string }> = {
    1: { label: 'Very Weak', color: 'bg-red-500' },
    2: { label: 'Weak', color: 'bg-orange-500' },
    3: { label: 'Fair', color: 'bg-yellow-500' },
    4: { label: 'Strong', color: 'bg-blue-500' },
    5: { label: 'Very Strong', color: 'bg-green-500' },
  };
  return { score, ...map[score] };
}

const PasswordRule = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center gap-1.5 text-xs transition-colors ${met ? 'text-green-500' : 'text-muted-foreground'}`}>
    {met ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
    {text}
  </div>
);

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
      fullName: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setFormData(prev => ({...prev, [id]: value}));
  };

  const strength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);
  const passwordsMatch = formData.confirmPassword !== '' && formData.password === formData.confirmPassword;
  const passwordMismatch = formData.confirmPassword !== '' && formData.password !== formData.confirmPassword;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Passwords do not match', description: 'Please ensure both password fields are identical.' });
      return;
    }
    if (strength.score < 3) {
      toast({ variant: 'destructive', title: 'Password Too Weak', description: 'Please choose a stronger password (at least Fair strength).' });
      return;
    }
    setIsLoading(true);
    try {
        const { success, error } = await createUser(formData.email, formData.password, {
            fullName: formData.fullName,
            mobile: formData.mobile,
        });
        if (success) {
            toast({ title: "Account Created", description: "Welcome to UniversalPay! Redirecting you to your dashboard." });
            router.push('/merchant/dashboard');
        } else {
            toast({ variant: "destructive", title: "Signup Failed", description: error });
        }
    } catch (error: any) {
         toast({ variant: "destructive", title: "Signup Error", description: error.message || "An unexpected error occurred." });
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
              <UserPlus className="h-6 w-6" /> Create a Merchant Account
          </CardTitle>
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
            <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input id="mobile" type="tel" placeholder="+91 98765 43210" required value={formData.mobile} onChange={handleInputChange} disabled={isLoading} />
            </div>

            {/* Password Field */}
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
                        placeholder="Min. 8 characters"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                </div>

                {/* Password Strength Bar */}
                {formData.password && (
                  <div className="space-y-2 pt-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-muted'}`} />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${strength.score >= 4 ? 'text-green-500' : strength.score >= 3 ? 'text-yellow-500' : 'text-red-500'}`}>
                      {strength.label}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      <PasswordRule met={formData.password.length >= 8} text="8+ characters" />
                      <PasswordRule met={/[A-Z]/.test(formData.password)} text="Uppercase letter" />
                      <PasswordRule met={/[0-9]/.test(formData.password)} text="Number" />
                      <PasswordRule met={/[^A-Za-z0-9]/.test(formData.password)} text="Special character" />
                    </div>
                  </div>
                )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                    <Input
                        id="confirmPassword"
                        type={showConfirm ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        className={`pr-10 ${passwordMismatch ? 'border-red-500 focus-visible:ring-red-500' : passwordsMatch ? 'border-green-500 focus-visible:ring-green-500' : ''}`}
                        placeholder="Re-enter your password"
                    />
                    <Button type="button" variant="ghost" size="icon" className="absolute inset-y-0 right-0 h-full px-3" onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                </div>
                {passwordMismatch && <p className="text-xs text-red-500">Passwords do not match.</p>}
                {passwordsMatch && <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Passwords match!</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" type="submit" disabled={isLoading || passwordMismatch}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
             <p className="text-xs text-center text-muted-foreground px-4 pt-4">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and{' '}
              <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
            </p>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-primary hover:underline">Log In</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

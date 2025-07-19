'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { grantAdminRole } from './actions';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function MakeAdminPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const { toast } = useToast();
  const [user, setUser] = useState(auth.currentUser);

  onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
  });

  const handleGrantAdmin = async () => {
    if (!auth.currentUser) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to perform this action.',
        });
        return;
    }

    setIsLoading(true);
    setResult('');
    try {
      const response = await grantAdminRole();
      if (response.success) {
        toast({
          title: 'Success!',
          description: response.message,
        });
        setResult(`Success! ${response.message}. Please log out and log back in for the changes to take effect.`);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error,
        });
        setResult(`Error: ${response.error}`);
      }
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Unexpected Error',
        description: e.message,
      });
      setResult(`An unexpected error occurred: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Admin Role Utility</CardTitle>
          <CardDescription>
            This is a one-time setup page to grant administrative privileges to the designated admin account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted p-4 text-sm">
            <p>
              Logged in as: <strong className="font-mono">{user?.email || 'Not logged in'}</strong>
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Click the button below to assign the 'admin' role to your account. You only need to do this once. After clicking, you must log out and log back in.
          </p>
          <Button onClick={handleGrantAdmin} disabled={isLoading || !user} className="w-full">
            {isLoading ? 'Processing...' : 'Make Me Admin'}
          </Button>
          {result && (
            <div className="mt-4 rounded-md border p-4 text-center">
              <p>{result}</p>
            </div>
          )}
           <div className="pt-4 text-center">
             <Link href="/dashboard" className="text-sm text-primary hover:underline">
                Go to Dashboard
             </Link>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

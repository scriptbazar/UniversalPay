
'use client';

import { useState, useEffect } from 'react';
import { notFound, useParams } from 'next/navigation';
import { getPaymentLinkBySlug, type PaymentLink } from '@/lib/paymentLinksData';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { DollarSign, IndianRupee, CreditCard, Bitcoin, Globe } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.069 5.633H11.516C12.186 5.633 12.613 5.645 12.802 5.669C15.424 5.926 17.37 7.952 17.061 10.518C16.911 11.762 16.143 12.748 15.012 13.284C14.73 13.408 14.418 13.508 14.124 13.54C14.049 13.553 13.974 13.565 13.899 13.565C13.899 13.565 13.899 13.565 13.887 13.565H13.874C13.799 13.565 13.737 13.553 13.674 13.54C13.624 13.528 13.587 13.515 13.549 13.503C13.061 13.341 12.634 12.98 12.383 12.518L12.333 12.431L11.042 17.435C10.956 17.765 10.675 18 10.334 18H7.424C7.032 18 6.714 17.694 6.789 17.309L9.431 3.483C9.481 3.203 9.722 3 10.009 3H12.802C15.82 3 18.15 5.026 18.495 7.915C18.827 10.716 17.152 13.044 14.654 13.793C16.012 14.288 16.996 15.525 16.634 17.063C16.21 18.825 14.666 20.213 12.79 20.358C12.74 20.368 12.703 20.378 12.653 20.38C11.996 20.455 11.238 20.305 10.669 19.929L10.594 19.88L10.544 19.842C10.012 19.501 9.619 19.013 9.444 18.431L9.407 18.307L8.03 12.996L6.533 13.623C6.168 13.773 5.766 13.565 5.654 13.18L3.061 3.483C2.949 3.109 3.157 2.706 3.534 2.594L6.444 1.706C6.82 1.594 7.223 1.802 7.335 2.176L8.136 4.887C8.211 5.129 8.452 5.304 8.711 5.304H9.173L8.855 3.93C8.78 3.545 9.098 3.239 9.49 3.239H9.984C10.225 3.239 10.429 3.419 10.466 3.659L11.833 9.11L11.846 9.158C11.896 9.398 12.112 9.573 12.359 9.573H12.912C14.868 9.573 16.146 8.27 16.296 6.5C16.42 5.039 15.424 3.827 14.072 3.587C13.432 3.475 12.827 3.425 12.288 3.425H10.134L9.048 8.199L7.492 5.894C7.394 5.744 7.232 5.633 7.069 5.633Z"/>
    </svg>
);


export default function PayPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { toast } = useToast();

  const [link, setLink] = useState<PaymentLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState<number | string>('');

  useEffect(() => {
    const data = getPaymentLinkBySlug(slug);
    if (data) {
      setLink(data);
      if(data.type === 'Fixed' && data.amount) {
        setAmount(data.amount);
      }
    }
    setLoading(false);
  }, [slug]);

  const convenienceFee = 1.00;
  const totalAmount = (Number(amount) || 0) + convenienceFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
        title: "Payment Successful!",
        description: `Thank you for your payment of $${totalAmount.toFixed(2)}.`,
    })
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!link || !link.isActive) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">
            <Card className="w-full shadow-2xl">
                <form onSubmit={handleSubmit}>
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                                <Globe className="w-10 h-10 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <CardTitle className="text-xl">{link.title}</CardTitle>
                                {link.description && <CardDescription className="mt-1">{link.description}</CardDescription>}
                            </div>

                            <Separator />
                            
                            <div className="w-full space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" type="email" placeholder="you@example.com" required />
                                </div>
                                {link.collectPhone && (
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" />
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount (USD)</Label>
                                    <Input 
                                        id="amount" 
                                        type="number" 
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        readOnly={link.type === 'Fixed'}
                                        required 
                                        placeholder="Enter amount"
                                    />
                                </div>
                            </div>
                            
                            <div className="w-full space-y-2 text-sm border rounded-md p-3">
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Convenience Fee</span>
                                    <span>${convenienceFee.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-bold text-base pt-2">
                                    <span>Total</span>
                                    <span>${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="w-full">
                                <p className="text-xs text-muted-foreground mb-2">Select a payment method:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button type="button" variant="outline" className="w-full justify-start"><IndianRupee className="mr-2 h-4 w-4"/> Pay with UPI</Button>
                                    <Button type="button" variant="outline" className="w-full justify-start"><CreditCard className="mr-2 h-4 w-4"/> Pay with Card</Button>
                                    <Button type="button" variant="outline" className="w-full justify-start"><Bitcoin className="mr-2 h-4 w-4"/> Pay with Crypto</Button>
                                    <Button type="button" variant="outline" className="w-full justify-start"><PayPalIcon className="mr-2 h-4 w-4"/> Pay with PayPal</Button>
                                </div>
                            </div>

                            <Button 
                                type="submit"
                                className="w-full text-lg h-12" 
                                style={{ backgroundColor: link.brandColor, color: 'hsl(var(--primary-foreground))' }}
                                disabled={!amount || Number(amount) <= 0}
                            >
                                Pay ${totalAmount.toFixed(2)}
                            </Button>
                            <div className="text-center w-full">
                                <p className="text-xs text-muted-foreground">
                                    By proceeding, you agree to the <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
                                </p>
                                <div className="flex items-center justify-center pt-4 gap-2 text-sm text-muted-foreground">
                                    <Globe className="h-4 w-4 text-primary"/>
                                    <span>Powered by UniversalPay</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    </div>
  );
}


'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Globe, KeyRound, Wallet, Banknote, ShieldQuestion, Palette, FileText, IndianRupee, CreditCard, Bitcoin, LifeBuoy } from "lucide-react";
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateGeminiApiKey } from './actions';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";

type PaymentMethodsState = {
  paytm: boolean;
  phonepe: boolean;
  gpay: boolean;
  btc_wallet: boolean;
  usdt_wallet: boolean;
  usd_card: boolean;
  eur_sepa: boolean;
  gbp_bacs: boolean;
  aud_becs: boolean;
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 448 512" {...props}><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
);

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 13a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1a4 4 0 0 1 4-4h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1a4 4 0 1 0 0 8" />
    </svg>
);


const CheckoutPreview = ({ brandColor, logo, businessName }: { brandColor: string, logo: string | null, businessName: string }) => {
    return (
        <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 text-center">Checkout Preview</h3>
            <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                            {logo ? (
                                <Image src={logo} alt="Business Logo" width={80} height={80} className="object-cover" />
                            ) : (
                                <Globe className="w-10 h-10 text-muted-foreground" />
                            )}
                        </div>
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">Paying</p>
                            <h4 className="font-semibold text-lg">{businessName || 'Your Business Name'}</h4>
                        </div>

                        <Separator />

                        <div className="w-full space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Item Price</span>
                                <span>₹999.00</span>
                            </div>
                             <div className="flex justify-between text-muted-foreground">
                                <span>Convenience Fee</span>
                                <span>₹10.00</span>
                            </div>
                            <div className="flex justify-between font-bold text-base pt-2">
                                <span>Total</span>
                                <span>₹1,009.00</span>
                            </div>
                        </div>

                        <div className="w-full">
                            <p className="text-xs text-muted-foreground mb-2">Select a payment method:</p>
                             <div className="flex flex-col space-y-2">
                                <Button variant="outline" className="w-full justify-start"><IndianRupee className="mr-2 h-4 w-4"/> Pay with UPI</Button>
                                <Button variant="outline" className="w-full justify-start"><CreditCard className="mr-2 h-4 w-4"/> Pay with Card</Button>
                                <Button variant="outline" className="w-full justify-start"><Bitcoin className="mr-2 h-4 w-4"/> Pay with Crypto</Button>
                                <Button variant="outline" className="w-full justify-start"><PayPalIcon className="mr-2 h-4 w-4"/> Pay with PayPal</Button>
                            </div>
                        </div>

                        <Button 
                            className="w-full text-lg h-12" 
                            style={{ backgroundColor: brandColor, color: 'hsl(var(--primary-foreground))' }}
                        >
                            Pay ₹1,009.00
                        </Button>

                         <p className="text-xs text-muted-foreground text-center pt-2">
                            By proceeding, you agree to the <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
                         </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};


export default function SettingsPage() {
  const { toast } = useToast();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  
  // Branding states
  const [businessName, setBusinessName] = useState('My Awesome Store');
  const [brandColor, setBrandColor] = useState('#29ABE2');
  const [logo, setLogo] = useState<string | null>(null);


  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsState>({
    paytm: true,
    phonepe: true,
    gpay: false,
    btc_wallet: true,
    usdt_wallet: true,
    usd_card: true,
    eur_sepa: false,
    gbp_bacs: false,
    aud_becs: false,
  });

  const handlePaymentMethodToggle = (method: keyof PaymentMethodsState) => {
    setPaymentMethods(prev => ({ ...prev, [method]: !prev[method] }));
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGeminiApiKey(geminiApiKey);
      toast({
        title: "Success",
        description: "Gemini API Key saved successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save API Key.",
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, notifications, and branding.</p>
      </div>
      <Separator />

      <Tabs defaultValue="profile">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your personal and business information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="merchant@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-name-profile">Business Name</Label>
                <Input 
                    id="business-name-profile" 
                    value={businessName} 
                    onChange={(e) => setBusinessName(e.target.value)} 
                />
              </div>
               <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                        <h4 className="font-medium">Email Notifications</h4>
                        <p className="text-sm text-muted-foreground">Receive alerts for payments, withdrawals, and updates.</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                        <h4 className="font-medium">SMS Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get critical alerts on your mobile phone.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                        <h4 className="font-medium">Telegram Notifications</h4>
                        <p className="text-sm text-muted-foreground">Connect your Telegram for real-time updates.</p>
                        </div>
                        <Switch />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                        <h4 className="font-medium flex items-center gap-2"><WhatsAppIcon className="w-4 h-4" /> WhatsApp Notifications</h4>
                        <p className="text-sm text-muted-foreground">Get important updates directly on WhatsApp.</p>
                        </div>
                        <Switch />
                    </div>
                </div>
               <Button className="mt-4">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="branding" className="pt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                     <Card>
                        <CardHeader>
                        <CardTitle>Branding &amp; Checkout Customization</CardTitle>
                        <CardDescription>Control what your customers see during checkout.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold flex items-center gap-2"><Palette className="w-5 h-5"/> Visuals</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Logo</Label>
                                        <div className="flex items-center gap-4">
                                            <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center border overflow-hidden">
                                            {logo ? (
                                                    <Image src={logo} alt="Business Logo" width={80} height={80} className="object-cover"/>
                                                ) : (
                                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <Input id="logo-upload" type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                                            <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>Upload Logo</Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Recommended: 256x256px.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="brand-color">Brand Color</Label>
                                        <div className="flex items-center gap-2">
                                            <Input 
                                                id="brand-color-hex" 
                                                value={brandColor}
                                                onChange={(e) => setBrandColor(e.target.value)}
                                                className="w-32"
                                            />
                                            <div className="relative">
                                                <input 
                                                    id="brand-color" 
                                                    type="color" 
                                                    value={brandColor}
                                                    onChange={(e) => setBrandColor(e.target.value)}
                                                    className="h-10 w-10 p-1 appearance-none bg-background border rounded-md cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground">Used for buttons and highlights.</p>
                                    </div>
                                </div>
                            </div>

                             <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold flex items-center gap-2"><FileText className="w-5 h-5"/> Legal &amp; Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="business-name-checkout">Business Name on Checkout</Label>
                                        <Input 
                                            id="business-name-checkout" 
                                            value={businessName} 
                                            onChange={(e) => setBusinessName(e.target.value)}
                                         />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="terms-url">Terms of Service URL</Label>
                                        <Input id="terms-url" placeholder="https://your-website.com/terms" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="privacy-url">Privacy Policy URL</Label>
                                        <Input id="privacy-url" placeholder="https://your-website.com/privacy" />
                                    </div>
                                     <div className="space-y-2">
                                        <Label htmlFor="support-url">Support URL</Label>
                                        <Input id="support-url" placeholder="https://your-website.com/support" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                <Label htmlFor="branding-switch" className="text-base font-semibold flex items-center gap-2">
                                    <ShieldQuestion className="w-5 h-5" />
                                    Hide My Identity &amp; Show 'TransactWave' Branding
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Turn ON to always show "TransactWave" as the merchant. Turn OFF to show your business name. Your personal name will never be shown.
                                </p>
                                </div>
                                <Switch id="branding-switch" defaultChecked />
                            </div>
                            <Button>Save Branding Changes</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <CheckoutPreview brandColor={brandColor} logo={logo} businessName={businessName} />
                </div>
            </div>
        </TabsContent>
        <TabsContent value="payment-methods" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment &amp; Settlement Configuration</CardTitle>
              <CardDescription>
                Configure how you accept payments and where you receive your funds.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                  <Wallet className="h-4 w-4" />
                  <AlertTitle>Unified Crypto Settlement</AlertTitle>
                  <AlertDescription>
                    All payments, whether from UPI or global methods, will be automatically converted and settled into your chosen cryptocurrency wallet.
                  </AlertDescription>
                </Alert>

                <div className="p-4 rounded-lg border bg-card-foreground/5 space-y-2">
                    <Label htmlFor="settlement-crypto" className="text-base font-semibold">1. Choose Your Settlement Cryptocurrency</Label>
                     <p className="text-sm text-muted-foreground">Select the primary crypto wallet where all your payments will be deposited.</p>
                    <Select defaultValue="usdt">
                        <SelectTrigger id="settlement-crypto" className="mt-2">
                            <SelectValue placeholder="Select crypto for settlement" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usdt">USDT (TRC20)</SelectItem>
                            <SelectItem value="btc">Bitcoin (BTC)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <h4 className="font-semibold mb-4 text-base">2. Configure Your Settlement Wallets</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="btc-switch" className="font-medium">Bitcoin (BTC) Wallet</Label>
                                <p className="text-sm text-muted-foreground">Enable to receive settlements in BTC.</p>
                            </div>
                            <Switch id="btc-switch" checked={paymentMethods.btc_wallet} onCheckedChange={() => handlePaymentMethodToggle('btc_wallet')} />
                        </div>
                        {paymentMethods.btc_wallet && (
                            <div className="space-y-2 pl-4 pb-2">
                                <Label htmlFor="btc-wallet">Your Bitcoin (BTC) Wallet Address</Label>
                                <Input id="btc-wallet" placeholder="bc1..."/>
                            </div>
                        )}

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="usdt-switch" className="font-medium">USDT (TRC20) Wallet</Label>
                                <p className="text-sm text-muted-foreground">Enable to receive settlements in Tether.</p>
                            </div>
                            <Switch id="usdt-switch" checked={paymentMethods.usdt_wallet} onCheckedChange={() => handlePaymentMethodToggle('usdt_wallet')} />
                        </div>
                        {paymentMethods.usdt_wallet && (
                            <div className="space-y-2 pl-4 pb-2">
                                <Label htmlFor="usdt-wallet">Your USDT (TRC20) Wallet Address</Label>
                                <Input id="usdt-wallet" placeholder="T..."/>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold mb-4 text-base">3. Enable Customer Payment Methods</h4>
                     <p className="text-sm text-muted-foreground mb-4">Select which payment options your customers will see.</p>
                    
                    <h5 className="font-semibold mb-2 mt-4">Indian UPI Gateways</h5>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div><Label htmlFor="paytm-switch" className="font-medium">Paytm</Label></div>
                            <Switch id="paytm-switch" checked={paymentMethods.paytm} onCheckedChange={() => handlePaymentMethodToggle('paytm')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div><Label htmlFor="phonepe-switch" className="font-medium">PhonePe</Label></div>
                            <Switch id="phonepe-switch" checked={paymentMethods.phonepe} onCheckedChange={() => handlePaymentMethodToggle('phonepe')} />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3">
                            <div><Label htmlFor="gpay-switch" className="font-medium">Google Pay</Label></div>
                            <Switch id="gpay-switch" checked={paymentMethods.gpay} onCheckedChange={() => handlePaymentMethodToggle('gpay')} />
                        </div>
                    </div>
                
                    <h5 className="font-semibold mb-2 mt-6 flex items-center gap-2"><Globe className="w-5 h-5" /> Global Payment Methods</h5>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="usd-card-switch" className="font-medium">Credit/Debit Card (USD)</Label>
                                <p className="text-xs text-muted-foreground">For customers in the USA &amp; North America.</p>
                            </div>
                            <Switch id="usd-card-switch" checked={paymentMethods.usd_card} onCheckedChange={() => handlePaymentMethodToggle('usd_card')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="eur-sepa-switch" className="font-medium">SEPA Bank Transfer (EUR)</Label>
                                <p className="text-xs text-muted-foreground">For customers in the European Union.</p>
                            </div>
                            <Switch id="eur-sepa-switch" checked={paymentMethods.eur_sepa} onCheckedChange={() => handlePaymentMethodToggle('eur_sepa')} />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="gbp-bacs-switch" className="font-medium">BACS Direct Debit (GBP)</Label>
                                <p className="text-xs text-muted-foreground">For customers in the United Kingdom.</p>
                            </div>
                            <Switch id="gbp-bacs-switch" checked={paymentMethods.gbp_bacs} onCheckedChange={() => handlePaymentMethodToggle('gbp_bacs')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="aud-becs-switch" className="font-medium">BECS Direct Debit (AUD)</Label>
                                <p className="text-xs text-muted-foreground">For customers in Australia.</p>
                            </div>
                            <Switch id="aud-becs-switch" checked={paymentMethods.aud_becs} onCheckedChange={() => handlePaymentMethodToggle('aud_becs')} />
                        </div>
                    </div>
                </div>
                 <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="integrations" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
              <CardDescription>Manage API keys for third-party services.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSaveApiKey} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gemini-api-key" className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" />
                    Google Gemini API Key
                  </Label>
                  <Input 
                    id="gemini-api-key" 
                    type="password" 
                    placeholder="Enter your Gemini API Key" 
                    value={geminiApiKey}
                    onChange={(e) => setGeminiApiKey(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    This key is required for AI-powered features like fraud detection.
                  </p>
                </div>
                <Button type="submit">Save API Key</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

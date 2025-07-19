
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, KeyRound, Upload, Mail, Banknote } from "lucide-react";
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { updateGeminiApiKey } from './actions';
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.069 5.633H11.516C12.186 5.633 12.613 5.645 12.802 5.669C15.424 5.926 17.37 7.952 17.061 10.518C16.911 11.762 16.143 12.748 15.012 13.284C14.73 13.408 14.418 13.508 14.124 13.54C14.049 13.553 13.974 13.565 13.899 13.565C13.899 13.565 13.899 13.565 13.887 13.565H13.874C13.799 13.565 13.737 13.553 13.674 13.54C13.624 13.528 13.587 13.515 13.549 13.503C13.061 13.341 12.634 12.98 12.383 12.518L12.333 12.431L11.042 17.435C10.956 17.765 10.675 18 10.334 18H7.424C7.032 18 6.714 17.694 6.789 17.309L9.431 3.483C9.481 3.203 9.722 3 10.009 3H12.802C15.82 3 18.15 5.026 18.495 7.915C18.827 10.716 17.152 13.044 14.654 13.793C16.012 14.288 16.996 15.525 16.634 17.063C16.21 18.825 14.666 20.213 12.79 20.358C12.74 20.368 12.703 20.378 12.653 20.38C11.996 20.455 11.238 20.305 10.669 19.929L10.594 19.88L10.544 19.842C10.012 19.501 9.619 19.013 9.444 18.431L9.407 18.307L8.03 12.996L6.533 13.623C6.168 13.773 5.766 13.565 5.654 13.18L3.061 3.483C2.949 3.109 3.157 2.706 3.534 2.594L6.444 1.706C6.82 1.594 7.223 1.802 7.335 2.176L8.136 4.887C8.211 5.129 8.452 5.304 8.711 5.304H9.173L8.855 3.93C8.78 3.545 9.098 3.239 9.49 3.239H9.984C10.225 3.239 10.429 3.419 10.466 3.659L11.833 9.11L11.846 9.158C11.896 9.398 12.112 9.573 12.359 9.573H12.912C14.868 9.573 16.146 8.27 16.296 6.5C16.42 5.039 15.424 3.827 14.072 3.587C13.432 3.475 12.827 3.425 12.288 3.425H10.134L9.048 8.199L7.492 5.894C7.394 5.744 7.232 5.633 7.069 5.633Z"/>
    </svg>
);


const IndianFlagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600" {...props}>
        <rect width="900" height="600" fill="#F93"/>
        <rect width="900" height="400" fill="#FFF"/>
        <rect width="900" height="200" fill="#128807"/>
        <circle r="90" cx="450" cy="300" fill="#008"/>
        <circle r="70" cx="450" cy="300" fill="#fff"/>
        <circle r="35" cx="450" cy="300" fill="#008"/>
        {Array.from({ length: 24 }).map((_, i) => (
            <line 
                key={i}
                x1="450" y1="300" 
                x2={450 + 70 * Math.cos(i * 15 * Math.PI / 180)} 
                y2={300 + 70 * Math.sin(i * 15 * Math.PI / 180)} 
                stroke="#008" 
                strokeWidth="10" 
            />
        ))}
    </svg>
);


export default function SettingsPage() {
  const { toast } = useToast();
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [logo, setLogo] = useState<string | null>(null);

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
        <h1 className="text-3xl font-bold tracking-tight">Platform Settings</h1>
        <p className="text-muted-foreground">Manage global settings for the TransactWave platform.</p>
      </div>
      <Separator />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="gateways">Payment Gateways</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage general platform settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" defaultValue="TransactWave" />
                </div>
                 <div className="space-y-2">
                    <Label>Platform Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center border overflow-hidden">
                        {logo ? (
                                <Image src={logo} alt="Business Logo" width={40} height={40} className="object-cover"/>
                            ) : (
                                <Upload className="w-5 h-5 text-muted-foreground" />
                            )}
                        </div>
                        <Input id="logo-upload" type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('logo-upload')?.click()}>Upload Logo</Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="support-email" className="flex items-center gap-2"><Mail className="w-4 h-4" /> Support Email</Label>
                    <Input id="support-email" type="email" placeholder="support@transactwave.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="default-currency" className="flex items-center gap-2"><Banknote className="w-4 h-4" /> Default Currency</Label>
                     <Select defaultValue="usd">
                        <SelectTrigger id="default-currency">
                            <SelectValue placeholder="Select default currency" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="usd">USD - United States Dollar</SelectItem>
                            <SelectItem value="inr">INR - Indian Rupee</SelectItem>
                            <SelectItem value="eur">EUR - Euro</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>

               <Separator />
              
               <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <h4 className="font-medium">Platform Maintenance Mode</h4>
                  <p className="text-sm text-muted-foreground">Temporarily disable access for non-admins.</p>
                </div>
                <Switch />
              </div>
               <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="api-keys" className="pt-4">
           <Card>
            <CardHeader>
              <CardTitle>Global API Keys</CardTitle>
              <CardDescription>Manage global API keys for third-party services.</CardDescription>
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
                    This key is required for platform-wide AI features like fraud detection.
                  </p>
                </div>
                <Button type="submit">Save API Key</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="gateways" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Gateway Management</CardTitle>
              <CardDescription>
                Enable, disable, and configure payment gateways for the entire platform.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h5 className="font-semibold mb-2 mt-4 flex items-center gap-2">
                            <IndianFlagIcon className="w-6 h-auto rounded-sm" />
                            Indian UPI Gateways
                        </h5>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div><Label htmlFor="paytm-switch" className="font-medium">Paytm</Label></div>
                                <Switch id="paytm-switch" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div><Label htmlFor="phonepe-switch" className="font-medium">PhonePe</Label></div>
                                <Switch id="phonepe-switch" defaultChecked />
                            </div>
                              <div className="flex items-center justify-between rounded-lg border p-3">
                                <div><Label htmlFor="gpay-switch" className="font-medium">Google Pay</Label></div>
                                <Switch id="gpay-switch" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-2 mt-4 flex items-center gap-2"><Globe className="w-5 h-5" /> Global Payment Methods</h5>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label htmlFor="usd-card-switch" className="font-medium">Credit/Debit Card (USD)</Label>
                                </div>
                                <Switch id="usd-card-switch" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label htmlFor="eur-sepa-switch" className="font-medium">SEPA Bank Transfer (EUR)</Label>
                                </div>
                                <Switch id="eur-sepa-switch" />
                            </div>
                             <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label htmlFor="paypal-switch" className="font-medium flex items-center gap-2">
                                        <PayPalIcon className="w-5 h-5" /> PayPal
                                    </Label>
                                </div>
                                <Switch id="paypal-switch" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pt-4">
                  <Button>Save Gateway Settings</Button>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

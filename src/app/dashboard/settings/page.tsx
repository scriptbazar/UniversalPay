
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, KeyRound } from "lucide-react";
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { updateGeminiApiKey } from './actions';

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M10 13a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-1a4 4 0 0 1 4-4h2a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-1a4 4 0 1 0 0 8" />
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
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="TransactWave" />
              </div>
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
                                        <PayPalIcon className="w-4 h-4" /> PayPal
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


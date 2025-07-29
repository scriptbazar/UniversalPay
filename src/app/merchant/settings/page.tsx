
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Globe, KeyRound, Wallet, Banknote, ShieldQuestion, Palette, FileText, IndianRupee, CreditCard, Bitcoin, LifeBuoy, ShieldCheck, DollarSign, Server, Smartphone, Store, Download, ShoppingCart, Code2, Info, Copy, User, Bell, Fingerprint, AlertTriangle, CheckCircle } from "lucide-react";
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, Timestamp, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";


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
  cad_eft: boolean;
  paypal: boolean;
};

type CheckoutDisplayOptions = {
    upi: boolean;
    card: boolean;
    crypto: boolean;
    paypal: boolean;
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 448 512" {...props}><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.8 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
);

const PayPalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.069 5.633H11.516C12.186 5.633 12.613 5.645 12.802 5.669C15.424 5.926 17.37 7.952 17.061 10.518C16.911 11.762 16.143 12.748 15.012 13.284C14.73 13.408 14.418 13.508 14.124 13.54C14.049 13.553 13.974 13.565 13.899 13.565C13.899 13.565 13.899 13.565 13.887 13.565H13.874C13.799 13.565 13.737 13.553 13.674 13.54C13.624 13.528 13.587 13.515 13.549 13.503C13.061 13.341 12.634 12.98 12.383 12.518L12.333 12.431L11.042 17.435C10.956 17.765 10.675 18 10.334 18H7.424C7.032 18 6.714 17.694 6.789 17.309L9.431 3.483C9.481 3.203 9.722 3 10.009 3H12.802C15.82 3 18.15 5.026 18.495 7.915C18.827 10.716 17.152 13.044 14.654 13.793C16.012 14.288 16.996 15.525 16.634 17.063C16.21 18.825 14.666 20.213 12.79 20.358C12.74 20.368 12.703 20.378 12.653 20.38C11.996 20.455 11.238 20.305 10.669 19.929L10.594 19.88L10.544 19.842C10.012 19.501 9.619 19.013 9.444 18.431L9.407 18.307L8.03 12.996L6.533 13.623C6.168 13.773 5.766 13.565 5.654 13.18L3.061 3.483C2.949 3.109 3.157 2.706 3.534 2.594L6.444 1.706C6.82 1.594 7.223 1.802 7.335 2.176L8.136 4.887C8.211 5.129 8.452 5.304 8.711 5.304H9.173L8.855 3.93C8.78 3.545 9.098 3.239 9.49 3.239H9.984C10.225 3.239 10.429 3.419 10.466 3.659L11.833 9.11L11.846 9.158C11.896 9.398 12.112 9.573 12.359 9.573H12.912C14.868 9.573 16.146 8.27 16.296 6.5C16.42 5.039 15.424 3.827 14.072 3.587C13.432 3.475 12.827 3.425 12.288 3.425H10.134L9.048 8.199L7.492 5.894C7.394 5.744 7.232 5.633 7.069 5.633Z"/>
    </svg>
);

const CheckoutPreview = ({ brandColor, logo, businessName, displayOptions }: { brandColor: string, logo: string | null, businessName: string, displayOptions: CheckoutDisplayOptions }) => {
    return (
        <div className="sticky top-24">
            <h3 className="text-lg font-semibold mb-4 text-center">Checkout Preview</h3>
            <Card className="w-full max-w-sm mx-auto shadow-lg">
                <CardContent className="p-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border">
                            {logo ? (
                                <Image src={logo} alt="Business Logo" width={80} height={80} className="object-cover" data-ai-hint="logo business" />
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
                             <div className="grid grid-cols-2 gap-2">
                                {displayOptions.upi && <Button type="button" variant="outline" className="w-full justify-start"><IndianRupee className="mr-2 h-4 w-4"/> UPI</Button>}
                                {displayOptions.card && <Button type="button" variant="outline" className="w-full justify-start"><CreditCard className="mr-2 h-4 w-4"/> Card</Button>}
                                {displayOptions.crypto && <Button type="button" variant="outline" className="w-full justify-start"><Bitcoin className="mr-2 h-4 w-4"/> Crypto</Button>}
                                {displayOptions.paypal && <Button type="button" variant="outline" className="w-full justify-start"><PayPalIcon className="mr-2 h-4 w-4"/> PayPal</Button>}
                            </div>
                        </div>

                        <Button 
                            type="button"
                            className="w-full text-lg h-12" 
                            style={{ backgroundColor: brandColor, color: 'hsl(var(--primary-foreground))' }}
                        >
                            Pay ₹1,009.00
                        </Button>
                         <p className="text-xs text-muted-foreground text-center pt-2">
                            By proceeding, you agree to the <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
                         </p>
                         <div className="flex items-center justify-center pt-2 gap-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4 text-primary"/>
                            <span>Powered by UniversalPay</span>
                         </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

function KycVerificationDialog({ onKycSubmitted }: { onKycSubmitted: () => void }) {
    const { toast } = useToast();
    const [step, setStep] = useState(1); // 1: Form, 2: OTP, 3: Success
    const { register, handleSubmit } = useForm();
    const [isLoading, setIsLoading] = useState(false);

    const onFormSubmit = (data: any) => {
        setIsLoading(true);
        // Simulate API call to send OTP
        setTimeout(() => {
            setIsLoading(false);
            setStep(2);
        }, 1500);
    };

    const onOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate OTP verification
        setTimeout(() => {
            setIsLoading(false);
            setStep(3);
            onKycSubmitted();
        }, 2000);
    };

    return (
        <Dialog open={step !== 4} onOpenChange={(open) => !open && setStep(4)}>
            <DialogTrigger asChild>
                <Button>
                    <ShieldCheck className="mr-2 h-4 w-4" /> Start Aadhar/PAN KYC
                </Button>
            </DialogTrigger>
            <DialogContent>
                {step === 1 && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Aadhar/PAN KYC Verification</DialogTitle>
                            <DialogDescription>
                                Please enter your Aadhar and PAN details to verify your identity.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit(onFormSubmit)}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="aadhar">Aadhar Number</Label>
                                    <Input id="aadhar" placeholder="XXXX XXXX XXXX" {...register("aadhar", { required: true })} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pan">PAN Number</Label>
                                    <Input id="pan" placeholder="ABCDE1234F" {...register("pan", { required: true })} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Sending OTP..." : "Send OTP"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
                {step === 2 && (
                    <>
                        <DialogHeader>
                            <DialogTitle>Enter OTP</DialogTitle>
                            <DialogDescription>
                                An OTP has been sent to your Aadhar and PAN registered mobile numbers.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={onOtpSubmit}>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="aadhar-otp">Aadhar OTP</Label>
                                    <Input id="aadhar-otp" placeholder="Enter 6-digit OTP" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pan-otp">PAN OTP</Label>
                                    <Input id="pan-otp" placeholder="Enter 6-digit OTP" />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Verifying..." : "Verify KYC"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
                {step === 3 && (
                    <>
                        <DialogHeader className="items-center text-center">
                             <div className="p-3 bg-green-100 rounded-full dark:bg-green-900/50">
                                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400"/>
                            </div>
                            <DialogTitle>KYC Submitted Successfully</DialogTitle>
                            <DialogDescription>
                                Your details have been submitted. Our team will review them and you will be notified upon approval.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="sm:justify-center">
                            <Button onClick={() => setStep(4)}>Close</Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    mobile?: string;
    businessName?: string;
    avatar?: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  
  // Profile states
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);


  // Branding states
  const [businessName, setBusinessName] = useState('');
  const [brandColor, setBrandColor] = useState('#29ABE2');
  const [checkoutLogo, setCheckoutLogo] = useState<string | null>(null);

  const [checkoutDisplayOptions, setCheckoutDisplayOptions] = useState<CheckoutDisplayOptions>({
      upi: true,
      card: true,
      crypto: true,
      paypal: false,
  });
  
  const [isKycRequestedByAdmin, setIsKycRequestedByAdmin] = useState(true);
  const [kycStatus, setKycStatus] = useState<'Verified' | 'Pending' | 'Not Started'>("Not Started");
  
  useEffect(() => {
    const fetchUserData = async () => {
        const user = auth.currentUser;
        if (user) {
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if(userDoc.exists()) {
                const data = userDoc.data();
                setProfileData({
                    id: user.uid,
                    fullName: data.fullName,
                    email: data.email,
                    mobile: data.mobile,
                    businessName: data.businessName,
                    avatar: data.avatar,
                });
                setBusinessName(data.businessName || data.fullName);
            }
        }
        setLoading(false);
    };
    
    fetchUserData();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { id, value } = e.target;
      setProfileData(prev => ({...prev, [id]: value}));
  };

  const handleDisplayOptionToggle = (option: keyof CheckoutDisplayOptions) => {
    setCheckoutDisplayOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };


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
    cad_eft: false,
    paypal: true,
  });

  const handlePaymentMethodToggle = (method: keyof PaymentMethodsState) => {
    setPaymentMethods(prev => ({ ...prev, [method]: !prev[method] }));
  };

  const handleProfileLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfileData(prev => ({...prev, avatar: result}));
        setCheckoutLogo(result);
      };
      reader.readAsDataURL(file);
    }
  };
  
    const handleCheckoutLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCheckoutLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const user = auth.currentUser;
    if (!user) {
        toast({variant: "destructive", title: "Error", description: "You are not logged in."});
        return;
    }
    
    try {
        const userDocRef = doc(db, "users", user.uid);

        const dataToSave: {[key: string]: any} = {
            fullName: profileData.fullName,
            email: profileData.email,
            mobile: profileData.mobile,
            businessName: profileData.businessName,
        };

        if (profileData.avatar) {
            dataToSave.avatar = profileData.avatar;
        }

        // Using setDoc with merge: true to create or update the document
        await setDoc(userDocRef, dataToSave, { merge: true });
        
        toast({
            title: "Settings Saved",
            description: "Your profile settings have been updated.",
        });
    } catch(error) {
        console.error("Error updating profile:", error);
        toast({variant: "destructive", title: "Error", description: "Failed to update profile."});
    }
  };
  
  const handleBrandingSaveChanges = () => {
    toast({
        title: "Branding settings saved!",
        description: "Your checkout page has been updated."
    });
  };
  
   const getKycStatusVariant = (status: typeof kycStatus) => {
        switch (status) {
            case 'Verified': return 'default';
            case 'Pending': return 'secondary';
            case 'Not Started': return 'destructive';
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
        <TabsList className="grid grid-cols-1 md:grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4"/>Profile</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="w-4 h-4"/>Notifications</TabsTrigger>
          <TabsTrigger value="branding" className="gap-2"><Palette className="w-4 h-4"/>Branding</TabsTrigger>
          <TabsTrigger value="payment-methods" className="gap-2"><Wallet className="w-4 h-4"/>Payment Methods</TabsTrigger>
          <TabsTrigger value="kyc" className="gap-2"><ShieldCheck className="w-4 h-4"/>KYC &amp; Limits</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Update your personal, business, and security information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Profile Information</h3>
                <div className="space-y-4 p-4 border rounded-md">
                     <div className="space-y-2">
                        <Label>Profile Picture</Label>
                        <div className="flex items-center gap-4">
                             <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border overflow-hidden">
                                {profileData.avatar ? (
                                    <Image src={profileData.avatar} alt="Profile Logo" width={96} height={96} className="object-cover" data-ai-hint="user avatar" />
                                ) : (
                                    <User className="w-12 h-12 text-muted-foreground" />
                                )}
                            </div>
                            <Input id="profile-logo-upload" type="file" className="hidden" onChange={handleProfileLogoUpload} accept="image/*" />
                            <Button variant="outline" onClick={() => document.getElementById('profile-logo-upload')?.click()}>Change Picture</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input 
                              id="fullName" 
                              value={profileData.fullName || ''} 
                              onChange={handleProfileChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={profileData.email || ''} onChange={handleProfileChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <Input 
                                id="businessName" 
                                value={profileData.businessName || ''} 
                                onChange={handleProfileChange} 
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <Input id="mobile" type="tel" value={profileData.mobile || ''} onChange={handleProfileChange} />
                        </div>
                    </div>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Security</h3>
                 <div className="space-y-4 p-4 border rounded-md">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                        <h4 className="font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> 2-Step Verification</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                        </div>
                        <Switch />
                    </div>
                </div>
              </div>
               <Button onClick={handleSaveChanges}>Save Changes</Button>
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
                </div>
               <Button className="mt-4" onClick={handleSaveChanges}>Save Changes</Button>
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
                                            {checkoutLogo ? (
                                                    <Image src={checkoutLogo} alt="Business Logo" width={80} height={80} className="object-cover" data-ai-hint="logo business" />
                                                ) : (
                                                    <Upload className="w-8 h-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <Input id="logo-upload" type="file" className="hidden" onChange={handleCheckoutLogoUpload} accept="image/*" />
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

                            <div className="space-y-4 p-4 border rounded-lg">
                                <h3 className="font-semibold flex items-center gap-2"><CreditCard className="w-5 h-5"/> Checkout Display Options</h3>
                                <p className="text-sm text-muted-foreground">Choose which payment methods are visible to your customers.</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <Label htmlFor="display-upi" className="font-medium flex items-center gap-2"><IndianRupee className="w-4 h-4"/> Show UPI</Label>
                                        <Switch id="display-upi" checked={checkoutDisplayOptions.upi} onCheckedChange={() => handleDisplayOptionToggle('upi')} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <Label htmlFor="display-card" className="font-medium flex items-center gap-2"><CreditCard className="w-4 h-4"/> Show Card</Label>
                                        <Switch id="display-card" checked={checkoutDisplayOptions.card} onCheckedChange={() => handleDisplayOptionToggle('card')} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <Label htmlFor="display-crypto" className="font-medium flex items-center gap-2"><Bitcoin className="w-4 h-4"/> Show Crypto</Label>
                                        <Switch id="display-crypto" checked={checkoutDisplayOptions.crypto} onCheckedChange={() => handleDisplayOptionToggle('crypto')} />
                                    </div>
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <Label htmlFor="display-paypal" className="font-medium flex items-center gap-2"><PayPalIcon className="w-4 h-4"/> Show PayPal</Label>
                                        <Switch id="display-paypal" checked={checkoutDisplayOptions.paypal} onCheckedChange={() => handleDisplayOptionToggle('paypal')} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start justify-between rounded-lg border p-4">
                                <div className="space-y-1">
                                <Label htmlFor="branding-switch" className="text-base font-semibold flex items-center gap-2">
                                    <ShieldQuestion className="w-5 h-5" />
                                    Hide My Identity &amp; Show 'UniversalPay' Branding
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    Turn ON to always show "UniversalPay" as the merchant. Turn OFF to show your business name. Your personal name will never be shown.
                                </p>
                                </div>
                                <Switch id="branding-switch" defaultChecked />
                            </div>
                            <Button onClick={handleBrandingSaveChanges}>Save Branding Changes</Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-1">
                    <CheckoutPreview brandColor={brandColor} logo={checkoutLogo} businessName={businessName} displayOptions={checkoutDisplayOptions} />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                             <div className="flex items-center justify-between rounded-lg border p-4 h-full">
                                <div>
                                    <Label htmlFor="usdt-switch" className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4"/>USDT (TRC20) Wallet</Label>
                                    <p className="text-sm text-muted-foreground pl-6">Enable to receive settlements in Tether.</p>
                                </div>
                                <Switch id="usdt-switch" checked={paymentMethods.usdt_wallet} onCheckedChange={() => handlePaymentMethodToggle('usdt_wallet')} />
                            </div>
                            {paymentMethods.usdt_wallet && (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="usdt-wallet">Your USDT (TRC20) Wallet Address</Label>
                                    <Input id="usdt-wallet" placeholder="T..."/>
                                </div>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4 h-full">
                                <div>
                                    <Label htmlFor="btc-switch" className="font-medium flex items-center gap-2"><Bitcoin className="w-4 h-4"/>Bitcoin (BTC) Wallet</Label>
                                    <p className="text-sm text-muted-foreground pl-6">Enable to receive settlements in BTC.</p>
                                </div>
                                <Switch id="btc-switch" checked={paymentMethods.btc_wallet} onCheckedChange={() => handlePaymentMethodToggle('btc_wallet')} />
                            </div>
                            {paymentMethods.btc_wallet && (
                                <div className="space-y-2 pt-2">
                                    <Label htmlFor="btc-wallet">Your Bitcoin (BTC) Wallet Address</Label>
                                    <Input id="btc-wallet" placeholder="bc1..."/>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <Separator />
                
                <div>
                    <h4 className="font-semibold mb-4 text-base">3. Enable Customer Payment Methods</h4>
                     <p className="text-sm text-muted-foreground mb-4">Select which payment options your customers will see.</p>
                    
                    <h5 className="font-semibold mb-2 mt-4 flex items-center gap-2"><IndianRupee className="w-5 h-5"/>Indian UPI Gateways</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="paypal-switch" className="font-medium flex items-center gap-2">
                                    <PayPalIcon className="w-4 h-4" /> PayPal
                                </Label>
                            </div>
                            <Switch id="paypal-switch" checked={paymentMethods.paypal} onCheckedChange={() => handlePaymentMethodToggle('paypal')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="usd-card-switch" className="font-medium">Credit/Debit Card (USD)</Label>
                            </div>
                            <Switch id="usd-card-switch" checked={paymentMethods.usd_card} onCheckedChange={() => handlePaymentMethodToggle('usd_card')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="eur-sepa-switch" className="font-medium">SEPA Transfer (EUR)</Label>
                            </div>
                            <Switch id="eur-sepa-switch" checked={paymentMethods.eur_sepa} onCheckedChange={() => handlePaymentMethodToggle('eur_sepa')} />
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="gbp-bacs-switch" className="font-medium">BACS Debit (GBP)</Label>
                            </div>
                            <Switch id="gbp-bacs-switch" checked={paymentMethods.gbp_bacs} onCheckedChange={() => handlePaymentMethodToggle('gbp_bacs')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="aud-becs-switch" className="font-medium">BECS Debit (AUD)</Label>
                            </div>
                            <Switch id="aud-becs-switch" checked={paymentMethods.aud_becs} onCheckedChange={() => handlePaymentMethodToggle('aud_becs')} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                                <Label htmlFor="cad-eft-switch" className="font-medium">EFT Debit (CAD)</Label>
                            </div>
                            <Switch id="cad-eft-switch" checked={paymentMethods.cad_eft} onCheckedChange={() => handlePaymentMethodToggle('cad_eft')} />
                        </div>
                    </div>
                </div>
                 <Button onClick={handleSaveChanges}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="kyc" className="pt-4">
            <Card>
                <CardHeader>
                    <CardTitle>KYC &amp; Account Limits</CardTitle>
                    <CardDescription>
                        View your current account limits and submit documents to increase them.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isKycRequestedByAdmin && kycStatus !== 'Verified' && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Action Required</AlertTitle>
                            <AlertDescription>
                                The admin has requested you to complete your KYC to review a recent transaction. Please complete the verification process below to avoid any service interruptions.
                            </AlertDescription>
                        </Alert>
                    )}
                    <Card>
                       <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                            <div className="flex-grow space-y-2">
                                <h3 className="font-semibold text-lg">Current Verification Status</h3>
                                <div className="flex items-center gap-4">
                                     <Badge variant={getKycStatusVariant(kycStatus)} className="text-base px-3 py-1">{kycStatus}</Badge>
                                    <p className="text-sm text-muted-foreground">
                                        {kycStatus === 'Verified' ? 'Your account is fully verified.' : kycStatus === 'Pending' ? 'Your documents are under review.' : 'Complete KYC to unlock all features.'}
                                    </p>
                                </div>
                            </div>
                            <Separator orientation="vertical" className="h-auto hidden md:block" />
                            <Separator className="md:hidden"/>
                            <div className="flex-shrink-0 space-y-2">
                                <h3 className="font-semibold text-lg">Complete Your KYC</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">Verify instantly using Aadhar & PAN OTP.</p>
                                {kycStatus === 'Not Started' ? (
                                    <KycVerificationDialog onKycSubmitted={() => {
                                        setKycStatus('Pending');
                                        setIsKycRequestedByAdmin(false); // Hide the alert after submission
                                    }} />
                                ) : (
                                     <Button disabled>KYC Submitted for Review</Button>
                                )}
                            </div>
                       </CardContent>
                    </Card>

                    <div className="p-4 border rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Account Transaction Limits</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Per Transaction Limit</span>
                                <span className="font-semibold text-lg">$5,000.00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Daily Transaction Limit</span>
                                <span className="font-semibold text-lg">$25,000.00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Monthly Transaction Limit</span>
                                <span className="font-semibold text-lg">$100,000.00</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

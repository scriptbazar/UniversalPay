import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings, notifications, and branding.</p>
      </div>
      <Separator />

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="upi-crypto">Payment Methods</TabsTrigger>
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
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" defaultValue="My Awesome Store" />
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
               <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="branding" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>White-Label & Branding</CardTitle>
              <CardDescription>Customize the look and feel of your payment pages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Custom Domain</Label>
                    <Input placeholder="pay.yourstore.com"/>
                    <p className="text-xs text-muted-foreground">Set a custom domain or subdomain for your payment pages.</p>
                </div>
                <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-md bg-muted flex items-center justify-center">
                            <Upload className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <Button variant="outline">Upload Logo</Button>
                    </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                    <h4 className="font-medium">"Powered by TransactWave" Badge</h4>
                    <p className="text-sm text-muted-foreground">Show our branding on your payment pages.</p>
                    </div>
                    <Switch defaultChecked />
                </div>
                <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="upi-crypto" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure your UPI and cryptocurrency settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h4 className="font-semibold">UPI Gateways</h4>
                    <div className="space-y-2">
                        <Label htmlFor="paytm-upi">Paytm UPI ID</Label>
                        <Input id="paytm-upi" placeholder="your-number@paytm"/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phonepe-upi">PhonePe UPI ID</Label>
                        <Input id="phonepe-upi" placeholder="your-number@ybl"/>
                    </div>
                </div>
                <Separator />
                <div className="space-y-4">
                    <h4 className="font-semibold">Cryptocurrency Wallets</h4>
                    <div className="space-y-2">
                        <Label htmlFor="btc-wallet">Bitcoin (BTC) Address</Label>
                        <Input id="btc-wallet" placeholder="bc1..."/>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="usdt-wallet">USDT (TRC20) Address</Label>
                        <Input id="usdt-wallet" placeholder="T..."/>
                    </div>
                </div>
                 <Button>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

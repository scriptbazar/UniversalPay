

'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, PlusCircle, Trash2, Eye, EyeOff, RefreshCw, Code2, Info, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Logo } from "@/components/logo";

const CodeSnippet = ({ code }: { code: string }) => {
    const { toast } = useToast();
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied to clipboard!" });
    };
    return (
        <div className="relative">
            <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
                <code>{code}</code>
            </pre>
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={copyToClipboard}>
                <Copy className="h-4 w-4" />
            </Button>
        </div>
    );
};


export default function DeveloperPage() {
    const [showSecret, setShowSecret] = React.useState(false);
    const { toast } = useToast();

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        toast({ title: "API Key Copied!" });
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground">Manage your API keys, webhooks, and access our SDKs.</p>
      </div>
      <Separator />

      <Tabs defaultValue="api-keys">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs & Guides</TabsTrigger>
          <TabsTrigger value="checkout">JS Widget</TabsTrigger>
        </TabsList>
        <TabsContent value="api-keys" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Your secret keys are used to authenticate requests to the API. Keep them secure and never share them publicly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="public-key">Publishable Key</Label>
                    <div className="flex items-center gap-2">
                        <Input id="public-key" readOnly value="pk_live_xxxxxxxxxxxxxxxxxxxxxxxx" />
                        <Button variant="outline" size="icon" onClick={() => copyKey('pk_live_xxxxxxxxxxxxxxxxxxxxxxxx')}><Copy className="h-4 w-4"/></Button>
                    </div>
                     <p className="text-xs text-muted-foreground mt-1">This key is safe to use in your frontend code (e.g., JS Widget).</p>
                </div>
                <div>
                    <Label htmlFor="secret-key">Secret Key</Label>
                    <div className="flex items-center gap-2">
                        <Input id="secret-key" type={showSecret ? "text" : "password"} readOnly value="sk_live_xxxxxxxxxxxxxxxxxxxxxxxx" />
                        <Button variant="outline" size="icon" onClick={() => setShowSecret(!showSecret)}>
                            {showSecret ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                        </Button>
                        <Button variant="outline" size="icon" onClick={() => copyKey('sk_live_xxxxxxxxxxxxxxxxxxxxxxxx')}><Copy className="h-4 w-4"/></Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">This key should only be used on your server. Never expose it on the client-side.</p>
                </div>
                <div className="flex gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive"><RefreshCw className="mr-2"/> Regenerate Secret Key</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action is irreversible. Your old secret key will stop working immediately. You must update your backend with the new key to continue processing payments.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => toast({title: "Key Regenerated!", description: "Your new secret key has been generated."})}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="webhooks" className="pt-4">
            <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Webhooks</CardTitle>
                        <CardDescription>
                            Get notified about events that happen in your TransactWave account.
                        </CardDescription>
                    </div>
                     <Dialog>
                        <DialogTrigger asChild>
                            <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Webhook</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                            <DialogTitle>Add a new webhook endpoint</DialogTitle>
                            <DialogDescription>
                                We'll send a POST request to this URL when selected events occur.
                            </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="webhook-url">Endpoint URL</Label>
                                    <Input id="webhook-url" placeholder="https://your-server.com/webhook" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Events to send</Label>
                                    <div className="space-y-2 rounded-md border p-4">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="payment.succeeded" />
                                            <Label htmlFor="payment.succeeded">payment.succeeded</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="payment.failed" />
                                            <Label htmlFor="payment.failed">payment.failed</Label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <Checkbox id="withdrawal.created" />
                                            <Label htmlFor="withdrawal.created">withdrawal.created</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="withdrawal.completed" />
                                            <Label htmlFor="withdrawal.completed">withdrawal.completed</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline">Cancel</Button>
                                <Button type="submit">Add Endpoint</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Endpoint URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">https://api.myapp.com/webhooks/transactwave</TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell>payment.succeeded, payment.failed</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">https://api.anotherapp.com/hooks</TableCell>
                            <TableCell>Inactive</TableCell>
                            <TableCell>withdrawal.completed</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon"><Trash2 className="h-4 w-4"/></Button>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="sdks" className="pt-4">
            <Card>
            <CardHeader>
                <CardTitle>SDKs and Integration Guides</CardTitle>
                <CardDescription>
                Integrate TransactWave into your application with our official libraries and guides.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <Code2 className="h-4 w-4" />
                    <AlertTitle>Server-Side Integration</AlertTitle>
                    <AlertDescription>
                        All payment and withdrawal logic should be handled on your server using your Secret Key to ensure security.
                    </AlertDescription>
                </Alert>

                <Tabs defaultValue="nodejs" className="w-full">
                    <TabsList>
                        <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                        <TabsTrigger value="php">PHP</TabsTrigger>
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="flutter">Flutter</TabsTrigger>
                        <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                        <TabsTrigger value="shopify">Shopify</TabsTrigger>
                    </TabsList>
                    <TabsContent value="nodejs" className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">Node.js Integration</h3>
                        <p className="text-sm text-muted-foreground mb-4">Install our Node.js library to get started.</p>
                        <CodeSnippet code="npm install transactwave-node" />
                        <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                        <CodeSnippet code={`
const transactwave = require('transactwave-node')('YOUR_SECRET_KEY');

async function createPayment() {
  try {
    const payment = await transactwave.payments.create({
      amount: 1000, // amount in smallest currency unit (e.g., cents for USD, paise for INR)
      currency: 'INR',
      receipt: 'receipt_order_7432',
      customer_name: 'John Doe',
      customer_email: 'john.doe@example.com'
    });
    console.log('Payment created:', payment.id);
    // Redirect customer to payment.checkout_url
  } catch (error) {
    console.error('Error:', error);
  }
}

createPayment();
                        `} />
                    </TabsContent>
                     <TabsContent value="php" className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">PHP Integration</h3>
                        <p className="text-sm text-muted-foreground mb-4">Use Composer to install our PHP library.</p>
                        <CodeSnippet code="composer require transactwave/transactwave-php" />
                        <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                        <CodeSnippet code={`
require_once('vendor/autoload.php');

$api = new TransactWave\\Api('YOUR_SECRET_KEY');

$payment = $api->payment->create([
    'amount' => 1000,
    'currency' => 'INR',
    'receipt' => 'receipt_order_7432'
]);

$paymentId = $payment->id;
$checkoutUrl = $payment->checkout_url;

// Redirect customer to $checkoutUrl
                        `} />
                    </TabsContent>
                    <TabsContent value="react" className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">React Integration</h3>
                        <p className="text-sm text-muted-foreground mb-4">Use our React hook for easy integration with the JS Widget.</p>
                        <CodeSnippet code="npm install @transactwave/react" />
                        <h4 className="font-semibold mt-4 mb-2">Example: Payment Button</h4>
                         <CodeSnippet code={`
import React from 'react';
import { useTransactWave } from '@transactwave/react';

const CheckoutButton = () => {
  const { open, isLoaded } = useTransactWave({
    key: 'YOUR_PUBLISHABLE_KEY',
    amount: 1000,
    currency: 'INR',
    name: 'My Awesome Store',
    description: 'Payment for services',
    handler: function (response) {
      alert('Payment successful: ' + response.payment_id);
      // Verify payment on your server
    }
  });

  return (
    <button onClick={() => open()} disabled={!isLoaded}>
      Pay with TransactWave
    </button>
  );
};
                        `} />
                    </TabsContent>
                     <TabsContent value="flutter" className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">Flutter Integration</h3>
                        <p className="text-sm text-muted-foreground mb-4">Add our package to your \`pubspec.yaml\` file.</p>
                        <CodeSnippet code="dependencies:\n  transactwave_flutter: ^1.0.0" />
                        <h4 className="font-semibold mt-4 mb-2">Example: Initiating a Payment</h4>
                         <CodeSnippet code={`
import 'package:transactwave_flutter/transactwave_flutter.dart';

class _MyAppState extends State<MyApp> {
  final _transactwave = TransactWave();

  @override
  void initState() {
    super.initState();
    _transactwave.on(TransactWave.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _transactwave.on(TransactWave.EVENT_PAYMENT_ERROR, _handlePaymentError);
  }

  void openCheckout() {
    var options = {
      'key': 'YOUR_PUBLISHABLE_KEY',
      'amount': '1000',
      'name': 'My Awesome Store',
    };
    _transactwave.open(options);
  }
}
                        `} />
                    </TabsContent>
                    <TabsContent value="wordpress" className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">WordPress / WooCommerce</h3>
                        <p className="text-sm text-muted-foreground mb-4">Install our official plugin from the WordPress repository.</p>
                         <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Go to your WordPress Admin Dashboard.</li>
                            <li>Navigate to \`Plugins > Add New\`.</li>
                            <li>Search for "TransactWave Payment Gateway for WooCommerce".</li>
                            <li>Install and activate the plugin.</li>
                            <li>Go to \`WooCommerce > Settings > Payments\` and enable TransactWave.</li>
                            <li>Enter your Publishable Key and Secret Key from this page.</li>
                        </ol>
                    </TabsContent>
                    <TabsContent value="shopify" className="pt-4">
                        <h3 className="font-semibold text-lg mb-2">Shopify Integration</h3>
                        <p className="text-sm text-muted-foreground mb-4">Integrate TransactWave with your Shopify store by creating a custom payment app.</p>
                         <ol className="list-decimal list-inside space-y-2 text-sm">
                            <li>Go to your Shopify Admin, then \`Settings > Payments\`.</li>
                            <li>In the "Supported payment methods" section, click \`Add payment methods\`.</li>
                            <li>Search for and select "TransactWave Payments".</li>
                            <li>Enter your Publishable Key and Secret Key from this page to activate.</li>
                            <li>If not listed, you may need to install our app from the Shopify App Store.</li>
                        </ol>
                         <div className="mt-4">
                            <Button variant="outline"><ShoppingCart className="mr-2 h-4 w-4"/> View on Shopify App Store</Button>
                        </div>
                    </TabsContent>
                </Tabs>


            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="checkout" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Embedded Checkout Widget</CardTitle>
              <CardDescription>
                Easily embed a secure payment form on any website with a single HTML script tag.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Important Security Note</AlertTitle>
                    <AlertDescription>
                        The JS Widget should be used for collecting payment details only. You must always verify the payment status on your server using your Secret Key to confirm the payment was successful.
                    </AlertDescription>
                </Alert>
              <div>
                <Label>Embed Script</Label>
                <CodeSnippet code={`
<script src="https://cdn.transactwave.com/checkout.js"></script>
<form>
  <button id="pay-button">Pay Now</button>
</form>

<script>
var options = {
    "key": "YOUR_PUBLISHABLE_KEY",
    "amount": "1000", // e.g. 1000 paise = INR 10.00
    "currency": "INR",
    "name": "Your Business Name",
    "description": "Test Transaction",
    "handler": function (response){
        alert("Payment ID: " + response.payment_id);
        // Add code here to verify payment on your server
    }
};
var tw = new TransactWave(options);
document.getElementById('pay-button').onclick = function(e){
    tw.open();
    e.preventDefault();
}
</script>
                `} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    

    
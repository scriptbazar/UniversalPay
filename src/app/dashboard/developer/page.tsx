

'use client';

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, PlusCircle, Trash2, Eye, EyeOff, RefreshCw, Code2, Info, ShoppingCart, Download, Server, Smartphone, Store } from "lucide-react";
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

const CodeSnippet = ({ code }: { code: string }) => {
    const { toast } = useToast();
    const copyToClipboard = () => {
        navigator.clipboard.writeText(code.trim());
        toast({ title: "Copied to clipboard!" });
    };
    return (
        <div className="relative">
            <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
                <code>{code.trim()}</code>
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

      <Tabs defaultValue="api-keys" className="w-full">
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
                            <Button variant="destructive"><RefreshCw className="mr-2 h-4 w-4"/> Regenerate Secret Key</Button>
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
                            All payment and withdrawal logic should be handled on your server using your Secret Key to ensure security. Never expose your secret key in client-side code.
                        </AlertDescription>
                    </Alert>

                    <Tabs defaultValue="server-side" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                           <TabsTrigger value="server-side" className="gap-2"><Server/>Server-Side</TabsTrigger>
                            <TabsTrigger value="client-side" className="gap-2"><Smartphone/>Client-Side</TabsTrigger>
                            <TabsTrigger value="ecommerce" className="gap-2"><Store/>eCommerce</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="server-side" className="pt-6">
                            <Tabs defaultValue="nodejs" className="w-full">
                                <TabsList className="overflow-x-auto w-full justify-start">
                                    <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                                    <TabsTrigger value="php">PHP</TabsTrigger>
                                    <TabsTrigger value="python">Python</TabsTrigger>
                                    <TabsTrigger value="ruby">Ruby</TabsTrigger>
                                    <TabsTrigger value="go">Go</TabsTrigger>
                                    <TabsTrigger value="java">Java</TabsTrigger>
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
      amount: 1000, // amount in smallest currency unit
      currency: 'INR',
      receipt: 'receipt_order_7432',
    });
    console.log('Payment created:', payment.id);
    // Redirect customer to payment.checkout_url
  } catch (error) {
    console.error('Error:', error);
  }
}
createPayment();
                                    `} />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Verifying Webhook Signature</h4>
                                    <CodeSnippet code={`
const crypto = require('crypto');
const express = require('express');
const app = express();

app.post('/webhook', express.json({type: 'application/json'}), (req, res) => {
  const secret = 'YOUR_WEBHOOK_SECRET';
  const signature = req.headers['transactwave-signature'];
  const body = JSON.stringify(req.body);

  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(body);
  const digest = hmac.digest('hex');

  if (digest === signature) {
    // Signature is valid
    console.log('Payment successful:', req.body.payload.payment.entity);
    res.status(200).send('OK');
  } else {
    // Signature is invalid
    res.status(400).send('Invalid signature');
  }
});
                                    `} />
                                </TabsContent>
                                <TabsContent value="php" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">PHP Integration</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Use Composer to install our PHP library.</p>
                                    <CodeSnippet code="composer require transactwave/transactwave-php" />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                                    <CodeSnippet code={`
require_once('vendor/autoload.php');
use TransactWave\\Api;

$api = new Api('YOUR_SECRET_KEY');

$payment = $api->payment->create([
    'amount' => 1000,
    'currency' => 'INR',
    'receipt' => 'receipt_order_7432'
]);

$paymentId = $payment->id;
$checkoutUrl = $payment->checkout_url;
// Redirect customer to $checkoutUrl
                                    `} />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Verifying Webhook Signature</h4>
                                    <CodeSnippet code={`
use TransactWave\\Api\\Utility;

$secret = 'YOUR_WEBHOOK_SECRET';
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_TRANSACTWAVE_SIGNATURE'];

try {
    Utility::verifyPaymentSignature($payload, $signature, $secret);
    // Signature is valid
    // Process the webhook payload
    http_response_code(200);
} catch (Exception $e) {
    // Signature is invalid
    http_response_code(400);
}
                                    `} />
                                </TabsContent>
                                <TabsContent value="python" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">Python Integration</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Install our Python library using pip.</p>
                                    <CodeSnippet code="pip install transactwave-python" />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                                    <CodeSnippet code={`
import transactwave
client = transactwave.Client(api_key="YOUR_SECRET_KEY")

payment = client.payment.create({
  "amount": 1000,
  "currency": "INR",
  "receipt": "receipt_order_7432"
})

print(payment['id'])
# Redirect customer to payment['checkout_url']
                                    `} />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Verifying Webhook Signature</h4>
                                    <CodeSnippet code={`
import hmac
import hashlib

def verify_signature(payload_body, signature, secret):
    generated_signature = hmac.new(
        secret.encode(),
        payload_body.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(generated_signature, signature)

# In your Flask/Django view:
# payload_body = request.get_data(as_text=True)
# signature = request.headers.get('Transactwave-Signature')
# secret = 'YOUR_WEBHOOK_SECRET'
# if verify_signature(payload_body, signature, secret):
#     # Process webhook
# else:
#     # Invalid signature
                                    `} />
                                </TabsContent>
                                <TabsContent value="ruby" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">Ruby Integration</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Install our Ruby gem.</p>
                                    <CodeSnippet code="gem install transactwave" />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                                    <CodeSnippet code={`
require 'transactwave'
TransactWave.api_key = 'YOUR_SECRET_KEY'

payment = TransactWave::Payment.create(
  amount: 1000,
  currency: 'INR',
  receipt: 'receipt_order_7432'
)

puts payment.id
# Redirect customer to payment.checkout_url
                                    `} />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Verifying Webhook Signature</h4>
                                    <CodeSnippet code={`
require 'openssl'

def verify_signature(payload_body, signature, secret)
  digest = OpenSSL::HMAC.hexdigest('sha256', secret, payload_body)
  return Rack::Utils.secure_compare(digest, signature)
end

# In your Rails/Sinatra controller:
# payload_body = request.body.read
# signature = request.env['HTTP_TRANSACTWAVE_SIGNATURE']
# secret = 'YOUR_WEBHOOK_SECRET'
# if verify_signature(payload_body, signature, secret)
#   # Process webhook
# else
#   # Invalid signature
# end
                                    `} />
                                </TabsContent>
                                <TabsContent value="go" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">Go Integration</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Install our Go module.</p>
                                    <CodeSnippet code="go get github.com/transactwave/transactwave-go" />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                                    <CodeSnippet code={`
package main

import (
    "fmt"
    "github.com/transactwave/transactwave-go"
)

func main() {
    client := transactwave.NewClient("YOUR_SECRET_KEY", "")
    
    params := &transactwave.PaymentParams{
        Amount:   transactwave.Int(1000),
        Currency: transactwave.String("INR"),
        Receipt:  transactwave.String("receipt_order_7432"),
    }

    payment, err := client.Payment.Create(params)
    if err != nil {
        panic(err)
    }
    fmt.Println(payment.ID)
    // Redirect customer to payment.CheckoutURL
}
                                    `} />
                                     <h4 className="font-semibold mt-4 mb-2">Example: Verifying Webhook Signature</h4>
                                    <CodeSnippet code={`
package main
import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "net/http"
)
func verifySignature(payloadBody, signature, secret string) bool {
    mac := hmac.New(sha256.New, []byte(secret))
    mac.Write([]byte(payloadBody))
    expectedMAC := hex.EncodeToString(mac.Sum(nil))
    return hmac.Equal([]byte(expectedMAC), []byte(signature))
}
// In your HTTP handler
// bodyBytes, _ := ioutil.ReadAll(r.Body)
// signature := r.Header.Get("Transactwave-Signature")
// if verifySignature(string(bodyBytes), signature, "YOUR_WEBHOOK_SECRET") {
//     // Process
// }
                                    `} />
                                </TabsContent>
                                <TabsContent value="java" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">Java Integration</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Add our library to your Maven or Gradle project.</p>
                                    <CodeSnippet code={`
<dependency>
  <groupId>com.transactwave</groupId>
  <artifactId>transactwave-java</artifactId>
  <version>1.0.0</version>
</dependency>
                                    `} />
                                    <h4 className="font-semibold mt-4 mb-2">Example: Creating a Payment</h4>
                                    <CodeSnippet code={`
import com.transactwave.api.TransactWaveClient;
import com.transactwave.model.Payment;
import org.json.JSONObject;

TransactWaveClient client = new TransactWaveClient("YOUR_SECRET_KEY");

JSONObject paymentParams = new JSONObject();
paymentParams.put("amount", 1000);
paymentParams.put("currency", "INR");
paymentParams.put("receipt", "receipt_order_7432");

Payment payment = client.payment.create(paymentParams);
System.out.println(payment.get("id"));
// Redirect to payment.get("checkout_url");
                                    `} />
                                     <h4 className="font-semibold mt-4 mb-2">Example: Verifying Webhook Signature</h4>
                                    <CodeSnippet code={`
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Hex;

public class Utils {
  public static boolean verifySignature(String payload, String signature, String secret) throws Exception {
    Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
    SecretKeySpec secret_key = new SecretKeySpec(secret.getBytes("UTF-8"), "HmacSHA256");
    sha256_HMAC.init(secret_key);
    
    String generatedSignature = new String(Hex.encodeHex(sha256_HMAC.doFinal(payload.getBytes("UTF-8"))));
    
    return generatedSignature.equals(signature);
  }
}
                                    `} />
                                </TabsContent>
                            </Tabs>
                        </TabsContent>

                        <TabsContent value="client-side" className="pt-6">
                            <Tabs defaultValue="react" className="w-full">
                                <TabsList className="overflow-x-auto w-full justify-start">
                                    <TabsTrigger value="react">React</TabsTrigger>
                                    <TabsTrigger value="flutter">Flutter</TabsTrigger>
                                </TabsList>
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
                                    <CodeSnippet code="dependencies:\\n  transactwave_flutter: ^1.0.0" />
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
                             </Tabs>
                        </TabsContent>

                        <TabsContent value="ecommerce" className="pt-6">
                             <Tabs defaultValue="wordpress" className="w-full">
                                <TabsList className="overflow-x-auto w-full justify-start">
                                    <TabsTrigger value="wordpress">WordPress</TabsTrigger>
                                    <TabsTrigger value="shopify">Shopify</TabsTrigger>
                                </TabsList>
                                 <TabsContent value="wordpress" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">WordPress / WooCommerce</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Download our official plugin and upload it to your WordPress site.</p>
                                    <div className="mb-4">
                                        <Button><Download className="mr-2 h-4 w-4"/> Download Plugin (.zip)</Button>
                                    </div>
                                     <h4 className="font-semibold mt-6 mb-2">Installation Steps</h4>
                                     <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Go to your WordPress Admin Dashboard.</li>
                                        <li>Navigate to `Plugins > Add New`.</li>
                                        <li>Click on the "Upload Plugin" button at the top of the page.</li>
                                        <li>Choose the downloaded .zip file and click "Install Now".</li>
                                        <li>After installation, click "Activate Plugin".</li>
                                        <li>Go to `WooCommerce > Settings > Payments` and enable the "TransactWave" gateway.</li>
                                        <li>Enter your Publishable Key and Secret Key from this page and save changes.</li>
                                    </ol>
                                </TabsContent>
                                <TabsContent value="shopify" className="pt-4">
                                    <h3 className="font-semibold text-lg mb-2">Shopify Integration</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Install our private app to connect TransactWave with your Shopify store.</p>
                                    <div className="mb-4">
                                        <Button><ShoppingCart className="mr-2 h-4 w-4"/> Install Shopify App</Button>
                                    </div>
                                     <h4 className="font-semibold mt-6 mb-2">Installation Steps</h4>
                                     <ol className="list-decimal list-inside space-y-2 text-sm">
                                        <li>Click the "Install Shopify App" button above to go to the installation page.</li>
                                        <li>Log in to your Shopify store if you haven't already.</li>
                                        <li>Review the permissions and click "Install app" to authorize TransactWave.</li>
                                        <li>You will be redirected to the TransactWave settings page within your Shopify admin.</li>
                                        <li>Enter your Publishable Key and Secret Key from this Developer page.</li>
                                        <li>Activate the TransactWave payment method. Your store is now ready to accept payments!</li>
                                    </ol>
                                </TabsContent>
                             </Tabs>
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
  <script
    src="https://checkout.transactwave.com/v1/checkout.js"
    data-key="YOUR_PUBLISHABLE_KEY"
    data-amount="1000"
    data-currency="INR"
    data-name="Your Business Name"
    data-description="Test Transaction"
    data-image="https://your-logo.com/logo.png"
    data-prefill.name="John Doe"
    data-prefill.email="john.doe@example.com"
  >
  </script>
  <input type="hidden" custom="Hidden Value" name="hidden">
</form>
                `} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

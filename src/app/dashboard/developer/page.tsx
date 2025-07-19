import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, PlusCircle, Trash2 } from "lucide-react";

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground">Manage your API keys, webhooks, and access our SDKs.</p>
      </div>
      <Separator />

      <Tabs defaultValue="api-keys">
        <TabsList>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="sdks">SDKs & Docs</TabsTrigger>
          <TabsTrigger value="checkout">JS Widget</TabsTrigger>
        </TabsList>
        <TabsContent value="api-keys" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>API Keys</CardTitle>
              <CardDescription>
                Your secret keys are used to authenticate requests to the API. Keep them secure.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="public-key">Public Key</Label>
                    <div className="flex items-center gap-2">
                    <Input id="public-key" readOnly value="pk_test_************************" />
                    <Button variant="outline" size="icon"><Copy className="h-4 w-4"/></Button>
                    </div>
                </div>
                <div>
                    <Label htmlFor="secret-key">Secret Key</Label>
                    <div className="flex items-center gap-2">
                    <Input id="secret-key" type="password" readOnly value="sk_test_************************" />
                    <Button variant="outline" size="icon"><Copy className="h-4 w-4"/></Button>
                    </div>
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
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Webhook</Button>
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
                            <TableCell>subscription.created</TableCell>
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
                <CardTitle>SDKs and Documentation</CardTitle>
                <CardDescription>
                Integrate TransactWave into your application with our official libraries.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle>Node.js</CardTitle></CardHeader>
                    <CardContent><Button className="w-full" variant="outline">View on GitHub</Button></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>PHP</CardTitle></CardHeader>
                    <CardContent><Button className="w-full" variant="outline">View on GitHub</Button></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>Flutter</CardTitle></CardHeader>
                    <CardContent><Button className="w-full" variant="outline">View on GitHub</Button></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>React</CardTitle></CardHeader>
                    <CardContent><Button className="w-full" variant="outline">View on GitHub</Button></CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle>Wordpress</CardTitle></CardHeader>
                    <CardContent><Button className="w-full" variant="outline">View on GitHub</Button></CardContent>
                </Card>
                 <Card className="border-primary">
                    <CardHeader><CardTitle>API Documentation</CardTitle></CardHeader>
                    <CardContent><Button className="w-full">Read Docs</Button></CardContent>
                </Card>
            </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="checkout" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Embedded Checkout Widget</CardTitle>
              <CardDescription>
                Easily embed a secure payment form on your website with a single script.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Embed Script</Label>
                <pre className="p-4 rounded-md bg-muted text-sm overflow-x-auto">
                  <code>
                    {`<script src="https://cdn.transactwave.com/checkout.js"\n  data-key="YOUR_PUBLIC_KEY"\n  data-amount="1000"\n  data-currency="INR">\n</script>`}
                  </code>
                </pre>
              </div>
              <div>
                <Label>Preview</Label>
                <div className="p-8 rounded-md border border-dashed flex items-center justify-center">
                  <Card className="w-full max-w-sm">
                    <CardHeader>
                      <div className="flex justify-center"><Logo /></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-center font-semibold">Pay To Merchant</p>
                      <Button className="w-full">Pay $10.00</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Users, DollarSign, Percent } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const subMerchants = [
  {
    id: "sub_1",
    name: "MyStore.com",
    email: "contact@mystore.com",
    sales: "12,500.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_2",
    name: "AnotherShop",
    email: "sales@anothershop.io",
    sales: "8,200.00",
    commission: "5%",
    status: "Active",
  },
  {
    id: "sub_3",
    name: "CreativeGoods",
    email: "support@creative.co",
    sales: "4,500.00",
    commission: "7%",
    status: "Inactive",
  },
];

export default function ResellerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reseller Dashboard</h1>
        <p className="text-muted-foreground">Manage your sub-merchants, track sales, and assign commissions.</p>
      </div>
      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sub-Merchants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">+2 since last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sub-Merchant Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$25,200.00</div>
            <p className="text-xs text-muted-foreground">Total sales this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Commission</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,260.00</div>
            <p className="text-xs text-muted-foreground">Earned this month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Sub-Merchants</CardTitle>
            <CardDescription>A list of all merchants under your reseller account.</CardDescription>
          </div>
          <Button><PlusCircle className="mr-2 h-4 w-4" /> Invite Merchant</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Merchant</TableHead>
                <TableHead>Total Sales</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subMerchants.map((merchant) => (
                <TableRow key={merchant.id}>
                  <TableCell>
                    <div className="font-medium">{merchant.name}</div>
                    <div className="text-sm text-muted-foreground">{merchant.email}</div>
                  </TableCell>
                  <TableCell>${merchant.sales}</TableCell>
                  <TableCell>{merchant.commission}</TableCell>
                  <TableCell>
                    <Badge variant={merchant.status === "Active" ? "default" : "secondary"}>
                      {merchant.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}


import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, PlusCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const invoices = [
  {
    id: "INV-2023-001",
    customer: "Liam Johnson",
    date: "2023-10-25",
    status: "Paid",
    amount: "250.00",
  },
  {
    id: "INV-2023-002",
    customer: "Olivia Smith",
    date: "2023-10-24",
    status: "Pending",
    amount: "150.00",
  },
  {
    id: "INV-2023-003",
    customer: "Noah Williams",
    date: "2023-10-23",
    status: "Paid",
    amount: "350.00",
  },
  {
    id: "INV-2023-004",
    customer: "Emma Brown",
    date: "2023-10-22",
    status: "Overdue",
    amount: "450.00",
  },
];

const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        default:
            return 'outline';
    }
}

export default function InvoicesPage() {
  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">Manage your invoices and billing history.</p>
        </div>
        <Separator />
      
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Your Invoices</CardTitle>
                <CardDescription>A list of all invoices for your account.</CardDescription>
            </div>
            <div className="flex gap-2">
                <Button variant="outline"><Download className="mr-2 h-4 w-4"/> Export CSV</Button>
                <Button><PlusCircle className="mr-2 h-4 w-4"/> Create Invoice</Button>
            </div>
            </CardHeader>
            <CardContent>
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.id}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>{invoice.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">${invoice.amount}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </CardContent>
        </Card>
    </div>
  );
}

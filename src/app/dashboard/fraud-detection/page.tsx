import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

const suspiciousTransactions = [
  {
    id: "UVRLP123456789",
    user: "user_a",
    ip: "123.45.67.89",
    amount: "1500.00",
    riskScore: 95,
    reason: "High frequency",
    status: "Flagged",
    timestamp: "2023-10-26 10:00:00",
  },
  {
    id: "UVRLP987654321",
    user: "user_b",
    ip: "98.76.54.32",
    amount: "50.00",
    riskScore: 80,
    reason: "Geo mismatch",
    status: "Held",
    timestamp: "2023-10-26 10:05:00",
  },
  {
    id: "UVRLP112233445",
    user: "user_c",
    ip: "111.222.111.222",
    amount: "200.00",
    riskScore: 70,
    reason: "Bot-like activity",
    status: "Flagged",
    timestamp: "2023-10-26 10:10:00",
  },
  {
    id: "UVRLP556677889",
    user: "user_d",
    ip: "123.45.67.89",
    amount: "3000.00",
    riskScore: 99,
    reason: "High frequency, Large amount",
    status: "Blocked",
    timestamp: "2023-10-26 10:15:00",
  },
];

const getRiskBadgeVariant = (score: number) => {
    if (score > 90) return "destructive";
    if (score > 75) return "secondary";
    return "outline";
}

export default function FraudDetectionPage() {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Fraud & Risk Management</h1>
        <p className="text-muted-foreground">Monitor and manage suspicious activities on your account.</p>
      </div>
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Suspicious Transactions</CardTitle>
          <CardDescription>
            Review transactions that have been flagged by our AI-powered risk engine.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction ID</TableHead>
                <TableHead>User / IP</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Risk Score</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suspiciousTransactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.user} <br/> <span className="text-muted-foreground text-xs">{tx.ip}</span></TableCell>
                  <TableCell>${tx.amount}</TableCell>
                  <TableCell>
                    <Badge variant={getRiskBadgeVariant(tx.riskScore)}>{tx.riskScore}</Badge>
                  </TableCell>
                  <TableCell>{tx.reason}</TableCell>
                  <TableCell>
                    <Badge variant={tx.status === 'Blocked' ? 'destructive' : 'secondary'}>{tx.status}</Badge>
                  </TableCell>
                  <TableCell>{tx.timestamp}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Approve Payment</DropdownMenuItem>
                        <DropdownMenuItem>Hold Payment</DropdownMenuItem>
                        <DropdownMenuItem>Block User</DropdownMenuItem>
                        <DropdownMenuItem>Request KYC</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

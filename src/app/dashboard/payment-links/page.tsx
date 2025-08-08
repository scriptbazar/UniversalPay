
'use client';

import { PaymentLinksManager } from '@/components/PaymentLinksManager';
import { Separator } from '@/components/ui/separator';

export default function AdminPaymentLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links Monitoring</h1>
        <p className="text-muted-foreground">Oversee all payment links created across the platform.</p>
      </div>
      <Separator />
      <PaymentLinksManager userType="admin" />
    </div>
  );
}

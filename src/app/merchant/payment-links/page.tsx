
'use client';

import { PaymentLinksManager } from '@/components/PaymentLinksManager';
import { Separator } from '@/components/ui/separator';

export default function PaymentLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Links</h1>
        <p className="text-muted-foreground">Create and manage temporary links to accept payments from anyone.</p>
      </div>
      <Separator />
      <PaymentLinksManager userType="merchant" />
    </div>
  );
}

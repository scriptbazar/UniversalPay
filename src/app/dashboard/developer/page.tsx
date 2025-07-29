
'use client';

import { DeveloperTools } from "@/components/DeveloperTools";
import { Separator } from "@/components/ui/separator";

export default function DeveloperPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform SDKs &amp; Developer Tools</h1>
        <p className="text-muted-foreground">Manage your API keys, webhooks, and access our SDKs.</p>
      </div>
      <Separator />
      <DeveloperTools />
    </div>
  );
}

'use client';

import { Topbar } from '@/components/layout/topbar';

export default function VendorsPage() {
  return (
    <>
      <Topbar title="Vendor Marketplace" subtitle="Find trusted vendors for events and initiatives" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Vendor Marketplace
          </h1>
          <p className="text-muted-foreground">
            AI-powered recommendations to find the right vendors for your events.
          </p>
        </div>
      </div>
    </>
  );
}

'use client';

import { Topbar } from '@/components/layout/topbar';

export default function InnovationHubPage() {
  return (
    <>
      <Topbar title="Innovation Hub" subtitle="Engineering students solving real social problems with AI" />

      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Innovation Hub
          </h1>
          <p className="text-muted-foreground">
            Where engineering students tackle real social challenges with AI-assisted development and mentorship.
          </p>
        </div>
      </div>
    </>
  );
}

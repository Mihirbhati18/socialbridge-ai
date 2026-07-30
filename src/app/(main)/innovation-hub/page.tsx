'use client';

<<<<<<< HEAD
import { Lightbulb, Hammer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function InnovationHubPage() {
  return (
    <div className="container mx-auto p-6 md:p-10 min-h-[80vh] flex flex-col items-center justify-center">
      <Card className="w-full max-w-lg bg-white/5 border-white/10 backdrop-blur-md">
        <CardContent className="pt-12 pb-12 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <Lightbulb className="w-20 h-20 text-yellow-400 opacity-80" />
            <div className="absolute -bottom-2 -right-2 bg-slate-900 rounded-full p-1.5 border border-white/10">
              <Hammer className="w-6 h-6 text-blue-400 animate-bounce" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-3">Innovation Hub</h1>
          <h2 className="text-xl text-yellow-400 mb-6 font-medium">Coming Soon!</h2>
          
          <p className="text-gray-400 max-w-md mx-auto">
            The Innovation Hub is under construction. Soon, researchers, students, and engineers will be able to propose innovative, tech-driven solutions to civic issues and find funding partners here.
          </p>
          
          <div className="mt-8 flex gap-2">
            <span className="px-3 py-1 bg-white/10 text-white rounded-full text-xs font-medium border border-white/20">Phase 2 Feature</span>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs font-medium border border-yellow-500/30">In Development</span>
          </div>
        </CardContent>
      </Card>
    </div>
=======
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
>>>>>>> origin/harsh
  );
}

'use client';

import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Briefcase, Award, Calendar, Edit3 } from 'lucide-react';

export default function ProfilePage() {
  return (
    <>
      <Topbar title="Profile" subtitle="Manage your account settings" />
      
      <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8 animate-fade-in">
        
        {/* Header Profile Card */}
        <Card className="bg-card/40 backdrop-blur-md border-white/5 overflow-hidden">
          <div className="h-32 w-full bg-gradient-to-r from-violet-600/50 via-fuchsia-600/50 to-primary/50"></div>
          <CardContent className="p-6 relative pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-violet-500 to-fuchsia-500 p-1 shadow-xl relative">
                <div className="w-full h-full bg-background rounded-xl flex items-center justify-center text-3xl font-bold text-foreground">
                  PS
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl font-bold">Dr. Priya Sharma</h1>
                <p className="text-primary font-medium">Healthcare Professional</p>
              </div>
              <Button className="shrink-0 gap-2">
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-white/10 pb-2">About</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dedicated healthcare professional with 10+ years of experience in organizing medical camps and community health initiatives. Passionate about leveraging technology to improve rural healthcare access in India.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-foreground/70" /> Mumbai, Maharashtra
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 text-foreground/70" /> priya.sharma@example.com
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-foreground/70" /> Medical Consultant, City Hospital
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b border-white/10 pb-2">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {['Healthcare Management', 'Community Outreach', 'Public Health', 'First Aid Training', 'Project Planning', 'Data Analysis'].map((skill) => (
                    <Badge key={skill} variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/10 text-sm py-1 font-normal">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <h3 className="font-semibold text-lg border-b border-white/10 pb-2 mt-6">Activity Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Award className="w-3 h-3" /> Projects Led</p>
                    <p className="text-xl font-bold">12</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 border border-white/5">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-1"><Calendar className="w-3 h-3" /> Joined</p>
                    <p className="text-xl font-bold">Mar 2024</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </>
  );
}

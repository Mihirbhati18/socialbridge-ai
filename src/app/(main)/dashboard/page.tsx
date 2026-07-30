'use client';

import { Topbar } from '@/components/layout/topbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp,
  Handshake,
  Camera,
  Search,
  FolderKanban,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  BrainCircuit,
  Heart
} from 'lucide-react';

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Dashboard" subtitle="Here's what's happening in your community" />
      
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Welcome Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
            Welcome back, Dr. Priya! 👋
          </h1>
          <p className="text-muted-foreground">
            You have 3 new partnership requests and 5 pending tasks for your ongoing projects.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Partnerships', value: '3', icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10', change: '+12%' },
            { label: 'Open Requests', value: '5', icon: MessageSquare, color: 'text-teal-400', bg: 'bg-teal-400/10', change: '+2' },
            { label: 'Civic Issues Reported', value: '8', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10', change: '+1' },
            { label: 'Impact Score', value: '92', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10', change: '+4.5%' },
          ].map((stat, i) => (
            <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5 hover:border-white/10 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-3xl font-bold text-foreground">{stat.value}</h3>
                    <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">{stat.change}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Left 2/3) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Actions */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: 'Create Collaboration', icon: Handshake, href: '/collaborate/create', gradient: 'from-violet-600/20 to-fuchsia-600/20 border-violet-500/20 hover:border-violet-500/40 text-violet-300' },
                  { title: 'Report Issue', icon: Camera, href: '/civic-issues/report', gradient: 'from-orange-600/20 to-red-600/20 border-orange-500/20 hover:border-orange-500/40 text-orange-300' },
                  { title: 'Find Partners', icon: Search, href: '/collaborate', gradient: 'from-teal-600/20 to-emerald-600/20 border-teal-500/20 hover:border-teal-500/40 text-teal-300' },
                  { title: 'View Workspace', icon: FolderKanban, href: '/workspace', gradient: 'from-blue-600/20 to-cyan-600/20 border-blue-500/20 hover:border-blue-500/40 text-blue-300' },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className={`p-4 rounded-xl border bg-gradient-to-br ${action.gradient} transition-all duration-300 flex items-center gap-4 group`}>
                      <div className="p-3 bg-background/50 rounded-lg group-hover:scale-110 transition-transform">
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="font-semibold">{action.title}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Activity</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">View All</Button>
              </div>
              <Card className="bg-card/40 backdrop-blur-md border-white/5">
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {[
                      { text: 'Hope Foundation accepted your collaboration request', time: '2 hours ago', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                      { text: 'New civic issue reported near Andheri Station', time: '4 hours ago', icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                      { text: 'AI generated 8 tasks for Eye Camp project', time: '5 hours ago', icon: BrainCircuit, color: 'text-violet-400', bg: 'bg-violet-400/10' },
                      { text: 'Blood Donation Drive reached 50 volunteers', time: '1 day ago', icon: Heart, color: 'text-red-400', bg: 'bg-red-400/10' },
                      { text: 'Tree Plantation Drive completed successfully', time: '2 days ago', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-400/10' },
                    ].map((item, i) => (
                      <div key={i} className="p-4 flex items-start gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer">
                        <div className={`p-2 rounded-full ${item.bg}`}>
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{item.text}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {item.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>

          {/* Sidebar Area (Right 1/3) */}
          <div className="space-y-8">
            
            {/* Upcoming Events */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <div className="space-y-4">
                {[
                  { title: 'Free Eye Check-up Camp', date: 'Oct 15', location: 'Andheri', tag: 'Health' },
                  { title: 'Blood Donation Drive', date: 'Oct 20', location: 'Bandra', tag: 'Medical' },
                  { title: 'Beach Cleanup Campaign', date: 'Oct 25', location: 'Juhu', tag: 'Environment' },
                ].map((event, i) => (
                  <Card key={i} className="bg-card/40 backdrop-blur-md border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer group">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold group-hover:text-primary transition-colors">{event.title}</h3>
                        <Badge variant="outline" className="text-xs bg-white/5 border-white/10">{event.tag}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {event.date}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-foreground">
                Discover More Events
              </Button>
            </div>

          </div>
          
        </div>
      </div>
    </>
  );
}

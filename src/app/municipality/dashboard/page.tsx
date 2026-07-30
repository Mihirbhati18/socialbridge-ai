"use client";

import { motion } from "framer-motion";
import { 
  Building2, Users, AlertTriangle, TrendingUp, 
  Map as MapIcon, Calendar, MessageSquare, 
  Settings, Bell, Search, BarChart3, 
  Droplets, Zap, Shield, Truck, Sparkles, 
  ArrowUpRight, Clock, MapPin, Power, Activity, Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from "recharts";

const budgetData = [
  { name: 'Jan', spent: 4000, budget: 6000 },
  { name: 'Feb', spent: 3000, budget: 6000 },
  { name: 'Mar', spent: 5000, budget: 6000 },
  { name: 'Apr', spent: 4500, budget: 6000 },
  { name: 'May', spent: 4800, budget: 6000 },
  { name: 'Jun', spent: 5500, budget: 6000 },
];

const infrastructureData = [
  { name: 'Roads & Transport', status: 85, color: '#06b6d4' },
  { name: 'Water & Sanitation', status: 92, color: '#3b82f6' },
  { name: 'Power Grid', status: 88, color: '#f59e0b' },
  { name: 'Waste Management', status: 78, color: '#10b981' },
  { name: 'Public Health', status: 95, color: '#ef4444' },
];

const incidentData = [
  { name: 'Fire', value: 12 },
  { name: 'Medical', value: 45 },
  { name: 'Traffic', value: 25 },
  { name: 'Crime', value: 8 },
  { name: 'Other', value: 10 },
];

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#64748b'];

export default function MunicipalityDashboard() {
  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-cyan-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 p-6 md:p-10 max-w-[1600px] mx-auto">
        {/* Header */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                Official Government Access
              </span>
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Live
              </span>
            </div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-black tracking-tighter"
            >
              MUNICIPALITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">COMMAND CENTER</span>
            </motion.h1>
            <p className="text-slate-500 font-medium">Urban management through AI-driven resource orchestration.</p>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                      type="text" 
                      placeholder="Search systems, zones, or reports..." 
                      className="bg-slate-900/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 w-full lg:w-80 backdrop-blur-md transition-all"
                  />
              </div>
              <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/5 bg-slate-900/50 text-white relative hover:bg-white/5">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#020617]"></span>
              </Button>
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center font-black shadow-lg shadow-cyan-500/20 border border-white/10 cursor-pointer hover:scale-105 transition-transform">
                  JS
              </div>
          </div>
        </header>

        <Tabs defaultValue="overview" className="space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-2">
            <TabsList className="bg-transparent border-none p-0 flex gap-6 h-auto">
              {[
                { value: 'overview', label: 'Overview', icon: Activity },
                { value: 'emergency', label: 'Emergency', icon: Shield },
                { value: 'infrastructure', label: 'Infrastructure', icon: Building2 },
                { value: 'budget', label: 'Fiscal', icon: BarChart3 },
              ].map((tab) => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="bg-transparent px-0 pb-4 rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:text-cyan-400 text-slate-500 font-black tracking-widest uppercase text-[10px] transition-all flex items-center gap-2"
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="text-[10px] font-black text-slate-500 tracking-widest uppercase flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> LAST SYNC: 2m AGO</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> REGION: CENTRAL ZONE</span>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-10 outline-none">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                { label: "Urban Projects", value: "32", icon: Building2, trend: "+4", color: "text-cyan-400", bg: "bg-cyan-500/10", glow: "shadow-cyan-500/20", border: "border-cyan-500/20" },
                { label: "Active Reports", value: "248", icon: MessageSquare, trend: "-12", color: "text-indigo-400", bg: "bg-indigo-500/10", glow: "shadow-indigo-500/20", border: "border-indigo-500/20" },
                { label: "System Alerts", value: "05", icon: AlertTriangle, trend: "+1", color: "text-rose-400", bg: "bg-rose-500/10", glow: "shadow-rose-500/20", border: "border-rose-500/20" },
                { label: "Public Sentiment", value: "92%", icon: TrendingUp, trend: "+2%", color: "text-emerald-400", bg: "bg-emerald-500/10", glow: "shadow-emerald-500/20", border: "border-emerald-500/20" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ y: -8 }}
                >
                  <Card className={`bg-slate-900/60 border-white/10 backdrop-blur-3xl rounded-[2.5rem] border overflow-hidden group relative shadow-2xl transition-all duration-500 hover:border-white/20`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Animated side glow */}
                    <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-${stat.color.split('-')[1]}-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                    
                    <CardContent className="p-8 relative z-10">
                      <div className="flex items-center justify-between mb-8">
                        <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center group-hover:scale-110 transition-transform border ${stat.border} shadow-lg ${stat.glow}`}>
                          <stat.icon className={`w-7 h-7 ${stat.color}`} />
                        </div>
                        <div className={`text-[9px] font-black ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} px-3 py-1.5 rounded-xl border tracking-tighter`}>
                          {stat.trend}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                        <h3 className="text-5xl font-black text-white tracking-tighter italic group-hover:translate-x-1 transition-transform">{stat.value}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
               <motion.div
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="lg:col-span-2"
               >
                 <Card className="bg-slate-900/60 border-white/10 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-white/5 flex flex-row items-center justify-between">
                       <div>
                         <CardTitle className="text-xl font-black text-white italic">INFRASTRUCTURE HEALTH SCAN</CardTitle>
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Real-time AI Diagnostic Terminal</p>
                       </div>
                       <div className="flex gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse delay-75"></div>
                          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
                       </div>
                    </CardHeader>
                    <CardContent className="p-8 h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={infrastructureData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                          <YAxis stroke="#475569" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                            itemStyle={{ color: '#06b6d4' }}
                          />
                          <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                 </Card>
               </motion.div>

               <motion.div
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
               >
                 <Card className="bg-slate-900/60 border-white/10 backdrop-blur-2xl rounded-[3rem] overflow-hidden shadow-2xl h-full">
                    <CardHeader className="p-8 border-b border-white/5">
                       <CardTitle className="text-xl font-black text-white italic text-center">EMERGENCY PROTOCOLS</CardTitle>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1 text-center">Active Department Response</p>
                    </CardHeader>
                    <CardContent className="p-8">
                       <div className="space-y-6">
                         {[
                           { dept: "FIRE & RESCUE", status: "READY", color: "bg-rose-500", glow: "shadow-rose-500/40" },
                           { dept: "MEDICAL UNITS", status: "DISPATCHED", color: "bg-emerald-500", glow: "shadow-emerald-500/40" },
                           { dept: "CIVIL DEFENSE", status: "STANDBY", color: "bg-amber-500", glow: "shadow-amber-500/40" },
                           { dept: "WASTE MGMT", status: "OPTIMIZED", color: "bg-cyan-500", glow: "shadow-cyan-500/40" },
                         ].map((p, idx) => (
                           <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                              <span className="text-[10px] font-black text-slate-300 tracking-wider">{p.dept}</span>
                              <div className="flex items-center gap-3">
                                <span className="text-[9px] font-black text-slate-500">{p.status}</span>
                                <div className={`w-3 h-3 rounded-full ${p.color} ${p.glow} shadow-lg animate-pulse`}></div>
                              </div>
                           </div>
                         ))}
                       </div>
                       
                       <Button className="w-full mt-10 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20 group">
                         LAUNCH COMMAND OVERRIDE
                         <Zap className="w-4 h-4 ml-2 group-hover:scale-125 transition-transform" />
                       </Button>
                    </CardContent>
                 </Card>
               </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Fiscal Tracking */}
              <Card className="lg:col-span-2 bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2rem] overflow-hidden border">
                <CardHeader className="p-8 flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle className="text-xl font-black text-white tracking-tight">CITY FISCAL FLOW</CardTitle>
                    <CardDescription className="text-slate-500 font-medium">Monthly expenditure vs allocated budget (USD)</CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-xl border-white/10 text-xs font-bold px-4 h-10">
                    Full Report <ArrowUpRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="h-[350px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={budgetData}>
                        <defs>
                          <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={10}
                          tick={{ fontWeight: 800 }}
                        />
                        <YAxis 
                          stroke="#475569" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          dx={-10}
                          tick={{ fontWeight: 800 }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="spent" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSpent)" strokeWidth={4} />
                        <Area type="monotone" dataKey="budget" stroke="#475569" fillOpacity={0} strokeDasharray="8 8" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Resource Distribution */}
              <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2rem] border overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black text-white tracking-tight text-center">EMERGENCY LOAD</CardTitle>
                  <CardDescription className="text-slate-500 font-medium text-center">Active incident distribution</CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex flex-col items-center">
                  <div className="h-[220px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incidentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {incidentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full space-y-3 mt-6">
                    {incidentData.slice(0, 3).map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
                          <span className="text-xs font-bold text-slate-300">{item.name} Responses</span>
                        </div>
                        <span className="text-xs font-black text-white">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Infrastructure & Utilities Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-1 bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2rem] border overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-cyan-400" /> INFRA HEALTH
                  </CardTitle>
                  <CardDescription className="text-slate-500 font-medium">Critical urban system integrity</CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 space-y-8">
                  {infrastructureData.map((item, i) => (
                    <div key={i} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black text-slate-300 uppercase tracking-wider">{item.name}</span>
                        <span className="text-xs font-black text-white" style={{ color: item.color }}>{item.status}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.status}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className="h-full rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                  <Button className="w-full bg-white text-black font-black text-[10px] tracking-[0.2em] rounded-2xl h-14 hover:bg-cyan-400 transition-colors uppercase">
                    Audit Urban Assets
                  </Button>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2rem] border overflow-hidden">
                  <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        <Power className="w-5 h-5 text-amber-400" /> SMART GRID
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="p-8 rounded-[2rem] bg-slate-950/50 border border-white/5 text-center mb-6">
                        <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4 animate-pulse" />
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Grid Load Factor</p>
                        <h4 className="text-5xl font-black text-white">4.82<span className="text-xl text-slate-500">GW</span></h4>
                        <div className="flex items-center justify-center gap-2 mt-4">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">+2.4% Optimal</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">RENEWABLE</p>
                        <p className="text-lg font-black text-white">42%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-[10px] text-slate-500 font-bold mb-1">RESERVE</p>
                        <p className="text-lg font-black text-white">18%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-900/40 border-white/5 backdrop-blur-xl rounded-[2rem] border overflow-hidden">
                  <CardHeader className="p-8">
                    <CardTitle className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                        <Truck className="w-5 h-5 text-indigo-400" /> LOGISTICS FLOW
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 pt-0">
                    <div className="space-y-4">
                        {[
                          { zone: 'Sector 4: Waste Collection', status: 'COMPLETED', time: '12m ago', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                          { zone: 'Main St: Light Repair', status: 'IN PROGRESS', time: 'Active', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                          { zone: 'North Terminal: Transit', status: 'DELAYED', time: '4m lag', color: 'text-red-500', bg: 'bg-red-500/10' },
                          { zone: 'Water Tower B: Refill', status: 'QUEUED', time: 'Scheduled', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                        ].map((log, i) => (
                          <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-white leading-none">{log.zone}</p>
                              <p className="text-[10px] text-slate-500 font-medium">{log.time}</p>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-md ${log.bg} ${log.color}`}>
                              {log.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="emergency" className="outline-none">
            <div className="relative py-20 px-8 rounded-[3rem] bg-gradient-to-br from-red-600/10 to-transparent border border-red-500/20 overflow-hidden text-center backdrop-blur-md">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-red-500/20 animate-pulse">
                    <Shield className="w-12 h-12 text-red-500" />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 tracking-tight">EMERGENCY PROTOCOL TERMINAL</h3>
                  <p className="text-slate-400 max-w-xl mx-auto mb-10 text-lg font-medium">
                    Deploy rapid response teams, manage real-time incidents, and coordinate multi-agency operations from this secure terminal.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <Button className="bg-red-600 hover:bg-red-700 text-white px-12 h-16 rounded-[2rem] font-black text-lg shadow-2xl shadow-red-600/30 transition-all active:scale-95 uppercase tracking-widest">
                      Initiate Protocol
                    </Button>
                    <Button variant="outline" className="h-16 px-10 rounded-[2rem] border-white/10 text-white font-bold bg-white/5 hover:bg-white/10 uppercase tracking-widest">
                      Deploy Resource Scan
                    </Button>
                  </div>
                </div>
                
                {/* Decorative background scan lines */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="h-px bg-red-500 my-8 w-full"></div>
                  ))}
                </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 pb-12">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg">
                    <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-black text-white tracking-tighter">SOCIALBRIDGE AI • MUNICIPAL SYSTEMS</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-[10px] font-black text-slate-600 tracking-[0.2em] uppercase">
                <a href="#" className="hover:text-cyan-400 transition-colors">Internal Ops</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Cyber Policy</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">Access Logs</a>
                <span className="flex items-center gap-2">STATUS: <span className="text-emerald-500">OPERATIONAL</span></span>
            </div>
        </footer>
      </div>
    </div>
  );
}

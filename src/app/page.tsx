"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { 
  Brain, Layout, MapPin, Users, Store, Lightbulb, 
  ArrowRight, Play, Heart, Shield, Target, Zap,
  Building, GraduationCap, Stethoscope, Briefcase, Landmark,
  Globe, Sparkles, Rocket, CheckCircle2, Award, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.9]);

  useEffect(() => {
    setMounted(true);
    console.log("LandingPage mounted");
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="text-cyan-500 animate-pulse font-black tracking-tighter text-2xl">CONCORD</div>
    </div>;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-slate-50 selection:bg-cyan-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[100px]" />
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        {/* Border Beams for Hero Background Effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-cyan-500/20 animate-[spin_20s_linear_infinite]"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-indigo-500/20 animate-[spin_15s_linear_infinite_reverse]"></div>
        </div>

        {/* Noise overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">
                CONCORD
              </span>
              <span className="text-[10px] font-bold text-cyan-400 tracking-[0.2em]">AI PLATFORM</span>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center gap-10 text-sm font-semibold text-slate-400">
            {['Features', 'Solutions', 'Impact', 'Partners'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-cyan-400 transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:width-full"></span>
              </a>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link href="/auth/login" className="hidden sm:block text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/auth/login" className="px-6 py-2.5 text-sm font-bold text-white rounded-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all hover:-translate-y-0.5 active:scale-95">
              Launch App
            </Link>
          </motion.div>
        </div>
      </nav>

      <main className="relative z-10 pt-32">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-400 mb-10 tracking-widest uppercase"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Next-Gen Civic Collaboration
          </motion.div>
          
          <motion.h1 
            style={{ opacity, scale }}
            className="text-6xl md:text-8xl font-black tracking-tight mb-8 max-w-5xl bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-500"
          >
            Where AI Meets <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-400">
              Social Change
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed"
          >
            Empower your community with our AI-driven ecosystem. Connecting citizens, NGOs, and government to solve real-world problems through data-backed partnerships.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <Link href="/auth/login" className="group relative w-full sm:w-auto px-10 py-5 text-base font-black text-white rounded-2xl bg-cyan-500 overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/25">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 opacity-100 group-hover:opacity-0 transition-opacity"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="relative flex items-center justify-center gap-3">
                Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto px-10 py-5 text-base font-bold text-slate-300 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md">
              <Play className="w-5 h-5 text-cyan-400" /> View Roadmap
            </Link>
          </motion.div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-1/4 left-10 p-4 rounded-2xl bg-slate-900/50 border border-cyan-500/20 backdrop-blur-md hidden xl:block shadow-2xl shadow-cyan-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Impact Score</div>
                  <div className="text-sm font-black text-white">98.4% Accuracy</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-1/4 right-10 p-4 rounded-2xl bg-slate-900/50 border border-indigo-500/20 backdrop-blur-md hidden xl:block shadow-2xl shadow-indigo-500/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">AI Engine</div>
                  <div className="text-sm font-black text-white">Smart Match Active</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section with Glassmorphism */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { label: 'Verified NGOs', value: '1.2K+', icon: Shield, color: 'text-cyan-400' },
                { label: 'Total Funding', value: '$45M+', icon: Target, color: 'text-indigo-400' },
                { label: 'Volunteers', value: '150K+', icon: Users, color: 'text-violet-400' },
                { label: 'Projects Done', value: '8.5K+', icon: Award, color: 'text-emerald-400' },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-[2rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                  <stat.icon className={`w-8 h-8 ${stat.color} mb-6 opacity-80`} />
                  <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Scrolling Ticker */}
        <div className="py-12 border-y border-white/5 bg-slate-950/30 overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-16 px-8">
                {['MUNICIPALITY COMMAND', 'AI MATCHING', 'CIVIC TRACKER', 'IMPACT VERIFIER', 'NGO COLLAB', 'SMART GOVERNANCE'].map((text) => (
                  <span key={text} className="text-4xl md:text-6xl font-black text-white/5 hover:text-cyan-500/20 transition-colors cursor-default select-none">
                    {text}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid - Modern Design */}
        <section id="features" className="py-32 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
              <div className="max-w-2xl">
                <div className="text-cyan-400 font-black text-xs tracking-[0.3em] uppercase mb-4">Core Capabilities</div>
                <h2 className="text-4xl md:text-6xl font-black text-white">
                  Intelligent Tools for <span className="text-slate-500">Global Impact.</span>
                </h2>
              </div>
              <p className="text-slate-400 max-w-sm text-sm font-medium leading-relaxed">
                Our platform leverages advanced AI models to bridge the gap between social needs and resource availability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { 
                  icon: Brain, 
                  title: 'AI Partnership Engine', 
                  desc: 'Proprietary matching algorithms that connect organizations based on synergy, capacity, and historical impact data.',
                  gradient: 'from-cyan-500/20 to-indigo-500/20'
                },
                { 
                  icon: Layout, 
                  title: 'Governance Dashboard', 
                  desc: 'A unified command center for municipalities to track civic issues, budget allocation, and infrastructure health in real-time.',
                  gradient: 'from-indigo-500/20 to-violet-500/20'
                },
                { 
                  icon: MapPin, 
                  title: 'Hyper-Local Reporting', 
                  desc: 'Precise civic issue reporting with AI-powered categorization and priority routing to the correct department.',
                  gradient: 'from-violet-500/20 to-fuchsia-500/20'
                },
                { 
                  icon: Users, 
                  title: 'Resource Orchestration', 
                  desc: 'Seamlessly coordinate volunteers and professionals. Match talent to tasks where they can make the most difference.',
                  gradient: 'from-fuchsia-500/20 to-rose-500/20'
                },
                { 
                  icon: Shield, 
                  title: 'Verification Protocol', 
                  desc: 'Multi-layer verification for NGOs and projects ensuring that funding and efforts reach legitimate social causes.',
                  gradient: 'from-rose-500/20 to-orange-500/20'
                },
                { 
                  icon: Zap, 
                  title: 'Real-time Analytics', 
                  desc: 'Instant visualization of social impact metrics. Transform raw data into actionable insights for stakeholders.',
                  gradient: 'from-orange-500/20 to-cyan-500/20'
                },
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="group p-10 rounded-[2.5rem] bg-slate-900/50 border border-white/5 hover:border-cyan-500/50 transition-all duration-500"
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-8">{feature.desc}</p>
                  <Link href="/auth/login" className="flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:gap-4 transition-all">
                    LEARN MORE <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Visualizer Section */}
        <section className="py-32 bg-slate-950/50 backdrop-blur-3xl relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 blur-[150px] rounded-full pointer-events-none"></div>
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div>
                <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]">
                  Visualizing <br/>
                  <span className="text-cyan-400">Social Synergy.</span>
                </h2>
                <div className="space-y-8">
                  {[
                    { title: 'Data Integration', desc: 'Connecting diverse data streams from civic sensors to public reports.' },
                    { title: 'Pattern Recognition', desc: 'AI identifies recurring social issues before they become crises.' },
                    { title: 'Outcome Verification', desc: 'Blockchain-backed proof of impact for every dollar and hour spent.' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-cyan-400 font-black group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                        {i + 1}
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-square rounded-[3rem] overflow-hidden bg-slate-900 border border-white/10 relative shadow-2xl shadow-cyan-500/10">
                  {/* Mock UI/Visualization */}
                  <div className="absolute inset-0 p-8 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                        <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Active Projects</div>
                        <div className="text-2xl font-black text-white">2,842</div>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center animate-pulse">
                        <Rocket className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    
                    <div className="flex gap-4 items-end">
                      <div className="flex-1 h-32 bg-cyan-500/20 rounded-xl relative overflow-hidden">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: '70%' }}
                          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-cyan-500 to-indigo-500"
                        />
                      </div>
                      <div className="flex-1 h-48 bg-indigo-500/20 rounded-xl relative overflow-hidden">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: '85%' }}
                          transition={{ delay: 0.1 }}
                          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-indigo-500 to-violet-500"
                        />
                      </div>
                      <div className="flex-1 h-40 bg-violet-500/20 rounded-xl relative overflow-hidden">
                        <motion.div 
                          initial={{ height: 0 }}
                          whileInView={{ height: '60%' }}
                          transition={{ delay: 0.2 }}
                          className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-violet-500 to-fuchsia-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative blobs */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-500/30 blur-[80px] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Ultra Modern */}
        <section className="py-40">
          <div className="container mx-auto px-6">
            <motion.div 
              whileHover={{ scale: 1.01 }}
              className="relative rounded-[4rem] p-16 md:p-24 overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 shadow-2xl shadow-cyan-500/5"
            >
              <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-500/10 blur-[120px] rounded-full -mr-80 -mt-80"></div>
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] rounded-full -ml-80 -mb-80"></div>
              
              <div className="relative z-10 max-w-3xl mx-auto text-center">
                <h2 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-tighter">
                  Start Building <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 italic">Tomorrow, Today.</span>
                </h2>
                <p className="text-xl text-slate-400 mb-12 font-medium">
                  Join the global network of change-makers using AI to create measurable, sustainable social impact. No registration fees, just results.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <Link href="/auth/login" className="w-full sm:w-auto px-12 py-6 text-lg font-black text-white rounded-2xl bg-white text-black hover:bg-cyan-400 transition-colors shadow-xl">
                    CREATE ACCOUNT
                  </Link>
                  <Link href="/auth/login" className="w-full sm:w-auto px-12 py-6 text-lg font-bold text-white rounded-2xl border border-white/10 hover:bg-white/5 transition-all">
                    CONTACT SALES
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#020617] py-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">CONCORD</span>
              </div>
              <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
                The world's first AI-powered platform designed specifically for civic engagement and cross-sector social collaboration.
              </p>
              <div className="flex gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-cyan-500 transition-colors cursor-pointer">
                    <div className="w-4 h-4 bg-slate-500"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-8">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Partnership Engine</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Municipality Dashboard</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Civic Reporting</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-8">Company</h4>
              <ul className="space-y-4 text-sm text-slate-500">
                <li><a href="#" className="hover:text-cyan-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Impact Report</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cyan-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-600 tracking-widest uppercase">
            <p>© 2026 CONCORD. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-1">
              MADE WITH <Heart className="w-4 h-4 text-rose-500" /> FOR THE FUTURE
            </div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}} />
    </div>
  );
}

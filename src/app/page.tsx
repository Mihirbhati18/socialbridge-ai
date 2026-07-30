"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Brain, Layout, MapPin, Users, Store, Lightbulb, 
  ArrowRight, Play, Heart, Shield, Target, Zap,
  Building, GraduationCap, Stethoscope, Briefcase, Landmark
} from "lucide-react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50 selection:bg-violet-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-teal-600/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">
              SocialBridge
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs font-semibold border border-white/20">
              AI
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
          </div>
          <Link href="/dashboard" className="px-5 py-2 text-sm font-semibold text-white rounded-full bg-gradient-to-r from-violet-600 to-teal-600 hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-24">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-slate-300 mb-8 animate-[fade-in-up_1s_ease-out]">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            Platform is live and scaling
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl animate-[fade-in-up_1s_ease-out_0.2s_both]">
            Transform Good Intentions Into <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-teal-400">
              Measurable Impact
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 animate-[fade-in-up_1s_ease-out_0.4s_both]">
            AI-powered platform connecting citizens, NGOs, schools, hospitals, and government to solve social problems through intelligent partnerships.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 animate-[fade-in-up_1s_ease-out_0.6s_both]">
            <Link href="/collaborate" className="w-full sm:w-auto px-8 py-4 text-base font-bold text-white rounded-full bg-gradient-to-r from-violet-600 to-teal-600 hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_30px_rgba(139,92,246,0.5)] flex items-center justify-center gap-2">
              Start Collaborating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 text-base font-bold text-slate-300 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <Play className="w-5 h-5" /> Watch Demo
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-4xl mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md animate-[fade-in-up_1s_ease-out_0.8s_both]">
            {[
              { label: 'Organizations', value: '500+' },
              { label: 'Collaborations', value: '1,200+' },
              { label: 'Lives Impacted', value: '50K+' },
              { label: 'Success Rate', value: '98%' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                <span className="text-3xl font-bold text-white mb-1">{stat.value}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* User Types Scroll */}
        <section className="py-10 border-y border-white/10 bg-black/20">
          <div className="container mx-auto px-6 mb-6 text-center">
            <h3 className="text-sm uppercase tracking-widest text-slate-500 font-semibold">Built for Everyone</h3>
          </div>
          <div className="flex overflow-hidden relative w-full">
            <div className="flex space-x-6 animate-[scroll_40s_linear_infinite] whitespace-nowrap px-4 w-max">
              {/* Double up for seamless scrolling effect */}
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex space-x-6">
                  {[
                    { name: 'Citizens', icon: Users, color: 'text-blue-400' },
                    { name: 'NGOs', icon: Heart, color: 'text-rose-400' },
                    { name: 'Schools', icon: GraduationCap, color: 'text-yellow-400' },
                    { name: 'Hospitals', icon: Stethoscope, color: 'text-emerald-400' },
                    { name: 'Companies', icon: Building, color: 'text-indigo-400' },
                    { name: 'Government', icon: Landmark, color: 'text-slate-400' },
                    { name: 'Volunteers', icon: Zap, color: 'text-amber-400' },
                    { name: 'Professionals', icon: Briefcase, color: 'text-teal-400' },
                    { name: 'Students', icon: Lightbulb, color: 'text-violet-400' },
                  ].map((type, j) => (
                    <div key={j} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
                      <type.icon className={`w-4 h-4 ${type.color}`} />
                      <span className="text-sm font-medium">{type.name}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">
                Powered by AI, Built for Impact
              </h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Everything you need to orchestrate successful social initiatives from idea to execution.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Brain, title: 'AI Partnership Engine', desc: 'Find the perfect collaboration partners with AI scoring based on experience, reliability, and community ratings.' },
                { icon: Layout, title: 'Smart Workspace', desc: 'AI-powered project management with auto-generated tasks, documents, and meeting summaries.' },
                { icon: MapPin, title: 'Civic Issue Reporting', desc: 'Report community issues with photos and GPS. Track resolution in real-time.' },
                { icon: Users, title: 'Volunteer Matching', desc: 'Connect professionals and volunteers with organizations that need their specific skills.' },
                { icon: Store, title: 'Vendor Marketplace', desc: 'Find trusted vendors for events with AI-powered recommendations and reviews.' },
                { icon: Lightbulb, title: 'Innovation Hub', desc: 'Engineering students solve real social problems with AI-assisted development and mentorship.' },
              ].map((feature, i) => (
                <div key={i} className="group relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(139,92,246,0.1)]">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-teal-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-24 relative bg-black/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">From an idea to measurable community impact in 4 simple steps.</p>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div className="hidden md:block absolute top-8 left-0 w-full h-1 bg-gradient-to-r from-violet-600/30 via-teal-600/30 to-violet-600/30 rounded-full"></div>
              
              <div className="grid md:grid-cols-4 gap-10">
                {[
                  { title: 'Describe Your Initiative', desc: 'Post what you want to achieve or the problem you want to solve.' },
                  { title: 'AI Finds Partners', desc: 'Smart matching connects you with organizations that have a proven track record.' },
                  { title: 'Collaborate Together', desc: 'Use our shared workspace with AI assistance to plan and execute.' },
                  { title: 'Create Impact', desc: 'Track your results, verify outcomes, and grow your network.' },
                ].map((step, i) => (
                  <div key={i} className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-violet-500 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(139,92,246,0.3)] text-xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-violet-400 to-teal-400">
                      {i + 1}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-24">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Real Impact, Real Numbers
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Events Organized', value: '200+', icon: Target },
                { label: 'Partners Connected', value: '500+', icon: Users },
                { label: 'Lives Impacted', value: '50,000+', icon: Heart },
                { label: 'Cities Active', value: '25+', icon: MapPin },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-3xl bg-gradient-to-b from-white/5 to-transparent border border-white/10 hover:border-teal-500/30 transition-colors">
                  <stat.icon className="w-8 h-8 text-teal-400 mx-auto mb-4 opacity-80" />
                  <div className="text-4xl md:text-5xl font-extrabold text-white mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-slate-400 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="relative rounded-3xl p-12 overflow-hidden text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-slate-900 to-teal-600/20 border border-white/10 rounded-3xl backdrop-blur-md"></div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-violet-600/20 blur-[100px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Make a Difference?</h2>
                <p className="text-lg text-slate-300 mb-10">
                  Join SocialBridge AI and start creating measurable impact in your community today. Whether you're a citizen, NGO, or corporation, we have the tools you need.
                </p>
                <Link href="/dashboard" className="inline-block px-10 py-5 text-lg font-bold text-white rounded-full bg-gradient-to-r from-violet-600 to-teal-600 hover:opacity-90 transition-all hover:scale-105 shadow-[0_0_40px_rgba(139,92,246,0.6)]">
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 relative z-10">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-teal-400">
              SocialBridge
            </span>
            <span className="text-xs font-semibold text-slate-500">AI</span>
          </div>
          
          <div className="text-slate-500 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-rose-500" /> for social impact
          </div>

          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">About</a>
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Basic inline styles for animations that tailwind might not have by default */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}

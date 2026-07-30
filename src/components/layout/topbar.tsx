'use client';

import { Search, Bell } from 'lucide-react';
import Link from 'next/link';

interface TopbarProps {
  title: string;
  subtitle?: string;
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-background/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between px-6">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {subtitle && <span className="text-xs text-muted-foreground">{subtitle}</span>}
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search communities, projects..."
            className="w-64 md:w-80 h-9 bg-white/5 border border-white/10 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all placeholder:text-muted-foreground/70"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
          </button>
          
          <Link href="/profile" className="hidden md:block w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 cursor-pointer shadow-md hover:shadow-lg transition-shadow border border-white/20">
            {/* Avatar placeholder */}
          </Link>
        </div>
      </div>
    </header>
  );
}

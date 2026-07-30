'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileWarning, 
  BarChart3, 
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'All Issues', href: '/dashboard/issues', icon: FileWarning },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export default function GovSidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed top-0 left-0 h-screen w-72 bg-[#0a0f1c] border-r border-blue-900/30 hidden lg:flex flex-col z-50">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent block">SocialBridge</span>
            <span className="text-[10px] tracking-widest text-blue-400 font-semibold uppercase">Gov Portal</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-blue-900/30">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/5 mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
            AM
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Arjun Mehta</p>
            <p className="text-xs text-blue-400 truncate">BMC Official</p>
          </div>
        </div>
        
        <Link href="/" className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 hover:text-white transition-colors rounded-lg hover:bg-white/5">
          <LogOut className="w-4 h-4" />
          <span>Exit Portal</span>
        </Link>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Handshake,
  FolderKanban,
  MapPin,
  Lightbulb,
  Store,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useState } from 'react';

import { useSession, signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Discover', href: '/discover', icon: Compass },
  { name: 'Collaborate', href: '/collaborate', icon: Handshake },
  { name: 'My Partnerships', href: '/partnerships', icon: FolderKanban },
  { name: 'Civic Issues', href: '/civic-issues', icon: MapPin },
  { name: 'Innovation Hub', href: '/innovation-hub', icon: Lightbulb },
  { name: 'Vendors', href: '/vendors', icon: Store },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const userName = session?.user?.name || 'Citizen';
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <>
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background/80 backdrop-blur-md rounded-md border border-white/10"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[280px] bg-card/80 backdrop-blur-xl border-r border-white/10 flex flex-col transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center gap-2 p-6 h-20 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-primary bg-clip-text text-transparent">
              SocialBridge
            </h1>
            <span className="px-2 py-0.5 text-xs font-bold bg-primary/20 text-primary rounded-md border border-primary/30">
              AI
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/20 text-primary border-l-2 border-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'opacity-70'} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 mt-auto">
          <Link
            href="/profile"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold shadow-lg">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground truncate">{session?.user?.email || 'Citizen'}</p>
            </div>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="mt-2 w-full flex items-center justify-center gap-2 p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} />
            <span className="text-sm font-medium">Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

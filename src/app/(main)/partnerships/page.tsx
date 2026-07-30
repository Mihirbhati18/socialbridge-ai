'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import { formatCategoryLabel } from '@/lib/categories';

export default function PartnershipsPage() {
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPartnerships = async () => {
      try {
        const res = await fetch('/api/partnerships');
        if (res.ok) {
          const data = await res.json();
          setPartnerships(data);
        }
      } catch (error) {
        console.error('Failed to fetch partnerships', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPartnerships();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 md:p-10 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            My Partnerships
          </h1>
          <p className="text-gray-400 mt-2">Active collaboration workspaces</p>
        </div>
        <Link href="/collaborate">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
            Find Partners
          </Button>
        </Link>
      </div>

      {partnerships.length === 0 ? (
        <div className="text-center text-gray-400 mt-20">
          <Briefcase className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg mb-2">No active partnerships yet.</p>
          <p className="text-sm mb-6">Accept an AI-recommended partner from a collaboration request.</p>
          <Link href="/collaborate">
            <Button className="bg-gradient-to-r from-blue-600 to-emerald-600">
              Browse Collaborations
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partnerships.map((p) => {
            const orgs = p.orgs || [];
            const orgNames = orgs
              .map((o: any) => o.org?.name || o.organization?.name)
              .filter(Boolean)
              .join(' & ');
            const taskCount = p._count?.tasks || 0;
            const title = p.request?.title || p.collabRequest?.title || 'Collaboration Project';
            const category = p.request?.category || p.collabRequest?.category;

            return (
              <Card
                key={p.id}
                className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden hover:bg-white/10 transition-all duration-300 group"
              >
                <CardHeader className="pb-3 border-b border-white/5">
                  <div className="flex justify-between items-start mb-2">
                    <Badge
                      variant={p.status === 'ACTIVE' ? 'default' : 'secondary'}
                      className={
                        p.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border-emerald-500/50'
                          : ''
                      }
                    >
                      {p.status}
                    </Badge>
                    <span className="text-xs text-gray-400 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(p.startDate || p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-xl text-white truncate group-hover:text-emerald-300 transition-colors">
                    {title}
                  </CardTitle>
                  {category && (
                    <p className="text-xs text-gray-500 mt-1">{formatCategoryLabel(category)}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-4 pb-2">
                  <div className="flex items-center text-sm text-gray-300 mb-4">
                    <Users className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="truncate">{orgNames || 'Multiple Organizations'}</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Tasks</span>
                      <span>{taskCount}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all"
                        style={{ width: taskCount > 0 ? `${Math.min(100, taskCount * 10)}%` : '8%' }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-4">
                  <Link href={`/workspace/${p.id}`} className="w-full">
                    <Button
                      variant="secondary"
                      className="w-full bg-white/10 hover:bg-white/20 text-white border-0 group-hover:bg-gradient-to-r group-hover:from-blue-600/80 group-hover:to-emerald-600/80 transition-all"
                    >
                      Open Workspace <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

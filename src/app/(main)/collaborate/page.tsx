'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { COLLAB_CATEGORIES, formatCategoryLabel } from '@/lib/categories';

export default function CollaboratePage() {
  const [collabs, setCollabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    fetchCollabs();
  }, [categoryFilter, statusFilter]);

  const fetchCollabs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'All') params.append('category', categoryFilter);
      if (statusFilter !== 'All') params.append('status', statusFilter);

      const res = await fetch(`/api/collaborations?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setCollabs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const slug = category.toLowerCase();
    const colors: Record<string, string> = {
      medical_camp: 'bg-red-100 text-red-800',
      blood_donation: 'bg-rose-100 text-rose-800',
      education: 'bg-blue-100 text-blue-800',
      environment: 'bg-green-100 text-green-800',
      tree_plantation: 'bg-emerald-100 text-emerald-800',
      cleanup: 'bg-teal-100 text-teal-800',
      mentorship: 'bg-violet-100 text-violet-800',
      csr: 'bg-amber-100 text-amber-800',
    };
    return colors[slug] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Collaboration Marketplace
          </h1>
          <p className="text-gray-600 mt-2">
            Find and partner with verified organizations for high-impact social initiatives.
          </p>
        </div>
        <Link href="/collaborate/create">
          <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
            Create Request
          </Button>
        </Link>
      </div>

      <div className="flex gap-4 items-center flex-wrap">
        <select
          className="border border-gray-200 rounded-md p-2 bg-white/50 backdrop-blur"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="All">All Categories</option>
          {COLLAB_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-md p-2 bg-white/50 backdrop-blur"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      ) : collabs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          No collaboration requests found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collabs.map((collab: any) => (
            <Card
              key={collab.id}
              className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white/60 backdrop-blur-sm border-white/40"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className={getCategoryColor(collab.category)}>
                    {formatCategoryLabel(collab.category)}
                  </Badge>
                  <Badge
                    variant={collab.status === 'OPEN' ? 'default' : 'secondary'}
                    className={collab.status === 'OPEN' ? 'bg-indigo-600 text-white' : ''}
                  >
                    {collab.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold line-clamp-2">{collab.title}</CardTitle>
                <div className="text-sm text-gray-500 flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4" />
                  <span className="truncate">{collab.creator?.name || 'Unknown'}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2 text-sm mb-4">{collab.description}</p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-indigo-500" />
                    <span>{collab.city || 'Remote / Unspecified'}</span>
                  </div>
                  {collab.eventDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      <span>{new Date(collab.eventDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {collab.requiredPartners
                    ?.split(',')
                    .filter(Boolean)
                    .map((p: string) => (
                      <span
                        key={p}
                        className="text-xs px-2 py-1 bg-gray-100 rounded-md text-gray-600 font-medium"
                      >
                        {p.trim()}
                      </span>
                    ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href={`/collaborate/${collab.id}`} className="w-full">
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200 transition-colors"
                  >
                    View Details
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

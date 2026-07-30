'use client';

import { useState, useEffect } from 'react';
import { 
  FileWarning, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Link from 'next/link';

export default function GovernmentDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/government/dashboard')
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load stats', err);
        setLoading(false);
      });
  }, []);

  const updateIssueStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/civic-issues/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      // Optimistically update local state for demo
      setStats((prev: any) => ({
        ...prev,
        recentIssues: prev.recentIssues.map((i: any) => i.id === id ? { ...i, status } : i)
      }));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return <div className="flex h-[80vh] items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  }

  const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">OPEN</span>;
      case 'ASSIGNED': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">ASSIGNED</span>;
      case 'IN_PROGRESS': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">IN PROGRESS</span>;
      case 'RESOLVED': return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">RESOLVED</span>;
      default: return <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">City Operations Dashboard</h1>
        <p className="text-blue-400/80">Overview of civic issues and department performance</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Total Issues</h3>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><FileWarning className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.totalIssues || 0}</p>
        </div>
        <div className="bg-white/[0.02] border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Open & Unassigned</h3>
            <div className="p-2 bg-red-500/10 rounded-lg text-red-400"><AlertCircle className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.openIssues || 0}</p>
        </div>
        <div className="bg-white/[0.02] border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">In Progress</h3>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Clock className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.inProgressIssues || 0}</p>
        </div>
        <div className="bg-white/[0.02] border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-400 text-sm font-medium">Resolved (30d)</h3>
            <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><CheckCircle2 className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-bold text-white">{stats?.resolvedIssues || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-1 bg-white/[0.02] border border-blue-900/30 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-6">Issues by Category</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.categoryBreakdown || []} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0a0f1c', borderColor: '#1e3a8a', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {(stats?.categoryBreakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Issues Table */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-blue-900/30 rounded-2xl backdrop-blur-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-blue-900/30 flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Actionable Issues</h3>
            <Link href="/dashboard/issues" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.02] text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Issue</th>
                  <th className="px-6 py-4 font-medium">Category</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-900/20">
                {stats?.recentIssues?.map((issue: any) => (
                  <tr key={issue.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white mb-1">{issue.title}</div>
                      <div className="text-xs text-gray-500">ID: {issue.id} • {issue.reporter}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{issue.category}</td>
                    <td className="px-6 py-4">{getStatusBadge(issue.status)}</td>
                    <td className="px-6 py-4 text-gray-400">{new Date(issue.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="inline-flex items-center group relative">
                        <button className="text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-500/30 hover:bg-blue-500/10 transition-colors flex items-center gap-2 text-xs font-medium">
                          Update <ChevronDown className="w-3 h-3" />
                        </button>
                        {/* Simple dropdown mock */}
                        <div className="absolute right-0 top-full mt-1 w-36 bg-[#0a0f1c] border border-blue-900/50 rounded-xl shadow-xl hidden group-hover:block z-10 overflow-hidden">
                          <button onClick={() => updateIssueStatus(issue.id, 'ASSIGNED')} className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-white/10 hover:text-white">Assign Staff</button>
                          <button onClick={() => updateIssueStatus(issue.id, 'IN_PROGRESS')} className="w-full text-left px-4 py-2 text-xs text-blue-400 hover:bg-white/10">Mark In Progress</button>
                          <button onClick={() => updateIssueStatus(issue.id, 'RESOLVED')} className="w-full text-left px-4 py-2 text-xs text-green-400 hover:bg-white/10">Mark Resolved</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!stats?.recentIssues || stats.recentIssues.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No recent issues found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

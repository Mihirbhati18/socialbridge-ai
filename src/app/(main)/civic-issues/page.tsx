'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { MapPin, ThumbsUp, AlertCircle, Clock, Plus, List, Map as MapIcon, TrendingUp, Users, AlertTriangle } from 'lucide-react';

const IssueMap = dynamic(() => import('@/components/civic/issue-map'), { 
  ssr: false, 
  loading: () => <div className="h-[500px] w-full rounded-xl bg-white/5 animate-pulse flex items-center justify-center border border-white/10"><MapIcon className="w-8 h-8 text-white/30" /></div>
});

const CATEGORIES = ['All', 'Garbage', 'Road', 'Water', 'Electricity', 'Sanitation', 'Drainage'];
const STATUSES = ['All', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'];

export default function CivicIssuesPage() {
  const [view, setView] = useState<'list' | 'map'>('list');
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchIssues();
  }, [filterCategory, filterStatus]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const cat = filterCategory !== 'All' ? filterCategory.toLowerCase() : '';
      const stat = filterStatus !== 'All' ? filterStatus : '';
      let url = '/api/civic-issues';
      const params = new URLSearchParams();
      if (cat) params.append('category', cat);
      if (stat) params.append('status', stat);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (error) {
      console.error('Failed to fetch issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ASSIGNED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'RESOLVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toUpperCase()) {
      case 'GARBAGE': return 'bg-orange-500/20 text-orange-400';
      case 'ROAD': return 'bg-stone-500/20 text-stone-400';
      case 'WATER': return 'bg-cyan-500/20 text-cyan-400';
      case 'ELECTRICITY': return 'bg-yellow-500/20 text-yellow-400';
      case 'SANITATION': return 'bg-emerald-500/20 text-emerald-400';
      case 'DRAINAGE': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Civic Issues
          </h1>
          <p className="text-gray-400 mt-1">Report and track community problems</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/5 p-1 rounded-lg border border-white/10 flex items-center">
            <button 
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${view === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button 
              onClick={() => setView('map')}
              className={`p-2 rounded-md transition-colors flex items-center gap-2 text-sm font-medium ${view === 'map' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <MapIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Map</span>
            </button>
          </div>
          <Link href="/civic-issues/report">
            <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <Plus className="w-5 h-5" />
              <span>Report Issue</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {view === 'list' && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Status</label>
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 text-white"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Ranking Info */}
      {view === 'list' && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-orange-500/5 to-red-500/5 border border-orange-500/10 text-xs text-gray-400">
          <TrendingUp className="w-4 h-4 text-orange-400 shrink-0" />
          <span>Sorted by <strong className="text-orange-300">smart ranking</strong>: freshness + urgency + public concern + status</span>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      ) : view === 'map' ? (
        <div className="relative z-0">
          <IssueMap issues={issues} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.length > 0 ? issues.map((issue, idx) => {
            const timeAgo = (() => {
              const h = (Date.now() - new Date(issue.createdAt).getTime()) / 36e5;
              if (h < 1) { const m = Math.floor(h * 60); return m <= 1 ? 'Just now' : `${m}min ago`; }
              if (h < 24) return `${Math.floor(h)}h ago`;
              if (h < 168) return `${Math.floor(h / 24)}d ago`;
              if (h < 720) return `${Math.floor(h / 168)}w ago`;
              return `${Math.floor(h / 720)}mo ago`;
            })();
            const urgency = issue.rankingScore >= 80 ? { label: 'Critical', color: 'text-red-400 border-red-500/30 bg-red-500/20' }
              : issue.rankingScore >= 60 ? { label: 'High', color: 'text-orange-400 border-orange-500/30 bg-orange-500/20' }
              : issue.rankingScore >= 40 ? { label: 'Medium', color: 'text-amber-400 border-amber-500/30 bg-amber-500/20' }
              : { label: 'Low', color: 'text-green-400 border-green-500/30 bg-green-500/20' };
            return (
            <div key={issue.id} className={`group flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border ${idx === 0 ? 'border-orange-500/30' : 'border-white/10'} rounded-xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(249,115,22,0.1)] hover:-translate-y-1`}>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                        #1
                      </span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getCategoryColor(issue.category)}`}>
                      {issue.category?.charAt(0).toUpperCase() + issue.category?.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {issue.isEscalated && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white animate-pulse flex items-center gap-0.5">
                        <AlertTriangle className="w-2.5 h-2.5" /> SLA
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgency.color}`}>
                      {urgency.label}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusColor(issue.status)}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1 group-hover:text-orange-400 transition-colors">
                  {issue.title}
                </h3>
                <p className="text-sm text-gray-400 mb-4 line-clamp-2 flex-1">
                  {issue.description}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <span className="truncate">{issue.address}</span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {timeAgo}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                      {issue.upvotes || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Citizens confirming this issue">
                      <Users className="w-3.5 h-3.5 text-orange-400" />
                      {issue.voteCount || 0}
                    </span>
                    <span className="flex items-center gap-1" title={`Priority score: ${issue.rankingScore}`}>
                      <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                      {issue.rankingScore}
                    </span>
                  </div>
                  <Link href={`/civic-issues/${issue.id}`}>
                    <span className="text-sm font-medium text-orange-400 hover:text-orange-300">View Details</span>
                  </Link>
                </div>
              </div>
            </div>
          )}) : (
            <div className="col-span-full py-20 text-center text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No civic issues found matching your filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

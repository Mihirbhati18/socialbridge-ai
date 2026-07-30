'use client';

import { useState, useEffect, use } from 'react';
import { MapPin, Clock, User, ThumbsUp, ChevronLeft, Map as MapIcon, Image as ImageIcon, Users, Bell, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const IssueMap = dynamic(() => import('@/components/civic/issue-map'), { 
  ssr: false, 
  loading: () => <div className="h-64 w-full rounded-xl bg-white/5 animate-pulse flex items-center justify-center border border-white/10"><MapIcon className="w-8 h-8 text-white/30" /></div>
});

export default function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [issue, setIssue] = useState<any>(null);
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvoted, setUpvoted] = useState(false);
  const [voted, setVoted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [issueRes, updatesRes] = await Promise.all([
          fetch(`/api/civic-issues/${resolvedParams.id}`),
          fetch(`/api/civic-issues/${resolvedParams.id}/updates`)
        ]);
        
        if (issueRes.ok) {
          const issueData = await issueRes.json();
          setIssue(issueData);
          // In a real app, we'd check if user already upvoted/voted/subscribed
        }
        if (updatesRes.ok) {
          const updatesData = await updatesRes.json();
          setUpdates(updatesData);
        }
      } catch (error) {
        console.error('Error fetching issue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const handleVote = async () => {
    if (voted || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/civic-issues/${resolvedParams.id}/vote`, { method: 'POST' });
      if (res.ok) {
        setVoted(true);
        setIssue((prev: any) => ({ ...prev, voteCount: prev.voteCount + 1 }));
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const method = subscribed ? 'DELETE' : 'POST';
      const res = await fetch(`/api/civic-issues/${resolvedParams.id}/subscribe`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: subscribed ? undefined : JSON.stringify({ channels: ['EMAIL', 'IN_APP'] })
      });
      if (res.ok) {
        setSubscribed(!subscribed);
      }
    } catch (error) {
      console.error('Error subscribing:', error);
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div></div>;
  }

  if (!issue) {
    return <div className="text-center py-20 text-gray-400">Issue not found.</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'ASSIGNED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'IN_PROGRESS': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'RESOLVED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'ASSIGNED': return 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]';
      case 'IN_PROGRESS': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
      case 'RESOLVED': return 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <Link href="/civic-issues" className="inline-flex items-center text-sm text-gray-400 hover:text-orange-400 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Issues
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/20">
                {issue.category}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getStatusColor(issue.status)}`}>
                {issue.status.replace('_', ' ')}
              </span>
              {issue.priority && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  issue.priority === 'URGENT' || issue.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'
                }`}>
                  Priority: {issue.priority}
                </span>
              )}
              {issue.isEscalated && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-600 text-white animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> ESCALATED
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">{issue.title}</h1>
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {new Date(issue.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {issue.reporter?.name || 'Citizen'}</span>
              <span className="flex items-center gap-1.5 text-blue-400"><ThumbsUp className="w-4 h-4" /> {issue.upvotes + (upvoted ? 1 : 0)} Upvotes</span>
              <span className="flex items-center gap-1.5 text-orange-400"><Users className="w-4 h-4" /> {issue.voteCount || 0} Citizens confirming</span>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300 text-lg leading-relaxed">{issue.description}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-lg border border-white/5 flex-1">
                <MapPin className="w-5 h-5 text-red-400 shrink-0" />
                <span className="text-sm font-medium">{issue.address}, {issue.city}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${subscribed ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'}`}
                >
                  <Bell className={cn("w-4 h-4", subscribed && "fill-current")} />
                  {subscribed ? 'Subscribed' : 'Get Updates'}
                </button>

                <button 
                  onClick={handleVote}
                  disabled={voted || voting}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${voted ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  <Users className="w-4 h-4" />
                  {voted ? 'Confirmed' : 'Me Too (+1)'}
                </button>

                <button 
                  onClick={() => setUpvoted(!upvoted)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${upvoted ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  {upvoted ? 'Upvoted' : 'Upvote'}
                </button>
              </div>
            </div>
          </div>

          {/* Map */}
          {issue.lat && issue.lng && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-orange-400" /> Location Map
              </h3>
              <div className="h-[300px] w-full rounded-xl overflow-hidden relative z-0">
                <IssueMap issues={[issue]} center={[issue.lat, issue.lng]} zoom={15} />
              </div>
            </div>
          )}
          
          {/* Images */}
          {(() => {
            const imagesList = typeof issue.images === 'string'
              ? issue.images.split(',').filter(Boolean)
              : Array.isArray(issue.images)
                ? issue.images
                : [];
            if (imagesList.length === 0) return null;
            return (
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-orange-400" /> Attached Evidence
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagesList.map((img: string, i: number) => (
                    <img key={i} src={img} alt={`Evidence ${i+1}`} className="w-full h-32 object-cover rounded-lg border border-white/10" />
                  ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Sidebar / Timeline */}
        <div className="space-y-6">
          {issue.slaDeadline && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Resolution Deadline</h3>
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${new Date(issue.slaDeadline) < new Date() ? 'text-red-500' : 'text-green-500'}`} />
                <span className={`text-lg font-bold ${new Date(issue.slaDeadline) < new Date() ? 'text-red-400' : 'text-white'}`}>
                  {new Date(issue.slaDeadline).toLocaleString()}
                </span>
              </div>
              {new Date(issue.slaDeadline) < new Date() && !issue.isEscalated && (
                <p className="text-xs text-red-400 mt-2 font-medium">⚠️ SLA Breach: Target resolution time exceeded.</p>
              )}
            </div>
          )}

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm sticky top-24">
            <h3 className="text-lg font-bold text-white mb-6">Status Timeline</h3>
            
            <div className="relative pl-6 space-y-8">
              {/* Vertical line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-orange-500/50 via-blue-500/50 to-green-500/50"></div>
              
              {updates.map((update, index) => (
                <div key={update.id} className="relative">
                  {/* Dot */}
                  <div className={`absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-black ${getStatusDotColor(update.status)}`}></div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white text-sm">{update.status.replace('_', ' ')}</span>
                      <span className="text-xs text-gray-500">{new Date(update.createdAt).toLocaleDateString()}</span>
                    </div>
                    {update.comment && (
                      <p className="text-sm text-gray-400 bg-black/30 p-3 rounded-lg border border-white/5 mt-2">
                        {update.comment}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">Updated by {update.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

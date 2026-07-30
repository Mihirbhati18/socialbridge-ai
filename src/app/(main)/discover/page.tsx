'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Search, Sparkles, MapPin, Building2, Map as MapIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const OrganizationMap = dynamic(() => import('@/components/civic/organization-map'), { 
  ssr: false, 
  loading: () => <div className="h-full w-full bg-white/5 animate-pulse flex items-center justify-center border border-white/10 rounded-xl"><MapIcon className="w-10 h-10 text-white/30" /></div>
});

export default function DiscoverPage() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [intent, setIntent] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  // Outreach Modal State
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [outreachTarget, setOutreachTarget] = useState<any>(null);
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [isFetchingContact, setIsFetchingContact] = useState(false);
  
  const [outreachGoal, setOutreachGoal] = useState("general");
  const [outreachContext, setOutreachContext] = useState("");
  
  const [draftEmailContent, setDraftEmailContent] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setIntent(data.intent || '');
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenOutreach = async (org: any) => {
    setOutreachTarget(org);
    setOutreachModalOpen(true);
    setContactDetails(null);
    setOutreachGoal("general");
    setOutreachContext("");
    setDraftEmailContent("");
    setIsSent(false);
    
    // Fetch AI Contact Details immediately
    setIsFetchingContact(true);
    try {
      const res = await fetch('/api/ai/contact-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgName: org.name,
          orgType: org.type,
          location: org.address
        })
      });
      if (res.ok) {
        const data = await res.json();
        setContactDetails(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFetchingContact(false);
    }
  };

  const handleDraftEmail = async () => {
    if (!outreachTarget) return;
    setIsDrafting(true);
    setDraftEmailContent("");

    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: query || "A community initiative",
          recipientType: outreachTarget.type,
          tone: "professional and collaborative",
          purpose: `Goal: ${outreachGoal}. Invite ${outreachTarget.name} to partner with us based on my search: ${query}. Additional context provided by user: ${outreachContext || 'None'}. Address the email to ${contactDetails?.contactName || 'the team'}.`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDraftEmailContent(data.email);
      } else {
        setDraftEmailContent("Error generating draft. Please try again.");
      }
    } catch (e) {
      console.error(e);
      setDraftEmailContent("Error generating draft. Please try again.");
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    
    // Extract subject from draft content if possible
    let subject = `Partnership Outreach from ${outreachTarget?.name || 'SocialBridge'}`;
    let body = draftEmailContent;
    
    const subjectMatch = draftEmailContent.match(/^Subject:\s*(.*)\n\n/i);
    if (subjectMatch) {
      subject = subjectMatch[1];
      body = draftEmailContent.replace(subjectMatch[0], '').trim();
    }
    
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contactDetails?.contactEmail || 'demo@example.com',
          subject,
          body
        })
      });
      
      if (res.ok) {
        setIsSent(true);
        setTimeout(() => setOutreachModalOpen(false), 2000);
      } else {
        const err = await res.json();
        console.error("Failed to send email:", err);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-theme(spacing.20))] flex flex-col pt-4 px-4 sm:px-6 pb-6 max-w-screen-2xl mx-auto w-full gap-4">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center">
            <MapPin className="w-8 h-8 mr-2 text-blue-500" /> Map Discovery
          </h1>
          <p className="text-gray-400 mt-1">Describe what you need, and our AI will find the best venues and partners on the map.</p>
        </div>

        <form onSubmit={handleSearch} className="relative w-full shadow-lg">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-indigo-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="block w-full pl-12 pr-32 py-5 border border-white/20 rounded-xl leading-5 bg-card/80 backdrop-blur text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-lg transition-all"
            placeholder="e.g. 'Need a school in Andheri for a medical camp venue' or 'Find NGOs for elder care in Bandra'"
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
            <Button 
              type="submit" 
              disabled={isSearching || !query.trim()}
              className="bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white font-bold h-10 px-6 rounded-lg shadow-md"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Find</>}
            </Button>
          </div>
        </form>

        {intent && !isSearching && (
          <div className="flex items-center gap-2 text-sm text-indigo-300 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
            <Sparkles className="w-4 h-4" />
            <span><strong>AI Intent Extracted:</strong> {intent}</span>
          </div>
        )}
      </div>

      {/* Main Content Area (Split View) */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* Left: List View */}
        <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col bg-card/50 backdrop-blur rounded-xl border border-white/10 overflow-hidden shadow-lg">
          <div className="p-4 border-b border-white/10 bg-white/5">
            <h2 className="font-semibold text-gray-200">
              {isSearching ? 'Searching the map...' : hasSearched ? `Found ${results.length} matches` : 'Top Rated Organizations'}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                <p>Analyzing query and searching locations...</p>
              </div>
            ) : results.length > 0 ? (
              results.map((org) => (
                <Card key={org.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-100 text-lg leading-tight flex items-center gap-2">
                        {org.name}
                        {org.isWebResult && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 rounded flex items-center">
                            🌐 Web
                          </span>
                        )}
                      </h3>
                      <div className="flex items-center bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded text-sm font-bold border border-amber-500/30">
                        ★ {org.rating}
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-indigo-300 mb-3 font-medium">
                      <Building2 className="w-4 h-4 mr-1.5" />
                      {org.type}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-2 line-clamp-2 leading-relaxed">
                      {org.address}
                    </div>

                    {org.matchReason && (
                      <div className="text-xs text-indigo-200/70 italic mb-4 bg-indigo-500/10 p-2 rounded border border-indigo-500/20">
                        <Sparkles className="w-3 h-3 inline mr-1 text-indigo-400" />
                        {org.matchReason}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">Total Events</div>
                        <div className="font-bold text-gray-200">{org.totalEvents}</div>
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-center border border-white/5">
                        <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                        <div className="font-bold text-green-400">
                          {org.totalEvents > 0 ? Math.round((org.successfulEvents / org.totalEvents) * 100) : 0}%
                        </div>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleOpenOutreach(org)}
                      className="w-full bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium"
                    >
                      <Sparkles className="w-4 h-4 mr-2" /> AI Outreach & Contact
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : hasSearched ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 text-center p-6">
                <MapPin className="w-12 h-12 text-gray-600 mb-2" />
                <p className="font-medium text-gray-300">No matches found in this area.</p>
                <p className="text-sm">Try broadening your search terms or location.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4 text-center p-6">
                <MapIcon className="w-16 h-16 text-indigo-500/20" />
                <p className="text-lg font-medium text-gray-300">Where to?</p>
                <p className="text-sm text-gray-500">Search for schools, hospitals, or NGOs to see them on the map.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Map View */}
        <div className="flex-1 rounded-xl overflow-hidden border border-white/10 shadow-lg bg-black/50">
          <OrganizationMap 
            organizations={results} 
            onDraftOutreach={handleOpenOutreach}
            center={results.length > 0 && results[0].lat ? [results[0].lat, results[0].lng] : [19.076, 72.8777]}
            zoom={results.length > 0 ? 13 : 11}
          />
        </div>

      </div>

      {/* AI Outreach Dialog */}
      <Dialog 
        open={outreachModalOpen} 
        onClose={() => setOutreachModalOpen(false)} 
        title={outreachTarget ? `Outreach: ${outreachTarget.name}` : "AI Outreach"}
      >
        <div className="space-y-6 pt-2">
          
          {/* Step 1: Contact Details */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" /> AI Contact Discovery
            </h4>
            
            {isFetchingContact ? (
              <div className="flex items-center gap-3 text-indigo-400 text-sm py-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Searching the web for contact details...
              </div>
            ) : contactDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Point of Contact</div>
                  <div className="text-sm font-medium text-gray-200">{contactDetails.contactName}</div>
                  <div className="text-xs text-indigo-300">{contactDetails.contactRole}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Email Address</div>
                  <div className="text-sm font-medium text-gray-200 break-all">{contactDetails.contactEmail}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-red-400">Failed to fetch contact details.</div>
            )}
          </div>

          {/* Step 2: Email Draft */}
          {draftEmailContent ? (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                Draft Pitch
              </h4>
              <Textarea 
                value={draftEmailContent} 
                onChange={(e) => setDraftEmailContent(e.target.value)}
                className="min-h-[250px] text-sm leading-relaxed bg-black/40 border-white/10 focus:border-indigo-500"
              />
            </div>
          ) : isDrafting ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-indigo-500">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="font-medium animate-pulse text-sm">SocialBridge AI is drafting the perfect pitch...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-300 mb-2">Customize Pitch (Optional)</h4>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">What is your primary goal?</label>
                  <select 
                    value={outreachGoal}
                    onChange={(e) => setOutreachGoal(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-md text-sm p-2 text-gray-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="general">General Partnership</option>
                    <option value="venue">Request Venue / Space</option>
                    <option value="financial">Request Financial Support</option>
                    <option value="volunteers">Request Volunteers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Additional Context (e.g. mention your past funding)</label>
                  <Textarea 
                    value={outreachContext}
                    onChange={(e) => setOutreachContext(e.target.value)}
                    placeholder="Tell the AI any specific details you want included in the pitch..."
                    className="h-20 text-sm bg-black/40 border-white/10"
                  />
                </div>
              </div>

              <div className="flex justify-center py-2">
                <Button 
                  onClick={handleDraftEmail} 
                  className="bg-indigo-600/80 hover:bg-indigo-600 text-white font-medium px-8 w-full sm:w-auto"
                  disabled={isFetchingContact}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Generate AI Pitch
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button variant="outline" onClick={() => setOutreachModalOpen(false)}>Cancel</Button>
            {draftEmailContent && !isSent && (
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white min-w-[120px]" 
                onClick={handleSendEmail}
                disabled={isSending}
              >
                {isSending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Email"}
              </Button>
            )}
            {isSent && (
              <Button className="bg-gray-700 text-green-400" disabled>
                <CheckCircle2 className="w-4 h-4 mr-2" /> Sent Successfully!
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}

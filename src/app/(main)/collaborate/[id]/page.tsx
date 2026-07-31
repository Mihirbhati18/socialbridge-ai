'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Sparkles, MapPin, Calendar, CheckCircle2, Shield, Loader2, ArrowRight, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

export default function CollabDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [request, setRequest] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [acceptedOrgs, setAcceptedOrgs] = useState<string[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [partnershipId, setPartnershipId] = useState<string | null>(null);
  
  // Outreach Modal State
  const [outreachModalOpen, setOutreachModalOpen] = useState(false);
  const [outreachTarget, setOutreachTarget] = useState<any>(null);
  
  const [outreachGoal, setOutreachGoal] = useState("general");
  const [outreachContext, setOutreachContext] = useState("");
  
  const [draftEmailContent, setDraftEmailContent] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await fetch(`/api/collaborations/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFindPartners = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/collaborations/${id}/recommend`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAcceptPartner = async (orgId: string, orgName: string) => {
    setAcceptingId(orgId);
    try {
      const res = await fetch(`/api/collaborations/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, orgName, status: 'ACCEPTED' })
      });
      if (res.ok) {
        const data = await res.json();
        setAcceptedOrgs([...acceptedOrgs, orgId]);
        setRequest({ ...request, status: 'IN_PROGRESS' });
        if (data.partnershipId) {
          setPartnershipId(data.partnershipId);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAcceptingId(null);
    }
  };

  const handleOpenCreatorOutreach = () => {
    const creatorOrg = { 
      name: request.creator?.name || 'Creator', 
      type: 'Individual',
      email: request.creator?.email || 'unknown@example.com'
    };
    setOutreachTarget(creatorOrg);
    setOutreachModalOpen(true);
    setOutreachGoal("general");
    setOutreachContext("");
    setDraftEmailContent("");
    setIsSent(false);
  };

  const handleDraftCreatorEmail = async () => {
    if (!outreachTarget) return;
    setIsDrafting(true);
    setDraftEmailContent("");

    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: request.title,
          recipientType: outreachTarget.type,
          tone: "professional and collaborative",
          purpose: `Goal: ${outreachGoal}. Invite ${outreachTarget.name} to collaborate with us on their post: ${request.title}. Context: ${outreachContext || 'None'}.`
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
    
    let subject = `Partnership Inquiry regarding ${request.title}`;
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
          to: outreachTarget?.email || 'demo@example.com',
          subject,
          body
        })
      });
      
      if (res.ok) {
        setIsSent(true);
        setTimeout(() => setOutreachModalOpen(false), 2000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleDraftEmail = async (orgName: string, orgType: string) => {
    setOutreachTarget({ name: orgName, type: orgType });
    setOutreachModalOpen(true);
    setOutreachGoal("general");
    setOutreachContext("");
    setIsDrafting(true);
    setDraftEmailContent("");

    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectContext: `We are looking to organize a ${request.title}. Details: ${request.description}. Required partners: ${request.requiredPartners}.`,
          recipientType: orgType,
          tone: "professional and collaborative",
          purpose: `Invite ${orgName} to partner with us on this initiative as they are an excellent match.`
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

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>;
  }

  if (!request) return <div>Request not found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Top Section: Request Details & Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: 60% */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Badge className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200">{request.category?.replace(/_/g, ' ')}</Badge>
            <Badge variant={request.status === 'OPEN' ? 'default' : 'secondary'} className={request.status === 'OPEN' ? 'bg-green-500' : ''}>
              {request.status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">{request.title}</h1>
          
          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
              <MapPin className="h-4 w-4 text-rose-500" /> {request.city || 'Any Location'}
            </div>
            {request.date && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
                <Calendar className="h-4 w-4 text-purple-500" /> {new Date(request.date).toLocaleDateString()}
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border">
              <Shield className="h-4 w-4 text-blue-500" /> By {request.creator?.name || 'Unknown'}
            </div>
          </div>
          
          {request.creator && (
            <div className="mt-4">
              <Button 
                onClick={handleOpenCreatorOutreach}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center gap-3 text-lg"
              >
                <MessageSquare className="h-6 w-6" /> 
                Connect with {request.creator.name} to Collaborate
              </Button>
            </div>
          )}
          
          <div className="prose max-w-none text-gray-700 mt-6 bg-white/50 p-6 rounded-2xl border border-gray-100 shadow-sm backdrop-blur">
            <p className="whitespace-pre-wrap text-lg leading-relaxed">{request.description}</p>
          </div>
          
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Required Partner Types</h3>
            <div className="flex flex-wrap gap-2">
              {request.requiredPartners?.split(',').map((p: string) => (
                <span key={p} className="px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 border rounded-lg font-medium text-gray-700 shadow-sm">{p}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: 40% (Action Panel) */}
        <div className="lg:col-span-1">
          <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0 shadow-2xl sticky top-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-300" /> AI Partnership Engine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-indigo-100 text-lg">
                Let Concord analyze our network of thousands of verified NGOs and organizations to find the perfect partners for your initiative.
              </p>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 mt-4">
                <ul className="space-y-2 text-sm text-indigo-50">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-300" /> Analyzes past collaboration history</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-300" /> Matches required expertise</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-300" /> Calculates geographic proximity</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-300" /> Evaluates reliability scores</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              {recommendations.length === 0 && !analyzing && (
                <Button 
                  onClick={handleFindPartners} 
                  className="w-full bg-white text-indigo-600 hover:bg-gray-50 font-bold text-lg py-6 shadow-xl transition-all hover:scale-105"
                >
                  <Sparkles className="mr-2 h-5 w-5" /> Find Partners with AI
                </Button>
              )}
              {analyzing && (
                <div className="w-full text-center py-4 bg-white/20 rounded-xl animate-pulse flex items-center justify-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" /> 
                  <span className="font-medium">AI is analyzing network...</span>
                </div>
              )}
              {recommendations.length > 0 && (
                <div className="w-full text-center py-4 bg-green-500/20 text-green-100 rounded-xl font-medium flex items-center justify-center gap-2 border border-green-400/30">
                  <CheckCircle2 className="h-5 w-5 text-green-300" /> Analysis Complete
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <div className="pt-8 border-t border-gray-200 mt-12 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              🤖 AI Partner Recommendations
            </h2>
            <p className="text-indigo-600 font-medium mt-1">Powered by Concord Matchmaking</p>
          </div>

          <div className="space-y-6">
            {recommendations.map((rec, idx) => (
              <Card key={rec.organization.id} className="overflow-hidden border-2 border-indigo-50/50 hover:border-indigo-200 hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-xl" style={{ animationDelay: `${idx * 150}ms` }}>
                <div className="flex flex-col md:flex-row">
                  
                  {/* Left: Score & Basic Info */}
                  <div className="md:w-1/3 p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 border-r flex flex-col items-center justify-center text-center">
                    
                    {/* Circular Score Indicator */}
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="40" stroke="#e2e8f0" strokeWidth="8" fill="none" />
                        <circle cx="50" cy="50" r="40" stroke={`url(#gradient-${rec.organization.id})`} strokeWidth="8" fill="none" 
                          strokeDasharray={`${251.2 * (rec.score / 100)} 251.2`} 
                          strokeLinecap="round" className="transition-all duration-1000 ease-out" 
                        />
                        <defs>
                          <linearGradient id={`gradient-${rec.organization.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#9333ea" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-extrabold text-gray-900">{rec.score}</span>
                        <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Match</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{rec.organization.name}</h3>
                    <Badge variant="outline" className="mb-4 bg-white">{rec.organization.type}</Badge>
                    
                    <div className="flex gap-4 text-sm text-gray-600 mb-6 w-full justify-center">
                      <div className="text-center"><div className="font-bold text-gray-900">{rec.organization.successfulEvents}</div><div>Events</div></div>
                      <div className="text-center"><div className="font-bold text-gray-900">{rec.organization.rating.toFixed(1)}⭐</div><div>Rating</div></div>
                    </div>
                    
                    {acceptedOrgs.includes(rec.organization.id) ? (
                      <div className="space-y-3 w-full">
                        <Button disabled className="w-full bg-green-500 text-white font-bold opacity-100">
                          <CheckCircle2 className="mr-2 h-4 w-4" /> Partner Accepted
                        </Button>
                        <Link href={partnershipId ? `/workspace/${partnershipId}` : '/partnerships'} className="block w-full">
                          <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                            Open Workspace <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3 w-full">
                        <Button 
                          onClick={() => handleDraftEmail(rec.organization.name, rec.organization.type)}
                          variant="outline"
                          className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-bold"
                        >
                          <Sparkles className="mr-2 h-4 w-4" /> Draft AI Outreach
                        </Button>
                        <Button 
                          onClick={() => handleAcceptPartner(rec.organization.id, rec.organization.name)}
                          disabled={acceptingId === rec.organization.id}
                          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
                        >
                          {acceptingId === rec.organization.id ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Accepting...</>
                          ) : (
                            'Accept Partner'
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Right: Breakdown & Explanation */}
                  <div className="md:w-2/3 p-6 space-y-6">
                    
                    {/* AI Explanation Box */}
                    <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Sparkles className="w-16 h-16 text-indigo-600" />
                      </div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-800 uppercase tracking-wider mb-2">
                        <Sparkles className="w-4 h-4" /> AI Analysis
                      </h4>
                      <p className="text-gray-700 text-lg italic leading-relaxed relative z-10">"{rec.explanation}"</p>
                    </div>
                    
                    {/* Score Breakdown Bars */}
                    <div>
                      <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Score Breakdown</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                        <ScoreBar label="History Match" value={rec.breakdown.historyScore} />
                        <ScoreBar label="Success Rate" value={rec.breakdown.successScore} />
                        <ScoreBar label="Reliability" value={rec.breakdown.reliabilityScore} />
                        <ScoreBar label="Response Time" value={rec.breakdown.responseScore} />
                        <ScoreBar label="Proximity" value={rec.breakdown.distanceScore} />
                        <ScoreBar label="Category Exp" value={rec.breakdown.categoryScore} />
                      </div>
                    </div>

                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI Outreach Dialog */}
      <Dialog open={outreachModalOpen} onClose={() => setOutreachModalOpen(false)} title={`AI Outreach to ${outreachTarget?.name}`}>
        <div className="space-y-6">
          <div className="bg-indigo-50/50 p-4 rounded-lg border border-indigo-100 flex items-start gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Sparkles className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-indigo-900">Custom Pitch Generation</h3>
              <p className="text-sm text-indigo-700 mt-1">
                Configure your outreach goals and the AI will draft a highly personalized email to {outreachTarget?.name}.
              </p>
            </div>
          </div>

          {!draftEmailContent && !isDrafting && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">What is your primary goal?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['general', 'venue', 'funding', 'volunteers'].map((goal) => (
                    <button
                      key={goal}
                      onClick={() => setOutreachGoal(goal)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                        outreachGoal === goal
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                      }`}
                    >
                      {goal === 'general' && '🤝 General Partnership'}
                      {goal === 'venue' && '🏢 Request Venue'}
                      {goal === 'funding' && '💰 Request Funding'}
                      {goal === 'volunteers' && '🙋 Request Volunteers'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-sm font-semibold text-gray-700">Add Custom Context (Optional)</label>
                <Textarea 
                  placeholder="e.g. Mention that we met at the Tech for Good conference last year..."
                  value={outreachContext}
                  onChange={(e) => setOutreachContext(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              <Button 
                onClick={outreachTarget?.type === 'Individual' ? handleDraftCreatorEmail : () => handleDraftEmail(outreachTarget.name, outreachTarget.type)}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold h-12 shadow-md hover:shadow-lg transition-all"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Generate AI Pitch
              </Button>
            </div>
          )}

          {isDrafting && (
            <div className="flex flex-col items-center justify-center py-16 space-y-4 text-indigo-600">
              <Loader2 className="h-10 w-10 animate-spin" />
              <p className="font-medium animate-pulse text-lg">AI is writing your pitch...</p>
            </div>
          )}

          {draftEmailContent && !isDrafting && !isSent && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm bg-white">
                <div className="bg-gray-50 p-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-600">Drafted Email</span>
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                </div>
                <Textarea 
                  value={draftEmailContent} 
                  onChange={(e) => setDraftEmailContent(e.target.value)}
                  className="min-h-[300px] border-0 text-sm leading-relaxed p-4 focus-visible:ring-0 rounded-none bg-white font-mono"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => {
                  setDraftEmailContent('');
                  setOutreachGoal('general');
                  setOutreachContext('');
                }}>Start Over</Button>
                <Button 
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="bg-green-600 hover:bg-green-700 text-white min-w-[140px]"
                >
                  {isSending ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <>Send Email</>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {isSent && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Email Sent!</h3>
              <p className="text-gray-500 text-center">Your personalized pitch has been sent to {outreachTarget?.name}. They should respond soon!</p>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex items-center text-sm">
      <div className="w-28 font-medium text-gray-600">{label}</div>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-purple-500"
            style={{ width: `${value}%` }}
          />
        </div>
        <div className="w-8 text-right font-bold text-gray-700">{Math.round(value)}%</div>
      </div>
    </div>
  );
}

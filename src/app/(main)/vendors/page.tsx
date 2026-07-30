'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Store, Bot, Send, Sparkles, CheckCircle2, XCircle,
  ChevronDown, Loader2, Terminal, Brain, Wrench,
  FileCheck, Zap, IndianRupee, ArrowRight
} from 'lucide-react';

type AgentStep = {
  step: number;
  type: 'SYSTEM' | 'THOUGHT' | 'TOOL_CALL' | 'TOOL_RESULT' | 'FINAL';
  content: string;
  timestamp: string;
};

type NegotiationResult = {
  success: boolean;
  summary: string;
  vendorName?: string;
  finalAmount?: number;
  savings?: string;
};

const SERVICE_TYPES = [
  { value: 'CATERER', label: '🍽️ Caterer', desc: 'Food & beverages for events' },
  { value: 'DECORATOR', label: '🎪 Decorator / Tent House', desc: 'Chairs, tables, stage, pandals' },
  { value: 'TRANSPORT', label: '🚐 Transport', desc: 'Buses, trucks for logistics' },
  { value: 'PRINTER', label: '🖨️ Printer', desc: 'Banners, flyers, t-shirts' },
  { value: 'EVENT_MANAGER', label: '📋 Event Manager', desc: 'Full event coordination' },
];

const stepIcons: Record<string, any> = {
  SYSTEM: Zap,
  THOUGHT: Brain,
  TOOL_CALL: Wrench,
  TOOL_RESULT: FileCheck,
  FINAL: CheckCircle2,
};

const stepColors: Record<string, string> = {
  SYSTEM: 'text-blue-400 border-blue-500/30 bg-blue-500/5',
  THOUGHT: 'text-purple-400 border-purple-500/30 bg-purple-500/5',
  TOOL_CALL: 'text-amber-400 border-amber-500/30 bg-amber-500/5',
  TOOL_RESULT: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/5',
  FINAL: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5',
};

export default function VendorsPage() {
  const [requirement, setRequirement] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<AgentStep[]>([]);
  const [result, setResult] = useState<NegotiationResult | null>(null);
  const [showForm, setShowForm] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [steps]);

  const startNegotiation = async () => {
    if (!requirement || !serviceType || !budget) return;

    setIsRunning(true);
    setSteps([]);
    setResult(null);
    setShowForm(false);

    try {
      const res = await fetch('/api/agent/negotiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirement,
          serviceType,
          quantity: parseInt(quantity) || 1,
          budget,
          city,
        }),
      });

      if (!res.ok) throw new Error('Failed to start negotiation');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'COMPLETE') {
                setResult(data.result);
                setIsRunning(false);
              } else if (data.type === 'ERROR') {
                setResult({ success: false, summary: data.error });
                setIsRunning(false);
              } else if (data.step) {
                setSteps(prev => [...prev, data as AgentStep]);
              }
            } catch {
              // skip malformed events
            }
          }
        }
      }
    } catch (error: any) {
      setResult({ success: false, summary: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const resetAgent = () => {
    setSteps([]);
    setResult(null);
    setShowForm(true);
    setIsRunning(false);
    setRequirement('');
    setServiceType('');
    setQuantity('');
    setBudget('');
    setCity('Mumbai');
  };

  return (
    <div className="container mx-auto p-6 md:p-10 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl border border-emerald-500/30">
          <Bot className="w-8 h-8 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400">
            AI Vendor Negotiator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Autonomous agent that finds, compares, and negotiates with local vendors for your social events
          </p>
        </div>
        <Badge className="ml-auto bg-emerald-500/20 text-emerald-300 border-emerald-500/50 text-xs px-3 py-1">
          <Sparkles className="w-3 h-3 mr-1" /> Agentic AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Panel - Input Form or Result */}
        <div className="lg:col-span-2">
          {showForm ? (
            <Card className="bg-white/5 border-white/10 backdrop-blur-md sticky top-6">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  What do you need?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Service Type */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Service Type</label>
                  <div className="space-y-2">
                    {SERVICE_TYPES.map(st => (
                      <button
                        key={st.value}
                        onClick={() => setServiceType(st.value)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                          serviceType === st.value
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300'
                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <span className="font-medium">{st.label}</span>
                        <span className="text-xs block mt-0.5 opacity-70">{st.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Requirement */}
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-2 block">Describe your requirement</label>
                  <textarea
                    value={requirement}
                    onChange={(e) => setRequirement(e.target.value)}
                    placeholder="e.g., Need 500 chairs and 50 tables with a stage setup for a health camp in Andheri..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 resize-none transition-all"
                  />
                </div>

                {/* Quantity, Budget & City Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="500"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">Budget (₹)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="10000"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Mumbai"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                  </div>
                </div>

                {/* Submit */}
                <Button
                  onClick={startNegotiation}
                  disabled={!requirement || !serviceType || !budget || isRunning}
                  className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white py-6 text-base font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all duration-300 disabled:opacity-50"
                >
                  <Bot className="w-5 h-5 mr-2" />
                  Launch AI Negotiator Agent
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 sticky top-6">
              {/* Request Summary */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Store className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-white font-semibold">Your Request</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Service</span>
                      <Badge className="bg-white/10 text-white border-0">
                        {SERVICE_TYPES.find(s => s.value === serviceType)?.label}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity</span>
                      <span className="text-white font-medium">{quantity || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Budget</span>
                      <span className="text-emerald-400 font-bold flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        {parseFloat(budget).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-white/5">
                      <span className="text-gray-400 text-xs">{requirement}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Result Card */}
              {result && (
                <Card className={`backdrop-blur-md border ${
                  result.success
                    ? 'bg-emerald-500/5 border-emerald-500/30'
                    : 'bg-red-500/5 border-red-500/30'
                }`}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      {result.success ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <XCircle className="w-6 h-6 text-red-400" />
                      )}
                      <h3 className={`font-bold text-lg ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {result.success ? 'Deal Secured! 🎉' : 'Negotiation Failed'}
                      </h3>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">{result.summary}</p>
                    {result.vendorName && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Vendor</span>
                          <span className="text-white font-medium">{result.vendorName}</span>
                        </div>
                        {result.finalAmount && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Final Price</span>
                            <span className="text-emerald-400 font-bold text-lg flex items-center">
                              <IndianRupee className="w-4 h-4" />
                              {result.finalAmount.toLocaleString('en-IN')}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <Button
                      onClick={resetAgent}
                      className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white border-0"
                    >
                      Start New Negotiation
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Right Panel - Agent Terminal */}
        <div className="lg:col-span-3">
          <Card className="bg-gray-950/80 border-white/10 backdrop-blur-md overflow-hidden">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 border-b border-white/10">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-gray-400 font-mono">socialbridge-agent — negotiation-v1</span>
              </div>
              {isRunning && (
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-400 font-mono">RUNNING</span>
                </div>
              )}
              {result && !isRunning && (
                <div className="ml-auto flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${result.success ? 'bg-emerald-400' : 'bg-red-400'}`} />
                  <span className={`text-xs font-mono ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.success ? 'COMPLETE' : 'FAILED'}
                  </span>
                </div>
              )}
            </div>

            {/* Terminal Body */}
            <div
              ref={terminalRef}
              className="p-4 h-[600px] overflow-y-auto font-mono text-sm space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10"
            >
              {steps.length === 0 && !isRunning ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <Bot className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-center">
                    Agent is idle. Fill in your requirements and click<br />
                    <span className="text-emerald-400 font-semibold">"Launch AI Negotiator Agent"</span>
                    <br />to begin autonomous negotiation.
                  </p>
                </div>
              ) : (
                <>
                  {steps.map((s, i) => {
                    const Icon = stepIcons[s.type] || Zap;
                    const color = stepColors[s.type] || 'text-gray-400 border-gray-500/30 bg-gray-500/5';

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-lg border ${color} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-4 h-4 flex-shrink-0" />
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-70">{s.type.replace('_', ' ')}</span>
                          <span className="text-[10px] text-gray-500 ml-auto font-mono">step {s.step}</span>
                        </div>
                        <p className="text-xs leading-relaxed whitespace-pre-wrap break-words opacity-90">
                          {s.content}
                        </p>
                      </div>
                    );
                  })}

                  {isRunning && (
                    <div className="flex items-center gap-2 p-3 text-emerald-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-xs animate-pulse">Agent is thinking...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import { Gavel, Shield, Users, Loader2, Sparkles, ChevronDown } from 'lucide-react';

interface DebateMessage {
  agent: 'budget_director' | 'citizen_advocate' | 'system' | 'resolution';
  content: string;
  round?: number;
}

interface CouncilDebateProps {
  issueId: string;
  issueTitle: string;
  existingResolution?: string | null;
}

export function CouncilDebate({ issueId, issueTitle, existingResolution }: CouncilDebateProps) {
  const [isDebating, setIsDebating] = useState(false);
  const [messages, setMessages] = useState<DebateMessage[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [totalRounds, setTotalRounds] = useState(3);
  const [resolution, setResolution] = useState<string | null>(existingResolution || null);
  const [resolvingResolution, setResolvingResolution] = useState(false);
  const [activeAgent, setActiveAgent] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, resolution]);

  const startDebate = async () => {
    setIsDebating(true);
    setMessages([]);
    setResolution(null);
    setCurrentRound(0);
    setActiveAgent(null);

    try {
      const res = await fetch('/api/ai/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to start debate');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));

            switch (data.type) {
              case 'SYSTEM':
                setMessages(prev => [...prev, { agent: 'system', content: data.content }]);
                break;
              case 'ROUND':
                setCurrentRound(data.round);
                setTotalRounds(data.total);
                break;
              case 'AGENT_START':
                setActiveAgent(data.agent);
                break;
              case 'AGENT_MESSAGE':
                setActiveAgent(null);
                setMessages(prev => [...prev, {
                  agent: data.agent,
                  content: data.content,
                  round: data.round,
                }]);
                break;
              case 'RESOLUTION_START':
                setResolvingResolution(true);
                break;
              case 'RESOLUTION':
                setResolvingResolution(false);
                setResolution(data.content);
                break;
              case 'COMPLETE':
                setIsDebating(false);
                break;
              case 'ERROR':
                setMessages(prev => [...prev, { agent: 'system', content: `❌ Error: ${data.error}` }]);
                setIsDebating(false);
                break;
            }
          } catch { /* skip malformed lines */ }
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { agent: 'system', content: `❌ ${error.message}` }]);
      setIsDebating(false);
    }
  };

  const agentConfig = {
    budget_director: {
      name: 'Budget Director',
      icon: Shield,
      gradient: 'from-blue-500 to-cyan-500',
      bgGlow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
      textColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
    },
    citizen_advocate: {
      name: 'Citizen Advocate',
      icon: Users,
      gradient: 'from-orange-500 to-rose-500',
      bgGlow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
      textColor: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
    },
  };

  // If we have an existing resolution and no debate has started, show a compact view
  if (existingResolution && !isDebating && messages.length === 0) {
    return (
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Gavel className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-white">City Council Resolution</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">AI Multi-Agent</span>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
          {existingResolution}
        </div>
        <button
          onClick={startDebate}
          className="mt-4 text-xs text-gray-500 hover:text-gray-300 transition-colors underline underline-offset-2"
        >
          Re-run debate simulation
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-500/20 rounded-lg">
            <Gavel className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">City Council Simulation</h3>
            <p className="text-xs text-gray-500">Multi-Agent AI Debate System</p>
          </div>
        </div>
        {!isDebating && messages.length === 0 && (
          <button
            onClick={startDebate}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm hover:opacity-90 transition-all hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Start Debate
          </button>
        )}
        {isDebating && (
          <div className="flex items-center gap-2 text-sm text-violet-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            Round {currentRound}/{totalRounds}
          </div>
        )}
      </div>

      {/* Agent Avatars */}
      {(isDebating || messages.length > 0) && (
        <div className="flex items-center justify-center gap-8 mb-6 py-4 border-y border-white/5">
          {Object.entries(agentConfig).map(([key, config]) => {
            const Icon = config.icon;
            const isActive = activeAgent === key;
            return (
              <div key={key} className={`flex flex-col items-center gap-2 transition-all duration-500 ${isActive ? 'scale-110' : 'opacity-60'}`}>
                <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center ${isActive ? config.bgGlow : ''} transition-all duration-500`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className={`text-xs font-semibold ${isActive ? config.textColor : 'text-gray-500'}`}>
                  {config.name}
                </span>
                {isActive && (
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Debate Messages */}
      {messages.length > 0 && (
        <div ref={scrollRef} className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scroll-smooth" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
          {messages.map((msg, i) => {
            if (msg.agent === 'system') {
              return (
                <div key={i} className="text-center text-xs text-gray-500 py-2 flex items-center justify-center gap-2">
                  <span className="h-px w-8 bg-white/10"></span>
                  {msg.content}
                  <span className="h-px w-8 bg-white/10"></span>
                </div>
              );
            }

            const config = agentConfig[msg.agent as keyof typeof agentConfig];
            if (!config) return null;
            const Icon = config.icon;

            return (
              <div
                key={i}
                className={`flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500 ${
                  msg.agent === 'citizen_advocate' ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shrink-0`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className={`flex-1 max-w-[80%] ${msg.agent === 'citizen_advocate' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    {msg.agent === 'citizen_advocate' && <span className="flex-1"></span>}
                    <span className={`text-xs font-bold ${config.textColor}`}>{config.name}</span>
                    {msg.round && <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">R{msg.round}</span>}
                  </div>
                  <div className={`${config.bgColor} border ${config.borderColor} rounded-xl p-4 text-sm text-gray-300 leading-relaxed`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Typing indicator for active agent */}
          {activeAgent && agentConfig[activeAgent as keyof typeof agentConfig] && (
            <div className={`flex gap-3 ${activeAgent === 'citizen_advocate' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${agentConfig[activeAgent as keyof typeof agentConfig].gradient} flex items-center justify-center shrink-0 animate-pulse`}>
                {(() => { const Icon = agentConfig[activeAgent as keyof typeof agentConfig].icon; return <Icon className="w-4 h-4 text-white" />; })()}
              </div>
              <div className={`${agentConfig[activeAgent as keyof typeof agentConfig].bgColor} border ${agentConfig[activeAgent as keyof typeof agentConfig].borderColor} rounded-xl px-4 py-3`}>
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}

          {/* Resolution loading */}
          {resolvingResolution && (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Moderator synthesizing final resolution...
              </div>
            </div>
          )}
        </div>
      )}

      {/* Final Resolution */}
      {resolution && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Gavel className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">Final Resolution</h4>
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {resolution}
          </div>
        </div>
      )}
    </div>
  );
}

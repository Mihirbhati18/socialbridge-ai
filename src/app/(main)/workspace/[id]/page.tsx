'use client';

import { useState, useEffect, useRef, use } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, Users, Layout, MessageSquare, FileText, Sparkles, Mail, Plus, Send, CheckCircle2, Clock, Circle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

export default function WorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [partnership, setPartnership] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [chatInput, setChatInput] = useState('');
  const [useAI, setUseAI] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/partnerships/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPartnership(data);
        setTasks(data.tasks || []);
        setMessages(data.messages || []);
        setDocuments(data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching workspace data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnershipId: id,
          eventTitle: partnership?.collabRequest?.title,
          eventDescription: partnership?.collabRequest?.description,
          eventCategory: partnership?.collabRequest?.category
        })
      });
      if (res.ok) {
        toast({ title: 'Tasks generated successfully!' });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Failed to generate tasks', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientOrg: partnership?.orgs?.[1]?.organization?.name || 'Partner',
          senderOrg: partnership?.orgs?.[0]?.organization?.name || 'Us',
          eventTitle: partnership?.collabRequest?.title,
          eventDescription: partnership?.collabRequest?.description,
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetch(`/api/partnerships/${id}/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: data.subject,
            content: data.body,
            type: 'EMAIL'
          })
        });
        toast({ title: 'Email drafted and saved to documents!' });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Failed to draft email', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateProposal = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnershipId: id,
          eventTitle: partnership?.collabRequest?.title,
          eventDescription: partnership?.collabRequest?.description,
          eventCategory: partnership?.collabRequest?.category,
        })
      });
      if (res.ok) {
        toast({ title: 'Proposal generated and saved!' });
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Failed to generate proposal', variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    
    try {
      const res = await fetch(`/api/partnerships/${id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle })
      });
      if (res.ok) {
        setNewTaskTitle('');
        fetchData();
      }
    } catch (error) {
      toast({ title: 'Failed to add task', variant: 'destructive' });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/partnerships/${id}/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status })
      });
      if (res.ok) fetchData();
    } catch (error) {
      toast({ title: 'Failed to update task', variant: 'destructive' });
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    
    // Save user message
    const newMessage = { content: userMessage, senderName: 'User', senderRole: 'USER', id: Date.now().toString() };
    setMessages(prev => [...prev, newMessage]);

    try {
      // Always save to DB
      await fetch(`/api/partnerships/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderName: 'User', senderRole: 'USER', content: userMessage })
      });

      if (useAI) {
        // Create placeholder for AI response
        const aiMessageId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { id: aiMessageId, content: '', senderName: 'SocialBridge AI', senderRole: 'SYSTEM' }]);
        
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: userMessage, context: partnership?.collabRequest?.title })
        });

        if (!res.body) return;
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let aiFullResponse = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          aiFullResponse += chunk;
          
          setMessages(prev => prev.map(msg => 
            msg.id === aiMessageId ? { ...msg, content: aiFullResponse } : msg
          ));
        }

        // Save AI message to DB
        await fetch(`/api/partnerships/${id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ senderName: 'SocialBridge AI', senderRole: 'SYSTEM', content: aiFullResponse })
        });
      }
    } catch (error) {
      toast({ title: 'Message failed', variant: 'destructive' });
    }
  };

  if (isLoading) return <div className="p-10 text-white text-center">Loading workspace...</div>;
  if (!partnership) return <div className="p-10 text-white text-center">Workspace not found.</div>;

  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{partnership.collabRequest?.title || 'Workspace'}</h1>
          <div className="flex items-center text-gray-400 text-sm gap-4">
            <span className="flex items-center"><Users className="h-4 w-4 mr-1"/> {partnership.orgs?.length || 0} Organizations</span>
            <Badge variant="outline" className="text-emerald-400 border-emerald-400/30 bg-emerald-400/10">{partnership.status}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 mb-8">
          <TabsTrigger value="overview" className="data-[state=active]:bg-white/10 data-[state=active]:text-white"><Layout className="h-4 w-4 mr-2"/> Overview</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-white/10 data-[state=active]:text-white"><CheckCircle2 className="h-4 w-4 mr-2"/> Tasks</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-white/10 data-[state=active]:text-white"><MessageSquare className="h-4 w-4 mr-2"/> Chat</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-white/10 data-[state=active]:text-white"><FileText className="h-4 w-4 mr-2"/> Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/5 border-white/10 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <p className="whitespace-pre-wrap">{partnership.collabRequest?.description || 'No description provided.'}</p>
                <div className="mt-6 space-y-2">
                  <h4 className="font-medium text-white">Partnering Organizations:</h4>
                  <ul className="list-disc pl-5">
                    {partnership.orgs?.map((o: any) => (
                      <li key={o.id}>{o.organization?.name}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-xl flex items-center"><Sparkles className="h-5 w-5 mr-2 text-yellow-400"/> AI Quick Actions</CardTitle>
                <CardDescription>Generate project assets instantly</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={handleGenerateTasks} disabled={isGenerating} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Generate Action Plan
                </Button>
                <Button onClick={handleGenerateEmail} disabled={isGenerating} className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 border-0">
                  <Mail className="h-4 w-4 mr-2" /> Draft Invitation Email
                </Button>
                <Button onClick={handleGenerateProposal} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0">
                  <FileText className="h-4 w-4 mr-2" /> Generate Full Proposal
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <form onSubmit={handleAddTask} className="flex gap-2">
            <Input 
              placeholder="New task title..." 
              value={newTaskTitle} 
              onChange={e => setNewTaskTitle(e.target.value)}
              className="bg-white/5 border-white/10 text-white max-w-md"
            />
            <Button type="submit" variant="secondary"><Plus className="h-4 w-4 mr-2"/> Add Task</Button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* TODO Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-gray-300 flex items-center"><Circle className="h-4 w-4 mr-2 text-gray-400"/> To Do</h3>
                <Badge variant="secondary" className="bg-white/10">{todoTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {todoTasks.map(task => (
                  <Card key={task.id} className="bg-white/5 border-white/10 p-4">
                    <h4 className="font-medium text-white mb-3">{task.title}</h4>
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" className="h-7 text-xs border-white/10 bg-white/5" onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}>Start</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* IN PROGRESS Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-gray-300 flex items-center"><Clock className="h-4 w-4 mr-2 text-blue-400"/> In Progress</h3>
                <Badge variant="secondary" className="bg-white/10">{inProgressTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {inProgressTasks.map(task => (
                  <Card key={task.id} className="bg-white/5 border-blue-500/30 p-4">
                    <h4 className="font-medium text-white mb-3">{task.title}</h4>
                    <div className="flex justify-between gap-2">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400 hover:text-white" onClick={() => handleUpdateTaskStatus(task.id, 'TODO')}>Back</Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" onClick={() => handleUpdateTaskStatus(task.id, 'DONE')}>Complete</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* DONE Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-semibold text-gray-300 flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-400"/> Done</h3>
                <Badge variant="secondary" className="bg-white/10">{doneTasks.length}</Badge>
              </div>
              <div className="space-y-3">
                {doneTasks.map(task => (
                  <Card key={task.id} className="bg-white/5 border-emerald-500/20 p-4 opacity-70">
                    <h4 className="font-medium text-gray-300 line-through mb-3">{task.title}</h4>
                    <div className="flex justify-start">
                      <Button size="sm" variant="ghost" className="h-7 text-xs text-gray-400 hover:text-white" onClick={() => handleUpdateTaskStatus(task.id, 'IN_PROGRESS')}>Reopen</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="h-[600px] flex flex-col bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
            <h3 className="font-medium text-white flex items-center"><MessageSquare className="h-4 w-4 mr-2"/> Workspace Chat</h3>
            <div className="flex items-center space-x-2">
              <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} />
              <Label htmlFor="ai-mode" className="text-sm text-gray-300 flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-yellow-400"/> Ask AI
              </Label>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.senderRole === 'USER' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.senderRole === 'USER' ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white' : 
                  msg.senderRole === 'SYSTEM' ? 'bg-white/10 text-gray-200 border border-white/5' : 
                  'bg-white/5 text-gray-300'
                }`}>
                  <div className="text-xs opacity-70 mb-1 font-medium">{msg.senderName}</div>
                  <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 text-sm">
                    {msg.senderRole === 'SYSTEM' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-black/20 border-t border-white/10">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder={useAI ? "Ask SocialBridge AI or message team..." : "Message team..."}
                className="bg-white/5 border-white/10 text-white"
              />
              <Button type="submit" disabled={!chatInput.trim()} className={useAI ? "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500" : ""}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          {documents.length === 0 ? (
            <div className="text-center p-12 text-gray-400">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20"/>
              <p>No documents yet. Generate some using AI Quick Actions!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {documents.map(doc => (
                <Card key={doc.id} className="bg-white/5 border-white/10">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-white">{doc.title}</CardTitle>
                      <Badge variant="outline" className="bg-white/5 border-white/10">{doc.type}</Badge>
                    </div>
                    <CardDescription>{new Date(doc.createdAt).toLocaleString()}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/30 rounded-lg p-4 max-h-60 overflow-y-auto">
                      <div className="prose prose-invert max-w-none text-sm">
                        <ReactMarkdown>{doc.content}</ReactMarkdown>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Github, Mail, Landmark, User, ArrowRight, ShieldCheck, Chrome, Globe, Sparkles, Loader2, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("public");
  const [mounted, setMounted] = useState(false);
  const [authMethod, setAuthMethod] = useState<"email" | "google">("email");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const stepParam = searchParams.get("step");
    const emailParam = searchParams.get("email");
    if (stepParam === "otp" && emailParam) {
      setEmail(emailParam);
      setAuthMethod("google");
      setStep("otp");
      handleSendOTPAuto(emailParam);
    }
  }, [searchParams]);

  const callBackend = async (endpoint: string, body: object) => {
    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Something went wrong");
    return data;
  };

  const handleSendOTPAuto = async (targetEmail: string) => {
    if (!targetEmail) return;
    setLoading(true);
    try {
      const data = await callBackend("/api/auth/auth/otp/send", { email: targetEmail });
      if (data.devCode) {
        setOtp(data.devCode);
        toast({
          title: "Development Mode",
          description: `Auto-filled code: ${data.devCode}`,
        });
      } else {
        toast({
          title: "OTP Dispatched",
          description: `A security code has been sent to ${targetEmail}.`,
          className: "bg-slate-900 border-cyan-500/50 text-white",
        });
      }
    } catch (err: any) {
      toast({ title: "Transmission Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const data = await callBackend("/api/auth/auth/otp/send", { email });
      setStep("otp");
      if (data.devCode) {
        setOtp(data.devCode);
        toast({
          title: "Development Mode",
          description: `Auto-filled code: ${data.devCode}`,
        });
      } else {
        toast({
          title: "OTP Dispatched",
          description: `Check ${email} for the verification code.`,
          className: "bg-slate-900 border-cyan-500/50 text-white",
        });
      }
    } catch (err: any) {
      toast({ title: "Transmission Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await callBackend("/api/auth/auth/otp/verify", { email, code: otp });

      const result = await signIn("trust-otp", {
        email,
        redirect: false,
      });

      if (result?.ok) {
        toast({
          title: "Authorized",
          description: "Access granted. Synchronizing session...",
          className: "bg-emerald-900/80 border-emerald-500/50 text-white",
        });
        router.push(activeTab === "municipality" ? "/municipality/dashboard" : "/dashboard");
        router.refresh();
      } else {
        toast({
          title: "Login Failed",
          description: "Could not create session. Please try again.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Verification failed", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google");
  };

  const handleGithubSignIn = () => {
    signIn("github", { callbackUrl: activeTab === "municipality" ? "/municipality/dashboard" : "/dashboard" });
  };

  const handleBackToOptions = () => {
    setAuthMethod("email");
    setStep("email");
    setEmail("");
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden selection:bg-cyan-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        {mounted && [...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full"
            initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%", opacity: Math.random() * 0.5 }}
            animate={{ y: [null, Math.random() * -100 + "px"], opacity: [0, 0.5, 0] }}
            transition={{ duration: Math.random() * 10 + 5, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-[0.05]"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 animate-pulse"></div>
              <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-cyan-500/40 relative z-10 border border-white/20">
                <Globe className="w-9 h-9 text-white" />
              </div>
            </div>
          </motion.div>
          <h1 className="text-6xl font-black text-white tracking-tighter mb-2 italic">
            SOCIAL<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-indigo-400">BRIDGE</span>
          </h1>
          <div className="flex items-center justify-center gap-2 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
            <div className="h-px w-8 bg-slate-800"></div>
            NEXT-GEN CIVIC AI
            <div className="h-px w-8 bg-slate-800"></div>
          </div>
        </div>

        <Tabs defaultValue="public" className="w-full" onValueChange={setActiveTab}>
          <div className="px-10 mb-8">
            <TabsList className="grid w-full grid-cols-2 bg-slate-900/80 border border-white/5 p-1 rounded-2xl backdrop-blur-xl relative overflow-hidden">
              <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] transition-all duration-500 ease-out rounded-xl ${activeTab === 'public' ? 'left-1 bg-cyan-500 shadow-lg shadow-cyan-500/20' : 'left-[calc(50%+2px)] bg-indigo-600 shadow-lg shadow-indigo-600/20'}`}></div>
              <TabsTrigger value="public" className="relative z-10 rounded-xl py-3.5 data-[state=active]:text-white text-slate-400 transition-colors font-black text-xs uppercase tracking-widest">
                <User className="w-4 h-4 mr-2" /> CITIZEN
              </TabsTrigger>
              <TabsTrigger value="municipality" className="relative z-10 rounded-xl py-3.5 data-[state=active]:text-white text-slate-400 transition-colors font-black text-xs uppercase tracking-widest">
                <Landmark className="w-4 h-4 mr-2" /> OFFICIAL
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-slate-900/60 border-white/10 backdrop-blur-3xl rounded-[3rem] shadow-[0_0_80px_-12px_rgba(0,0,0,0.8)] border overflow-hidden group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-500/10 pointer-events-none" />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    maskImage: 'linear-gradient(black, black), linear-gradient(black, black)',
                    maskClip: 'content-box, border-box',
                    maskComposite: 'exclude',
                    padding: '2px',
                    borderRadius: '3rem',
                  } as any}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${activeTab === 'public' ? 'from-cyan-500 via-white to-cyan-500' : 'from-indigo-500 via-white to-indigo-500'} opacity-60`} />
                </div>

                <CardHeader className="pt-10 px-10 relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl ${activeTab === 'public' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-indigo-500/10 text-indigo-400'} border border-white/5`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl font-black text-white tracking-tight">
                          {authMethod === "google" ? "Google Verification" : activeTab === "public" ? "Citizen Entry" : "Command Access"}
                        </CardTitle>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {authMethod === "google" ? "Secure Email Gateway" : "Secure Terminal"}
                        </p>
                      </div>
                    </div>
                    {loading && <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />}
                  </div>
                  <CardDescription className="text-slate-400 font-medium leading-relaxed">
                    {authMethod === "google"
                      ? "Enter the email associated with your Google account to receive a secure verification code."
                      : activeTab === "public"
                        ? "Access your community dashboard and start making an impact with AI-driven civic engagement."
                        : "Authorized access only. Enter your municipal credentials to access the command center."}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-8 px-10 pb-10 pt-4 relative">
                  {authMethod === "google" && step === "email" && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 mb-2"
                    >
                      <button
                        type="button"
                        onClick={handleBackToOptions}
                        className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                      >
                        <ChevronLeft className="w-3 h-3" /> Back
                      </button>
                      <div className="flex items-center gap-2 ml-auto">
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                          <Chrome className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">Google Sign-In</span>
                      </div>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    {step === "email" ? (
                      <motion.form
                        key="email-form"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onSubmit={handleSendOTP}
                        className="space-y-5"
                      >
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-1">Email Terminal</Label>
                          <div className="relative group">
                            <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                            <Mail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors z-10 ${activeTab === 'public' ? 'group-focus-within:text-cyan-400' : 'group-focus-within:text-indigo-400'} text-slate-500`} />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-slate-950/80 border-white/5 pl-14 h-16 rounded-2xl focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-white placeholder:text-slate-700 relative z-10 font-medium"
                            />
                          </div>
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className={`w-full h-16 rounded-2xl font-black text-sm tracking-[0.1em] shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden group ${activeTab === 'public' ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <span className="relative flex items-center justify-center gap-3">
                            SEND VERIFICATION CODE <ArrowRight className="w-5 h-5" />
                          </span>
                        </Button>
                      </motion.form>
                    ) : (
                      <motion.form
                        key="otp-form"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onSubmit={handleVerifyOTP}
                        className="space-y-6"
                      >
                        <div className="space-y-4 text-center">
                          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Security Verification Code</Label>
                          <div className="flex justify-center gap-2">
                            <Input
                              type="text"
                              placeholder="······"
                              required
                              maxLength={6}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              className="bg-slate-950/80 border-white/5 h-24 text-center text-5xl font-black tracking-[0.4em] rounded-3xl focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 text-white w-full shadow-inner transition-all"
                            />
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium bg-white/5 py-2 px-4 rounded-full inline-block mx-auto">
                            Encrypted code sent to <span className="text-slate-300 font-bold">{email}</span>
                          </p>
                        </div>
                        <Button
                          type="submit"
                          disabled={loading}
                          className={`w-full h-16 rounded-2xl font-black text-sm tracking-[0.1em] shadow-2xl transition-all active:scale-[0.98] relative overflow-hidden group ${activeTab === 'public' ? 'bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
                        >
                          <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                          <span className="relative">VERIFY & DECRYPT ACCESS</span>
                        </Button>
                        <button
                          type="button"
                          onClick={() => setStep("email")}
                          className="w-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors"
                        >
                          ← Request New Code
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                    <div className="relative flex justify-center text-[9px] uppercase font-black tracking-[0.3em] text-slate-600">
                      <span className="bg-[#020617]/50 backdrop-blur-md px-4">Direct Uplink</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={handleGoogleSignIn}
                      className="h-14 rounded-2xl bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-white group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors z-10">
                        <Chrome className="w-4 h-4 text-white" />
                      </div>
                      <span className="z-10">Google</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleGithubSignIn}
                      className="h-14 rounded-2xl bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-white group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-white/10 transition-colors z-10">
                        <Github className="w-4 h-4 text-white" />
                      </div>
                      <span className="z-10">Github</span>
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="bg-white/[0.03] border-t border-white/5 py-6 px-10 flex justify-center relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                  <p className="text-[10px] font-black text-slate-500 flex items-center gap-3 uppercase tracking-widest">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    End-to-End Quantum Secure
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>
        </Tabs>

        <p className="mt-8 text-center text-[10px] font-black text-slate-700 uppercase tracking-[0.4em]">
          Powered by Nexora AI Core v4.0.2
        </p>
      </motion.div>
    </div>
  );
}

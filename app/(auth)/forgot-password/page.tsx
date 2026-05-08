"use client";
import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Mail, ShieldCheck, Globe } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email })
    });
    if (res.ok) setSent(true);
    setLoading(false);
  };

  return (
    <div className="bg-background text-foreground flex flex-col font-sans ">
      
      <main className="flex-1 flex p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* CONTAINER RỘNG (WIDE LAYOUT) */}
        <div className="w-full max-w-5xl bg-background border-y-4 border-foreground py-20 px-6 md:px-16 lg:px-24 relative overflow-hidden shadow-sm">
          
          {/* Họa tiết trang trí góc (Typography Deco) - Làm web trông đầy đặn hơn */}
          <div className="absolute top-4 right-6 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30 hidden md:block">
            HQ Streetwear // Recovery Protocol v.26
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* PHẦN TIÊU ĐỀ (Bên trái hoặc phía trên) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-block bg-primary text-primary-foreground px-3 py-1 text-[8px] font-black uppercase italic tracking-widest">
                Account Security
              </div>
              <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-[0.85] text-foreground">
                Lost<br />Access<span className="text-primary">.</span>
              </h1>
              <div className="h-1 w-24 bg-primary" />
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest leading-relaxed max-w-xs">
                Provide your identification email to re-establish your connection to the HQ archive.
              </p>
            </div>

            {/* PHẦN FORM (Bên phải - Rộng rãi) */}
            <div className="lg:col-span-7">
              {!sent ? (
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                       <label className="text-[10px] font-black uppercase text-foreground italic tracking-[0.2em]">Registered Email</label>
                       <span className="text-[8px] text-muted-foreground uppercase font-bold">Verification step 01</span>
                    </div>
                    <div className="relative">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        <Mail size={24} className="text-primary" />
                      </div>
                      <input 
                        type="text" 
                        inputMode="email"
                        autoComplete="one-time-code"
                        placeholder="your@email.com" 
                        // SỬA: Font to hơn, input rộng hơn, không ép uppercase
                        className="w-full bg-transparent border-b-2 border-border p-6 pl-10 text-2xl font-medium outline-none focus:border-primary transition-all relative z-10 cursor-text placeholder:text-muted-foreground/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <Button 
                      disabled={loading} 
                      className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground py-10 rounded-none font-black uppercase italic text-md transition-all cursor-pointer shadow-xl group"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin h-6 w-6" />
                      ) : (
                        <span className="flex items-center gap-3">
                          Reset Password <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                        </span>
                      )}
                    </Button>

                    <div className="flex flex-col gap-2">
                       <p className="text-[9px] text-muted-foreground font-bold uppercase">Need more help?</p>
                       <a 
                        href="/login" 
                        className="text-[10px] font-black uppercase text-primary hover:text-foreground transition-colors italic cursor-pointer tracking-widest border-b border-primary w-fit"
                      >
                        Return to Login
                      </a>
                    </div>
                  </div>

                  {/* Footer trang trí trong Card */}
                  <div className="pt-12 border-t border-border/50 flex gap-10">
                      <div className="flex items-center gap-2 text-muted-foreground/40">
                        <ShieldCheck size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Secure SSL</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground/40">
                        <Globe size={14} />
                        <span className="text-[8px] font-black uppercase tracking-widest">Global Access</span>
                      </div>
                  </div>
                </form>
              ) : (
                /* TRẠNG THÁI THÀNH CÔNG */
                <div className="py-10 space-y-8 animate-in fade-in slide-in-from-right-10 duration-700">
                   <div className="bg-primary/10 border-l-4 border-primary p-8">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 text-foreground">Link Dispatched.</h3>
                      <p className="text-muted-foreground text-sm font-medium italic leading-relaxed">
                        A recovery transmission has been sent to <span className="text-foreground font-black underline">{email}</span>. 
                        Please authorize the request via the provided link within 60 minutes.
                      </p>
                   </div>
                   <Button 
                     onClick={() => window.location.href = "/login"}
                     className="bg-foreground text-background py-8 px-12 rounded-none font-black uppercase italic text-xs cursor-pointer hover:bg-primary transition-all shadow-lg"
                   >
                     Back to Base
                   </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
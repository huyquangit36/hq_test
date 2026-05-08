"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldAlert, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.user.role !== "admin") {
          toast.error("ACCESS DENIED", {
            description: "Unauthorized privileges detected. Attempt logged.",
            style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--destructive)' }
          });
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          toast.success("AUTHORIZATION GRANTED", { description: "Establishing secure terminal link..." });
          setTimeout(() => router.push("/admin"), 1500);
        }
      } else {
        toast.error("INVALID CREDENTIALS", { description: data.error });
      }
    } catch (err) {
      toast.error("SYSTEM ERROR", { description: "Connection to core terminal failed." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans">
      <Toaster position="top-center" theme="light" />
      
      <div className="w-full max-w-xl animate-in fade-in zoom-in-95 duration-700">
        <div className="text-center mb-12">
          <div className="inline-block p-5 bg-primary/10 border border-primary/20 rounded-none mb-8">
            <Lock className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-6xl font-black uppercase italic tracking-tighter leading-none">
            Admin<br />Terminal<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.4em] mt-6 italic">
            Restricted Entry // Authorization Required
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-6">
          {/* Box Form bề thế max-w-xl */}
          <div className="bg-background border-y-4 border-foreground p-10 md:p-16 shadow-2xl shadow-primary/5 space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-foreground tracking-widest pl-1 italic">Administrator ID</label>
              <input 
                type="text" 
                inputMode="email"
                autoComplete="one-time-code"
                placeholder="UID@HQSTREETWEAR.COM"
                className="w-full bg-muted/20 border border-border p-5 text-sm font-medium outline-none focus:border-primary transition-none cursor-text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase text-foreground tracking-widest pl-1 italic">Security Access Key</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-muted/20 border border-border p-5 text-sm font-medium outline-none focus:border-primary transition-none cursor-text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <Button 
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground py-10 rounded-none font-black uppercase italic text-lg transition-all cursor-pointer group shadow-xl"
            >
              {loading ? <Loader2 className="animate-spin size-6" /> : (
                <span className="flex items-center gap-3">
                    Initialize Session <ArrowRight className="size-6 group-hover:translate-x-2 transition-transform" />
                </span>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-12 flex justify-center gap-8 opacity-20">
            <div className="flex items-center gap-2">
                <ShieldCheck size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest">Protocol 256-BIT</span>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest">HQ SYSTEM v.26</span>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, ShieldAlert, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // KIỂM TRA QUYỀN ADMIN
        if (data.user.role !== "admin") {
          setError("ACCESS DENIED: Unauthorized privileges.");
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/admin"); // Vào thẳng dashboard
        }
      } else {
        setError(data.error || "Invalid credentials.");
      }
    } catch (err) {
      setError("System connection failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block p-4 bg-red-600/10 rounded-full mb-4">
            <Lock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Admin Auth<span className="text-red-600">.</span></h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Restricted Terminal Access</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div className="space-y-4 bg-zinc-950 border border-zinc-900 p-8 shadow-2xl">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-600">Administrator ID</label>
              <input 
                type="email" 
                placeholder="ADMIN@HQ.COM"
                className="w-full bg-black border border-zinc-800 p-4 text-xs font-bold text-white focus:border-red-600 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-zinc-600">Security Key</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full bg-black border border-zinc-800 p-4 text-xs font-bold text-white focus:border-red-600 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 border border-red-500/20 animate-in fade-in slide-in-from-top-1">
                <ShieldAlert size={14} />
                <span className="text-[10px] font-black uppercase italic">{error}</span>
              </div>
            )}

            <Button 
              disabled={loading}
              className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-8 rounded-none font-black uppercase italic transition-all group"
            >
              {loading ? <Loader2 className="animate-spin" /> : (
                <>Initialize Session <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </Button>
          </div>
        </form>

        <p className="text-center text-[9px] text-zinc-700 uppercase font-bold tracking-widest italic">
          Unauthorized access attempt will be logged and reported.
        </p>
      </div>
    </div>
  );
}
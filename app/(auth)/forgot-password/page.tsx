"use client";
import { useState } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight, Mail } from "lucide-react";

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
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8 bg-zinc-950 border border-zinc-900 p-10">
          <div className="text-center">
            <h1 className="text-4xl font-black uppercase italic tracking-tighter">Lost Access.</h1>
            <p className="text-zinc-500 text-[10px] uppercase font-bold mt-2 tracking-widest">Enter email to recover account</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-700" />
                <input 
                  type="email" 
                  placeholder="YOUR@EMAIL.COM" 
                  className="w-full bg-black border border-zinc-900 p-4 pl-10 text-xs font-bold outline-none focus:border-red-600 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button disabled={loading} className="w-full bg-white text-black hover:bg-red-600 hover:text-white py-8 rounded-none font-black uppercase italic">
                {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
              </Button>
            </form>
          ) : (
            <div className="text-center p-6 bg-red-600/10 border border-red-600/20">
               <p className="text-sm font-bold italic">Check your inbox. Link sent.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
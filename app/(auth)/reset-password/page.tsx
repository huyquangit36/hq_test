"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Eye, EyeOff, XCircle, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";


function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
        setIsValidToken(false);
        return;
    }
    fetch(`/api/auth/verify-token?token=${token}`)
      .then(res => {
        if (res.ok) setIsValidToken(true);
        else setIsValidToken(false);
      })
      .catch(() => setIsValidToken(false));
  }, [token]);

  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isMatch = password === confirmPassword && confirmPassword !== "";

  const canSubmit = hasLength && hasUpper && hasLower && hasNumber && isMatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });

      if (res.ok) {
        setSuccess(true);
        toast.success("CREDENTIALS UPDATED", {
            description: "Your password has been successfully reset.",
            style: { background: 'var(--background)', color: 'var(--foreground)', border: '1px solid var(--primary)' }
        });
      } else {
        toast.error("INVALID SESSION", { description: "The reset link is expired or invalid." });
      }
    } catch (err) {
      toast.error("CONNECTION ERROR");
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="w-full max-w-xl bg-background border border-border p-12 text-center space-y-8 shadow-2xl shadow-primary/5 animate-in fade-in zoom-in-95">
        <XCircle className="h-24 w-24 text-destructive/20 mx-auto" />
        <h1 className="text-5xl font-black uppercase italic text-foreground tracking-tighter">Link Expired.</h1>
        <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest italic">The recovery transmission is no longer valid.</p>
        <Button onClick={() => router.push("/login")} className="bg-foreground text-background hover:bg-primary transition-all rounded-none font-black uppercase italic px-12 py-8 cursor-pointer shadow-lg">Return to Login</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-xl bg-background border border-border p-12 text-center space-y-8 shadow-2xl shadow-primary/5 animate-in zoom-in-95 duration-500">
        <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20">
            <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-5xl font-black uppercase italic text-foreground tracking-tighter">Success.</h2>
        <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">Your HQ identity has been secured.</p>
        <Button onClick={() => router.push("/login")} className="bg-foreground text-background hover:bg-primary w-full rounded-none font-black uppercase italic py-8 cursor-pointer shadow-lg">Authorize Login</Button>
      </div>
    );
  }

  if (isValidToken === null) return <div className="flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary h-12 w-12" /><p className="text-[10px] font-black uppercase italic text-muted-foreground tracking-[0.5em]">Verifying Link...</p></div>;

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl bg-background border border-border p-10 md:p-14 shadow-2xl shadow-primary/5 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground leading-none">New<br />Credentials<span className="text-primary">.</span></h1>
        <p className="text-muted-foreground text-[10px] font-black uppercase mt-4 italic tracking-[0.3em] border-b border-border pb-4">Security Protocol 09-X</p>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-foreground tracking-widest pl-1 italic">New Password</label>
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"} 
              className="w-full bg-muted/20 border border-border p-4 pr-12 text-sm font-medium text-foreground outline-none focus:border-primary transition-none cursor-text relative z-10"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              autoComplete="new-password"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-muted-foreground hover:text-primary cursor-pointer transition-colors p-1">
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* ĐIỀU KIỆN MẬT KHẨU - TÔNG MÀU MINT/NAVY */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-muted/30 p-6 border border-border">
           <CheckItem label="8+ Characters" valid={hasLength} />
           <CheckItem label="Uppercase (A-Z)" valid={hasUpper} />
           <CheckItem label="Lowercase (a-z)" valid={hasLower} />
           <CheckItem label="Numbers (0-9)" valid={hasNumber} />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-foreground tracking-widest pl-1 italic">Confirm Identity</label>
          <input 
            type="password" 
            className="w-full bg-muted/20 border border-border p-4 text-sm font-medium text-foreground outline-none focus:border-primary transition-none cursor-text"
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
            autoComplete="new-password"
          />
          <div className="pt-2">
            <CheckItem label="Passwords Match" valid={isMatch} />
          </div>
        </div>
      </div>

      <Button 
        disabled={loading || !canSubmit} 
        className="w-full mt-10 bg-foreground text-background hover:bg-primary hover:text-primary-foreground py-10 rounded-none font-black uppercase italic text-sm transition-all shadow-xl cursor-pointer disabled:opacity-30 group"
      >
        {loading ? (
            <Loader2 className="animate-spin size-6" />
        ) : (
            <span className="flex items-center gap-3">Authorize Change <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></span>
        )}
      </Button>

      <div className="mt-8 flex justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} />
            <span className="text-[8px] font-black uppercase tracking-widest">SSL Encrypted Recovery</span>
          </div>
      </div>
    </form>
  );
}

function CheckItem({ label, valid }: { label: string, valid: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter transition-all duration-300 ${valid ? 'text-primary' : 'text-muted-foreground/30'}`}>
      {valid ? <Check size={12} strokeWidth={5} /> : <div className="w-[10px] h-[10px] border-2 border-muted-foreground/20" />}
      {label}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="bg-background text-foreground flex flex-col font-sans">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <Suspense fallback={<div className="flex flex-col items-center gap-4"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
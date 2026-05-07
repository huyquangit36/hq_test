"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Eye, EyeOff, XCircle, Check } from "lucide-react";

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

  // 1. KIỂM TRA TOKEN KHI VỪA VÀO TRANG
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

  // 2. THUẬT TOÁN KIỂM TRA (SỬA LẠI CHUẨN XÁC)
  const hasLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password); // Kiểm tra chữ HOA
  const hasLower = /[a-z]/.test(password); // Kiểm tra chữ thường
  const hasNumber = /[0-9]/.test(password); // Kiểm tra số
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

      if (res.ok) setSuccess(true);
      else alert("Lỗi: Link không hợp lệ hoặc đã hết hạn.");
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === false) {
    return (
      <div className="text-center space-y-8 animate-in fade-in duration-700">
        <XCircle className="h-24 w-24 text-red-600 opacity-20 mx-auto" />
        <h1 className="text-4xl font-black uppercase italic text-white text-center">Invalid Link.</h1>
        <div className="flex justify-center">
            <Button onClick={() => router.push("/")} className="bg-white text-black rounded-none uppercase font-black italic px-12 py-8">Return to HQ.</Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-sm bg-zinc-950 border border-zinc-900 p-12 text-center space-y-8 animate-in zoom-in">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        <h2 className="text-3xl font-black uppercase italic text-white">Success.</h2>
        <Button onClick={() => router.push("/login")} className="bg-white text-black w-full rounded-none font-black uppercase italic py-8">Login Now</Button>
      </div>
    );
  }

  if (isValidToken === null) return <div className="flex justify-center"><Loader2 className="animate-spin text-red-600 h-10 w-10" /></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 w-full max-w-md bg-zinc-950 border border-zinc-900 p-10 shadow-2xl">
      <div className="text-center">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">New Credentials.</h1>
        <p className="text-zinc-500 text-[10px] uppercase font-bold mt-2 italic tracking-[0.3em] border-b border-zinc-900 pb-4">Security Protocol 09-X</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest pl-1">New Password</label>
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"} 
              className="w-full bg-black border border-zinc-800 p-4 pr-12 text-xs font-bold text-white focus:border-red-600 outline-none transition-all tracking-widest"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* CỘT ĐIỀU KIỆN - ĐÃ SỬA THỨ TỰ NHÃN CHUẨN */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4 bg-black/50 p-4 border border-zinc-900/50">
           <CheckItem label="8+ Characters" valid={hasLength} />
           <CheckItem label="Uppercase (A-Z)" valid={hasUpper} />
           <CheckItem label="Lowercase (a-z)" valid={hasLower} />
           <CheckItem label="Numbers (0-9)" valid={hasNumber} />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase text-zinc-500 tracking-widest pl-1">Confirm Identity</label>
          <input 
            type="password" 
            className="w-full bg-black border border-zinc-800 p-4 text-xs font-bold text-white focus:border-red-600 outline-none transition-all uppercase tracking-widest"
            value={confirmPassword} 
            onChange={(e) => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>

        {/* PASSWORDS MATCH - NẰM DƯỚI CONFIRM THEO YÊU CẦU */}
        <div className="pl-1">
           <CheckItem label="Passwords Match" valid={isMatch} />
        </div>
      </div>

      <Button 
        disabled={loading || !canSubmit} 
        className="w-full bg-red-600 text-white hover:bg-red-700 py-10 rounded-none font-black uppercase italic transition-all disabled:opacity-20 disabled:grayscale"
      >
        {loading ? <Loader2 className="animate-spin" /> : "Authorize Change"}
      </Button>
    </form>
  );
}

function CheckItem({ label, valid }: { label: string, valid: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-tighter transition-all duration-300 ${valid ? 'text-green-500' : 'text-zinc-800'}`}>
      {valid ? <Check size={10} strokeWidth={5} /> : <div className="w-[10px] h-[10px] border border-zinc-900" />}
      {label}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<Loader2 className="animate-spin text-red-600" />}>
          <ResetPasswordForm />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
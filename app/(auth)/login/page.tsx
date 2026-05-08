"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Field, 
  FieldGroup, 
  FieldLabel, 
  FieldError 
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Login failed")

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Container - Giữ Layout Card của bạn nhưng đổi màu và góc vuông */}
      <div className="bg-background border border-border rounded-none p-8 shadow-2xl shadow-primary/5">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground leading-none">
            Welcome Back<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-3 italic">
            Authorize HQ Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FieldGroup className="">
            {/* Email Field - ĐÃ FIX LAG */}
            <Field>
              <FieldLabel htmlFor="email" className="text-[10px] md:text-[18px] font-black uppercase tracking-widest text-foreground italic">Email Address</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary z-20 pointer-events-none" />
                <Input
                  id="email"
                  name="email"
                  type="text"
                  inputMode="email"
                  placeholder="YOU@HQSTREETWEAR.COM"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  autoComplete="new-password" 
                  className={cn(
                    "pl-10 pt-5 pb-5 bg-muted/20 border-border rounded-none text-xs font-bold italic focus:border-primary transition-none relative z-10",
                    "cursor-text"
                  )}
                />
              </div>
            </Field>

            {/* Password Field */}
            <Field>
              <div className="flex items-center justify-between mb-1">
                <FieldLabel htmlFor="password" className="text-[10px] md:text-[18px] font-black uppercase tracking-widest text-foreground italic">Password</FieldLabel>
                <Link 
                  href="/forgot-password" 
                  className="text-[9px] md:text-[12px] font-black uppercase tracking-tighter text-primary hover:text-foreground transition-colors italic cursor-pointer"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary z-20 pointer-events-none" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pt-5 pb-5 pr-10 bg-muted/20 border-border rounded-none text-xs focus:border-primary transition-colors cursor-text relative z-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors cursor-pointer z-30 p-1"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </Field>

            {/* Error Message */}
            {error && (
              <div className="bg-destructive/10 border-l-2 border-destructive p-3">
                <p className="text-[10px] font-black uppercase italic text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground py-7 rounded-none font-black uppercase italic text-sm transition-all cursor-pointer group shadow-lg"
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </FieldGroup>
        </form>

        {/* Divider - Padding tinh chỉnh gọn gàng (< 10px) */}
        <div className="relative mt-8 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
            <span className="bg-background px-4 text-muted-foreground italic">New to the Pack?</span>
          </div>
        </div>

        {/* Register Link */}
        <div className="mt-2">
          <Link href="/register">
            <Button variant="outline" className="w-full border-border rounded-none font-black uppercase italic text-[10px] py-6 hover:bg-muted/50 cursor-pointer transition-all" size="lg">
              Create an Account
            </Button>
          </Link>
        </div>
      </div>

      {/* Terms */}
      <p className="text-center text-[8px] font-bold text-muted-foreground mt-4 uppercase tracking-widest px-6 leading-relaxed">
        By signing in, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:text-foreground transition-colors">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:text-foreground transition-colors">Privacy Policy</Link>
      </p>
    </div>
  )
}
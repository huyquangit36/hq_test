"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Loader2 } from "lucide-react"

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
import { Toaster, toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
    setFieldErrors(prev => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}
    if (!formData.firstName.trim()) errors.firstName = "Required"
    if (!formData.lastName.trim()) errors.lastName = "Required"
    if (!formData.email.trim()) {
      errors.email = "Required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid format"
    }
    if (formData.password.length < 8) errors.password = "Minimum 8 chars"
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Mismatch"

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Registration failed")

      toast.success("ACCOUNT CREATED", {
        description: "Welcome to the collective. Redirecting...",
      })

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      setTimeout(() => {
        router.push("/")
        router.refresh()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    
    <div className="w-full max-w-xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Container chính - Nền trắng Mint nhạt */}
      <div className="bg-background border border-border rounded-none p-8 md:p-12 shadow-2xl shadow-primary/5">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground leading-none">
            Join the Pack<span className="text-primary">.</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-4 italic">
            Initialize your HQ Identification
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FieldGroup className="space-y-6">
            
            {/* Tên - Chia 2 cột */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="text-[10px] font-black uppercase text-foreground italic tracking-widest pl-1">First Name</FieldLabel>
                <Input
                  name="firstName"
                  placeholder="JOHN"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="bg-muted/20 border-border rounded-none text-xs font-bold focus:border-primary transition-none"
                />
              </Field>
              <Field>
                <FieldLabel className="text-[10px] font-black uppercase text-foreground italic tracking-widest pl-1">Last Name</FieldLabel>
                <Input
                  name="lastName"
                  placeholder="DOE"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="bg-muted/20 border-border rounded-none text-xs font-bold focus:border-primary transition-none"
                />
              </Field>
            </div>

            {/* Email - Đã fix lag */}
            <Field>
              <FieldLabel className="text-[10px] font-black uppercase text-foreground italic tracking-widest pl-1">Email Address</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary z-20 pointer-events-none" />
                <Input
                  name="email"
                  type="text"
                  inputMode="email"
                  autoComplete="one-time-code"
                  placeholder="YOU@HQSTREETWEAR.COM"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="pl-10 bg-muted/20 border-border rounded-none text-xs font-bold focus:border-primary transition-none relative z-10"
                />
              </div>
            </Field>

            {/* Password */}
            <Field>
              <FieldLabel className="text-[10px] font-black uppercase text-foreground italic tracking-widest pl-1">Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary z-20 pointer-events-none" />
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 bg-muted/20 border-border rounded-none text-xs font-bold focus:border-primary transition-none relative z-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer z-30"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Chỉ số bảo mật - Phong cách Industrial */}
              {formData.password && (
                <div className="mt-3 flex gap-4">
                  <PasswordCheck label="8+ chars" passed={passwordChecks.length} />
                  <PasswordCheck label="Uppercase" passed={passwordChecks.uppercase} />
                  <PasswordCheck label="Number" passed={passwordChecks.number} />
                </div>
              )}
            </Field>

            {/* Confirm Password */}
            <Field>
              <FieldLabel className="text-[10px] font-black uppercase text-foreground italic tracking-widest pl-1">Confirm Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-primary z-20 pointer-events-none opacity-40" />
                <Input
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="RE-ENTER PASSWORD"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="pl-10 pr-10 bg-muted/20 border-border rounded-none text-xs font-bold focus:border-primary transition-none relative z-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary cursor-pointer z-30"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && (
              <div className="bg-destructive/10 border-l-2 border-destructive p-3">
                <p className="text-[10px] font-black uppercase italic text-destructive">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-foreground text-background hover:bg-primary hover:text-primary-foreground py-8 rounded-none font-black uppercase italic text-sm transition-all cursor-pointer group shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>
          </FieldGroup>
        </form>

        {/* Divider - Padding tinh chỉnh gọn gàng < 10px */}
        <div className="relative mt-8 mb-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.4em]">
            <span className="bg-background px-4 text-muted-foreground italic">Already Authorized?</span>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-2">
          <Link href="/login">
            <Button variant="outline" className="w-full border-border rounded-none font-black uppercase italic text-[10px] py-6 hover:bg-muted/50 cursor-pointer transition-all">
              Sign In to Base
            </Button>
          </Link>
        </div>
      </div>

      {/* Điều khoản */}
      <p className="text-center text-[8px] font-bold text-muted-foreground mt-6 uppercase tracking-widest px-6 leading-relaxed">
        By joining the collective, you agree to our{" "}
        <Link href="/terms" className="text-primary hover:text-foreground transition-colors">Terms of Service</Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary hover:text-foreground transition-colors">Privacy Policy</Link>
      </p>
    </div>
  )
}

// Component phụ hiển thị check mật khẩu
function PasswordCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${passed ? "text-primary" : "text-muted-foreground/40"}`}>
      <Check className={`size-3 ${passed ? "opacity-100" : "opacity-0"}`} />
      <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
    </div>
  )
}
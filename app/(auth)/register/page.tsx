"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Field, 
  FieldGroup, 
  FieldLabel, 
  FieldError,
  FieldDescription 
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
    setFieldErrors(prev => ({ ...prev, [name]: "" }))
  }

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "Last name is required"
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      errors.password = "Password is required"
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters"
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Password strength indicators
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Store the JWT token in localStorage
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))

      // Redirect to homepage
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Card Container */}
      <div className="bg-card border border-border rounded-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Create Account
          </h1>
          <p className="text-muted-foreground mt-2">
            Join HQ Streetwear and get exclusive access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {/* Name Fields - Side by side */}
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="pl-10"
                    autoComplete="given-name"
                    aria-invalid={!!fieldErrors.firstName}
                  />
                </div>
                {fieldErrors.firstName && (
                  <FieldError>{fieldErrors.firstName}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  aria-invalid={!!fieldErrors.lastName}
                />
                {fieldErrors.lastName && (
                  <FieldError>{fieldErrors.lastName}</FieldError>
                )}
              </Field>
            </div>

            {/* Email Field */}
            <Field>
              <FieldLabel htmlFor="email">Email Address</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  autoComplete="email"
                  aria-invalid={!!fieldErrors.email}
                />
              </div>
              {fieldErrors.email && (
                <FieldError>{fieldErrors.email}</FieldError>
              )}
            </Field>

            {/* Password Field */}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <FieldError>{fieldErrors.password}</FieldError>
              )}
              
              {/* Password Strength Indicators */}
              {formData.password && (
                <div className="mt-3 space-y-1.5">
                  <FieldDescription>Password must have:</FieldDescription>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <PasswordCheck 
                      label="8+ characters" 
                      passed={passwordChecks.length} 
                    />
                    <PasswordCheck 
                      label="Uppercase" 
                      passed={passwordChecks.uppercase} 
                    />
                    <PasswordCheck 
                      label="Lowercase" 
                      passed={passwordChecks.lowercase} 
                    />
                    <PasswordCheck 
                      label="Number" 
                      passed={passwordChecks.number} 
                    />
                  </div>
                </div>
              )}
            </Field>

            {/* Confirm Password Field */}
            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="pl-10 pr-10"
                  autoComplete="new-password"
                  aria-invalid={!!fieldErrors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <FieldError>{fieldErrors.confirmPassword}</FieldError>
              )}
            </Field>

            {/* Error Message */}
            {error && (
              <FieldError>{error}</FieldError>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner className="mr-2" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </FieldGroup>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-card px-4 text-muted-foreground">
              Already have an account?
            </span>
          </div>
        </div>

        {/* Login Link */}
        <Link href="/login">
          <Button variant="outline" className="w-full" size="lg">
            Sign In Instead
          </Button>
        </Link>
      </div>

      {/* Terms */}
      <p className="text-center text-sm text-muted-foreground mt-6">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-accent hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-accent hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}

function PasswordCheck({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 ${passed ? "text-green-500" : "text-muted-foreground"}`}>
      <Check className={`size-3 ${passed ? "opacity-100" : "opacity-40"}`} />
      <span>{label}</span>
    </div>
  )
}

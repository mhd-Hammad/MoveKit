"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Logo } from "@/components/shared/logo"

type Step = "email" | "otp" | "newpass"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email) { setError("Enter your email"); return }

    setIsLoading(true)
    try {
      // Send OTP (the API will send regardless — it doesn't check user existence for privacy)
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) { setSuccess("If an account exists with this email, a code has been sent."); setStep("otp") }
      else setError(data.error)
    } catch { setError("Network error") }
    setIsLoading(false)
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (otp.length !== 6) { setError("Enter 6-digit code"); return }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters"); return }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess("Password reset! Redirecting to login...")
        setTimeout(() => router.push("/login"), 2000)
      } else setError(data.error)
    } catch { setError("Network error") }
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/"><Logo size="lg" /></Link>
        </div>

        <Card className="border-0 shadow-xl shadow-black/5">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
            <CardDescription>
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "otp" && `Enter the code sent to ${email}`}
              {step === "newpass" && "Set your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {step === "email" && (
              <form onSubmit={handleSendCode} className="space-y-4">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoFocus
                  className="h-11"
                />
                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                {success && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
                <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={(e) => { e.preventDefault(); setStep("newpass") }} className="space-y-4">
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  required
                  autoFocus
                  className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                />
                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={otp.length !== 6}>
                  Continue
                </Button>
              </form>
            )}

            {step === "newpass" && (
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Create a strong password"
                      required
                      autoFocus
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                    <span className={newPassword.length >= 8 ? "text-green-600 font-medium" : "text-gray-400"}>
                      {newPassword.length >= 8 ? "✓" : "○"} 8+ chars
                    </span>
                    <span className={/[A-Z]/.test(newPassword) ? "text-green-600 font-medium" : "text-gray-400"}>
                      {/[A-Z]/.test(newPassword) ? "✓" : "○"} Uppercase
                    </span>
                    <span className={/[a-z]/.test(newPassword) ? "text-green-600 font-medium" : "text-gray-400"}>
                      {/[a-z]/.test(newPassword) ? "✓" : "○"} Lowercase
                    </span>
                    <span className={/[0-9]/.test(newPassword) ? "text-green-600 font-medium" : "text-gray-400"}>
                      {/[0-9]/.test(newPassword) ? "✓" : "○"} Number
                    </span>
                    <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-green-600 font-medium" : "text-gray-400"}>
                      {/[^A-Za-z0-9]/.test(newPassword) ? "✓" : "○"} Special
                    </span>
                  </div>
                </div>
                {error && <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
                {success && <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>}
                <Button
                  type="submit"
                  className="w-full h-11 gradient-primary border-0 text-white"
                  disabled={isLoading || newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>
              </form>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground">
              <Link href="/login" className="text-primary hover:underline font-medium">Back to Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

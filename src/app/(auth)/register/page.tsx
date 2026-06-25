"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Step = "role" | "details" | "email" | "otp"
type UserRole = "incoming" | "outgoing"

interface Campus {
  id: string
  name: string
  university_domains?: { university_name: string; country: string; domain: string }
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("role")
  const [role, setRole] = useState<UserRole | "">("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [selectedCampus, setSelectedCampus] = useState("")
  const [currentCountry, setCurrentCountry] = useState("")
  const [campuses, setCampuses] = useState<Campus[]>([])
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetch("/api/campuses")
      .then(r => r.json())
      .then(data => { if (data.data) setCampuses(data.data) })
      .catch(() => {})
  }, [])

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep("details")
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!name.trim() || name.length < 2) {
      setError("Name must be at least 2 characters")
      return
    }
    if (!selectedCampus) {
      setError("Please select your university")
      return
    }
    setStep("email")
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email.includes("@") || !email.includes(".")) {
      setError("Please enter a valid email address")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to send code")
        return
      }
      setSuccess(data.message)
      setStep("otp")
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit code")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Verification failed")
        return
      }

      // Update profile with collected info
      if (data.user?.id) {
        await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: data.user.id,
            display_name: name.trim(),
          }),
        })

        // Store user with extra info
        const userData = {
          ...data.user,
          display_name: name.trim(),
          role_type: role,
          campus_id: selectedCampus,
          current_country: currentCountry,
        }
        localStorage.setItem("movekit_user", JSON.stringify(userData))
      }

      setSuccess("✓ Account created! Redirecting...")
      setTimeout(() => router.push("/dashboard"), 1000)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-white">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
            <span className="text-2xl">📦</span>
          </div>
          <h2 className="text-3xl font-bold">Join MoveKit</h2>
          <p className="mt-4 text-blue-100 leading-relaxed">
            {role === "incoming"
              ? "As an incoming student, you'll get an AI-generated survival blueprint and be matched with outgoing students selling what you need."
              : role === "outgoing"
              ? "As an outgoing student, you can list items for sale, help newcomers with tips, and earn trust badges."
              : "Whether you're arriving or departing — MoveKit makes university transitions smooth and safe."}
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">1</div>
              <span className={step === "role" ? "text-white font-medium" : ""}>Choose your role</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">2</div>
              <span className={step === "details" ? "text-white font-medium" : ""}>Tell us about you</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">3</div>
              <span className={step === "email" || step === "otp" ? "text-white font-medium" : ""}>Verify university email</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <span className="text-lg text-white">📦</span>
              </div>
              <span className="text-xl font-bold">MoveKit</span>
            </Link>
          </div>

          {/* Step 1: Role Selection */}
          {step === "role" && (
            <Card className="border-0 shadow-xl shadow-black/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">I am a...</CardTitle>
                <CardDescription>This helps us personalize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <button
                  onClick={() => handleRoleSelect("incoming")}
                  className="w-full rounded-xl border-2 p-6 text-left transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🎒</span>
                    <div>
                      <p className="font-semibold text-lg">Incoming Student</p>
                      <p className="text-sm text-muted-foreground">
                        I&apos;m relocating to a new university and need help preparing
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect("outgoing")}
                  className="w-full rounded-xl border-2 p-6 text-left transition-all hover:border-primary hover:bg-primary/5"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">🎓</span>
                    <div>
                      <p className="font-semibold text-lg">Outgoing Student</p>
                      <p className="text-sm text-muted-foreground">
                        I&apos;m graduating/leaving and want to sell items or share tips
                      </p>
                    </div>
                  </div>
                </button>
                <p className="text-center text-xs text-muted-foreground pt-2">
                  Already have an account? <Link href="/login" className="text-primary hover:underline">Sign in</Link>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Details */}
          {step === "details" && (
            <Card className="border-0 shadow-xl shadow-black/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">About You</CardTitle>
                <CardDescription>
                  {role === "incoming"
                    ? "Tell us where you're heading"
                    : "Tell us where you're leaving from"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDetailsSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Your Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      required
                      autoFocus
                      className="h-11"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {role === "incoming" ? "Destination University" : "Your University"}
                    </label>
                    <select
                      value={selectedCampus}
                      onChange={(e) => setSelectedCampus(e.target.value)}
                      className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      required
                    >
                      <option value="">Select university...</option>
                      {campuses.map((campus) => (
                        <option key={campus.id} value={campus.id}>
                          {campus.university_domains?.university_name || campus.name}
                          {campus.university_domains?.country ? ` (${campus.university_domains.country})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {role === "incoming" ? "Coming from (country)" : "Current Location (country)"}
                    </label>
                    <Input
                      value={currentCountry}
                      onChange={(e) => setCurrentCountry(e.target.value)}
                      placeholder="e.g., Pakistan, India, UK..."
                      className="h-11"
                    />
                  </div>

                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                  )}

                  <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white">
                    Continue
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("role")}>
                    ← Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Email */}
          {step === "email" && (
            <Card className="border-0 shadow-xl shadow-black/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Verify Email</CardTitle>
                <CardDescription>
                  Use your university email to verify your student status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">University Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@university.edu"
                      required
                      autoFocus
                      className="h-11"
                    />
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-800">
                    <strong>Tip:</strong> Use the email from{" "}
                    <Badge variant="secondary" className="text-[10px]">
                      {campuses.find(c => c.id === selectedCampus)?.university_domains?.university_name || "your university"}
                    </Badge>{" "}
                    for faster verification.
                  </div>
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                  )}
                  {success && (
                    <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
                  )}
                  <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={isLoading}>
                    {isLoading ? "Sending..." : "Send Verification Code"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("details")}>
                    ← Back
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 4: OTP */}
          {step === "otp" && (
            <Card className="border-0 shadow-xl shadow-black/5">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Enter Code</CardTitle>
                <CardDescription>6-digit code sent to {email}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      required
                      autoFocus
                      className="h-14 text-center text-2xl tracking-[0.5em] font-mono"
                    />
                    <p className="mt-2 text-xs text-muted-foreground text-center">
                      Code expires in 5 minutes
                    </p>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
                  )}
                  {success && (
                    <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{success}</div>
                  )}
                  <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={isLoading}>
                    {isLoading ? "Verifying..." : "Create Account"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setStep("email")}>
                    ← Use different email
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

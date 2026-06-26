"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { countries } from "@/lib/data/countries"
import { phoneCodes, validatePhoneNumber, type PhoneCode } from "@/lib/data/phone-codes"

type Step = "role" | "details" | "email" | "otp"
type UserRole = "incoming" | "outgoing"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("role")
  const [role, setRole] = useState<UserRole | "">("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneCode, setPhoneCode] = useState<PhoneCode>(phoneCodes[0])
  const [phoneError, setPhoneError] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [otp, setOtp] = useState("")
  const [universityName, setUniversityName] = useState("")
  const [universityCity, setUniversityCity] = useState("")
  const [universityCountry, setUniversityCountry] = useState("")
  const [currentCountry, setCurrentCountry] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole)
    setStep("details")
  }

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!firstName.trim() || firstName.length < 2) {
      setError("First name must be at least 2 characters")
      return
    }
    if (!/^[a-zA-Z\s'-]+$/.test(firstName.trim())) {
      setError("First name can only contain letters, spaces, and hyphens")
      return
    }
    if (!lastName.trim()) {
      setError("Last name is required")
      return
    }
    if (!/^[a-zA-Z\s'-]+$/.test(lastName.trim())) {
      setError("Last name can only contain letters, spaces, and hyphens")
      return
    }
    if (!universityName.trim()) {
      setError("Please enter your university name")
      return
    }
    if (!universityCountry) {
      setError("Please select the university country")
      return
    }
    // Validate phone
    if (phone.trim()) {
      const phoneResult = validatePhoneNumber(phone, phoneCode)
      if (!phoneResult.valid) {
        setError(phoneResult.error || "Invalid phone number")
        return
      }
    }
    // Validate password
    const pwErrors: string[] = []
    if (password.length < 8) pwErrors.push("At least 8 characters")
    if (!/[A-Z]/.test(password)) pwErrors.push("One uppercase letter")
    if (!/[a-z]/.test(password)) pwErrors.push("One lowercase letter")
    if (!/[0-9]/.test(password)) pwErrors.push("One number")
    if (!/[^A-Za-z0-9]/.test(password)) pwErrors.push("One special character")
    if (password !== confirmPassword) pwErrors.push("Passwords don't match")
    if (pwErrors.length > 0) {
      setPasswordErrors(pwErrors)
      setError("Please enter a strong password")
      return
    }
    setPasswordErrors([])
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
        body: JSON.stringify({ email, is_registration: true }),
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
        body: JSON.stringify({ email, otp, password }),
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
            display_name: `${firstName.trim()} ${lastName.trim()}`,
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role_type: role,
            current_country: currentCountry,
            university_name: universityName.trim(),
            university_city: universityCity.trim(),
            university_country: universityCountry,
            phone_number: `${phoneCode.code} ${phone.trim()}`,
            profile_completed: true,
          }),
        })

        const userData = {
          ...data.user,
          display_name: `${firstName.trim()} ${lastName.trim()}`,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          role_type: role,
          current_country: currentCountry,
          university_name: universityName.trim(),
          university_city: universityCity.trim(),
          university_country: universityCountry,
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
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">First Name</label>
                      <Input
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        required
                        autoFocus
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">Last Name</label>
                      <Input
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        required
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      {role === "incoming" ? "Destination University" : "Your University"}
                    </label>
                    <Input
                      value={universityName}
                      onChange={(e) => setUniversityName(e.target.value)}
                      placeholder="e.g., MIT, LUMS, University of Manchester..."
                      required
                      className="h-11"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm font-medium">University City</label>
                      <Input
                        value={universityCity}
                        onChange={(e) => setUniversityCity(e.target.value)}
                        placeholder="e.g., Boston, Lahore..."
                        className="h-11"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium">University Country</label>
                      <select
                        value={universityCountry}
                        onChange={(e) => setUniversityCountry(e.target.value)}
                        required
                        className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select country...</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {role === "incoming" && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Where are you coming from?
                      </label>
                      <select
                        value={currentCountry}
                        onChange={(e) => setCurrentCountry(e.target.value)}
                        className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <option value="">Select your home country...</option>
                        {countries.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Helps us tailor your blueprint (adapters, visa tips, etc.)
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-sm font-medium">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCode.code}
                        onChange={(e) => {
                          const selected = phoneCodes.find(p => p.code === e.target.value)
                          if (selected) { setPhoneCode(selected); setPhone(""); setPhoneError("") }
                        }}
                        className="flex h-11 w-24 shrink-0 rounded-md border border-input bg-transparent px-2 py-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {phoneCodes.map((p) => (
                          <option key={`${p.country}-${p.code}`} value={p.code}>
                            {p.code} {p.country}
                          </option>
                        ))}
                      </select>
                      <Input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/[^\d\s]/g, "")
                          setPhone(digits)
                          if (digits.replace(/\s/g, "").length > 0) {
                            const result = validatePhoneNumber(digits, phoneCode)
                            setPhoneError(result.valid ? "" : result.error || "")
                          } else {
                            setPhoneError("")
                          }
                        }}
                        placeholder={phoneCode.format}
                        className="h-11 flex-1"
                        maxLength={phoneCode.maxLength + 3}
                      />
                    </div>
                    {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}
                    <p className="mt-1 text-xs text-muted-foreground">
                      Required for chat and deals. Never shared publicly.
                    </p>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setPasswordErrors([]) }}
                        placeholder="Create a strong password"
                        required
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
                      <span className={password.length >= 8 ? "text-green-600 font-medium" : "text-gray-400"}>
                        {password.length >= 8 ? "✓" : "○"} 8+ chars
                      </span>
                      <span className={/[A-Z]/.test(password) ? "text-green-600 font-medium" : "text-gray-400"}>
                        {/[A-Z]/.test(password) ? "✓" : "○"} Uppercase
                      </span>
                      <span className={/[a-z]/.test(password) ? "text-green-600 font-medium" : "text-gray-400"}>
                        {/[a-z]/.test(password) ? "✓" : "○"} Lowercase
                      </span>
                      <span className={/[0-9]/.test(password) ? "text-green-600 font-medium" : "text-gray-400"}>
                        {/[0-9]/.test(password) ? "✓" : "○"} Number
                      </span>
                      <span className={/[^A-Za-z0-9]/.test(password) ? "text-green-600 font-medium" : "text-gray-400"}>
                        {/[^A-Za-z0-9]/.test(password) ? "✓" : "○"} Special
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="h-11 pr-10"
                      />
                    </div>
                  </div>
                  {passwordErrors.includes("Passwords don't match") && confirmPassword.length > 0 && (
                    <p className="text-xs text-destructive">Passwords don&apos;t match</p>
                  )}

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
                    <strong>Tip:</strong> Use your email from{" "}
                    <Badge variant="secondary" className="text-[10px]">
                      {universityName || "your university"}
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
                  <p className="text-center text-[10px] text-muted-foreground">
                    By continuing, you agree to MoveKit&apos;s{" "}
                    <a href="/policies" target="_blank" className="text-primary underline">Privacy Policy</a> and{" "}
                    <a href="/policies" target="_blank" className="text-primary underline">Terms of Service</a>.
                  </p>
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

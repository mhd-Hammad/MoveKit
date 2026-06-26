"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Please enter email and password")
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Login failed")
        return
      }

      localStorage.setItem("movekit_user", JSON.stringify(data.user))
      router.push("/dashboard")
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
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="mt-4 text-blue-100 leading-relaxed">
            Sign in to access your survival blueprint, marketplace matches, and ongoing deals.
          </p>
          <div className="mt-10 space-y-4">
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</div>
              <span>Your AI blueprint is saved and ready</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</div>
              <span>Continue your marketplace conversations</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-blue-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">✓</div>
              <span>Track your deals and trust score</span>
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

          <Card className="border-0 shadow-xl shadow-black/5">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Sign In</CardTitle>
              <CardDescription>Enter your email and password</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">Email</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                    autoFocus
                    className="h-11"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">Password</label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
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
                </div>

                {error && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 gradient-primary border-0 text-white" disabled={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Signing in...
                    </span>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

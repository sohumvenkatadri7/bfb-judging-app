"use client";

import { useState, useMemo } from "react";
import { LogIn, AlertCircle, Zap, Eye, EyeOff, Search, Users, Scale, Trophy } from "lucide-react";
import type { Credential, User } from "@/lib/data";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoSearch, setDemoSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setIsLoading(false);
        return;
      }
      const data = await res.json();
      onLogin(data.user); // Pass only the user object
    } catch (err) {
      setError("Network error");
    }
    setIsLoading(false);
  };

  const fillCredential = (c: Credential) => {
    setEmail(c.email);
    setPassword(c.password);
    setError("");
  };


  // Demo autofill buttons are disabled without credentials prop
  // You can hardcode demo credentials for quick fill if desired

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Subtle dot pattern */}
      <div className="pointer-events-none fixed inset-0 opacity-30" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, var(--border) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      <div className="relative w-full max-w-lg animate-float-up">
        {/* Logo & Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-navy text-primary-foreground shadow-sm overflow-hidden">
            <img src="/Picsart_25-09-11_12-47-39-068.png" alt="BFB Logo" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Build For Bengaluru</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access the hackathon dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="team1@bfb.com"
                required
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="h-11 w-full rounded-lg border border-border bg-background px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-navy text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-navy-light disabled:opacity-60"
            >
              {isLoading ? (
                <div className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {/* Demo credentials UI removed: not available without credentials prop */}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Build For Bengaluru 2026 Hackathon Dashboard
        </p>
      </div>
    </div>
  );
}

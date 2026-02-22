"use client";

import { useState, useMemo } from "react";
import { LogIn, AlertCircle, Zap, Eye, EyeOff, Search, Users, Scale, Trophy } from "lucide-react";
import type { Credential, User } from "@/lib/data";

interface LoginPageProps {
  credentials: Credential[];
  onLogin: (user: User) => void;
}

export function LoginPage({ credentials, onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [demoSearch, setDemoSearch] = useState("");
  const [showAllTeams, setShowAllTeams] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      const match = credentials.find(
        (c) => c.email === email.trim().toLowerCase() && c.password === password
      );

      if (match) {
        onLogin({ email: match.email, role: match.role, label: match.label, teamId: match.teamId });
      } else {
        setError("Invalid email or password. Please try again.");
      }
      setIsLoading(false);
    }, 400);
  };

  const fillCredential = (c: Credential) => {
    setEmail(c.email);
    setPassword(c.password);
    setError("");
  };

  const juryCreds = useMemo(() => credentials.filter((c) => c.role !== "participant"), [credentials]);
  const teamCreds = useMemo(() => credentials.filter((c) => c.role === "participant"), [credentials]);

  const filteredTeamCreds = useMemo(() => {
    if (!demoSearch) return teamCreds;
    const q = demoSearch.toLowerCase();
    return teamCreds.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.teamId && String(c.teamId).includes(q))
    );
  }, [teamCreds, demoSearch]);

  const visibleTeamCreds = showAllTeams ? filteredTeamCreds : filteredTeamCreds.slice(0, 6);

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
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-navy text-primary-foreground shadow-sm">
            <Zap className="size-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-navy">Build For Bengaluru</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access the hackathon dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          <div className="mt-6 border-t border-border pt-5">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Demo Credentials -- click to auto-fill
            </p>

            {/* Jury & Admin quick buttons */}
            <div className="flex flex-col gap-2">
              {juryCreds.map((c) => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => fillCredential(c)}
                  className="flex items-center justify-between rounded-lg border border-border bg-slate-50 px-4 py-2.5 text-left transition-colors hover:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    {c.role === "shortlisting" ? (
                      <Scale className="size-4 text-navy" />
                    ) : (
                      <Trophy className="size-4 text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.label}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {c.email} / {c.password}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-md bg-navy/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-navy">
                    {c.role === "shortlisting" ? "Jury" : "Admin"}
                  </span>
                </button>
              ))}
            </div>

            {/* Team credentials section */}
            <div className="mt-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Users className="size-3.5" />
                <span>Team Logins (100 teams)</span>
              </div>

              {/* Search teams */}
              <div className="relative mt-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by team name, email, or number..."
                  value={demoSearch}
                  onChange={(e) => {
                    setDemoSearch(e.target.value);
                    setShowAllTeams(true);
                  }}
                  className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
                />
              </div>

              {/* Team list */}
              <div className="mt-2 flex max-h-60 flex-col gap-1 overflow-y-auto">
                {visibleTeamCreds.map((c) => (
                  <button
                    key={c.email}
                    type="button"
                    onClick={() => fillCredential(c)}
                    className="flex items-center justify-between rounded-lg border border-border bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-md bg-navy/10 font-mono text-[10px] font-bold text-navy">
                        {String(c.teamId).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-xs font-medium text-foreground">{c.label}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {c.email} / {c.password}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {!showAllTeams && filteredTeamCreds.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllTeams(true)}
                  className="mt-2 w-full rounded-lg border border-border bg-slate-50 py-2 text-center text-xs font-medium text-navy transition-colors hover:bg-slate-100"
                >
                  Show all {filteredTeamCreds.length} teams
                </button>
              )}

              {filteredTeamCreds.length === 0 && demoSearch && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  No teams found matching &quot;{demoSearch}&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Build For Bengaluru 2026 Hackathon Dashboard
        </p>
      </div>
    </div>
  );
}

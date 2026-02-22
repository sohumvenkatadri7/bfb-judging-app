"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  Rocket,
  Scale,
  Trophy,
  RefreshCw,
  Zap,
  LogOut,
  Users,
  ArrowUpCircle,
} from "lucide-react";
import type { Team } from "@/lib/data";
import { generateTeams, generateCredentials } from "@/lib/data";
import type { User } from "@/lib/data";
import { LoginPage } from "@/components/login-page";
import { ParticipantView } from "@/components/participant-view";
import { ShortlistingJuryView } from "@/components/shortlisting-jury-view";
import { FinalJuryView } from "@/components/final-jury-view";

type Role = "participant" | "shortlisting" | "final";

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Rocket; description: string }> = {
  participant: { label: "Participant View", icon: Rocket, description: "Track your progress and stay updated" },
  shortlisting: { label: "Shortlisting Jury", icon: Scale, description: "Evaluate all 100 teams and select the Top 20" },
  final: { label: "Final Jury", icon: Trophy, description: "Review the Top 20 and assign final rankings" },
};

function usePersistedState<T>(key: string, initialValue: T | (() => T)): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === "undefined") {
      return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
    }
    try {
      const stored = localStorage.getItem(key);
      if (stored) return JSON.parse(stored);
    } catch { /* empty */ }
    return typeof initialValue === "function" ? (initialValue as () => T)() : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch { /* empty */ }
  }, [key, state]);

  return [state, setState];
}

export function Dashboard() {
  const [user, setUser] = usePersistedState<User | null>("bfb-user", null);
  const [teams, setTeams] = usePersistedState<Team[]>("bfb-teams", generateTeams);
  const [mounted, setMounted] = useState(false);

  // Generate credentials based on current teams so team labels stay in sync
  const credentials = useMemo(() => generateCredentials(teams), [teams]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = useCallback((u: User) => {
    setUser(u);
  }, [setUser]);

  const handleLogout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem("bfb-user");
    } catch { /* empty */ }
  }, [setUser]);

  const handleUpdateTeam = useCallback((id: number, updates: Partial<Team>) => {
    setTeams((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, [setTeams]);

  const handleReset = useCallback(() => {
    setTeams(generateTeams());
  }, [setTeams]);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="size-6 animate-spin rounded-full border-2 border-navy/20 border-t-navy" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage credentials={credentials} onLogin={handleLogin} />;
  }

  const config = ROLE_CONFIG[user.role];
  const Icon = config.icon;
  const top20Count = teams.filter((t) => t.isTop20).length;

  // Find the logged-in team for participant
  const myTeam = user.teamId ? teams.find((t) => t.id === user.teamId) ?? null : null;

  function renderView() {
    switch (user!.role) {
      case "participant":
        return (
          <ParticipantView
            team={myTeam}
            onUpdateTeam={handleUpdateTeam}
          />
        );
      case "shortlisting":
        return (
          <ShortlistingJuryView teams={teams} onUpdateTeam={handleUpdateTeam} />
        );
      case "final":
        return (
          <FinalJuryView teams={teams} onUpdateTeam={handleUpdateTeam} />
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card md:flex">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-navy text-primary-foreground">
            <Zap className="size-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-foreground">Build For Bengaluru</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Hackathon Dashboard</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          <div className="flex items-center gap-3 rounded-lg bg-secondary px-3 py-2.5 text-sm font-medium text-foreground">
            <Icon className="size-4 text-emerald" />
            {config.label}
          </div>
          <p className="mt-2 px-3 text-xs text-muted-foreground">{config.description}</p>

          {/* Show team name for participants */}
          {user.role === "participant" && myTeam && (
            <div className="mt-4 rounded-lg border border-emerald/20 bg-emerald-light/40 p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Your Team</p>
              <p className="mt-0.5 text-sm font-bold text-foreground">{myTeam.name}</p>
              <p className="font-mono text-[10px] text-muted-foreground">ID: #{String(myTeam.id).padStart(3, "0")}</p>
            </div>
          )}
        </nav>

        {/* Stats */}
        <div className="flex flex-col gap-3 border-t border-border p-4">
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
            <Users className="size-4 text-muted-foreground" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Teams</p>
              <p className="font-mono text-lg font-bold text-foreground">{teams.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-secondary p-3">
            <ArrowUpCircle className="size-4 text-emerald" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Top 20</p>
              <p className="font-mono text-lg font-bold text-emerald">{top20Count}</p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 md:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-navy text-primary-foreground">
              <Zap className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground">Build For Bengaluru</h1>
              <p className="text-[10px] text-muted-foreground">
                {user.role === "participant" && myTeam ? myTeam.name : config.label}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="hidden items-center justify-between border-b border-border bg-card px-6 py-4 md:flex">
          <div>
            <h2 className="text-lg font-bold text-foreground">{config.label}</h2>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-3 py-1.5 text-xs text-muted-foreground">
              Logged in as <span className="font-semibold text-foreground">{user.label}</span>
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <RefreshCw className="size-3.5" />
              Reset Data
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-6">
          {renderView()}
        </div>
      </main>
    </div>
  );
}

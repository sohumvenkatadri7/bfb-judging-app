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

type Role = "participant" | "shortlisting" | "final" | "admin";

const ROLE_CONFIG: Record<Role, { label: string; icon: typeof Rocket; description: string }> = {
  participant: { label: "Participant View", icon: Rocket, description: "Track your progress and stay updated" },
  shortlisting: { label: "Shortlisting Jury", icon: Scale, description: "Evaluate all 100 teams and select the Top 20" },
  final: { label: "Final Jury", icon: Trophy, description: "Review the Top 20 and assign final rankings" },
  admin: { label: "Admin Dashboard", icon: Zap, description: "Manage teams, credentials, and alerts" },
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

import { ADMIN_ALERTS as INITIAL_ADMIN_ALERTS } from "@/lib/data";
export function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = usePersistedState<Team[]>("bfb-teams", generateTeams);
  const [adminAlerts, setAdminAlerts] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("bfb-alerts") : null;
    return stored ? JSON.parse(stored) : INITIAL_ADMIN_ALERTS;
  });
  const [mounted, setMounted] = useState(false);

  // Sync teams, user, and alerts across tabs
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "bfb-teams" && e.newValue) {
        try { setTeams(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "bfb-user" && e.newValue) {
        try { setUser(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === "bfb-alerts" && e.newValue) {
        try { setAdminAlerts(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [setTeams, setUser]);

  // Persist alerts to localStorage
  useEffect(() => {
    if (mounted) localStorage.setItem("bfb-alerts", JSON.stringify(adminAlerts));
  }, [adminAlerts, mounted]);

  // Generate credentials based on current teams so team labels stay in sync
  const credentials = useMemo(() => generateCredentials(teams), [teams]);

  // On mount, fetch session user
  useEffect(() => {
    async function fetchSession() {
      const res = await fetch("/api/session");
      const data = await res.json();
      setUser(data.user);
    }
    fetchSession();
    setMounted(true);
  }, []);

  const handleLogin = useCallback(async (_u: User) => {
    // After login, fetch session user from API (cookie)
    const res = await fetch("/api/session");
    const data = await res.json();
    setUser(data.user);
  }, []);

  const handleLogout = useCallback(async () => {
    await fetch("/api/login", { method: "DELETE" });
    setUser(null);
  }, []);

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
    return <LoginPage onLogin={handleLogin} />;
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
      case "admin":
        // Admin Panel fully integrated
        return (
          <div className="space-y-8">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
            {/* Add Team */}
            <section className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Add New Team</h3>
              <form
                className="flex flex-col gap-2 md:flex-row md:items-end"
                onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const name = (form.elements.namedItem('teamName') as HTMLInputElement).value.trim();
                  const theme = (form.elements.namedItem('teamTheme') as HTMLInputElement).value as Team['theme'];
                  if (!name || !theme) return;
                  const newId = teams.length ? Math.max(...teams.map(t => t.id)) + 1 : 1;
                  setTeams([...teams, { id: newId, name, theme, milestone: 0, innovationScore: 5, techScore: 5, isTop20: false, rank: null }]);
                  form.reset();
                }}
              >
                <input name="teamName" placeholder="Team Name" className="border rounded px-2 py-1" required />
                <select name="teamTheme" className="border rounded px-2 py-1" required>
                  <option value="">Select Theme</option>
                  <option value="Mobility">Mobility</option>
                  <option value="Sustainability">Sustainability</option>
                  <option value="Citizen Tech">Citizen Tech</option>
                  <option value="AI">AI</option>
                </select>
                <button type="submit" className="bg-emerald-600 text-white rounded px-3 py-1">Add Team</button>
              </form>
            </section>

            {/* Credentials Table */}
            <section className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">All Team Credentials</h3>
              <div className="overflow-x-auto">
                <table className="min-w-[400px] text-xs">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-2 py-1">Team</th>
                      <th className="px-2 py-1">Email</th>
                      <th className="px-2 py-1">Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {credentials.filter(c => c.role === 'participant').map(c => (
                      <tr key={c.email} className="border-b">
                        <td className="px-2 py-1">{c.label}</td>
                        <td className="px-2 py-1 font-mono">{c.email}</td>
                        <td className="px-2 py-1 font-mono">{c.password}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Post Alert */}
            <section className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Post New Alert</h3>
              <form
                className="flex flex-col gap-2 md:flex-row md:items-end"
                onSubmit={e => {
                  e.preventDefault();
                  const form = e.target as HTMLFormElement;
                  const message = (form.elements.namedItem('alertMsg') as HTMLInputElement).value.trim();
                  const type = (form.elements.namedItem('alertType') as HTMLInputElement).value;
                  if (!message || !type) return;
                  const newAlert = {
                    id: Date.now(),
                    message,
                    time: "now",
                    type,
                  };
                  setAdminAlerts([newAlert, ...adminAlerts]);
                  form.reset();
                }}
              >
                <input name="alertMsg" placeholder="Alert message" className="border rounded px-2 py-1" required />
                <select name="alertType" className="border rounded px-2 py-1" required>
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                </select>
                <button type="submit" className="bg-navy text-white rounded px-3 py-1">Post Alert</button>
              </form>
            </section>
          </div>
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
          <div className="flex size-9 items-center justify-center rounded-xl bg-navy text-primary-foreground overflow-hidden">
            <img src="/Picsart_25-09-11_12-47-39-068.png" alt="BFB Logo" className="w-7 h-7 object-contain" />
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
            <div className="flex size-8 items-center justify-center rounded-lg bg-navy text-primary-foreground overflow-hidden">
              <img src="/Picsart_25-09-11_12-47-39-068.png" alt="BFB Logo" className="w-6 h-6 object-contain" />
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

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GlobalHeader } from "./global-header";
import { Confetti } from "@/components/confetti";
import type { Team, Theme } from "@/lib/data";

const MILESTONES = [
  { value: 25, label: "Ideation Complete", description: "Problem statement finalized & solution designed" },
  { value: 50, label: "MVP Built", description: "Core prototype functional and testable" },
  { value: 75, label: "Integration Done", description: "All features connected and working end-to-end" },
  { value: 100, label: "Submission Ready", description: "Polished, documented, and demo-ready" },
];

const THEME_COLORS: Record<Theme, string> = {
  Mobility: "bg-blue-50 text-blue-700 border-blue-200",
  Sustainability: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Citizen Tech": "bg-amber-50 text-amber-700 border-amber-200",
  AI: "bg-violet-50 text-violet-700 border-violet-200",
};

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const totalSeconds = prev.hours * 3600 + prev.minutes * 60 + prev.seconds - 1;
        if (totalSeconds <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        return { hours: Math.floor(totalSeconds / 3600), minutes: Math.floor((totalSeconds % 3600) / 60), seconds: totalSeconds % 60 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-xl border border-border bg-card font-mono text-3xl font-bold text-navy shadow-sm md:h-24 md:w-24 md:text-4xl">{String(value).padStart(2, "0")}</div>
      <span className="mt-2 text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

interface ParticipantViewProps { team: Team | null; onUpdateTeam: (id: number, updates: Partial<Team>) => void }

export function ParticipantView({ team, onUpdateTeam }: ParticipantViewProps) {
  const timeLeft = useCountdown();
  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedAlert, setExpandedAlert] = useState<number | null>(null);
  const [adminAlerts, setAdminAlerts] = useState(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("bfb-alerts") : null;
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === "bfb-alerts" && e.newValue) {
        try { setAdminAlerts(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const currentMilestone = team?.milestone ?? 0;
  const displayId = team ? String(team.id).slice(0, 6) : "--";

  const handleMilestoneClick = useCallback((milestoneValue: number) => {
    if (!team) return;
    const nextExpected = currentMilestone + 25;
    if (milestoneValue !== nextExpected) return;
    if (milestoneValue > 100) return;
    onUpdateTeam(team.id, { milestone: milestoneValue });
    if (milestoneValue === 100) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [team, currentMilestone, onUpdateTeam]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="size-4 shrink-0 text-amber-500" />;
      case "success": return <CheckCircle2 className="size-4 shrink-0 text-emerald" />;
      default: return <Info className="size-4 shrink-0 text-navy" />;
    }
  };

  if (!team) {
    return (
      <div className="min-h-screen bg-surface">
        <GlobalHeader title="Participant" />
        <main className="mx-auto max-w-3xl px-4 py-20">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-secondary"><AlertTriangle className="h-10 w-10 text-muted-foreground" /></div>
            <h2 className="text-2xl font-semibold text-foreground">Team not found</h2>
            <p className="max-w-md text-center text-sm text-muted-foreground">We couldn't find your team. Try signing out and logging back in, or contact an organizer for help.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface">
      <GlobalHeader title="Participant" />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-8 pb-20 md:pb-8">
          <Confetti active={showConfetti} />

          <section className="animate-float-up">
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/10 font-mono text-lg font-bold text-navy">#{displayId}</div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-foreground">{team.name}</h2>
                <div className="mt-2 flex items-center gap-3">
                  <Badge variant="outline" className={`text-[11px] ${THEME_COLORS[team.theme]}`}>{team.theme}</Badge>
                  <span className="font-mono text-xs text-muted-foreground">{team.leader_email || `team${displayId}@bfb.com`}</span>
                  <div className="ml-2 flex items-center gap-2">
                    <div className="h-2 w-36 rounded-full bg-secondary"><div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${team.milestone ?? 0}%` }} /></div>
                    <span className="text-xs text-muted-foreground">{team.milestone ?? 0}%</span>
                  </div>
                </div>
              </div>
              {team.isTop20 && (<span className="rounded-full bg-emerald/10 px-3 py-1 text-xs font-semibold text-emerald-dark">Top 20</span>)}
            </div>
          </section>

          <section className="animate-float-up" style={{ animationDelay: "0.05s" }}>
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
              <div className="flex items-center gap-2 text-navy"><Clock className="size-5" /><h2 className="font-mono text-sm font-semibold uppercase tracking-widest">Time Remaining</h2></div>
              <div className="flex items-center gap-3 md:gap-6">
                <TimeUnit value={timeLeft.hours} label="Hours" />
                <span className="-mt-6 text-3xl font-bold text-slate-300">:</span>
                <TimeUnit value={timeLeft.minutes} label="Minutes" />
                <span className="-mt-6 text-3xl font-bold text-slate-300">:</span>
                <TimeUnit value={timeLeft.seconds} label="Seconds" />
              </div>
              <div className="h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full bg-emerald transition-all duration-1000" style={{ width: `${((24 * 3600 - (timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds)) / (24 * 3600)) * 100}%` }} />
              </div>
            </div>
          </section>

          <section className="animate-float-up" style={{ animationDelay: "0.1s" }}>
            <div className="mb-4 flex items-center gap-2"><Megaphone className="size-5 text-navy" /><h2 className="text-lg font-semibold text-foreground">Announcements</h2></div>
            <div className="flex flex-col gap-3">
              {adminAlerts.map((alert) => {
                const isExpanded = expandedAlert === alert.id;
                const sideClass = alert.type === "warning" ? "border-l-4 border-amber-300" : alert.type === "success" ? "border-l-4 border-emerald-300" : "border-l-4 border-navy/30";
                return (
                  <button key={alert.id} type="button" onClick={() => setExpandedAlert(isExpanded ? null : alert.id)} className={`group flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-transform hover:scale-[1.01] ${sideClass}`}>
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <p className={`text-sm ${isExpanded ? "text-foreground" : "text-muted-foreground"} transition-colors`}>{alert.message}</p>
                      <span className="mt-1 text-xs text-slate-400">{alert.time}</span>
                      {isExpanded && alert.details && (<div className="mt-2 text-xs text-muted-foreground">{alert.details}</div>)}
                    </div>
                    <ChevronRight className={`size-4 shrink-0 text-muted-foreground transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                );
              })}
            </div>
          </section>

          <section className="animate-float-up" style={{ animationDelay: "0.2s" }}>
            <div className="mb-4 flex items-center gap-2"><CheckCircle2 className="size-5 text-emerald" /><h2 className="text-lg font-semibold text-foreground">Your Progress</h2></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {MILESTONES.map((ms, idx) => {
                const isCompleted = currentMilestone >= ms.value;
                const isNext = ms.value === currentMilestone + 25;
                return (
                  <button key={ms.value} type="button" onClick={() => handleMilestoneClick(ms.value)} disabled={!isNext} className={`group relative flex flex-col items-center gap-4 rounded-2xl border p-6 text-center transition-all duration-300 md:p-8 ${isCompleted ? "border-emerald/30 bg-emerald-light/40" : isNext ? "cursor-pointer border-navy/20 bg-card shadow-sm hover:border-navy/40 hover:shadow-md" : "cursor-not-allowed border-border bg-secondary/50 opacity-50"}`}>
                    <div className={`flex size-12 items-center justify-center rounded-full border-2 transition-colors ${isCompleted ? "border-emerald bg-emerald/10" : isNext ? "border-navy bg-navy/5" : "border-slate-200 bg-secondary"}`}>
                      {isCompleted ? <CheckCircle2 className="size-6 text-emerald" /> : <span className={`font-mono text-lg font-bold ${isNext ? "text-navy" : "text-muted-foreground"}`}>{idx + 1}</span>}
                    </div>
                    <div>
                      <h3 className={`text-base font-semibold ${isCompleted ? "text-emerald-dark" : isNext ? "text-navy" : "text-muted-foreground"}`}>{ms.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{ms.description}</p>
                    </div>
                    <div className={`rounded-full px-3 py-1 font-mono text-xs font-semibold ${isCompleted ? "bg-emerald/15 text-emerald-dark" : isNext ? "bg-navy/10 text-navy" : "bg-secondary text-muted-foreground"}`}>{ms.value}%</div>
                    {isNext && (<span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-navy px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">Tap to complete</span>)}
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

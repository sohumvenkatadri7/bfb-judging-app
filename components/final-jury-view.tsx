"use client";

import { useMemo } from "react";
import { Trophy, Medal, Star, TrendingUp, Crown, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Team, Theme } from "@/lib/data";

const THEME_COLORS: Record<Theme, string> = {
  "Mobility": "bg-blue-50 text-blue-700 border-blue-200",
  "Sustainability": "bg-emerald-light text-emerald-dark border-emerald/30",
  "Citizen Tech": "bg-amber-50 text-amber-700 border-amber-200",
  "AI": "bg-violet-50 text-violet-700 border-violet-200",
};

const RANK_CONFIG: Record<number, { label: string; color: string; icon: typeof Trophy; bgCard: string; badgeColor: string }> = {
  1: { label: "1st Place", color: "text-amber-600", icon: Crown, bgCard: "bg-amber-50 border-amber-200", badgeColor: "bg-amber-100 text-amber-700" },
  2: { label: "2nd Place", color: "text-slate-500", icon: Medal, bgCard: "bg-slate-50 border-slate-200", badgeColor: "bg-slate-100 text-slate-600" },
  3: { label: "3rd Place", color: "text-orange-600", icon: Award, bgCard: "bg-orange-50 border-orange-200", badgeColor: "bg-orange-100 text-orange-700" },
};

interface FinalJuryViewProps {
  teams: Team[];
  onUpdateTeam: (id: number, updates: Partial<Team>) => void;
}

export function FinalJuryView({ teams, onUpdateTeam }: FinalJuryViewProps) {
  const top20 = useMemo(() => {
    return teams
      .filter((t) => t.isTop20)
      .sort((a, b) => {
        if (a.rank && !b.rank) return -1;
        if (!a.rank && b.rank) return 1;
        if (a.rank && b.rank) return a.rank - b.rank;
        return (b.innovationScore + b.techScore) - (a.innovationScore + a.techScore);
      });
  }, [teams]);

  const rankedTeams = useMemo(() => teams.filter((t) => t.rank !== null), [teams]);

  const handleRankChange = (teamId: number, rankStr: string) => {
    const newRank = rankStr === "none" ? null : parseInt(rankStr);

    if (newRank !== null) {
      const currentHolder = teams.find((t) => t.rank === newRank && t.id !== teamId);
      if (currentHolder) {
        onUpdateTeam(currentHolder.id, { rank: null });
      }
    }

    onUpdateTeam(teamId, { rank: newRank });
  };

  if (top20.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex size-20 items-center justify-center rounded-full border border-border bg-secondary">
          <Trophy className="size-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">No teams promoted yet</h2>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          Switch to the Shortlisting Jury view to evaluate and promote teams to the Top 20.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-8">
      {/* Podium - Ranked Teams */}
      {rankedTeams.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Trophy className="size-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-foreground">Winners</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((r) => {
              const team = teams.find((t) => t.rank === r);
              if (!team) return (
                <div key={r} className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-8">
                  <span className="text-sm text-muted-foreground">Rank {r} -- Unassigned</span>
                </div>
              );
              const config = RANK_CONFIG[r];
              const Icon = config.icon;
              return (
                <div key={r} className={`relative overflow-hidden rounded-2xl border p-6 shadow-sm ${config.bgCard}`}>
                  <div className="absolute -right-4 -top-4 opacity-[0.07]" aria-hidden="true">
                    <Icon className={`size-28 ${config.color}`} />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-2">
                      <Icon className={`size-5 ${config.color}`} />
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${config.badgeColor}`}>{config.label}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-foreground">{team.name}</h3>
                    <Badge variant="outline" className={`mt-2 text-[10px] ${THEME_COLORS[team.theme]}`}>
                      {team.theme}
                    </Badge>
                    <div className="mt-4 flex items-center gap-4">
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Score</span>
                        <p className="flex items-center gap-1 font-mono text-lg font-bold text-foreground">
                          <Star className="size-4 text-amber-500" />
                          {team.innovationScore + team.techScore}/20
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Progress</span>
                        <p className="font-mono text-lg font-bold text-emerald">{team.milestone}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Full Top 20 List */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-navy" />
            <h2 className="text-lg font-semibold text-foreground">Top 20 Teams</h2>
          </div>
          <span className="rounded-full bg-navy/10 px-3 py-1 font-mono text-xs font-semibold text-navy">
            {top20.length} teams
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Team</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Theme</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Progress</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Innovation</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tech</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Rank</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {top20.map((team, idx) => (
                  <tr key={team.id} className={`transition-colors hover:bg-slate-50 ${team.rank ? "bg-amber-50/50" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {team.rank && (
                          <span className="text-amber-500">
                            {team.rank === 1 ? <Crown className="size-4" /> : team.rank === 2 ? <Medal className="size-4" /> : <Award className="size-4" />}
                          </span>
                        )}
                        <span className="text-sm font-medium text-foreground">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] ${THEME_COLORS[team.theme]}`}>
                        {team.theme}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${team.milestone}%` }} />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{team.milestone}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-navy">{team.innovationScore}/10</td>
                    <td className="px-4 py-3 text-center font-mono text-sm text-navy">{team.techScore}/10</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 font-mono text-sm font-bold text-foreground">
                        <Star className="size-3 text-amber-500" />
                        {team.innovationScore + team.techScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Select
                        value={team.rank ? String(team.rank) : "none"}
                        onValueChange={(val) => handleRankChange(team.id, val)}
                      >
                        <SelectTrigger className="mx-auto h-8 w-28 border-border bg-card text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No rank</SelectItem>
                          <SelectItem value="1">1st Place</SelectItem>
                          <SelectItem value="2">2nd Place</SelectItem>
                          <SelectItem value="3">3rd Place</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="flex flex-col gap-3 md:hidden">
          {top20.map((team, idx) => (
            <div key={team.id} className={`rounded-xl border bg-card p-4 shadow-sm ${team.rank ? "border-amber-200" : "border-border"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex size-6 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">{team.name}</h3>
                    {team.rank && (
                      <span className="text-amber-500">
                        {team.rank === 1 ? <Crown className="size-4" /> : team.rank === 2 ? <Medal className="size-4" /> : <Award className="size-4" />}
                      </span>
                    )}
                  </div>
                  <Badge variant="outline" className={`mt-1.5 text-[10px] ${THEME_COLORS[team.theme]}`}>
                    {team.theme}
                  </Badge>
                </div>
                <span className="inline-flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 font-mono text-sm font-bold text-foreground">
                  <Star className="size-3 text-amber-500" />
                  {team.innovationScore + team.techScore}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-emerald transition-all" style={{ width: `${team.milestone}%` }} />
                </div>
                <span className="font-mono text-xs text-muted-foreground">{team.milestone}%</span>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Innovation</span>
                  <p className="font-mono text-sm font-bold text-navy">{team.innovationScore}/10</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tech</span>
                  <p className="font-mono text-sm font-bold text-navy">{team.techScore}/10</p>
                </div>
                <div>
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Rank</span>
                  <Select
                    value={team.rank ? String(team.rank) : "none"}
                    onValueChange={(val) => handleRankChange(team.id, val)}
                  >
                    <SelectTrigger className="mt-0.5 h-7 w-full border-border bg-card text-[11px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="1">1st</SelectItem>
                      <SelectItem value="2">2nd</SelectItem>
                      <SelectItem value="3">3rd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

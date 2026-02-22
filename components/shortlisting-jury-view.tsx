"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Filter,
  Star,
  ArrowUpCircle,
  Search,
  TrendingUp,
  Users,
  X,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { Team, Theme } from "@/lib/data";

const THEMES: Theme[] = ["Mobility", "Sustainability", "Citizen Tech", "AI"];

const THEME_COLORS: Record<Theme, string> = {
  Mobility: "bg-blue-50 text-blue-700 border-blue-200",
  Sustainability: "bg-emerald-light text-emerald-dark border-emerald/30",
  "Citizen Tech": "bg-amber-50 text-amber-700 border-amber-200",
  AI: "bg-violet-50 text-violet-700 border-violet-200",
};

const THEME_PILL_ACTIVE: Record<Theme, string> = {
  Mobility: "border-blue-400 bg-blue-50 text-blue-700",
  Sustainability: "border-emerald bg-emerald-light text-emerald-dark",
  "Citizen Tech": "border-amber-400 bg-amber-50 text-amber-700",
  AI: "border-violet-400 bg-violet-50 text-violet-700",
};

interface ShortlistingJuryViewProps {
  teams: Team[];
  onUpdateTeam: (id: number, updates: Partial<Team>) => void;
}

export function ShortlistingJuryView({
  teams,
  onUpdateTeam,
}: ShortlistingJuryViewProps) {
  const [activeTheme, setActiveTheme] = useState<Theme | "All">("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score">("score");
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const filteredTeams = useMemo(() => {
    let filtered = teams;
    if (activeTheme !== "All") {
      filtered = filtered.filter((t) => t.theme === activeTheme);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.theme.toLowerCase().includes(q) ||
          String(t.id).includes(q)
      );
    }
    if (sortBy === "score") {
      filtered = [...filtered].sort(
        (a, b) =>
          b.innovationScore + b.techScore - (a.innovationScore + a.techScore)
      );
    } else {
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    }
    return filtered;
  }, [teams, activeTheme, search, sortBy]);

  const top20Count = teams.filter((t) => t.isTop20).length;
  const selectedTeam = selectedTeamId
    ? teams.find((t) => t.id === selectedTeamId) ?? null
    : null;

  const handleClosePanel = useCallback(() => setSelectedTeamId(null), []);

  return (
    <div className="flex flex-col gap-6 pb-20 md:pb-8">
      {/* Header Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Teams
            </span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-foreground">
            {teams.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Filtered
            </span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-navy">
            {filteredTeams.length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ArrowUpCircle className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Top 20
            </span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-emerald">
            {top20Count}/20
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Avg Score
            </span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-foreground">
            {teams.length > 0
              ? (
                  teams.reduce(
                    (acc, t) => acc + t.innovationScore + t.techScore,
                    0
                  ) / teams.length
                ).toFixed(1)
              : "0"}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search teams by name, theme, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground shadow-sm placeholder:text-muted-foreground transition-colors focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/20"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTheme("All")}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
              activeTheme === "All"
                ? "border-navy bg-navy text-primary-foreground"
                : "border-border bg-card text-muted-foreground shadow-sm hover:text-foreground"
            }`}
          >
            All
          </button>
          {THEMES.map((theme) => (
            <button
              key={theme}
              type="button"
              onClick={() => setActiveTheme(theme)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTheme === theme
                  ? THEME_PILL_ACTIVE[theme]
                  : "border-border bg-card text-muted-foreground shadow-sm hover:text-foreground"
              }`}
            >
              {theme}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-1 rounded-lg border border-border bg-card p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setSortBy("score")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                sortBy === "score"
                  ? "bg-navy text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Score
            </button>
            <button
              type="button"
              onClick={() => setSortBy("name")}
              className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                sortBy === "name"
                  ? "bg-navy text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Name
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table -- click row to open scoring panel */}
      <div className="hidden md:block">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Theme
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Progress
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Innovation
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Tech
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status
                </th>
                <th className="w-10 px-2 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  onClick={() => setSelectedTeamId(team.id)}
                  className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                    team.isTop20 ? "bg-emerald-light/30" : ""
                  } ${selectedTeamId === team.id ? "ring-2 ring-inset ring-navy/30" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">
                        #{String(team.id).padStart(3, "0")}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {team.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${THEME_COLORS[team.theme]}`}
                    >
                      {team.theme}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-emerald transition-all"
                          style={{ width: `${team.milestone}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">
                        {team.milestone}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-sm text-navy">
                    {team.innovationScore}/10
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-sm text-navy">
                    {team.techScore}/10
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-mono text-sm font-bold text-foreground">
                      <Star className="size-3 text-amber-500" />
                      {team.innovationScore + team.techScore}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {team.isTop20 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-dark">
                        <CheckCircle2 className="size-3" />
                        Top 20
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        --
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-3">
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card List -- click card to open scoring panel */}
      <div className="flex flex-col gap-3 md:hidden">
        {filteredTeams.map((team) => (
          <button
            key={team.id}
            type="button"
            onClick={() => setSelectedTeamId(team.id)}
            className={`flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:border-slate-300 ${
              team.isTop20 ? "border-emerald/40" : "border-border"
            }`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">
                  #{String(team.id).padStart(3, "0")}
                </span>
                <h3 className="text-sm font-semibold text-foreground">
                  {team.name}
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-[10px] ${THEME_COLORS[team.theme]}`}
                >
                  {team.theme}
                </Badge>
                {team.isTop20 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-dark">
                    <CheckCircle2 className="size-3" />
                    Top 20
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>
                  Score:{" "}
                  <span className="font-semibold text-foreground">
                    {team.innovationScore + team.techScore}/20
                  </span>
                </span>
                <span>
                  Progress:{" "}
                  <span className="font-semibold text-foreground">
                    {team.milestone}%
                  </span>
                </span>
              </div>
            </div>
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Team Detail / Scoring Panel Overlay */}
      {selectedTeam && (
        <TeamScoringPanel
          team={selectedTeam}
          top20Count={top20Count}
          onUpdateTeam={onUpdateTeam}
          onClose={handleClosePanel}
        />
      )}
    </div>
  );
}

/* ======= Team Scoring Panel ======= */

interface TeamScoringPanelProps {
  team: Team;
  top20Count: number;
  onUpdateTeam: (id: number, updates: Partial<Team>) => void;
  onClose: () => void;
}

function TeamScoringPanel({
  team,
  top20Count,
  onUpdateTeam,
  onClose,
}: TeamScoringPanelProps) {
  const totalScore = team.innovationScore + team.techScore;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[90vh] w-full max-w-lg animate-float-up overflow-y-auto rounded-t-2xl border border-border bg-card shadow-xl md:inset-auto md:right-6 md:top-1/2 md:max-h-[80vh] md:-translate-y-1/2 md:rounded-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                #{String(team.id).padStart(3, "0")}
              </span>
              <h3 className="text-lg font-bold text-foreground">{team.name}</h3>
            </div>
            <Badge
              variant="outline"
              className={`mt-1 text-[10px] ${THEME_COLORS[team.theme]}`}
            >
              {team.theme}
            </Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Close panel"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-6 p-6">
          {/* Progress */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Milestone Progress
            </label>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-emerald transition-all"
                  style={{ width: `${team.milestone}%` }}
                />
              </div>
              <span className="font-mono text-sm font-bold text-foreground">
                {team.milestone}%
              </span>
            </div>
          </div>

          {/* Innovation Score */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Innovation Score
              </label>
              <span className="font-mono text-lg font-bold text-navy">
                {team.innovationScore}/10
              </span>
            </div>
            <Slider
              value={[team.innovationScore]}
              min={0}
              max={10}
              step={1}
              onValueChange={([val]) =>
                onUpdateTeam(team.id, { innovationScore: val })
              }
              className="mt-3"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Tech Score */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Technical Score
              </label>
              <span className="font-mono text-lg font-bold text-navy">
                {team.techScore}/10
              </span>
            </div>
            <Slider
              value={[team.techScore]}
              min={0}
              max={10}
              step={1}
              onValueChange={([val]) =>
                onUpdateTeam(team.id, { techScore: val })
              }
              className="mt-3"
            />
            <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
              <span>0</span>
              <span>5</span>
              <span>10</span>
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between rounded-xl border border-border bg-slate-50 p-4">
            <span className="text-sm font-medium text-foreground">
              Total Score
            </span>
            <span className="inline-flex items-center gap-1.5 font-mono text-2xl font-bold text-foreground">
              <Star className="size-5 text-amber-500" />
              {totalScore}
              <span className="text-sm font-normal text-muted-foreground">
                /20
              </span>
            </span>
          </div>

          {/* Promote / Demote */}
          <button
            type="button"
            onClick={() => {
              if (team.isTop20) {
                onUpdateTeam(team.id, { isTop20: false, rank: null });
              } else if (top20Count < 20) {
                onUpdateTeam(team.id, { isTop20: true });
              }
            }}
            disabled={!team.isTop20 && top20Count >= 20}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
              team.isTop20
                ? "bg-emerald/10 text-emerald-dark hover:bg-emerald/20"
                : top20Count >= 20
                  ? "cursor-not-allowed bg-secondary text-muted-foreground opacity-40"
                  : "bg-navy text-primary-foreground hover:bg-navy-light"
            }`}
          >
            <ArrowUpCircle className="size-4" />
            {team.isTop20
              ? "Remove from Top 20"
              : top20Count >= 20
                ? "Top 20 Full"
                : `Promote to Top 20 (${top20Count}/20)`}
          </button>
        </div>
      </div>
    </>
  );
}

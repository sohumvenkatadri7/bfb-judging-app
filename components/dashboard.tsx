"use client";

import { useState } from "react";
import { AdminDashboard } from "./AdminDashboard";
import { ParticipantView } from "./participant-view";
import { ShortlistingJuryView } from "./shortlisting-jury-view";
import { FinalJuryView } from "./final-jury-view";
import { useTeams } from "../hooks/useTeams";
import { updateTeam } from "@/lib/utils";
import { LoginPage } from "./login-page";
import type { User, Team } from "@/lib/data";

export default function Dashboard() {
  const { teams } = useTeams();
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (u: User) => {
    setUser(u);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (user.role === "admin") {
    return <AdminDashboard />;
  }
  const handleUpdateTeam = async (id: string, updates: Partial<Team>) => {
    try {
      await updateTeam(id, {
        tech_score: updates.techScore as any,
        innovation_score: updates.innovationScore as any,
        milestone_status: updates.milestone as any,
        isTop20: updates.isTop20 as any,
        rank: (updates as any).rank,
      } as any);
    } catch (err) {
      console.error('updateTeam failed', err);
    }
  };

  if (user.role === "participant") {
    const uid = user.teamId ?? user.team_id ?? null;
    const raw = uid ? teams.find((t: any) => String(t.id) === String(uid)) ?? null : null;
    const myTeam = raw
      ? {
          id: raw.id,
          name: raw.team_name ?? raw.name,
          milestone: raw.milestone_status ?? raw.milestone ?? 0,
          innovationScore: raw.innovation_score ?? raw.innovationScore ?? 0,
          techScore: raw.tech_score ?? raw.techScore ?? 0,
          isTop20: raw.is_top20 ?? raw.isTop20 ?? false,
          rank: raw.rank ?? null,
          theme: raw.category ?? raw.theme ?? "",
        }
      : null;
    return <ParticipantView team={myTeam} onUpdateTeam={handleUpdateTeam} />;
  }
  if (user.role === "shortlisting") {
    return <ShortlistingJuryView teams={teams} onUpdateTeam={handleUpdateTeam} />;
  }
  if (user.role === "final") {
    return <FinalJuryView teams={teams} onUpdateTeam={handleUpdateTeam} />;
  }
  return <div>Unknown role</div>;
}

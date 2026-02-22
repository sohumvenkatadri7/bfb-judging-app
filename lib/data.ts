export type Theme = "Mobility" | "Sustainability" | "Citizen Tech" | "AI";

export interface Team {
  id: number;
  name: string;
  theme: Theme;
  milestone: number; // 0, 25, 50, 75, 100
  innovationScore: number;
  techScore: number;
  isTop20: boolean;
  rank: number | null; // 1, 2, 3 or null
}

export type Role = "participant" | "shortlisting" | "final";

export interface User {
  email: string;
  role: Role;
  label: string;
  teamId: number | null; // non-null only for participant role
}

export interface Credential {
  email: string;
  password: string;
  role: Role;
  label: string;
  teamId: number | null;
}

const TEAM_PREFIXES = [
  "Namma", "Silicon", "Code", "Byte", "Pixel", "Data", "Cyber", "Neural",
  "Quantum", "Stack", "Cloud", "Edge", "Core", "Meta", "Zero", "Alpha",
  "Flux", "Grid", "Pulse", "Apex", "Orion", "Nova", "Blaze", "Surge",
  "Drift", "Forge", "Nexus", "Crux", "Arc", "Zen", "Prism", "Echo",
  "Volt", "Sync", "Loop", "Link", "Hive", "Spark", "Wave", "Bolt",
  "Node", "Mesh", "Aura", "Iris", "Vibe", "Glow", "Dash", "Axis",
  "Peak", "Rift",
];

const TEAM_SUFFIXES = [
  "Riders", "Hawks", "Labs", "Minds", "Ninjas", "Hackers", "Squad",
  "Builders", "Makers", "Coders", "Devs", "Geeks", "Ops", "Hub",
  "Force", "Works", "Tech", "Wave", "Flow", "AI", "Stack", "Studio",
  "Core", "Crew", "Team", "Unit", "Box", "Kit", "Bit", "Run",
  "Space", "Craft", "Base", "Zone", "Edge", "Port", "Link", "Net",
  "Grid", "Pool", "Ship", "Dock", "Rack", "Host", "Farm", "Mine",
  "Vault", "Forge", "Pulse", "Spark",
];

const THEMES: Theme[] = ["Mobility", "Sustainability", "Citizen Tech", "AI"];

// Use a seeded-style deterministic shuffle so team names stay stable across calls
function seededName(index: number): string {
  const pi = TEAM_PREFIXES[index % TEAM_PREFIXES.length];
  const si = TEAM_SUFFIXES[index % TEAM_SUFFIXES.length];
  return `${pi} ${si}`;
}

export function generateTeams(): Team[] {
  const teams: Team[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < 100; i++) {
    let name = seededName(i);
    let attempt = 0;
    while (usedNames.has(name)) {
      attempt++;
      const pi = TEAM_PREFIXES[(i + attempt) % TEAM_PREFIXES.length];
      const si = TEAM_SUFFIXES[(i + attempt * 7) % TEAM_SUFFIXES.length];
      name = `${pi} ${si}`;
    }
    usedNames.add(name);

    const milestoneOptions = [0, 25, 50, 75, 100];
    const milestone = milestoneOptions[Math.floor(Math.random() * milestoneOptions.length)];

    teams.push({
      id: i + 1,
      name,
      theme: THEMES[i % 4],
      milestone,
      innovationScore: Math.floor(Math.random() * 6) + 5,
      techScore: Math.floor(Math.random() * 6) + 5,
      isTop20: false,
      rank: null,
    });
  }

  return teams;
}

/**
 * Generate 102 credentials:
 * - 100 team logins (team1@bfb.com ... team100@bfb.com)
 * - 1 shortlisting jury login
 * - 1 final jury / admin login
 *
 * Must be called AFTER generateTeams() so we can reference team names.
 */
export function generateCredentials(teams: Team[]): Credential[] {
  const creds: Credential[] = [];

  for (let i = 0; i < 100; i++) {
    const teamNum = i + 1;
    const paddedNum = String(teamNum).padStart(3, "0");
    creds.push({
      email: `team${teamNum}@bfb.com`,
      password: `bfb${paddedNum}`,
      role: "participant",
      label: teams[i]?.name ?? `Team ${teamNum}`,
      teamId: teamNum,
    });
  }

  creds.push({
    email: "jury@bfb.com",
    password: "judge123",
    role: "shortlisting",
    label: "Shortlisting Jury",
    teamId: null,
  });

  creds.push({
    email: "admin@bfb.com",
    password: "final123",
    role: "final",
    label: "Final Jury",
    teamId: null,
  });

  return creds;
}

export const ADMIN_ALERTS = [
  { id: 1, message: "Wi-Fi credentials updated: network 'BFB-Hack' password 'build2026'", time: "2m ago", type: "info" as const },
  { id: 2, message: "Lunch break at 1:00 PM - Head to Hall B", time: "15m ago", type: "info" as const },
  { id: 3, message: "Mentor Office Hours open - Visit the Mentor Lounge", time: "30m ago", type: "success" as const },
  { id: 4, message: "Submit your GitHub repo links before demo time", time: "1h ago", type: "warning" as const },
  { id: 5, message: "Hardware kits available at Station 3", time: "2h ago", type: "info" as const },
];

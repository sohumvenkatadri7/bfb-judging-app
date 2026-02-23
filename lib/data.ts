// All hardcoded team and credential generation removed.
// Use Supabase for all team and credential data.

import { supabase } from "./supabase";

export type Theme = "Mobility" | "Sustainability" | "Citizen Tech" | "AI";

export type Team = {
  id: string;
  team_name?: string; // DB snake_case
  name?: string; // UI-friendly name
  category?: string;
  theme?: Theme;
  milestone?: number;
  milestone_status?: number;
  tech_score?: number;
  innovation_score?: number;
  isTop20?: boolean;
  leader_email?: string | null;
};

export type Credential = {
  id: string;
  team_id: string;
  email: string;
  password: string;
  role: string;
};

export type AdminAlert = {
  id: string;
  message: string;
  time: string;
  type: string;
  details?: string;
};

export type User = {
  role: string;
  teamId?: string;
  team_id?: string;
  email?: string;
};

// Alerts are now fetched from Supabase. Use fetchAdminAlerts().

// Fetch credentials from Supabase
export async function fetchCredentials() {
  const { data, error } = await supabase
    .from("credentials")
    .select("id, team_id, email, password, role");
  if (error) throw error;
  return data;
}

// Fetch alerts from Supabase
export async function fetchAdminAlerts() {
  const { data, error } = await supabase
    .from("alerts")
    .select("id, message, time, type, details");
  if (error) throw error;
  return data;
}

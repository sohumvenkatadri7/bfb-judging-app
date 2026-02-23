"use server";
import { supabase } from "../lib/supabase";

export async function fetchTeams() {
  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .order("tech_score", { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateMilestone(teamId: string, status: number) {
  const { error } = await supabase
    .from("teams")
    .update({ milestone_status: status })
    .eq("id", teamId);
  if (error) throw error;
}

export async function submitScore(teamId: string, tech: number, innovation: number) {
  const { error } = await supabase
    .from("teams")
    .update({ tech_score: tech, innovation_score: innovation })
    .eq("id", teamId);
  if (error) throw error;
}

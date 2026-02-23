import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { supabase } from "../lib/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function updateTeam(id: string, updates: Partial<{ tech_score: number; innovation_score: number; milestone_status: number }>) {
  const { data, error } = await supabase
    .from("teams")
    .update(updates)
    .eq("id", id);
  if (error) throw error;
  return data;
}

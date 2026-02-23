#!/usr/bin/env node
// Backfill leader_email on teams from credentials using Supabase JS client.
// Usage: set env vars NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY then run:
// node scripts/backfill_leader_email.js

import('dotenv').then(() => {
  // dynamic import to allow Node 18+ ESM style
});

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log('Fetching teams...');
  const { data: teams, error: teamsErr } = await supabase.from('teams').select('id, leader_email');
  if (teamsErr) {
    console.error('Failed to fetch teams:', teamsErr);
    process.exit(1);
  }

  console.log('Fetching credentials...');
  const { data: creds, error: credsErr } = await supabase.from('credentials').select('team_id, email, id').order('team_id').order('id');
  if (credsErr) {
    console.error('Failed to fetch credentials:', credsErr);
    process.exit(1);
  }

  const firstCredByTeam = new Map();
  for (const c of creds) {
    if (!firstCredByTeam.has(c.team_id)) firstCredByTeam.set(c.team_id, c.email);
  }

  let updated = 0;
  for (const t of teams) {
    const current = t.leader_email;
    if (current && current !== '') continue; // skip already set
    const email = firstCredByTeam.get(t.id);
    if (!email) continue;
    const { data, error } = await supabase.from('teams').update({ leader_email: email }).eq('id', t.id).select();
    if (error) {
      console.error('Failed to update team', t.id, error);
    } else {
      updated++;
      console.log('Updated team', t.id, '->', email);
    }
  }

  console.log('Backfill complete. Total updated:', updated);
  process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });

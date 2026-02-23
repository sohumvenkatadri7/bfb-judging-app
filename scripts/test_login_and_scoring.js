import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createCred(team_id, email, role) {
  const password = 'pw' + Math.random().toString(36).slice(-8);
  const { data, error } = await supabase.from('credentials').insert([
    { team_id: team_id || null, email, password, role }
  ]).select();
  if (error) throw error;
  return { row: data[0], password };
}

async function run() {
  console.log('Creating test team...');
  const teamName = `TEST_TEAM_${Date.now()}`;
  const { data: teamData, error: teamErr } = await supabase.from('teams').insert([
    { team_name: teamName, leader_email: `leader+${Date.now()}@example.com`, role: 'participant', category: 'AI', tech_score: 0, innovation_score: 0, milestone_status: 0 }
  ]).select();
  if (teamErr) { console.error('Failed to create team', teamErr); process.exit(1); }
  const team = teamData[0];
  console.log('Created team', team.id);

  const created = [];
  try {
    created.push({ type: 'participant', ...(await createCred(team.id, `participant+${Date.now()}@example.com`, 'participant')) });
    created.push({ type: 'shortlisting', ...(await createCred(null, `short+${Date.now()}@example.com`, 'shortlisting')) });
    created.push({ type: 'final', ...(await createCred(null, `final+${Date.now()}@example.com`, 'final')) });
    created.push({ type: 'admin', ...(await createCred(null, `admin+${Date.now()}@example.com`, 'admin')) });
  } catch (e) {
    console.error('Failed to create credentials', e);
    process.exit(1);
  }

  console.log('Created credentials:');
  for (const c of created) console.log(c.type, c.row.email, c.password);

  // Test login endpoint for each
  for (const c of created) {
    try {
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: c.row.email, password: c.password })
      });
      const body = await res.text();
      console.log('LOGIN', c.type, c.row.email, res.status, body);
    } catch (e) {
      console.error('Login request failed for', c.row.email, e);
    }
  }

  // Update team scores as a jury would
  console.log('Updating team scores...');
  const { data: upd, error: updErr } = await supabase.from('teams').update({ tech_score: 7, innovation_score: 8, milestone_status: 3 }).eq('id', team.id).select();
  if (updErr) console.error('Update failed', updErr); else console.log('Team updated', upd[0]);

  // Verify team
  const { data: verify } = await supabase.from('teams').select('*').eq('id', team.id).single();
  console.log('Verify team', verify);

  // Cleanup created credentials and team
  console.log('Cleaning up...');
  const ids = created.map(c => c.row.id).filter(Boolean);
  if (ids.length) await supabase.from('credentials').delete().in('id', ids);
  await supabase.from('teams').delete().eq('id', team.id);
  console.log('Cleanup complete');
}

run().catch(e => { console.error(e); process.exit(1); });

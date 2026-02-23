"use client";

import { useState, useCallback, useEffect } from "react";
import { GlobalHeader } from "./global-header";
import { supabase } from "../lib/supabase";
import { useTeams } from "../hooks/useTeams";
import { LoginPage } from "./login-page";
import type { Credential, AdminAlert } from "@/lib/data";

// Create credentials for a team
async function createCredential(team_id: string, email: string, password: string, role: string) {
  await supabase.from("credentials").insert([
    { team_id, email, password, role }
  ]);
}

export function AdminDashboard() {
  const { teams } = useTeams();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [juryMembers, setJuryMembers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [teamName, setTeamName] = useState("");
  const [teamTheme, setTeamTheme] = useState("");
  const [leaderEmail, setLeaderEmail] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [alertType, setAlertType] = useState("info");
  const [loggedOut, setLoggedOut] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [lastCreatedCred, setLastCreatedCred] = useState<{ email: string; password: string } | null>(null);

  useEffect(() => {
    async function fetchCreds() {
      const { data } = await supabase.from("credentials").select("*");
      setCredentials(data || []);
    }
    async function fetchAlerts() {
      const { data } = await supabase.from("alerts").select("*");
      setAlerts(data || []);
    }
    async function fetchJury() {
      const { data } = await supabase.from('jury_members').select('*').order('created_at', { ascending: false });
      setJuryMembers(data || []);
    }
    fetchCreds();
    fetchAlerts();
    fetchJury();

    // subscribe to changes so admin sees updates live
    const teamSub = supabase
      .channel("public:credentials")
      .on("postgres_changes", { event: "*", schema: "public", table: "credentials" }, () => fetchCreds())
      .subscribe();
    const alertsSub = supabase
      .channel("public:alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => fetchAlerts())
      .subscribe();
    const jurySub = supabase
      .channel('public:jury_members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jury_members' }, () => fetchJury())
      .subscribe();

    return () => {
      if (teamSub) teamSub.unsubscribe();
      if (alertsSub) alertsSub.unsubscribe();
      if (jurySub) jurySub.unsubscribe();
    };
  }, [teams]); // Refetch when teams change

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    // validate leaderEmail if provided
    if (leaderEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(leaderEmail)) {
      alert("Please enter a valid leader email address.");
      return;
    }

    const { data, error } = await supabase.from("teams").insert([
      {
        team_name: teamName,
        leader_email: leaderEmail?.trim() || null,
        role: "participant",
        category: teamTheme,
        tech_score: 0,
        innovation_score: 0,
        milestone_status: 0
      }
    ]).select();
    if (error) return;
    const team = data && data[0];
    if (team) {
      const email = leaderEmail?.trim() || `${teamName.toLowerCase().replace(/\s+/g, "_")}@bfb.com`;
      const password = Math.random().toString(36).slice(-8);
      const { data: credData, error: credErr } = await supabase.from('credentials').insert([
        { team_id: team.id, email, password, role: 'participant' }
      ]).select();

      // if insertion succeeded, refetch credentials to update UI
      if (!credErr) {
        const { data: allCreds } = await supabase.from('credentials').select('*');
        setCredentials(allCreds || []);
        setLastCreatedCred({ email, password });
      }

      setTeamName("");
      setTeamTheme("");
      setLeaderEmail("");
    }
  };

  const handlePostAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("alerts").insert([
      { message: alertMsg, time: new Date().toLocaleString(), type: alertType }
    ]);
    setAlertMsg("");
    setAlertType("info");
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("Copied!");
      setTimeout(() => setCopyStatus(null), 1500);
    } catch {
      setCopyStatus("Failed");
      setTimeout(() => setCopyStatus(null), 1500);
    }
  };

  const handleSignOut = async () => {
    await fetch("/api/login", { method: "DELETE" });
    setLoggedOut(true);
  };

  // Create a standalone credential (for jury/final/admin) not tied to a team
  const [newCredEmail, setNewCredEmail] = useState("");
  const [newCredRole, setNewCredRole] = useState("shortlisting");
  const handleCreateCred = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(newCredEmail)) {
      alert('Enter a valid email');
      return;
    }
    const password = Math.random().toString(36).slice(-8);
    const { data: credInsert, error } = await supabase.from('credentials').insert([
      { team_id: null, email: newCredEmail.trim(), password, role: newCredRole }
    ]).select();
    // also add to jury_members when role indicates a jury or admin user
    if (!error && (newCredRole === 'shortlisting' || newCredRole === 'final' || newCredRole === 'admin')) {
      try {
        await supabase.from('jury_members').insert([
          { email: newCredEmail.trim(), role: newCredRole }
        ]).select();
      } catch (e) {
        // non-fatal: jury_members may already have the email
      }
    }
    if (!error) {
      const { data: allCreds } = await supabase.from('credentials').select('*');
      setCredentials(allCreds || []);
      setLastCreatedCred({ email: newCredEmail.trim(), password });
      setNewCredEmail('');
    }
  };

  if (loggedOut) {
    return <LoginPage onLogin={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-surface">
      <GlobalHeader title="Admin Dashboard" />
      <main className="max-w-6xl mx-auto py-8 px-4">

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg shadow-sm border p-4 bg-white">
          <h3 className="font-semibold mb-3">Add New Team</h3>
          <form className="flex flex-col gap-3" onSubmit={handleAddTeam}>
            <input value={teamName} onChange={e => setTeamName(e.target.value)} name="teamName" placeholder="Team Name" className="border rounded px-3 py-2 w-full" required />
            <input value={leaderEmail} onChange={e => setLeaderEmail(e.target.value)} name="leaderEmail" placeholder="Team leader email (for credentials)" className="border rounded px-3 py-2 w-full" required />
            <select value={teamTheme} onChange={e => setTeamTheme(e.target.value)} name="teamTheme" className="border rounded px-3 py-2 w-full" required>
              <option value="">Select Theme</option>
              <option value="Mobility">Mobility</option>
              <option value="Sustainability">Sustainability</option>
              <option value="Citizen Tech">Citizen Tech</option>
              <option value="AI">AI</option>
            </select>
            <div className="flex gap-2">
              <button type="submit" className="bg-emerald-600 text-white rounded px-4 py-2">Add Team</button>
              <button type="button" onClick={() => { setTeamName(''); setTeamTheme(''); }} className="border rounded px-4 py-2">Clear</button>
            </div>
          </form>
          {lastCreatedCred && (
            <div className="mt-3 p-3 border rounded bg-gray-50">
              <div className="text-xs text-muted-foreground">Last credential created</div>
              <div className="font-mono mt-1">{lastCreatedCred.email} / {lastCreatedCred.password}</div>
              <div className="mt-2">
                <button onClick={() => handleCopy(lastCreatedCred.password)} className="mr-2 text-xs border px-2 py-1 rounded">Copy PW</button>
                <button onClick={() => handleCopy(lastCreatedCred.email)} className="text-xs border px-2 py-1 rounded">Copy Email</button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-lg shadow-sm border p-4 bg-white">
          <h3 className="font-semibold mb-3">Post New Alert</h3>
          <form className="flex gap-2" onSubmit={handlePostAlert}>
            <input value={alertMsg} onChange={e => setAlertMsg(e.target.value)} name="alertMsg" placeholder="Alert message" className="border rounded px-3 py-2 flex-1" required />
            <select value={alertType} onChange={e => setAlertType(e.target.value)} name="alertType" className="border rounded px-3 py-2">
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
            </select>
            <button type="submit" className="bg-navy text-white rounded px-4 py-2">Post</button>
          </form>
        </section>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="rounded-lg shadow-sm border p-4 bg-white">
          <h3 className="font-semibold mb-3">Create Jury / Admin Credential</h3>
          <form className="flex gap-2 items-center" onSubmit={handleCreateCred}>
            <input value={newCredEmail} onChange={e => setNewCredEmail(e.target.value)} placeholder="Email for credential" className="border rounded px-3 py-2 flex-1" required />
            <select value={newCredRole} onChange={e => setNewCredRole(e.target.value)} className="border rounded px-3 py-2">
              <option value="shortlisting">Shortlisting Jury</option>
              <option value="final">Final Jury</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" className="bg-amber-600 text-white rounded px-4 py-2">Create</button>
          </form>
        </section>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-lg shadow-sm border p-4 bg-white">
          <h3 className="font-semibold mb-3">All Team Credentials</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground">
                  <th className="py-2">Team</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Password</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((c, i) => (
                  <tr key={c.id || i} className={i % 2 === 0 ? 'bg-gray-50' : ''}>
                    <td className="py-2">{teams.find(t => String(t.id) === String(c.team_id))?.team_name || 'Admin'}</td>
                    <td className="py-2 font-mono">{c.email}</td>
                    <td className="py-2 font-mono">{c.password}</td>
                    <td className="py-2">{c.role}</td>
                    <td className="py-2">
                      <button onClick={() => handleCopy(c.password)} className="mr-2 text-xs border px-2 py-1 rounded">Copy PW</button>
                      <button onClick={() => handleCopy(c.email)} className="text-xs border px-2 py-1 rounded">Copy Email</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {copyStatus && <div className="mt-2 text-sm text-emerald-600">{copyStatus}</div>}
          </div>
        </section>

        <section className="rounded-lg shadow-sm border p-4 bg-white">
          <h3 className="font-semibold mb-3">All Alerts</h3>
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{a.message}</div>
                  <div className="text-xs text-muted-foreground">{a.time} • {a.type}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <section className="rounded-lg shadow-sm border p-4 bg-white">
          <h3 className="font-semibold mb-3">Jury Members</h3>
          <div className="space-y-2">
            {juryMembers.map(j => (
              <div key={j.id} className="flex items-center justify-between border rounded p-2">
                <div>
                  <div className="font-medium">{j.email}</div>
                  <div className="text-xs text-muted-foreground">{j.role} • {j.assigned_category || '—'}</div>
                </div>
                <div>
                  <button onClick={() => handleCopy(j.email)} className="text-xs border px-2 py-1 rounded">Copy Email</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      </main>
    </div>
  );
}

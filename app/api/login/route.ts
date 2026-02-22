import { NextResponse } from "next/server";
import { generateCredentials, generateTeams } from "@/lib/data";

// In-memory fallback for demo (replace with DB in production)
let teams = generateTeams();
let credentials = generateCredentials(teams);

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const cred = credentials.find(
    (c) => c.email === email && c.password === password
  );
  if (!cred) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // Set a session cookie (demo: just user info, not secure for prod)
  const res = NextResponse.json({
    email: cred.email,
    role: cred.role,
    label: cred.label,
    teamId: cred.teamId,
  });
  res.cookies.set("bfb-session", JSON.stringify({
    email: cred.email,
    role: cred.role,
    label: cred.label,
    teamId: cred.teamId,
  }), { httpOnly: true, path: "/" });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bfb-session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

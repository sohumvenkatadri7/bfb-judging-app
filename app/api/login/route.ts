import { NextResponse } from "next/server";
import { fetchCredentials } from "@/lib/data";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const credentials = await fetchCredentials();
  const cred = credentials.find(
    (c) => c.email === email && c.password === password
  );
  if (!cred) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
  // Set session cookie
  const res = NextResponse.json({ user: cred });
  res.cookies.set("bfb-session", encodeURIComponent(JSON.stringify(cred)), { httpOnly: true, path: "/" });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("bfb-session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

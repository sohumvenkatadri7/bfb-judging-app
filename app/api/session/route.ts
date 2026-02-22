import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/bfb-session=([^;]+)/);
  if (!match) {
    return NextResponse.json({ user: null });
  }
  try {
    const user = JSON.parse(decodeURIComponent(match[1]));
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}

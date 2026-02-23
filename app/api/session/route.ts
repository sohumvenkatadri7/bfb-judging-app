import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/bfb-session=([^;]+)/);
  if (!match) {
    console.log("Session cookie not found");
    return NextResponse.json({ user: null });
  }
  try {
    const user = JSON.parse(decodeURIComponent(match[1]));
    console.log("Session user:", user);
    return NextResponse.json({ user });
  } catch (err) {
    console.log("Session decode error", err);
    return NextResponse.json({ user: null });
  }
}

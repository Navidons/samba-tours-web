import { NextRequest, NextResponse } from "next/server"
import { serialize } from "cookie"

export async function POST(request: NextRequest) {
  // Clear the admin_session cookie
  const cookie = serialize("admin_session", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0 // Expire immediately
  })
  const res = NextResponse.json({ success: true })
  res.headers.set("Set-Cookie", cookie)
  return res
} 

import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { serialize } from "cookie"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }
    
    // Find user with profile and role
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: { include: { role: true } }
      }
    })
    
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    
    // Check password
    const valid = await bcrypt.compare(password, user.passwordHash)
    
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
    
    // Check admin role
    const isAdmin = user.profile?.role?.roleName === "admin"
    
    if (!isAdmin) {
      return NextResponse.json({ error: "Not an admin user" }, { status: 403 })
    }
    
    // Create a simple session token (for demo, use user id + timestamp, in production use JWT)
    const session = Buffer.from(`${user.id}:${Date.now()}`).toString("base64")
    
    const cookie = serialize("admin_session", session, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8 // 8 hours
    })
    
    const res = NextResponse.json({ success: true })
    res.headers.set("Set-Cookie", cookie)
    return res
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
} 

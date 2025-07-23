import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { prisma } from "./prisma"

export interface AdminSession {
  userId: string
  timestamp: number
}

export function validateAdminSession(): AdminSession | null {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get('admin_session')
  
  if (!sessionCookie?.value) {
    return null
  }
  
  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString()
    if (!decoded.includes(':')) {
      return null
    }
    
    const [userId, timestamp] = decoded.split(':')
    const session: AdminSession = {
      userId,
      timestamp: parseInt(timestamp)
    }
    
    // Check if session is not expired (8 hours)
    const now = Date.now()
    const sessionAge = now - session.timestamp
    const maxAge = 8 * 60 * 60 * 1000 // 8 hours in milliseconds
    
    if (sessionAge > maxAge) {
      return null
    }
    
    return session
  } catch (error) {
    return null
  }
}

export async function requireAdminAuth() {
  const session = validateAdminSession()
  if (!session) {
    redirect('/signin')
  }
  
  // Verify user still exists and is admin
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      include: {
        profile: { include: { role: true } }
      }
    })
    
    if (!user || user.profile?.role?.roleName !== 'admin') {
      redirect('/signin')
    }
    
    return { session, user }
  } catch (error) {
    redirect('/signin')
  }
}

export async function redirectIfAuthenticated() {
  const session = validateAdminSession()
  console.log('[redirectIfAuthenticated] session:', session)
  if (!session) return
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(session.userId) },
      include: {
        profile: { include: { role: true } }
      }
    })
    console.log('[redirectIfAuthenticated] user:', user)
    if (user && user.profile?.role?.roleName === 'admin') {
      redirect('/admin')
    }
  } catch (error) {
    console.log('[redirectIfAuthenticated] error:', error)
    // do nothing, let them see the signin page
  }
} 

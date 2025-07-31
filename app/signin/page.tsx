import type { Metadata } from "next"
import AdminSignIn from "@/components/admin/admin-signin"
import { redirectIfAuthenticated } from "@/lib/server-auth"

export const metadata: Metadata = {
  title: "Sign In - Samba Tours Admin Portal",
  description: "Access your Samba Tours admin account to manage bookings, tours, and customer information. Secure login for tour operators and administrators."
}

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage() {
  await redirectIfAuthenticated()
  return <AdminSignIn />
} 

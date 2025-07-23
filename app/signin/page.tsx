import AdminSignIn from "@/components/admin/admin-signin"
import { redirectIfAuthenticated } from "@/lib/server-auth"

export const metadata = {
  title: "Admin Sign In - Samba Tours",
  description: "Sign in to the Samba Tours admin panel.",
}

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage() {
  await redirectIfAuthenticated()
  return <AdminSignIn />
} 

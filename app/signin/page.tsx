import AdminSignIn from "@/components/admin/admin-signin"
import { redirectIfAuthenticated } from "@/lib/server-auth"

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage() {
  await redirectIfAuthenticated()
  return <AdminSignIn />
} 

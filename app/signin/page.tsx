import type { Metadata } from "next"
import AdminSignIn from "@/components/admin/admin-signin"
import { redirectIfAuthenticated } from "@/lib/server-auth"

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export const dynamic = 'force-dynamic'

export default async function AdminSignInPage() {
  await redirectIfAuthenticated()
  return <AdminSignIn />
}

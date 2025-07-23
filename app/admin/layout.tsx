import type React from "react"
import { requireAdminAuth } from "@/lib/server-auth"
import AdminLayout from "@/components/admin/admin-layout"

export const dynamic = 'force-dynamic'

export default async function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  // Ensure user is authenticated for all admin pages except signin
  await requireAdminAuth()
  
  return <AdminLayout>{children}</AdminLayout>
}

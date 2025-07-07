import { Suspense } from "react"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import ContactManagementClient from "./ContactManagementClient"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Contact Messages - Samba Tours Admin",
  description: "View and manage contact form submissions.",
}

export default function ContactManagementPage() {
  // Check for admin session on server side
  const cookieStore = cookies()
  const adminSession = cookieStore.get('admin_session')
  
  if (!adminSession || !adminSession.value) {
    redirect('/signin?redirect=/admin/contact')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <p className="text-muted-foreground">
          View and manage contact form submissions from your website.
        </p>
      </div>

      <Suspense fallback={<ContactSkeleton />}>
        <ContactManagementClient />
      </Suspense>
    </div>
  )
}

function ContactSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

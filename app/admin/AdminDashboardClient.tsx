"use client"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { QuickActions } from "@/components/admin/quick-actions"
import { Suspense } from "react"

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-green-100 text-green-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export default function AdminDashboardClient() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-earth-900 mb-2">Welcome, Admin!</h1>
            <p className="text-earth-600">Here's a snapshot of your business today.</p>
          </div>

          {/* Stats Cards */}
          <div className="mb-8">
            <Suspense fallback={<div>Loading stats...</div>}>
              <AdminStats />
            </Suspense>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Suspense fallback={<div>Loading recent bookings...</div>}>
                <RecentBookings />
              </Suspense>
            </div>
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

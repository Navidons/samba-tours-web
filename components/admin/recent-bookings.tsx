import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, MoreHorizontal } from "lucide-react"
import { mockRecentBookings } from "@/lib/admin-mock-data"
import Link from "next/link"

const getStatusColor = (status: "confirmed" | "pending" | "cancelled") => {
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

export function RecentBookings() {
  const bookings = mockRecentBookings

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-earth-900">{booking.customerName}</h4>
                  <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                </div>
                <p className="text-sm text-earth-600 mb-1">{booking.tourName}</p>
                <p className="text-xs text-earth-500">
                  Booking ID: {booking.id} • Date: {booking.date}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-forest-600">${booking.amount.toLocaleString()}</span>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link href="/admin/bookings">View All Bookings</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

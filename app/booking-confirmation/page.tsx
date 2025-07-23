import { Suspense } from "react"
import BookingConfirmationClient from "./BookingConfirmationClient"

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Confirmation</h2>
          <p className="text-gray-600">Please wait while we prepare your booking details...</p>
        </div>
      </div>
    }>
      <BookingConfirmationClient />
    </Suspense>
  )
} 

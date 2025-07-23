import type { Metadata } from "next"
import CheckoutForm from "@/components/checkout/checkout-form"

export const metadata: Metadata = {
  title: "Checkout - Samba Tours & Travel",
  description: "Complete your booking and receive confirmation",
}

export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
            <p className="text-lg text-gray-600">Fill in your details to confirm your tour booking</p>
          </div>
          <CheckoutForm />
        </div>
      </div>
    </div>
  )
} 

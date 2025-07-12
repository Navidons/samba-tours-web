import type { Metadata } from "next"
import CartContent from "@/components/cart/cart-content"

export const metadata: Metadata = {
  title: "Shopping Cart - Samba Tours & Travel",
  description: "Review and manage your selected Uganda safari experiences. Customize your tour package and proceed to secure booking with our easy checkout process.",
}

export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Cart</h1>
            <p className="text-lg text-gray-600">Review your selected tours and proceed to booking</p>
          </div>
          <CartContent />
        </div>
      </div>
    </div>
  )
}

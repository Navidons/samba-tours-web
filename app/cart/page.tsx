import CartContent from "@/components/cart/cart-content"

export const dynamic = 'force-dynamic'

export default function CartPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Your Cart</h1>
            <p className="text-base md:text-lg text-gray-600">Review your selected tours and proceed to booking</p>
          </div>
          <CartContent />
        </div>
      </div>
    </div>
  )
}

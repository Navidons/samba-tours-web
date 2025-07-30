import CheckoutForm from "@/components/checkout/checkout-form"

export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Complete Your Booking</h1>
            <p className="text-base md:text-lg text-gray-600">Fill in your details to confirm your tour booking</p>
          </div>
          <CheckoutForm />
        </div>
      </div>
      {/* Bottom spacing for mobile floating action button */}
      <div className="h-20 lg:hidden"></div>
    </div>
  )
} 

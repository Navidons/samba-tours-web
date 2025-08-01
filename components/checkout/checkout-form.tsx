"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, MapPin, CreditCard, User, Mail, Phone, ArrowRight, CheckCircle } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

interface CustomerInfo {
  name: string
  email: string
  phone: string
  country: string
  specialRequests: string
}

interface GuestInfo {
  name: string
  age: number
  dietaryRestrictions: string
  medicalConditions: string
}

export default function CheckoutForm() {
  const { items, getTotal, clearCart } = useCart()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [showGuestDetails, setShowGuestDetails] = useState(false)
  
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    email: "",
    phone: "",
    country: "",
    specialRequests: ""
  })

  const [guests, setGuests] = useState<GuestInfo[]>([])

  // Initialize guests array based on cart items
  useEffect(() => {
    if (items.length > 0) {
      const totalGuests = items.reduce((sum, item) => sum + item.guests, 0)
      setGuests(Array(totalGuests).fill(null).map(() => ({
        name: "",
        age: 0,
        dietaryRestrictions: "",
        medicalConditions: ""
      })))
    }
  }, [items])

  const subtotal = getTotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleCustomerInfoChange = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }))
  }

  const handleGuestChange = (index: number, field: keyof GuestInfo, value: string | number) => {
    setGuests(prev => prev.map((guest, i) => 
      i === index ? { ...guest, [field]: value } : guest
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simplified validation - only require essential customer info
    if (!customerInfo.name || !customerInfo.email) {
      toast.error("Please provide your name and email address")
      return
    }

    // Make guest information optional - only validate if provided
    const hasIncompleteGuestInfo = guests.some(guest => 
      (guest.name && !guest.age) || (!guest.name && guest.age > 0)
    )
    
    if (hasIncompleteGuestInfo) {
      toast.error("Please complete guest information or leave it blank")
      return
    }

    setIsSubmitting(true)

    try {
      // Create booking with simplified guest data
      const bookingData = {
        customerInfo,
        guests: guests.filter(guest => guest.name || guest.age > 0), // Only include filled guest info
        items,
        total,
        bookingReference: `SB${Date.now()}`
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking')
      }

      // Show success message and set redirecting state
      toast.success("Booking confirmed! Redirecting to confirmation page...")
      setIsRedirecting(true)

      // Prepare confirmation data
      const confirmationData = {
        bookingReference: result.booking?.bookingReference || bookingData.bookingReference,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        totalAmount: total,
        numberOfGuests: guests.filter(g => g.name || g.age > 0).length || items.reduce((sum, item) => sum + item.guests, 0),
        tourTitle: items[0]?.title || 'Tour',
        tourDate: items[0]?.startDate || new Date().toISOString(),
        tourPrice: items[0]?.price || 0,
        specialRequests: customerInfo.specialRequests
      }

      // Store in session storage as backup
      sessionStorage.setItem('bookingConfirmation', JSON.stringify(confirmationData))

      // Build URL with query parameters
      const params = new URLSearchParams({
        reference: confirmationData.bookingReference,
        name: confirmationData.customerName,
        email: confirmationData.customerEmail,
        total: confirmationData.totalAmount.toString(),
        guests: confirmationData.numberOfGuests.toString(),
        tour: confirmationData.tourTitle,
        date: confirmationData.tourDate,
        price: confirmationData.tourPrice.toString(),
        ...(confirmationData.specialRequests && { requests: confirmationData.specialRequests })
      })

      const confirmationUrl = `/booking-confirmation?${params.toString()}`
      
      // Use replace to prevent back button issues and add a small delay for better UX
      setTimeout(() => {
        clearCart()
        router.replace(confirmationUrl)
      }, 1000)

      // Fallback redirect in case the first one fails
      setTimeout(() => {
        if (window.location.pathname !== '/booking-confirmation') {
          router.push(confirmationUrl)
        }
      }, 3000)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerInfo.phone}
                  onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={customerInfo.country}
                  onChange={(e) => handleCustomerInfoChange('country', e.target.value)}
                  placeholder="Your country"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
              <Textarea
                id="specialRequests"
                value={customerInfo.specialRequests}
                onChange={(e) => handleCustomerInfoChange('specialRequests', e.target.value)}
                placeholder="Any special requirements, dietary restrictions, or requests..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Guest Information - Optional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Details (Optional)
              <Badge variant="secondary" className="ml-2">Optional</Badge>
            </CardTitle>
            <p className="text-sm text-gray-600 mt-2">
              You can provide guest details now or we can collect them later. This helps us prepare better for your tour.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowGuestDetails(!showGuestDetails)}
              className="w-full"
            >
              {showGuestDetails ? 'Hide Guest Details' : 'Add Guest Details'}
            </Button>

            {showGuestDetails && (
              <div className="space-y-4 pt-4 border-t">
                {guests.map((guest, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-semibold mb-3 text-sm">Guest {index + 1}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`guest-${index}-name`}>Full Name</Label>
                        <Input
                          id={`guest-${index}-name`}
                          value={guest.name}
                          onChange={(e) => handleGuestChange(index, 'name', e.target.value)}
                          placeholder="Guest name"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guest-${index}-age`}>Age</Label>
                        <Input
                          id={`guest-${index}-age`}
                          type="number"
                          min="1"
                          max="120"
                          value={guest.age || ''}
                          onChange={(e) => handleGuestChange(index, 'age', parseInt(e.target.value) || 0)}
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guest-${index}-dietary`}>Dietary Restrictions</Label>
                        <Input
                          id={`guest-${index}-dietary`}
                          value={guest.dietaryRestrictions}
                          onChange={(e) => handleGuestChange(index, 'dietaryRestrictions', e.target.value)}
                          placeholder="e.g., Vegetarian, Gluten-free"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`guest-${index}-medical`}>Medical Conditions</Label>
                        <Input
                          id={`guest-${index}-medical`}
                          value={guest.medicalConditions}
                          onChange={(e) => handleGuestChange(index, 'medicalConditions', e.target.value)}
                          placeholder="Any medical conditions"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Summary - Mobile */}
        <div className="lg:hidden">
          <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tour Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 text-xs font-semibold">
                          {item.title}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{item.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users className="h-3 w-3" />
                        {item.guests} guest{item.guests > 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">${(item.price * item.guests).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${tax.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Desktop Order Summary */}
      <div className="hidden lg:block">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tour Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative w-16 h-12 rounded overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 text-xs font-semibold">
                        {item.title}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {new Date(item.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Users className="h-3 w-3" />
                      {item.guests} guest{item.guests > 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">${(item.price * item.guests).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (10%)</span>
                <span>${tax.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              disabled={isSubmitting || isRedirecting}
              onClick={handleSubmit}
            >
              {isRedirecting ? 'Redirecting to Confirmation...' : isSubmitting ? 'Processing Booking...' : (
                <>
                  Confirm Booking
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
              By confirming your booking, you agree to our terms and conditions.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Floating Action Button */}
      <div className="lg:hidden fixed bottom-4 left-4 right-4 z-50">
        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 shadow-lg"
          disabled={isSubmitting || isRedirecting}
          onClick={handleSubmit}
        >
          {isRedirecting ? 'Redirecting...' : isSubmitting ? 'Processing...' : (
            <>
              Confirm Booking - ${total.toLocaleString()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </>
  )
} 

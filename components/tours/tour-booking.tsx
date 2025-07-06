"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Share2, ShoppingCart } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"

interface Tour {
  id: number
  title: string
  slug: string
  price: number
  originalPrice?: number
  duration: string
  groupSize: number
  maxGroupSize: number
  rating: number
  reviewCount: number
  locationCountry: string
  locationRegion?: string
  difficulty: string
  featuredImage?: {
    data: string
    name: string
    type: string
  }
  category?: {
    name: string
  }
}

interface TourBookingProps {
  tour: Tour
}

export default function TourBooking({ tour }: TourBookingProps) {
  const [isClient, setIsClient] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [guests, setGuests] = useState("2")
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  
  const router = useRouter()
  
  // Only use cart hook on client side
  const cartHook = isClient ? useCart() : null
  const addItem = cartHook?.addItem

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleAddToCart = () => {
    if (!isClient || !addItem) {
      toast.error("Please wait for the page to load completely")
      return
    }

    if (!startDate) {
      toast.error("Please select a start date")
      return
    }

    setIsAddingToCart(true)

    try {
      addItem({
        tourId: tour.id,
        title: tour.title,
        slug: tour.slug,
        image: tour.featuredImage?.data || "/placeholder.svg",
        price: tour.price,
        duration: tour.duration,
        location: tour.locationRegion ? `${tour.locationRegion}, ${tour.locationCountry}` : tour.locationCountry,
        startDate: startDate.toISOString().split('T')[0],
        guests: parseInt(guests),
        category: tour.category?.name || "Tour",
        maxGroupSize: tour.maxGroupSize
      })

      toast.success("Tour added to cart!")
      
      // Optional: Redirect to cart after a short delay
      setTimeout(() => {
        router.push('/cart')
      }, 1000)

    } catch (error) {
      toast.error("Failed to add tour to cart")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const totalPrice = tour.price * Number.parseInt(guests)
  const savings = tour.originalPrice ? (tour.originalPrice - tour.price) * Number.parseInt(guests) : 0

  // Show loading state while client-side hydration is happening
  if (!isClient) {
    return (
      <div className="space-y-6">
        <Card className="sticky top-8">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Price Card */}
      <Card className="sticky top-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-3xl font-bold text-orange-600">${tour.price.toLocaleString()}</span>
                {tour.originalPrice && (
                  <span className="text-lg text-gray-400 line-through">${tour.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <p className="text-sm text-gray-600">per person</p>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{tour.rating}</span>
              <span className="text-sm text-gray-500">({tour.reviewCount})</span>
            </div>
          </div>
          {savings > 0 && <Badge className="bg-green-100 text-green-800 w-fit">Save ${savings.toLocaleString()} total</Badge>}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Enhanced Date Selection */}
          <EnhancedDatePicker
            selectedDate={startDate}
            onDateSelect={setStartDate}
            label="Preferred Start Date"
            placeholder="Select your tour start date"
            minBookingDays={7}
            maxBookingDays={365}
            showDateRange={true}
            duration={tour.duration}
            required={true}
          />

          {/* Guests Selection */}
          <div className="space-y-2">
            <Label htmlFor="guests">Number of Guests *</Label>
            <Select value={guests} onValueChange={setGuests}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: Math.min(tour.maxGroupSize, 12) }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1} {i + 1 === 1 ? "Guest" : "Guests"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Maximum group size: {tour.maxGroupSize} guests
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between text-sm">
              <span>
                ${tour.price.toLocaleString()} × {guests} guests
              </span>
              <span>${totalPrice.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-${savings.toLocaleString()}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total</span>
              <span>${(totalPrice - savings).toLocaleString()}</span>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!startDate || isAddingToCart}
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            size="lg"
          >
            {isAddingToCart ? (
              "Adding to Cart..."
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </>
            )}
          </Button>

          <p className="text-xs text-center text-gray-500">
            Add this tour to your cart and checkout when ready
          </p>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Heart className="mr-2 h-4 w-4" />
              Wishlist
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

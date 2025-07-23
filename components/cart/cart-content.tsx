"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, Plus, Minus, Calendar, Users, MapPin } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCart } from "@/hooks/use-cart"

export default function CartContent() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount } = useCart()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const subtotal = getTotal()
  const tax = subtotal * 0.1
  const total = subtotal + tax

  const handleCheckout = () => {
    setIsCheckingOut(true)
    router.push('/checkout')
  }

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
          <p className="text-gray-600 mb-6">Start exploring our amazing tours and add them to your cart!</p>
          <Button asChild className="bg-gradient-to-r from-emerald-500 to-green-500">
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart Items */}
      <div className="lg:col-span-2 space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-48 h-32 rounded-lg overflow-hidden">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.title} 
                      fill 
                      className="object-cover" 
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 text-base font-semibold">
                      {item.title}
                    </div>
                  )}
                  <Badge className="absolute top-2 left-2 bg-emerald-500">{item.category}</Badge>
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(item.startDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.guests - 1)}
                        disabled={item.guests <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.guests}</span>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => updateQuantity(item.id, item.guests + 1)}
                        disabled={item.guests >= item.maxGroupSize}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-gray-500">Max: {item.maxGroupSize}</span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-600">${item.price.toLocaleString()} per person</p>
                      <p className="text-lg font-semibold text-gray-900">${(item.price * item.guests).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <Card className="sticky top-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal ({getItemCount()} guests)</span>
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

            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
              onClick={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
            </Button>

            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/tours">Continue Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign,
  Mail,
  Phone,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react'
import Link from 'next/link'
import Image from "next/image"

interface BookingConfirmationData {
  bookingReference: string
  customerName: string
  customerEmail: string
  totalAmount: number
  numberOfGuests: number
  tourTitle: string
  tourDate: string
  tourPrice: number
  specialRequests?: string
}

export default function BookingConfirmationClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingConfirmationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get booking data from URL parameters or session storage
    const reference = searchParams.get('reference')
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const total = searchParams.get('total')
    const guests = searchParams.get('guests')
    const tourTitle = searchParams.get('tour')
    const tourDate = searchParams.get('date')
    const tourPrice = searchParams.get('price')
    const specialRequests = searchParams.get('requests')

    if (reference && name && email && total && guests && tourTitle && tourDate && tourPrice) {
      setBookingData({
        bookingReference: reference,
        customerName: name,
        customerEmail: email,
        totalAmount: parseFloat(total),
        numberOfGuests: parseInt(guests),
        tourTitle: tourTitle,
        tourDate: tourDate,
        tourPrice: parseFloat(tourPrice),
        specialRequests: specialRequests || undefined
      })
    } else {
      // Try to get from session storage as fallback
      const storedData = sessionStorage.getItem('bookingConfirmation')
      if (storedData) {
        setBookingData(JSON.parse(storedData))
      } else {
        // Redirect to tours if no booking data
        router.push('/tours')
        return
      }
    }

    setLoading(false)
  }, [searchParams, router])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleDownloadReceipt = () => {
    if (!bookingData) return
    
    const receiptContent = `
      Samba Tours & Travel
      Booking Confirmation Receipt
      
      Booking Reference: ${bookingData.bookingReference}
      Customer: ${bookingData.customerName}
      Email: ${bookingData.customerEmail}
      
      Tour: ${bookingData.tourTitle}
      Date: ${formatDate(bookingData.tourDate)}
      Guests: ${bookingData.numberOfGuests}
      Price per person: ${formatCurrency(bookingData.tourPrice)}
      Total Amount: ${formatCurrency(bookingData.totalAmount)}
      
      ${bookingData.specialRequests ? `Special Requests: ${bookingData.specialRequests}` : ''}
      
      Thank you for choosing Samba Tours!
      Contact: info@sambatours.com | +256 700 123 456
    `
    
    const blob = new Blob([receiptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `booking-${bookingData.bookingReference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShareBooking = () => {
    if (!bookingData) return
    
    const shareText = `I just booked an amazing tour with Samba Tours! 🦁✨
    
Tour: ${bookingData.tourTitle}
Date: ${formatDate(bookingData.tourDate)}
Booking Reference: ${bookingData.bookingReference}

Check out Samba Tours for incredible Uganda safari experiences!`
    
    if (navigator.share) {
      navigator.share({
        title: 'My Samba Tours Booking',
        text: shareText,
        url: window.location.origin
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText)
      alert('Booking details copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Confirmation</h2>
          <p className="text-gray-600">Please wait while we prepare your booking details...</p>
        </div>
      </div>
    )
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Booking Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find your booking confirmation.</p>
            <Link href="/tours">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Tours
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Booking Confirmed!</h1>
              <p className="text-lg text-gray-600">Thank you for choosing Samba Tours</p>
            </div>
          </div>
          
          <Badge variant="outline" className="text-lg px-6 py-3">
            Reference: {bookingData.bookingReference}
          </Badge>
        </div>

        {/* Booking Summary */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-emerald-800">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <DollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-800">{formatCurrency(bookingData.totalAmount)}</div>
                <div className="text-sm text-emerald-700">Total Amount</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-emerald-800">{bookingData.numberOfGuests}</div>
                <div className="text-sm text-emerald-700">Guests</div>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg">
                <Calendar className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <div className="text-lg font-bold text-emerald-800">{formatDate(bookingData.tourDate)}</div>
                <div className="text-sm text-emerald-700">Tour Date</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tour Details */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Tour Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image
                  src="/photos/fort-portal-crater-hero.jpg"
                  alt={bookingData.tourTitle}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{bookingData.tourTitle}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(bookingData.tourDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{bookingData.numberOfGuests} {bookingData.numberOfGuests === 1 ? 'Guest' : 'Guests'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(bookingData.tourPrice)} per person</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Full Day Tour</span>
                  </div>
                </div>
                {bookingData.specialRequests && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <h4 className="font-medium text-amber-800 mb-1">Special Requests:</h4>
                    <p className="text-sm text-amber-700">{bookingData.specialRequests}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Contact Details</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{bookingData.customerEmail}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{bookingData.customerName}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Tour Price ({bookingData.numberOfGuests} × {formatCurrency(bookingData.tourPrice)})</span>
                    <span>{formatCurrency(bookingData.tourPrice * bookingData.numberOfGuests)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total Amount</span>
                    <span>{formatCurrency(bookingData.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-emerald-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Confirmation Email</h4>
                  <p className="text-sm text-gray-600">We've sent a detailed confirmation email to {bookingData.customerEmail}</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-emerald-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Tour Guide Contact</h4>
                  <p className="text-sm text-gray-600">Your tour guide will contact you 24-48 hours before your tour date</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-semibold text-emerald-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Meeting Point</h4>
                  <p className="text-sm text-gray-600">We'll provide detailed meeting point instructions in your confirmation email</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Mail className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Email Support</h4>
                <p className="text-sm text-gray-600">info@sambatours.com</p>
              </div>
              <div className="text-center p-4 bg-emerald-50 rounded-lg">
                <Phone className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-medium text-gray-900 mb-1">Phone Support</h4>
                <p className="text-sm text-gray-600">+256 700 123 456</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleDownloadReceipt} variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Download Receipt</span>
          </Button>
          <Button onClick={handleShareBooking} variant="outline" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share Booking</span>
          </Button>
          <Link href="/tours">
            <Button className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Browse More Tours</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 

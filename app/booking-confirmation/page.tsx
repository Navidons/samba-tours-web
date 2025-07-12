"use client"

import { useState, useEffect } from "react"

export const dynamic = 'force-dynamic'

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

export default function BookingConfirmationPage() {
  console.log('BookingConfirmationPage component rendered')
  
  const searchParams = useSearchParams()
  const router = useRouter()
  const [bookingData, setBookingData] = useState<BookingConfirmationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Confirmation page loaded, checking for booking data...')
    
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

    console.log('URL parameters:', { reference, name, email, total, guests, tourTitle, tourDate, tourPrice, specialRequests })

    if (reference && name && email && total && guests && tourTitle && tourDate && tourPrice) {
      console.log('Setting booking data from URL parameters')
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
      console.log('URL parameters incomplete, checking session storage...')
      // Try to get from session storage as fallback
      const storedData = sessionStorage.getItem('bookingConfirmation')
      if (storedData) {
        console.log('Found booking data in session storage')
        setBookingData(JSON.parse(storedData))
      } else {
        console.log('No booking data found, redirecting to tours')
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
                <h3 className="text-xl font-semibold text-gray-900">{bookingData.tourTitle}</h3>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(bookingData.tourDate)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{bookingData.numberOfGuests} guest{bookingData.numberOfGuests > 1 ? 's' : ''}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatCurrency(bookingData.tourPrice)} per person</span>
                  </span>
                </div>
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
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{bookingData.customerName}</p>
                <p className="text-sm text-gray-600">Primary Contact</p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{bookingData.customerEmail}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Special Requests */}
        {bookingData.specialRequests && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Special Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{bookingData.specialRequests}</p>
            </CardContent>
          </Card>
        )}

        {/* What's Next */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-800">What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                <div>
                  <p className="font-medium text-emerald-800">Email Confirmation</p>
                  <p className="text-sm text-emerald-700">You'll receive a detailed confirmation email within minutes</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                <div>
                  <p className="font-medium text-emerald-800">Team Contact</p>
                  <p className="text-sm text-emerald-700">Our team will contact you within 24 hours to discuss payment and finalize details</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                <div>
                  <p className="font-medium text-emerald-800">Final Confirmation</p>
                  <p className="text-sm text-emerald-700">You'll receive final confirmation 48 hours before your tour departure</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={handleDownloadReceipt} variant="outline" className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download Receipt
          </Button>
          <Button onClick={handleShareBooking} variant="outline" className="w-full">
            <Share2 className="w-4 h-4 mr-2" />
            Share Booking
          </Button>
          <Link href="/tours">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse More Tours
            </Button>
          </Link>
        </div>

        {/* Contact Information */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-4 text-center">Need Help?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center">
                <Mail className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Email Support</p>
                <p className="text-sm text-blue-700">info@sambatours.com</p>
                <p className="text-xs text-blue-600">Response within 2 hours</p>
              </div>
              <div className="text-center">
                <Phone className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-medium text-blue-800">Phone Support</p>
                <p className="text-sm text-blue-700">+256 700 123 456</p>
                <p className="text-xs text-blue-600">Available 24/7</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 
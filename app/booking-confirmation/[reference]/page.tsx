"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  MapPin, 
  Clock, 
  DollarSign,
  Mail,
  Phone,
  Download,
  Share2,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface BookingGuest {
  id: number
  guestName: string
  guestAge: number
  nationality: string
  medicalConditions?: string
}

interface Tour {
  id: number
  title: string
  slug: string
  duration: number
  difficulty: string
  price: number
  featuredImageData?: Buffer
  featuredImageName?: string
  featuredImageType?: string
}

interface Customer {
  id: number
  name: string
  email: string
  phone: string
  country: string
}

interface Booking {
  id: number
  bookingReference: string
  status: string
  paymentStatus: string
  numberOfGuests: number
  totalAmount: number
  currency: string
  preferredDate: string
  specialRequests?: string
  tour: Tour
  customer: Customer
  guests: BookingGuest[]
  createdAt: string
  updatedAt: string
}

export default function BookingConfirmationPage() {
  const params = useParams()
  const { reference } = params
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [emailSent, setEmailSent] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    if (reference) {
      loadBooking()
    }
  }, [reference])

  const loadBooking = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/bookings?bookingReference=${reference}`)
      const data = await response.json()

      if (data.success && data.bookings.length > 0) {
        setBooking(data.bookings[0])
        // Check if email was already sent
        if (data.bookings[0].emailSent) {
          setEmailSent(true)
        }
      } else {
        // Try again after a short delay in case of database timing issues
        setTimeout(async () => {
          try {
            const retryResponse = await fetch(`/api/bookings?bookingReference=${reference}`)
            const retryData = await retryResponse.json()
            
            if (retryData.success && retryData.bookings.length > 0) {
              setBooking(retryData.bookings[0])
              if (retryData.bookings[0].emailSent) {
          setEmailSent(true)
        }
      } else {
        toast({
          title: "Booking Not Found",
                description: "The booking reference could not be found. Please contact support.",
                variant: "destructive"
              })
            }
          } catch (retryError) {
            console.error('Error on retry:', retryError)
            toast({
              title: "Error",
              description: "Failed to load booking details. Please contact support.",
          variant: "destructive"
        })
          } finally {
            setLoading(false)
          }
        }, 2000) // Wait 2 seconds before retry
        
        return // Don't set loading to false yet
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      toast({
        title: "Error",
        description: "Failed to load booking details.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const sendConfirmationEmail = async () => {
    if (!booking) return

    try {
      setSendingEmail(true)
      const response = await fetch('/api/bookings/send-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bookingReference: booking.bookingReference,
          customerEmail: booking.customer.email
        })
      })

      const data = await response.json()

      if (data.success) {
        setEmailSent(true)
        toast({
          title: "Email Sent",
          description: "Confirmation email has been sent successfully.",
        })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: "Error",
        description: "Failed to send confirmation email.",
        variant: "destructive"
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Your Booking</h2>
          <p className="text-gray-600">Please wait while we retrieve your booking details...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">The booking reference could not be found.</p>
            <Link href="/tours">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tours
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Success Banner */}
        {showSuccessMessage && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-green-800">Booking Successfully Confirmed!</h3>
                    <p className="text-sm text-green-700">You will receive a confirmation email shortly.</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessMessage(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <h1 className="text-3xl font-bold text-gray-900">Booking Confirmed!</h1>
          </div>
          <p className="text-gray-600">Your booking has been successfully confirmed</p>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Reference: {booking.bookingReference}
            </Badge>
          </div>
          
          {/* Booking Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 max-w-2xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-emerald-600">{formatCurrency(booking.totalAmount)}</div>
                <div className="text-sm text-gray-600">Total Amount</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{booking.numberOfGuests}</div>
                <div className="text-sm text-gray-600">Guests</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{formatDate(booking.preferredDate)}</div>
                <div className="text-sm text-gray-600">Tour Date</div>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3 text-center">What Happens Next?</h3>
            <div className="space-y-3">
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
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>Booking Summary</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <span className="text-sm text-gray-600">Status</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                    <span className="text-sm text-gray-600">Payment</span>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatCurrency(booking.totalAmount)}
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {booking.numberOfGuests}
                    </div>
                    <div className="text-sm text-gray-600">Guests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatDate(booking.preferredDate)}
                    </div>
                    <div className="text-sm text-gray-600">Preferred Date</div>
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
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  {booking.tour.featuredImageData && (
                    <img
                      src={`data:${booking.tour.featuredImageType || 'image/jpeg'};base64,${Buffer.from(booking.tour.featuredImageData).toString('base64')}`}
                      alt={booking.tour.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{booking.tour.title}</h3>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{booking.tour.duration} days</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{booking.tour.difficulty}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <DollarSign className="w-4 h-4" />
                        <span>{formatCurrency(booking.tour.price)} per person</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Guest Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {booking.guests.map((guest, index) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Guest {index + 1}</h4>
                        <p className="text-sm text-gray-600">{guest.guestName}</p>
                        <p className="text-xs text-gray-500">Age: {guest.guestAge} • {guest.nationality}</p>
                        {guest.medicalConditions && (
                          <p className="text-xs text-orange-600 mt-1">
                            Medical: {guest.medicalConditions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium text-gray-900">{booking.customer.name}</p>
                  <p className="text-sm text-gray-600">{booking.customer.country}</p>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{booking.customer.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{booking.customer.phone}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!emailSent ? (
                  <Button 
                    onClick={sendConfirmationEmail} 
                    disabled={sendingEmail}
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    {sendingEmail ? 'Sending...' : 'Send Confirmation Email'}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Email Sent
                  </Button>
                )}
                
                <Button variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Booking
                </Button>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm space-y-2">
                  <p className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Our team will contact you within 24 hours</span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Payment instructions will be provided</span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>Final confirmation 48 hours before departure</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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

        {/* Footer Actions */}
        <div className="flex items-center justify-center space-x-4 pt-6">
          <Link href="/tours">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse More Tours
            </Button>
          </Link>
          <Link href="/account">
            <Button>
              View My Bookings
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 
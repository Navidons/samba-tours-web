import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, MapPin, Clock, Award, Shield, Users, Star } from "lucide-react"

const contactMethods = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+256 700 123 456", "+256 414 123 456"],
    description: "Available 24/7 for emergencies",
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@sambatours.com", "bookings@sambatours.com"],
    description: "We respond within 2 hours",
  },
  {
    icon: MapPin,
    title: "Office",
    details: ["Plot 123, Kampala Road", "Kampala, Uganda"],
    description: "Visit us Monday - Saturday",
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Mon - Fri: 8:00 AM - 6:00 PM", "Sat: 9:00 AM - 4:00 PM"],
    description: "Sunday: Emergency only",
  },
]

const trustIndicators = [
  { icon: Award, text: "15+ Years Experience" },
  { icon: Users, text: "5000+ Happy Travelers" },
  { icon: Star, text: "4.9/5 Rating" },
  { icon: Shield, text: "Licensed & Insured" },
]

export default function ContactInfo() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Get in Touch</CardTitle>
          <CardDescription>
            Our expert team is here to help you plan the perfect Uganda adventure. Contact us through any of the methods
            below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {contactMethods.map((method, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <method.icon className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{method.title}</h4>
                {method.details.map((detail, idx) => (
                  <p key={idx} className="text-gray-600">
                    {detail}
                  </p>
                ))}
                <p className="text-sm text-gray-500 mt-1">{method.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Why Choose Samba Tours?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {trustIndicators.map((indicator, index) => (
              <div key={index} className="flex items-center space-x-2">
                <indicator.icon className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium">{indicator.text}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2">
            <Badge variant="secondary" className="mr-2">
              Uganda Tourism Board Licensed
            </Badge>
            <Badge variant="secondary" className="mr-2">
              IATA Certified
            </Badge>
            <Badge variant="secondary">Eco-Tourism Certified</Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-6">
          <h4 className="font-bold text-gray-900 mb-2">Emergency Contact</h4>
          <p className="text-gray-600 mb-2">24/7 emergency support for travelers</p>
          <p className="font-semibold text-orange-600">+256 700 999 888</p>
        </CardContent>
      </Card>
    </div>
  )
}

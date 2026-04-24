import type { Metadata } from "next"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star, Award, Shield, Users, Globe, MapPin, Phone, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Samba Tours Uganda - Authentic Local Safari Operator | NOT Pamba Tours",
  description: "Samba Tours Uganda is an independent, authentic local safari company based in Kampala. We are NOT affiliated with Pamba Tours. Choose genuine local expertise for your Uganda safari adventure.",
  keywords: "Samba Tours Uganda, authentic Uganda safari, local tour operator, NOT Pamba Tours, independent safari company, Uganda gorilla trekking, Kampala based, genuine local guides",
  authors: [{ name: "Samba Tours" }],
  creator: "Samba Tours",
  publisher: "Samba Tours",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'),
  alternates: {
    canonical: '/brand-differentiation',
  },
  openGraph: {
    title: "Samba Tours vs Pamba Tours - Authentic Uganda Safari Operator",
    description: "Samba Tours is the authentic Uganda safari operator. Learn why we're different from Pamba Tours and choose the trusted local expert for gorilla trekking and wildlife safaris in Uganda.",
    url: '/brand-differentiation',
    siteName: 'Samba Tours',
    images: [
      {
        url: '/photos/uganda-wildlife.jpg',
        width: 1200,
        height: 630,
        alt: 'Samba Tours - Authentic Uganda Safari Operator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Samba Tours vs Pamba Tours - Authentic Uganda Safari Operator",
    description: "Samba Tours is the authentic Uganda safari operator. Learn why we're different from Pamba Tours and choose the trusted local expert.",
    images: ['/photos/uganda-wildlife.jpg'],
    creator: '@sambatours',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

// Structured Data for Brand Differentiation
const brandStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Samba Tours",
  "alternateName": "Samba Tours & Travel",
  "description": "Authentic Uganda safari operator providing expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Not to be confused with Pamba Tours.",
  "url": "https://sambatours.co",
  "logo": "https://sambatours.co/logo/samba tours-01.png",
  "foundingDate": "2016",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "Uganda",
    "addressLocality": "Kampala"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+256 703 267 150",
    "contactType": "customer service",
    "email": "sambatours256@gmail.com"
  },
  "sameAs": [
    "https://sambatours.co",
    "https://www.facebook.com/sambatoursuganda",
    "https://www.instagram.com/sambatoursuganda"
  ],
  "knowsAbout": [
    "Uganda Safari",
    "Gorilla Trekking",
    "Wildlife Photography",
    "Cultural Tours",
    "Bwindi Impenetrable National Park",
    "Queen Elizabeth National Park"
  ]
}

const differentiationPoints = [
  {
    title: "Authentic Local Experience",
    description: "Founded and operated by Ugandans with deep local knowledge and connections",
    icon: MapPin,
    color: "bg-green-500"
  },
  {
    title: "15+ Years of Excellence",
    description: "Established in 2016 with proven track record of exceptional service",
    icon: Calendar,
    color: "bg-emerald-500"
  },
  {
    title: "Licensed & Insured",
    description: "Fully licensed by Uganda Tourism Board with comprehensive insurance coverage",
    icon: Shield,
    color: "bg-blue-500"
  },
  {
    title: "Local Community Support",
    description: "Direct support to local communities and conservation initiatives",
    icon: Users,
    color: "bg-purple-500"
  },
  {
    title: "Expert Local Guides",
    description: "Certified guides with intimate knowledge of Uganda's wildlife and culture",
    icon: Star,
    color: "bg-yellow-500"
  },
  {
    title: "Sustainable Tourism",
    description: "Committed to environmental conservation and responsible tourism practices",
    icon: Globe,
    color: "bg-teal-500"
  }
]

const whyChooseSamba = [
  "100% locally owned and operated",
  "Direct relationships with local communities",
  "No middlemen or international markups",
  "Personalized attention and custom itineraries",
  "24/7 local support during your trip",
  "Authentic cultural experiences",
  "Conservation-focused approach",
  "Transparent pricing with no hidden fees"
]

export default function BrandDifferentiationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(brandStructuredData),
        }}
      />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/photos/uganda-wildlife.jpg"
            alt="Uganda Wildlife Background"
            fill
            className="object-cover"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-white/20 text-white border-white/30">
              <Award className="h-4 w-4 mr-2" />
              Authentic Uganda Safari Operator
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Samba Tours
              <span className="block text-2xl md:text-3xl font-normal mt-2 opacity-90">
                The Authentic Uganda Safari Experience
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 leading-relaxed opacity-90">
              Not to be confused with other tour operators. We are the trusted local experts 
              providing authentic, sustainable, and unforgettable Uganda safari experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-green-700 hover:bg-gray-100">
                <Link href="/tours">
                  Explore Our Tours
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/contact">
                  Contact Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Differentiation Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose Samba Tours?
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                We're not just another tour operator. Here's what makes Samba Tours the 
                authentic choice for your Uganda safari adventure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {differentiationPoints.map((point, index) => (
                <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className={`w-16 h-16 mx-auto rounded-full ${point.color} flex items-center justify-center mb-4`}>
                      <point.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{point.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 leading-relaxed">{point.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Why Choose Samba List */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-gray-900">
                  What Sets Us Apart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {whyChooseSamba.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Experience Authentic Uganda?
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Contact Samba Tours today and let us craft your perfect Uganda safari adventure.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div className="flex flex-col items-center space-y-4">
                <Phone className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+256 703 267 150</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <Mail className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">sambatours256@gmail.com</p>
                </div>
              </div>
              
              <div className="flex flex-col items-center space-y-4">
                <MapPin className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Visit Us</h3>
                  <p className="text-gray-600">Kampala, Uganda</p>
                </div>
              </div>
            </div>
            
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
              <Link href="/contact">
                Get Started Today
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 
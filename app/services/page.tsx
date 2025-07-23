import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { 
  Camera, 
  Users, 
  Hotel, 
  Map, 
  Car, 
  Shield, 
  Globe, 
  CheckCircle, 
  Star, 
  Award, 
  Phone, 
  Mail, 
  Calendar,
  ArrowRight,
  Heart,
  Zap,
  Clock,
  MapPin,
  ChevronRight,
  Play,
  Quote,
  Mountain,
  Building2,
  FileText,
  Plane,
  Bus,
  CreditCard,
  DollarSign,
  Palette,
  Compass
} from "lucide-react"

export const metadata: Metadata = {
  title: "Our Services - Samba Tours Uganda | Comprehensive Travel Solutions",
  description: "Discover our complete range of travel services including safari tours, gorilla trekking, hotel booking, visa assistance, transportation, travel insurance, and more.",
}

const services = [
  {
    name: "Safari Tours",
    description: "Experience the thrill of wildlife safaris in Uganda's most spectacular national parks",
    icon: Mountain,
    href: "/tours?category=wildlife-safari",
    features: [
      "Big Five Game Drives",
      "Professional Safari Guides", 
      "Luxury Lodge Accommodations",
      "Photography Opportunities"
    ],
    highlights: ["Queen Elizabeth NP", "Murchison Falls NP", "Kidepo Valley NP"],
    price: "From $150/day",
    duration: "1-14 days",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50"
  },
  {
    name: "Gorilla Trekking",
    description: "Encounter the majestic mountain gorillas in their natural habitat",
    icon: Users,
    href: "/tours?category=gorilla-trekking",
    features: [
      "Gorilla Permits Included",
      "Expert Trackers & Guides",
      "Conservation Education",
      "Small Group Sizes"
    ],
    highlights: ["Bwindi Impenetrable NP", "Mgahinga Gorilla NP"],
    price: "From $700",
    duration: "1-3 days",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50"
  },
  {
    name: "Hotel Booking",
    description: "Reserve handpicked accommodations across Uganda for your comfort",
    icon: Building2,
    href: "/contact",
    features: [
      "Luxury Safari Lodges",
      "Eco-Friendly Resorts",
      "Prime Location Hotels",
      "Budget Accommodations"
    ],
    highlights: ["Kampala Hotels", "Safari Lodges", "Eco Resorts"],
    price: "From $50/night",
    duration: "Flexible",
    color: "from-green-600 to-emerald-700",
    bgColor: "bg-green-50"
  },
  {
    name: "Visa Processes",
    description: "Comprehensive assistance with visa applications and documentation",
    icon: FileText,
    href: "/contact",
    features: [
      "Application Support",
      "Documentation Help",
      "Fast Processing",
      "Multiple Visa Types"
    ],
    highlights: ["Tourist Visa", "Business Visa", "Transit Visa"],
    price: "From $50",
    duration: "3-7 days",
    color: "from-emerald-600 to-green-700",
    bgColor: "bg-emerald-50"
  },
  {
    name: "Airport Pickups",
    description: "Reliable and comfortable airport transfer services",
    icon: Plane,
    href: "/contact",
    features: [
      "Meet & Greet Service",
      "Flight Monitoring",
      "Comfortable Vehicles",
      "Professional Drivers"
    ],
    highlights: ["Entebbe Airport", "Kampala City", "Hotel Transfers"],
    price: "From $30",
    duration: "30-60 min",
    color: "from-green-500 to-teal-600",
    bgColor: "bg-green-50"
  },
  {
    name: "Visitors Transportation",
    description: "Comprehensive transport solutions for all your travel needs",
    icon: Bus,
    href: "/contact",
    features: [
      "Safari Vehicles",
      "Private Chauffeurs",
      "Group Transportation",
      "City Tours"
    ],
    highlights: ["4x4 Safari Vehicles", "Luxury Vans", "Private Cars"],
    price: "From $80/day",
    duration: "Flexible",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50"
  },
  {
    name: "Travel Insurance",
    description: "Comprehensive travel protection for peace of mind",
    icon: Shield,
    href: "/contact",
    features: [
      "Medical Coverage",
      "Trip Cancellation",
      "24/7 Support",
      "Emergency Evacuation"
    ],
    highlights: ["Medical Emergency", "Trip Interruption", "Adventure Sports"],
    price: "From $5/day",
    duration: "Trip Duration",
    color: "from-green-600 to-emerald-700",
    bgColor: "bg-green-50"
  },
  {
    name: "Currency Exchange",
    description: "Convenient and secure currency exchange services",
    icon: DollarSign,
    href: "/contact",
    features: [
      "Competitive Rates",
      "Multiple Currencies",
      "Secure Transactions",
      "Online Booking"
    ],
    highlights: ["USD", "EUR", "GBP", "Local Currency"],
    price: "Market Rates",
    duration: "Instant",
    color: "from-emerald-500 to-green-600",
    bgColor: "bg-emerald-50"
  },
  {
    name: "Customer Tours",
    description: "Tailored experiences designed specifically for your needs",
    icon: Compass,
    href: "/contact",
    features: [
      "Personalized Itineraries",
      "Flexible Scheduling",
      "Private Groups",
      "Custom Activities"
    ],
    highlights: ["Family Tours", "Honeymoon Packages", "Corporate Events"],
    price: "Custom Quote",
    duration: "Flexible",
    color: "from-green-500 to-emerald-600",
    bgColor: "bg-green-50"
  },
  {
    name: "Photography Tours",
    description: "Professional photography expeditions with expert guidance",
    icon: Camera,
    href: "/tours?category=photography",
    features: [
      "Expert Photographers",
      "Specialized Equipment",
      "Prime Locations",
      "Technical Guidance"
    ],
    highlights: ["Wildlife Photography", "Landscape Shots", "Cultural Portraits"],
    price: "From $200/day",
    duration: "3-10 days",
    color: "from-emerald-600 to-green-700",
    bgColor: "bg-emerald-50"
  }
]

const stats = [
  { number: "500+", label: "Happy Travelers", icon: Users },
  { number: "10+", label: "Years Experience", icon: Award },
  { number: "98%", label: "Satisfaction Rate", icon: Star },
  { number: "24/7", label: "Support Available", icon: Clock }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    location: "USA",
    text: "Samba Tours made our Uganda adventure absolutely unforgettable. Every service was perfectly executed!",
    rating: 5
  },
  {
    name: "Michael Chen",
    location: "Canada",
    text: "From visa assistance to safari tours, their comprehensive services exceeded all expectations.",
    rating: 5
  },
  {
    name: "Emma Thompson",
    location: "UK",
    text: "Professional, reliable, and passionate about Uganda. Highly recommend their complete service package.",
    rating: 5
  }
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-semibold mb-8 border border-white/20 shadow-lg">
                <Star className="h-4 w-4 mr-3" />
                Comprehensive Travel Solutions
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                Your Complete
                <span className="block text-green-200 bg-gradient-to-r from-green-200 to-emerald-200 bg-clip-text text-transparent">Uganda Experience</span>
              </h1>
              <p className="text-xl md:text-2xl text-green-100 mb-10 leading-relaxed max-w-2xl">
                From safari adventures to travel logistics, we provide everything you need for an unforgettable journey through the Pearl of Africa.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-bold text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300" asChild>
                  <Link href="/contact">
                    <Calendar className="h-6 w-6 mr-3" />
                    Get Started Today
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-10 border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                      <div key={index} className="text-center p-6 bg-white/10 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/10">
                        <Icon className="h-10 w-10 mx-auto mb-4 text-green-200" />
                        <div className="text-3xl font-bold mb-2">{stat.number}</div>
                        <div className="text-sm text-green-200 font-medium">{stat.label}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-green-100 text-green-700 px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-sm">
              <CheckCircle className="h-5 w-5 mr-3" />
              10 Comprehensive Services
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Everything You Need for Your Adventure
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We've got every aspect of your Uganda journey covered, from planning to execution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => {
              const Icon = service.icon
              return (
                <Card key={index} className="group relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 bg-white">
                  {/* Gradient top border */}
                  <div className={`h-1 bg-gradient-to-r ${service.color}`}></div>
                  
                  {/* Background pattern */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <CardHeader className="relative pb-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300"></div>
                        <Icon className="h-8 w-8 text-white relative z-10 group-hover:rotate-3 transition-transform duration-300" />
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-green-700 transition-colors duration-300 leading-tight">
                      {service.name}
                    </CardTitle>
                    <p className="text-gray-600 mt-3 leading-relaxed text-base">{service.description}</p>
                  </CardHeader>
                  
                  <CardContent className="relative pt-0">
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                          Key Features
                        </h4>
                        <ul className="space-y-3">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start text-sm text-gray-700 leading-relaxed">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2 flex-shrink-0"></div>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 text-lg">Highlights</h4>
                        <div className="flex flex-wrap gap-2">
                          {service.highlights.map((highlight, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:border-green-200 transition-colors duration-200 px-3 py-1">
                              {highlight}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex items-center text-sm text-gray-500 font-medium">
                          <Clock className="h-4 w-4 mr-2 text-green-600" />
                          {service.duration}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              What Our Travelers Say
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Don't just take our word for it - hear from travelers who've experienced our comprehensive services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-gradient-to-br from-gray-50 to-white">
                <div className="flex items-center mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic text-lg leading-relaxed">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 font-medium">{testimonial.location}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
} 

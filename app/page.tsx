import { Suspense } from "react"
import { Metadata } from "next"
import Image from "next/image"
import HeroSection from "@/components/home/hero-section"
import AttractionsShowcase from "@/components/home/attractions-showcase"
import AboutPreview from "@/components/home/about-preview"
import LoadingSpinner from "@/components/ui/loading-spinner"
import ScrollGuard from "@/components/ui/scroll-guard"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Mountain, Sun, Bird, Coffee, Heart, 
  Palmtree, Camera, Map, Users, Tent,
  Compass, TreePine, Fish, Plane, Utensils, Drum, Leaf
} from "lucide-react"

// Wildlife highlights
const wildlifeHighlights = [
  {
    title: "Chimpanzees in Bwindi",
    location: "Bwindi Impenetrable Forest",
    image: "/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg"
  },
  {
    title: "Queen Elizabeth Wildlife",
    location: "Queen Elizabeth National Park",
    image: "/photos/queen-elizabeth-national-park-uganda.jpg"
  },
  {
    title: "Uganda's Diverse Wildlife",
    location: "Various National Parks",
    image: "/photos/uganda-wildlife.jpg"
  }
]

// Image loading optimization settings
const imageOptimization = {
  quality: 85,
  placeholder: 'blur',
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='
}

// Homepage FAQ data for structured data
const homepageFAQs = [
  {
    question: "What makes Uganda the 'Pearl of Africa'?",
    answer: "Uganda earned this title from Winston Churchill for its extraordinary natural beauty, rich biodiversity, and warm people. The country boasts diverse landscapes from snow-capped mountains to lush rainforests, and is home to mountain gorillas, the mighty Nile River, and over 1,000 bird species."
  },
  {
    question: "What unique experiences can I find in Uganda?",
    answer: "Uganda offers unique experiences like mountain gorilla trekking in Bwindi, chimpanzee tracking in Kibale Forest, tree-climbing lions in Queen Elizabeth National Park, and witnessing the powerful Murchison Falls. You can also experience authentic cultural encounters with various tribes."
  },
  {
    question: "What is the best time to visit Uganda?",
    answer: "Uganda's dry seasons (December-February and June-September) are ideal for gorilla trekking and safaris. The wet seasons offer excellent bird watching and lush landscapes. Each season provides unique opportunities to experience Uganda's diverse wildlife and scenery."
  },
  {
    question: "How sustainable is tourism in Uganda?",
    answer: "Uganda practices sustainable tourism through strict conservation measures, community-based tourism initiatives, and responsible wildlife viewing practices. Tourism directly supports gorilla conservation, local communities, and preservation of natural habitats."
  }
]

// Pearl of Africa highlights
const pearlHighlights = [
  {
    icon: <Mountain className="w-8 h-8 text-emerald-600" />,
    title: "Majestic Mountains",
    description: "From the snow-capped Rwenzori Mountains to Mount Elgon's ancient caldera"
  },
  {
    icon: <Leaf className="w-8 h-8 text-emerald-600" />,
    title: "Lush Forests",
    description: "Home to mountain gorillas and diverse primate species"
  },
  {
    icon: <Sun className="w-8 h-8 text-emerald-600" />,
    title: "Savannah Plains",
    description: "Vast landscapes teeming with African wildlife"
  },
  {
    icon: <Bird className="w-8 h-8 text-emerald-600" />,
    title: "Rich Biodiversity",
    description: "Over 1,000 bird species and abundant wildlife"
  },
  {
    icon: <Coffee className="w-8 h-8 text-emerald-600" />,
    title: "Cultural Heritage",
    description: "Diverse traditions, crafts, and warm hospitality"
  },
  {
    icon: <Heart className="w-8 h-8 text-emerald-600" />,
    title: "Warm Hearts",
    description: "Known for the friendliest people in East Africa"
  }
]

// Adventure activities
const adventureActivities = [
  {
    icon: <Tent className="w-6 h-6" />,
    title: "Safari Camping",
    description: "Sleep under the stars in luxury tented camps"
  },
  {
    icon: <Camera className="w-6 h-6" />,
    title: "Photography",
    description: "Capture stunning wildlife and landscapes"
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Hiking",
    description: "Trek through diverse terrains and forests"
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Cultural Tours",
    description: "Meet local communities and learn traditions"
  },
  {
    icon: <Drum className="w-6 h-6" />,
    title: "Music & Dance",
    description: "Experience traditional performances"
  },
  {
    icon: <Palmtree className="w-6 h-6" />,
    title: "Nature Walks",
    description: "Guided tours through natural habitats"
  }
]

// Uganda regions and their highlights
const ugandaRegions = [
  {
    name: "Western Uganda",
    description: "Home to misty mountains, endangered gorillas, and pristine crater lakes",
    highlights: [
      "Rwenzori Mountains - Africa's highest mountain range",
      "Queen Elizabeth National Park - Tree-climbing lions",
      "Bwindi Forest - Mountain gorilla sanctuary",
      "Fort Portal Craters - Scenic crater lakes"
    ],
    image: "/photos/rwenzori-mountain-hero.jpg",
    wildlifeImage: "/tours-attractions/lion.jpg",
    landscapeImage: "/photos/fort-portal-crater-hero.jpg",
    color: "emerald"
  },
  {
    name: "Eastern Uganda",
    description: "Where the mighty Nile begins its journey and adventure awaits",
    highlights: [
      "Source of the Nile - World's longest river origin",
      "Mount Elgon - Ancient volcano with unique flora",
      "Sipi Falls - Majestic triple waterfall",
      "Jinja Adventures - White water rafting capital"
    ],
    image: "/photos/the-source-of-nile-hero.jpg",
    wildlifeImage: "/tours-attractions/elephant 2.jpg",
    landscapeImage: "/photos/river-nile-jinja-hero.jpg",
    color: "blue"
  },
  {
    name: "Northern Uganda",
    description: "Wild savannahs, powerful waterfalls, and incredible wildlife diversity",
    highlights: [
      "Murchison Falls - World's most powerful waterfall",
      "Nile River - Spectacular wildlife viewing",
      "Kidepo Valley - Remote wilderness paradise",
      "Wildlife Safaris - Big five encounters"
    ],
    image: "/photos/african-nile.jpg",
    wildlifeImage: "/tours-attractions/giraffe.jpg",
    landscapeImage: "/photos/Murchison Falls National Park.webp",
    color: "orange"
  },
  {
    name: "Central Uganda",
    description: "The heart of Uganda with vibrant culture and modern city life",
    highlights: [
      "Kampala City - Bustling capital with rich history",
      "Lake Victoria - Africa's largest lake",
      "Cultural Heritage - Traditional kingdoms",
      "Urban Adventures - Markets and nightlife"
    ],
    image: "/photos/kampala-city-ug.jpg",
    wildlifeImage: "/tours-attractions/buffalo.jpg",
    landscapeImage: "/photos/lake-victoria-ug-hero.jpg",
    color: "purple"
  }
]

export const metadata: Metadata = {
  title: "Samba Tours - Uganda Safari & Adventure Tours | Pearl of Africa",
  description: "Expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Discover the Pearl of Africa with Samba Tours - the authentic Uganda safari experience.",
  keywords: "Samba Tours, Uganda safari, gorilla trekking Uganda, wildlife safari Africa, Uganda tours, African adventure travel, Samba Tours Uganda, authentic Uganda safari, local Uganda tour operator",
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
    canonical: '/',
  },
  openGraph: {
    title: "Samba Tours - Uganda Safari & Adventure Tours | Pearl of Africa",
    description: "Expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Discover the Pearl of Africa with Samba Tours - the authentic Uganda safari experience.",
    url: '/',
    siteName: 'Samba Tours',
    images: [
      {
        url: '/photos/uganda-wildlife.jpg',
        width: 1200,
        height: 630,
        alt: 'Samba Tours - Uganda Wildlife Safari',
      },
      {
        url: '/photos/giraffe-uganda-savana-hero.jpg',
        width: 1200,
        height: 630,
        alt: 'Samba Tours - Giraffes in Uganda Savannah',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Samba Tours - Uganda Safari & Adventure Tours | Pearl of Africa",
    description: "Expert-guided gorilla trekking, wildlife safaris, and cultural tours in Uganda. Discover the Pearl of Africa with Samba Tours.",
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
  other: {
    'brand': 'Samba Tours',
    'company': 'Samba Tours Uganda',
    'official-name': 'Samba Tours & Travel',
    'differentiation': 'Authentic Uganda safari operator, not Pamba Tours',
  }
}

// Structured Data for Homepage
const homepageStructuredData = {
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
    "telephone": "+256-XXX-XXX-XXX",
    "contactType": "customer service",
    "email": "info@sambatours.co"
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
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Uganda Safari Tours",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Gorilla Trekking Safari",
          "description": "Expert-guided mountain gorilla trekking in Bwindi Impenetrable National Park"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Wildlife Safari",
          "description": "Comprehensive wildlife safaris in Uganda's national parks"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Cultural Tours",
          "description": "Authentic cultural experiences with local communities"
        }
      }
    ]
  }
}

export default function HomePage() {
  return (
    <ScrollGuard>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(homepageStructuredData),
        }}
      />

      <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50/30 to-white">
        {/* Above the fold content */}
        <header role="banner" className="relative">
          <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-yellow-400 via-emerald-500 to-black" />
          <HeroSection />
        </header>

        {/* Attractions Showcase */}
        <AttractionsShowcase />

        {/* Pearl of Africa Banner */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[url('/photos/savannah-plains-kidepo-uganda-1024x683.webp')] bg-cover bg-center opacity-10" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-100 text-emerald-800 mb-4">Pearl of Africa</Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Pearl of Africa
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Experience the breathtaking diversity of Uganda, from its misty mountain gorilla habitats to the powerful waters of the Nile River. Let us show you why Winston Churchill called Uganda the "Pearl of Africa".
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {pearlHighlights.map((highlight, index) => (
                <div 
                  key={index}
                  className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="bg-emerald-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                    {highlight.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {highlight.title}
                  </h3>
                  <p className="text-gray-600">
                    {highlight.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wildlife Highlights */}
        <section className="py-20 bg-emerald-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-100 text-emerald-800 mb-4">Wildlife Encounters</Badge>
              <h2 className="text-4xl font-bold mb-4">Incredible Wildlife Experiences</h2>
              <p className="text-lg text-emerald-100 max-w-3xl mx-auto">
                Get up close with Uganda's magnificent wildlife in their natural habitats
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {wildlifeHighlights.map((wildlife, index) => (
                <div 
                  key={index} 
                  className="relative group overflow-hidden rounded-xl"
                >
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={wildlife.image}
                      alt={wildlife.title}
                      fill
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                      priority={index === 0} // Only prioritize the first image
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={85}
                      placeholder="blur"
                      blurDataURL={imageOptimization.blurDataURL}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-1">{wildlife.title}</h3>
                    <p className="text-emerald-200">{wildlife.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Adventure Activities */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-orange-100 text-orange-800 mb-4">Adventures</Badge>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Explore Activities</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                From thrilling safaris to cultural immersions, discover the many ways to experience Uganda
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {adventureActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="text-center p-4 rounded-lg hover:bg-emerald-50 transition-colors duration-300"
                >
                  <div className="bg-emerald-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                    {activity.icon}
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">{activity.title}</h3>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action - Explore Tours */}
        <section className="bg-gradient-to-b from-emerald-50/50 to-transparent py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <Badge className="bg-emerald-100 text-emerald-800 mb-4">Discover Tours</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Ready for Your Adventure?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Explore our curated collection of unforgettable safari experiences, from gorilla trekking to wildlife safaris across Uganda's most stunning landscapes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold px-8 py-3"
                  asChild
                >
                  <a href="/tours">
                    Browse All Tours
                  </a>
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 font-semibold px-8 py-3"
                  asChild
                >
                  <a href="/contact">
                    Get in Touch
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* About company preview */}
        <section aria-labelledby="about-preview-heading" className="bg-white">
          <h2 id="about-preview-heading" className="sr-only">About Samba Tours</h2>
          <AboutPreview />
        </section>

        {/* Uganda Regions Section */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-emerald-50/30">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[url('/photos/uganda-map-pattern.svg')] opacity-5" />
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 via-transparent to-green-100/20" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center mb-16">
              <Badge className="bg-emerald-100 text-emerald-800 mb-4">Explore Uganda</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Discover Uganda's Diverse Regions
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Each region of Uganda offers unique experiences, from mountain gorillas in the west to the source of the Nile in the east
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {ugandaRegions.map((region, index) => (
                <div 
                  key={index}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-emerald-100"
                >
                  {/* Main Hero Image */}
                  <div className="relative h-64 md:h-80">
                    <Image
                      src={region.image}
                      alt={region.name}
                      fill
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      quality={imageOptimization.quality}
                      placeholder="blur"
                      blurDataURL={imageOptimization.blurDataURL}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/90 via-emerald-900/50 to-transparent group-hover:via-emerald-900/60 transition-all duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-emerald-200 transition-colors duration-300">{region.name}</h3>
                      <p className="text-emerald-100 text-sm mb-3">{region.description}</p>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`bg-${region.color}-100 text-${region.color}-800`}>
                        {region.highlights.length} Highlights
                      </Badge>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      </div>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {region.highlights.map((highlight, i) => (
                        <li key={i} className="flex items-start gap-3 group-hover:translate-x-1 transition-transform duration-300 ease-in-out">
                          <Compass className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 leading-relaxed">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* Additional Images Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={region.wildlifeImage}
                          alt={`Wildlife in ${region.name}`}
                          fill
                          className="object-cover w-full h-20 group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={imageOptimization.quality}
                          placeholder="blur"
                          blurDataURL={imageOptimization.blurDataURL}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-1 left-1">
                          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Wildlife</span>
                        </div>
                      </div>
                      <div className="relative overflow-hidden rounded-lg">
                        <Image
                          src={region.landscapeImage}
                          alt={`Landscape in ${region.name}`}
                          fill
                          className="object-cover w-full h-20 group-hover:scale-110 transition-transform duration-300"
                          sizes="(max-width: 768px) 50vw, 25vw"
                          quality={imageOptimization.quality}
                          placeholder="blur"
                          blurDataURL={imageOptimization.blurDataURL}
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute bottom-1 left-1">
                          <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Landscape</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Uganda Wildlife Gallery */}
        <section className="py-20 bg-gradient-to-b from-emerald-50/30 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="bg-emerald-100 text-emerald-800 mb-4">Wildlife Gallery</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Uganda's Magnificent Wildlife
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                From majestic elephants to graceful giraffes, discover the incredible diversity of wildlife that calls Uganda home
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/home-hero-photos/elephant.jpg"
                  alt="African elephant in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">African Elephant</h3>
                  <p className="text-sm text-emerald-200">Gentle giants of the savannah</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/home-hero-photos/giraffe.jpg"
                  alt="Giraffe in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Giraffe</h3>
                  <p className="text-sm text-emerald-200">Towering over the acacia trees</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/home-hero-photos/giraffes.jpg"
                  alt="Giraffes in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Giraffe Family</h3>
                  <p className="text-sm text-emerald-200">Social creatures of the plains</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/home-hero-photos/zebras.jpg"
                  alt="Zebras in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Zebras</h3>
                  <p className="text-sm text-emerald-200">Striped beauties of the grasslands</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/home-hero-photos/tourists.jpg"
                  alt="Tourists on safari in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Safari Experience</h3>
                  <p className="text-sm text-emerald-200">Unforgettable wildlife encounters</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/home-hero-photos/woman tourist.jpg"
                  alt="Female tourist in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Adventure Awaits</h3>
                  <p className="text-sm text-emerald-200">Personal safari experiences</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/tours-attractions/lion cubs.jpg"
                  alt="Lion cubs in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Lion Cubs</h3>
                  <p className="text-sm text-emerald-200">Future kings of the jungle</p>
                </div>
              </div>
              
              <div className="relative group overflow-hidden rounded-xl h-48">
                <Image
                  src="/tours-attractions/boat cruise.jpg"
                  alt="Boat cruise in Uganda"
                  fill
                  className="object-cover w-full group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  quality={imageOptimization.quality}
                  placeholder="blur"
                  blurDataURL={imageOptimization.blurDataURL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">Boat Safari</h3>
                  <p className="text-sm text-emerald-200">Water-based wildlife viewing</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </ScrollGuard>
  )
}

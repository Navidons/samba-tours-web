"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Star, Users, ArrowRight, Award, Shield, Heart } from "lucide-react"

const heroContent = [
  {
    id: 1,
    title: "Experience the Magic of Uganda",
    subtitle: "Where Every Journey Becomes a Lifetime Memory",
    description:
      "Discover pristine wilderness, encounter majestic mountain gorillas, and immerse yourself in authentic African culture with Uganda's most trusted safari experts.",
    videoUrl: "/videos/hero-section-vid-0.mp4",
    posterUrl: "",
    badge: "🏆 Award Winning",
    stats: { rating: 4.9, reviews: 2847, bookings: "5K+" },
    cta: "Start Your Adventure",
    secondaryCta: "Watch Our Story",
  },
  {
    id: 2,
    title: "Meet Mountain Gorillas Face to Face",
    subtitle: "The Ultimate Wildlife Encounter Awaits",
    description:
      "Join the exclusive few who have experienced the profound connection with mountain gorillas in their natural habitat. Limited permits available.",
    videoUrl: "/videos/hero-section-vid-1.mp4",
    posterUrl: "",
    badge: "🦍 Exclusive Access",
    stats: { rating: 4.8, reviews: 1892, bookings: "2.8K+" },
    cta: "Book Gorilla Trek",
    secondaryCta: "See Availability",
  },
  {
    id: 3,
    title: "Discover the Source of the Nile",
    subtitle: "Where Adventure Meets History",
    description:
      "Experience the thrill of white water rafting, explore ancient kingdoms, and witness the mighty Nile River as it begins its journey to the Mediterranean.",
    videoUrl: "/videos/river_nile.mp4",
    posterUrl: "",
    badge: "🌊 Adventure Awaits",
    stats: { rating: 4.7, reviews: 2156, bookings: "3.2K+" },
    cta: "Explore Nile Tours",
    secondaryCta: "Watch Adventure",
  },
  {
    id: 4,
    title: "Coastal Wonders of Uganda",
    subtitle: "Where Land Meets Water",
    description:
      "From pristine beaches to vibrant coastal communities, discover the hidden gems where Uganda's diverse landscapes meet the water's edge.",
    videoUrl: "/videos/on-the-coast.mp4",
    posterUrl: "",
    badge: "🏖️ Coastal Paradise",
    stats: { rating: 4.6, reviews: 1432, bookings: "1.8K+" },
    cta: "Discover Coast",
    secondaryCta: "See More",
  },
  {
    id: 5,
    title: "Wildlife Safari Spectacular",
    subtitle: "Nature's Greatest Show",
    description:
      "Witness the incredible diversity of African wildlife in their natural habitat, from the Big Five to rare bird species in Uganda's pristine national parks.",
    videoUrl: "/videos/hero-section-vid-2.mp4",
    posterUrl: "",
    badge: "🦁 Wildlife Wonder",
    stats: { rating: 4.9, reviews: 3241, bookings: "4.1K+" },
    cta: "Book Safari",
    secondaryCta: "Watch Wildlife",
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVideoLoaded, setIsVideoLoaded] = useState(false)
  const [showVideo, setShowVideo] = useState(true) // Auto-show videos by default
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroContent.length)
        setIsTransitioning(false)
      }, 500) // 500ms fade transition
    }, 15000) // Increased from 8 seconds to 15 seconds
    return () => clearInterval(interval)
  }, [])

  const current = heroContent[currentSlide]

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Video/Image Background */}
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video
            key={current.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setShowVideo(false)}
            poster={current.posterUrl}
          >
            <source src={current.videoUrl} type="video/mp4" />
            {/* Fallback to image if video fails */}
            <Image
              src={current.posterUrl || "/placeholder.svg"}
              alt={current.title}
              fill
              priority
              className="object-cover"
            />
          </video>
        ) : (
          <Image
            key={current.posterUrl}
            src={current.posterUrl || "/placeholder.svg"}
            alt={current.title}
            fill
            priority
            className={`object-cover transition-opacity duration-500 ${
              isTransitioning ? 'opacity-0' : 'opacity-100'
            }`}
          />
        )}

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="max-w-5xl mx-auto">
          {/* Premium Badge */}
          <div className="mb-6 flex justify-center">
            <Badge className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white px-6 py-2 text-sm font-bold border-0 shadow-lg animate-pulse">
              <Award className="w-4 h-4 mr-2" />
              {current.badge}
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight text-shadow-lg">
            <span className="block font-playfair bg-gradient-to-r from-white via-emerald-100 to-green-200 bg-clip-text text-transparent">
              {current.title}
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl text-emerald-200 font-light mb-8 tracking-wide text-shadow">
            {current.subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {current.description}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 mb-10">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-semibold text-md">{current.stats.rating}</span>
              <span className="text-gray-300 text-sm">({current.stats.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-md">{current.stats.bookings}</span>
              <span className="text-gray-300 text-sm">happy travelers</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold">100%</span>
              <span className="text-gray-300 text-sm">satisfaction</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white px-8 py-6 text-lg font-bold shadow-lg transform hover:scale-105 transition-transform duration-300 border-0 rounded-full w-full sm:w-auto"
              asChild
            >
              <Link href="/tours">
                <Heart className="mr-2 w-5 h-5" />
                {current.cta}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-6 text-lg font-bold backdrop-blur-sm bg-white/10 transition-all duration-300 rounded-full w-full sm:w-auto"
              onClick={() => setShowVideo(!showVideo)}
            >
              <Play className="mr-2 w-5 h-5" />
              {showVideo ? "Pause Video" : "Play Video"}
            </Button>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3">
            {heroContent.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true)
                  setTimeout(() => {
                    setCurrentSlide(index)
                    setIsTransitioning(false)
                  }, 500)
                }}
                className={`transition-all duration-500 rounded-full ${
                  index === currentSlide
                    ? "bg-gradient-to-r from-green-400 to-emerald-400 w-8 h-2"
                    : "bg-white/30 hover:bg-white/50 w-2 h-2"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white animate-bounce hidden md:block">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white rounded-full" />
        </div>
      </div>
    </section>
  )
}

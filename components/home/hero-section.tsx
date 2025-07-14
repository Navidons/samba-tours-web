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
    title: "Majestic Elephants of Uganda",
    subtitle: "Witness Giants in Their Natural Habitat",
    description:
      "Experience the awe of seeing Uganda's elephants roam freely across lush savannahs and forests. Join us for unforgettable safari moments with these gentle giants.",
    posterUrl: "/home-hero-photos/elephant.jpg",
    badge: "🐘 Elephant Encounters",
    stats: { rating: 4.9, reviews: 2847, bookings: "5K+" },
    cta: "See Elephants",
    secondaryCta: "Learn More",
  },
  {
    id: 2,
    title: "Graceful Giraffes on the Plains",
    subtitle: "Spot Africa's Tallest Wonders",
    description:
      "Marvel at the elegance of giraffes as they stride across Uganda's open plains. Perfect for wildlife photography and family adventures.",
    posterUrl: "/home-hero-photos/giraffes.jpg",
    badge: "🦒 Giraffe Safaris",
    stats: { rating: 4.8, reviews: 1892, bookings: "2.8K+" },
    cta: "Giraffe Tours",
    secondaryCta: "See More",
  },
  {
    id: 3,
    title: "Wildlife Encounters: Zebras & More",
    subtitle: "Striking Stripes in Scenic Landscapes",
    description:
      "Get up close with herds of zebras and other iconic wildlife. Uganda's national parks offer a vibrant tapestry of animal life.",
    posterUrl: "/home-hero-photos/zebras.jpg",
    badge: "🦓 Zebra Adventures",
    stats: { rating: 4.7, reviews: 2156, bookings: "3.2K+" },
    cta: "Zebra Safaris",
    secondaryCta: "Explore Now",
  },
  {
    id: 4,
    title: "Safari with Giraffes & Friends",
    subtitle: "Discover Uganda's Diverse Wildlife",
    description:
      "Join a classic safari and witness giraffes, antelopes, and more in their natural environment. Perfect for explorers and nature lovers.",
    posterUrl: "/home-hero-photos/giraffe.jpg",
    badge: "🌿 Classic Safari",
    stats: { rating: 4.6, reviews: 1432, bookings: "1.8K+" },
    cta: "Book Safari",
    secondaryCta: "See Wildlife",
  },
  {
    id: 5,
    title: "Adventures with Fellow Travelers",
    subtitle: "Create Memories with New Friends",
    description:
      "Travel with like-minded adventurers and experience the best of Uganda together. Group tours, cultural exchanges, and unforgettable moments await.",
    posterUrl: "/home-hero-photos/tourists.jpg",
    badge: "👫 Group Adventures",
    stats: { rating: 4.9, reviews: 3241, bookings: "4.1K+" },
    cta: "Join a Group Tour",
    secondaryCta: "Meet Travelers",
  },
  {
    id: 6,
    title: "Women Exploring Uganda",
    subtitle: "Empowering Journeys for Every Explorer",
    description:
      "Celebrate the spirit of adventure with women-led tours and safe, inspiring travel experiences across Uganda's breathtaking landscapes.",
    posterUrl: "/home-hero-photos/woman tourist.jpg",
    badge: "🌸 Women in Travel",
    stats: { rating: 4.8, reviews: 1780, bookings: "2.2K+" },
    cta: "Women’s Tours",
    secondaryCta: "Learn More",
  },
  {
    id: 7,
    title: "Animal Kingdom Awaits",
    subtitle: "Discover Uganda’s Rich Biodiversity",
    description:
      "From lions to rare birds, Uganda is a haven for animal lovers. Explore the wild and capture the beauty of Africa’s animal kingdom.",
    posterUrl: "/home-hero-photos/animals.jpg",
    badge: "🦁 Wildlife Wonders",
    stats: { rating: 4.9, reviews: 2999, bookings: "3.9K+" },
    cta: "See All Wildlife",
    secondaryCta: "Start Exploring",
  },
]

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % heroContent.length)
        setIsTransitioning(false)
      }, 500)
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  const current = heroContent[currentSlide]

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Image Background */}
      <div className="absolute inset-0 z-0">
        <Image
          key={current.posterUrl}
          src={current.posterUrl}
          alt={current.title}
          fill
          priority
          className={`object-cover transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
        />
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
          <h1 className="text-5xl md:text-7xl font-bold mb-4 leading-tight">
            <span className="block font-playfair text-white">
              {current.title}
            </span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-2xl md:text-3xl text-emerald-200 font-light mb-8 tracking-wide">
            {current.subtitle}
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            {current.description}
          </p>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 mb-10">
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
              <Star className="w-5 h-5 text-yellow-400 fill-current" />
              <span className="font-semibold text-md">{current.stats.rating}</span>
              <span className="text-gray-300 text-sm">({current.stats.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <span className="font-semibold text-md">{current.stats.bookings}</span>
              <span className="text-gray-300 text-sm">happy travelers</span>
            </div>
            <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2">
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

"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Camera, Heart, Eye, ArrowRight } from "lucide-react"

const attractions = [
  {
    id: 1,
    title: "Majestic Lions",
    location: "Queen Elizabeth National Park",
    description: "Witness the iconic tree-climbing lions and other big cats in their natural habitat",
    image: "/tours-attractions/lion.jpg",
    category: "Wildlife",
    rating: 4.9,
    views: 2847
  },
  {
    id: 2,
    title: "Gentle Giants - Elephants",
    location: "Murchison Falls National Park",
    description: "Experience close encounters with Uganda's largest land mammals in their natural environment",
    image: "/tours-attractions/elephant 2.jpg",
    category: "Wildlife",
    rating: 4.8,
    views: 2156
  },
  {
    id: 3,
    title: "Graceful Giraffes",
    location: "Kidepo Valley National Park",
    description: "Marvel at the elegance of giraffes as they roam the vast savannah plains",
    image: "/tours-attractions/giraffe.jpg",
    category: "Wildlife",
    rating: 4.7,
    views: 1892
  },
  {
    id: 4,
    title: "Mighty Buffalo",
    location: "Queen Elizabeth National Park",
    description: "Observe the powerful African buffalo in their natural habitat",
    image: "/tours-attractions/buffalo.jpg",
    category: "Wildlife",
    rating: 4.6,
    views: 1432
  },
  {
    id: 5,
    title: "Nile Boat Cruise",
    location: "Murchison Falls National Park",
    description: "Cruise along the mighty Nile River and witness spectacular wildlife along the banks",
    image: "/tours-attractions/boat cruise.jpg",
    category: "Adventure",
    rating: 4.8,
    views: 3241
  },
  {
    id: 6,
    title: "Lion Cubs",
    location: "Queen Elizabeth National Park",
    description: "Adorable lion cubs playing and learning in the African wilderness",
    image: "/tours-attractions/lion cubs.jpg",
    category: "Wildlife",
    rating: 4.9,
    views: 2999
  },
  {
    id: 7,
    title: "Kangaroo Encounters",
    location: "Uganda Wildlife Education Centre",
    description: "Unique opportunity to see kangaroos and other exotic animals in Uganda",
    image: "/tours-attractions/kangaroo.jpg",
    category: "Wildlife",
    rating: 4.5,
    views: 1780
  },
  {
    id: 8,
    title: "Tourist Adventures",
    location: "Various National Parks",
    description: "Join fellow travelers on exciting safari adventures across Uganda",
    image: "/tours-attractions/tourists.jpg",
    category: "Adventure",
    rating: 4.8,
    views: 2156
  },
  {
    id: 9,
    title: "Women Explorers",
    location: "Uganda's Wilderness",
    description: "Empowering women-led tours and safe travel experiences",
    image: "/tours-attractions/woman tourist.jpg",
    category: "Adventure",
    rating: 4.7,
    views: 1892
  },
]

// Blur data URL for better loading experience
const blurDataURL = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=='

const categories = ["All", "Wildlife", "Adventure"]

export default function AttractionsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [likedAttractions, setLikedAttractions] = useState<Set<number>>(new Set())

  const toggleLike = (id: number) => {
    setLikedAttractions(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const filteredAttractions = selectedCategory === "All" 
    ? attractions 
    : attractions.filter(attraction => attraction.category === selectedCategory)

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white mb-4">
            <Camera className="w-4 h-4 mr-2" />
            Featured Attractions
          </Badge>
          
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-gray-900 mb-6">
            Discover Uganda's
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
              Natural Wonders
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            From majestic lions to graceful giraffes, explore the incredible wildlife and adventures that await you in Uganda.
          </p>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Attractions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredAttractions.map((attraction, index) => (
            <Card
              key={attraction.id}
              className="group overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-white rounded-2xl"
            >
              {/* Image Container */}
              <div className="relative overflow-hidden">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={attraction.image}
                    alt={attraction.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    priority={index < 2} // Only prioritize first 2 images
                    quality={75} // Reduced quality for faster loading
                    placeholder="blur"
                    blurDataURL={blurDataURL}
                    loading={index < 2 ? "eager" : "lazy"}
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* Category Badge */}
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                  {attraction.category}
                </Badge>

                {/* Like Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-4 right-4 h-8 w-8 p-0 bg-white/90 hover:bg-white border-emerald-200"
                  onClick={() => toggleLike(attraction.id)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      likedAttractions.has(attraction.id) 
                        ? "fill-red-500 text-red-500" 
                        : "text-emerald-600"
                    }`}
                  />
                </Button>
              </div>

              {/* Content */}
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                  {attraction.title}
                </h3>
                
                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1 text-emerald-500" />
                  {attraction.location}
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">
                  {attraction.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span>{attraction.rating}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{attraction.views.toLocaleString()}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Button
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                  asChild
                >
                  <a href="/tours">
                    Explore Tours
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 

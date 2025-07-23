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
  {
    id: 10,
    title: "Wildlife Diversity",
    location: "Uganda's National Parks",
    description: "Discover the incredible variety of animals that call Uganda home",
    image: "/tours-attractions/animals.jpg",
    category: "Wildlife",
    rating: 4.9,
    views: 3567
  }
]

export default function AttractionsShowcase() {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [likedAttractions, setLikedAttractions] = useState<Set<number>>(new Set())

  const categories = ["All", "Wildlife", "Adventure"]
  
  const filteredAttractions = selectedCategory === "All" 
    ? attractions 
    : attractions.filter(attraction => attraction.category === selectedCategory)

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

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="container-max px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-6 py-2 text-sm font-bold mb-6 border border-green-200">
            🦁 Uganda's Wildlife Wonders
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-playfair font-bold text-gray-900 mb-6 leading-tight">
            Discover
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600">
              Amazing Attractions
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
          {filteredAttractions.map((attraction) => (
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

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 text-lg font-bold border-0 rounded-full"
            asChild
          >
            <a href="/tours">
              View All Tours & Attractions
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
} 

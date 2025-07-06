"use client"

import { Input } from "@/components/ui/input"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Calendar, MapPin, Star, Search, Share2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface WishlistItem {
  id: string
  title: string
  image: string
  price: number
  duration: string
  location: string
  rating: number
  reviewCount: number
  category: string
  slug: string
}

const initialWishlistItems = [
  {
    id: "1",
    title: "Gorilla Trekking Adventure",
    image: "/placeholder.svg?height=300&width=400",
    price: 1200,
    duration: "3 days",
    location: "Bwindi Forest",
    rating: 4.9,
    reviewCount: 127,
    category: "Wildlife",
    slug: "gorilla-trekking-adventure",
  },
  {
    id: "2",
    title: "Queen Elizabeth Wildlife Safari",
    image: "/placeholder.svg?height=300&width=400",
    price: 950,
    duration: "5 days",
    location: "Queen Elizabeth NP",
    rating: 4.8,
    reviewCount: 89,
    category: "Safari",
    slug: "queen-elizabeth-wildlife-tour",
  },
  {
    id: "3",
    title: "Cultural Heritage Experience",
    image: "/placeholder.svg?height=300&width=400",
    price: 600,
    duration: "2 days",
    location: "Kampala & Entebbe",
    rating: 4.7,
    reviewCount: 56,
    category: "Cultural",
    slug: "cultural-heritage-experience",
  },
]

export default function WishlistContent() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(initialWishlistItems)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredItems = wishlistItems.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const removeFromWishlist = (id: string) => {
    setWishlistItems((items) => items.filter((item) => item.id !== id))
  }

  const addToCart = (item: WishlistItem) => {
    // Add to cart logic here
    console.log("Added to cart:", item.title)
  }

  const shareWishlist = () => {
    // Implement share functionality
    console.log("Sharing wishlist...")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-earth-900">My Wishlist</h1>
          <p className="text-earth-600">{wishlistItems.length} saved tours</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={shareWishlist}>
            <Share2 className="h-4 w-4 mr-2" />
            Share Wishlist
          </Button>
          <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500">
            <Link href="/tours">Browse Tours</Link>
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Button
              variant="outline"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-red-500 hover:text-red-700"
              onClick={() => setSearchQuery("")}
            >
              <Heart className="h-4 w-4 fill-current" />
            </Button>
            <Input
              placeholder="Search your wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Items */}
      {filteredItems.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-600 mb-6">Save tours you're interested in to easily find them later!</p>
            <Button asChild className="bg-gradient-to-r from-orange-500 to-red-500">
              <Link href="/tours">Explore Tours</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-3 left-3 bg-orange-500">{item.category}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 bg-white/90 hover:bg-white text-red-500 hover:text-red-700"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">{item.title}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                      <span className="text-sm text-gray-500">({item.reviewCount} reviews)</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {item.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {item.duration}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${item.price}</span>
                      <span className="text-sm text-gray-600"> per person</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => addToCart(item)} className="flex-1">
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-orange-500 to-red-500" asChild>
                      <Link href={`/tours/${item.slug}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

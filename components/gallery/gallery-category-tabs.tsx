"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Camera, MapPin, Users, Crown, TreePine, Waves, Mountain, Star } from "lucide-react"

// Define gallery categories
const categories = [
  { id: "all", name: "All Photos", icon: Camera, color: "bg-gray-100 text-gray-800" },
  { id: "wildlife", name: "Wildlife", icon: TreePine, color: "bg-green-100 text-green-800" },
  { id: "landscapes", name: "Landscapes", icon: Mountain, color: "bg-blue-100 text-blue-800" },
  { id: "cultural", name: "Cultural", icon: Users, color: "bg-purple-100 text-purple-800" },
  { id: "adventure", name: "Adventure", icon: Star, color: "bg-yellow-100 text-yellow-800" },
  { id: "destinations", name: "Destinations", icon: MapPin, color: "bg-red-100 text-red-800" },
  { id: "featured", name: "Featured", icon: Crown, color: "bg-emerald-100 text-emerald-800" },
]

interface GalleryCategoryTabsProps {
  selectedCategory?: string
  onCategoryChange?: (category: string) => void
}

export default function GalleryCategoryTabs({
  selectedCategory = "all",
  onCategoryChange
}: GalleryCategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(selectedCategory)

  useEffect(() => {
    setActiveCategory(selectedCategory)
  }, [selectedCategory])

  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)
    
    // Update URL parameters
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    if (categoryId === "all") {
      current.delete('category')
      current.delete('featured') // Remove featured filter when selecting "all"
    } else if (categoryId === "featured") {
      current.delete('category')
      current.set('featured', 'true')
    } else {
      current.set('category', categoryId)
      current.delete('featured') // Remove featured filter when selecting specific category
    }
    
    // Reset to page 1 when category changes
    current.delete('page')
    
    const search = current.toString()
    const query = search ? `?${search}` : ""
    
    // Preserve current scroll position
    const currentScrollY = window.scrollY
    router.replace(`/gallery${query}`, { scroll: false })
    
    // Ensure scroll position is maintained
    requestAnimationFrame(() => {
      if (window.scrollY !== currentScrollY) {
        window.scrollTo(0, currentScrollY)
      }
    })
    onCategoryChange?.(categoryId)
  }

  return (
    <div className="mb-6">
      {/* Mobile: Horizontal scrollable tabs */}
      <div className="block sm:hidden">
        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className={`flex-shrink-0 ${
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-500" 
                    : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4 mr-1.5" />
                {category.name}
              </Button>
            )
          })}
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {categories.map((category) => {
            const Icon = category.icon
            const isActive = activeCategory === category.id
            
            return (
              <Button
                key={category.id}
                variant={isActive ? "default" : "outline"}
                onClick={() => handleCategoryChange(category.id)}
                className={`flex flex-col items-center justify-center h-20 ${
                  isActive 
                    ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white border-emerald-500" 
                    : "border-emerald-200 hover:bg-emerald-50 text-gray-700"
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-sm font-medium">{category.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
      
      {/* Category description */}
      {activeCategory !== "all" && (
        <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <Badge className={categories.find(c => c.id === activeCategory)?.color || "bg-gray-100 text-gray-800"}>
            {categories.find(c => c.id === activeCategory)?.name}
          </Badge>
          <p className="text-sm text-emerald-700 mt-1">
            {activeCategory === "wildlife" && "Discover Uganda's incredible wildlife - from mountain gorillas to savanna elephants."}
            {activeCategory === "landscapes" && "Breathtaking landscapes from Uganda's diverse natural environments."}
            {activeCategory === "cultural" && "Experience local culture, traditions, and community life in Uganda."}
            {activeCategory === "adventure" && "Exciting adventure activities and thrilling moments from our tours."}
            {activeCategory === "destinations" && "Explore Uganda's most beautiful and iconic destinations."}
            {activeCategory === "featured" && "Our most outstanding and professionally curated photographs."}
          </p>
        </div>
      )}
    </div>
  )
}

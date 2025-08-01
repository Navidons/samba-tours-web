"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Grid, List, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface GalleryFiltersProps {
  selectedFeatured?: string
  searchQuery?: string
  viewMode?: "grid" | "masonry"
  onViewModeChange?: (mode: "grid" | "masonry") => void
}

export default function GalleryFilters({
  selectedFeatured,
  searchQuery,
  viewMode = "masonry",
  onViewModeChange
}: GalleryFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [localSearchTerm, setLocalSearchTerm] = useState(searchQuery || "")
  const [showFilters, setShowFilters] = useState(false)

  // Update local search when prop changes
  useEffect(() => {
    setLocalSearchTerm(searchQuery || "")
  }, [searchQuery])

  const updateFilters = (newParams: Record<string, string | undefined>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()))
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === undefined || value === "" || value === "all") {
        current.delete(key)
      } else {
        current.set(key, value)
      }
    })
    
    // Reset to page 1 when filters change
    current.delete('page')
    
    const search = current.toString()
    const query = search ? `?${search}` : ""
    
    // Use replace instead of push to avoid scroll to top
    router.replace(`/gallery${query}`, { scroll: false })
  }

  const handleFeaturedChange = (featured: boolean) => {
    updateFilters({ featured: featured ? "true" : undefined })
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters({ search: localSearchTerm || undefined })
  }

  const clearAllFilters = () => {
    setLocalSearchTerm("")
    router.replace("/gallery", { scroll: false })
  }

  const hasActiveFilters = selectedFeatured || searchQuery

  return (
    <div className="mb-8">
      {/* Search and View Toggle */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-emerald-400" />
          <Input
            placeholder="Search photos by title, description, or content..."
            value={localSearchTerm}
            onChange={(e) => setLocalSearchTerm(e.target.value)}
            className="pl-10 h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400"
          />
          {localSearchTerm && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLocalSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-emerald-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </form>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden border-emerald-200 hover:bg-emerald-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge className="ml-2 h-5 w-5 rounded-full bg-emerald-500 text-white text-xs p-0 flex items-center justify-center">
                !
              </Badge>
            )}
          </Button>

          <div className="flex items-center bg-white rounded-lg border border-emerald-200 p-1">
            <Button
              variant={viewMode === "masonry" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("masonry")}
              className={`h-8 ${viewMode === "masonry" ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : "hover:bg-emerald-50"}`}
              title="Masonry View"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange?.("grid")}
              className={`h-8 ${viewMode === "grid" ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white" : "hover:bg-emerald-50"}`}
              title="Grid View"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-emerald-900">Active filters:</span>
            
            {selectedFeatured === "true" && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                Featured only
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFeaturedChange(false)}
                  className="ml-1 h-4 w-4 p-0 hover:bg-emerald-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {searchQuery && (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                &quot;{searchQuery}&quot;
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => updateFilters({ search: undefined })}
                  className="ml-1 h-4 w-4 p-0 hover:bg-emerald-200"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100"
            >
              Clear all
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
        {/* Featured Toggle */}
        <div>
          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={selectedFeatured === "true"}
              onCheckedChange={handleFeaturedChange}
            />
            <Label htmlFor="featured" className="font-semibold text-gray-900">
              Featured images only
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}

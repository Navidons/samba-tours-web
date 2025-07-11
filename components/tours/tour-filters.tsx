"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, MapPin, Clock, Star, DollarSign } from "lucide-react"

interface TourFiltersProps {
  onFiltersChange: (filters: any) => void
}

export default function TourFilters({ onFiltersChange }: TourFiltersProps) {
  const [filters, setFilters] = useState({
    search: "",
    categories: [] as string[],
    durations: [] as string[],
    difficulties: [] as string[],
    destinations: [] as string[],
    minPrice: 100,
    maxPrice: 2000,
  })

  const categories = [
    { id: "gorilla-trekking", name: "Gorilla Trekking", count: 3 },
    { id: "wildlife-safari", name: "Wildlife Safari", count: 5 },
    { id: "cultural", name: "Cultural Tours", count: 2 },
    { id: "adventure", name: "Adventure Tours", count: 4 },
    { id: "birding", name: "Bird Watching", count: 2 },
  ]

  const durations = [
    { id: "1-3", name: "1-3 Days", count: 4 },
    { id: "4-7", name: "4-7 Days", count: 6 },
    { id: "8-14", name: "8-14 Days", count: 3 },
    { id: "15+", name: "15+ Days", count: 1 },
  ]

  const difficulties = [
    { id: "easy", name: "Easy", count: 5 },
    { id: "moderate", name: "Moderate", count: 7 },
    { id: "challenging", name: "Challenging", count: 2 },
  ]

  const destinations = [
    { id: "bwindi-forest", name: "Bwindi Forest", count: 3 },
    { id: "murchison-falls-np", name: "Murchison Falls NP", count: 2 },
    { id: "queen-elizabeth-np", name: "Queen Elizabeth NP", count: 3 },
    { id: "kibale-forest", name: "Kibale Forest", count: 2 },
    { id: "lake-mburo", name: "Lake Mburo", count: 1 },
  ]

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }))
  }

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      categories: checked ? [...prev.categories, categoryId] : prev.categories.filter((id) => id !== categoryId),
    }))
  }

  const handleDurationChange = (durationId: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      durations: checked ? [...prev.durations, durationId] : prev.durations.filter((id) => id !== durationId),
    }))
  }

  const handleDifficultyChange = (difficultyId: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      difficulties: checked
        ? [...prev.difficulties, difficultyId]
        : prev.difficulties.filter((id) => id !== difficultyId),
    }))
  }

  const handleDestinationChange = (destinationId: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      destinations: checked
        ? [...prev.destinations, destinationId]
        : prev.destinations.filter((id) => id !== destinationId),
    }))
  }

  const handlePriceChange = (values: number[]) => {
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      search: "",
      categories: [],
      durations: [],
      difficulties: [],
      destinations: [],
      minPrice: 100,
      maxPrice: 2000,
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    count += filters.categories.length
    count += filters.durations.length
    count += filters.difficulties.length
    count += filters.destinations.length
    if (filters.minPrice !== 100 || filters.maxPrice !== 2000) count++
    return count
  }

  const activeFilterCount = getActiveFilterCount()

  return (
    <div className="space-y-6">
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && <Badge className="bg-emerald-600 text-white">{activeFilterCount}</Badge>}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Search className="h-4 w-4 text-emerald-600" />
            <span>Search Tours</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tours, destinations, activities..."
              value={filters.search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10 border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={filters.categories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                  className="border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor={category.id} className="text-sm font-medium cursor-pointer text-gray-700">
                  {category.name}
                </Label>
              </div>
              <span className="text-xs text-gray-500">({category.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Duration */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Duration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {durations.map((duration) => (
            <div key={duration.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={duration.id}
                  checked={filters.durations.includes(duration.id)}
                  onCheckedChange={(checked) => handleDurationChange(duration.id, checked as boolean)}
                  className="border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor={duration.id} className="text-sm font-medium cursor-pointer text-gray-700">
                  {duration.name}
                </Label>
              </div>
              <span className="text-xs text-gray-500">({duration.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Difficulty */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <Star className="h-4 w-4 text-emerald-600" />
            <span>Difficulty</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {difficulties.map((difficulty) => (
            <div key={difficulty.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={difficulty.id}
                  checked={filters.difficulties.includes(difficulty.id)}
                  onCheckedChange={(checked) => handleDifficultyChange(difficulty.id, checked as boolean)}
                  className="border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor={difficulty.id} className="text-sm font-medium cursor-pointer text-gray-700">
                  {difficulty.name}
                </Label>
              </div>
              <span className="text-xs text-gray-500">({difficulty.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Destinations */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <MapPin className="h-4 w-4 text-emerald-600" />
            <span>Destinations</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {destinations.map((destination) => (
            <div key={destination.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={destination.id}
                  checked={filters.destinations.includes(destination.id)}
                  onCheckedChange={(checked) => handleDestinationChange(destination.id, checked as boolean)}
                  className="border-emerald-200 text-emerald-600 focus:ring-emerald-500"
                />
                <Label htmlFor={destination.id} className="text-sm font-medium cursor-pointer text-gray-700">
                  {destination.name}
                </Label>
              </div>
              <span className="text-xs text-gray-500">({destination.count})</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Price Range */}
      <Card className="border-emerald-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-base">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            <span>Price Range</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider
              value={[filters.minPrice, filters.maxPrice]}
              min={100}
              max={2000}
              step={100}
              onValueChange={handlePriceChange}
              className="[&>.slider-thumb]:border-emerald-600 [&>.slider-thumb]:bg-emerald-600 [&>.slider-track]:bg-emerald-200"
            />
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>${filters.minPrice}</span>
              <span>${filters.maxPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

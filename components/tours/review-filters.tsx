"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter } from "lucide-react"

interface ReviewFiltersProps {
  sortBy: "newest" | "oldest" | "highest" | "lowest" | "helpful"
  setSortBy: (sort: "newest" | "oldest" | "highest" | "lowest" | "helpful") => void
  filterBy: "all" | "5" | "4" | "3" | "2" | "1"
  setFilterBy: (filter: "all" | "5" | "4" | "3" | "2" | "1") => void
  reviewCount: number
}

export function ReviewFilters({ sortBy, setSortBy, filterBy, setFilterBy, reviewCount }: ReviewFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-emerald-600" />
        <span className="text-gray-700 font-medium">
          Showing {reviewCount} review{reviewCount !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {/* Filter by Rating */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Filter by:</span>
          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-32 border-emerald-200 focus:ring-emerald-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort by */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 whitespace-nowrap">Sort by:</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32 border-emerald-200 focus:ring-emerald-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
              <SelectItem value="helpful">Most helpful</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

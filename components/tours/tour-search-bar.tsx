"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

interface TourSearchBarProps {
  initialQuery?: string
  onSearch?: (query: string) => void
}

export default function TourSearchBar({ initialQuery = "", onSearch }: TourSearchBarProps) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearch) {
      onSearch(query)
    } else {
      const params = new URLSearchParams()
      if (query.trim()) {
        params.set("search", query.trim())
      }
      router.push(`/tours?${params.toString()}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search tours, destinations, activities..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border-emerald-200 focus:border-emerald-500 focus:ring-emerald-500"
        />
      </div>
      <Button
        type="submit"
        className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 px-6"
      >
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>
    </form>
  )
}

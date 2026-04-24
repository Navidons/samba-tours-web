"use client"

import { useState, useEffect } from "react"
import type { Tour } from "@/lib/data"

const MAX_COMPARISON_TOURS = 3

export function useTourComparison() {
  const [comparisonTours, setComparisonTours] = useState<Tour[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("tour-comparison")
    if (saved) {
      try {
        const tours = JSON.parse(saved)
        setComparisonTours(tours)
      } catch (error) {
        console.error("Error loading comparison tours:", error)
      }
    }
  }, [])

  // Save to localStorage whenever comparison tours change
  useEffect(() => {
    localStorage.setItem("tour-comparison", JSON.stringify(comparisonTours))
  }, [comparisonTours])

  const addToComparison = (tour: Tour) => {
    setComparisonTours((prev) => {
      // Check if tour is already in comparison
      if (prev.some((t) => t.id === tour.id)) {
        return prev
      }

      // If at max capacity, remove the first tour and add the new one
      if (prev.length >= MAX_COMPARISON_TOURS) {
        return [...prev.slice(1), tour]
      }

      return [...prev, tour]
    })
  }

  const removeFromComparison = (tourId: string) => {
    setComparisonTours((prev) => prev.filter((tour) => tour.id !== tourId))
  }

  const clearComparison = () => {
    setComparisonTours([])
  }

  const isInComparison = (tourId: string) => {
    return comparisonTours.some((tour) => tour.id === tourId)
  }

  const canAddMore = comparisonTours.length < MAX_COMPARISON_TOURS

  return {
    comparisonTours,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore,
    maxTours: MAX_COMPARISON_TOURS,
  }
}

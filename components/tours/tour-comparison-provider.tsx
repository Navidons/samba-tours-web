"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useTourComparison } from "@/hooks/use-tour-comparison"
import type { Tour } from "@/lib/data"

interface TourComparisonContextType {
  comparisonTours: Tour[]
  addToComparison: (tour: Tour) => void
  removeFromComparison: (tourId: string) => void
  clearComparison: () => void
  isInComparison: (tourId: string) => boolean
  canAddMore: boolean
  maxTours: number
}

const TourComparisonContext = createContext<TourComparisonContextType | undefined>(undefined)

export function TourComparisonProvider({ children }: { children: ReactNode }) {
  const comparisonData = useTourComparison()

  return <TourComparisonContext.Provider value={comparisonData}>{children}</TourComparisonContext.Provider>
}

export function useTourComparisonContext() {
  const context = useContext(TourComparisonContext)
  if (context === undefined) {
    throw new Error("useTourComparisonContext must be used within a TourComparisonProvider")
  }
  return context
}

import type { Tour } from "./data"
import { getAllTours, getTourBySlug, getToursByCategory } from "./data"

export type { Tour }

// Get all tours with optional filtering
export async function getToursData(params?: {
  category?: string
  difficulty?: string
  priceRange?: string
  search?: string
}): Promise<Tour[]> {
  let tours = getAllTours()

  if (params?.category) {
    tours = getToursByCategory(params.category)
  }

  if (params?.difficulty) {
    tours = tours.filter((tour) => tour.difficulty.toLowerCase() === params.difficulty?.toLowerCase())
  }

  if (params?.search) {
    const searchTerm = params.search.toLowerCase()
    tours = tours.filter(
      (tour) =>
        tour.title.toLowerCase().includes(searchTerm) ||
        tour.description.toLowerCase().includes(searchTerm) ||
        tour.location.region.toLowerCase().includes(searchTerm),
    )
  }

  if (params?.priceRange) {
    const [min, max] = params.priceRange.split("-").map(Number)
    tours = tours.filter((tour) => tour.price >= min && tour.price <= max)
  }

  return tours
}

// Get single tour by slug
export async function getTourData(slug: string): Promise<Tour | null> {
  const tour = getTourBySlug(slug)
  return tour || null
}

// Get featured tours
export async function getFeaturedToursData(): Promise<Tour[]> {
  return getAllTours().filter((tour) => tour.featured)
}

// Get related tours (same category, excluding current tour)
export async function getRelatedTours(currentTourId: string, category: string): Promise<Tour[]> {
  return getAllTours()
    .filter((tour) => tour.id !== currentTourId && tour.category === category)
    .slice(0, 3)
}

import { type NextRequest, NextResponse } from "next/server"
import { getAllTours } from "@/lib/data"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || ""
    const category = searchParams.get("category")
    const difficulty = searchParams.get("difficulty")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const duration = searchParams.get("duration")
    const destination = searchParams.get("destination")

    let tours = getAllTours()

    // Apply search filter
    if (query) {
      const searchTerm = query.toLowerCase()
      tours = tours.filter(
        (tour) =>
          tour.title.toLowerCase().includes(searchTerm) ||
          tour.description.toLowerCase().includes(searchTerm) ||
          tour.shortDescription.toLowerCase().includes(searchTerm) ||
          tour.location.region.toLowerCase().includes(searchTerm) ||
          tour.location.country.toLowerCase().includes(searchTerm) ||
          tour.category.toLowerCase().includes(searchTerm) ||
          tour.highlights.some((highlight) => highlight.toLowerCase().includes(searchTerm)) ||
          tour.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      )
    }

    // Apply category filter
    if (category) {
      tours = tours.filter((tour) => tour.category.toLowerCase().replace(/\s+/g, "-") === category.toLowerCase())
    }

    // Apply difficulty filter
    if (difficulty) {
      tours = tours.filter((tour) => tour.difficulty.toLowerCase() === difficulty.toLowerCase())
    }

    // Apply price range filter
    if (minPrice) {
      tours = tours.filter((tour) => tour.price >= Number.parseInt(minPrice))
    }
    if (maxPrice) {
      tours = tours.filter((tour) => tour.price <= Number.parseInt(maxPrice))
    }

    // Apply duration filter
    if (duration) {
      tours = tours.filter((tour) => {
        const tourDuration = tour.duration.toLowerCase()
        switch (duration) {
          case "1-3":
            return tourDuration.includes("1 day") || tourDuration.includes("2 day") || tourDuration.includes("3 day")
          case "4-7":
            return (
              tourDuration.includes("4 day") ||
              tourDuration.includes("5 day") ||
              tourDuration.includes("6 day") ||
              tourDuration.includes("7 day")
            )
          case "8-14":
            return ["8", "9", "10", "11", "12", "13", "14"].some((num) => tourDuration.includes(`${num} day`))
          case "15+":
            return (
              ["15", "16", "17", "18", "19", "20"].some((num) => tourDuration.includes(`${num} day`)) ||
              tourDuration.includes("week")
            )
          default:
            return true
        }
      })
    }

    // Apply destination filter
    if (destination) {
      tours = tours.filter(
        (tour) => tour.location.region.toLowerCase().replace(/\s+/g, "-") === destination.toLowerCase(),
      )
    }

    return NextResponse.json({
      tours,
      total: tours.length,
      filters: {
        query,
        category,
        difficulty,
        minPrice,
        maxPrice,
        duration,
        destination,
      },
    })
  } catch (error) {
    console.error("Error in tours search API:", error)
    return NextResponse.json({ error: "Failed to search tours" }, { status: 500 })
  }
}

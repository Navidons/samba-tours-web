import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SearchContent from "@/components/search/search-content"
import { Suspense } from "react"
import LoadingSpinner from "@/components/ui/loading-spinner"

export const metadata: Metadata = {
  title: "Search Uganda Safari Tours - Find Your Perfect Adventure",
  description: "Search and discover Uganda safari tours, gorilla trekking packages, and adventure activities. Filter by location, category, and preferences to find your ideal tour."
}

interface SearchPageProps {
  searchParams: { q?: string; category?: string; location?: string }
}

export const dynamic = 'force-dynamic'

export default function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="container-max px-4 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <SearchContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
      <Footer />
    </>
  )
}

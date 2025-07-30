import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import SearchContent from "@/components/search/search-content"
import { Suspense } from "react"
import LoadingSpinner from "@/components/ui/loading-spinner"

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

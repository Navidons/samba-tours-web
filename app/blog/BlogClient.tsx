"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import BlogHero from "@/components/blog/blog-hero"
import BlogGrid from "@/components/blog/blog-grid"
import BlogSidebar from "@/components/blog/blog-sidebar"
import FeaturedPosts from "@/components/blog/featured-posts"
// import LoadingSpinner from "@/components/ui/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { generateFakeBlogMetrics } from "@/lib/utils/blog-metrics"
// import { getFallbackBlogImage } from "@/lib/utils/blog-images"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  contentHtml: string | null
  status: string
  publishDate: string | null
  readTimeMinutes: number | null
  viewCount: number
  likeCount: number
  commentCount: number
  featured: boolean
  thumbnail: string | null
  category: {
    id: number
    name: string
    slug: string
  } | null
  author: {
    id: number
    name: string
    email: string | null
    bio: string | null
  } | null
  tags: Array<{
    id: number
    name: string
    slug: string
    color: string
  }>
  createdAt: string
  updatedAt: string
}

interface SidebarData {
  popularPosts: Array<{
    id: number
    title: string
    slug: string
    viewCount: number
    thumbnail: string | null
  }>
  categories: Array<{
    id: number
    name: string
    slug: string
    description: string | null
    postCount: number
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
    color: string
  }>
}

export default function BlogClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [sidebarData, setSidebarData] = useState<SidebarData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Memoized filtered posts to prevent unnecessary re-computations
  const filteredPosts = useMemo(() => {
    if (!searchQuery.trim()) return allPosts
    
    const lowercasedQuery = searchQuery.toLowerCase()
    return allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercasedQuery) ||
        post.excerpt.toLowerCase().includes(lowercasedQuery) ||
        (post.tags && post.tags.some((tag) => tag.name.toLowerCase().includes(lowercasedQuery))),
    )
  }, [searchQuery, allPosts])

  // Memoized featured posts
  const featuredPosts = useMemo(() => {
    return allPosts.filter(post => post.featured).slice(0, 3)
  }, [allPosts])

  const fetchBlogData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Single API call with sidebar data included
      const response = await fetch('/api/blog?includeSidebar=true&limit=24')
      if (!response.ok) {
        throw new Error('Failed to fetch blog data')
      }
      
      const data = await response.json()
      
      // Process posts with metrics and fallback images
      const processedPosts = data.posts.map((post: any) => {
        const fakeMetrics = generateFakeBlogMetrics(post.id, post.title, post.featured)
        return {
          ...post,
          content: post.content ?? '',
          contentHtml: post.contentHtml ?? null,
          viewCount: post.viewCount || fakeMetrics.viewCount,
          likeCount: post.likeCount || fakeMetrics.likeCount,
          commentCount: post.commentCount || fakeMetrics.commentCount,
          thumbnail: post.thumbnail || `/api/blog/thumbnails/${post.id}`
        }
      })
      
      setAllPosts(processedPosts)
      
      // Process sidebar data if available
      if (data.sidebar) {
        const processedSidebarData: SidebarData = {
          ...data.sidebar,
          popularPosts: data.sidebar.popularPosts.map((post: any) => ({
            id: post.id,
            title: post.title,
            slug: post.slug,
            viewCount: post.viewCount,
            thumbnail: post.thumbnail || `/api/blog/thumbnails/${post.id}`
          }))
        }
        setSidebarData(processedSidebarData)
      }
    } catch (error) {
      console.error('Error fetching blog data:', error)
      setError('Failed to load blog data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogData()
  }, [fetchBlogData])

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BlogHero />
        <div className="container-max px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchBlogData}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <BlogHero />

      <div className="container-max px-4 py-16 md:py-24 space-y-16 md:space-y-24">
        {featuredPosts.length > 0 && (
          <FeaturedPosts posts={featuredPosts} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <Skeleton className="w-full h-56" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                      <div className="flex items-center justify-between pt-3">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <BlogGrid posts={filteredPosts} />
            )}
          </div>
          <div className="lg:col-span-1">
            <BlogSidebar 
              searchQuery={searchQuery} 
              onSearchChange={handleSearchChange}
              sidebarData={sidebarData}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </main>
  )
} 

"use client"

import { useState, useEffect } from "react"
import BlogHero from "@/components/blog/blog-hero"
import BlogGrid from "@/components/blog/blog-grid"
import BlogSidebar from "@/components/blog/blog-sidebar"
import FeaturedPosts from "@/components/blog/featured-posts"
import LoadingSpinner from "@/components/ui/loading-spinner"

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

export default function BlogClient() {
  const [searchQuery, setSearchQuery] = useState("")
  const [allPosts, setAllPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/blog')
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts')
      }
      
      const data = await response.json()
      const publishedPosts = data.posts.filter((post: BlogPost) => post.status === 'published')
      
      setAllPosts(publishedPosts)
      setFilteredPosts(publishedPosts)
    } catch (error) {
      console.error('Error fetching blog posts:', error)
      setError('Failed to load blog posts')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase()
    const results = allPosts.filter(
      (post) =>
        post.title.toLowerCase().includes(lowercasedQuery) ||
        post.excerpt.toLowerCase().includes(lowercasedQuery) ||
        (post.tags && post.tags.some((tag) => tag.name.toLowerCase().includes(lowercasedQuery))),
    )
    setFilteredPosts(results)
  }, [searchQuery, allPosts])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-50">
        <BlogHero />
        <div className="container-max px-4 py-16">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchBlogPosts}
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
        <FeaturedPosts />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-96">
                <LoadingSpinner className="h-24 w-24" />
              </div>
            ) : (
              <BlogGrid posts={filteredPosts} />
            )}
          </div>
          <div className="lg:col-span-1">
            <BlogSidebar searchQuery={searchQuery} onSearchChange={handleSearchChange} />
          </div>
        </div>
      </div>
    </main>
  )
} 

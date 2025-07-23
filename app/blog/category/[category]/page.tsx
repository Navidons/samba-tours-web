"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import BlogCategoryHeader from "@/components/blog/blog-category-header"
import BlogGrid from "@/components/blog/blog-grid"
import BlogSidebar from "@/components/blog/blog-sidebar"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string
  postCount: number
  image: string
}

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

export default function BlogCategoryPage({ params }: { params: { category: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [category, setCategory] = useState<BlogCategory | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategoryAndPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch category details
        const categoryResponse = await fetch('/api/blog/categories')
        if (!categoryResponse.ok) {
          throw new Error('Failed to fetch category details')
        }
        const categoryData = await categoryResponse.json()
        const foundCategory = categoryData.categories.find((c: BlogCategory) => c.slug === params.category)
        
        if (!foundCategory) {
          notFound()
        }
        
        setCategory({
          ...foundCategory,
          description: foundCategory.description || `Posts in ${foundCategory.name} category`,
          image: ""
        })

        // Fetch posts by category
        const postsResponse = await fetch(`/api/blog/categories/${params.category}`)
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts')
        }
        const postsData = await postsResponse.json()
        setPosts(postsData.posts || [])
      } catch (error) {
        console.error('Error fetching category data:', error)
        setError('Failed to load category data')
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryAndPosts()
  }, [params.category])

  const filteredPosts = searchQuery 
    ? posts.filter((post: BlogPost) => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : posts

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="text-center py-16">
          <LoadingSpinner className="h-12 w-12 mx-auto" />
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </main>
    )
  }

  if (error || !category) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error || 'Category not found'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <BlogCategoryHeader category={category} />

      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            <div className="lg:col-span-3">
              <BlogGrid posts={filteredPosts} />
            </div>

            <div className="lg:col-span-1">
              <BlogSidebar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

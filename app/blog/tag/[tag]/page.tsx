"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import BlogTagHeader from "@/components/blog/blog-tag-header"
import BlogGrid from "@/components/blog/blog-grid"
import BlogSidebar from "@/components/blog/blog-sidebar"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface BlogTag {
  id: number
  name: string
  slug: string
  description: string
  color: string
  postCount: number
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

export default function BlogTagPage({ params }: { params: { tag: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [tag, setTag] = useState<BlogTag | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTagAndPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch tag details
        const tagResponse = await fetch('/api/blog/tags')
        if (!tagResponse.ok) {
          throw new Error('Failed to fetch tag details')
        }
        const tagData = await tagResponse.json()
        const foundTag = tagData.tags.find((t: BlogTag) => t.slug === params.tag)
        
        if (!foundTag) {
          notFound()
        }
        
        setTag({
          ...foundTag,
          description: foundTag.description || `Posts tagged with ${foundTag.name}`
        })

        // Fetch posts by tag
        const postsResponse = await fetch(`/api/blog/tags/${params.tag}`)
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts')
        }
        const postsData = await postsResponse.json()
        setPosts(postsData.posts || [])
      } catch (error) {
        console.error('Error fetching tag data:', error)
        setError('Failed to load tag data')
      } finally {
        setLoading(false)
      }
    }

    fetchTagAndPosts()
  }, [params.tag])

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

  if (error || !tag) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error || 'Tag not found'}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <BlogTagHeader tag={tag} />

      <section className="section-padding">
        <div className="container-max px-4">
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

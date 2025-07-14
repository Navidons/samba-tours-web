"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import BlogAuthorHeader from "@/components/blog/blog-author-header"
import BlogGrid from "@/components/blog/blog-grid"
import BlogSidebar from "@/components/blog/blog-sidebar"
import LoadingSpinner from "@/components/ui/loading-spinner"

interface BlogAuthor {
  id: number
  name: string
  email: string | null
  bio: string | null
  avatar: string | null
  postCount: number
  isActive: boolean
  createdAt: string
  updatedAt: string
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

export default function BlogAuthorPage({ params }: { params: { author: string } }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [author, setAuthor] = useState<BlogAuthor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAuthorAndPosts = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch author details
        const authorResponse = await fetch('/api/blog/authors')
        if (!authorResponse.ok) {
          throw new Error('Failed to fetch author details')
        }
        const authorData = await authorResponse.json()
        
        // Find author by slug (convert author name to slug)
        const authorSlug = params.author.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        const foundAuthor = authorData.authors.find((a: BlogAuthor) => {
          const authorNameSlug = a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          return authorNameSlug === authorSlug
        })
        
        if (!foundAuthor) {
          notFound()
        }
        
        setAuthor(foundAuthor)

        // Fetch posts by author
        const postsResponse = await fetch(`/api/blog/authors/${foundAuthor.id}`)
        if (!postsResponse.ok) {
          throw new Error('Failed to fetch posts')
        }
        const postsData = await postsResponse.json()
        setPosts(postsData.posts || [])
      } catch (error) {
        console.error('Error fetching author data:', error)
        setError('Failed to load author data')
      } finally {
        setLoading(false)
      }
    }

    fetchAuthorAndPosts()
  }, [params.author])

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

  if (error || !author) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error || 'Author not found'}</p>
        </div>
      </main>
    )
  }

  // Transform author data to match component expectations
  const transformedAuthor = {
    name: author.name,
    role: "Travel Writer",
            image: author.avatar || "",
    bio: author.bio || "Experienced travel writer with deep knowledge of Uganda's wildlife and culture.",
    expertise: ["Wildlife Safari", "Gorilla Trekking", "Photography", "Birdwatching"],
    experience: "5+ years",
    postCount: author.postCount,
    social: {
      twitter: `@${author.name.toLowerCase().replace(/\s+/g, '')}`,
      instagram: `@${author.name.toLowerCase().replace(/\s+/g, '')}`,
    },
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <BlogAuthorHeader author={transformedAuthor} />

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

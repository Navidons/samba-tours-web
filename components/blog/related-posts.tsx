"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, Clock, ArrowRight, Loader2 } from "lucide-react"

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

interface RelatedPostsProps {
  currentPost: BlogPost
}

export default function RelatedPosts({ currentPost }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRelatedPosts()
  }, [currentPost])

  const fetchRelatedPosts = async () => {
    try {
      setLoading(true)
      
      // Build query parameters for related posts
      const params = new URLSearchParams()
      params.append('limit', '3')
      params.append('exclude', currentPost.id.toString())
      
      // Add category filter if available
      if (currentPost.category) {
        params.append('category', currentPost.category.slug)
      }
      
      // Add tag filter if available
      if (currentPost.tags.length > 0) {
        params.append('tag', currentPost.tags[0].slug)
      }
      
      const response = await fetch(`/api/blog?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch related posts')
      }
      
      const data = await response.json()
      setRelatedPosts(data.posts || [])
    } catch (error) {
      console.error('Error fetching related posts:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section-padding bg-white">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="heading-secondary">You Might Also Like</h2>
          <p className="text-lg text-gray-600">More expert insights and stories from our Uganda travel specialists</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : relatedPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedPosts.map((post) => (
              <Card
                key={post.id}
                className="group hover:shadow-xl transition-all duration-300 overflow-hidden rounded-lg"
              >
                <div className="relative h-48 overflow-hidden">
                  {post.thumbnail ? (
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 text-lg font-semibold">
                      {post.title}
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-emerald-600 text-white border-none">
                      {post.category?.name || "Uncategorized"}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author?.name || "Unknown Author"}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{post.readTimeMinutes ? `${post.readTimeMinutes} min read` : "N/A"}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-2">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  <p className="text-gray-700 mb-4 line-clamp-3 flex-grow">{post.excerpt}</p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {post.publishDate ? new Date(post.publishDate).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "Not published"}
                      </span>
                    </div>

                    <Link
                      href={`/blog/${post.slug}`}
                      className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
                    >
                      <span>Read More</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No related posts found</p>
          </div>
        )}
      </div>
    </section>
  )
}

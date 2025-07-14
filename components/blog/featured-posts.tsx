"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User, ArrowRight, Eye, Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

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

export default function FeaturedPosts() {
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedPosts()
  }, [])

  const fetchFeaturedPosts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/blog?featured=true&limit=3')
      if (!response.ok) {
        throw new Error('Failed to fetch featured posts')
      }
      
      const data = await response.json()
      setFeaturedPosts(data.posts)
    } catch (error) {
      console.error('Error fetching featured posts:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
        <p className="text-gray-600">Loading featured posts...</p>
      </div>
    )
  }

  if (featuredPosts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">Featured Stories</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our most popular and inspiring travel stories from Uganda's wilderness
        </p>
        <p className="text-gray-600 mt-4">No featured posts available at the moment.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="font-playfair text-4xl font-bold text-gray-900 mb-4">Featured Stories</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our most popular and inspiring travel stories from Uganda's wilderness
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {featuredPosts.map((post, index) => (
          <Card
            key={post.id}
            className={`group hover:shadow-xl transition-all duration-300 overflow-hidden ${
              index === 0 ? "lg:col-span-2" : ""
            }`}
          >
            <div className={`${index === 0 ? "md:flex" : ""}`}>
              <div className={`relative ${index === 0 ? "md:w-1/2" : ""}`}>
                {post.thumbnail ? (
                  <Image
                    src={post.thumbnail}
                    alt={post.title}
                    width={600}
                    height={400}
                    className={`w-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                      index === 0 ? "h-80 md:h-full" : "h-64"
                    }`}
                  />
                ) : (
                  <div
                    className={`w-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 text-xl font-semibold group-hover:scale-105 transition-transform duration-300 ${
                      index === 0 ? "h-80 md:h-full" : "h-64"
                    }`}
                  >
                    {post.title}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Badge className="absolute top-4 left-4 bg-emerald-600 text-white border-0">
                  {post.category?.name || "Uncategorized"}
                </Badge>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center space-x-4 text-white text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{post.viewCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{post.likeCount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className={`p-6 md:p-8 ${index === 0 ? "md:w-1/2" : ""}`}>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {post.publishDate ? new Date(post.publishDate).toLocaleDateString() : "Not published"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{post.author?.name || "Unknown Author"}</span>
                    </div>
                  </div>

                  <h3
                    className={`font-playfair font-bold text-gray-900 group-hover:text-emerald-600 transition-colors ${
                      index === 0 ? "text-3xl" : "text-xl"
                    }`}
                  >
                    {post.title}
                  </h3>

                  <p className="text-gray-700 leading-relaxed">{post.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge 
                        key={tag.id} 
                        variant="outline" 
                        className="text-xs border-emerald-200 text-emerald-700"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    asChild
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white border-0"
                  >
                    <Link href={`/blog/${post.slug}`} className="flex items-center space-x-2">
                      <span>Read Full Story</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, User, Loader2, Heart, MessageCircle } from "lucide-react"
import { formatLikes, formatComments } from "@/lib/utils/number-formatting"

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

const POSTS_PER_PAGE = 4

interface BlogGridProps {
  posts: BlogPost[]
}

export default function BlogGrid({ posts }: BlogGridProps) {
  const [visiblePosts, setVisiblePosts] = useState(POSTS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)

  const loadMorePosts = () => {
    setIsLoading(true)
    setTimeout(() => {
      setVisiblePosts((prev) => prev + POSTS_PER_PAGE)
      setIsLoading(false)
    }, 500) // Simulate network delay
  }

  const hasMorePosts = visiblePosts < posts.length

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 bg-emerald-50/50 rounded-lg">
        <h2 className="text-2xl font-playfair text-gray-800">No Articles Found</h2>
        <p className="text-gray-600 mt-2">Try adjusting your search query or clearing the filter.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {posts.slice(0, visiblePosts).map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden group flex flex-col">
            <Link href={`/blog/${post.slug}`} className="block relative">
              <Image
                src={post.thumbnail || '/photos/queen-elizabeth-national-park-uganda.jpg'}
                alt={post.title}
                width={400}
                height={250}
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Featured badge */}
              {post.featured && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-600">
                    ⭐ Featured
                  </Badge>
                </div>
              )}
            </Link>
            <div className="p-6 flex flex-col flex-grow">
              <div className="mb-4">
                <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200">
                  {post.category?.name || "Uncategorized"}
                </Badge>
              </div>
              <Link href={`/blog/${post.slug}`} className="block">
                <h3 className="font-playfair text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors mb-3 line-clamp-2">
                  {post.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-sm line-clamp-3 flex-grow">{post.excerpt}</p>
              
              {/* Engagement metrics */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <Heart className="h-3 w-3" />
                      <span>{formatLikes(post.likeCount || 0)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{formatComments(post.commentCount || 0)}</span>
                    </div>
                  </div>
                  <span>{post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '5 min read'}</span>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{post.author?.name || "Unknown Author"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {post.publishDate ? new Date(post.publishDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      }) : "Draft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasMorePosts && (
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 mb-4">
            Showing {Math.min(visiblePosts, posts.length)} of {posts.length} articles
          </p>
          <Button onClick={loadMorePosts} disabled={isLoading} className="bg-emerald-600 hover:bg-emerald-700" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Articles"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

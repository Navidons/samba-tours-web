"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, MapPin, BookOpen } from "lucide-react"
import { useActiveHeading } from "@/components/hooks/use-active-heading"
import { cn } from "@/lib/utils"

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
    image?: string | null
  } | null
  tags: Array<{
    id: number
    name: string
    slug: string
    color: string
  }>
  createdAt: string
  updatedAt: string
  tableOfContents?: {
    text: string
    id: string
  }[]
}

interface Tour {
  id: number
  title: string
  slug: string
  shortDescription: string
  price: number
  originalPrice: number | null
  duration: string
  featuredImage: {
    data: string
    name: string | null
    type: string | null
  } | null
  rating: number
  reviewCount: number
}

interface BlogPostSidebarProps {
  post: BlogPost
}

export default function BlogPostSidebar({ post }: BlogPostSidebarProps) {
  const headingIds = post.tableOfContents?.map((h) => h.id) || []
  const activeId = useActiveHeading(headingIds)
  const [relatedTours, setRelatedTours] = useState<Tour[]>([])
  const [loadingTours, setLoadingTours] = useState(true)

  useEffect(() => {
    loadRelatedTours()
  }, [])

  const loadRelatedTours = async () => {
    try {
      setLoadingTours(true)
      const response = await fetch('/api/tours?limit=3&sortBy=popular')
      const data = await response.json()

      if (data.success) {
        setRelatedTours(data.tours)
      } else {
        console.error('Failed to load related tours:', data.error)
        setRelatedTours([])
      }
    } catch (error) {
      console.error('Error loading related tours:', error)
      setRelatedTours([])
    } finally {
      setLoadingTours(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="sticky top-24 space-y-8">
      {/* Author Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-emerald-600" />
            <span>About the Author</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {post.author ? (
            <div className="flex items-start space-x-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                {post.author.image ? (
                  <Image
                    src={post.author.image}
                    alt={post.author.name}
                    fill
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-200 text-emerald-800 text-2xl font-bold rounded-full">
                    {post.author.name
                      ? post.author.name.split(' ').map((n: string) => n[0]).join('')
                      : 'Author'}
                  </div>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{post.author.name}</h4>
                {post.author.email && (
                  <p className="text-sm text-emerald-600 mb-2">{post.author.email}</p>
                )}
                {post.author.bio && (
                  <p className="text-sm text-gray-700">{post.author.bio}</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-600 text-sm">Author information not available</p>
          )}
        </CardContent>
      </Card>

      {/* Table of Contents */}
      {post.tableOfContents && post.tableOfContents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <span>In This Article</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <nav className="space-y-2 text-sm">
              {post.tableOfContents.map((heading) => (
                <Link
                  key={heading.id}
                  href={`#${heading.id}`}
                  data-active={heading.id === activeId}
                  className={cn(
                    "block text-gray-700 hover:text-emerald-600 transition-colors",
                    "data-[active=true]:font-semibold data-[active=true]:text-emerald-600",
                  )}
                >
                  {heading.text}
                </Link>
              ))}
            </nav>
          </CardContent>
        </Card>
      )}

      {/* Related Tours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span>Related Tours</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingTours ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex space-x-3">
                <div className="w-20 h-16 bg-gray-200 rounded animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </div>
            ))
          ) : relatedTours.length > 0 ? (
            relatedTours.map((tour) => (
              <div key={tour.id} className="flex space-x-3 group">
                <div className="relative w-20 h-16 flex-shrink-0 rounded overflow-hidden">
                  {tour.featuredImage && tour.featuredImage.data ? (
                    <Image
                      src={tour.featuredImage.data}
                      alt={tour.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-emerald-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1">
                    <Link href={`/tours/${tour.slug}`}>{tour.title}</Link>
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{tour.duration}</span>
                    <span className="font-semibold text-emerald-600">{formatPrice(tour.price)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 text-center py-4">
              No tours available at the moment
            </p>
          )}
          <Button className="w-full btn-primary mt-4" size="sm" asChild>
            <Link href="/tours">View All Tours</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, TrendingUp, Tag, Folder } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

interface PopularPostLite {
  id: number
  title: string
  slug: string
  viewCount: number
  thumbnail: string | null
}

interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string | null
  postCount: number
}

interface BlogTag {
  id: number
  name: string
  slug: string
  color: string
  postCount?: number
}

interface SidebarData {
  popularPosts: PopularPostLite[]
  categories: BlogCategory[]
  tags: BlogTag[]
}

interface BlogSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sidebarData: SidebarData | null
  isLoading: boolean
}

export default function BlogSidebar({ 
  searchQuery, 
  onSearchChange, 
  sidebarData, 
  isLoading 
}: BlogSidebarProps) {
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // The search is already happening live on change, but this prevents page reload.
  }

  return (
    <aside className="space-y-8 sticky top-24">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-playfair text-xl">
            <Search className="h-5 w-5 text-emerald-600" />
            <span>Search Articles</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex space-x-2" onSubmit={handleFormSubmit}>
            <Input
              placeholder="Keywords..."
              className="flex-1"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Popular Posts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-playfair text-xl">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <span>Popular Posts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start space-x-4">
                  <Skeleton className="w-20 h-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : sidebarData?.popularPosts && sidebarData.popularPosts.length > 0 ? (
            sidebarData.popularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
                <div className="flex items-start space-x-4">
                  {post.thumbnail ? (
                    <Image
                      src={post.thumbnail}
                      alt={post.title}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 text-emerald-700 text-base font-semibold rounded-lg flex-shrink-0">
                      {post.title}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h4>
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{post.viewCount.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-gray-600 text-sm">No popular posts available</p>
          )}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-playfair text-xl">
            <Folder className="h-5 w-5 text-emerald-600" />
            <span>Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-8 rounded" />
                </div>
              ))}
            </div>
          ) : sidebarData?.categories && sidebarData.categories.length > 0 ? (
            <div className="space-y-2">
              {sidebarData.categories.map((category) => (
                <Link key={category.id} href={`/blog/category/${category.slug}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-emerald-50 transition-colors group">
                    <span className="text-gray-900 group-hover:text-emerald-600">{category.name}</span>
                    <Badge className="bg-emerald-100 text-emerald-800 font-mono">{category.postCount}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No categories available</p>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 font-playfair text-xl">
            <Tag className="h-5 w-5 text-emerald-600" />
            <span>Popular Tags</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-16 rounded" />
              ))}
            </div>
          ) : sidebarData?.tags && sidebarData.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {sidebarData.tags.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge
                    variant="outline"
                    className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors cursor-pointer"
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm">No tags available</p>
          )}
        </CardContent>
      </Card>
    </aside>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, TrendingUp, Tag, Folder, Mail, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  status: string
  publishDate: string | null
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
  postCount: number
}

interface BlogSidebarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function BlogSidebar({ searchQuery, onSearchChange }: BlogSidebarProps) {
  const [popularPosts, setPopularPosts] = useState<BlogPost[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSidebarData()
  }, [])

  const fetchSidebarData = async () => {
    try {
      setLoading(true)
      
      // Fetch popular posts (most viewed)
      const popularResponse = await fetch('/api/blog?limit=3&sort=views')
      const popularData = await popularResponse.json()
      
      // Fetch categories
      const categoriesResponse = await fetch('/api/blog/categories')
      const categoriesData = await categoriesResponse.json()
      
      // Fetch tags
      const tagsResponse = await fetch('/api/blog/tags')
      const tagsData = await tagsResponse.json()
      
      setPopularPosts(popularData.posts || [])
      setCategories(categoriesData.categories || [])
      setTags(tagsData.tags || [])
    } catch (error) {
      console.error('Error fetching sidebar data:', error)
    } finally {
      setLoading(false)
    }
  }

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
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : popularPosts.length > 0 ? (
            popularPosts.map((post) => (
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
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : categories.length > 0 ? (
            <div className="space-y-2">
              {categories.map((category) => (
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
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
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

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, Eye, User, Tag, FileText, BarChart3 } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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
  thumbnailName: string | null
  thumbnailType: string | null
  thumbnailSize: number | null
  metaTitle: string | null
  metaDescription: string | null
  seoKeywords: string[]
  category: {
    id: number
    name: string
    slug: string
    description: string | null
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
  comments: Array<{
    id: number
    authorName: string
    authorEmail: string | null
    content: string
    status: string
    createdAt: string
  }>
  createdAt: string
  updatedAt: string
}

interface BlogPostViewProps {
  slug: string
}

export default function BlogPostView({ slug }: BlogPostViewProps) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPost()
  }, [slug])

  const fetchPost = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // First try to find by slug
      const response = await fetch(`/api/admin/blog/by-slug/${encodeURIComponent(slug)}`)
      
      if (!response.ok) {
        throw new Error("Blog post not found")
      }
      
      const data = await response.json()
      setPost(data.post)
    } catch (error) {
      console.error("Error fetching post:", error)
      setError("Failed to load blog post")
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not published"
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-lg text-gray-600 mb-4">
            {error || "Blog post not found"}
          </p>
          <p className="text-sm text-gray-500">
            Slug: {slug}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Post Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-earth-900">{post.title}</h1>
                {post.featured && (
                  <Badge className="bg-yellow-100 text-yellow-800">Featured</Badge>
                )}
              </div>
              <Badge className={getStatusColor(post.status)}>{post.status}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-earth-600">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Published: {formatDate(post.publishDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Read time: {post.readTimeMinutes || 'N/A'} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{post.viewCount.toLocaleString()} views</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>{post.commentCount} comments</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Thumbnail */}
          {post.thumbnail && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={post.thumbnail}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle>Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-earth-700 leading-relaxed">{post.excerpt}</p>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              {post.contentHtml ? (
                <div
                  className="prose prose-lg max-w-none prose-headings:font-playfair prose-headings:text-earth-900 prose-p:text-earth-700 prose-p:leading-relaxed prose-a:text-forest-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-earth-900 prose-ul:text-earth-700 prose-li:text-earth-700 prose-blockquote:border-forest-500 prose-blockquote:text-earth-600"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-earth-700 leading-relaxed">
                  {post.content}
                </div>
              )}
            </CardContent>
          </Card>

          {/* SEO & Metadata */}
          {(post.metaTitle || post.metaDescription || post.seoKeywords?.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>SEO & Metadata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {post.metaTitle && (
                  <div>
                    <p className="text-sm font-medium text-earth-600 mb-1">Meta Title</p>
                    <p className="text-earth-700">{post.metaTitle}</p>
                  </div>
                )}
                {post.metaDescription && (
                  <div>
                    <p className="text-sm font-medium text-earth-600 mb-1">Meta Description</p>
                    <p className="text-earth-700">{post.metaDescription}</p>
                  </div>
                )}
                {post.seoKeywords && post.seoKeywords.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-earth-600 mb-2">SEO Keywords</p>
                    <div className="flex flex-wrap gap-2">
                      {post.seoKeywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-forest-600 border-forest-200">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Thumbnail Details */}
          {post.thumbnail && (
            <Card>
              <CardHeader>
                <CardTitle>Thumbnail Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-earth-600 mb-1">File Name</p>
                  <p className="text-earth-700">{post.thumbnailName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-earth-600 mb-1">File Type</p>
                  <p className="text-earth-700">{post.thumbnailType || 'N/A'}</p>
                </div>
                {post.thumbnailSize && (
                  <div>
                    <p className="text-sm font-medium text-earth-600 mb-1">File Size</p>
                    <p className="text-earth-700">{(post.thumbnailSize / 1024).toFixed(2)} KB</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          {post.comments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Comments ({post.comments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="border-l-4 border-forest-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-earth-900">{comment.authorName}</span>
                        <Badge variant={comment.status === 'approved' ? 'default' : 'secondary'}>
                          {comment.status}
                        </Badge>
                      </div>
                      <p className="text-earth-700 mb-2">{comment.content}</p>
                      <p className="text-sm text-earth-500">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Author */}
          {post.author && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Author
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="font-medium text-earth-900">{post.author.name}</p>
                  {post.author.email && (
                    <p className="text-sm text-earth-600">{post.author.email}</p>
                  )}
                  {post.author.bio && (
                    <p className="text-sm text-earth-600">{post.author.bio}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Category */}
          {post.category && (
            <Card>
              <CardHeader>
                <CardTitle>Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge variant="outline" className="text-forest-600 border-forest-200">
                    {post.category.name}
                  </Badge>
                  {post.category.description && (
                    <p className="text-sm text-earth-600">{post.category.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-earth-600">Views</span>
                  <span className="font-medium">{post.viewCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Likes</span>
                  <span className="font-medium">{post.likeCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Comments</span>
                  <span className="font-medium">{post.commentCount}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-earth-600">Created</span>
                  <span className="font-medium">{formatDateTime(post.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-earth-600">Updated</span>
                  <span className="font-medium">{formatDateTime(post.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 

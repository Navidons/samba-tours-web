"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { Loader2, Save, Eye, Calendar, Plus, Upload, X } from "lucide-react"
import RichTextEditor from "@/components/ui/rich-text-editor"

interface BlogCategory {
  id: number
  name: string
  slug: string
  description: string | null
}

interface BlogTag {
  id: number
  name: string
  slug: string
  color: string
}

interface BlogAuthor {
  id: number
  name: string
  email: string | null
  bio: string | null
}

interface BlogPostFormProps {
  postId?: number
  slug?: string
}

export default function BlogPostForm({ postId, slug }: BlogPostFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [authors, setAuthors] = useState<BlogAuthor[]>([])
  const [selectedTags, setSelectedTags] = useState<number[]>([])
  const [newTagName, setNewTagName] = useState("")
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newAuthorName, setNewAuthorName] = useState("")
  const [newAuthorEmail, setNewAuthorEmail] = useState("")
  const [newAuthorBio, setNewAuthorBio] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showAuthorModal, setShowAuthorModal] = useState(false)
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [creatingAuthor, setCreatingAuthor] = useState(false)
  const [creatingTag, setCreatingTag] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    contentHtml: "",
    status: "draft" as "draft" | "published" | "archived",
    publishDate: "",
    readTimeMinutes: "",
    featured: false,
    categoryId: "",
    authorId: "",
    metaTitle: "",
    metaDescription: "",
    seoKeywords: [] as string[]
  })

  useEffect(() => {
    fetchCategories()
    fetchTags()
    fetchAuthors()
    if (postId) {
      fetchPost(postId)
    } else if (slug) {
      fetchPostBySlug(slug)
    }
  }, [postId, slug])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/blog/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchTags = async () => {
    try {
      const response = await fetch("/api/admin/blog/tags")
      if (response.ok) {
        const data = await response.json()
        setTags(data.tags)
      }
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch("/api/admin/blog/authors")
      if (response.ok) {
        const data = await response.json()
        setAuthors(data.authors)
      }
    } catch (error) {
      console.error("Error fetching authors:", error)
    }
  }

  const fetchPost = async (id: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/${id}`)
      if (response.ok) {
        const data = await response.json()
        const post = data.post
        
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          contentHtml: post.contentHtml || "",
          status: post.status,
          publishDate: post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : "",
          readTimeMinutes: post.readTimeMinutes?.toString() || "",
          featured: post.featured,
          categoryId: post.category?.id?.toString() || "",
          authorId: post.author?.id?.toString() || "",
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          seoKeywords: post.seoKeywords || []
        })
        
        setSelectedTags(post.tags.map((tag: any) => tag.id))
        
        // Set thumbnail preview if exists
        if (post.thumbnail) {
          setThumbnailPreview(post.thumbnail)
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPostBySlug = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/blog/by-slug/${encodeURIComponent(slug)}`)
      if (response.ok) {
        const data = await response.json()
        const post = data.post
        
        setFormData({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          contentHtml: post.contentHtml || "",
          status: post.status,
          publishDate: post.publishDate ? new Date(post.publishDate).toISOString().split('T')[0] : "",
          readTimeMinutes: post.readTimeMinutes?.toString() || "",
          featured: post.featured,
          categoryId: post.category?.id?.toString() || "",
          authorId: post.author?.id?.toString() || "",
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          seoKeywords: post.seoKeywords || []
        })
        
        setSelectedTags(post.tags.map((tag: any) => tag.id))
        
        // Set thumbnail preview if exists
        if (post.thumbnail) {
          setThumbnailPreview(post.thumbnail)
        }
      }
    } catch (error) {
      console.error("Error fetching post by slug:", error)
      toast({
        title: "Error",
        description: "Failed to load blog post",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let url: string
      let method: string
      
      if (postId) {
        url = `/api/admin/blog/${postId}`
        method = "PUT"
      } else if (slug) {
        url = `/api/admin/blog/by-slug/${encodeURIComponent(slug)}`
        method = "PUT"
      } else {
        url = "/api/admin/blog"
        method = "POST"
      }

      // Create FormData for file upload
      const formDataToSend = new FormData()
      
      // Add text fields
      formDataToSend.append('title', formData.title)
      formDataToSend.append('slug', formData.slug)
      formDataToSend.append('excerpt', formData.excerpt)
      formDataToSend.append('content', formData.content)
      formDataToSend.append('contentHtml', formData.contentHtml)
      formDataToSend.append('status', formData.status)
      formDataToSend.append('publishDate', formData.publishDate || '')
      formDataToSend.append('readTimeMinutes', formData.readTimeMinutes || '')
      formDataToSend.append('featured', formData.featured.toString())
      formDataToSend.append('categoryId', formData.categoryId || '')
      formDataToSend.append('authorId', formData.authorId || '')
      formDataToSend.append('metaTitle', formData.metaTitle)
      formDataToSend.append('metaDescription', formData.metaDescription)
      formDataToSend.append('seoKeywords', JSON.stringify(formData.seoKeywords))
      
      // Add tags
      selectedTags.forEach(tagId => {
        formDataToSend.append('tagIds', tagId.toString())
      })
      
      // Add thumbnail file if selected
      if (thumbnailFile) {
        formDataToSend.append('thumbnail', thumbnailFile)
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend
      })

      if (!response.ok) throw new Error("Failed to save post")

      const data = await response.json()
      
      toast({
        title: "Success",
        description: `Blog post ${postId ? 'updated' : 'created'} successfully`
      })

      router.push("/admin/blog")
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Error",
        description: "Failed to save blog post",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      setCreatingTag(true)
      const response = await fetch("/api/admin/blog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTagName.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Check if tag already exists in our local state
        const tagExists = tags.some(tag => tag.id === data.tag.id)
        
        if (!tagExists) {
          setTags(prev => [...prev, data.tag])
        }
        
        // Add to selected tags if not already selected
        if (!selectedTags.includes(data.tag.id)) {
          setSelectedTags(prev => [...prev, data.tag.id])
        }
        
        setNewTagName("")
        
        toast({
          title: data.message ? "Info" : "Success",
          description: data.message || "Tag created successfully"
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to create tag",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating tag:", error)
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive"
      })
    } finally {
      setCreatingTag(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    try {
      setCreatingCategory(true)
      const response = await fetch("/api/admin/blog/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() })
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(prev => [...prev, data.category])
        setFormData(prev => ({ ...prev, categoryId: data.category.id.toString() }))
        setNewCategoryName("")
        setShowCategoryModal(false)
        toast({
          title: "Success",
          description: "Category created successfully"
        })
      }
    } catch (error) {
      console.error("Error creating category:", error)
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      })
    } finally {
      setCreatingCategory(false)
    }
  }

  const handleCreateAuthor = async () => {
    if (!newAuthorName.trim()) return

    try {
      setCreatingAuthor(true)
      const response = await fetch("/api/admin/blog/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: newAuthorName.trim(),
          email: newAuthorEmail.trim() || null,
          bio: newAuthorBio.trim() || null
        })
      })

      if (response.ok) {
        const data = await response.json()
        setAuthors(prev => [...prev, data.author])
        setFormData(prev => ({ ...prev, authorId: data.author.id.toString() }))
        setNewAuthorName("")
        setNewAuthorEmail("")
        setNewAuthorBio("")
        setShowAuthorModal(false)
        toast({
          title: "Success",
          description: "Author created successfully"
        })
      }
    } catch (error) {
      console.error("Error creating author:", error)
      toast({
        title: "Error",
        description: "Failed to create author",
        variant: "destructive"
      })
    } finally {
      setCreatingAuthor(false)
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive"
        })
        return
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive"
        })
        return
      }

      setThumbnailFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="post-url-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief description of the post"
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="thumbnail">Thumbnail Image</Label>
                <div className="space-y-2">
                  {thumbnailPreview ? (
                    <div className="relative">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeThumbnail}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">Click to upload thumbnail image</p>
                      <p className="text-xs text-gray-500">JPG, PNG, GIF up to 5MB</p>
                    </div>
                  )}
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('thumbnail')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {thumbnailPreview ? 'Change Image' : 'Upload Image'}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
                  placeholder="Write your blog post content here..."
                />
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="SEO title for search engines"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  placeholder="SEO description for search engines"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publishing */}
          <Card>
            <CardHeader>
              <CardTitle>Publishing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="publishDate">Publish Date</Label>
                <Input
                  id="publishDate"
                  type="date"
                  value={formData.publishDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="readTimeMinutes">Read Time (minutes)</Label>
                <Input
                  id="readTimeMinutes"
                  type="number"
                  value={formData.readTimeMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, readTimeMinutes: e.target.value }))}
                  placeholder="5"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Post</Label>
              </div>
            </CardContent>
          </Card>

          {/* Organization */}
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.categoryId || undefined} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                    <Separator />
                    <Dialog open={showCategoryModal} onOpenChange={setShowCategoryModal}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Category
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Category</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="newCategoryName">Category Name</Label>
                            <Input
                              id="newCategoryName"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              placeholder="Enter category name"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCategoryModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCreateCategory}
                              disabled={!newCategoryName.trim() || creatingCategory}
                            >
                              {creatingCategory && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Create Category
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author">Author</Label>
                <Select value={formData.authorId || undefined} onValueChange={(value) => setFormData(prev => ({ ...prev, authorId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select author" />
                  </SelectTrigger>
                  <SelectContent>
                    {authors.map((author) => (
                      <SelectItem key={author.id} value={author.id.toString()}>
                        {author.name}
                      </SelectItem>
                    ))}
                    <Separator />
                    <Dialog open={showAuthorModal} onOpenChange={setShowAuthorModal}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Author
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New Author</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="newAuthorName">Author Name *</Label>
                            <Input
                              id="newAuthorName"
                              value={newAuthorName}
                              onChange={(e) => setNewAuthorName(e.target.value)}
                              placeholder="Enter author name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newAuthorEmail">Email</Label>
                            <Input
                              id="newAuthorEmail"
                              type="email"
                              value={newAuthorEmail}
                              onChange={(e) => setNewAuthorEmail(e.target.value)}
                              placeholder="Enter author email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="newAuthorBio">Bio</Label>
                            <Textarea
                              id="newAuthorBio"
                              value={newAuthorBio}
                              onChange={(e) => setNewAuthorBio(e.target.value)}
                              placeholder="Enter author bio"
                              rows={3}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowAuthorModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={handleCreateAuthor}
                              disabled={!newAuthorName.trim() || creatingAuthor}
                            >
                              {creatingAuthor && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                              Create Author
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag.id)}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined,
                      borderColor: tag.color
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Add new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleCreateTag()
                      }
                    }}
                    className={tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase()) ? 'border-orange-300 bg-orange-50' : ''}
                  />
                  {tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase()) && (
                    <p className="text-xs text-orange-600 mt-1">Tag already exists</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || creatingTag}
                >
                  {creatingTag ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/blog")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {postId ? 'Update Post' : 'Create Post'}
        </Button>
      </div>
    </form>
  )
} 

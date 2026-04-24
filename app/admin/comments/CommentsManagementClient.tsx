"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog"
import { 
  MessageCircle, 
  Search, 
  Filter, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  Loader2,
  ExternalLink
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Comment {
  id: number
  authorName: string
  authorEmail: string
  content: string
  status: 'pending' | 'approved' | 'spam'
  likes: number
  createdAt: string
  updatedAt: string
  parentCommentId: number | null
  post: {
    id: number
    title: string
    slug: string
  }
  parentComment?: {
    id: number
    authorName: string
    content: string
  }
  replies: Comment[]
  _count: {
    replies: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function CommentsManagementClient() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    page: 1
  })
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadComments()
  }, [filters])

  const loadComments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: '20'
      })
      
      if (filters.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`/api/admin/blog/comments?${params}`)
      const data = await response.json()

      if (data.success) {
        setComments(data.comments)
        setPagination(data.pagination)
      } else {
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error loading comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateCommentStatus = async (commentId: number, status: 'pending' | 'approved' | 'spam') => {
    try {
      setActionLoading(commentId)
      
      const response = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        })
        
        // Update the comment in the list
        setComments(prev => 
          prev.map(comment => 
            comment.id === commentId 
              ? { ...comment, status }
              : comment
          )
        )
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error updating comment:', error)
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const deleteComment = async (commentId: number) => {
    try {
      setActionLoading(commentId)
      
      const response = await fetch(`/api/admin/blog/comments/${commentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        })
        
        // Remove the comment from the list
        setComments(prev => prev.filter(comment => comment.id !== commentId))
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete comment",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error deleting comment:', error)
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'spam':
        return <Badge className="bg-red-100 text-red-800">Spam</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-forest-600" />
        <span className="ml-2 text-earth-600">Loading comments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-earth-400" />
              <Input
                placeholder="Search comments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10"
              />
            </div>
            <Select 
              value={filters.status} 
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="spam">Spam</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => setFilters({ status: 'all', search: '', page: 1 })}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Comments ({pagination?.total || 0})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {comments.length === 0 ? (
            <div className="text-center py-8 text-earth-600">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-earth-400" />
              <p>No comments found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Author</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Post</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{comment.authorName}</div>
                          <div className="text-sm text-earth-500">{comment.authorEmail}</div>
                          {comment.parentComment && (
                            <div className="text-xs text-earth-400 mt-1">
                              Reply to: {comment.parentComment.authorName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm">{truncateContent(comment.content)}</p>
                          {comment._count.replies > 0 && (
                            <div className="text-xs text-earth-500 mt-1">
                              {comment._count.replies} reply{comment._count.replies > 1 ? 'ies' : 'y'}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a 
                          href={`/blog/${comment.post.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-forest-600 hover:text-forest-800 flex items-center space-x-1"
                        >
                          <span className="text-sm">{comment.post.title}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(comment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDate(comment.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedComment(comment)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Comment Details</DialogTitle>
                                <DialogDescription>
                                  Review and manage this comment
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold">Author</h4>
                                  <p>{comment.authorName} ({comment.authorEmail})</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Content</h4>
                                  <p className="whitespace-pre-wrap">{comment.content}</p>
                                </div>
                                <div>
                                  <h4 className="font-semibold">Post</h4>
                                  <a 
                                    href={`/blog/${comment.post.slug}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-forest-600 hover:text-forest-800"
                                  >
                                    {comment.post.title}
                                  </a>
                                </div>
                                {comment.parentComment && (
                                  <div>
                                    <h4 className="font-semibold">Reply to</h4>
                                    <p className="text-sm text-earth-600">
                                      {comment.parentComment.authorName}: {truncateContent(comment.parentComment.content, 200)}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          {comment.status === 'pending' && (
                            <Button
                              size="sm"
                              onClick={() => updateCommentStatus(comment.id, 'approved')}
                              disabled={actionLoading === comment.id}
                            >
                              {actionLoading === comment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          {comment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateCommentStatus(comment.id, 'spam')}
                              disabled={actionLoading === comment.id}
                            >
                              {actionLoading === comment.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </Button>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this comment? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteComment(comment.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-earth-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} comments
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 

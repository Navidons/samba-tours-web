"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { MessageCircle, Heart, Reply, Flag, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  BlogComment, 
  CreateCommentData, 
  getBlogComments, 
  createBlogComment, 
  likeBlogComment, 
  reportBlogComment,
  formatCommentDate 
} from "@/lib/services/blog-comments-service"

interface BlogCommentsProps {
  postId: number
}

export default function BlogComments({ postId }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [liking, setLiking] = useState<number | null>(null)
  const [reporting, setReporting] = useState<number | null>(null)
  const [newComment, setNewComment] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [replyingTo, setReplyingTo] = useState<number | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [replyName, setReplyName] = useState("")
  const [replyEmail, setReplyEmail] = useState("")
  const [submittingReply, setSubmittingReply] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState("")
  const [reportCustomReason, setReportCustomReason] = useState("")
  const [reportName, setReportName] = useState("")
  const [reportEmail, setReportEmail] = useState("")
  const { toast } = useToast()

  // Load comments on component mount
  useEffect(() => {
    loadComments()
  }, [postId])

  const loadComments = async () => {
    try {
      setLoading(true)
      const fetchedComments = await getBlogComments(postId)
      setComments(fetchedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !newComment.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      
      const commentData: CreateCommentData = {
        postId,
        authorName: name.trim(),
        authorEmail: email.trim(),
        content: newComment.trim(),
      }

      const result = await createBlogComment(commentData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Comment submitted successfully!",
        })
        
        // Clear form
    setNewComment("")
    setName("")
    setEmail("")
        
        // Reload comments to show the new one (if approved)
        await loadComments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit comment. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      toast({
        title: "Error",
        description: "Failed to submit comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleReply = async (e: React.FormEvent, parentCommentId: number) => {
    e.preventDefault()
    
    if (!replyName.trim() || !replyEmail.trim() || !replyContent.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmittingReply(true)
      
      const commentData: CreateCommentData = {
        postId,
        authorName: replyName.trim(),
        authorEmail: replyEmail.trim(),
        content: replyContent.trim(),
        parentCommentId,
      }

      const result = await createBlogComment(commentData)
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Reply submitted successfully!",
        })
        
        // Clear reply form
        setReplyContent("")
        setReplyName("")
        setReplyEmail("")
        setReplyingTo(null)
        
        // Reload comments to show the new reply (if approved)
        await loadComments()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to submit reply. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
      toast({
        title: "Error",
        description: "Failed to submit reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleLike = async (commentId: number) => {
    try {
      setLiking(commentId)
      
      const result = await likeBlogComment(commentId)
      
      if (result.success) {
        // Update the comment's like count in the local state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, likes: result.likes || comment.likes }
              : comment
          )
        )
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to like comment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error liking comment:', error)
      toast({
        title: "Error",
        description: "Failed to like comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLiking(null)
    }
  }

  const openReportDialog = (commentId: number) => {
    setReportingCommentId(commentId)
    setReportDialogOpen(true)
    // Pre-fill with current user's info if available
    setReportName(name)
    setReportEmail(email)
  }

  const handleReport = async () => {
    if (!reportingCommentId || !reportName.trim() || !reportReason) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setReporting(reportingCommentId)
      
      const finalReason = reportReason === 'other' ? reportCustomReason : reportReason
      
      const result = await reportBlogComment(
        reportingCommentId,
        reportName.trim(),
        finalReason,
        reportEmail.trim() || undefined
      )
      
      if (result.success) {
        toast({
          title: "Report Submitted",
          description: result.message || "Thank you for reporting this comment. We'll review it shortly.",
        })
        
        // Close dialog and reset form
        setReportDialogOpen(false)
        setReportReason("")
        setReportCustomReason("")
        setReportName("")
        setReportEmail("")
        setReportingCommentId(null)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to report comment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error reporting comment:', error)
      toast({
        title: "Error",
        description: "Failed to report comment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setReporting(null)
    }
  }

  if (loading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span>Comments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">Loading comments...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5 text-emerald-600" />
            <span>Comments ({comments.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-4">Leave a Comment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input 
                placeholder="Your Name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                disabled={submitting}
              />
              <Input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <Textarea
              placeholder="Share your thoughts, questions, or experiences..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="mb-4"
              required
              disabled={submitting}
            />
            <Button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post Comment'
              )}
            </Button>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            ) : (
              comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                          <Image
                         src={comment.user?.avatar || ''}
                          alt={comment.authorName}
                        fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                        <h5 className="font-semibold text-gray-900">
                          {comment.user?.name || comment.authorName}
                        </h5>
                        <span className="text-sm text-gray-500">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    <div className="flex items-center space-x-4 text-sm">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-emerald-600"
                          onClick={() => handleLike(comment.id)}
                          disabled={liking === comment.id}
                        >
                          {liking === comment.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                        <Heart className="h-4 w-4 mr-1" />
                          )}
                        {comment.likes}
                      </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-emerald-600"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                        <Reply className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-600 hover:text-red-600"
                          onClick={() => openReportDialog(comment.id)}
                        >
                        <Flag className="h-4 w-4 mr-1" />
                        Report
                      </Button>
                    </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && (
                        <form onSubmit={(e) => handleReply(e, comment.id)} className="mt-4 p-4 bg-gray-50 rounded-lg">
                          <h6 className="font-semibold text-gray-900 mb-3">Reply to {comment.authorName}</h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input 
                              placeholder="Your Name" 
                              value={replyName} 
                              onChange={(e) => setReplyName(e.target.value)} 
                              required 
                              disabled={submittingReply}
                            />
                            <Input
                              type="email"
                              placeholder="Your Email"
                              value={replyEmail}
                              onChange={(e) => setReplyEmail(e.target.value)}
                              required
                              disabled={submittingReply}
                            />
                          </div>
                          <Textarea
                            placeholder="Write your reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={3}
                            className="mb-4"
                            required
                            disabled={submittingReply}
                          />
                          <div className="flex space-x-2">
                            <Button type="submit" size="sm" disabled={submittingReply}>
                              {submittingReply ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  Posting...
                                </>
                              ) : (
                                'Post Reply'
                              )}
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setReplyingTo(null)
                                setReplyContent("")
                                setReplyName("")
                                setReplyEmail("")
                              }}
                              disabled={submittingReply}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}

                    {/* Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-4 ml-6 space-y-4 border-l-2 border-gray-200 pl-6">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              <Image
                                  src={reply.user?.avatar || ''}
                                  alt={reply.authorName}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                  <h6 className="font-semibold text-gray-900 text-sm">
                                    {reply.user?.name || reply.authorName}
                                  </h6>
                                <span className="text-xs text-gray-500">
                                    {formatCommentDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                              <div className="flex items-center space-x-3 text-xs">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-gray-600 hover:text-emerald-600 h-6 px-2"
                                    onClick={() => handleLike(reply.id)}
                                    disabled={liking === reply.id}
                                >
                                    {liking === reply.id ? (
                                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                    ) : (
                                  <Heart className="h-3 w-3 mr-1" />
                                    )}
                                  {reply.likes}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                    className="text-gray-600 hover:text-red-600 h-6 px-2"
                                    onClick={() => openReportDialog(reply.id)}
                                >
                                    <Flag className="h-3 w-3 mr-1" />
                                    Report
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Report Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report Comment</DialogTitle>
            <DialogDescription>
              Help us maintain a respectful community by reporting inappropriate content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                placeholder="Your Name" 
                value={reportName} 
                onChange={(e) => setReportName(e.target.value)} 
                required 
              />
              <Input
                type="email"
                placeholder="Your Email (optional)"
                value={reportEmail}
                onChange={(e) => setReportEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Reason for Report
              </label>
              <Select value={reportReason} onValueChange={setReportReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam or misleading content</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate or offensive content</SelectItem>
                  <SelectItem value="harassment">Harassment or bullying</SelectItem>
                  <SelectItem value="false_information">False or misleading information</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {reportReason === 'other' && (
              <Textarea
                placeholder="Please describe the issue..."
                value={reportCustomReason}
                onChange={(e) => setReportCustomReason(e.target.value)}
                rows={3}
                required
              />
            )}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setReportDialogOpen(false)}
              disabled={reporting !== null}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReport}
              disabled={reporting !== null || !reportName.trim() || !reportReason}
              className="bg-red-600 hover:bg-red-700"
            >
              {reporting !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export interface BlogComment {
  id: number
  authorName: string
  authorEmail: string
  content: string
  status: 'pending' | 'approved' | 'spam'
  likes: number
  createdAt: Date
  updatedAt: Date
  parentCommentId: number | null
  user?: {
    id: number
    name: string
    avatar: string | null
  } | null
  replies: BlogComment[]
  replyCount: number
}

export interface CreateCommentData {
  postId: number
  authorName: string
  authorEmail: string
  content: string
  parentCommentId?: number
}

// Fetch comments for a blog post
export async function getBlogComments(postId: number): Promise<BlogComment[]> {
  try {
    const response = await fetch(`/api/blog/comments?postId=${postId}`)
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments')
    }
    
    const data = await response.json()
    return data.comments || []
  } catch (error) {
    console.error('Error fetching blog comments:', error)
    return []
  }
}

// Create a new comment
export async function createBlogComment(commentData: CreateCommentData): Promise<{ success: boolean; comment?: BlogComment; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/blog/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to create comment'
      }
    }
    
    return {
      success: true,
      comment: data.comment,
      message: data.message
    }
  } catch (error) {
    console.error('Error creating comment:', error)
    return {
      success: false,
      error: 'Failed to create comment'
    }
  }
}

// Like a comment
export async function likeBlogComment(commentId: number): Promise<{ success: boolean; likes?: number; error?: string }> {
  try {
    const response = await fetch(`/api/blog/comments/${commentId}/like`, {
      method: 'POST',
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to like comment'
      }
    }
    
    return {
      success: true,
      likes: data.likes
    }
  } catch (error) {
    console.error('Error liking comment:', error)
    return {
      success: false,
      error: 'Failed to like comment'
    }
  }
}

// Report a comment
export async function reportBlogComment(
  commentId: number, 
  reporterName: string, 
  reason: string, 
  reporterEmail?: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`/api/blog/comments/${commentId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reporterName,
        reporterEmail,
        reason
      }),
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to report comment'
      }
    }
    
    return {
      success: true,
      message: data.message
    }
  } catch (error) {
    console.error('Error reporting comment:', error)
    return {
      success: false,
      error: 'Failed to report comment'
    }
  }
}

// Format comment date
export function formatCommentDate(date: Date | string): string {
  const commentDate = new Date(date)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return commentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }
} 

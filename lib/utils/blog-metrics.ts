/**
 * Utility functions for generating realistic fake blog metrics
 */

export interface BlogMetrics {
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number
}

/**
 * Generate realistic fake metrics for a blog post
 * Uses post ID and title to create consistent but varied metrics
 */
export function generateFakeBlogMetrics(postId: number, title: string, featured: boolean = false): BlogMetrics {
  // Use post ID and title length to create a seed for consistent results
  const seed = postId + title.length
  
  // Featured posts get higher metrics
  const multiplier = featured ? 1.8 : 1.0
  
  // Base views calculation (150-3500 range, higher for featured)
  const baseViews = Math.floor((200 + (seed * 67) % 2800) * multiplier)
  
  // Like rate varies between 2-12% based on engagement quality
  const likeRate = 0.02 + (seed % 100) / 1000 // 2-12%
  const baseLikes = Math.floor(baseViews * likeRate)
  
  // Comments are typically 20-40% of likes
  const commentRate = 0.2 + (seed % 20) / 100 // 20-40%
  const baseComments = Math.floor(baseLikes * commentRate)
  
  // Shares are typically 5-15% of likes
  const shareRate = 0.05 + (seed % 10) / 100 // 5-15%
  const baseShares = Math.floor(baseLikes * shareRate)
  
  // Add some random variance to make it more realistic
  const variance = (Math.random() - 0.5) * 0.2 // ±10% variance
  
  return {
    viewCount: Math.max(50, Math.floor(baseViews * (1 + variance))),
    likeCount: Math.max(1, Math.floor(baseLikes * (1 + variance))),
    commentCount: Math.max(0, Math.floor(baseComments * (1 + variance))),
    shareCount: Math.max(0, Math.floor(baseShares * (1 + variance)))
  }
}

/**
 * Format view count for display (e.g., 1.2K, 15K, 1.1M)
 */
export function formatViewCount(count: number): string {
  if (count < 1000) {
    return count.toString()
  } else if (count < 1000000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  } else {
    return (count / 1000000).toFixed(1).replace(/\.0$/, '') + 'M'
  }
}

/**
 * Format like count for display
 */
export function formatLikeCount(count: number): string {
  if (count < 1000) {
    return count.toString()
  } else {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
  }
}

/**
 * Get engagement level based on view-to-like ratio
 */
export function getEngagementLevel(views: number, likes: number): 'low' | 'medium' | 'high' {
  const ratio = likes / views
  if (ratio > 0.08) return 'high'      // > 8% like rate
  if (ratio > 0.04) return 'medium'    // 4-8% like rate
  return 'low'                         // < 4% like rate
}

/**
 * Generate trending indicator based on recent metrics
 */
export function getTrendingStatus(metrics: BlogMetrics, publishedDaysAgo: number): boolean {
  // Consider trending if high engagement in recent days
  const dailyViews = metrics.viewCount / Math.max(1, publishedDaysAgo)
  const dailyLikes = metrics.likeCount / Math.max(1, publishedDaysAgo)
  
  return publishedDaysAgo <= 7 && (dailyViews > 200 || dailyLikes > 10)
}

/**
 * Generate social proof text
 */
export function generateSocialProofText(metrics: BlogMetrics): string {
  const { viewCount, likeCount, commentCount } = metrics
  
  if (viewCount > 10000) {
    return `${formatViewCount(viewCount)} people found this helpful`
  } else if (likeCount > 100) {
    return `${formatLikeCount(likeCount)} readers loved this article`
  } else if (commentCount > 10) {
    return `Join ${commentCount} readers in the discussion`
  } else {
    return `${formatViewCount(viewCount)} views and counting`
  }
}

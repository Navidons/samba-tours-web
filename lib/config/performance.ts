/**
 * Performance optimization configuration for the blog system
 */

export const BLOG_PERFORMANCE_CONFIG = {
  // API request limits
  DEFAULT_POST_LIMIT: 12,
  MAX_POST_LIMIT: 50,
  FEATURED_POSTS_LIMIT: 3,
  POPULAR_POSTS_LIMIT: 3,
  
  // Caching settings
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes in milliseconds
  STALE_WHILE_REVALIDATE: 10 * 60 * 1000, // 10 minutes
  
  // Database optimization
  MAX_CONCURRENT_QUERIES: 3,
  QUERY_TIMEOUT: 10000, // 10 seconds
  
  // Image optimization
  THUMBNAIL_QUALITY: 75,
  THUMBNAIL_WIDTH: 400,
  THUMBNAIL_HEIGHT: 250,
  
  // Search optimization
  MIN_SEARCH_LENGTH: 2,
  MAX_SEARCH_RESULTS: 100,
  
  // Pagination
  POSTS_PER_PAGE: 12,
  MAX_PAGES: 50
}

/**
 * Database query optimization helpers
 */
export const DB_OPTIMIZATION = {
  // Select only necessary fields for list views
  POST_LIST_FIELDS: {
    id: true,
    title: true,
    slug: true,
    excerpt: true,
    status: true,
    publishDate: true,
    readTimeMinutes: true,
    viewCount: true,
    likeCount: true,
    commentCount: true,
    featured: true,
    thumbnailData: true,
    thumbnailType: true,
    createdAt: true,
    updatedAt: true
  },
  
  // Optimized includes for different use cases
  INCLUDES: {
    minimal: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      }
    },
    standard: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true
        }
      },
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          bio: true
        }
      },
      tags: {
        select: {
          tag: {
            select: {
              id: true,
              name: true,
              slug: true,
              color: true
            }
          }
        }
      }
    }
  }
}

/**
 * Performance monitoring thresholds
 */
export const PERFORMANCE_THRESHOLDS = {
  // API response time thresholds (in milliseconds)
  API_RESPONSE_TIME: {
    EXCELLENT: 200,
    GOOD: 500,
    ACCEPTABLE: 1000,
    POOR: 2000
  },
  
  // Database query time thresholds
  DB_QUERY_TIME: {
    EXCELLENT: 50,
    GOOD: 100,
    ACCEPTABLE: 300,
    POOR: 1000
  },
  
  // Page load time thresholds
  PAGE_LOAD_TIME: {
    EXCELLENT: 1000,
    GOOD: 2000,
    ACCEPTABLE: 4000,
    POOR: 8000
  }
}

/**
 * Get performance rating based on metrics
 */
export function getPerformanceRating(value: number, thresholds: Record<string, number>): string {
  if (value <= thresholds.EXCELLENT) return 'excellent'
  if (value <= thresholds.GOOD) return 'good'
  if (value <= thresholds.ACCEPTABLE) return 'acceptable'
  return 'poor'
}

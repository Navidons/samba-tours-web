/**
 * Utility functions for formatting numbers in a user-friendly way
 */

/**
 * Format numbers to display with K, M, B suffixes for large numbers
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string (e.g., "1.2K", "1.5M")
 */
export function formatNumber(num: number, decimals: number = 1): string {
  if (num === 0) return '0'
  
  const abs = Math.abs(num)
  
  if (abs >= 1000000000) {
    return (num / 1000000000).toFixed(decimals).replace(/\.0$/, '') + 'B'
  }
  
  if (abs >= 1000000) {
    return (num / 1000000).toFixed(decimals).replace(/\.0$/, '') + 'M'
  }
  
  if (abs >= 1000) {
    return (num / 1000).toFixed(decimals).replace(/\.0$/, '') + 'K'
  }
  
  return num.toString()
}

/**
 * Format like counts specifically (always show K for numbers >= 1000)
 * @param likes - Number of likes
 * @returns Formatted string (e.g., "1.2K", "856")
 */
export function formatLikes(likes: number): string {
  return formatNumber(likes, 1)
}

/**
 * Format view counts specifically 
 * @param views - Number of views
 * @returns Formatted string (e.g., "12.5K views", "856 views")
 */
export function formatViews(views: number): string {
  const formatted = formatNumber(views, 1)
  return `${formatted} view${views === 1 ? '' : 's'}`
}

/**
 * Format comment counts
 * @param comments - Number of comments  
 * @returns Formatted string (e.g., "1.2K", "23")
 */
export function formatComments(comments: number): string {
  return formatNumber(comments, 0) // Comments typically don't need decimals
}

/**
 * Format social share counts
 * @param shares - Number of shares
 * @returns Formatted string (e.g., "1.2K", "456")
 */
export function formatShares(shares: number): string {
  return formatNumber(shares, 1)
}

/**
 * Format any engagement metric consistently
 * @param count - The count to format
 * @param type - Type of metric for context
 * @returns Formatted string
 */
export function formatEngagement(count: number, type: 'likes' | 'views' | 'comments' | 'shares' | 'generic' = 'generic'): string {
  switch (type) {
    case 'likes':
      return formatLikes(count)
    case 'views':
      return formatViews(count)
    case 'comments':
      return formatComments(count)
    case 'shares':
      return formatShares(count)
    default:
      return formatNumber(count)
  }
}

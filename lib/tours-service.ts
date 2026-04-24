import { cache } from 'react'
import { headers } from 'next/headers'

// Helper to get base URL for API calls
export async function getBaseUrl() {
  // Get host from headers when running on server
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  
  // For development, always use HTTP to avoid SSL issues
  if (process.env.NODE_ENV === 'development') {
    return `http://${host}`
  }
  
  // For production, use HTTPS
  return `https://${host}`
}

interface TourParams {
  page?: number
  limit?: number
  sortBy?: string
  search?: string
  categories?: string[]
  difficulties?: string[]
  destinations?: string[]
  durations?: string[]
  minPrice?: number
  maxPrice?: number
}

export const getTours = cache(async (params: TourParams = {}) => {
  const searchParams = new URLSearchParams()
  
  // Add params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v))
    } else if (value !== undefined) {
      searchParams.append(key, value.toString())
    }
  })

  const baseUrl = await getBaseUrl()
  const response = await fetch(`${baseUrl}/api/tours?${searchParams.toString()}`)
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch tours')
  }

  return data
})

export const getTour = cache(async (slug: string) => {
  const baseUrl = await getBaseUrl()
  const response = await fetch(`${baseUrl}/api/tours/${slug}`)
  const data = await response.json()

  if (!data.success) {
    return null
  }

  return data.tour
})

export const getTourReviews = cache(async (slug: string) => {
  const baseUrl = await getBaseUrl()
  const response = await fetch(`${baseUrl}/api/tours/${slug}/reviews`)
  const data = await response.json()

  if (!data.success) {
    return { reviews: [], pagination: { total: 0 } }
  }

  return data
})

export const getCategories = cache(async () => {
  const baseUrl = await getBaseUrl()
  const response = await fetch(`${baseUrl}/api/tours/categories`)
  const data = await response.json()

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch categories')
  }

  return data.categories
}) 

// Core data types for the application
export interface Tour {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  price: number
  originalPrice?: number
  duration: string
  groupSize: string
  difficulty: "Easy" | "Moderate" | "Challenging"
  category: string
  featured: boolean
  popular: boolean
  isNew: boolean
  rating: number
  reviewCount: number
  images: string[]
  highlights: string[]
  included: string[]
  excluded: string[]
  itinerary: ItineraryDay[]
  location: Location
  bestTime: string[]
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
}

export interface Location {
  country: string
  region: string
  coordinates: {
    lat: number
    lng: number
  }
}

export interface Booking {
  id: string
  tourId: string
  tourTitle: string
  customerName: string
  customerEmail: string
  customerPhone: string
  startDate: string
  endDate: string
  guests: number
  totalAmount: number
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
  specialRequests?: string
}

export interface BookingFormData {
  tourId: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  startDate: string
  guests: number
  specialRequests?: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  authorImage: string
  publishedAt: string
  category: string
  tags: string[]
  image: string
  readTime: number
}

export interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  tourInterest?: string
}

export interface NewsletterSubscription {
  email: string
  name?: string
  interests?: string[]
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "customer"
  createdAt: string
}

export interface TourCategory {
  id: string
  name: string
  slug: string
  description: string
  image: string
  tourCount: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

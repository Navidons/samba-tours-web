// @/lib/admin-mock-data.ts

/**
 * This file contains all the mock data for the admin panel.
 * It replaces database calls to allow for front-end development
 * without a live database connection.
 */

import type { Tour } from "./types"

// Mock Data for /admin/dashboard
export const mockAdminStats = {
  totalRevenue: { value: 125430, change: 12.5 },
  totalBookings: { value: 1234, change: 8.2 },
  totalCustomers: { value: 845, change: 15.3 },
  conversionRate: { value: 3.2, change: -0.5 },
}

export const mockRecentBookings = [
  {
    id: "BK001",
    customerName: "Sarah Johnson",
    tourName: "Gorilla Trekking Adventure",
    date: "2024-07-15",
    status: "confirmed" as const,
    amount: 1200,
  },
  {
    id: "BK002",
    customerName: "Michael Chen",
    tourName: "Murchison Falls Safari",
    date: "2024-07-18",
    status: "pending" as const,
    amount: 800,
  },
  {
    id: "BK003",
    customerName: "Emma Thompson",
    tourName: "Queen Elizabeth Wildlife Tour",
    date: "2024-07-20",
    status: "confirmed" as const,
    amount: 950,
  },
  {
    id: "BK004",
    customerName: "David Wilson",
    tourName: "Cultural Heritage Experience",
    date: "2024-07-22",
    status: "cancelled" as const,
    amount: 650,
  },
]

// Mock Data for /admin/tours
export const mockTours: Tour[] = [
  {
    id: "1",
    title: "Gorilla Trekking Adventure",
    slug: "gorilla-trekking-adventure",
    category: { id: "1", name: "Wildlife" },
    duration: "3 Days",
    price: 1200,
    rating: 4.9,
    review_count: 120,
    status: "active",
    featured_image: "/placeholder.svg?height=200&width=300",
    location: "Bwindi Impenetrable National Park",
    description: "An unforgettable journey to see the majestic mountain gorillas in their natural habitat.",
    short_description: "Track mountain gorillas in Bwindi.",
    images: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
  },
  {
    id: "2",
    title: "Murchison Falls Safari",
    slug: "murchison-falls-safari",
    category: { id: "2", name: "Safari" },
    duration: "4 Days",
    price: 800,
    rating: 4.7,
    review_count: 85,
    status: "active",
    featured_image: "/placeholder.svg?height=200&width=300",
    location: "Murchison Falls National Park",
    description: "Experience the powerful Murchison Falls and abundant wildlife on a classic safari.",
    short_description: "Safari at the world's most powerful waterfall.",
    images: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
  },
  {
    id: "3",
    title: "Queen Elizabeth Wildlife Tour",
    slug: "queen-elizabeth-wildlife-tour",
    category: { id: "1", name: "Wildlife" },
    duration: "5 Days",
    price: 950,
    rating: 4.8,
    review_count: 98,
    status: "draft",
    featured_image: "/placeholder.svg?height=200&width=300",
    location: "Queen Elizabeth National Park",
    description: "Discover diverse ecosystems, from savanna to forests, and see the famous tree-climbing lions.",
    short_description: "See tree-climbing lions and diverse wildlife.",
    images: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
  },
]

// Mock Data for /admin/bookings
export const mockBookings = [
  {
    id: "BK001",
    customerName: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-0123",
    tourName: "Gorilla Trekking Adventure",
    startDate: "2024-07-15",
    endDate: "2024-07-18",
    guests: 2,
    status: "confirmed" as const,
    amount: 2400,
    paymentStatus: "paid" as const,
    bookingDate: "2024-06-15",
  },
  {
    id: "BK002",
    customerName: "Michael Chen",
    email: "michael@example.com",
    phone: "+1-555-0124",
    tourName: "Murchison Falls Safari",
    startDate: "2024-07-20",
    endDate: "2024-07-24",
    guests: 4,
    status: "pending" as const,
    amount: 3200,
    paymentStatus: "pending" as const,
    bookingDate: "2024-06-18",
  },
  {
    id: "BK003",
    customerName: "Emma Thompson",
    email: "emma@example.com",
    phone: "+1-555-0125",
    tourName: "Queen Elizabeth Wildlife Tour",
    startDate: "2024-07-25",
    endDate: "2024-07-30",
    guests: 2,
    status: "completed" as const,
    amount: 1900,
    paymentStatus: "paid" as const,
    bookingDate: "2024-06-20",
  },
  {
    id: "BK004",
    customerName: "James Brown",
    email: "james@example.com",
    phone: "+1-555-0126",
    tourName: "Gorilla Trekking Adventure",
    startDate: "2024-08-01",
    endDate: "2024-08-04",
    guests: 1,
    status: "cancelled" as const,
    amount: 1200,
    paymentStatus: "refunded" as const,
    bookingDate: "2024-06-22",
  },
]

// Mock Data for /admin/customers
export const mockCustomers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah@example.com",
    phone: "+1-555-0123",
    country: "United States",
    totalBookings: 3,
    totalSpent: 4200,
    lastBooking: "2024-06-15",
    status: "active" as const,
    joinDate: "2023-08-15",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael@example.com",
    phone: "+1-555-0124",
    country: "Canada",
    totalBookings: 2,
    totalSpent: 2800,
    lastBooking: "2024-06-18",
    status: "active" as const,
    joinDate: "2023-11-22",
    avatar: "/placeholder-user.jpg",
  },
  {
    id: 3,
    name: "David Wilson",
    email: "david@example.com",
    phone: "+61-2-1234-5678",
    country: "Australia",
    totalBookings: 0,
    totalSpent: 0,
    lastBooking: "Never",
    status: "inactive" as const,
    joinDate: "2024-03-05",
    avatar: "/placeholder-user.jpg",
  },
]

// Mock Data for /admin/gallery
export const mockGalleries = [
  {
    id: 1,
    name: "Gorilla Trekking",
    category: "Wildlife",
    images: 24,
    featured: true,
    lastUpdated: "2024-06-15",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    name: "Murchison Falls",
    category: "Safari",
    images: 18,
    featured: false,
    lastUpdated: "2024-06-12",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 3,
    name: "Cultural Experiences",
    category: "Cultural",
    images: 32,
    featured: true,
    lastUpdated: "2024-06-10",
    thumbnail: "/placeholder.svg?height=200&width=300",
  },
]

// Mock Data for /admin/blog
export const mockPosts = [
  {
    id: 1,
    title: "Ultimate Guide to Gorilla Trekking in Uganda",
    category: "Travel Tips",
    author: "John Doe",
    status: "published" as const,
    publishDate: "2024-06-15",
    views: 1247,
    comments: 23,
    featured: true,
    thumbnail: "/placeholder.svg?height=100&width=150",
  },
  {
    id: 2,
    title: "Best Time to Visit Murchison Falls National Park",
    category: "Destinations",
    author: "Jane Smith",
    status: "published" as const,
    publishDate: "2024-06-12",
    views: 892,
    comments: 15,
    featured: false,
    thumbnail: "/placeholder.svg?height=100&width=150",
  },
  {
    id: 3,
    title: "Cultural Experiences in Uganda: A Complete Guide",
    category: "Culture",
    author: "Mike Johnson",
    status: "draft" as const,
    publishDate: null,
    views: 0,
    comments: 0,
    featured: false,
    thumbnail: "/placeholder.svg?height=100&width=150",
  },
]

// Mock Data for /admin/users
export const mockAdminUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@sambatours.com",
    phone: "+256 123 456 789",
    role: "Super Admin",
    status: "active" as const,
    lastLogin: "2024-06-21",
    avatar: "/placeholder-user.jpg",
    joinDate: "2023-01-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@sambatours.com",
    phone: "+256 123 456 790",
    role: "Tour Manager",
    status: "active" as const,
    lastLogin: "2024-06-20",
    avatar: "/placeholder-user.jpg",
    joinDate: "2023-03-20",
  },
  {
    id: 3,
    name: "Sarah Wilson",
    email: "sarah@sambatours.com",
    phone: "+256 123 456 792",
    role: "Customer Support",
    status: "inactive" as const,
    lastLogin: "2024-06-15",
    avatar: "/placeholder-user.jpg",
    joinDate: "2023-09-05",
  },
]

export const mockRoles = [
  {
    name: "Super Admin",
    description: "Full system access",
    color: "bg-red-100 text-red-800",
    permissions: "All permissions",
  },
  {
    name: "Tour Manager",
    description: "Manage tours and bookings",
    color: "bg-blue-100 text-blue-800",
    permissions: "Tours, Bookings, Customers",
  },
  {
    name: "Content Manager",
    description: "Manage content and media",
    color: "bg-green-100 text-green-800",
    permissions: "Blog, Gallery, Content",
  },
]

// Mock Data for /admin/contact
export const mockContactMessages = [
  {
    id: 1,
    name: "Alice Williams",
    email: "alice@example.com",
    subject: "Inquiry about Gorilla Trekking",
    message:
      "Hello, I would like to know more about the physical requirements for the gorilla trekking tour. Thank you.",
    receivedAt: "2024-06-21T10:30:00Z",
    status: "new" as const,
  },
  {
    id: 2,
    name: "Bob Miller",
    email: "bob@example.com",
    subject: "Question about payment",
    message: "Can I pay in installments for the Murchison Falls Safari?",
    receivedAt: "2024-06-21T09:15:00Z",
    status: "read" as const,
  },
  {
    id: 3,
    name: "Charlie Davis",
    email: "charlie@example.com",
    subject: "Feedback on my recent tour",
    message: "The Queen Elizabeth tour was amazing! Our guide was fantastic. I've left a full review on the site.",
    receivedAt: "2024-06-20T14:00:00Z",
    status: "archived" as const,
  },
]

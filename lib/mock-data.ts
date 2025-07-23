// Mock data for admin dashboard
export interface MockTour {
  id: string
  title: string
  slug: string
  description: string
  short_description: string
  price: number
  duration: string
  max_group_size: number
  difficulty_level: string
  location: string
  featured_image: string
  images: string[]
  status: "active" | "inactive" | "draft"
  rating: number
  review_count: number
  category: string
  created_at: string
  updated_at: string
}

export interface MockBooking {
  id: string
  customer_name: string
  customer_email: string
  tour_title: string
  tour_id: string
  total_amount: number
  status: "confirmed" | "pending" | "cancelled"
  booking_date: string
  travel_date: string
  guests: number
  created_at: string
}

export interface MockCustomer {
  id: string
  name: string
  email: string
  phone: string
  total_bookings: number
  total_spent: number
  last_booking: string
  status: "active" | "inactive"
  created_at: string
}

// Mock tours data
export const mockTours: MockTour[] = [
  {
    id: "1",
    title: "Murchison Falls Safari Adventure",
    slug: "murchison-falls-safari",
    description:
      "Experience the power of Murchison Falls and encounter diverse wildlife in Uganda's largest national park.",
    short_description: "3-day safari adventure to Murchison Falls National Park",
    price: 1200,
    duration: "3 Days",
    max_group_size: 8,
    difficulty_level: "Easy",
    location: "Murchison Falls National Park",
    featured_image: "/images/murchison-falls-hero.jpg",
    images: ["/images/murchison-falls-hero.jpg", "/images/murchison-falls-spectacular.jpg"],
    status: "active",
    rating: 4.8,
    review_count: 124,
    category: "Wildlife Safari",
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-20T14:30:00Z",
  },
  {
    id: "2",
    title: "Gorilla Trekking Experience",
    slug: "gorilla-trekking-bwindi",
    description: "Trek through the misty forests of Bwindi to encounter mountain gorillas in their natural habitat.",
    short_description: "Once-in-a-lifetime gorilla trekking adventure",
    price: 2500,
    duration: "4 Days",
    max_group_size: 6,
    difficulty_level: "Moderate",
    location: "Bwindi Impenetrable Forest",
    featured_image: "/placeholder.svg?height=400&width=600",
    images: ["/placeholder.svg?height=400&width=600"],
    status: "active",
    rating: 4.9,
    review_count: 89,
    category: "Gorilla Trekking",
    created_at: "2024-01-10T09:00:00Z",
    updated_at: "2024-01-18T16:45:00Z",
  },
  {
    id: "3",
    title: "Queen Elizabeth Wildlife Safari",
    slug: "queen-elizabeth-safari",
    description: "Explore the diverse ecosystems of Queen Elizabeth National Park with game drives and boat safaris.",
    short_description: "Comprehensive wildlife safari experience",
    price: 1800,
    duration: "5 Days",
    max_group_size: 10,
    difficulty_level: "Easy",
    location: "Queen Elizabeth National Park",
    featured_image: "/placeholder.svg?height=400&width=600",
    images: ["/placeholder.svg?height=400&width=600"],
    status: "active",
    rating: 4.7,
    review_count: 156,
    category: "Wildlife Safari",
    created_at: "2024-01-05T11:30:00Z",
    updated_at: "2024-01-22T13:15:00Z",
  },
]

// Mock bookings data
export const mockBookings: MockBooking[] = [
  {
    id: "b1",
    customer_name: "John Smith",
    customer_email: "john.smith@email.com",
    tour_title: "Murchison Falls Safari Adventure",
    tour_id: "1",
    total_amount: 1200,
    status: "confirmed",
    booking_date: "2024-01-20T10:00:00Z",
    travel_date: "2024-02-15T08:00:00Z",
    guests: 2,
    created_at: "2024-01-20T10:00:00Z",
  },
  {
    id: "b2",
    customer_name: "Sarah Johnson",
    customer_email: "sarah.j@email.com",
    tour_title: "Gorilla Trekking Experience",
    tour_id: "2",
    total_amount: 2500,
    status: "pending",
    booking_date: "2024-01-22T14:30:00Z",
    travel_date: "2024-03-10T07:00:00Z",
    guests: 1,
    created_at: "2024-01-22T14:30:00Z",
  },
  {
    id: "b3",
    customer_name: "Mike Wilson",
    customer_email: "mike.wilson@email.com",
    tour_title: "Queen Elizabeth Wildlife Safari",
    tour_id: "3",
    total_amount: 1800,
    status: "confirmed",
    booking_date: "2024-01-18T16:45:00Z",
    travel_date: "2024-02-28T09:00:00Z",
    guests: 3,
    created_at: "2024-01-18T16:45:00Z",
  },
]

// Mock customers data
export const mockCustomers: MockCustomer[] = [
  {
    id: "c1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1-555-0123",
    total_bookings: 3,
    total_spent: 4200,
    last_booking: "2024-01-20T10:00:00Z",
    status: "active",
    created_at: "2023-12-01T10:00:00Z",
  },
  {
    id: "c2",
    name: "Sarah Johnson",
    email: "sarah.j@email.com",
    phone: "+1-555-0124",
    total_bookings: 1,
    total_spent: 2500,
    last_booking: "2024-01-22T14:30:00Z",
    status: "active",
    created_at: "2024-01-15T09:30:00Z",
  },
  {
    id: "c3",
    name: "Mike Wilson",
    email: "mike.wilson@email.com",
    phone: "+1-555-0125",
    total_bookings: 2,
    total_spent: 3600,
    last_booking: "2024-01-18T16:45:00Z",
    status: "active",
    created_at: "2023-11-20T14:15:00Z",
  },
]

// Mock admin stats
export const getMockAdminStats = () => {
  const totalRevenue = mockBookings.reduce((sum, booking) => sum + booking.total_amount, 0)
  const totalBookings = mockBookings.length
  const confirmedBookings = mockBookings.filter((b) => b.status === "confirmed").length
  const pendingBookings = mockBookings.filter((b) => b.status === "pending").length
  const totalCustomers = mockCustomers.length
  const activeToursCount = mockTours.filter((t) => t.status === "active").length
  const featuredToursCount = mockTours.filter((t) => t.rating >= 4.5).length

  return {
    totalRevenue,
    totalBookings,
    confirmedBookings,
    pendingBookings,
    totalCustomers,
    conversionRate: 85.5,
    averageBookingValue: totalRevenue / totalBookings,
    recentBookings: mockBookings.slice(0, 5),
    tourCount: mockTours.length,
    activeToursCount,
    featuredToursCount,
    monthlyRevenue: [
      { month: "Jan", revenue: 15000 },
      { month: "Feb", revenue: 18000 },
      { month: "Mar", revenue: 22000 },
      { month: "Apr", revenue: 19000 },
      { month: "May", revenue: 25000 },
      { month: "Jun", revenue: 28000 },
    ],
  }
}

// Mock stats data
export const mockStats = {
  totalBookings: 1247,
  totalRevenue: 89500,
  totalCustomers: 892,
  activeTours: 24,
  monthlyGrowth: 12.5,
  customerSatisfaction: 4.8,
}

// Mock recent bookings data
export const mockRecentBookings = [
  {
    id: "1",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    customerAvatar: "/placeholder.svg?height=40&width=40&text=JS",
    tourName: "Murchison Falls Safari",
    bookingDate: "2024-01-15",
    status: "confirmed",
    amount: 1200,
  },
  {
    id: "2",
    customerName: "Sarah Johnson",
    customerEmail: "sarah@example.com",
    customerAvatar: "/placeholder.svg?height=40&width=40&text=SJ",
    tourName: "Gorilla Trekking Adventure",
    bookingDate: "2024-01-14",
    status: "pending",
    amount: 2500,
  },
  {
    id: "3",
    customerName: "Mike Wilson",
    customerEmail: "mike@example.com",
    customerAvatar: "/placeholder.svg?height=40&width=40&text=MW",
    tourName: "Queen Elizabeth Wildlife Tour",
    bookingDate: "2024-01-13",
    status: "confirmed",
    amount: 1800,
  },
]

// Mock quick actions data
export const mockQuickActions = [
  {
    title: "Add New Tour",
    description: "Create a new tour package",
    href: "/admin/tours/new",
    icon: "plus",
  },
  {
    title: "View Bookings",
    description: "Manage customer bookings",
    href: "/admin/bookings",
    icon: "calendar",
  },
  {
    title: "Customer Support",
    description: "Handle customer inquiries",
    href: "/admin/contact",
    icon: "headphones",
  },
  {
    title: "Generate Report",
    description: "Create business reports",
    href: "/admin/reports",
    icon: "fileText",
  },
]

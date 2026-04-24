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
  bestTime: string
  physicalRequirements: string
  whatToBring: string[]
  tags: string[]
  createdAt?: string
  updatedAt?: string
}

export interface ItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation: string
  meals: string[]
}

export interface Location {
  country: string
  region: string
  coordinates: {
    lat: number
    lng: number
  }
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
  featured?: boolean
}

export interface GalleryImage {
  id: string
  url: string
  title: string
  description: string
  category: string
  location: string
  photographer: string
  tags: string[]
}

// Mock Tours Data
const tours: Tour[] = [
  {
    id: "1",
    title: "Gorilla Trekking Adventure",
    slug: "gorilla-trekking-adventure",
    description:
      "Experience the thrill of meeting mountain gorillas in their natural habitat in Bwindi Impenetrable Forest. This once-in-a-lifetime adventure takes you deep into Uganda's pristine rainforest for an unforgettable encounter with these magnificent creatures.",
    shortDescription: "Meet mountain gorillas in Bwindi Forest on this incredible 3-day adventure.",
    price: 1200,
    originalPrice: 1400,
    duration: "3 Days",
    groupSize: "8 People",
    difficulty: "Moderate",
    category: "Gorilla Trekking",
    featured: true,
    popular: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 127,
    images: [
      "/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg",
      "/photos/uganda-wildlife.jpg",
      "/photos/fort-portal-crater-hero.jpg",
      "/photos/queen-elizabeth-national-park-uganda.jpg",
      "/photos/african-nile.jpg",
      "/photos/kampala-city-ug.jpg",
    ],
    highlights: ["Mountain Gorillas", "Forest Hiking", "Local Communities", "Conservation Experience"],
    included: [
      "Gorilla trekking permits",
      "Professional guide",
      "Transportation in 4WD vehicle",
      "Accommodation (2 nights)",
      "All meals as specified",
      "Bottled water",
      "Park entrance fees",
      "Community visit",
    ],
    excluded: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Tips and gratuities",
      "Alcoholic beverages",
      "Optional activities",
      "Second gorilla trek",
    ],
    itinerary: [
      {
        day: 1,
        title: "Arrival and Transfer to Bwindi",
        description:
          "Pick up from Kampala/Entebbe and scenic drive to Bwindi Impenetrable National Park. Stop at the Equator for photos and lunch in Mbarara. Evening arrival and briefing about gorilla trekking.",
        activities: ["Airport pickup", "Equator crossing", "Scenic drive", "Evening briefing"],
        accommodation: "Bwindi Lodge",
        meals: ["Lunch", "Dinner"],
      },
      {
        day: 2,
        title: "Gorilla Trekking Experience",
        description:
          "Early morning briefing at park headquarters followed by the gorilla trekking adventure. Spend one magical hour with a gorilla family in their natural habitat. Afternoon community visit to Batwa people.",
        activities: ["Gorilla trekking", "Photography", "Community visit", "Cultural experience"],
        accommodation: "Bwindi Lodge",
        meals: ["Breakfast", "Packed lunch", "Dinner"],
      },
      {
        day: 3,
        title: "Return to Kampala",
        description:
          "Morning nature walk around the lodge or optional second gorilla trek (additional cost). Depart for Kampala with lunch en route. Evening arrival in Kampala.",
        activities: ["Nature walk", "Return journey", "Shopping stop"],
        accommodation: "End of tour",
        meals: ["Breakfast", "Lunch"],
      },
    ],
    location: {
      country: "Uganda",
      region: "Bwindi Forest",
      coordinates: { lat: -1.0232, lng: 29.6755 },
    },
    bestTime: "Year-round, but dry seasons (June-August, December-February) offer easier trekking conditions",
    physicalRequirements:
      "Moderate fitness level required. Trekking can involve 1-8 hours of hiking through dense forest terrain.",
    whatToBring: [
      "Waterproof hiking boots",
      "Long-sleeved shirts and pants",
      "Rain jacket",
      "Gardening gloves",
      "Camera with extra batteries",
      "Insect repellent",
      "Personal medications",
    ],
    tags: ["gorillas", "wildlife", "trekking", "conservation"],
  },
  {
    id: "2",
    title: "Murchison Falls Safari",
    slug: "murchison-falls-safari",
    description:
      "Witness the power of the Nile at Murchison Falls and spot the Big Five on thrilling game drives. This comprehensive safari experience combines wildlife viewing, boat cruises, and the spectacular Murchison Falls.",
    shortDescription: "Experience the Big Five and mighty Murchison Falls on this 4-day safari adventure.",
    price: 800,
    originalPrice: 950,
    duration: "4 Days",
    groupSize: "12 People",
    difficulty: "Easy",
    category: "Wildlife Safari",
    featured: true,
    popular: false,
    isNew: false,
    rating: 4.8,
    reviewCount: 89,
    images: [
      "/photos/african-nile.jpg",
      "/photos/nile-crocodiles.jpg",
      "/photos/river-nile-jinja-hero.jpg",
      "/photos/the-source-of-nile-hero.jpg",
      "/photos/queen-elizabeth-national-park-uganda.jpg",
      "/photos/uganda-wildlife.jpg",
    ],
    highlights: ["Big Five", "Nile River", "Boat Safari", "Murchison Falls"],
    included: [
      "Park entrance fees",
      "Game drives",
      "Boat cruise",
      "Professional guide",
      "Transportation",
      "Accommodation (3 nights)",
      "All meals as specified",
      "Rhino tracking",
    ],
    excluded: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Tips and gratuities",
      "Alcoholic beverages",
      "Optional activities",
    ],
    itinerary: [
      {
        day: 1,
        title: "Transfer to Murchison Falls",
        description:
          "Depart Kampala for Murchison Falls National Park. Stop at Ziwa Rhino Sanctuary for rhino tracking. Continue to the park with lunch en route. Evening game drive.",
        activities: ["Rhino tracking", "Game drive", "Park entry"],
        accommodation: "Paraa Safari Lodge",
        meals: ["Lunch", "Dinner"],
      },
      {
        day: 2,
        title: "Game Drive and Boat Safari",
        description:
          "Early morning game drive in the northern sector. Afternoon boat cruise to the base of Murchison Falls. Spot hippos, crocodiles, and various bird species along the Nile.",
        activities: ["Morning game drive", "Boat cruise", "Wildlife viewing", "Photography"],
        accommodation: "Paraa Safari Lodge",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 3,
        title: "Top of the Falls and Game Drive",
        description:
          "Visit the top of Murchison Falls for spectacular views. Afternoon game drive in different sectors of the park. Evening relaxation at the lodge.",
        activities: ["Falls viewing", "Game drive", "Bird watching"],
        accommodation: "Paraa Safari Lodge",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 4,
        title: "Return to Kampala",
        description:
          "Morning game drive en route to park exit. Stop for lunch and shopping in Masindi town. Arrive in Kampala in the evening.",
        activities: ["Final game drive", "Shopping", "Return journey"],
        accommodation: "End of tour",
        meals: ["Breakfast", "Lunch"],
      },
    ],
    location: {
      country: "Uganda",
      region: "Murchison Falls NP",
      coordinates: { lat: 2.2833, lng: 31.7167 },
    },
    bestTime: "Dry seasons (December-February, June-September) for best wildlife viewing",
    physicalRequirements: "Easy - suitable for all fitness levels. Minimal walking required.",
    whatToBring: [
      "Comfortable safari clothing",
      "Sun hat and sunglasses",
      "Sunscreen",
      "Camera with zoom lens",
      "Binoculars",
      "Insect repellent",
      "Personal medications",
    ],
    tags: ["safari", "wildlife", "big five", "nile"],
  },
  {
    id: "3",
    title: "Queen Elizabeth Wildlife Tour",
    slug: "queen-elizabeth-wildlife-tour",
    description:
      "Explore diverse ecosystems and spot tree-climbing lions in Uganda's most popular national park. This comprehensive tour showcases the incredible biodiversity of Queen Elizabeth National Park.",
    shortDescription: "Discover tree-climbing lions and diverse wildlife in Queen Elizabeth National Park.",
    price: 950,
    originalPrice: 1100,
    duration: "5 Days",
    groupSize: "10 People",
    difficulty: "Easy",
    category: "Wildlife Safari",
    featured: false,
    popular: true,
    isNew: false,
    rating: 4.7,
    reviewCount: 156,
    images: [
      "/photos/queen-elizabeth-national-park-uganda.jpg",
      "/photos/queen-elizabeth-national-park-ug-kasese-hero.jpg",
      "/photos/uganda-wildlife.jpg",
      "/photos/fort-portal-crater-hero.jpg",
      "/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg",
      "/photos/giraffe-uganda-savana-hero.jpg",
    ],
    highlights: ["Tree-climbing Lions", "Kazinga Channel", "Crater Lakes", "Chimpanzee Tracking"],
    included: [
      "Park entrance fees",
      "Game drives",
      "Boat cruise on Kazinga Channel",
      "Chimpanzee tracking permit",
      "Professional guide",
      "Transportation in 4WD vehicle",
      "Accommodation (4 nights)",
      "All meals as specified",
      "Crater lakes tour",
    ],
    excluded: [
      "International flights",
      "Visa fees",
      "Travel insurance",
      "Personal expenses",
      "Tips and gratuities",
      "Alcoholic beverages",
      "Optional activities",
      "Souvenirs",
    ],
    itinerary: [
      {
        day: 1,
        title: "Kampala to Queen Elizabeth",
        description:
          "Depart Kampala for Queen Elizabeth National Park. Stop at the Equator for photos and experiments. Lunch in Mbarara town. Afternoon arrival and evening game drive.",
        activities: ["Equator visit", "Scenic drive", "Evening game drive"],
        accommodation: "Mweya Safari Lodge",
        meals: ["Lunch", "Dinner"],
      },
      {
        day: 2,
        title: "Game Drive and Kazinga Channel",
        description:
          "Early morning game drive in Kasenyi sector searching for lions, elephants, and antelopes. Afternoon boat cruise on Kazinga Channel - excellent for hippos, crocodiles, and birds.",
        activities: ["Morning game drive", "Boat cruise", "Wildlife photography"],
        accommodation: "Mweya Safari Lodge",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 3,
        title: "Ishasha Sector - Tree Climbing Lions",
        description:
          "Transfer to Ishasha sector famous for tree-climbing lions. Game drives searching for these unique lions resting in fig trees. Explore the southern part of the park.",
        activities: ["Tree-climbing lions", "Game drives", "Photography"],
        accommodation: "Ishasha Wilderness Camp",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 4,
        title: "Kyambura Gorge Chimpanzee Tracking",
        description:
          "Morning chimpanzee tracking in Kyambura Gorge, known as the 'Valley of Apes'. Afternoon crater lakes tour with stunning scenery and bird watching opportunities.",
        activities: ["Chimpanzee tracking", "Crater lakes tour", "Bird watching"],
        accommodation: "Mweya Safari Lodge",
        meals: ["Breakfast", "Lunch", "Dinner"],
      },
      {
        day: 5,
        title: "Return to Kampala",
        description:
          "Morning game drive en route to park exit. Stop for lunch and visit local craft markets. Arrive in Kampala in the evening with drop-off at your hotel or airport.",
        activities: ["Final game drive", "Craft shopping", "Return journey"],
        accommodation: "End of tour",
        meals: ["Breakfast", "Lunch"],
      },
    ],
    location: {
      country: "Uganda",
      region: "Queen Elizabeth NP",
      coordinates: { lat: -0.2, lng: 29.9 },
    },
    bestTime: "Year-round destination, but dry seasons offer better road conditions and wildlife viewing",
    physicalRequirements:
      "Easy to moderate. Chimpanzee tracking involves some hiking but is generally accessible to most fitness levels.",
    whatToBring: [
      "Comfortable safari clothing",
      "Sturdy walking shoes",
      "Sun protection",
      "Camera with telephoto lens",
      "Binoculars",
      "Insect repellent",
      "Rain jacket",
      "Personal medications",
    ],
    tags: ["wildlife", "lions", "chimpanzees", "safari"],
  },
]

// Blog Posts Data
const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Ultimate Guide to Gorilla Trekking in Uganda",
    slug: "ultimate-guide-gorilla-trekking-uganda",
    excerpt:
      "Everything you need to know about planning your gorilla trekking adventure in Bwindi Impenetrable Forest.",
    content: "Gorilla trekking in Uganda is one of the most extraordinary wildlife experiences on Earth...",
    author: "Sarah Johnson",
    authorImage: "",
    publishedAt: "2024-03-15",
    category: "Wildlife",
    tags: ["gorillas", "trekking", "wildlife", "uganda"],
    image: "/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg",
    readTime: 8,
    featured: true,
  },
  {
    id: "2",
    title: "Best Time to Visit Uganda for Safari",
    slug: "best-time-visit-uganda-safari",
    excerpt: "Discover the optimal seasons for wildlife viewing and safari adventures in Uganda's national parks.",
    content:
      "Uganda's equatorial location means it can be visited year-round, but certain seasons offer better wildlife viewing...",
    author: "Michael Chen",
    authorImage: "",
    publishedAt: "2024-03-10",
    category: "Travel Tips",
    tags: ["safari", "seasons", "planning", "wildlife"],
    image: "/photos/queen-elizabeth-national-park-uganda.jpg",
    readTime: 6,
    featured: false,
  },
  {
    id: "3",
    title: "Cultural Experiences in Uganda: Beyond Wildlife",
    slug: "cultural-experiences-uganda-beyond-wildlife",
    excerpt: "Explore Uganda's rich cultural heritage through traditional dances, crafts, and community visits.",
    content: "While Uganda is famous for its wildlife, the country's cultural diversity is equally captivating...",
    author: "Emma Thompson",
    authorImage: "",
    publishedAt: "2024-03-05",
    category: "Culture",
    tags: ["culture", "traditions", "community", "heritage"],
    image: "/photos/kampala-city-ug.jpg",
    readTime: 7,
    featured: true,
  },
]

// Gallery Images Data
const galleryImages: GalleryImage[] = [
  {
    id: "1",
    url: "/photos/chimpanzee-bwindi-forest-impenetrable-park.jpg",
    title: "Chimpanzees in Bwindi Forest",
    description: "Chimpanzees in their natural habitat in Bwindi Impenetrable Forest",
    category: "Wildlife",
    location: "Bwindi Forest",
    photographer: "John Safari",
    tags: ["chimpanzees", "wildlife", "forest"],
  },
  {
    id: "2",
    url: "/photos/african-nile.jpg",
    title: "African Nile River",
    description: "The mighty Nile River flowing through Uganda's landscape",
    category: "Landscapes",
    location: "Murchison Falls NP",
    photographer: "Jane Explorer",
    tags: ["nile", "river", "landscape"],
  },
  {
    id: "3",
    url: "/photos/queen-elizabeth-national-park-uganda.jpg",
    title: "Queen Elizabeth National Park",
    description: "Beautiful landscape of Queen Elizabeth National Park with wildlife",
    category: "Wildlife",
    location: "Queen Elizabeth NP",
    photographer: "Mike Wildlife",
    tags: ["wildlife", "park", "landscape"],
  },
]

// Export functions
export function getAllTours(): Tour[] {
  return tours
}

export function getTourBySlug(slug: string): Tour | null {
  return tours.find((tour) => tour.slug === slug) || null
}

export function getTourById(id: string): Tour | null {
  return tours.find((tour) => tour.id === id) || null
}

export function getToursByCategory(category: string): Tour[] {
  return tours.filter((tour) => tour.category.toLowerCase() === category.toLowerCase())
}

export function getFeaturedTours(): Tour[] {
  return tours.filter((tour) => tour.featured)
}

export function getPopularTours(): Tour[] {
  return tours.filter((tour) => tour.popular)
}

export function getNewTours(): Tour[] {
  return tours.filter((tour) => tour.isNew)
}

export function getRelatedTours(currentTourId: string, category: string): Tour[] {
  return tours.filter((tour) => tour.id !== currentTourId && tour.category === category).slice(0, 3)
}

export function searchTours(query: string): Tour[] {
  const searchTerm = query.toLowerCase()
  return tours.filter(
    (tour) =>
      tour.title.toLowerCase().includes(searchTerm) ||
      tour.description.toLowerCase().includes(searchTerm) ||
      tour.category.toLowerCase().includes(searchTerm) ||
      tour.location.region.toLowerCase().includes(searchTerm) ||
      tour.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  )
}

export function getTourCategories(): string[] {
  const categories = tours.map((tour) => tour.category)
  return [...new Set(categories)]
}

// Blog functions
export function getAllBlogPosts(): BlogPost[] {
  return blogPosts
}

export function getFeaturedBlogPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured === true)
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return blogPosts.find((post) => post.slug === slug) || null
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category.toLowerCase() === category.toLowerCase())
}

export function getBlogPostsByAuthor(author: string): BlogPost[] {
  return blogPosts.filter((post) => post.author.toLowerCase() === author.toLowerCase())
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter((post) => post.tags.includes(tag.toLowerCase()))
}

export function searchBlogPosts(query: string): BlogPost[] {
  const searchTerm = query.toLowerCase()
  return blogPosts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  )
}

// Gallery functions
export function getAllGalleryImages(): GalleryImage[] {
  return galleryImages
}

export function getGalleryImagesByCategory(category: string): GalleryImage[] {
  return galleryImages.filter((image) => image.category.toLowerCase() === category.toLowerCase())
}

export function getGalleryImagesByLocation(location: string): GalleryImage[] {
  return galleryImages.filter((image) => image.location.toLowerCase().includes(location.toLowerCase()))
}

export function searchGalleryImages(query: string): GalleryImage[] {
  const searchTerm = query.toLowerCase()
  return galleryImages.filter(
    (image) =>
      image.title.toLowerCase().includes(searchTerm) ||
      image.description.toLowerCase().includes(searchTerm) ||
      image.location.toLowerCase().includes(searchTerm) ||
      image.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  )
}

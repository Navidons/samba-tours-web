import { MetadataRoute } from 'next'
import { SEO_CONFIG } from '@/lib/seo'

const STATIC_ROUTES = [
  {
    url: '',
    priority: 1.0,
    changeFrequency: 'daily' as const
  },
  {
    url: '/tours',
    priority: 0.9,
    changeFrequency: 'daily' as const
  },
  {
    url: '/about',
    priority: 0.8,
    changeFrequency: 'weekly' as const
  },
  {
    url: '/contact',
    priority: 0.8,
    changeFrequency: 'weekly' as const
  },
  {
    url: '/gallery',
    priority: 0.7,
    changeFrequency: 'weekly' as const
  },
  {
    url: '/blog',
    priority: 0.8,
    changeFrequency: 'daily' as const
  }
]

async function getTours() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co')
    const response = await fetch(`${baseUrl}/api/tours`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('Failed to fetch tours for sitemap')
      return []
    }
    
    const data = await response.json()
    return data.tours || []
  } catch (error) {
    console.error('Error fetching tours for sitemap:', error)
    return []
  }
}

async function getBlogPosts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://sambatours.co')
    const response = await fetch(`${baseUrl}/api/blog`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      console.error('Failed to fetch blog posts for sitemap')
      return []
    }
    
    const data = await response.json()
    return data.posts || []
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tours, blogPosts] = await Promise.all([
    getTours(),
    getBlogPosts()
  ])

  // Static routes
  const staticUrls = STATIC_ROUTES.map(route => ({
    url: `${SEO_CONFIG.siteUrl}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority
  }))

  // Tour pages
  const tourUrls = tours.map((tour: any) => ({
    url: `${SEO_CONFIG.siteUrl}/tours/${tour.slug}`,
    lastModified: new Date(tour.updatedAt || tour.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.8
  }))

  // Tour category pages
  const tourCategories = [...new Set(tours.map((tour: any) => tour.category?.slug).filter(Boolean))]
  const categoryUrls = tourCategories.map(categorySlug => ({
    url: `${SEO_CONFIG.siteUrl}/tours/category/${categorySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7
  }))

  // Blog post pages
  const blogUrls = blogPosts.map((post: any) => ({
    url: `${SEO_CONFIG.siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishDate || post.createdAt),
    changeFrequency: 'monthly' as const,
    priority: 0.6
  }))

  // Blog category and tag pages
  const blogCategories = [...new Set(blogPosts.map((post: any) => post.category?.slug).filter(Boolean))]
  const blogCategoryUrls = blogCategories.map(categorySlug => ({
    url: `${SEO_CONFIG.siteUrl}/blog/category/${categorySlug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5
  }))

  const blogTags = [...new Set(
    blogPosts.flatMap((post: any) => 
      post.tags?.map((tag: any) => tag.tag?.slug || tag.slug).filter(Boolean) || []
    )
  )]
  const blogTagUrls = blogTags.map(tagSlug => ({
    url: `${SEO_CONFIG.siteUrl}/blog/tag/${tagSlug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4
  }))

  // Blog author pages
  const blogAuthors = [...new Set(blogPosts.map((post: any) => post.author?.slug).filter(Boolean))]
  const authorUrls = blogAuthors.map(authorSlug => ({
    url: `${SEO_CONFIG.siteUrl}/blog/author/${authorSlug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5
  }))

  return [
    ...staticUrls,
    ...tourUrls,
    ...categoryUrls,
    ...blogUrls,
    ...blogCategoryUrls,
    ...blogTagUrls,
    ...authorUrls
  ]
} 
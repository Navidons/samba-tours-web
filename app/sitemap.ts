import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'
  const currentDate = new Date().toISOString()

  // Static pages with high priority
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/brand-differentiation`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/tours`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/gallery`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  // Fetch dynamic slugs (tours + blogs)
  let tourPages: MetadataRoute.Sitemap = []
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const [toursRes, blogsRes] = await Promise.all([
      fetch(`${baseUrl}/api/tours?limit=1000`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/api/blog?limit=1000`, { next: { revalidate: 3600 } }),
    ])
    if (toursRes.ok) {
      const toursData = await toursRes.json()
      tourPages = (toursData.tours || []).map((t: any) => ({
        url: `${baseUrl}/tours/${t.slug}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
    }
    if (blogsRes.ok) {
      const blogsData = await blogsRes.json()
      blogPages = (blogsData.posts || []).map((p: any) => ({
        url: `${baseUrl}/blog/${p.slug}`,
        lastModified: p.updatedAt || currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch {}

  return [
    ...staticPages,
    ...tourPages,
    ...blogPages,
  ]
}

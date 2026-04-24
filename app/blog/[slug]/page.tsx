import { Suspense } from "react"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import BlogPostHeader from "@/components/blog/blog-post-header"
import BlogPostContent from "@/components/blog/blog-post-content"
import BlogPostSidebar from "@/components/blog/blog-post-sidebar"
import RelatedPosts from "@/components/blog/related-posts"
import BlogComments from "@/components/blog/blog-comments"
import { Skeleton } from "@/components/ui/skeleton"
import { getRelatedBlogPosts } from "@/lib/services/blog-service"
import { generateFakeBlogMetrics } from "@/lib/utils/blog-metrics"
import { getSocialShareImage } from "@/lib/utils/blog-images"
import { prisma } from "@/lib/prisma"

// Helper function to create a URL-friendly slug from a string
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -

// Helper function to parse HTML content for table of contents
const parseTableOfContents = async (content: string) => {
  try {
    // Simple regex-based parsing for development/production compatibility
    if (!content) return []
    
    const headingRegex = /<h[2-3][^>]*>(.*?)<\/h[2-3]>/gi
    const headings = []
    let match
    
    while ((match = headingRegex.exec(content)) !== null) {
      const text = match[1].replace(/<[^>]*>/g, '').trim()
      if (text) {
        headings.push({
          text,
          id: slugify(text)
        })
      }
    }
    
    return headings
  } catch (error) {
    console.warn('Error parsing table of contents:', error)
    return []
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        publishDate: true,
        createdAt: true,
        updatedAt: true,
        author: { select: { name: true } },
        category: { select: { name: true } },
        tags: { select: { tag: { select: { name: true } } } },
      }
    })
    
    if (!post) {
      return {
        title: 'Blog Post Not Found - Samba Tours',
        description: 'The requested blog post could not be found.',
        robots: {
          index: false,
          follow: false,
        }
      }
    }

    // Create rich metadata for the blog post
    const title = `${post.title} - Uganda Safari Blog | Samba Tours`
    const description = post.excerpt || `Read about ${post.title} on our Uganda safari blog. Expert insights, travel tips, and wildlife stories from the Pearl of Africa.`
    const keywords = (post.tags?.map((t: any) => t.tag?.name).filter(Boolean) || []).join(', ') + ', Uganda safari, gorilla trekking, wildlife, travel blog'
    const author = post.author?.name || 'Samba Tours'
    const toISO = (d: unknown): string => {
      if (d instanceof Date) return d.toISOString()
      if (typeof d === 'string') return d
      try { return new Date(String(d)).toISOString() } catch { return new Date().toISOString() }
    }
    const publishedISO = toISO(post.publishDate ?? post.createdAt)
    const updatedISO = toISO(post.updatedAt)
    const imageUrl = getSocialShareImage(`/api/blog/thumbnails/${post.id}`, post.title)
    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'}/blog/${params.slug}`

    return {
      title,
      description,
      keywords,
      authors: [{ name: author }],
      creator: author,
      publisher: "Samba Tours",
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'),
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: 'Samba Tours',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        locale: 'en_US',
        type: 'article',
        publishedTime: publishedISO,
        authors: [author],
        tags: post.tags?.map((tag: any) => tag.name) || [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        creator: '@sambatours',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      other: {
        'article:published_time': publishedISO,
        'article:modified_time': updatedISO,
        'article:author': author,
        'article:section': post.category?.name || 'Uganda Safari',
        ...(post.tags?.reduce((acc: any, tag: any) => {
          acc[`article:tag`] = tag.name
          return acc
        }, {}))
      }
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post - Samba Tours',
      description: 'Blog post from Samba Tours Uganda safari company.',
      robots: {
        index: false,
        follow: false,
      }
    }
  }
}

// Generate static params for static generation (optional, for better performance)
export async function generateStaticParams() {
  // This could be implemented to pre-generate popular blog posts
  // For now, we'll use dynamic rendering
  return []
}

export const dynamic = 'force-dynamic'

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug: params.slug, status: 'published' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        contentHtml: true,
        status: true,
        publishDate: true,
        readTimeMinutes: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { id: true, name: true } },
        author: { select: { name: true, bio: true } },
        tags: { select: { tag: { select: { name: true } } } },
      }
    })
    
    if (!post) {
      notFound()
    }

    // Parse HTML content for table of contents
    const tableOfContents = await parseTableOfContents(post.content || '')

    // Get related posts (handle errors gracefully)
    let relatedPosts = []
    try {
      relatedPosts = await getRelatedBlogPosts(
        post.id,
        post.category?.id || null,
        3
      )
    } catch (error) {
      console.warn('Could not fetch related posts:', error)
    }

    const fakeMetrics = generateFakeBlogMetrics(post.id, post.title, post.featured)
    
    // Use DB thumbnail URL (no filesystem fallback)
    const blogImage = `/api/blog/thumbnails/${post.id}`

    // Transform post data to match component expectations
    const transformedPost = {
      ...post,
      publishDate: post.publishDate || null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      image: blogImage,
      thumbnail: blogImage,
      category: post.category?.name || 'Uncategorized',
      author: {
        name: post.author?.name || 'Unknown Author',
        role: "Travel Writer",
        image: "",
        bio: post.author?.bio || "Experienced travel writer with deep knowledge of Uganda's wildlife and culture.",
      },
      date: post.publishDate || post.createdAt,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '5 min read',
      viewCount: post.viewCount || fakeMetrics.viewCount,
      likeCount: post.likeCount || fakeMetrics.likeCount,
      commentCount: post.commentCount || fakeMetrics.commentCount,
      views: post.viewCount || fakeMetrics.viewCount,
      likes: post.likeCount || fakeMetrics.likeCount,
      shares: fakeMetrics.shareCount,
      tags: post.tags?.map((t: any) => t.tag?.name).filter(Boolean) || [],
      tableOfContents
    }

    // Structured Data for Blog Post
    const articleStructuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "description": post.excerpt || `Read about ${post.title} on our Uganda safari blog. Expert insights, travel tips, and wildlife stories from the Pearl of Africa.`,
      "image": blogImage,
      "author": {
        "@type": "Person",
        "name": post.author?.name || "Samba Tours"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Samba Tours",
        "url": "https://sambatours.co",
        "logo": {
          "@type": "ImageObject",
          "url": "https://sambatours.co/logo/samba tours-01.png"
        }
      },
      "datePublished": post.publishDate || post.createdAt,
      "dateModified": post.updatedAt,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://sambatours.co/blog/${params.slug}`
      },
      "articleSection": post.category?.name || "Uganda Safari",
      "keywords": post.tags?.map((tag: any) => tag.name).join(', ') + ', Uganda safari, gorilla trekking, wildlife, travel blog',
      "wordCount": post.content?.length || 0,
      "timeRequired": `PT${post.readTimeMinutes || 5}M`
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleStructuredData),
          }}
        />
        
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <BlogPostHeader post={transformedPost as any} />
            <Suspense
              fallback={
                <div className="space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-11/12" />
                  <Skeleton className="h-5 w-10/12" />
                  <Skeleton className="h-5 w-9/12" />
                </div>
              }
            >
              <BlogPostContent post={transformedPost as any} />
            </Suspense>
            <RelatedPosts currentPost={transformedPost as any} />
            <BlogComments postId={post.id} />
          </div>
          <div className="lg:col-span-4">
            <BlogPostSidebar post={transformedPost as any} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error rendering blog post:', error)
    notFound()
  }
}

import { Suspense } from "react"
import * as cheerio from "cheerio"
import type { Metadata } from "next"
import dynamicImport from "next/dynamic"
import BlogPostHeader from "@/components/blog/blog-post-header"
import BlogPostContent from "@/components/blog/blog-post-content"
import BlogPostSidebar from "@/components/blog/blog-post-sidebar"
import RelatedPosts from "@/components/blog/related-posts"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { getRelatedBlogPosts } from "@/lib/services/blog-service"

// Dynamically import BlogComments to avoid SSR issues
const BlogComments = dynamicImport(() => import("@/components/blog/blog-comments"), {
  ssr: false,
  loading: () => <LoadingSpinner />
})

// Helper function to create a URL-friendly slug from a string
const slugify = (text: string) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'
    const response = await fetch(`${baseUrl}/api/blog/${params.slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'Blog Post Not Found - Samba Tours',
        description: 'The requested blog post could not be found.',
        robots: {
          index: false,
          follow: false,
        }
      }
    }
    
    const data = await response.json()
    const post = data.post
    
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
    const keywords = post.tags?.map((tag: any) => tag.name).join(', ') + ', Uganda safari, gorilla trekking, wildlife, travel blog'
    const author = post.author?.name || 'Samba Tours'
    const publishDate = post.publishDate || post.createdAt
    const imageUrl = post.thumbnail || '/photos/queen-elizabeth-national-park-uganda.jpg'
    const canonicalUrl = `${baseUrl}/blog/${params.slug}`

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
        publishedTime: publishDate,
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
        'article:published_time': publishDate,
        'article:modified_time': post.updatedAt,
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
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sambatours.co'
    const response = await fetch(`${baseUrl}/api/blog/${params.slug}`, {
      cache: 'no-store'
    })
    
    let post = null
    if (response.ok) {
      const data = await response.json()
      post = data.post
    }
    
    // If no post, use empty fallback values
    if (!post) {
      post = {
        id: 0,
        title: '',
        excerpt: '',
        content: '',
        thumbnail: '',
        publishDate: '',
        createdAt: '',
        updatedAt: '',
        author: { name: '', bio: '' },
        category: { name: '' },
        readTimeMinutes: 0,
        viewCount: 0,
        likeCount: 0,
        tags: [],
      }
    }

    // Parse HTML content for table of contents (safely)
    let headings: Array<{ id: string; text: string; level: string }> = []
    try {
      const $ = cheerio.load(post.content || '')
      headings = $("h2, h3").map((_, el) => ({
        id: slugify($(el).text()),
        text: $(el).text(),
        level: el.tagName,
      })).get()
    } catch (error) {
      console.warn('Could not parse content for headings:', error)
    }

    // Get related posts (handle errors gracefully)
    let relatedPosts = []
    try {
      if (post.id) {
        relatedPosts = await getRelatedBlogPosts(
          post.id,
          post.category?.id || null,
          3
        )
      }
    } catch (error) {
      console.warn('Could not fetch related posts:', error)
    }

    // Transform post data to match component expectations (safely)
    const transformedPost = {
      ...post,
      publishDate: post.publishDate || null,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      image: post.thumbnail,
      thumbnail: post.thumbnail,
      category: post.category?.name || 'Uncategorized',
      author: {
        name: post.author?.name || 'Unknown Author',
        role: "Travel Writer",
        image: "",
        bio: post.author?.bio || "",
      },
      date: post.publishDate || post.createdAt,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '5 min read',
      views: post.viewCount || 0,
      likes: post.likeCount || 0,
      tags: Array.isArray(post.tags) ? post.tags.map((t: any) => t.tag?.name || t.name || t) : [],
      tableOfContents: headings.map(h => ({
        text: h.text,
        id: h.id
      }))
    }

    // Structured Data for Blog Post (safely)
    const articleStructuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title || '',
      "description": post.excerpt || '',
      "image": post.thumbnail || "https://sambatours.co/photos/queen-elizabeth-national-park-uganda.jpg",
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
      "keywords": Array.isArray(post.tags) ? post.tags.map((tag: any) => tag.name).join(', ') + ', Uganda safari, gorilla trekking, wildlife, travel blog' : 'Uganda safari, gorilla trekking, wildlife, travel blog',
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
            <Suspense fallback={<LoadingSpinner />}>
              <BlogPostContent post={transformedPost as any} />
            </Suspense>
            <RelatedPosts currentPost={transformedPost as any} />
            <Suspense fallback={<LoadingSpinner />}>
              <BlogComments postId={post.id || 0} />
            </Suspense>
          </div>
          <div className="lg:col-span-4">
            <BlogPostSidebar post={transformedPost as any} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error rendering blog post:', error)
    // Render with empty fallback values
    const emptyPost = {
      id: 0,
      title: '',
      excerpt: '',
      content: '',
      thumbnail: '',
      publishDate: '',
      createdAt: '',
      updatedAt: '',
      author: { name: '', bio: '' },
      category: { name: '' },
      readTimeMinutes: 0,
      viewCount: 0,
      likeCount: 0,
      tags: [],
    }
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <p>This blog post does not exist or could not be loaded.</p>
        </div>
      </div>
    )
  }
}

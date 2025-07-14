import { Suspense } from "react"
import { notFound } from "next/navigation"
import * as cheerio from "cheerio"
import BlogPostHeader from "@/components/blog/blog-post-header"
import BlogPostContent from "@/components/blog/blog-post-content"
import BlogPostSidebar from "@/components/blog/blog-post-sidebar"
import RelatedPosts from "@/components/blog/related-posts"
import BlogComments from "@/components/blog/blog-comments"
import LoadingSpinner from "@/components/ui/loading-spinner"
import { getRelatedBlogPosts } from "@/lib/services/blog-service"

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
export async function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    // Fetch blog post from API for metadata
    const response = await fetch(`/api/blog/${params.slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.'
      }
    }
    
    const data = await response.json()
    const post = data.post
    
    if (!post) {
      return {
        title: 'Blog Post Not Found',
        description: 'The requested blog post could not be found.'
      }
    }

    return {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      keywords: post.seoKeywords,
              openGraph: {
          title: post.metaTitle || post.title,
          description: post.metaDescription || post.excerpt,
          type: 'article',
          publishedTime: post.publishDate || post.createdAt,
          modifiedTime: post.updatedAt,
          authors: post.author ? [post.author.name] : [],
          tags: post.tags.map((t: any) => t.tag.name),
        },
      twitter: {
        card: 'summary_large_image',
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.excerpt,
      },
      alternates: {
        canonical: `/blog/${post.slug}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Blog Post',
      description: 'Blog post from Samba Tours'
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
    // Fetch blog post from API
    const response = await fetch(`/api/blog/${params.slug}`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      notFound()
    }
    
    const data = await response.json()
    const post = data.post
    
    if (!post) {
      notFound()
    }

    // Parse HTML content for table of contents
    const $ = cheerio.load(post.content || '')
    const headings = $("h2, h3").map((_, el) => ({
      id: slugify($(el).text()),
      text: $(el).text(),
      level: el.tagName,
    })).get()

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

    // Transform post data to match component expectations
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
        bio: post.author?.bio || "Experienced travel writer with deep knowledge of Uganda's wildlife and culture.",
      },
      date: post.publishDate || post.createdAt,
      readTime: post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '5 min read',
      views: post.viewCount,
      likes: post.likeCount,
      tags: post.tags.map((t: any) => t.tag.name),
      tableOfContents: headings.map(h => ({
        text: h.text,
        id: h.id
      }))
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <BlogPostHeader post={transformedPost as any} />
            <Suspense fallback={<LoadingSpinner />}>
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

import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Calendar, Clock, Eye, User, Tag } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/loading-spinner"
import BlogPostView from "../../BlogPostView"

export const metadata = {
  title: "View Blog Post - Samba Tours Admin",
  description: "View blog post details.",
}

interface ViewBlogPostProps {
  params: { slug: string }
}

export default function ViewBlogPost({ params }: ViewBlogPostProps) {
  const slug = decodeURIComponent(params.slug)

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="section-padding">
        <div className="container-max">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/admin/blog">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Blog
                  </Link>
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-earth-900">View Blog Post</h1>
              <p className="text-earth-600">Viewing: {slug}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/blog/${slug}`} target="_blank">
                  <Eye className="h-4 w-4 mr-2" />
                  View Public
                </Link>
              </Button>
              <Button asChild>
                <Link href={`/admin/blog/edit/${slug}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </Link>
              </Button>
            </div>
          </div>

          {/* Blog Post View */}
          <Suspense fallback={<LoadingSpinner />}>
            <BlogPostView slug={slug} />
          </Suspense>
        </div>
      </div>
    </main>
  )
} 
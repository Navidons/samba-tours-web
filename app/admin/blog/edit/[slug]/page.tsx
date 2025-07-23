import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "@/components/ui/loading-spinner"
import BlogPostForm from "../../BlogPostForm"

export const metadata = {
  title: "Edit Blog Post - Samba Tours Admin",
  description: "Edit an existing blog post.",
}

interface EditBlogPostProps {
  params: { slug: string }
}

export default function EditBlogPost({ params }: EditBlogPostProps) {
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
              <h1 className="text-3xl font-bold text-earth-900">Edit Blog Post</h1>
              <p className="text-earth-600">Update blog post content and settings</p>
            </div>
          </div>

          {/* Blog Post Form */}
          <Suspense fallback={<LoadingSpinner />}>
            <BlogPostForm slug={slug} />
          </Suspense>
        </div>
      </div>
    </main>
  )
} 
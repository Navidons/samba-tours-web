import { prisma } from '@/lib/prisma'
import { cache } from 'react'
import { revalidatePath } from 'next/cache'

import { handleDatabaseError, NotFoundError } from '@/lib/error-handler'


export interface BlogPostWithRelations {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  contentHtml: string | null
  status: string
  publishDate: Date | null
  readTimeMinutes: number | null
  viewCount: number
  likeCount: number
  commentCount: number
  featured: boolean
  thumbnailData: Buffer | null
  thumbnailName: string | null
  thumbnailType: string | null
  thumbnailSize: number | null
  metaTitle: string | null
  metaDescription: string | null
  seoKeywords: any
  createdAt: Date
  updatedAt: Date
  category: {
    id: number
    name: string
    slug: string
  } | null
  author: {
    id: number
    name: string
    email: string | null
    bio: string | null
  } | null
  tags: {
    tag: {
      id: number
      name: string
      slug: string
      color: string
    }
  }[]
  comments: {
    id: number
    authorName: string
    content: string
    status: string
    createdAt: Date
  }[]
}

export interface BlogPostListParams {
  page?: number
  limit?: number
  category?: string
  tag?: string
  author?: string
  featured?: boolean
  status?: 'draft' | 'published' | 'archived'
  search?: string
}

export interface BlogPostListResult {
  posts: BlogPostWithRelations[]
  total: number
  page: number
  totalPages: number
  hasMore: boolean
}

// Cached blog post by slug (for better performance)
export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPostWithRelations | null> => {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { 
        slug,
        status: 'published'
      },
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
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        thumbnailSize: true,
        metaTitle: true,
        metaDescription: true,
        seoKeywords: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              }
            }
          }
        },
        comments: {
          where: {
            status: 'approved'
          },
          select: {
            id: true,
            authorName: true,
            content: true,
            status: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!post) return null

    // Increment view count (non-blocking)
    if (post.id) {
      prisma.blogPost.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      }).catch(console.error)
    }

    // Transform post to include thumbnail URL
    const transformedPost = {
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    }

    return transformedPost as unknown as BlogPostWithRelations
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return null
    }
    
    // Log other errors but don't throw
    console.error('Error fetching blog post:', error)
    return null
  }
})

// Get blog posts with pagination and filtering
export const getBlogPosts = cache(async (params: BlogPostListParams = {}): Promise<BlogPostListResult> => {
  try {

    const {
      page = 1,
      limit = 12,
      category,
      tag,
      author,
      featured,
      status = 'published',
      search
    } = params

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status
    }

    if (category) {
      where.category = { slug: category }
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag }
        }
      }
    }

    if (author) {
      where.author = { id: parseInt(author) }
    }

    if (featured !== undefined) {
      where.featured = featured
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
          thumbnailData: true,
          thumbnailName: true,
          thumbnailType: true,
          thumbnailSize: true,
          metaTitle: true,
          metaDescription: true,
          seoKeywords: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                }
              }
            }
          },
          comments: {
            where: { status: 'approved' },
            select: {
              id: true,
              authorName: true,
              content: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    // Transform posts to include thumbnail URLs
    const transformedPosts = posts.map(post => ({
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    }))

    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return {
      posts: transformedPosts as unknown as BlogPostWithRelations[],
      total,
      page,
      totalPages,
      hasMore
    }
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false
      }
    }
    
    // Log other errors but return empty result
    console.error('Error fetching blog posts:', error)
    return {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    }
  }
})

// Get featured blog posts
export const getFeaturedBlogPosts = cache(async (limit: number = 3): Promise<BlogPostWithRelations[]> => {
  try {

    const posts = await prisma.blogPost.findMany({
      where: {
        status: 'published',
        featured: true
      },
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
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        thumbnailSize: true,
        metaTitle: true,
        metaDescription: true,
        seoKeywords: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              }
            }
          }
        },
        comments: {
          where: { status: 'approved' },
          select: {
            id: true,
            authorName: true,
            content: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { publishDate: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit
    })

    // Transform posts to include thumbnail URLs
    return posts.map(post => ({
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    })) as unknown as BlogPostWithRelations[]
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return []
    }
    
    // Log other errors but return empty array
    console.error('Error fetching featured blog posts:', error)
    return []
  }
})

// Get related blog posts
export const getRelatedBlogPosts = cache(async (
  currentPostId: number,
  categoryId: number | null,
  limit: number = 3
): Promise<BlogPostWithRelations[]> => {
  try {

    const posts = await prisma.blogPost.findMany({
      where: {
        id: { not: currentPostId },
        status: 'published',
        ...(categoryId && { categoryId })
      },
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
        thumbnailData: true,
        thumbnailName: true,
        thumbnailType: true,
        thumbnailSize: true,
        metaTitle: true,
        metaDescription: true,
        seoKeywords: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            bio: true,
          }
        },
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              }
            }
          }
        },
        comments: {
          where: { status: 'approved' },
          select: {
            id: true,
            authorName: true,
            content: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: [
        { featured: 'desc' },
        { viewCount: 'desc' },
        { publishDate: 'desc' }
      ],
      take: limit
    })

    // Transform posts to include thumbnail URLs
    return posts.map(post => ({
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    })) as unknown as BlogPostWithRelations[]
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return []
    }
    
    // Log other errors but return empty array
    console.error('Error fetching related blog posts:', error)
    return []
  }
})

// Get blog categories
export const getBlogCategories = cache(async () => {
  try {
    return await prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            posts: true
          }
        }
      }
    })
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return []
    }
    
    // Log other errors but return empty array
    console.error('Error fetching blog categories:', error)
    return []
  }
})

// Get blog tags
export const getBlogTags = cache(async () => {
  try {
    return await prisma.blogTag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  status: 'published'
                }
              }
            }
          }
        }
      }
    })
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return []
    }
    
    // Log other errors but return empty array
    console.error('Error fetching blog tags:', error)
    return []
  }
})

// Get blog authors
export const getBlogAuthors = cache(async () => {
  try {
    return await prisma.blogAuthor.findMany({
      where: { 
        isActive: true,
        posts: {
          some: {
            status: 'published'
          }
        }
      },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                status: 'published'
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return []
    }
    
    // Log other errors but return empty array
    console.error('Error fetching blog authors:', error)
    return []
  }
})

// Get blog posts by author
export const getBlogPostsByAuthor = cache(async (authorId: number, params: BlogPostListParams = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      search
    } = params

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'published',
      authorId
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
          thumbnailData: true,
          thumbnailName: true,
          thumbnailType: true,
          thumbnailSize: true,
          metaTitle: true,
          metaDescription: true,
          seoKeywords: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                }
              }
            }
          },
          comments: {
            where: { status: 'approved' },
            select: {
              id: true,
              authorName: true,
              content: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    // Transform posts to include thumbnail URLs
    const transformedPosts = posts.map(post => ({
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    }))

    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return {
      posts: transformedPosts as unknown as BlogPostWithRelations[],
      total,
      page,
      totalPages,
      hasMore
    }
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false
      }
    }
    
    // Log other errors but return empty result
    console.error('Error fetching blog posts by author:', error)
    return {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    }
  }
})

// Get blog posts by category
export const getBlogPostsByCategory = cache(async (categorySlug: string, params: BlogPostListParams = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      search
    } = params

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'published',
      category: {
        slug: categorySlug
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
          thumbnailData: true,
          thumbnailName: true,
          thumbnailType: true,
          thumbnailSize: true,
          metaTitle: true,
          metaDescription: true,
          seoKeywords: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                }
              }
            }
          },
          comments: {
            where: { status: 'approved' },
            select: {
              id: true,
              authorName: true,
              content: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    // Transform posts to include thumbnail URLs
    const transformedPosts = posts.map(post => ({
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    }))

    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return {
      posts: transformedPosts as unknown as BlogPostWithRelations[],
      total,
      page,
      totalPages,
      hasMore
    }
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false
      }
    }
    
    // Log other errors but return empty result
    console.error('Error fetching blog posts by category:', error)
    return {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    }
  }
})

// Get blog posts by tag
export const getBlogPostsByTag = cache(async (tagSlug: string, params: BlogPostListParams = {}) => {
  try {
    const {
      page = 1,
      limit = 12,
      search
    } = params

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'published',
      tags: {
        some: {
          tag: {
            slug: tagSlug
          }
        }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get posts and total count
    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
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
          thumbnailData: true,
          thumbnailName: true,
          thumbnailType: true,
          thumbnailSize: true,
          metaTitle: true,
          metaDescription: true,
          seoKeywords: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            }
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              bio: true,
            }
          },
          tags: {
            select: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  color: true,
                }
              }
            }
          },
          comments: {
            where: { status: 'approved' },
            select: {
              id: true,
              authorName: true,
              content: true,
              status: true,
              createdAt: true,
            },
            orderBy: { createdAt: 'desc' }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.blogPost.count({ where })
    ])

    // Transform posts to include thumbnail URLs
    const transformedPosts = posts.map(post => ({
      ...post,
      thumbnail: post.thumbnailData && post.thumbnailType 
        ? `data:${post.thumbnailType};base64,${Buffer.from(post.thumbnailData).toString('base64')}`
        : null,
      // Remove raw binary data
      thumbnailData: undefined,
      thumbnailName: undefined,
      thumbnailType: undefined,
      thumbnailSize: undefined,
    }))

    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return {
      posts: transformedPosts as unknown as BlogPostWithRelations[],
      total,
      page,
      totalPages,
      hasMore
    }
  } catch (error) {
    // Handle database connection errors gracefully
    if (error instanceof Error && error.message.includes('does not exist')) {
      console.warn('Database table does not exist yet. Please run migrations.')
      return {
        posts: [],
        total: 0,
        page: 1,
        totalPages: 0,
        hasMore: false
      }
    }
    
    // Log other errors but return empty result
    console.error('Error fetching blog posts by tag:', error)
    return {
      posts: [],
      total: 0,
      page: 1,
      totalPages: 0,
      hasMore: false
    }
  }
})

import { prisma } from '@/lib/prisma'

// Get comment count for a blog post (server-side only)
export async function getBlogCommentCount(postId: number): Promise<number> {
  try {
    const count = await prisma.blogComment.count({
      where: {
        postId,
        status: 'approved'
      }
    })
    return count
  } catch (error) {
    console.error('Error getting comment count:', error)
    return 0
  }
}

// Get all comments for a blog post (server-side only)
export async function getAllBlogComments(postId: number) {
  try {
    const comments = await prisma.blogComment.findMany({
      where: {
        postId,
        status: 'approved',
        parentCommentId: null // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            profile: {
              select: {
                fullName: true,
                firstName: true,
                lastName: true
              }
            }
          }
        },
        replies: {
          where: {
            status: 'approved'
          },
          include: {
            user: {
              select: {
                id: true,
                profile: {
                  select: {
                    fullName: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return comments
  } catch (error) {
    console.error('Error fetching blog comments:', error)
    return []
  }
} 

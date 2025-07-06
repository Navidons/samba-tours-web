import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create user roles
  const adminRole = await prisma.userRole.upsert({
    where: { roleName: 'admin' },
    update: {},
    create: {
      roleName: 'admin',
      description: 'Administrator with full access',
      permissions: { all: true }
    }
  })

  const userRole = await prisma.userRole.upsert({
    where: { roleName: 'user' },
    update: {},
    create: {
      roleName: 'user',
      description: 'Regular user',
      permissions: { read: true, write: false }
    }
  })

  // Create a test user
  const testUser = await prisma.user.upsert({
    where: { email: 'admin@sambatours.com' },
    update: {},
    create: {
      email: 'admin@sambatours.com',
      passwordHash: '$2b$10$example.hash.for.testing',
      emailConfirmed: true
    }
  })

  // Create user profile
  const userProfile = await prisma.profile.upsert({
    where: { id: testUser.id },
    update: {},
    create: {
      id: testUser.id,
      fullName: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      roleId: adminRole.id,
      isActive: true
    }
  })

  // Create blog categories
  const wildlifeCategory = await prisma.blogCategory.upsert({
    where: { slug: 'wildlife' },
    update: {},
    create: {
      name: 'Wildlife',
      slug: 'wildlife',
      description: 'Articles about Uganda\'s amazing wildlife',
      displayOrder: 1,
      isActive: true
    }
  })

  const cultureCategory = await prisma.blogCategory.upsert({
    where: { slug: 'culture' },
    update: {},
    create: {
      name: 'Culture',
      slug: 'culture',
      description: 'Ugandan culture and traditions',
      displayOrder: 2,
      isActive: true
    }
  })

  // Create blog tags
  const gorillaTag = await prisma.blogTag.upsert({
    where: { slug: 'gorilla-trekking' },
    update: {},
    create: {
      name: 'Gorilla Trekking',
      slug: 'gorilla-trekking',
      color: '#4F46E5'
    }
  })

  const wildlifeTag = await prisma.blogTag.upsert({
    where: { slug: 'wildlife' },
    update: {},
    create: {
      name: 'Wildlife',
      slug: 'wildlife',
      color: '#059669'
    }
  })

  const ugandaTag = await prisma.blogTag.upsert({
    where: { slug: 'uganda' },
    update: {},
    create: {
      name: 'Uganda',
      slug: 'uganda',
      color: '#DC2626'
    }
  })

  // Create sample blog posts
  const blogPost1 = await prisma.blogPost.upsert({
    where: { slug: 'ultimate-guide-gorilla-trekking-uganda' },
    update: {},
    create: {
      title: 'The Ultimate Guide to Gorilla Trekking in Uganda: Everything You Need to Know',
      slug: 'ultimate-guide-gorilla-trekking-uganda',
      excerpt: 'Discover the secrets of successful gorilla trekking in Bwindi Impenetrable Forest. From preparation tips to what to expect during your encounter with mountain gorillas.',
      content: `
        <h2>Introduction to Gorilla Trekking</h2>
        <p>Gorilla trekking in Uganda is one of the most incredible wildlife experiences you can have. Bwindi Impenetrable Forest is home to nearly half of the world's remaining mountain gorillas.</p>
        
        <h2>Planning Your Trip</h2>
        <p>Before embarking on your gorilla trekking adventure, there are several important things to consider:</p>
        <ul>
          <li>Obtain the necessary permits (book well in advance)</li>
          <li>Choose the right time of year (dry seasons are best)</li>
          <li>Pack appropriate clothing and gear</li>
          <li>Get in good physical condition</li>
        </ul>
        
        <h2>What to Expect</h2>
        <p>Gorilla trekking can take anywhere from 2 to 8 hours, depending on where the gorillas are located. You'll be accompanied by experienced guides and trackers who know the forest intimately.</p>
        
        <h2>Conservation Impact</h2>
        <p>Your visit directly contributes to gorilla conservation efforts. The permit fees help fund protection programs and support local communities.</p>
      `,
      status: 'published',
      publishDate: new Date('2024-03-20'),
      readTimeMinutes: 12,
      viewCount: 5600,
      likeCount: 234,
      commentCount: 45,
      featured: true,
      categoryId: wildlifeCategory.id,
      authorId: userProfile.id,
      metaTitle: 'Ultimate Guide to Gorilla Trekking in Uganda - Samba Tours',
      metaDescription: 'Complete guide to gorilla trekking in Uganda. Learn about permits, preparation, what to expect, and conservation efforts in Bwindi Forest.',
      seoKeywords: ['gorilla trekking', 'uganda', 'bwindi', 'wildlife', 'conservation']
    }
  })

  const blogPost2 = await prisma.blogPost.upsert({
    where: { slug: 'discovering-uganda-wildlife-safari' },
    update: {},
    create: {
      title: 'Discovering Uganda\'s Wildlife: A Complete Safari Guide',
      slug: 'discovering-uganda-wildlife-safari',
      excerpt: 'Explore Uganda\'s diverse wildlife from the Big Five to rare primates. Learn about the best national parks and safari experiences.',
      content: `
        <h2>Uganda\'s Wildlife Diversity</h2>
        <p>Uganda is home to an incredible variety of wildlife, from the iconic Big Five to rare primates found nowhere else on earth.</p>
        
        <h2>Top National Parks</h2>
        <p>Discover the best parks for wildlife viewing:</p>
        <ul>
          <li>Queen Elizabeth National Park</li>
          <li>Murchison Falls National Park</li>
          <li>Kidepo Valley National Park</li>
          <li>Bwindi Impenetrable Forest</li>
        </ul>
        
        <h2>Safari Planning Tips</h2>
        <p>Plan your perfect wildlife safari with our expert tips on timing, accommodation, and what to pack.</p>
      `,
      status: 'published',
      publishDate: new Date('2024-03-15'),
      readTimeMinutes: 8,
      viewCount: 3200,
      likeCount: 156,
      commentCount: 23,
      featured: false,
      categoryId: wildlifeCategory.id,
      authorId: userProfile.id,
      metaTitle: 'Uganda Wildlife Safari Guide - Samba Tours',
      metaDescription: 'Complete guide to wildlife safaris in Uganda. Discover the best national parks and wildlife viewing opportunities.',
      seoKeywords: ['uganda safari', 'wildlife', 'national parks', 'big five']
    }
  })

  // Create blog post tag mappings
  await prisma.blogPostTagMapping.upsert({
    where: {
      postId_tagId: {
        postId: blogPost1.id,
        tagId: gorillaTag.id
      }
    },
    update: {},
    create: {
      postId: blogPost1.id,
      tagId: gorillaTag.id
    }
  })

  await prisma.blogPostTagMapping.upsert({
    where: {
      postId_tagId: {
        postId: blogPost1.id,
        tagId: ugandaTag.id
      }
    },
    update: {},
    create: {
      postId: blogPost1.id,
      tagId: ugandaTag.id
    }
  })

  await prisma.blogPostTagMapping.upsert({
    where: {
      postId_tagId: {
        postId: blogPost2.id,
        tagId: wildlifeTag.id
      }
    },
    update: {},
    create: {
      postId: blogPost2.id,
      tagId: wildlifeTag.id
    }
  })

  await prisma.blogPostTagMapping.upsert({
    where: {
      postId_tagId: {
        postId: blogPost2.id,
        tagId: ugandaTag.id
      }
    },
    update: {},
    create: {
      postId: blogPost2.id,
      tagId: ugandaTag.id
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log(`📝 Created ${await prisma.blogPost.count()} blog posts`)
  console.log(`🏷️ Created ${await prisma.blogTag.count()} tags`)
  console.log(`📂 Created ${await prisma.blogCategory.count()} categories`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
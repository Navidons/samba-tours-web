import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestCategories() {
  try {
    console.log('🚀 Adding test categories and locations to database...')

    // Add categories
    const categories = [
      { name: 'Wildlife', slug: 'wildlife', color: '#10b981' },
      { name: 'Landscape', slug: 'landscape', color: '#3b82f6' },
      { name: 'Adventure', slug: 'adventure', color: '#f59e0b' },
      { name: 'Culture', slug: 'culture', color: '#8b5cf6' },
      { name: 'Nature', slug: 'nature', color: '#059669' }
    ]

    for (const category of categories) {
      const newCategory = await prisma.galleryMediaCategory.create({
        data: {
          name: category.name,
          slug: category.slug,
          color: category.color,
          description: `${category.name} photography and videos`
        }
      })
      console.log(`✅ Category created: ${category.name} (ID: ${newCategory.id})`)
    }

    // Add locations
    const locations = [
      { name: 'Queen Elizabeth National Park', slug: 'queen-elizabeth', country: 'Uganda', region: 'Western' },
      { name: 'Bwindi Impenetrable Forest', slug: 'bwindi', country: 'Uganda', region: 'Southwestern' },
      { name: 'Murchison Falls', slug: 'murchison-falls', country: 'Uganda', region: 'Northern' },
      { name: 'Lake Victoria', slug: 'lake-victoria', country: 'Uganda', region: 'Central' },
      { name: 'Kibale Forest', slug: 'kibale-forest', country: 'Uganda', region: 'Western' }
    ]

    for (const location of locations) {
      const newLocation = await prisma.galleryMediaLocation.create({
        data: {
          name: location.name,
          slug: location.slug,
          country: location.country,
          region: location.region,
          description: `Media from ${location.name}`
        }
      })
      console.log(`✅ Location created: ${location.name} (ID: ${newLocation.id})`)
    }

    console.log('\n🎉 Test categories and locations added successfully!')
    console.log('📊 Total categories:', await prisma.galleryMediaCategory.count())
    console.log('📊 Total locations:', await prisma.galleryMediaLocation.count())

  } catch (error) {
    console.error('❌ Error adding test categories:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestCategories() 
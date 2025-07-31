import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestImages() {
  try {
    console.log('🚀 Adding test images to database...')

    // Get the first gallery
    const galleries = await prisma.gallery.findMany({
      take: 1
    })

    if (galleries.length === 0) {
      console.log('❌ No galleries found. Please run add-test-video.ts first.')
      return
    }

    const galleryId = galleries[0].id
    console.log(`✅ Using gallery ID: ${galleryId}`)

    // Create some test image data (small placeholder)
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')

    // Add test images
    const testImages = [
      {
        title: 'Lion in the Savannah',
        description: 'A majestic lion surveying its territory in the vast savannah of Uganda.',
        photographer: 'John Safari',
        featured: true,
        likes: 15,
        views: 120
      },
      {
        title: 'Gorilla Family',
        description: 'A family of mountain gorillas in their natural habitat.',
        photographer: 'Sarah Wildlife',
        featured: true,
        likes: 23,
        views: 89
      },
      {
        title: 'Elephant Herd',
        description: 'A peaceful herd of elephants crossing the plains.',
        photographer: 'Mike Nature',
        featured: false,
        likes: 8,
        views: 45
      },
      {
        title: 'Bird Paradise',
        description: 'Colorful birds in the lush forests of Uganda.',
        photographer: 'Emma Bird',
        featured: false,
        likes: 12,
        views: 67
      },
      {
        title: 'Sunset Safari',
        description: 'Beautiful sunset over the African landscape.',
        photographer: 'David Sunset',
        featured: true,
        likes: 31,
        views: 156
      },
      {
        title: 'Waterfall Adventure',
        description: 'Stunning waterfall in the heart of Uganda.',
        photographer: 'Lisa Water',
        featured: false,
        likes: 19,
        views: 78
      }
    ]

    for (let i = 0; i < testImages.length; i++) {
      const imageData = testImages[i]
      
      const testImage = await prisma.galleryImage.create({
        data: {
          galleryId: galleryId,
          imageData: testImageData,
          imageName: `${imageData.title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
          imageType: 'image/jpeg',
          imageSize: testImageData.length,
          alt: imageData.title,
          title: imageData.title,
          description: imageData.description,
          photographer: imageData.photographer,
          date: new Date(),
          featured: imageData.featured,
          likes: imageData.likes,
          views: imageData.views,
          displayOrder: i + 1
        }
      })

      console.log(`✅ Test image created: ${imageData.title} (ID: ${testImage.id})`)
    }

    console.log('\n🎉 Test images added successfully!')
    console.log('📊 Total images in database:', await prisma.galleryImage.count())

  } catch (error) {
    console.error('❌ Error adding test images:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestImages() 
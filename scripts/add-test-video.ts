import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addTestVideo() {
  try {
    console.log('🚀 Adding test video to database...')

    // Check if we have any galleries first
    const galleries = await prisma.gallery.findMany({
      take: 1
    })

    let galleryId = null
    if (galleries.length > 0) {
      galleryId = galleries[0].id
      console.log(`✅ Using existing gallery ID: ${galleryId}`)
    } else {
      // Create a default gallery if none exists
      const newGallery = await prisma.gallery.create({
        data: {
          name: 'Default Gallery',
          slug: 'default-gallery',
          description: 'Default gallery for test content',
          featured: true
        }
      })
      galleryId = newGallery.id
      console.log(`✅ Created new gallery with ID: ${galleryId}`)
    }

    // Add a test video
    const testVideo = await prisma.galleryVideo.create({
      data: {
        galleryId: galleryId,
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoProvider: 'youtube',
        videoId: 'dQw4w9WgXcQ',
        title: 'Test Safari Video',
        description: 'A test video to verify the gallery functionality is working correctly.',
        duration: 180, // 3 minutes
        featured: true,
        likes: 0,
        views: 0,
        displayOrder: 1
      }
    })

    console.log('✅ Test video created successfully!')
    console.log('📹 Video ID:', testVideo.id)
    console.log('🎬 Title:', testVideo.title)
    console.log('🔗 URL:', testVideo.videoUrl)

    // Add another test video
    const testVideo2 = await prisma.galleryVideo.create({
      data: {
        galleryId: galleryId,
        videoUrl: 'https://vimeo.com/148751763',
        videoProvider: 'vimeo',
        videoId: '148751763',
        title: 'Uganda Wildlife Experience',
        description: 'Experience the amazing wildlife of Uganda through this beautiful video.',
        duration: 240, // 4 minutes
        featured: false,
        likes: 5,
        views: 25,
        displayOrder: 2
      }
    })

    console.log('✅ Second test video created successfully!')
    console.log('📹 Video ID:', testVideo2.id)
    console.log('🎬 Title:', testVideo2.title)

    console.log('\n🎉 Test videos added successfully!')
    console.log('📊 Total videos in database:', await prisma.galleryVideo.count())

  } catch (error) {
    console.error('❌ Error adding test video:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addTestVideo() 
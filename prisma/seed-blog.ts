import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding blog data...')

  // Create blog categories
  const categories = await Promise.all([
    prisma.blogCategory.upsert({
      where: { slug: 'gorilla-trekking' },
      update: {},
      create: {
        name: 'Gorilla Trekking',
        slug: 'gorilla-trekking',
        description: 'Expert guides and insights for your gorilla trekking adventure in Uganda\'s pristine forests.',
        displayOrder: 1,
        isActive: true,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'wildlife-safari' },
      update: {},
      create: {
        name: 'Wildlife Safari',
        slug: 'wildlife-safari',
        description: 'Discover Uganda\'s incredible wildlife through our safari guides and photography tips.',
        displayOrder: 2,
        isActive: true,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'travel-planning' },
      update: {},
      create: {
        name: 'Travel Planning',
        slug: 'travel-planning',
        description: 'Essential tips and guides to help you plan the perfect Uganda adventure.',
        displayOrder: 3,
        isActive: true,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'culture' },
      update: {},
      create: {
        name: 'Culture & Heritage',
        slug: 'culture',
        description: 'Explore Uganda\'s rich cultural heritage and learn about local traditions.',
        displayOrder: 4,
        isActive: true,
      },
    }),
    prisma.blogCategory.upsert({
      where: { slug: 'photography' },
      update: {},
      create: {
        name: 'Photography',
        slug: 'photography',
        description: 'Capture stunning images of Uganda\'s wildlife and landscapes with expert tips.',
        displayOrder: 5,
        isActive: true,
      },
    }),
  ])

  // Create blog authors
  const authors = await Promise.all([
    prisma.blogAuthor.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'James Okello',
        email: 'james@sambatours.com',
        bio: 'James has over 10 years of experience leading gorilla trekking expeditions and wildlife safaris across Uganda. He is passionate about wildlife conservation and sharing his deep knowledge of Uganda\'s ecosystems with travelers from around the world.',
        isActive: true,
      },
    }),
    prisma.blogAuthor.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        name: 'Sarah Namukasa',
        email: 'sarah@sambatours.com',
        bio: 'Sarah ensures every detail of your journey is perfectly planned. With over 8 years in Uganda\'s tourism industry, her attention to detail and customer service excellence is unmatched.',
        isActive: true,
      },
    }),
    prisma.blogAuthor.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        name: 'David Mukasa',
        email: 'david@sambatours.com',
        bio: 'David founded Samba Tours with a vision to showcase Uganda\'s natural beauty to the world. With over 12 years in Uganda\'s tourism industry, he has led the company to become one of the country\'s most trusted tour operators.',
        isActive: true,
      },
    }),
  ])

  // Create blog tags
  const tags = await Promise.all([
    prisma.blogTag.upsert({
      where: { slug: 'samba' },
      update: {},
      create: {
        name: 'SAMBA',
        slug: 'samba',
        description: 'Everything about SAMBA tours and experiences.',
        color: '#3B82F6',
      },
    }),
    prisma.blogTag.upsert({
      where: { slug: 'tours' },
      update: {},
      create: {
        name: 'TOURS',
        slug: 'tours',
        description: 'Comprehensive tour guides and travel information.',
        color: '#10B981',
      },
    }),
    prisma.blogTag.upsert({
      where: { slug: 'lions' },
      update: {},
      create: {
        name: 'LIONS',
        slug: 'lions',
        description: 'Lion encounters and wildlife experiences.',
        color: '#F59E0B',
      },
    }),
    prisma.blogTag.upsert({
      where: { slug: 'elephants' },
      update: {},
      create: {
        name: 'ELEPHANTS',
        slug: 'elephants',
        description: 'Elephant encounters and conservation stories.',
        color: '#6B7280',
      },
    }),
    prisma.blogTag.upsert({
      where: { slug: 'gorillas' },
      update: {},
      create: {
        name: 'GORILLAS',
        slug: 'gorillas',
        description: 'Gorilla trekking and primate experiences.',
        color: '#8B5CF6',
      },
    }),
  ])

  // Create blog posts
  const posts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: 'ultimate-gorilla-trekking-guide' },
      update: {},
      create: {
        title: 'The Ultimate Gorilla Trekking Guide: Everything You Need to Know',
        slug: 'ultimate-gorilla-trekking-guide',
        excerpt: 'Discover the magic of gorilla trekking in Uganda\'s Bwindi Impenetrable National Park. This comprehensive guide covers everything from permits to what to pack.',
        content: `
# The Ultimate Gorilla Trekking Guide

Gorilla trekking in Uganda is one of the most incredible wildlife experiences on Earth. Here's everything you need to know to make the most of your adventure.

## What is Gorilla Trekking?

Gorilla trekking involves hiking through dense forest to observe mountain gorillas in their natural habitat. Uganda is home to over half of the world's remaining mountain gorillas, making it the perfect destination for this once-in-a-lifetime experience.

## Best Time to Go

The best time for gorilla trekking in Uganda is during the dry seasons:
- June to August
- December to February

During these periods, the trails are less muddy and the gorillas are easier to find.

## What to Pack

Essential items for your gorilla trek:
- Sturdy hiking boots
- Long-sleeved shirts and pants
- Rain jacket
- Camera (no flash)
- Water and snacks
- First aid kit

## The Experience

A typical gorilla trekking day starts early in the morning. After a briefing, you'll be assigned to a gorilla family and begin your trek through the forest. The duration can vary from 30 minutes to several hours, depending on where the gorillas are located.

When you find the gorillas, you'll have one hour to observe them from a safe distance. This is an incredible opportunity to watch these magnificent creatures in their natural environment.

## Conservation

Gorilla trekking plays a crucial role in conservation efforts. The revenue generated from permits helps fund protection programs and supports local communities, ensuring the long-term survival of these endangered animals.

## Conclusion

Gorilla trekking in Uganda is an experience that will stay with you forever. The combination of adventure, wildlife, and conservation makes it a truly special journey.
        `,
        contentHtml: `
<h1>The Ultimate Gorilla Trekking Guide</h1>
<p>Gorilla trekking in Uganda is one of the most incredible wildlife experiences on Earth. Here's everything you need to know to make the most of your adventure.</p>
<h2>What is Gorilla Trekking?</h2>
<p>Gorilla trekking involves hiking through dense forest to observe mountain gorillas in their natural habitat. Uganda is home to over half of the world's remaining mountain gorillas, making it the perfect destination for this once-in-a-lifetime experience.</p>
<h2>Best Time to Go</h2>
<p>The best time for gorilla trekking in Uganda is during the dry seasons:</p>
<ul>
<li>June to August</li>
<li>December to February</li>
</ul>
<p>During these periods, the trails are less muddy and the gorillas are easier to find.</p>
<h2>What to Pack</h2>
<p>Essential items for your gorilla trek:</p>
<ul>
<li>Sturdy hiking boots</li>
<li>Long-sleeved shirts and pants</li>
<li>Rain jacket</li>
<li>Camera (no flash)</li>
<li>Water and snacks</li>
<li>First aid kit</li>
</ul>
<h2>The Experience</h2>
<p>A typical gorilla trekking day starts early in the morning. After a briefing, you'll be assigned to a gorilla family and begin your trek through the forest. The duration can vary from 30 minutes to several hours, depending on where the gorillas are located.</p>
<p>When you find the gorillas, you'll have one hour to observe them from a safe distance. This is an incredible opportunity to watch these magnificent creatures in their natural environment.</p>
<h2>Conservation</h2>
<p>Gorilla trekking plays a crucial role in conservation efforts. The revenue generated from permits helps fund protection programs and supports local communities, ensuring the long-term survival of these endangered animals.</p>
<h2>Conclusion</h2>
<p>Gorilla trekking in Uganda is an experience that will stay with you forever. The combination of adventure, wildlife, and conservation makes it a truly special journey.</p>
        `,
        categoryId: categories[0].id, // Gorilla Trekking
        authorId: authors[0].id, // James Okello
        status: 'published',
        publishDate: new Date('2024-01-15'),
        readTimeMinutes: 8,
        viewCount: 1250,
        likeCount: 89,
        commentCount: 12,
        featured: true,
        metaTitle: 'Ultimate Gorilla Trekking Guide Uganda - Everything You Need to Know',
        metaDescription: 'Complete guide to gorilla trekking in Uganda. Learn about permits, best time to visit, what to pack, and conservation efforts.',
        seoKeywords: ['gorilla trekking', 'uganda', 'bwindi', 'wildlife', 'conservation'],
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'wildlife-safari-uganda' },
      update: {},
      create: {
        title: 'Wildlife Safari in Uganda: A Complete Guide to the Big Five',
        slug: 'wildlife-safari-uganda',
        excerpt: 'Explore Uganda\'s incredible wildlife on safari. From lions and elephants to rare species, discover the best parks and tips for an unforgettable experience.',
        content: `
# Wildlife Safari in Uganda: A Complete Guide

Uganda is a wildlife paradise, home to the Big Five and countless other species. Here's your complete guide to experiencing the best wildlife safaris in Uganda.

## The Big Five in Uganda

Uganda is home to four of the Big Five:
- **Lions**: Found in Queen Elizabeth National Park and Murchison Falls
- **Elephants**: Abundant in several parks across the country
- **Buffalo**: Common throughout Uganda's savanna parks
- **Leopards**: Elusive but present in most major parks

## Best Parks for Wildlife Viewing

### Queen Elizabeth National Park
Known for its tree-climbing lions and diverse wildlife, Queen Elizabeth offers excellent game drives and boat safaris along the Kazinga Channel.

### Murchison Falls National Park
Uganda's largest park features the dramatic Murchison Falls and is home to large herds of elephants, giraffes, and various antelope species.

### Kidepo Valley National Park
Remote and wild, Kidepo offers some of the best wildlife viewing in East Africa, with large herds of buffalo and excellent predator sightings.

## Safari Tips

1. **Best Time**: Dry seasons (June-August, December-February) offer the best wildlife viewing
2. **Game Drives**: Early morning and late afternoon drives provide the best animal activity
3. **Patience**: Wildlife viewing requires patience - animals don't always appear on schedule
4. **Respect**: Always maintain a safe distance and follow your guide's instructions

## Photography Tips

- Bring a good zoom lens (200-400mm minimum)
- Use a bean bag or tripod for stability
- Shoot in the golden hours for best lighting
- Be patient and wait for the perfect moment

## Conservation

Uganda's national parks play a crucial role in wildlife conservation. Your visit helps support these efforts and ensures the protection of these magnificent animals for future generations.
        `,
        contentHtml: `
<h1>Wildlife Safari in Uganda: A Complete Guide</h1>
<p>Uganda is a wildlife paradise, home to the Big Five and countless other species. Here's your complete guide to experiencing the best wildlife safaris in Uganda.</p>
<h2>The Big Five in Uganda</h2>
<p>Uganda is home to four of the Big Five:</p>
<ul>
<li><strong>Lions</strong>: Found in Queen Elizabeth National Park and Murchison Falls</li>
<li><strong>Elephants</strong>: Abundant in several parks across the country</li>
<li><strong>Buffalo</strong>: Common throughout Uganda's savanna parks</li>
<li><strong>Leopards</strong>: Elusive but present in most major parks</li>
</ul>
<h2>Best Parks for Wildlife Viewing</h2>
<h3>Queen Elizabeth National Park</h3>
<p>Known for its tree-climbing lions and diverse wildlife, Queen Elizabeth offers excellent game drives and boat safaris along the Kazinga Channel.</p>
<h3>Murchison Falls National Park</h3>
<p>Uganda's largest park features the dramatic Murchison Falls and is home to large herds of elephants, giraffes, and various antelope species.</p>
<h3>Kidepo Valley National Park</h3>
<p>Remote and wild, Kidepo offers some of the best wildlife viewing in East Africa, with large herds of buffalo and excellent predator sightings.</p>
<h2>Safari Tips</h2>
<ol>
<li><strong>Best Time</strong>: Dry seasons (June-August, December-February) offer the best wildlife viewing</li>
<li><strong>Game Drives</strong>: Early morning and late afternoon drives provide the best animal activity</li>
<li><strong>Patience</strong>: Wildlife viewing requires patience - animals don't always appear on schedule</li>
<li><strong>Respect</strong>: Always maintain a safe distance and follow your guide's instructions</li>
</ol>
<h2>Photography Tips</h2>
<ul>
<li>Bring a good zoom lens (200-400mm minimum)</li>
<li>Use a bean bag or tripod for stability</li>
<li>Shoot in the golden hours for best lighting</li>
<li>Be patient and wait for the perfect moment</li>
</ul>
<h2>Conservation</h2>
<p>Uganda's national parks play a crucial role in wildlife conservation. Your visit helps support these efforts and ensures the protection of these magnificent animals for future generations.</p>
        `,
        categoryId: categories[1].id, // Wildlife Safari
        authorId: authors[1].id, // Sarah Namukasa
        status: 'published',
        publishDate: new Date('2024-01-20'),
        readTimeMinutes: 10,
        viewCount: 980,
        likeCount: 67,
        commentCount: 8,
        featured: true,
        metaTitle: 'Wildlife Safari Uganda - Complete Guide to Big Five & Best Parks',
        metaDescription: 'Discover Uganda\'s incredible wildlife on safari. Complete guide to the Big Five, best parks, and tips for unforgettable wildlife experiences.',
        seoKeywords: ['wildlife safari', 'uganda', 'big five', 'queen elizabeth', 'murchison falls'],
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'planning-uganda-adventure' },
      update: {},
      create: {
        title: 'Planning Your Uganda Adventure: A Step-by-Step Guide',
        slug: 'planning-uganda-adventure',
        excerpt: 'Planning a trip to Uganda? This comprehensive guide covers everything from visas and vaccinations to accommodation and transportation.',
        content: `
# Planning Your Uganda Adventure: A Step-by-Step Guide

Planning a trip to Uganda can seem overwhelming, but with the right information, it's straightforward and exciting. Here's everything you need to know to plan your perfect Uganda adventure.

## Before You Go

### Visas and Documentation
- Most visitors need a visa (apply online at least 2 weeks before travel)
- Passport must be valid for at least 6 months beyond your stay
- Yellow fever vaccination certificate is required
- Consider travel insurance for medical emergencies

### Health and Vaccinations
Essential vaccinations:
- Yellow fever (required)
- Hepatitis A and B
- Typhoid
- Meningitis
- Rabies (if planning extended rural stays)

### Best Time to Visit
Uganda has two dry seasons:
- **June to August**: Peak season, best weather
- **December to February**: Good weather, fewer crowds

## Accommodation Options

### Luxury Lodges
For those seeking comfort and luxury, Uganda offers world-class lodges with stunning views and excellent service.

### Mid-Range Hotels
Good quality accommodation at reasonable prices, perfect for most travelers.

### Budget Options
Hostels and guesthouses provide affordable accommodation for budget-conscious travelers.

## Transportation

### Getting Around
- **Domestic flights**: Quick but expensive
- **Private vehicles**: Most convenient for safaris
- **Public transport**: Affordable but less reliable
- **Guided tours**: Recommended for first-time visitors

## Must-See Destinations

1. **Bwindi Impenetrable National Park** - Gorilla trekking
2. **Queen Elizabeth National Park** - Wildlife safaris
3. **Murchison Falls National Park** - Waterfalls and wildlife
4. **Kampala** - Capital city culture
5. **Lake Victoria** - Africa's largest lake

## Budget Planning

Average daily costs:
- **Budget**: $50-100 USD
- **Mid-range**: $100-200 USD
- **Luxury**: $200+ USD

Remember to include:
- Gorilla trekking permits ($700 USD)
- Safari activities
- Transportation
- Meals and accommodation

## Safety Tips

- Uganda is generally safe for tourists
- Follow your guide's instructions
- Keep valuables secure
- Stay hydrated and use sunscreen
- Respect local customs and traditions

## Conclusion

With proper planning, Uganda offers an incredible adventure filled with wildlife, culture, and natural beauty. Start planning early and you'll have the trip of a lifetime.
        `,
        contentHtml: `
<h1>Planning Your Uganda Adventure: A Step-by-Step Guide</h1>
<p>Planning a trip to Uganda can seem overwhelming, but with the right information, it's straightforward and exciting. Here's everything you need to know to plan your perfect Uganda adventure.</p>
<h2>Before You Go</h2>
<h3>Visas and Documentation</h3>
<ul>
<li>Most visitors need a visa (apply online at least 2 weeks before travel)</li>
<li>Passport must be valid for at least 6 months beyond your stay</li>
<li>Yellow fever vaccination certificate is required</li>
<li>Consider travel insurance for medical emergencies</li>
</ul>
<h3>Health and Vaccinations</h3>
<p>Essential vaccinations:</p>
<ul>
<li>Yellow fever (required)</li>
<li>Hepatitis A and B</li>
<li>Typhoid</li>
<li>Meningitis</li>
<li>Rabies (if planning extended rural stays)</li>
</ul>
<h3>Best Time to Visit</h3>
<p>Uganda has two dry seasons:</p>
<ul>
<li><strong>June to August</strong>: Peak season, best weather</li>
<li><strong>December to February</strong>: Good weather, fewer crowds</li>
</ul>
<h2>Accommodation Options</h2>
<h3>Luxury Lodges</h3>
<p>For those seeking comfort and luxury, Uganda offers world-class lodges with stunning views and excellent service.</p>
<h3>Mid-Range Hotels</h3>
<p>Good quality accommodation at reasonable prices, perfect for most travelers.</p>
<h3>Budget Options</h3>
<p>Hostels and guesthouses provide affordable accommodation for budget-conscious travelers.</p>
<h2>Transportation</h2>
<h3>Getting Around</h3>
<ul>
<li><strong>Domestic flights</strong>: Quick but expensive</li>
<li><strong>Private vehicles</strong>: Most convenient for safaris</li>
<li><strong>Public transport</strong>: Affordable but less reliable</li>
<li><strong>Guided tours</strong>: Recommended for first-time visitors</li>
</ul>
<h2>Must-See Destinations</h2>
<ol>
<li><strong>Bwindi Impenetrable National Park</strong> - Gorilla trekking</li>
<li><strong>Queen Elizabeth National Park</strong> - Wildlife safaris</li>
<li><strong>Murchison Falls National Park</strong> - Waterfalls and wildlife</li>
<li><strong>Kampala</strong> - Capital city culture</li>
<li><strong>Lake Victoria</strong> - Africa's largest lake</li>
</ol>
<h2>Budget Planning</h2>
<p>Average daily costs:</p>
<ul>
<li><strong>Budget</strong>: $50-100 USD</li>
<li><strong>Mid-range</strong>: $100-200 USD</li>
<li><strong>Luxury</strong>: $200+ USD</li>
</ul>
<p>Remember to include:</p>
<ul>
<li>Gorilla trekking permits ($700 USD)</li>
<li>Safari activities</li>
<li>Transportation</li>
<li>Meals and accommodation</li>
</ul>
<h2>Safety Tips</h2>
<ul>
<li>Uganda is generally safe for tourists</li>
<li>Follow your guide's instructions</li>
<li>Keep valuables secure</li>
<li>Stay hydrated and use sunscreen</li>
<li>Respect local customs and traditions</li>
</ul>
<h2>Conclusion</h2>
<p>With proper planning, Uganda offers an incredible adventure filled with wildlife, culture, and natural beauty. Start planning early and you'll have the trip of a lifetime.</p>
        `,
        categoryId: categories[2].id, // Travel Planning
        authorId: authors[2].id, // David Mukasa
        status: 'published',
        publishDate: new Date('2024-01-25'),
        readTimeMinutes: 12,
        viewCount: 750,
        likeCount: 45,
        commentCount: 6,
        featured: false,
        metaTitle: 'Planning Uganda Adventure - Complete Travel Guide & Tips',
        metaDescription: 'Complete guide to planning your Uganda adventure. Covers visas, vaccinations, accommodation, transportation, and must-see destinations.',
        seoKeywords: ['uganda travel', 'planning', 'visa', 'vaccinations', 'accommodation'],
      },
    }),
  ])

  // Create blog post tag mappings
  await Promise.all([
    // Ultimate Gorilla Trekking Guide tags
    prisma.blogPostTagMapping.createMany({
      data: [
        { postId: posts[0].id, tagId: tags[0].id }, // SAMBA
        { postId: posts[0].id, tagId: tags[4].id }, // GORILLAS
        { postId: posts[0].id, tagId: tags[1].id }, // TOURS
      ],
      skipDuplicates: true,
    }),
    // Wildlife Safari tags
    prisma.blogPostTagMapping.createMany({
      data: [
        { postId: posts[1].id, tagId: tags[0].id }, // SAMBA
        { postId: posts[1].id, tagId: tags[1].id }, // TOURS
        { postId: posts[1].id, tagId: tags[2].id }, // LIONS
        { postId: posts[1].id, tagId: tags[3].id }, // ELEPHANTS
      ],
      skipDuplicates: true,
    }),
    // Planning Guide tags
    prisma.blogPostTagMapping.createMany({
      data: [
        { postId: posts[2].id, tagId: tags[0].id }, // SAMBA
        { postId: posts[2].id, tagId: tags[1].id }, // TOURS
      ],
      skipDuplicates: true,
    }),
  ])

  console.log('✅ Blog data seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding blog data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 
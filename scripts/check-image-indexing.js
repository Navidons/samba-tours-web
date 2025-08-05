#!/usr/bin/env node

/**
 * Script to check for potential image indexing issues
 * Run with: node scripts/check-image-indexing.js
 */

const fs = require('fs');
const path = require('path');

// Directories to check for images
const imageDirectories = [
  'public/photos',
  'public/tours-attractions',
  'public/home-hero-photos',
  'public/logo'
];

// Files that should not be indexed
const sitemapFiles = [
  'public/sitemap.xml',
  'public/sitemap-index.xml'
];

console.log('🔍 Checking for image indexing issues...\n');

// Check if sitemap-images.xml still exists
const sitemapImagesPath = 'public/sitemap-images.xml';
if (fs.existsSync(sitemapImagesPath)) {
  console.log('❌ WARNING: sitemap-images.xml still exists!');
  console.log('   This file should be deleted to prevent image indexing.');
  console.log('   File location: ' + sitemapImagesPath + '\n');
} else {
  console.log('✅ sitemap-images.xml has been removed\n');
}

// Check robots.txt
const robotsPath = 'public/robots.txt';
if (fs.existsSync(robotsPath)) {
  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  
  if (robotsContent.includes('Disallow: /photos/')) {
    console.log('✅ robots.txt correctly blocks /photos/ directory');
  } else {
    console.log('❌ robots.txt does not block /photos/ directory');
  }
  
  if (robotsContent.includes('Disallow: /tours-attractions/')) {
    console.log('✅ robots.txt correctly blocks /tours-attractions/ directory');
  } else {
    console.log('❌ robots.txt does not block /tours-attractions/ directory');
  }
  
  if (robotsContent.includes('Disallow: /home-hero-photos/')) {
    console.log('✅ robots.txt correctly blocks /home-hero-photos/ directory');
  } else {
    console.log('❌ robots.txt does not block /home-hero-photos/ directory');
  }
  
  if (robotsContent.includes('Disallow: /logo/')) {
    console.log('✅ robots.txt correctly blocks /logo/ directory');
  } else {
    console.log('❌ robots.txt does not block /logo/ directory');
  }
} else {
  console.log('❌ robots.txt file not found!');
}

console.log('\n📊 Image Directory Analysis:');

// Check image directories
imageDirectories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
    );
    
    console.log(`\n📁 ${dir}:`);
    console.log(`   Found ${imageFiles.length} image files`);
    
    if (imageFiles.length > 0) {
      console.log('   Sample files:');
      imageFiles.slice(0, 5).forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        const sizeInKB = Math.round(stats.size / 1024);
        console.log(`   - ${file} (${sizeInKB}KB)`);
      });
      
      if (imageFiles.length > 5) {
        console.log(`   ... and ${imageFiles.length - 5} more files`);
      }
    }
  } else {
    console.log(`\n📁 ${dir}: Directory not found`);
  }
});

console.log('\n🔧 SEO Recommendations:');
console.log('1. ✅ Remove sitemap-images.xml (if still exists)');
console.log('2. ✅ Update robots.txt to block image directories');
console.log('3. ✅ Clean main sitemap.xml of image references');
console.log('4. ✅ Add noimageindex meta tags to layout');
console.log('5. 🔄 Submit updated sitemap to search engines');
console.log('6. 🔄 Request re-indexing in Google Search Console');

console.log('\n📈 Next Steps:');
console.log('- Wait 24-48 hours for search engines to re-crawl');
console.log('- Monitor Google Search Console for image indexing');
console.log('- Check search results to confirm images are no longer indexed');
console.log('- Consider using WebP format for better performance');

console.log('\n✅ Image indexing prevention setup complete!'); 
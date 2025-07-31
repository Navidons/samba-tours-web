const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Directories to optimize
const directories = [
  'public/home-hero-photos',
  'public/tours-attractions', 
  'public/photos'
];

// Target sizes for different use cases
const sizes = {
  hero: { width: 1920, height: 1080 },
  thumbnail: { width: 400, height: 300 },
  medium: { width: 800, height: 600 },
  large: { width: 1200, height: 800 }
};

async function optimizeImage(inputPath, outputPath, size) {
  try {
    await sharp(inputPath)
      .resize(size.width, size.height, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ 
        quality: 85,
        effort: 6
      })
      .toFile(outputPath);
    
    console.log(`✅ Optimized: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error optimizing ${inputPath}:`, error.message);
  }
}

async function optimizeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️ Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);
  const imageFiles = files.filter(file => 
    /\.(jpg|jpeg|png)$/i.test(file) && !file.includes('.webp')
  );

  console.log(`\n📁 Processing ${dirPath}: ${imageFiles.length} images`);

  for (const file of imageFiles) {
    const inputPath = path.join(dirPath, file);
    const baseName = path.parse(file).name;
    
    // Create optimized versions
    const heroOutput = path.join(dirPath, `${baseName}-hero.webp`);
    const mediumOutput = path.join(dirPath, `${baseName}-medium.webp`);
    const thumbnailOutput = path.join(dirPath, `${baseName}-thumb.webp`);

    // Optimize for different sizes
    await optimizeImage(inputPath, heroOutput, sizes.hero);
    await optimizeImage(inputPath, mediumOutput, sizes.medium);
    await optimizeImage(inputPath, thumbnailOutput, sizes.thumbnail);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');

  for (const dir of directories) {
    await optimizeDirectory(dir);
  }

  console.log('\n✨ Image optimization complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Update image references in components to use .webp files');
  console.log('2. Consider using responsive images with different sizes');
  console.log('3. Test loading performance improvements');
}

main().catch(console.error); 
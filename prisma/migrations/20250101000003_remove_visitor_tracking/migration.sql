-- Remove all visitor tracking functionality
-- Drop visitor-related tables
DROP TABLE IF EXISTS `visitors`;
DROP TABLE IF EXISTS `gallery_image_likes`;
DROP TABLE IF EXISTS `gallery_image_views`;
DROP TABLE IF EXISTS `gallery_media_categories`;
DROP TABLE IF EXISTS `gallery_media_locations`;

-- Remove visitor-related columns from gallery_images
ALTER TABLE `gallery_images` 
DROP COLUMN `category_id`,
DROP COLUMN `location_id`,
DROP COLUMN `description`,
DROP COLUMN `photographer`,
DROP COLUMN `date`,
DROP COLUMN `likes`,
DROP COLUMN `display_order`;

-- Remove visitor-related columns from gallery_videos
ALTER TABLE `gallery_videos` 
DROP COLUMN `category_id`,
DROP COLUMN `location_id`,
DROP COLUMN `description`,
DROP COLUMN `photographer`,
DROP COLUMN `likes`,
DROP COLUMN `display_order`; 
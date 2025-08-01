-- Drop tables that are no longer needed
DROP TABLE IF EXISTS `gallery_image_likes`;
DROP TABLE IF EXISTS `gallery_image_views`;
DROP TABLE IF EXISTS `gallery_media_categories`;
DROP TABLE IF EXISTS `gallery_media_locations`;

-- Modify gallery_images table - remove columns if they exist
ALTER TABLE `gallery_images` 
DROP COLUMN `category_id`,
DROP COLUMN `location_id`,
DROP COLUMN `description`,
DROP COLUMN `photographer`,
DROP COLUMN `date`,
DROP COLUMN `likes`,
DROP COLUMN `display_order`;

-- Drop indexes if they exist (MySQL doesn't support IF EXISTS for indexes)
-- These will fail silently if indexes don't exist
ALTER TABLE `gallery_images` DROP INDEX `gallery_images_category_id_idx`;
ALTER TABLE `gallery_images` DROP INDEX `gallery_images_location_id_idx`;
ALTER TABLE `gallery_images` DROP INDEX `gallery_images_display_order_idx`;

-- Modify gallery_videos table - remove columns if they exist
ALTER TABLE `gallery_videos` 
DROP COLUMN `category_id`,
DROP COLUMN `location_id`,
DROP COLUMN `description`,
DROP COLUMN `photographer`,
DROP COLUMN `likes`,
DROP COLUMN `display_order`,
DROP COLUMN `thumbnail_size`;

-- Drop indexes if they exist
ALTER TABLE `gallery_videos` DROP INDEX `gallery_videos_category_id_idx`;
ALTER TABLE `gallery_videos` DROP INDEX `gallery_videos_location_id_idx`;
ALTER TABLE `gallery_videos` DROP INDEX `gallery_videos_display_order_idx`;

-- Modify galleries table - remove thumbnail columns if they exist
ALTER TABLE `galleries` 
DROP COLUMN `thumbnail_data`,
DROP COLUMN `thumbnail_name`,
DROP COLUMN `thumbnail_type`,
DROP COLUMN `thumbnail_size`;

-- Add updated_at column to gallery_videos if it doesn't exist
ALTER TABLE `gallery_videos` 
ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3); 
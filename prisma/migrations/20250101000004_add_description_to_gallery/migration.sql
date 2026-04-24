-- Add description field to gallery_images
ALTER TABLE `gallery_images` 
ADD COLUMN `description` TEXT;

-- Clean up gallery_videos table - remove leftover fields
ALTER TABLE `gallery_videos` 
DROP COLUMN `category_id`,
DROP COLUMN `location_id`,
DROP COLUMN `photographer`,
DROP COLUMN `likes`,
DROP COLUMN `display_order`; 
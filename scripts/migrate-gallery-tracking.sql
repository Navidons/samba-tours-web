-- Migration script for gallery likes and views tracking
-- Run this script to add the necessary tables for tracking gallery interactions

-- Create gallery_image_likes table
CREATE TABLE IF NOT EXISTS `gallery_image_likes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `visitor_id` varchar(255) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `imageId_visitorId` (`image_id`, `visitor_id`),
  KEY `gallery_image_likes_image_id_idx` (`image_id`),
  KEY `gallery_image_likes_visitor_id_idx` (`visitor_id`),
  KEY `gallery_image_likes_created_at_idx` (`created_at`),
  CONSTRAINT `gallery_image_likes_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `gallery_images` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create gallery_image_views table
CREATE TABLE IF NOT EXISTS `gallery_image_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `visitor_id` varchar(255) NOT NULL,
  `viewed_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `gallery_image_views_image_id_idx` (`image_id`),
  KEY `gallery_image_views_visitor_id_idx` (`visitor_id`),
  KEY `gallery_image_views_viewed_at_idx` (`viewed_at`),
  CONSTRAINT `gallery_image_views_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `gallery_images` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes to existing gallery_images table if they don't exist
-- These indexes help with querying likes and views efficiently
ALTER TABLE `gallery_images` 
ADD INDEX IF NOT EXISTS `gallery_images_likes_idx` (`likes`),
ADD INDEX IF NOT EXISTS `gallery_images_views_idx` (`views`);

-- Insert some sample data for testing (optional)
-- Uncomment the following lines if you want to add some test likes and views

/*
INSERT INTO `gallery_image_likes` (`image_id`, `visitor_id`, `created_at`) VALUES
(1, 'visitor_test_1', NOW()),
(1, 'visitor_test_2', NOW()),
(2, 'visitor_test_1', NOW()),
(3, 'visitor_test_3', NOW());

INSERT INTO `gallery_image_views` (`image_id`, `visitor_id`, `viewed_at`) VALUES
(1, 'visitor_test_1', NOW()),
(1, 'visitor_test_2', NOW()),
(2, 'visitor_test_1', NOW()),
(3, 'visitor_test_3', NOW()),
(4, 'visitor_test_1', NOW());

-- Update the likes and views counts in gallery_images table
UPDATE `gallery_images` SET `likes` = 2 WHERE `id` = 1;
UPDATE `gallery_images` SET `likes` = 1 WHERE `id` = 2;
UPDATE `gallery_images` SET `likes` = 1 WHERE `id` = 3;
UPDATE `gallery_images` SET `views` = 2 WHERE `id` = 1;
UPDATE `gallery_images` SET `views` = 1 WHERE `id` = 2;
UPDATE `gallery_images` SET `views` = 1 WHERE `id` = 3;
UPDATE `gallery_images` SET `views` = 1 WHERE `id` = 4;
*/ 
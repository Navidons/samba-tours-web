-- Update gallery_videos table to store YouTube URLs instead of video files
ALTER TABLE `gallery_videos` 
DROP COLUMN IF EXISTS `video_data`,
DROP COLUMN IF EXISTS `video_name`,
DROP COLUMN IF EXISTS `video_type`,
DROP COLUMN IF EXISTS `video_size`,
DROP COLUMN IF EXISTS `thumbnail_size`;

-- Add new columns for YouTube URLs
ALTER TABLE `gallery_videos` 
ADD COLUMN `video_url` VARCHAR(500) NOT NULL DEFAULT '',
ADD COLUMN `video_provider` VARCHAR(50) NULL,
ADD COLUMN `video_id` VARCHAR(100) NULL;

-- Add index for video provider
ALTER TABLE `gallery_videos` 
ADD INDEX `gallery_videos_video_provider_idx` (`video_provider`); 
-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role_name` VARCHAR(255) NOT NULL,
    `description` VARCHAR(255) NULL,
    `permissions` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_roles_role_name_key`(`role_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `email_confirmed` BOOLEAN NOT NULL DEFAULT false,
    `email_verification_token` VARCHAR(255) NULL,
    `password_reset_token` VARCHAR(255) NULL,
    `password_reset_expires` DATETIME(3) NULL,
    `last_sign_in_at` DATETIME(3) NULL,
    `failed_login_attempts` INTEGER NOT NULL DEFAULT 0,
    `account_locked_until` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_email_idx`(`email`),
    INDEX `users_email_verification_token_idx`(`email_verification_token`),
    INDEX `users_password_reset_token_idx`(`password_reset_token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `profiles` (
    `id` INTEGER NOT NULL,
    `full_name` VARCHAR(255) NULL,
    `first_name` VARCHAR(100) NULL,
    `last_name` VARCHAR(100) NULL,
    `phone` VARCHAR(50) NULL,
    `avatar_data` LONGBLOB NULL,
    `avatar_name` VARCHAR(255) NULL,
    `avatar_type` VARCHAR(50) NULL,
    `avatar_size` INTEGER NULL,
    `date_of_birth` DATE NULL,
    `gender` ENUM('male', 'female', 'other', 'prefer_not_to_say') NULL,
    `nationality` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `preferences` JSON NULL,
    `role_id` INTEGER NULL DEFAULT 1,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `last_activity` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `profiles_role_id_idx`(`role_id`),
    INDEX `profiles_is_active_idx`(`is_active`),
    INDEX `profiles_country_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image_data` LONGBLOB NULL,
    `image_name` VARCHAR(255) NULL,
    `image_type` VARCHAR(50) NULL,
    `image_size` INTEGER NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tour_categories_name_key`(`name`),
    UNIQUE INDEX `tour_categories_slug_key`(`slug`),
    INDEX `tour_categories_slug_idx`(`slug`),
    INDEX `tour_categories_is_active_idx`(`is_active`),
    INDEX `tour_categories_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tours` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `short_description` VARCHAR(500) NOT NULL,
    `category_id` INTEGER NULL,
    `duration` VARCHAR(100) NOT NULL,
    `group_size` VARCHAR(100) NOT NULL,
    `max_group_size` INTEGER NOT NULL DEFAULT 12,
    `price` DECIMAL(10, 2) NOT NULL,
    `original_price` DECIMAL(10, 2) NULL,
    `difficulty` ENUM('Easy', 'Moderate', 'Challenging', 'Extreme') NOT NULL DEFAULT 'Moderate',
    `location_country` VARCHAR(255) NOT NULL DEFAULT 'Uganda',
    `location_region` VARCHAR(255) NULL,
    `location_coordinates_lat` DECIMAL(10, 8) NULL,
    `location_coordinates_lng` DECIMAL(11, 8) NULL,
    `featured_image_data` LONGBLOB NULL,
    `featured_image_name` VARCHAR(255) NULL,
    `featured_image_type` VARCHAR(50) NULL,
    `featured_image_size` INTEGER NULL,
    `status` ENUM('active', 'draft', 'inactive', 'archived') NOT NULL DEFAULT 'active',
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `popular` BOOLEAN NOT NULL DEFAULT false,
    `is_new` BOOLEAN NOT NULL DEFAULT false,
    `rating` DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
    `review_count` INTEGER NOT NULL DEFAULT 0,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `booking_count` INTEGER NOT NULL DEFAULT 0,
    `best_time` JSON NULL,
    `physical_requirements` TEXT NULL,
    `what_to_bring` JSON NULL,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tours_slug_key`(`slug`),
    INDEX `tours_slug_idx`(`slug`),
    INDEX `tours_status_idx`(`status`),
    INDEX `tours_featured_idx`(`featured`),
    INDEX `tours_popular_idx`(`popular`),
    INDEX `tours_category_id_idx`(`category_id`),
    INDEX `tours_price_idx`(`price`),
    INDEX `tours_rating_idx`(`rating`),
    INDEX `tours_created_at_idx`(`created_at`),
    INDEX `tours_created_by_fkey`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `image_data` LONGBLOB NOT NULL,
    `image_name` VARCHAR(255) NULL,
    `image_type` VARCHAR(50) NULL,
    `image_size` INTEGER NULL,
    `alt_text` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `tour_images_tour_id_idx`(`tour_id`),
    INDEX `tour_images_is_featured_idx`(`is_featured`),
    INDEX `tour_images_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_highlights` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `highlight` VARCHAR(500) NOT NULL,
    `icon` VARCHAR(100) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `tour_highlights_tour_id_idx`(`tour_id`),
    INDEX `tour_highlights_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_inclusions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `item` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'general',
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `tour_inclusions_tour_id_idx`(`tour_id`),
    INDEX `tour_inclusions_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_exclusions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `item` VARCHAR(500) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `tour_exclusions_tour_id_idx`(`tour_id`),
    INDEX `tour_exclusions_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_itineraries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `day` INTEGER NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `location` VARCHAR(255) NULL,
    `activities` JSON NULL,
    `accommodation` VARCHAR(255) NULL,
    `meals` JSON NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `tour_itineraries_tour_id_idx`(`tour_id`),
    INDEX `tour_itineraries_day_idx`(`day`),
    UNIQUE INDEX `tour_itineraries_tour_id_day_key`(`tour_id`, `day`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_best_times` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `best_time_item` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `tour_best_times_tour_id_idx`(`tour_id`),
    INDEX `tour_best_times_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_physical_requirements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `requirement` VARCHAR(500) NOT NULL,
    `category` VARCHAR(100) NOT NULL DEFAULT 'general',
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `tour_physical_requirements_tour_id_idx`(`tour_id`),
    INDEX `tour_physical_requirements_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `image_data` LONGBLOB NULL,
    `image_name` VARCHAR(255) NULL,
    `image_type` VARCHAR(50) NULL,
    `image_size` INTEGER NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_categories_name_key`(`name`),
    UNIQUE INDEX `blog_categories_slug_key`(`slug`),
    INDEX `blog_categories_slug_idx`(`slug`),
    INDEX `blog_categories_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_authors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `bio` TEXT NULL,
    `avatar_data` LONGBLOB NULL,
    `avatar_name` VARCHAR(255) NULL,
    `avatar_type` VARCHAR(50) NULL,
    `avatar_size` INTEGER NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `blog_authors_name_idx`(`name`),
    INDEX `blog_authors_email_idx`(`email`),
    INDEX `blog_authors_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tags` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `blog_tags_name_key`(`name`),
    UNIQUE INDEX `blog_tags_slug_key`(`slug`),
    INDEX `blog_tags_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_posts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` TEXT NOT NULL,
    `content` LONGTEXT NOT NULL,
    `content_html` LONGTEXT NULL,
    `category_id` INTEGER NULL,
    `author_id` INTEGER NULL,
    `status` ENUM('draft', 'published', 'archived') NOT NULL DEFAULT 'draft',
    `publish_date` DATETIME(3) NULL,
    `read_time_minutes` INTEGER NULL,
    `view_count` INTEGER NOT NULL DEFAULT 0,
    `like_count` INTEGER NOT NULL DEFAULT 0,
    `comment_count` INTEGER NOT NULL DEFAULT 0,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `thumbnail_data` LONGBLOB NULL,
    `thumbnail_name` VARCHAR(255) NULL,
    `thumbnail_type` VARCHAR(50) NULL,
    `thumbnail_size` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `blog_posts_slug_key`(`slug`),
    INDEX `blog_posts_slug_idx`(`slug`),
    INDEX `blog_posts_status_idx`(`status`),
    INDEX `blog_posts_featured_idx`(`featured`),
    INDEX `blog_posts_category_id_idx`(`category_id`),
    INDEX `blog_posts_publish_date_idx`(`publish_date`),
    INDEX `blog_posts_author_id_idx`(`author_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_post_tag_mappings` (
    `post_id` INTEGER NOT NULL,
    `tag_id` INTEGER NOT NULL,

    INDEX `blog_post_tag_mappings_post_id_idx`(`post_id`),
    INDEX `blog_post_tag_mappings_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`post_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_comments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `author_name` VARCHAR(255) NOT NULL,
    `author_email` VARCHAR(255) NULL,
    `content` TEXT NOT NULL,
    `parent_comment_id` INTEGER NULL,
    `status` ENUM('pending', 'approved', 'spam') NOT NULL DEFAULT 'pending',
    `likes` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `blog_comments_post_id_idx`(`post_id`),
    INDEX `blog_comments_status_idx`(`status`),
    INDEX `blog_comments_created_at_idx`(`created_at`),
    INDEX `blog_comments_parent_comment_id_idx`(`parent_comment_id`),
    INDEX `blog_comments_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comment_reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `comment_id` INTEGER NOT NULL,
    `reporter_name` VARCHAR(255) NOT NULL,
    `reporter_email` VARCHAR(255) NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('pending', 'reviewed', 'resolved', 'dismissed') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `comment_reports_comment_id_idx`(`comment_id`),
    INDEX `comment_reports_status_idx`(`status`),
    INDEX `comment_reports_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_media_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `color` VARCHAR(7) NOT NULL DEFAULT '#10B981',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gallery_media_categories_name_key`(`name`),
    UNIQUE INDEX `gallery_media_categories_slug_key`(`slug`),
    INDEX `gallery_media_categories_slug_idx`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_media_locations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `country` VARCHAR(100) NULL,
    `region` VARCHAR(100) NULL,
    `coordinates_lat` DECIMAL(10, 8) NULL,
    `coordinates_lng` DECIMAL(11, 8) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `gallery_media_locations_name_key`(`name`),
    UNIQUE INDEX `gallery_media_locations_slug_key`(`slug`),
    INDEX `gallery_media_locations_slug_idx`(`slug`),
    INDEX `gallery_media_locations_country_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `galleries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `thumbnail_data` LONGBLOB NULL,
    `thumbnail_name` VARCHAR(255) NULL,
    `thumbnail_type` VARCHAR(50) NULL,
    `thumbnail_size` INTEGER NULL,
    `image_count` INTEGER NOT NULL DEFAULT 0,
    `video_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `galleries_slug_key`(`slug`),
    INDEX `galleries_slug_idx`(`slug`),
    INDEX `galleries_featured_idx`(`featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gallery_id` INTEGER NULL,
    `image_data` LONGBLOB NOT NULL,
    `image_name` VARCHAR(255) NULL,
    `image_type` VARCHAR(50) NULL,
    `image_size` INTEGER NULL,
    `alt` VARCHAR(255) NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `photographer` VARCHAR(255) NULL,
    `date` DATE NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `category_id` INTEGER NULL,
    `location_id` INTEGER NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `gallery_images_gallery_id_idx`(`gallery_id`),
    INDEX `gallery_images_featured_idx`(`featured`),
    INDEX `gallery_images_category_id_idx`(`category_id`),
    INDEX `gallery_images_location_id_idx`(`location_id`),
    INDEX `gallery_images_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_image_likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_id` INTEGER NOT NULL,
    `visitor_id` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `gallery_image_likes_image_id_idx`(`image_id`),
    INDEX `gallery_image_likes_visitor_id_idx`(`visitor_id`),
    INDEX `gallery_image_likes_created_at_idx`(`created_at`),
    UNIQUE INDEX `gallery_image_likes_image_id_visitor_id_key`(`image_id`, `visitor_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_image_views` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `image_id` INTEGER NOT NULL,
    `visitor_id` VARCHAR(255) NOT NULL,
    `viewed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `gallery_image_views_image_id_idx`(`image_id`),
    INDEX `gallery_image_views_visitor_id_idx`(`visitor_id`),
    INDEX `gallery_image_views_viewed_at_idx`(`viewed_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `gallery_videos` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `gallery_id` INTEGER NULL,
    `video_data` LONGBLOB NOT NULL,
    `video_name` VARCHAR(255) NULL,
    `video_type` VARCHAR(50) NULL,
    `video_size` INTEGER NULL,
    `thumbnail_data` LONGBLOB NULL,
    `thumbnail_name` VARCHAR(255) NULL,
    `thumbnail_type` VARCHAR(50) NULL,
    `thumbnail_size` INTEGER NULL,
    `title` VARCHAR(255) NULL,
    `description` TEXT NULL,
    `duration` INTEGER NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `category_id` INTEGER NULL,
    `location_id` INTEGER NULL,
    `photographer` VARCHAR(255) NULL,
    `likes` INTEGER NOT NULL DEFAULT 0,
    `views` INTEGER NOT NULL DEFAULT 0,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `gallery_videos_gallery_id_idx`(`gallery_id`),
    INDEX `gallery_videos_featured_idx`(`featured`),
    INDEX `gallery_videos_category_id_idx`(`category_id`),
    INDEX `gallery_videos_location_id_idx`(`location_id`),
    INDEX `gallery_videos_display_order_idx`(`display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `country` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `address` TEXT NULL,
    `total_bookings` INTEGER NOT NULL DEFAULT 0,
    `total_spent` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `first_booking_date` DATETIME(3) NULL,
    `last_booking_date` DATETIME(3) NULL,
    `status` ENUM('active', 'inactive', 'blocked') NOT NULL DEFAULT 'active',
    `customer_type` ENUM('regular', 'vip', 'repeat', 'new') NOT NULL DEFAULT 'new',
    `loyalty_points` INTEGER NOT NULL DEFAULT 0,
    `preferred_contact_method` ENUM('email', 'phone', 'whatsapp') NOT NULL DEFAULT 'email',
    `preferred_contact_time` VARCHAR(100) NULL,
    `notes` TEXT NULL,
    `join_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `customers_email_key`(`email`),
    INDEX `customers_email_idx`(`email`),
    INDEX `customers_status_idx`(`status`),
    INDEX `customers_customer_type_idx`(`customer_type`),
    INDEX `customers_country_idx`(`country`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_reference` VARCHAR(50) NOT NULL,
    `tour_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `customer_id` INTEGER NULL,
    `customer_name` VARCHAR(255) NOT NULL,
    `customer_email` VARCHAR(255) NOT NULL,
    `customer_phone` VARCHAR(50) NULL,
    `customer_country` VARCHAR(100) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `guest_count` INTEGER NOT NULL,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    `final_amount` DECIMAL(12, 2) NOT NULL,
    `special_requests` TEXT NULL,
    `status` ENUM('pending', 'confirmed', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
    `payment_status` ENUM('pending', 'paid', 'partially_paid', 'refunded') NOT NULL DEFAULT 'pending',
    `cancellation_reason` TEXT NULL,
    `staff_notes` TEXT NULL,
    `contact_method` ENUM('email', 'phone', 'whatsapp') NOT NULL DEFAULT 'email',
    `preferred_contact_time` VARCHAR(100) NULL,
    `email_sent` BOOLEAN NOT NULL DEFAULT false,
    `email_sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `bookings_booking_reference_key`(`booking_reference`),
    INDEX `bookings_booking_reference_idx`(`booking_reference`),
    INDEX `bookings_status_idx`(`status`),
    INDEX `bookings_payment_status_idx`(`payment_status`),
    INDEX `bookings_customer_email_idx`(`customer_email`),
    INDEX `bookings_tour_id_idx`(`tour_id`),
    INDEX `bookings_user_id_idx`(`user_id`),
    INDEX `bookings_customer_id_idx`(`customer_id`),
    INDEX `bookings_start_date_end_date_idx`(`start_date`, `end_date`),
    INDEX `bookings_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_guests` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `guest_name` VARCHAR(255) NOT NULL,
    `guest_age` INTEGER NULL,
    `dietary_restrictions` TEXT NULL,
    `medical_conditions` TEXT NULL,
    `passport_number` VARCHAR(50) NULL,
    `nationality` VARCHAR(100) NULL,
    `emergency_contact` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_guests_booking_id_idx`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `booking_communications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `communication_type` ENUM('email', 'phone', 'whatsapp', 'in_person', 'sms') NOT NULL,
    `communication_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `staff_member` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NULL,
    `message` TEXT NULL,
    `outcome` VARCHAR(255) NULL,
    `next_follow_up_date` DATE NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `booking_communications_booking_id_idx`(`booking_id`),
    INDEX `booking_communications_communication_date_idx`(`communication_date`),
    INDEX `booking_communications_communication_type_idx`(`communication_type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tour_reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tour_id` INTEGER NOT NULL,
    `user_id` INTEGER NULL,
    `booking_id` INTEGER NULL,
    `reviewer_name` VARCHAR(255) NOT NULL,
    `reviewer_email` VARCHAR(255) NULL,
    `user_image` LONGBLOB NULL,
    `rating` TINYINT NOT NULL,
    `title` VARCHAR(255) NULL,
    `comment` TEXT NOT NULL,
    `tour_date` DATE NULL,
    `would_recommend` BOOLEAN NULL,
    `is_verified` BOOLEAN NOT NULL DEFAULT false,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `helpful_count` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `tour_reviews_tour_id_idx`(`tour_id`),
    INDEX `tour_reviews_user_id_idx`(`user_id`),
    INDEX `tour_reviews_rating_idx`(`rating`),
    INDEX `tour_reviews_status_idx`(`status`),
    INDEX `tour_reviews_is_verified_idx`(`is_verified`),
    INDEX `tour_reviews_is_featured_idx`(`is_featured`),
    INDEX `tour_reviews_created_at_idx`(`created_at`),
    INDEX `tour_reviews_booking_id_fkey`(`booking_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `payment_reference` VARCHAR(100) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `payment_method` VARCHAR(100) NOT NULL,
    `payment_provider` VARCHAR(100) NULL,
    `transaction_id` VARCHAR(255) NULL,
    `status` ENUM('pending', 'paid', 'partially_paid', 'refunded') NOT NULL,
    `gateway_response` JSON NULL,
    `payment_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `refund_date` DATETIME(3) NULL,
    `refund_amount` DECIMAL(10, 2) NULL,
    `refund_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_payment_reference_key`(`payment_reference`),
    INDEX `payments_booking_id_idx`(`booking_id`),
    INDEX `payments_payment_reference_idx`(`payment_reference`),
    INDEX `payments_status_idx`(`status`),
    INDEX `payments_payment_method_idx`(`payment_method`),
    INDEX `payments_payment_date_idx`(`payment_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wishlist_items` (
    `user_id` INTEGER NOT NULL,
    `tour_id` INTEGER NOT NULL,
    `added_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wishlist_items_user_id_idx`(`user_id`),
    INDEX `wishlist_items_tour_id_idx`(`tour_id`),
    INDEX `wishlist_items_added_at_idx`(`added_at`),
    PRIMARY KEY (`user_id`, `tour_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(50) NULL,
    `subject` VARCHAR(255) NULL,
    `message` TEXT NOT NULL,
    `tour_interest` VARCHAR(255) NULL,
    `priority` ENUM('Low', 'Normal', 'High', 'Urgent') NOT NULL DEFAULT 'Normal',
    `status` ENUM('new', 'read', 'replied', 'archived') NOT NULL DEFAULT 'new',
    `assigned_to` INTEGER NULL,
    `replied_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `contact_inquiries_status_idx`(`status`),
    INDEX `contact_inquiries_priority_idx`(`priority`),
    INDEX `contact_inquiries_created_at_idx`(`created_at`),
    INDEX `contact_inquiries_email_idx`(`email`),
    INDEX `contact_inquiries_assigned_to_fkey`(`assigned_to`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `newsletter_subscribers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NULL,
    `interests` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `source` VARCHAR(100) NULL,
    `metadata` JSON NULL,
    `subscribed_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `unsubscribed_at` DATETIME(3) NULL,

    UNIQUE INDEX `newsletter_subscribers_email_key`(`email`),
    INDEX `newsletter_subscribers_email_idx`(`email`),
    INDEX `newsletter_subscribers_is_active_idx`(`is_active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `unique_identifier` VARCHAR(255) NOT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `device_type` VARCHAR(50) NULL,
    `browser` VARCHAR(100) NULL,
    `operating_system` VARCHAR(100) NULL,
    `country` VARCHAR(100) NULL,
    `city` VARCHAR(100) NULL,
    `latitude` DECIMAL(10, 8) NULL,
    `longitude` DECIMAL(11, 8) NULL,
    `timezone` VARCHAR(50) NULL,
    `language` VARCHAR(10) NULL,
    `referrer` TEXT NULL,
    `page_visited` VARCHAR(500) NULL,
    `is_mobile` BOOLEAN NOT NULL DEFAULT false,
    `first_visit_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `last_visit_at` DATETIME(3) NOT NULL,
    `total_visits` INTEGER NOT NULL DEFAULT 1,

    UNIQUE INDEX `visitors_unique_identifier_key`(`unique_identifier`),
    INDEX `visitors_unique_identifier_idx`(`unique_identifier`),
    INDEX `visitors_country_idx`(`country`),
    INDEX `visitors_first_visit_at_idx`(`first_visit_at`),
    INDEX `visitors_ip_address_idx`(`ip_address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NULL,
    `customer_id` INTEGER NULL,
    `type` ENUM('booking_confirmation', 'booking_reminder', 'payment_received', 'payment_failed', 'tour_update', 'system_alert', 'marketing', 'review_request') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `data` JSON NULL,
    `priority` ENUM('low', 'normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
    `status` ENUM('unread', 'read', 'archived') NOT NULL DEFAULT 'unread',
    `read_at` DATETIME(3) NULL,
    `sent_via` ENUM('email', 'sms', 'push', 'in_app') NOT NULL DEFAULT 'in_app',
    `sent_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_user_id_idx`(`user_id`),
    INDEX `notifications_customer_id_idx`(`customer_id`),
    INDEX `notifications_type_idx`(`type`),
    INDEX `notifications_status_idx`(`status`),
    INDEX `notifications_priority_idx`(`priority`),
    INDEX `notifications_created_at_idx`(`created_at`),
    INDEX `notifications_user_id_status_idx`(`user_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_templates` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `html_content` LONGTEXT NOT NULL,
    `text_content` TEXT NULL,
    `variables` JSON NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `email_templates_name_key`(`name`),
    UNIQUE INDEX `email_templates_slug_key`(`slug`),
    INDEX `email_templates_slug_idx`(`slug`),
    INDEX `email_templates_is_active_idx`(`is_active`),
    INDEX `email_templates_is_system_idx`(`is_system`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_campaigns` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `template_id` INTEGER NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `custom_data` JSON NULL,
    `status` ENUM('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled', 'failed') NOT NULL DEFAULT 'draft',
    `scheduled_at` DATETIME(3) NULL,
    `sent_at` DATETIME(3) NULL,
    `total_recipients` INTEGER NOT NULL DEFAULT 0,
    `sent_count` INTEGER NOT NULL DEFAULT 0,
    `failed_count` INTEGER NOT NULL DEFAULT 0,
    `open_count` INTEGER NOT NULL DEFAULT 0,
    `click_count` INTEGER NOT NULL DEFAULT 0,
    `created_by` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `email_campaigns_template_id_idx`(`template_id`),
    INDEX `email_campaigns_status_idx`(`status`),
    INDEX `email_campaigns_scheduled_at_idx`(`scheduled_at`),
    INDEX `email_campaigns_created_at_idx`(`created_at`),
    INDEX `email_campaigns_created_by_fkey`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emails_sent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `campaign_id` INTEGER NULL,
    `template_id` INTEGER NOT NULL,
    `recipient_email` VARCHAR(255) NOT NULL,
    `recipient_name` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NOT NULL,
    `html_content` LONGTEXT NOT NULL,
    `text_content` TEXT NULL,
    `custom_data` JSON NULL,
    `message_id` VARCHAR(255) NULL,
    `status` ENUM('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed', 'spam') NOT NULL DEFAULT 'sent',
    `sent_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `delivered_at` DATETIME(3) NULL,
    `opened_at` DATETIME(3) NULL,
    `clicked_at` DATETIME(3) NULL,
    `bounced_at` DATETIME(3) NULL,
    `bounce_reason` TEXT NULL,
    `error_message` TEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` TEXT NULL,
    `created_by` INTEGER NULL,

    INDEX `emails_sent_campaign_id_idx`(`campaign_id`),
    INDEX `emails_sent_template_id_idx`(`template_id`),
    INDEX `emails_sent_recipient_email_idx`(`recipient_email`),
    INDEX `emails_sent_status_idx`(`status`),
    INDEX `emails_sent_sent_at_idx`(`sent_at`),
    INDEX `emails_sent_message_id_idx`(`message_id`),
    INDEX `emails_sent_created_by_fkey`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_id_fkey` FOREIGN KEY (`id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `user_roles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tours` ADD CONSTRAINT `tours_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `tour_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tours` ADD CONSTRAINT `tours_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_images` ADD CONSTRAINT `tour_images_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_highlights` ADD CONSTRAINT `tour_highlights_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_inclusions` ADD CONSTRAINT `tour_inclusions_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_exclusions` ADD CONSTRAINT `tour_exclusions_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_itineraries` ADD CONSTRAINT `tour_itineraries_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_best_times` ADD CONSTRAINT `tour_best_times_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_physical_requirements` ADD CONSTRAINT `tour_physical_requirements_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `blog_authors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_post_tag_mappings` ADD CONSTRAINT `blog_post_tag_mappings_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_post_tag_mappings` ADD CONSTRAINT `blog_post_tag_mappings_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_parent_comment_id_fkey` FOREIGN KEY (`parent_comment_id`) REFERENCES `blog_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_post_id_fkey` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_reports` ADD CONSTRAINT `comment_reports_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `blog_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_images` ADD CONSTRAINT `gallery_images_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `gallery_media_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_images` ADD CONSTRAINT `gallery_images_gallery_id_fkey` FOREIGN KEY (`gallery_id`) REFERENCES `galleries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_images` ADD CONSTRAINT `gallery_images_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `gallery_media_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_image_likes` ADD CONSTRAINT `gallery_image_likes_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `gallery_images`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_image_views` ADD CONSTRAINT `gallery_image_views_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `gallery_images`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_videos` ADD CONSTRAINT `gallery_videos_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `gallery_media_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_videos` ADD CONSTRAINT `gallery_videos_gallery_id_fkey` FOREIGN KEY (`gallery_id`) REFERENCES `galleries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `gallery_videos` ADD CONSTRAINT `gallery_videos_location_id_fkey` FOREIGN KEY (`location_id`) REFERENCES `gallery_media_locations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_guests` ADD CONSTRAINT `booking_guests_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `booking_communications` ADD CONSTRAINT `booking_communications_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_reviews` ADD CONSTRAINT `tour_reviews_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_reviews` ADD CONSTRAINT `tour_reviews_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tour_reviews` ADD CONSTRAINT `tour_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wishlist_items` ADD CONSTRAINT `wishlist_items_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contact_inquiries` ADD CONSTRAINT `contact_inquiries_assigned_to_fkey` FOREIGN KEY (`assigned_to`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_customer_id_fkey` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_campaigns` ADD CONSTRAINT `email_campaigns_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_campaigns` ADD CONSTRAINT `email_campaigns_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emails_sent` ADD CONSTRAINT `emails_sent_campaign_id_fkey` FOREIGN KEY (`campaign_id`) REFERENCES `email_campaigns`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emails_sent` ADD CONSTRAINT `emails_sent_created_by_fkey` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emails_sent` ADD CONSTRAINT `emails_sent_template_id_fkey` FOREIGN KEY (`template_id`) REFERENCES `email_templates`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

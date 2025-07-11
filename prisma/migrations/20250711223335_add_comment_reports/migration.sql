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

-- AddForeignKey
ALTER TABLE `comment_reports` ADD CONSTRAINT `comment_reports_comment_id_fkey` FOREIGN KEY (`comment_id`) REFERENCES `blog_comments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

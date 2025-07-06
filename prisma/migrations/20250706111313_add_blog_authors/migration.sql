-- DropForeignKey
ALTER TABLE `blog_posts` DROP FOREIGN KEY `blog_posts_author_id_fkey`;

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

-- AddForeignKey
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `blog_authors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

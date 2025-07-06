-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `bookings_tour_id_fkey`;

-- AlterTable
ALTER TABLE `tour_reviews` ADD COLUMN `user_image` LONGBLOB NULL;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_tour_id_fkey` FOREIGN KEY (`tour_id`) REFERENCES `tours`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

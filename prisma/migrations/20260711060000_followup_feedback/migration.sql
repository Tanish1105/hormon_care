-- AlterTable
ALTER TABLE `WeeklyFollowup` ADD COLUMN `planFeedback` VARCHAR(191) NULL,
    ADD COLUMN `feedbackLikedNotes` TEXT NULL,
    ADD COLUMN `feedbackDislikedNotes` TEXT NULL,
    ADD COLUMN `feedbackBadNotes` TEXT NULL,
    ADD COLUMN `feedbackGoodNotes` TEXT NULL;

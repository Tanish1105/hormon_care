-- AlterTable
ALTER TABLE `LifestyleAssessment` ADD COLUMN `accessToken` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `LifestyleAssessment_accessToken_key` ON `LifestyleAssessment`(`accessToken`);

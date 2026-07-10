-- AlterTable
ALTER TABLE `PatientProfile` ADD COLUMN `followupAccessToken` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `PatientProfile_followupAccessToken_key` ON `PatientProfile`(`followupAccessToken`);

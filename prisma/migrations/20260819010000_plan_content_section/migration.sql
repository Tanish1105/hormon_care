-- AlterTable
ALTER TABLE `WeekContent` ADD COLUMN `section` VARCHAR(191) NOT NULL DEFAULT 'RECIPE';

-- AlterTable
ALTER TABLE `DayContent` ADD COLUMN `section` VARCHAR(191) NOT NULL DEFAULT 'RECIPE';

UPDATE `WeekContent` SET `section` = 'EXERCISE' WHERE `type` = 'EXERCISE';
UPDATE `DayContent` SET `section` = 'EXERCISE' WHERE `type` = 'EXERCISE';

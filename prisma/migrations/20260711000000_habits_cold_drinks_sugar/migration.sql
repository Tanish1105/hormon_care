-- AlterTable
ALTER TABLE `LifestyleAssessment`
    DROP COLUMN `smoking`,
    DROP COLUMN `alcohol`,
    ADD COLUMN `coldDrinks` VARCHAR(191) NULL,
    ADD COLUMN `sugarItems` VARCHAR(191) NULL;

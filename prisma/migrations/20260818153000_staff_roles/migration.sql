-- AlterTable
ALTER TABLE `User` ADD COLUMN `doctorId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `PatientProfile` ADD COLUMN `doctorId` VARCHAR(191) NULL,
    ADD COLUMN `dietitianId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_doctorId_idx` ON `User`(`doctorId`);

-- CreateIndex
CREATE INDEX `PatientProfile_doctorId_idx` ON `PatientProfile`(`doctorId`);

-- CreateIndex
CREATE INDEX `PatientProfile_dietitianId_idx` ON `PatientProfile`(`dietitianId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_doctorId_fkey` FOREIGN KEY (`doctorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_dietitianId_fkey` FOREIGN KEY (`dietitianId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

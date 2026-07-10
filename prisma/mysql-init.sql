-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PatientProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requirements` TEXT NULL,
    `planId` VARCHAR(191) NULL,
    `garbhaPlanId` VARCHAR(191) NULL,
    `childGuidancePlanId` VARCHAR(191) NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `currentWeek` INTEGER NOT NULL DEFAULT 1,
    `followupAccessToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PatientProfile_userId_key`(`userId`),
    UNIQUE INDEX `PatientProfile_followupAccessToken_key`(`followupAccessToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LifestyleAssessment` (
    `id` VARCHAR(191) NOT NULL,
    `patientProfileId` VARCHAR(191) NOT NULL,
    `requestedAt` DATETIME(3) NULL,
    `submittedAt` DATETIME(3) NULL,
    `exerciseFrequency` VARCHAR(191) NULL,
    `exerciseDuration` VARCHAR(191) NULL,
    `exerciseType` VARCHAR(191) NULL,
    `heightCm` DOUBLE NULL,
    `weightKg` DOUBLE NULL,
    `bmi` DOUBLE NULL,
    `sleepHours` VARCHAR(191) NULL,
    `sleepQuality` VARCHAR(191) NULL,
    `nightShift` VARCHAR(191) NULL,
    `stressLevel` VARCHAR(191) NULL,
    `stressReason` TEXT NULL,
    `dietType` VARCHAR(191) NULL,
    `breakfast` VARCHAR(191) NULL,
    `fastFood` VARCHAR(191) NULL,
    `waterIntake` VARCHAR(191) NULL,
    `teaCoffee` VARCHAR(191) NULL,
    `coldDrinks` VARCHAR(191) NULL,
    `sugarItems` VARCHAR(191) NULL,
    `knownConditions` TEXT NULL,
    `irregularMenses` TEXT NULL,
    `supplements` TEXT NULL,
    `motherFamilyHistory` TEXT NULL,
    `fatherFamilyHistory` TEXT NULL,
    `partnerSmoking` VARCHAR(191) NULL,
    `partnerAlcohol` VARCHAR(191) NULL,
    `partnerExercise` VARCHAR(191) NULL,
    `lifestyleScore` INTEGER NULL,
    `doctorRecommendation` TEXT NULL,
    `accessToken` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LifestyleAssessment_patientProfileId_key`(`patientProfileId`),
    UNIQUE INDEX `LifestyleAssessment_accessToken_key`(`accessToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppSetting` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'default',
    `followupCompulsory` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeeklyFollowup` (
    `id` VARCHAR(191) NOT NULL,
    `patientProfileId` VARCHAR(191) NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `currentWeight` DOUBLE NOT NULL,
    `exerciseDays` INTEGER NOT NULL,
    `lowWaterDays` INTEGER NOT NULL,
    `shortSleepDays` INTEGER NOT NULL,
    `missedSupplementDays` INTEGER NOT NULL,
    `mealsDeviated` TEXT NULL,
    `planFeedback` VARCHAR(191) NULL,
    `feedbackLikedNotes` TEXT NULL,
    `feedbackDislikedNotes` TEXT NULL,
    `feedbackBadNotes` TEXT NULL,
    `feedbackGoodNotes` TEXT NULL,
    `waist` DOUBLE NULL,
    `chest` DOUBLE NULL,
    `thigh` DOUBLE NULL,
    `hip` DOUBLE NULL,
    `arm` DOUBLE NULL,
    `neck` DOUBLE NULL,
    `consentAgreed` BOOLEAN NOT NULL DEFAULT true,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WeeklyFollowup_patientProfileId_weekNumber_key`(`patientProfileId`, `weekNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `totalWeeks` INTEGER NOT NULL,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `isDayWise` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanWeek` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlanWeek_planId_weekNumber_key`(`planId`, `weekNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanDay` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlanDay_weekId_dayNumber_key`(`weekId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DayContent` (
    `id` VARCHAR(191) NOT NULL,
    `dayId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` TEXT NULL,
    `content` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WeekContent` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` TEXT NULL,
    `content` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarbhaPlan` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `totalWeeks` INTEGER NOT NULL,
    `isDayWise` BOOLEAN NOT NULL DEFAULT false,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarbhaWeek` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GarbhaWeek_planId_weekNumber_key`(`planId`, `weekNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarbhaDay` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `GarbhaDay_weekId_dayNumber_key`(`weekId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarbhaDayContent` (
    `id` VARCHAR(191) NOT NULL,
    `dayId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` TEXT NULL,
    `content` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GarbhaContent` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` TEXT NULL,
    `content` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildGuidancePlan` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `totalWeeks` INTEGER NOT NULL,
    `isDayWise` BOOLEAN NOT NULL DEFAULT false,
    `isCustom` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildGuidanceWeek` (
    `id` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `weekNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChildGuidanceWeek_planId_weekNumber_key`(`planId`, `weekNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildGuidanceDay` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `dayNumber` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ChildGuidanceDay_weekId_dayNumber_key`(`weekId`, `dayNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildGuidanceDayContent` (
    `id` VARCHAR(191) NOT NULL,
    `dayId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` TEXT NULL,
    `content` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChildGuidanceContent` (
    `id` VARCHAR(191) NOT NULL,
    `weekId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `url` TEXT NULL,
    `content` TEXT NULL,
    `imageUrl` TEXT NULL,
    `videoUrl` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_garbhaPlanId_fkey` FOREIGN KEY (`garbhaPlanId`) REFERENCES `GarbhaPlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PatientProfile` ADD CONSTRAINT `PatientProfile_childGuidancePlanId_fkey` FOREIGN KEY (`childGuidancePlanId`) REFERENCES `ChildGuidancePlan`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LifestyleAssessment` ADD CONSTRAINT `LifestyleAssessment_patientProfileId_fkey` FOREIGN KEY (`patientProfileId`) REFERENCES `PatientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeeklyFollowup` ADD CONSTRAINT `WeeklyFollowup_patientProfileId_fkey` FOREIGN KEY (`patientProfileId`) REFERENCES `PatientProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanWeek` ADD CONSTRAINT `PlanWeek_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanDay` ADD CONSTRAINT `PlanDay_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `PlanWeek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DayContent` ADD CONSTRAINT `DayContent_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `PlanDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WeekContent` ADD CONSTRAINT `WeekContent_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `PlanWeek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GarbhaWeek` ADD CONSTRAINT `GarbhaWeek_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `GarbhaPlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GarbhaDay` ADD CONSTRAINT `GarbhaDay_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `GarbhaWeek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GarbhaDayContent` ADD CONSTRAINT `GarbhaDayContent_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `GarbhaDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GarbhaContent` ADD CONSTRAINT `GarbhaContent_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `GarbhaWeek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildGuidanceWeek` ADD CONSTRAINT `ChildGuidanceWeek_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `ChildGuidancePlan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildGuidanceDay` ADD CONSTRAINT `ChildGuidanceDay_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `ChildGuidanceWeek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildGuidanceDayContent` ADD CONSTRAINT `ChildGuidanceDayContent_dayId_fkey` FOREIGN KEY (`dayId`) REFERENCES `ChildGuidanceDay`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ChildGuidanceContent` ADD CONSTRAINT `ChildGuidanceContent_weekId_fkey` FOREIGN KEY (`weekId`) REFERENCES `ChildGuidanceWeek`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

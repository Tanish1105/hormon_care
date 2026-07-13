-- Per-program start dates and week overrides for Care / Garbha / Child Guidance
ALTER TABLE `PatientProfile`
  ADD COLUMN `garbhaStartDate` DATETIME(3) NULL,
  ADD COLUMN `garbhaCurrentWeek` INT NOT NULL DEFAULT 1,
  ADD COLUMN `childGuidanceStartDate` DATETIME(3) NULL,
  ADD COLUMN `childGuidanceCurrentWeek` INT NOT NULL DEFAULT 1;

UPDATE `PatientProfile`
SET
  `garbhaStartDate` = `startDate`,
  `childGuidanceStartDate` = `startDate`,
  `garbhaCurrentWeek` = `currentWeek`,
  `childGuidanceCurrentWeek` = `currentWeek`;

ALTER TABLE `PatientProfile`
  MODIFY `garbhaStartDate` DATETIME(3) NOT NULL,
  MODIFY `childGuidanceStartDate` DATETIME(3) NOT NULL;

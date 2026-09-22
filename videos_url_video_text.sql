-- Migration: bring `videos` table in line with corn/video_processor.js + utils/keyManager.js
-- data.sql defines url_video INT DEFAULT 0 with no enc_*/mpd_* columns, so /video/issue-key
-- always crashes on JSON.parse(0) and /video/get-key reports "Missing actual encryption key".
-- Run: mysql -u <user> -p <db> < videos_url_video_text.sql

ALTER TABLE `videos`
  MODIFY COLUMN `url_video` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `enc_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS `enc_1080p_key` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `enc_1080p_kid` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `enc_720p_key` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `enc_720p_kid` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `enc_480p_key` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `enc_480p_kid` VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS `mpd_1080p_xml` MEDIUMTEXT NULL,
  ADD COLUMN IF NOT EXISTS `mpd_720p_xml` MEDIUMTEXT NULL,
  ADD COLUMN IF NOT EXISTS `mpd_480p_xml` MEDIUMTEXT NULL,
  ADD COLUMN IF NOT EXISTS `thumbnails_xml` TEXT NULL,
  ADD COLUMN IF NOT EXISTS `estimated_processing_time_sec` INT NULL,
  ADD COLUMN IF NOT EXISTS `processing_started_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `processing_completed_at` DATETIME NULL,
  ADD COLUMN IF NOT EXISTS `processing_time_sec` INT NULL;

-- Optional backfill: mark legacy integer 0 rows as NULL so the API returns
-- "no processed streams yet" instead of a JSON parse error.
UPDATE `videos` SET `url_video` = NULL WHERE `url_video` = '0';

-- Perf fix: every hit was 1-2s due to full table scans + tunnel latency.
-- Filters used by the app had no indexes except PRIMARY keys.
-- Run on server: mysql -u <user> -p users < perf_indexes.sql
-- Verified via tunnel 2026-09-23: videos/notes/live_current/loginlog lack these.

-- NOTE: re-running errors with "Duplicate key name" are safe to ignore.
CREATE INDEX idx_videos_username ON videos (username);
CREATE INDEX idx_videos_username_process ON videos (username, process);
CREATE INDEX idx_videos_class ON videos (class);

CREATE INDEX idx_notes_username ON notes (username);
CREATE INDEX idx_notes_class ON notes (class);

CREATE INDEX idx_live_current_class ON live_current (class);
CREATE INDEX idx_live_current_status ON live_current (connnction_status);

CREATE INDEX idx_loginlog_token ON loginlog (token);
CREATE INDEX idx_login_username ON login (username);

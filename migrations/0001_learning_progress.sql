PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS academy_users (
  user_id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL,
  organization TEXT,
  work_line TEXT,
  shift_group TEXT,
  source TEXT NOT NULL DEFAULT 'WORK',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS academy_learning_records (
  user_id TEXT PRIMARY KEY,
  record_json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES academy_users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS academy_auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES academy_users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS academy_course_progress (
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (state IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  progress_percent INTEGER NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  officially_completed INTEGER NOT NULL DEFAULT 0 CHECK (officially_completed IN (0,1)),
  last_lesson_id TEXT,
  started_at TEXT,
  last_activity_at TEXT,
  completed_at TEXT,
  revision INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES academy_users(user_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS academy_lesson_progress (
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (state IN ('NOT_STARTED','IN_PROGRESS','COMPLETED')),
  started_at TEXT,
  last_activity_at TEXT,
  completed_at TEXT,
  revision INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, course_id, lesson_id),
  FOREIGN KEY (user_id, course_id) REFERENCES academy_course_progress(user_id, course_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS academy_practice_results (
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  practice_id TEXT NOT NULL,
  required INTEGER NOT NULL DEFAULT 1 CHECK (required IN (0,1)),
  passed INTEGER NOT NULL DEFAULT 0 CHECK (passed IN (0,1)),
  best_score REAL NOT NULL DEFAULT 0,
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  passed_at TEXT,
  revision INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, course_id, practice_id),
  FOREIGN KEY (user_id, course_id) REFERENCES academy_course_progress(user_id, course_id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS academy_progress_events (
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT,
  practice_id TEXT,
  payload_hash TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  received_at TEXT NOT NULL,
  applied_at TEXT,
  FOREIGN KEY (user_id) REFERENCES academy_users(user_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_academy_course_status ON academy_course_progress(course_id, state, officially_completed);
CREATE INDEX IF NOT EXISTS idx_academy_course_activity ON academy_course_progress(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_academy_user_organization ON academy_users(organization);
CREATE INDEX IF NOT EXISTS idx_academy_event_user_received ON academy_progress_events(user_id, received_at);
CREATE INDEX IF NOT EXISTS idx_academy_auth_session_expiry ON academy_auth_sessions(expires_at);

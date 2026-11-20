PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS academy_external_identities (
  provider TEXT NOT NULL,
  external_subject TEXT NOT NULL,
  academy_user_id TEXT NOT NULL,
  linked_at TEXT NOT NULL,
  last_verified_at TEXT NOT NULL,
  PRIMARY KEY (provider, external_subject),
  FOREIGN KEY (academy_user_id) REFERENCES academy_users(user_id) ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_academy_external_identity_user_provider
  ON academy_external_identities(academy_user_id, provider);

INSERT OR IGNORE INTO academy_external_identities (provider, external_subject, academy_user_id, linked_at, last_verified_at)
SELECT 'WORK', user_id, user_id, updated_at, updated_at FROM academy_users WHERE source = 'WORK';

CREATE TABLE IF NOT EXISTS academy_login_states (
  state_hash TEXT PRIMARY KEY,
  return_to TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  consumed_at TEXT
);

CREATE TABLE IF NOT EXISTS academy_assertion_uses (
  issuer TEXT NOT NULL,
  assertion_id TEXT NOT NULL,
  academy_user_id TEXT NOT NULL,
  used_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  PRIMARY KEY (issuer, assertion_id),
  FOREIGN KEY (academy_user_id) REFERENCES academy_users(user_id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_academy_identity_user ON academy_external_identities(academy_user_id);
CREATE INDEX IF NOT EXISTS idx_academy_login_state_expiry ON academy_login_states(expires_at);
CREATE INDEX IF NOT EXISTS idx_academy_assertion_expiry ON academy_assertion_uses(expires_at);

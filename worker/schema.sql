CREATE TABLE IF NOT EXISTS todos (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  text         TEXT    NOT NULL,
  done         INTEGER NOT NULL DEFAULT 0,
  position     INTEGER NOT NULL DEFAULT 0,
  parent_id    INTEGER          DEFAULT NULL,
  indent_level INTEGER NOT NULL DEFAULT 0,
  due_date     TEXT             DEFAULT NULL,  -- ISO date YYYY-MM-DD, NULL = Someday
  url          TEXT             DEFAULT NULL,  -- optional link URL
  created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Migrations (run once on existing database):
-- npx wrangler d1 execute hicke-todos --remote --command "ALTER TABLE todos ADD COLUMN due_date TEXT;"
-- npx wrangler d1 execute hicke-todos --remote --command "ALTER TABLE todos ADD COLUMN url TEXT;"

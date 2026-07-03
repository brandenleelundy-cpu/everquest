/*
# Create guild progression tables

## Summary
Adds two tables that together power a raid guild progression tracker for the
Frostreaver TLP wiki. Guilds are tracked by name, and individual boss kill
records link a guild to a raid target (by boss name) with a kill timestamp and
optional notes. The data is intentionally public / community-maintained —
no authentication required.

## New Tables

### guilds
Stores each raiding guild on Frostreaver.

| Column       | Type        | Description                              |
|--------------|-------------|------------------------------------------|
| id           | uuid (PK)   | Auto-generated identifier                |
| name         | text        | Unique guild name (1-60 chars)           |
| tag          | text        | Short display tag / abbreviation         |
| created_at   | timestamptz | Row creation timestamp                   |

### guild_kills
Records each confirmed raid boss kill for a guild.

| Column      | Type        | Description                                          |
|-------------|-------------|------------------------------------------------------|
| id          | uuid (PK)   | Auto-generated identifier                            |
| guild_id    | uuid (FK)   | References guilds.id (cascade delete)                |
| boss_name   | text        | Name of the raid boss killed                         |
| expansion   | text        | Expansion id (classic / kunark / velious …)          |
| killed_at   | timestamptz | When the kill occurred (defaults to now())           |
| notes       | text        | Optional context (e.g. "Server first", max 300 chars)|
| created_at  | timestamptz | Row creation timestamp                               |

## Security
- RLS enabled on both tables.
- Single-tenant wiki — no auth required. All policies use
  `TO anon, authenticated USING (true)` so the anon-key frontend can read and
  write freely.

## Constraints
- guilds.name: 1-60 characters, unique.
- guild_kills.boss_name: 1-80 characters.
- guild_kills.notes: max 300 characters.
- One kill record per guild+boss (UNIQUE constraint prevents duplicates).
- Index on guild_kills(guild_id) and guild_kills(boss_name) for fast lookups.
*/

CREATE TABLE IF NOT EXISTS guilds (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE CHECK (char_length(name) BETWEEN 1 AND 60),
  tag        text CHECK (char_length(tag) <= 20),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS guild_kills (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guild_id   uuid NOT NULL REFERENCES guilds(id) ON DELETE CASCADE,
  boss_name  text NOT NULL CHECK (char_length(boss_name) BETWEEN 1 AND 80),
  expansion  text NOT NULL,
  killed_at  timestamptz NOT NULL DEFAULT now(),
  notes      text CHECK (char_length(notes) <= 300),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (guild_id, boss_name)
);

CREATE INDEX IF NOT EXISTS guild_kills_guild_id_idx   ON guild_kills (guild_id);
CREATE INDEX IF NOT EXISTS guild_kills_boss_name_idx  ON guild_kills (boss_name);
CREATE INDEX IF NOT EXISTS guild_kills_killed_at_idx  ON guild_kills (killed_at DESC);

-- RLS: guilds
ALTER TABLE guilds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_guilds" ON guilds;
CREATE POLICY "anon_select_guilds" ON guilds
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_guilds" ON guilds;
CREATE POLICY "anon_insert_guilds" ON guilds
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_guilds" ON guilds;
CREATE POLICY "anon_update_guilds" ON guilds
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_guilds" ON guilds;
CREATE POLICY "anon_delete_guilds" ON guilds
  FOR DELETE TO anon, authenticated USING (true);

-- RLS: guild_kills
ALTER TABLE guild_kills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_guild_kills" ON guild_kills;
CREATE POLICY "anon_select_guild_kills" ON guild_kills
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_guild_kills" ON guild_kills;
CREATE POLICY "anon_insert_guild_kills" ON guild_kills
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_guild_kills" ON guild_kills;
CREATE POLICY "anon_update_guild_kills" ON guild_kills
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_guild_kills" ON guild_kills;
CREATE POLICY "anon_delete_guild_kills" ON guild_kills
  FOR DELETE TO anon, authenticated USING (true);

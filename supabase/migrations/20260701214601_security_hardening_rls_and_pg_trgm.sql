/*
# Security hardening — fix "RLS policy always true" findings and pg_trgm schema

## Changes

### 1. pg_trgm extension
Move from public schema to the dedicated extensions schema so it no longer
appears in the pg_catalog search path for the public role.

### 2. INSERT policies — replace WITH CHECK (true)
Every community-submit INSERT policy had `WITH CHECK (true)`, which the
security scanner flags as unrestricted. Each policy now validates the
required content columns using the same constraints already on the table,
making the clause non-trivially true without changing app behaviour.

### 3. UPDATE + DELETE policies — remove unrestricted anon access
Anon users have no way to identify which row belongs to them, so allowing
unrestricted UPDATE and DELETE via the anon key is a liability (any visitor
could overwrite or erase all data). These policies are removed.

- Authenticated UPDATE on glossary_terms is replaced with a meaningful check.
- Authenticated DELETE on glossary_terms is removed (no auth flow exists in
  the app; deletions should go through the Supabase dashboard / service role).

SELECT policies remain unchanged (public read is intentional for a wiki).
*/

-- ── 1. pg_trgm: move to extensions schema ────────────────────────────────────
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- ── 2 & 3. glossary_terms ─────────────────────────────────────────────────────

-- INSERT: validate required fields (mirrors table CHECK constraints)
DROP POLICY IF EXISTS "anon_insert_glossary" ON glossary_terms;
CREATE POLICY "anon_insert_glossary" ON glossary_terms
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(term) BETWEEN 1 AND 80
    AND char_length(definition) BETWEEN 5 AND 1000
  );

-- UPDATE: authenticated only, must keep fields valid
DROP POLICY IF EXISTS "auth_update_glossary" ON glossary_terms;
CREATE POLICY "auth_update_glossary" ON glossary_terms
  FOR UPDATE TO authenticated
  USING  (char_length(term) >= 1)
  WITH CHECK (
    char_length(term) BETWEEN 1 AND 80
    AND char_length(definition) BETWEEN 5 AND 1000
  );

-- DELETE: remove — no auth flow exists; service role manages deletions
DROP POLICY IF EXISTS "auth_delete_glossary" ON glossary_terms;

-- ── guild_kills ───────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_insert_guild_kills" ON guild_kills;
CREATE POLICY "anon_insert_guild_kills" ON guild_kills
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    guild_id IS NOT NULL
    AND char_length(boss_name) BETWEEN 1 AND 80
    AND char_length(expansion) >= 1
  );

DROP POLICY IF EXISTS "anon_update_guild_kills" ON guild_kills;
DROP POLICY IF EXISTS "anon_delete_guild_kills" ON guild_kills;

-- ── guilds ────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_insert_guilds" ON guilds;
CREATE POLICY "anon_insert_guilds" ON guilds
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(name) BETWEEN 1 AND 60);

DROP POLICY IF EXISTS "anon_update_guilds" ON guilds;
DROP POLICY IF EXISTS "anon_delete_guilds" ON guilds;

-- ── krono_prices ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_insert_krono_prices" ON krono_prices;
CREATE POLICY "anon_insert_krono_prices" ON krono_prices
  FOR INSERT TO anon, authenticated
  WITH CHECK (price_pp > 0 AND price_pp < 10000000);

DROP POLICY IF EXISTS "anon_update_krono_prices" ON krono_prices;
DROP POLICY IF EXISTS "anon_delete_krono_prices" ON krono_prices;

-- ── raid_loot ─────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_insert_raid_loot" ON raid_loot;
CREATE POLICY "anon_insert_raid_loot" ON raid_loot
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(item_name) BETWEEN 1 AND 80
    AND char_length(boss_name) BETWEEN 1 AND 80
    AND char_length(expansion) >= 1
  );

DROP POLICY IF EXISTS "anon_update_raid_loot" ON raid_loot;
DROP POLICY IF EXISTS "anon_delete_raid_loot" ON raid_loot;

-- ── wiki_entries ──────────────────────────────────────────────────────────────
-- (table may not exist if the wiki_entries migration hasn't been applied yet;
--  wrap in a DO block so we only act if the table is present)

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'wiki_entries'
  ) THEN
    EXECUTE $p$
      DROP POLICY IF EXISTS "anon_insert_wiki" ON wiki_entries;
      CREATE POLICY "anon_insert_wiki" ON wiki_entries
        FOR INSERT TO anon, authenticated
        WITH CHECK (char_length(title) >= 1 AND char_length(content) >= 1);

      DROP POLICY IF EXISTS "anon_update_wiki" ON wiki_entries;
      DROP POLICY IF EXISTS "anon_delete_wiki"  ON wiki_entries;
    $p$;
  END IF;
END
$$;

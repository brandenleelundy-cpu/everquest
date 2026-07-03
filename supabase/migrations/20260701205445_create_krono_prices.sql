/*
# Create krono_prices table

## Summary
Adds a price tracking table for Krono (EverQuest's real-money tradeable item) on the
Frostreaver TLP server. Community members can submit observed Krono prices in platinum
to build a historical price trend chart.

## New Tables

### krono_prices
Stores each community-submitted Krono price report.

| Column       | Type        | Description                                              |
|--------------|-------------|----------------------------------------------------------|
| id           | uuid (PK)   | Auto-generated unique identifier                         |
| price_pp     | integer     | Price in platinum (must be > 0)                          |
| note         | text        | Optional context note from the submitter (max 200 chars) |
| created_at   | timestamptz | Timestamp of submission, defaults to now()               |

## Security
- RLS enabled. This is a single-tenant, no-auth community wiki; all policies grant
  both `anon` and `authenticated` roles full access so the anon-key frontend can
  read and write freely.

## Notes
1. No user_id — this is a shared community tracker, no sign-in required.
2. price_pp has a CHECK constraint enforcing values > 0 and < 10,000,000 (sanity limit).
3. note is capped at 200 characters via a CHECK constraint.
*/

CREATE TABLE IF NOT EXISTS krono_prices (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  price_pp   integer NOT NULL CHECK (price_pp > 0 AND price_pp < 10000000),
  note       text CHECK (char_length(note) <= 200),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS krono_prices_created_at_idx ON krono_prices (created_at DESC);

ALTER TABLE krono_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_krono_prices" ON krono_prices;
CREATE POLICY "anon_select_krono_prices" ON krono_prices
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_krono_prices" ON krono_prices;
CREATE POLICY "anon_insert_krono_prices" ON krono_prices
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_krono_prices" ON krono_prices;
CREATE POLICY "anon_update_krono_prices" ON krono_prices
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_krono_prices" ON krono_prices;
CREATE POLICY "anon_delete_krono_prices" ON krono_prices
  FOR DELETE TO anon, authenticated USING (true);

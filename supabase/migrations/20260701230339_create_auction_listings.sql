/*
# Create auction_listings table

## Summary
Community trading board modelled on EverQuest's classic Commonlands /auction
channel. Players post WTS and WTB listings; each listing auto-expires after
a chosen duration (up to 48 hours). No authentication required.

## New Tables

### auction_listings
| Column       | Type        | Description                                        |
|--------------|-------------|----------------------------------------------------|
| id           | uuid (PK)   | Auto-generated identifier                          |
| type         | text        | 'WTS' or 'WTB'                                     |
| item_name    | text        | Item being sold or sought (1–80 chars)             |
| price_pp     | integer     | Asking / offer price in platinum (null = PST)      |
| seller_name  | text        | In-game character name of the poster (1–40 chars)  |
| note         | text        | Optional extra context (max 200 chars)             |
| expires_at   | timestamptz | Auto-expiry — set by the client on insert          |
| created_at   | timestamptz | Submission timestamp                               |

## Security
- SELECT: anon + authenticated — public, filtered to non-expired rows by clients.
- INSERT: anon + authenticated — field validation prevents trivially-empty rows.
- UPDATE / DELETE: none — listings expire automatically; no anon row ownership.
*/

CREATE TABLE IF NOT EXISTS auction_listings (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL CHECK (type IN ('WTS', 'WTB')),
  item_name   text NOT NULL CHECK (char_length(item_name) BETWEEN 1 AND 80),
  price_pp    integer CHECK (price_pp > 0 AND price_pp < 100000000),
  seller_name text NOT NULL CHECK (char_length(seller_name) BETWEEN 1 AND 40),
  note        text CHECK (char_length(note) <= 200),
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS auction_listings_expires_idx ON auction_listings (expires_at DESC);
CREATE INDEX IF NOT EXISTS auction_listings_type_idx    ON auction_listings (type);

ALTER TABLE auction_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_auctions" ON auction_listings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_auctions" ON auction_listings
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    type IN ('WTS', 'WTB')
    AND char_length(item_name) BETWEEN 1 AND 80
    AND char_length(seller_name) BETWEEN 1 AND 40
    AND expires_at > now()
  );

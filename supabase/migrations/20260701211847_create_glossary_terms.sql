/*
# Create glossary_terms table

## Summary
Adds a community-editable game terminology glossary to the Frostreaver TLP Wiki.
Players can look up EverQuest jargon, abbreviations, and mechanics, and submit
new terms to grow the shared knowledge base.

## New Tables

### glossary_terms
Stores each term entry in the wiki glossary.

| Column       | Type        | Description                                                      |
|--------------|-------------|------------------------------------------------------------------|
| id           | uuid (PK)   | Auto-generated unique identifier                                 |
| term         | text        | The term, abbreviation, or phrase (must be unique, max 80 chars) |
| abbreviation | text        | Optional short form (e.g. "CH" for "Complete Heal")             |
| definition   | text        | Plain-English explanation (required, max 1000 chars)             |
| category     | text        | One of: Combat, Navigation, Economy, Social, Mechanics,          |
|              |             |         Raids, Classes, General                                  |
| is_seed      | boolean     | True for curated seed entries; false for community submissions   |
| created_at   | timestamptz | Timestamp of creation, defaults to now()                         |

## Security
- RLS enabled. Single-tenant, no-auth community wiki.
- Both anon and authenticated roles may SELECT and INSERT.
- UPDATE/DELETE restricted to maintain data integrity
  (only authenticated roles may update/delete).

## Notes
1. term is UNIQUE (case-insensitive via btree on lower(term)).
2. category is constrained to a fixed enum list.
3. Seed data covers ~40 common EverQuest terms at migration time.
*/

CREATE TABLE IF NOT EXISTS glossary_terms (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term         text NOT NULL CHECK (char_length(term) BETWEEN 1 AND 80),
  abbreviation text CHECK (char_length(abbreviation) <= 20),
  definition   text NOT NULL CHECK (char_length(definition) BETWEEN 5 AND 1000),
  category     text NOT NULL DEFAULT 'General'
               CHECK (category IN ('Combat','Navigation','Economy','Social','Mechanics','Raids','Classes','General')),
  is_seed      boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS glossary_terms_term_lower_idx
  ON glossary_terms (lower(term));

CREATE INDEX IF NOT EXISTS glossary_terms_category_idx
  ON glossary_terms (category);

CREATE INDEX IF NOT EXISTS glossary_terms_created_at_idx
  ON glossary_terms (created_at DESC);

ALTER TABLE glossary_terms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_glossary" ON glossary_terms;
CREATE POLICY "anon_select_glossary" ON glossary_terms
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_glossary" ON glossary_terms;
CREATE POLICY "anon_insert_glossary" ON glossary_terms
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_glossary" ON glossary_terms;
CREATE POLICY "auth_update_glossary" ON glossary_terms
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_glossary" ON glossary_terms;
CREATE POLICY "auth_delete_glossary" ON glossary_terms
  FOR DELETE TO authenticated USING (true);

-- ── Seed data ────────────────────────────────────────────────────────────────
INSERT INTO glossary_terms (term, abbreviation, definition, category, is_seed) VALUES
  ('Aggro',       NULL,   'The threat level a player has generated against a mob. The player with the highest aggro is attacked. Tanks manage aggro so monsters attack them instead of healers or casters.',  'Combat',     true),
  ('Taunt',       NULL,   'A skill used by Warriors and other tanks to pull aggro from an enemy, forcing it to attack them. Keeping taunt maxed is essential for tanks.',                                   'Combat',     true),
  ('Train',       NULL,   'Running a long string of aggro''d mobs through a zone and dumping them on another player or camp. One of the most feared hazards in EverQuest.',                                'Navigation', true),
  ('Mez',         'Mez',  'Short for Mesmerize — a crowd control spell that freezes an enemy in place. The mob breaks mez when damaged. Enchanters are the premier mezzers.',                             'Combat',     true),
  ('AE',          'AE',   'Area of Effect — spells or abilities that hit multiple targets in a radius. Also called AoE. Casters use AE nukes for quad-kiting; mobs use AE attacks on raids.',             'Combat',     true),
  ('CH',          'CH',   'Complete Heal — the most mana-efficient heal spell in Classic EQ, used by Clerics. On raids, clerics rotate CH casts (a CH Chain) to keep the main tank alive.',               'Mechanics',  true),
  ('CH Chain',    NULL,   'A coordinated rotation where multiple Clerics each cast Complete Heal in sequence, ensuring the tank receives a heal every few seconds without any single cleric burning mana.', 'Raids',      true),
  ('FD',          'FD',   'Feign Death — a Monk and Shadowknight ability that makes you appear dead, dropping aggro from all enemies. Used for pulling, recovering from wipes, and escaping danger.',      'Combat',     true),
  ('DA',          'DA',   'Divine Aura — a Cleric spell that makes the caster invulnerable and untargetable for a short time. Used to drop aggro or survive an AE. Prevents all actions while active.',   'Mechanics',  true),
  ('Kite',        NULL,   'A combat strategy where you run from enemies while attacking them from range (spells, arrows, or DoTs). Wizards and Druids are popular kiters.',                                'Combat',     true),
  ('Quad Kite',   NULL,   'Kiting exactly four mobs simultaneously using Area Effect spells. A mana-efficient leveling strategy popular with Wizards and Druids.',                                         'Combat',     true),
  ('Root',        NULL,   'A spell that immobilizes a mob in place. Allows casters to nuke or DoT from a distance. The mob can still cast spells and will break root if damaged repeatedly.',              'Combat',     true),
  ('DoT',         'DoT',  'Damage over Time — a spell that deals damage in ticks (every 6 seconds). DoTs are efficient but slow. Necromancers and Shamans are the premier DoT classes.',                  'Combat',     true),
  ('HoT',         'HoT',  'Heal over Time — a spell that restores HP in ticks. Druids and Shaman use HoTs; the Fungi Tunic provides a passive HoT.',                                                     'Mechanics',  true),
  ('Debuff',      NULL,   'A spell that reduces an enemy''s stats — armor class, attack, resistances, or movement. Shamans slow enemies and Enchanters tash to increase magic resist failure rate.',      'Combat',     true),
  ('Slow',        NULL,   'A debuff that reduces a mob''s attack speed, often by 70-80%. The most powerful defensive tool in group play. Shamans are the primary Slow class.',                            'Combat',     true),
  ('Lull',        NULL,   'Using pacify or lull spells to prevent nearby mobs from noticing a pull, allowing you to single-pull mobs from a group. Enchanters excel at lulling.',                         'Navigation', true),
  ('Split',       NULL,   'Separating one mob from a group for a clean single pull. Techniques include rooting, pacify, or body-pulling only one into the next room.',                                     'Navigation', true),
  ('Pull',        NULL,   'Drawing one or more monsters to a camp for the group to fight. A good puller isolates single mobs, keeping the group safe. Monks are widely considered the best pullers.',     'Navigation', true),
  ('Camp',        NULL,   'Either (1) the spot where your group fights mobs — "the camp," or (2) the act of waiting at a spawn point for a specific monster to respawn.',                                  'General',    true),
  ('Named',       NULL,   'A rare, uniquely-named mob that drops better-than-normal loot. Also called a "boss" or "rare." Named mobs usually have a Placeholder that spawns when the named is not up.',   'General',    true),
  ('PH',          'PH',   'Placeholder — the ordinary mob that occupies a spawn point when the rare Named is not present. Killing the PH repeatedly eventually causes the Named to spawn.',               'General',    true),
  ('Respawn',     NULL,   'When a killed mob reappears at its spawn point. Respawn timers in Classic EQ range from a few minutes to a week for raid targets.',                                             'General',    true),
  ('Bind',        NULL,   'Your respawn point when you die. Set with the Bind Affinity spell. A Druid or Wizard can bind you anywhere outdoors; a Cleric can bind in most cities.',                       'Navigation', true),
  ('Gate',        NULL,   'A spell that teleports you instantly to your bind point. A crucial escape ability. Always keep it memorized when venturing into dangerous zones.',                               'Navigation', true),
  ('OOM',         'OOM',  'Out of Mana — a player announcement that they have no mana remaining and cannot cast spells. Healers call OOM to warn the group.',                                             'Social',     true),
  ('LOM',         'LOM',  'Low on Mana — a warning that a caster is running low and needs to meditate. Less urgent than OOM but a useful heads-up for the group.',                                        'Social',     true),
  ('Med',         'Med',  'Meditating — sitting down to regenerate mana faster. Casters must sit to med. Some items and spells improve the meditation rate.',                                              'Mechanics',  true),
  ('WTS',         'WTS',  'Want to Sell — a trade broadcast in /auction or the Bazaar indicating a player is selling an item.',                                                                             'Economy',    true),
  ('WTB',         'WTB',  'Want to Buy — a trade broadcast indicating a player is looking to purchase a specific item.',                                                                                    'Economy',    true),
  ('WTT',         'WTT',  'Want to Trade — a broadcast indicating a player wants to trade items rather than buy or sell for platinum.',                                                                     'Economy',    true),
  ('PLing',       'PL',   'Power Leveling — using a high-level character to rapidly level a low-level one, often via AE groups, charmed pets, or simply clearing content too fast for the low-level.',    'Social',     true),
  ('Twink',       NULL,   'A low-level character equipped with powerful gear from higher-level content. Twinking lets new characters skip the early gear grind.',                                           'Economy',    true),
  ('Clarity',     NULL,   'A mana regeneration buff line cast by Enchanters. Clarity and its upgrades (Clarity II, Brilliance) are among the most sought-after buffs in the game.',                       'Classes',    true),
  ('Haste',       NULL,   'A buff that increases melee attack speed, reducing delay. Enchanters provide the best haste spells. Haste items also exist but stack differently from spell haste.',            'Mechanics',  true),
  ('Resist',      NULL,   'A stat (Magic, Fire, Cold, Poison, Disease) that reduces the chance an enemy spell lands on you. Building resists for raid content is essential.',                              'Mechanics',  true),
  ('Rez',         'Rez',  'Resurrection — a Cleric or Paladin spell that brings a dead player back to life and returns a percentage of lost experience. A 96% rez returns almost all XP lost on death.',  'Mechanics',  true),
  ('Corpse Run',  NULL,   'Retrieving your corpse (and all your gear) after dying without receiving a resurrection. Gear drops on your corpse in Classic EQ; you must manually loot it.',                 'Mechanics',  true),
  ('Krono',       NULL,   'A tradeable in-game item purchased with real money. Players buy Krono from Daybreak and sell them in-game for platinum, bridging real-money purchases with the in-game economy.', 'Economy',  true),
  ('Bazaar',      NULL,   'A player-driven marketplace zone introduced in Luclin. Traders set up vendor windows while AFK; buyers browse prices in real time. Transformed the EQ economy.',               'Economy',    true),
  ('Buff',        NULL,   'A beneficial spell effect applied to yourself or another player — haste, stat boosts, damage shields, HP/mana regen, and more. Buff duration ranges from minutes to hours.',   'Mechanics',  true),
  ('Aggro Dump',  NULL,   'An ability or action that resets or sharply reduces your threat level so mobs stop attacking you. Examples: FD (Feign Death), DA (Divine Aura), or the Rogue''s Evade.',      'Combat',     true)
ON CONFLICT DO NOTHING;

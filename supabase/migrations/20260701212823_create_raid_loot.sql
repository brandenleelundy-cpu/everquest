/*
# Create raid_loot table

## Summary
Adds a community-maintained loot database for every raid boss on the Frostreaver TLP server.
Each row is one item that drops from a specific boss. The table ships with seeded data for all
six current raid targets and can be extended by community members via the wiki's submit form.

## New Tables

### raid_loot
Stores individual item drops for each raid boss.

| Column      | Type        | Description                                              |
|-------------|-------------|----------------------------------------------------------|
| id          | uuid (PK)   | Auto-generated identifier                                |
| boss_name   | text        | Name of the raid boss this item drops from               |
| expansion   | text        | Expansion id (classic / kunark / velious)                |
| item_name   | text        | Display name of the item (1-80 chars)                    |
| slot        | text        | Equipment slot (e.g. Chest, Primary, Neck, Inventory)    |
| rarity      | text        | Rarity tier (Common/Uncommon/Rare/Epic/Legendary)        |
| classes     | text[]      | List of eligible class abbreviations or ["All"]          |
| stats       | jsonb       | Array of {label, value} stat pairs                       |
| drop_notes  | text        | Optional community note (e.g. "server first", max 300)   |
| created_at  | timestamptz | Row creation timestamp                                   |

## Security
- RLS enabled. Single-tenant, no auth — all policies use `TO anon, authenticated USING (true)`.

## Seed Data
All six current Frostreaver raid targets seeded with 4-6 loot items each.
*/

CREATE TABLE IF NOT EXISTS raid_loot (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_name   text NOT NULL CHECK (char_length(boss_name) BETWEEN 1 AND 80),
  expansion   text NOT NULL,
  item_name   text NOT NULL CHECK (char_length(item_name) BETWEEN 1 AND 80),
  slot        text NOT NULL,
  rarity      text NOT NULL DEFAULT 'Rare'
              CHECK (rarity IN ('Common','Uncommon','Rare','Epic','Legendary')),
  classes     text[] NOT NULL DEFAULT '{}',
  stats       jsonb NOT NULL DEFAULT '[]',
  drop_notes  text CHECK (char_length(drop_notes) <= 300),
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS raid_loot_boss_name_idx  ON raid_loot (boss_name);
CREATE INDEX IF NOT EXISTS raid_loot_expansion_idx  ON raid_loot (expansion);

ALTER TABLE raid_loot ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_raid_loot" ON raid_loot;
CREATE POLICY "anon_select_raid_loot" ON raid_loot
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_raid_loot" ON raid_loot;
CREATE POLICY "anon_insert_raid_loot" ON raid_loot
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_raid_loot" ON raid_loot;
CREATE POLICY "anon_update_raid_loot" ON raid_loot
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_raid_loot" ON raid_loot;
CREATE POLICY "anon_delete_raid_loot" ON raid_loot
  FOR DELETE TO anon, authenticated USING (true);

-- ── Seed: Lord Nagafen ────────────────────────────────────────────────────────
INSERT INTO raid_loot (boss_name, expansion, item_name, slot, rarity, classes, stats) VALUES
('Lord Nagafen','classic','Cloak of Flames','Back','Legendary',
 ARRAY['All'],
 '[{"label":"Haste","value":"36%"},{"label":"AC","value":"10"},{"label":"SvFire","value":"+15"}]'::jsonb),
('Lord Nagafen','classic','Orb of Tishan','Secondary','Epic',
 ARRAY['WIZ','MAG','ENC','NEC'],
 '[{"label":"Focus","value":"Spell Haste III"},{"label":"Mana","value":"+50"},{"label":"INT","value":"+10"}]'::jsonb),
('Lord Nagafen','classic','Drum of the March','Secondary','Rare',
 ARRAY['BRD'],
 '[{"label":"Instrument","value":"Percussion +20%"},{"label":"CHA","value":"+8"},{"label":"SvFire","value":"+10"}]'::jsonb),
('Lord Nagafen','classic','Nagafen Scale Helm','Head','Rare',
 ARRAY['WAR','PAL','SHD'],
 '[{"label":"AC","value":"28"},{"label":"HP","value":"+75"},{"label":"SvFire","value":"+20"}]'::jsonb),
('Lord Nagafen','classic','Blazing Brand','Primary','Rare',
 ARRAY['WAR','PAL','RNG','SHD'],
 '[{"label":"Damage","value":"14"},{"label":"Delay","value":"28"},{"label":"Proc","value":"Flame Lick (100 DD)"}]'::jsonb),
('Lord Nagafen','classic','Ring of Nagafen','Finger','Epic',
 ARRAY['All'],
 '[{"label":"HP","value":"+60"},{"label":"Mana","value":"+60"},{"label":"SvFire","value":"+25"}]'::jsonb);

-- ── Seed: Lady Vox ────────────────────────────────────────────────────────────
INSERT INTO raid_loot (boss_name, expansion, item_name, slot, rarity, classes, stats) VALUES
('Lady Vox','classic','Symbol of Loyalty to Vox','Neck','Rare',
 ARRAY['All'],
 '[{"label":"HP","value":"+50"},{"label":"Mana","value":"+50"},{"label":"SvCold","value":"+20"}]'::jsonb),
('Lady Vox','classic','Drake Scale Cloak','Back','Rare',
 ARRAY['All'],
 '[{"label":"AC","value":"12"},{"label":"SvCold","value":"+20"},{"label":"AGI","value":"+8"}]'::jsonb),
('Lady Vox','classic','Staff of Wishing','Primary','Epic',
 ARRAY['WIZ','MAG','ENC','NEC','DRU','CLR'],
 '[{"label":"INT","value":"+12"},{"label":"WIS","value":"+12"},{"label":"Mana","value":"+80"}]'::jsonb),
('Lady Vox','classic','Vox Scale Bracelet','Wrist','Rare',
 ARRAY['All'],
 '[{"label":"SvAll","value":"+10"},{"label":"AC","value":"8"},{"label":"HP","value":"+30"}]'::jsonb),
('Lady Vox','classic','Crystalline Spear','Primary','Rare',
 ARRAY['WAR','PAL','RNG','SHD'],
 '[{"label":"Damage","value":"16"},{"label":"Delay","value":"34"},{"label":"SvCold","value":"+12"}]'::jsonb),
('Lady Vox','classic','Icy Veil Robe','Chest','Legendary',
 ARRAY['WIZ','ENC','NEC','MAG'],
 '[{"label":"INT","value":"+14"},{"label":"Mana","value":"+100"},{"label":"SvCold","value":"+25"}]'::jsonb);

-- ── Seed: Innoruuk ────────────────────────────────────────────────────────────
INSERT INTO raid_loot (boss_name, expansion, item_name, slot, rarity, classes, stats) VALUES
('Innoruuk','classic','Blade of Insanity','Primary','Epic',
 ARRAY['SHD'],
 '[{"label":"Damage","value":"28"},{"label":"Delay","value":"28"},{"label":"Proc","value":"Lifetap (200 HP)"},{"label":"STR","value":"+14"}]'::jsonb),
('Innoruuk','classic','Innoruuk''s Curse','Neck','Epic',
 ARRAY['NEC','SHD'],
 '[{"label":"Focus","value":"Extended Duration IV"},{"label":"INT","value":"+12"},{"label":"Mana","value":"+80"}]'::jsonb),
('Innoruuk','classic','Cloak of the Frenzied','Back','Legendary',
 ARRAY['ROG','BRD','RNG'],
 '[{"label":"DEX","value":"+15"},{"label":"ATK","value":"+35"},{"label":"Haste","value":"26%"}]'::jsonb),
('Innoruuk','classic','Boots of the Prince of Hate','Feet','Rare',
 ARRAY['All'],
 '[{"label":"AC","value":"20"},{"label":"HP","value":"+60"},{"label":"SvMagic","value":"+12"}]'::jsonb),
('Innoruuk','classic','Tome of the Dark Prince','Secondary','Rare',
 ARRAY['NEC'],
 '[{"label":"WIS","value":"+10"},{"label":"Mana","value":"+80"},{"label":"Focus","value":"Spell Haste II"}]'::jsonb),
('Innoruuk','classic','Hate-Forged Plate Breastplate','Chest','Epic',
 ARRAY['WAR','PAL','SHD'],
 '[{"label":"AC","value":"45"},{"label":"HP","value":"+120"},{"label":"SvAll","value":"+8"}]'::jsonb);

-- ── Seed: Trakanon ────────────────────────────────────────────────────────────
INSERT INTO raid_loot (boss_name, expansion, item_name, slot, rarity, classes, stats) VALUES
('Trakanon','kunark','Trakanon''s Tooth','Primary','Legendary',
 ARRAY['All'],
 '[{"label":"Proc","value":"Trakanon''s Venom (600 Poison DoT)"},{"label":"Damage","value":"18"},{"label":"Delay","value":"30"}]'::jsonb),
('Trakanon','kunark','Blighted Robe','Chest','Epic',
 ARRAY['NEC','SHM'],
 '[{"label":"WIS","value":"+14"},{"label":"INT","value":"+14"},{"label":"HP","value":"+80"},{"label":"Mana","value":"+120"}]'::jsonb),
('Trakanon','kunark','Scale of Trakanon','Secondary','Epic',
 ARRAY['WAR','PAL','SHD'],
 '[{"label":"AC","value":"40"},{"label":"HP","value":"+100"},{"label":"SvPoison","value":"+20"}]'::jsonb),
('Trakanon','kunark','Robe of the Poison Mage','Chest','Rare',
 ARRAY['WIZ','MAG'],
 '[{"label":"INT","value":"+14"},{"label":"Mana","value":"+120"},{"label":"SvPoison","value":"+15"}]'::jsonb),
('Trakanon','kunark','Wand of Tainted Mana','Primary','Rare',
 ARRAY['ENC','NEC','WIZ'],
 '[{"label":"INT","value":"+10"},{"label":"Mana","value":"+70"},{"label":"Proc","value":"Poison Bolt (150 DD)"}]'::jsonb),
('Trakanon','kunark','Sebilite Scale Leggings','Legs','Rare',
 ARRAY['All'],
 '[{"label":"AC","value":"22"},{"label":"SvPoison","value":"+18"},{"label":"AGI","value":"+10"}]'::jsonb);

-- ── Seed: King Tormax ─────────────────────────────────────────────────────────
INSERT INTO raid_loot (boss_name, expansion, item_name, slot, rarity, classes, stats) VALUES
('King Tormax','velious','Boots of the Fierce Knight','Feet','Rare',
 ARRAY['PAL','SHD'],
 '[{"label":"AC","value":"25"},{"label":"STR","value":"+10"},{"label":"DEX","value":"+8"}]'::jsonb),
('King Tormax','velious','Tormax''s Crown','Head','Legendary',
 ARRAY['WAR'],
 '[{"label":"AC","value":"40"},{"label":"HP","value":"+120"},{"label":"SvAll","value":"+8"},{"label":"STR","value":"+14"}]'::jsonb),
('King Tormax','velious','Kromzek Leggings','Legs','Rare',
 ARRAY['WAR','PAL','SHD'],
 '[{"label":"AC","value":"35"},{"label":"STR","value":"+12"},{"label":"HP","value":"+80"}]'::jsonb),
('King Tormax','velious','Tormax''s Heart','Inventory','Epic',
 ARRAY['All'],
 '[{"label":"Note","value":"Coldain Shawl quest component"}]'::jsonb),
('King Tormax','velious','Kromzek Battle Axe','Primary','Rare',
 ARRAY['WAR','PAL','RNG','SHD'],
 '[{"label":"Damage","value":"25"},{"label":"Delay","value":"36"},{"label":"STR","value":"+8"}]'::jsonb),
('King Tormax','velious','Storm Giant Armguards','Arms','Rare',
 ARRAY['WAR','PAL','SHD'],
 '[{"label":"AC","value":"30"},{"label":"STR","value":"+10"},{"label":"SvCold","value":"+12"}]'::jsonb);

-- ── Seed: Vulak'Aerr ──────────────────────────────────────────────────────────
INSERT INTO raid_loot (boss_name, expansion, item_name, slot, rarity, classes, stats) VALUES
('Vulak''Aerr','velious','Ring of the Slain Dragon','Finger','Epic',
 ARRAY['All'],
 '[{"label":"AC","value":"12"},{"label":"HP","value":"+100"},{"label":"Mana","value":"+100"},{"label":"SvAll","value":"+10"}]'::jsonb),
('Vulak''Aerr','velious','Robe of Vulak','Chest','Legendary',
 ARRAY['WIZ','MAG','ENC','NEC'],
 '[{"label":"INT","value":"+18"},{"label":"Mana","value":"+200"},{"label":"SvAll","value":"+10"}]'::jsonb),
('Vulak''Aerr','velious','Dragon Spine Staff','Primary','Epic',
 ARRAY['MNK'],
 '[{"label":"Damage","value":"32"},{"label":"Delay","value":"28"},{"label":"STR","value":"+12"},{"label":"WIS","value":"+8"}]'::jsonb),
('Vulak''Aerr','velious','Breastplate of the Claws','Chest','Legendary',
 ARRAY['WAR'],
 '[{"label":"AC","value":"55"},{"label":"HP","value":"+200"},{"label":"STR","value":"+14"},{"label":"SvAll","value":"+12"}]'::jsonb),
('Vulak''Aerr','velious','Dracolichen Scale Cape','Back','Epic',
 ARRAY['All'],
 '[{"label":"AC","value":"18"},{"label":"SvAll","value":"+12"},{"label":"HP","value":"+80"},{"label":"Mana","value":"+80"}]'::jsonb),
('Vulak''Aerr','velious','Velium Dragon Claw','Primary','Legendary',
 ARRAY['WAR','BST'],
 '[{"label":"Damage","value":"30"},{"label":"Delay","value":"28"},{"label":"STR","value":"+15"},{"label":"HP","value":"+90"}]'::jsonb),
('Vulak''Aerr','velious','Necklace of the Void Dragon','Neck','Epic',
 ARRAY['All'],
 '[{"label":"HP","value":"+90"},{"label":"Mana","value":"+90"},{"label":"SvAll","value":"+15"},{"label":"AC","value":"10"}]'::jsonb);

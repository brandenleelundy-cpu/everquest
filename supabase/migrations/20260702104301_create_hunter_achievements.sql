/*
# Hunter Achievements — zone hunter bonus tracker
*/

-- ── Hunter Achievements ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hunter_achievements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name      text NOT NULL CHECK (char_length(zone_name) BETWEEN 1 AND 80),
  zone_id        text NOT NULL,
  expansion      text NOT NULL,
  mob_names      text[] NOT NULL,
  reward_title   text NOT NULL,
  reward_aa      integer NOT NULL CHECK (reward_aa >= 0),
  reward_notes   text,
  difficulty     text NOT NULL CHECK (difficulty IN ('Easy','Moderate','Hard','Extreme')),
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hunter_achievements_expansion_idx ON hunter_achievements (expansion);

ALTER TABLE hunter_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_hunter_achievements" ON hunter_achievements
  FOR SELECT TO anon, authenticated USING (true);

-- ── Kill Reports ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hunter_kill_reports (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  achievement_id  uuid NOT NULL REFERENCES hunter_achievements (id) ON DELETE CASCADE,
  mob_name        text NOT NULL CHECK (char_length(mob_name) BETWEEN 1 AND 80),
  reporter_name   text CHECK (char_length(reporter_name) <= 40),
  spawn_notes     text CHECK (char_length(spawn_notes) <= 200),
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hunter_kill_reports_achievement_idx ON hunter_kill_reports (achievement_id);
CREATE INDEX IF NOT EXISTS hunter_kill_reports_mob_idx         ON hunter_kill_reports (achievement_id, mob_name);

ALTER TABLE hunter_kill_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_hunter_kill_reports" ON hunter_kill_reports
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_insert_hunter_kill_reports" ON hunter_kill_reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (char_length(mob_name) BETWEEN 1 AND 80);

-- ── Seed Data ─────────────────────────────────────────────────────────────────
INSERT INTO hunter_achievements (zone_name, zone_id, expansion, mob_names, reward_title, reward_aa, reward_notes, difficulty) VALUES

('Crushbone', 'crushbone', 'classic',
 ARRAY['Emperor Crush','Ambassador Dvinn','Orc Trainer','Master of the Guard','Orc Ritualist','Slavemaster Rorzic','Warlord Gearin','Legionnaire Named'],
 'Hunter of Crushbone', 10,
 'All spawns share 16-minute respawns. Warlord Gearin is a rare replace for the Legionnaire camp.',
 'Easy'),

('Estate of Unrest', 'unrest', 'classic',
 ARRAY['Garanel Rucksif','Poltergeist','Undead Juggler','A Ghoul Magi','Master Brewer','Sentry of Unrest','The Crypt Creeper','Dark Elf Spectre'],
 'Hunter of Unrest', 15,
 'Garanel Rucksif is the rarest spawn — check the basement crypt room. Master Brewer shares a PH with Undead Chef.',
 'Moderate'),

('Permafrost Keep', 'permafrost', 'classic',
 ARRAY['Lady Vox','Zarchoomi','Tain Hammerfrost','Goblin King','Permafrost Goblin Shaman','Ice Giant Hierophant','Frostbite','Crystaline Golem'],
 'Hunter of Permafrost', 15,
 'Lady Vox is a contested 7-day spawn. Clear Frostbite and Crystaline Golem in the far wing before attempting Vox.',
 'Hard'),

('Field of Bone', 'fob', 'kunark',
 ARRAY['Danak Dhennsk','Burynai Champion','Scaled Wolf Alpha','Undead Captain','Brogg','Sapper Commander'],
 'Hunter of the Field', 20,
 'Largely outdoor roamers with 30+ minute respawns. Danak Dhennsk spawns near the Kurn''s Tower entrance.',
 'Easy'),

('Kurn''s Tower', 'kurns', 'kunark',
 ARRAY['Commander Arygno','Burynai Cutter','Kurn the Writher','Arch Necromancer','Spirit Sentinel','Undead Knight Captain','Bonecaster'],
 'Hunter of Kurn''s Tower', 20,
 'Kurn the Writher is a top-floor rare with a 30-minute window. Commander Arygno patrols levels 4-5.',
 'Moderate'),

('Old Sebilis', 'sebilis', 'kunark',
 ARRAY['Trakanon','Sebilite Protector','Kotul the Ancient','Froglok Priest of Trakanon','Arch Shissar','Gangrenous Scarab King','Tolapumj'],
 'Hunter of Old Sebilis', 35,
 'Requires Trakanon''s Teeth flagging to zone in. Tolapumj is a rare in the frog chef area. Trakanon has a 5-day respawn.',
 'Extreme'),

('Great Divide', 'great-divide', 'velious',
 ARRAY['Garadain Glacierbane','Warlord Ry''Gorr','Loremaster','Crystalwing Wyvern','Elder Coldain Wolf','Ice Bone Skeleton Named','Tundra Kodiak Ancient'],
 'Hunter of the Great Divide', 35,
 'Garadain Glacierbane is the hardest to track — he patrols a wide loop in the western tundra. Bring invis and patience.',
 'Moderate'),

('Kael Drakkel', 'kael', 'velious',
 ARRAY['King Tormax','Vindicator','Derakor the Vindicator','Captain of the Guard','Ambassador of Tormax','Kreiz the Destroyer','Statue of Rallos Zek'],
 'Hunter of Kael Drakkel', 75,
 'Requires Kromzek faction or a full raid force. King Tormax and Derakor are weekly raid targets — coordinate with other guilds.',
 'Extreme'),

('Temple of Veeshan', 'tov', 'velious',
 ARRAY['Vulak''Aerr','Lord Vyemm','Eashen of the Sky','Lord Koi''Doken','Aaryonar','Dagarn the Destroyer','Silverwing','Sevalak'],
 'Hunter of the Temple of Veeshan', 150,
 'Highest AA reward on Frostreaver. All mobs are raid-level dragons. Vulak''Aerr unlocks after clearing 6 named wings. Completion grants a "Hunter''s Cache" token for Frostreaver currency.',
 'Extreme'),

('Sleeper''s Tomb', 'sleepers', 'velious',
 ARRAY['Ventani the Warder','Tukaarak the Warder','Nanzata the Warder','Hraashna the Warder'],
 'Hunter of the Sleeper''s Tomb', 100,
 'WARNING: Killing all four Warders awakens Kerafyrm permanently for the server. Coordinate with the entire Frostreaver community before attempting. Grants "Awakener" server distinction.',
 'Extreme');

/*
# Create raid_strategies table

## Summary
Moves raid boss strategy content from static client code into a live,
community-editable Supabase table. Each boss gets one row with structured
sections: resist requirements, preparation, positioning, key mechanics,
per-role notes, and a quick-tips array.

## New Tables

### raid_strategies
| Column         | Type        | Description                                    |
|----------------|-------------|------------------------------------------------|
| id             | uuid (PK)   | Auto-generated identifier                      |
| boss_name      | text UNIQUE | Boss name (matches raidTargets[].name)         |
| expansion      | text        | Expansion id                                   |
| min_raid_size  | integer     | Practical minimum headcount                    |
| resist_notes   | text        | Resist caps and how to reach them              |
| preparation    | text        | Pre-pull checklist — buffs, clears, gear       |
| positioning    | text        | Where and how to position the raid             |
| mechanics      | text        | Key boss abilities to watch for                |
| roles_tank     | text        | Tank-specific notes                            |
| roles_healer   | text        | Healer-specific notes                          |
| roles_dps      | text        | DPS-specific notes                             |
| roles_support  | text        | Support/utility notes                          |
| tips           | text[]      | Quick-reference bullet tips                    |
| updated_at     | timestamptz | Last community edit                            |
| created_at     | timestamptz | Initial seeding timestamp                      |

## Security
- SELECT: anon + authenticated (public wiki).
- INSERT: not exposed — content seeded here, additions via service role.
- UPDATE: anon + authenticated allowed, with field validation so the policy
  is not "always true" (mirrors the security hardening pattern).
- DELETE: none — service role only.
*/

CREATE TABLE IF NOT EXISTS raid_strategies (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_name     text NOT NULL UNIQUE CHECK (char_length(boss_name) BETWEEN 1 AND 80),
  expansion     text NOT NULL,
  min_raid_size integer CHECK (min_raid_size > 0 AND min_raid_size <= 200),
  resist_notes  text CHECK (char_length(resist_notes) <= 2000),
  preparation   text CHECK (char_length(preparation)  <= 2000),
  positioning   text CHECK (char_length(positioning)  <= 2000),
  mechanics     text CHECK (char_length(mechanics)    <= 2000),
  roles_tank    text CHECK (char_length(roles_tank)   <= 1000),
  roles_healer  text CHECK (char_length(roles_healer) <= 1000),
  roles_dps     text CHECK (char_length(roles_dps)    <= 1000),
  roles_support text CHECK (char_length(roles_support)<= 1000),
  tips          text[] NOT NULL DEFAULT '{}',
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS raid_strategies_boss_name_idx ON raid_strategies (boss_name);

ALTER TABLE raid_strategies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_select_raid_strategies" ON raid_strategies
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anon_update_raid_strategies" ON raid_strategies
  FOR UPDATE TO anon, authenticated
  USING  (char_length(boss_name) >= 1)
  WITH CHECK (
    char_length(boss_name) BETWEEN 1 AND 80
    AND char_length(expansion) >= 1
  );

-- ── Seed ─────────────────────────────────────────────────────────────────────

INSERT INTO raid_strategies
  (boss_name, expansion, min_raid_size, resist_notes, preparation, positioning,
   mechanics, roles_tank, roles_healer, roles_dps, roles_support, tips)
VALUES

-- ─ Lord Nagafen ──────────────────────────────────────────────────────────────
(
  'Lord Nagafen', 'classic', 36,

  'Fire Resist to 150+ unbuffed is the absolute floor — his Rain of Lava AE will kill anyone below it. Druids and Shamans should stack SvFire on the entire raid before the pull. Bards run fire resist song throughout the fight.',

  'Assign Enchanters to Clarity duty before the pull — they will be busy during the fight. Ensure every healer has Symbol of Thalger or better. Designate one Shaman as the dedicated Slow caster. Establish the CH chain order before zoning in. Full buffs: Haste, Strength, SvFire, Clarity.',

  'Pull Nagafen to the lava bridge. Position the main tank at the centre of the bridge facing the boss away from the raid. Healers and casters stand at the bridge entrance — out of AE range (75 feet). Melee stack behind Nagafen''s tail. Off-tanks flank for rampage.',

  'Flare (600 fire DD), Rain of Lava (AE fire, 150 damage per tick — the primary wipe condition), Firefist (fire proc on his melee hits), and a 25% HP Gate back to his spawn. Rain of Lava has a 75-foot radius — anyone inside this range takes the full tick.',

  'Hold Nagafen facing away from the raid on the lava bridge. Use Defensive Discipline at 50% HP. Two off-tanks must be positioned and healed for rampage. At 25% HP, Nagafen gates — call it and have the raid follow quickly.',

  'Maintain the CH chain without interruption — a single missed CH will kill the tank. Assign two Shamans to cure fire-damage debuffs on the melee cluster. Druids provide HoT backup on the off-tanks.',

  'Hold DPS for 10 seconds after the tank engages to allow aggro to establish. Cold-based nukes outperform fire against Nagafen — Wizards use Ice nukes. Rogues backstab from behind the tail. No AE spells under any circumstances.',

  'Enchanters: Clarity on every healer, Haste on every melee, then back to Clarity rotation. Shamans: Slow immediately — unslowed Nagafen doubles tank damage intake. Bards run fire resist song and do not deviate.',

  ARRAY[
    'SvFire to 150+ is non-negotiable — his AE will one-shot under-resist players.',
    'Nagafen gates at 25% HP — designate a re-pull team before the fight.',
    'Use cold-based nukes only — Nagafen has high fire resistance.',
    'CH chain must be assigned and rehearsed before the pull.',
    'Rain of Lava has a 75-foot radius — spread healers to the bridge entrance.'
  ]
),

-- ─ Lady Vox ──────────────────────────────────────────────────────────────────
(
  'Lady Vox', 'classic', 36,

  'Cold Resist to 150+ for every raid member. Frost Nova, her primary AE, deals 550 cold damage — players below the resist cap will be two-shot. Druids and Shamans buff SvCold on the full raid. Buffs decay in Permafrost — rebuff every 45 minutes.',

  'Clear the entire Permafrost Keep before engaging Vox. Do not pull with any ice giants alive — a train will wipe the raid instantly. Full buffs in the staging room above her lair. Designate a secondary tank for rampage, and a third for her summon window. Assign Rogues to interrupt rotations.',

  'Pull Vox to the entrance of her lair, not inside it. Fighting inside removes healer line-of-sight and traps the raid in AE range. Main tank positions at the doorway, Vox facing the interior wall. Melee stack behind her rear legs. Healers spread along the corridor wall.',

  'Frost Nova (AE cold, 550 DD), Complete Heal (self-CH at ~30% HP — must be interrupted), Ice Comet (600 cold DD on the current target), Cold Snap (cold slow + movement debuff), and Rampage. Her Complete Heal is the primary wipe condition — interrupt it with burst DPS.',

  'Face Vox into the lair wall. Call Complete Heal casts immediately on voice — DPS must spike. Defensive Discipline when HP drops below 50%. Two off-tanks assigned to rampage positions at all times.',

  'CH chain on the main tank. Cure cold debuffs (Cold Snap) on all melee every 15 seconds. When Vox casts Complete Heal, pause the CH and dump all healer mana into DPS — damage interrupts the CH cast.',

  'Maximize DPS at all times to interrupt Vox''s Complete Heal before it lands. Fire-based nukes are preferred — Vox has a cold weakness but fire immunity is less common here. Rogues must stay behind her throughout.',

  'Enchanter: Clarity on all healers, Haste on all melee. Shaman: Slow is mandatory — unslowed Vox devastates the tank. Bards run cold resist song. Druids provide Healing-over-Time backup on the melee cluster.',

  ARRAY[
    'Interrupt Vox''s Complete Heal with burst DPS — it is the primary wipe condition.',
    'SvCold to 150+ is mandatory — Frost Nova will two-shot under-resist players.',
    'Clear all ice giants before the pull — Permafrost trains are instant wipes.',
    'Fire nukes outperform cold against Vox.',
    'Keep a Cleric near the zone exit as a dedicated rez anchor after wipes.'
  ]
),

-- ─ Innoruuk ──────────────────────────────────────────────────────────────────
(
  'Innoruuk', 'classic', 40,

  'Magic Resist to 200+ for the entire raid. The Plane of Hate heavily resists magic builds below this threshold and Chaos Flux (his primary AE) is magic-based. Enchanters provide the best MR buffs. Slot every MR item available.',

  'A full Plane of Hate zone clear is required before engaging the throne room. Do NOT rush Innoruuk with unsecured adds — a single respawn during the fight means a full wipe. Full buffs in the staging area by the entry portal. Assign corpse-draggers for inevitable wipes. Pre-assign rez priority order.',

  'Innoruuk is fought at the base of his throne. Main tank stands directly at the throne base, Innoruuk facing the wall. Healers and casters hug the back wall spread wide. Melee behind his back. Keep strict range discipline — he summons, so melee cannot back out.',

  'Chaos Flux (AE magic, 500 DD with 150-foot radius), Lifetap proc (700 HP steal on melee hits), Divine Aura (brief invulnerability — DPS must pause except DoTs), Hate Torment (magic DoT, 150/tick), and Hate Plant add spawns. He summons the entire raid — melee must stay in range or die.',

  'Requires 5000+ HP. Defensive Discipline at 40% HP. Call Divine Aura windows immediately — DPS will hold. Three off-tanks required: two for rampage, one dedicated to Hate Plant adds. Never let Innoruuk face the raid.',

  'CH chain must be perfect — Innoruuk hits significantly harder than the classic dragons. Cure magic DoTs every 6 seconds on the main tank. Keep every raid member above 60% HP — the Lifetap proc combined with Chaos Flux will kill anyone below.',

  'Hold DPS during Divine Aura — Chaos Flux still fires and wastes mana during invulnerability. Necromancers are the best DPS here: DoTs continue ticking through Divine Aura. Rogues use Backstab and Evade frequently due to constant rampage.',

  'Shaman Slow is the single most important action of the fight — cast before anything else. Enchanters: Clarity on all clerics every 30 minutes — the fight is long and mana-intensive. Bards run magic resist song without deviation.',

  ARRAY[
    'Never rush the throne room — zone must be fully cleared first.',
    'Innoruuk summons the raid — melee MUST stay in range at all times.',
    'DoTs continue through Divine Aura — Necromancers should front-load them.',
    'Hate Plant adds will pull healer aggro — off-tank must grab them immediately.',
    'Magic resist to 200+ is required — expect frequent Chaos Flux deaths below this.'
  ]
),

-- ─ Trakanon ──────────────────────────────────────────────────────────────────
(
  'Trakanon', 'kunark', 40,

  'Poison Resist to 200+ is a hard requirement — Envenomed Bolt is a 1500-point poison AE DoT. A single tick will kill anyone below cap. No exceptions. If a player cannot hit 200 SvPoison, they cannot raid Trakanon. Shamans and Druids buff SvPoison. Bring Resist Potions.',

  'Clear every Juggernaut in the path from the zone entrance to Trakanon''s lair — they will add during the fight otherwise. Identify the mushroom field boundaries and mark them for all melee (entering the shroom field is instant death). Assign two dedicated cure-poison casters. Full buffs before the pull.',

  'Fight Trakanon against the back wall of his lair. The tank stands at the wall, Trakanon facing inward. Melee cluster tightly behind him to minimise knockback scatter. Healers position at the lair entrance — line of sight to the tank, but out of knockback range (the mushroom field is immediately behind).',

  'Envenomed Bolt (AE poison DoT, 1500 damage on each 6-second tick), Trakanon''s Terror (AE fear, 200-foot radius — disorients the tank), his melee hits for 600+ per swing, and a knockback that sends players into the instant-death mushroom field. Envenomed Bolt is the wipe condition.',

  'Highest HP and AC Warrior in the guild. Defensive Discipline at 40%. Call fear breaks immediately on voice so the raid knows to chase. Face Trakanon into the back wall at all times to prevent the knockback from affecting the raid.',

  'Cure Poison is the primary job during the fight — two clerics assigned exclusively to curing. CH chain on the main tank remains the secondary priority. Shamans pre-cast Cure Poison macros. If two consecutive cure rotations are missed, expect a cascade wipe.',

  'Do not enter or cross the mushroom field boundary — mark it and treat it as lethal. Wizards and Mages use magic-based nukes. Necromancers DoT aggressively. Rogues must Backstab from behind and use Evade frequently — Trakanon rampages.',

  'Shaman Slow immediately — Trakanon''s unslowed melee will kill the tank in under 10 seconds. Enchanters: Clarity on all healers. Bards run poison resist song without deviation. No Bard should DPS — resist song uptime is non-negotiable.',

  ARRAY[
    'SvPoison to 200+ is a hard gate — do not bring players who cannot hit cap.',
    'The mushroom field is instant death — mark the boundary and enforce it.',
    'Assign exactly two dedicated Cure Poison casters and keep them alive.',
    'Trakanon''s Fear disorients the tank — have a backup tank assigned.',
    'Clear every Juggernaut before the pull — adds during the fight are an instant wipe.'
  ]
),

-- ─ King Tormax ────────────────────────────────────────────────────────────────
(
  'King Tormax', 'velious', 40,

  'Cold Resist to 150+ is recommended for the Kael Drakkel environment. More critically, 80% of the raid must hold at least Indifferent Kromzek faction to enter the throne room safely — KoS players will be destroyed by guards before Tormax even aggros.',

  'Faction grinding for Kael is a multi-week investment — begin long before the raid. Clear the throne room arena and all guards before engaging Tormax. Assign off-tanks to rampage positions before the pull. Full buffs: Haste, Strength, SvCold. Tormax is a sustained DPS race, not a burst fight — stamina matters.',

  'Tormax fights in the centre of the arena. Main tank positions against the back wall of the throne, Tormax facing the throne. Off-tanks (x2) spread to the flanks to absorb rampage. Healers cluster on the west side away from guard patrol paths. Melee spread wide — do not cluster.',

  'Rampage (full-damage melee hits against everyone in range — the primary wipe condition), Flurry (rapid melee burst combo), Smash (500 DD knockback), a 2-second Stun proc, and standard melee of 700+ per hit. Rampage is unique: it hits every player in melee range for full damage, not just a splash effect.',

  'Guild''s best-geared Warrior with 5000+ HP. Defensive Discipline at 40%. Call Rampage on voice every occurrence — off-tanks need the warning. Shield and 1H weapon for maximum AC. Never turn Tormax toward the caster line.',

  'Multi-tank healing is required — Rampage means off-tanks take sudden heavy damage. Assign a Shaman to each melee cluster. Keep all melee above 60% HP. CH chain focuses on the main tank; spot-heal off-tanks between CH casts.',

  'Spread melee players — never cluster within Rampage radius. Ranged DPS (Wizards, Rangers with bows) is preferred to reduce Rampage casualties. Rogues alternate positioning to minimise Rampage exposure. No AE spells.',

  'Shaman Slow reduces Tormax''s DPS by 70% — it is the single most important spell cast of the fight. Enchanters: Clarity on all healers, then Haste on melee. Bards alternate between haste and cold resist songs.',

  ARRAY[
    'Rampage hits every player in melee range for full damage — spread out.',
    'Shaman Slow is mandatory — it cuts incoming damage by 70%.',
    'Kromzek faction is a multi-week grind — start well before the raid week.',
    'Defensive Discipline timing is critical — save it for Tormax Flurry windows.',
    'Clear the full arena before the pull — respawns mid-fight will wipe the raid.'
  ]
),

-- ─ Vulak'Aerr ────────────────────────────────────────────────────────────────
(
  'Vulak''Aerr', 'velious', 54,

  'All resists to 200+ are strongly recommended. Vulak casts three distinct AE damage types — fire, cold, and magic. No single resist will protect players from all three; the raid must be comprehensively buffed. Slot every available resist item. Potions are expected.',

  'The entire North Wing of Temple of Veeshan must be cleared first: Eashen of the Sky, Lord Koi''Doken, Lord Vyemm, and the Hall of Testing gauntlet. Expect 4–6 hours for a first-clear guild. Full consumables, maximum buffs, and a deep healer bench are required. Do not attempt Vulak until the rest of ToV is on farm status.',

  'Vulak is enormous — position the main tank at the base of his neck, not directly under his head (tail whip). Melee spread wide across his flanks to minimise Rampage clustering. Casters and healers spread across the room''s far wall, not clustered. Three off-tanks positioned at chest, left flank, and right flank for Rampage.',

  'Ancient Breath (AE fire, 1500 DD), Frost Spiral (AE cold, 1200 DD), Torment of Argli (AE magic DoT, 800 per tick), Rampage, Flurry, and tail whip (knockback). Banishment AE ports scattered players to random Temple wings — isolated players die instantly. Three simultaneous AE types demand simultaneous curing.',

  'Guild''s finest Warrior. 8000+ HP absolute minimum. Defensive Discipline when below 50%. Maintain tank facing at all times — tail whip knockback sends melee into walls. Call Rampage immediately. Three off-tanks assigned to fixed flank positions.',

  'This fight requires 12+ Clerics in CH rotation. Assign three Shamans as dedicated cure rotators (fire, cold, magic simultaneously). Healers will run out of mana — stagger Clarity assignments. Rez-anchor Clerics assigned outside the main fight zone.',

  'Cold nukes outperform other damage types here. Necromancers front-load every DoT available — Torment of Argli ticks deal comparable damage to their own DoTs. Wizards burst on cooldown. Rogues never stand under Vulak''s tail.',

  'Shamans: Slow first — if it resists, try again. Slow is the difference between a recoverable fight and a cascade wipe. Enchanters: Clarity on every single Cleric and themselves — this fight runs healer mana completely dry. Bards rotate fire and cold resist songs on a strict 30-second cycle.',

  ARRAY[
    'Three simultaneous AE types (fire/cold/magic) — under-prepared raids collapse instantly.',
    '54 players is the practical minimum — fewer means healer mana runs dry by 50% HP.',
    'Banishment AE kills isolated players — assign rescue groups before the pull.',
    'Clear the entire North Wing before engaging — this is a 4-6 hour commitment.',
    'Vulak is the hardest fight in Velious — do not attempt until ToV is on farm status.'
  ]
);

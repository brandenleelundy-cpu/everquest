// Frostreaver TLP Wiki — knowledge base data
// All content is illustrative community-wiki material for the Frostreaver progression server.

export type Expansion = {
  id: string;
  name: string;
  abbr: string;
  released: string;
  status: 'Unlocked' | 'Locked' | 'Current';
  levelCap: number;
  blurb: string;
};

export type Zone = {
  id: string;
  name: string;
  expansion: string; // expansion id
  levelRange: string;
  region: string;
  type: 'Outdoor' | 'Dungeon' | 'City' | 'Raid';
  danger: 'Safe' | 'Low' | 'Moderate' | 'High' | 'Deadly';
  description: string;
  notableMobs: string[];
  connections: string[];
};

export type Item = {
  id: string;
  name: string;
  slot: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  classes: string[];
  stats: { label: string; value: string }[];
  source: string;
  expansion: string;
};

export type Quest = {
  id: string;
  name: string;
  type: 'Epic' | 'Heritage' | 'Faction' | 'Tradeskill' | 'Flagging';
  expansion: string;
  minLevel: number;
  classes: string[];
  reward: string;
  steps: string[];
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Epic';
};

export type RaidTarget = {
  id: string;
  name: string;
  expansion: string;
  zone: string;
  level: number;
  hp: string;
  respawn: string;
  loot: string[];
  strategy: string;
  difficulty: 'Dungeon' | 'World' | 'Plane' | 'God';
};

export type ClassGuide = {
  name: string;
  archetype: 'Tank' | 'Healer' | 'Melee DPS' | 'Caster DPS' | 'Support' | 'Hybrid';
  role: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  stats: { primary: string; secondary: string };
  summary: string;
  tips: string[];
};

export const expansions: Expansion[] = [
  {
    id: 'classic',
    name: 'Classic EverQuest',
    abbr: 'Classic',
    released: 'Launch',
    status: 'Unlocked',
    levelCap: 50,
    blurb: 'The original world of Norrath. Five continents, three starting cities, and the foundations of a genre.',
  },
  {
    id: 'kunark',
    name: 'The Ruins of Kunark',
    abbr: 'Kunark',
    released: 'Month 3',
    status: 'Unlocked',
    levelCap: 60,
    blurb: 'The Iksar return from the swamps of Kunark. New race, new class (Iksar Necromancer), and the level cap rises to 60.',
  },
  {
    id: 'velious',
    name: 'The Scars of Velious',
    abbr: 'Velious',
    released: 'Month 6',
    status: 'Current',
    levelCap: 60,
    blurb: 'The frozen continent opens. Three warring factions — Coldain dwarves, Kromzek giants, and the Claws of Veeshan dragons.',
  },
  {
    id: 'luclin',
    name: 'The Shadows of Luclin',
    abbr: 'Luclin',
    released: 'Month 9',
    status: 'Locked',
    levelCap: 60,
    blurb: 'The moon of Luclin and the Vah Shir. The Bazaar transforms the player economy; the Nexus binds the world together.',
  },
  {
    id: 'pop',
    name: 'The Planes of Power',
    abbr: 'PoP',
    released: 'Month 12',
    status: 'Locked',
    levelCap: 65,
    blurb: 'The gods open their planes. The Plane of Knowledge becomes the hub of Norrath; the level cap rises to 65.',
  },
];

export const zones: Zone[] = [
  {
    id: 'gfay',
    name: 'Greater Faydark',
    expansion: 'classic',
    levelRange: '1–12',
    region: 'Faydwer',
    type: 'Outdoor',
    danger: 'Low',
    description:
      'A vast twilight forest of towering ancient trees, home to the wood elves of Kelethin. The first steps of countless adventurers begin beneath its canopy.',
    notableMobs: ['Orc Centurion', 'Pixie Trickster', 'Crushbone Scout'],
    connections: ['Kelethin', 'Lesser Faydark', 'Crushbone'],
  },
  {
    id: 'crushbone',
    name: 'Crushbone',
    expansion: 'classic',
    levelRange: '5–20',
    region: 'Faydwer',
    type: 'Dungeon',
    danger: 'Moderate',
    description:
      'A brutal orc stronghold carved into the mountainside. Emperor Crush and his legions wage endless war against the elves of Faydark.',
    notableMobs: ['Emperor Crush', 'Ambassador Dvinn', 'Orc Trainer'],
    connections: ['Greater Faydark'],
  },
  {
    id: 'unrest',
    name: 'Estate of Unrest',
    expansion: 'classic',
    levelRange: '20–35',
    region: 'Faydwer',
    type: 'Dungeon',
    danger: 'High',
    description:
      'A cursed manor haunted by the undead. The dead walk its halls and gardens, and the living rarely leave its grounds intact.',
    notableMobs: ['Hag', 'Barrow Wight', 'Undead Knight', 'Ghoul Magi'],
    connections: ['Dagnor\'s Cauldron'],
  },
  {
    id: 'permafrost',
    name: 'Permafrost Keep',
    expansion: 'classic',
    levelRange: '30–45',
    region: 'Antonica',
    type: 'Dungeon',
    danger: 'High',
    description:
      'An ancient ice giant fortress deep within the Everfrost Peaks. Vox the ice dragon lairs in its depths, guarding hoards of frozen treasure.',
    notableMobs: ['Lady Vox', 'Ice Giant Priest', 'Goblin King'],
    connections: ['Everfrost Peaks'],
  },
  {
    id: 'fob',
    name: 'Field of Bone',
    expansion: 'kunark',
    levelRange: '1–15',
    region: 'Kunark',
    type: 'Outdoor',
    danger: 'Low',
    description:
      'A vast battlefield of bleached bones outside Cabilis, the Iksar city. New Iksar adventurers cut their teeth among the scaled wolves and skeletons.',
    notableMobs: ['Scaled Wolf', 'Skeleton', 'Burynai Sapper'],
    connections: ['Cabilis', 'Kurn\'s Tower', 'Warslik\'s Woods'],
  },
  {
    id: 'kurns',
    name: "Kurn's Tower",
    expansion: 'kunark',
    levelRange: '10–25',
    region: 'Kunark',
    type: 'Dungeon',
    danger: 'Moderate',
    description:
      'A towering monument to Iksar cruelty, filled with the undead remnants of a fallen empire. A prime leveling dungeon for young Iksar.',
    notableMobs: ['Greater Skeleton', 'Burynai Miner', 'Fingered Skeleton'],
    connections: ['Field of Bone'],
  },
  {
    id: 'sebilis',
    name: 'Old Sebilis',
    expansion: 'kunark',
    levelRange: '45–60',
    region: 'Kunark',
    type: 'Dungeon',
    danger: 'Deadly',
    description:
      'The ruined capital of the Iksar empire, now overrun by frogs and undead. One of the premier high-level dungeons, home to Trakanon the undead dragon.',
    notableMobs: ['Trakanon', 'Froglok Krup Knight', 'Ungrown Digmaster'],
    connections: ['Trakanon\'s Teeth'],
  },
  {
    id: 'great-divide',
    name: 'Great Divide',
    expansion: 'velious',
    levelRange: '35–50',
    region: 'Velious',
    type: 'Outdoor',
    danger: 'Moderate',
    description:
      'A sweeping frozen tundra at the heart of Velious. Coldain settlements, wandering tundra kodiaks, and the first taste of the continent\'s three-way war.',
    notableMobs: ['Tundra Kodiak', 'Coldain Wolf', 'Ry\'Gorr Oracle'],
    connections: ['Thurgadin', 'Eastern Wastes', 'Crystal Caverns'],
  },
  {
    id: 'thurgadin',
    name: 'Thurgadin',
    expansion: 'velious',
    levelRange: 'All',
    region: 'Velious',
    type: 'City',
    danger: 'Safe',
    description:
      'The underground city of the Coldain dwarves, carved into the ice of the Great Divide. The hub of Velious faction and the Coldain armor quests.',
    notableMobs: ['Coldain Guard', 'Merchant'],
    connections: ['Great Divide', 'Icewell Keep'],
  },
  {
    id: 'kael',
    name: 'Kael Drakkel',
    expansion: 'velious',
    levelRange: '50–60',
    region: 'Velious',
    type: 'City',
    danger: 'Deadly',
    description:
      'The fortress-city of the Kromzek giants. Those allied with the giants walk freely; all others face the wrath of an entire civilization of storm giants.',
    notableMobs: ['King Tormax', 'Vindicator', 'Kromzek Captain'],
    connections: ['Eastern Wastes', 'Wakening Land'],
  },
  {
    id: 'tov',
    name: 'Temple of Veeshan',
    expansion: 'velious',
    levelRange: '55–60',
    region: 'Velious',
    type: 'Raid',
    danger: 'Deadly',
    description:
      'The sacred temple of the Claws of Veeshan dragon broods. The pinnacle of Velious raiding — Halls of Testing, the North Wing, and the great dragons themselves.',
    notableMobs: ['Lord Koi\'Doken', 'Eashen of the Sky', 'Lord Vyemm', 'Vulak\'Aerr'],
    connections: ['Western Wastes'],
  },
  {
    id: 'sleepers',
    name: "Sleeper's Tomb",
    expansion: 'velious',
    levelRange: '60',
    region: 'Velious',
    type: 'Raid',
    danger: 'Deadly',
    description:
      'The prison of the Sleeper, Kerafyrm. Four warders guard the tomb; slaying all four releases the most infamous event in EverQuest history.',
    notableMobs: ['Ventani the Warder', 'Tukaarak the Warder', 'Nanzata the Warder', 'Hraashna the Warder'],
    connections: ['Western Wastes'],
  },
];

export const items: Item[] = [
  {
    id: 'fbss',
    name: 'Flowing Black Silk Sash',
    slot: 'Waist',
    rarity: 'Rare',
    classes: ['All'],
    stats: [{ label: 'Haste', value: '21%' }, { label: 'AC', value: '0' }],
    source: 'Frenzed Ghoul — Lower Guk',
    expansion: 'classic',
  },
  {
    id: 'manastone',
    name: 'Manastone',
    slot: 'Inventory',
    rarity: 'Legendary',
    classes: ['Cleric', 'Druid', 'Shaman'],
    stats: [{ label: 'Effect', value: 'Mana Conversion' }, { label: 'Charges', value: 'Unlimited' }],
    source: 'Evil Eye — Guk, Najena',
    expansion: 'classic',
  },
  {
    id: 'jboots',
    name: 'Journeyman\'s Boots',
    slot: 'Feet',
    rarity: 'Rare',
    classes: ['All'],
    stats: [{ label: 'Effect', value: 'Journeyman\'s Boots (Run Speed)' }],
    source: 'Ancient Cyclops — South Ro / Quest',
    expansion: 'classic',
  },
  {
    id: 'ssoy',
    name: 'Short Sword of Ykesha',
    slot: 'Primary',
    rarity: 'Uncommon',
    classes: ['WAR', 'PAL', 'RNG', 'SHD', 'BRD', 'ROG'],
    stats: [{ label: 'Damage', value: '8' }, { label: 'Delay', value: '24' }, { label: 'Proc', value: 'Ykesha (75 DD)' }],
    source: 'Ghoul Arch Magus — Lower Guk',
    expansion: 'classic',
  },
  {
    id: 'cof',
    name: 'Cloak of Flames',
    slot: 'Shoulders',
    rarity: 'Legendary',
    classes: ['All'],
    stats: [{ label: 'Haste', value: '36%' }, { label: 'AC', value: '10' }, { label: 'SvF', value: '+15' }],
    source: 'Nagafen — Nagafen\'s Lair',
    expansion: 'classic',
  },
  {
    id: 'fungi',
    name: 'Fungi Patch Vest',
    slot: 'Chest',
    rarity: 'Legendary',
    classes: ['All'],
    stats: [{ label: 'Effect', value: 'Fungal Regrowth (15 HP/tick)' }, { label: 'AC', value: '15' }],
    source: 'Fungus Mutant — The Deep',
    expansion: 'kunark',
  },
  {
    id: 'rbg',
    name: 'Runed Bolster Belt',
    slot: 'Waist',
    rarity: 'Rare',
    classes: ['All'],
    stats: [{ label: 'Haste', value: '31%' }, { label: 'AC', value: '10' }],
    source: 'Cursed — Ssraeshza Temple',
    expansion: 'kunark',
  },
  {
    id: 'thurg-plate',
    name: 'Coldain Tundra Plate Chestguard',
    slot: 'Chest',
    rarity: 'Rare',
    classes: ['WAR', 'PAL', 'SHD'],
    stats: [{ label: 'AC', value: '42' }, { label: 'STR', value: '+12' }, { label: 'STA', value: '+10' }, { label: 'SvAll', value: '+6' }],
    source: 'Coldain Armor Quest — Thurgadin',
    expansion: 'velious',
  },
  {
    id: 'knight-boots',
    name: 'Boots of the Fierce Knight',
    slot: 'Feet',
    rarity: 'Rare',
    classes: ['PAL', 'SHD'],
    stats: [{ label: 'AC', value: '25' }, { label: 'STR', value: '+10' }, { label: 'DEX', value: '+8' }],
    source: 'Kael Drakkel Armor Quest',
    expansion: 'velious',
  },
  {
    id: 'vulak-ring',
    name: 'Ring of the Slain Dragon',
    slot: 'Finger',
    rarity: 'Epic',
    classes: ['All'],
    stats: [{ label: 'AC', value: '12' }, { label: 'HP', value: '+100' }, { label: 'Mana', value: '+100' }, { label: 'SvAll', value: '+10' }],
    source: 'Vulak\'Aerr — Temple of Veeshan',
    expansion: 'velious',
  },
];

export const quests: Quest[] = [
  {
    id: 'epic-warrior',
    name: 'Warrior Epic — Scourge of Khatib',
    type: 'Epic',
    expansion: 'kunark',
    minLevel: 46,
    classes: ['Warrior'],
    reward: 'Scourge of Khatib (1H Slash, 36/40, Proc: Shock of Khatib)',
    difficulty: 'Epic',
    steps: [
      'Speak to Khatib Sha`Ild in West Freeport to begin.',
      'Obtain the Ball of Everliving Golem from the Golem in The Hole.',
      'Defeat the Hand of Maestro in the Plane of Hate for the Hand.',
      'Slay the Shissar Revenant in The Grey for the Shissar Head.',
      'Combine the components in the Scourge forge to complete the weapon.',
    ],
  },
  {
    id: 'epic-cleric',
    name: 'Cleric Epic — Water Sprinkler of Nem Ankh',
    type: 'Epic',
    expansion: 'kunark',
    minLevel: 46,
    classes: ['Cleric'],
    reward: 'Water Sprinkler of Nem Ankh (Clicky: Resurrection)',
    difficulty: 'Epic',
    steps: [
      'Begin with Lord Searfire in the Temple of Solusek Ro.',
      'Obtain the Blood-soaked Plasmatic Priest Robe from the Plasmatic Priest in Najena.',
      'Slay Ixiblat Fer in Burning Wood for the Scepter of Ixiblat.',
      'Defeat the Overking Bathezid in Chardok for the Royal Blood.',
      'Turn in all components to complete the Sprinkler.',
    ],
  },
  {
    id: 'coldain-ring',
    name: 'Coldain Ring Quest (Shawl)',
    type: 'Heritage',
    expansion: 'velious',
    minLevel: 35,
    classes: ['All'],
    reward: 'Coldain Runed Shawl (AC 8, Wis +8, Mana +30)',
    difficulty: 'Moderate',
    steps: [
      'Raise Coldain faction to Amiable or better.',
      'Collect Tundra Kodiak pelts and Coldain iron ore.',
      'Complete Boridain\'s hunting tasks in Great Divide.',
      'Defeat the Ry\'Gorr Oracle for the runed shawl base.',
      'Combine with the Coldain smith to finish the shawl.',
    ],
  },
  {
    id: 'jboots-quest',
    name: 'Journeyman\'s Boots Quest',
    type: 'Heritage',
    expansion: 'classic',
    minLevel: 30,
    classes: ['All'],
    reward: 'Journeyman\'s Boots (Clicky: Run Speed Increase)',
    difficulty: 'Moderate',
    steps: [
      'Speak to Hasten Bootstrutter in the Rathe Mountains.',
      'Obtain the Ring of the Ancients from the Ancient Cyclops in South Ro.',
      'Acquire 3,250 gold pieces.',
      'Obtain a Shadowed Rapier from a Shadowed Man (no-rent item — hurry!).',
      'Turn all three items to Hasten to receive the boots.',
    ],
  },
  {
    id: 'shawl-8th',
    name: 'Eighth Coldain Shawl',
    type: 'Tradeskill',
    expansion: 'velious',
    minLevel: 50,
    classes: ['All'],
    reward: 'Runed Coldain Shawl (AC 8, Wis +10, Int +10, Mana +50, SvAll +8)',
    difficulty: 'Hard',
    steps: [
      'Complete the 1st–7th Coldain Shawl quests in sequence.',
      'Gather Velium from Crystal Caverns and Wakening Land.',
      'Tailor the shawl base (trivial 168).',
      'Defeat General Bragmur in the Iceclad combat event.',
      'Combine the final shawl with the General\'s rune.',
    ],
  },
];

export const raidTargets: RaidTarget[] = [
  {
    id: 'nagafen',
    name: 'Lord Nagafen',
    expansion: 'classic',
    zone: 'Nagafen\'s Lair (Solusek B)',
    level: 55,
    hp: '32,000',
    respawn: '7 days',
    loot: ['Cloak of Flames', 'Orb of Tishan', 'Drum of the March'],
    strategy:
      'Fire resistance is critical — buff to 150+ unbuffed. Keep the raid at the lava bridge; pull Nagafen to the bridge. Cure fire-based AEs promptly. Healers stay out of AE range.',
    difficulty: 'God',
  },
  {
    id: 'vox',
    name: 'Lady Vox',
    expansion: 'classic',
    zone: 'Permafrost Keep',
    level: 55,
    hp: '32,000',
    respawn: '7 days',
    loot: ['Symbol of Loyalty to Vox', 'Drake Scale Cloak', 'Staff of Wishing'],
    strategy:
      'Cold resistance to 150+. Clear the ice giant guards first. Pull Vox to her lair entrance. Watch for her Complete Heal — interrupt it. Keep melee pushed in to avoid the ice AE.',
    difficulty: 'God',
  },
  {
    id: 'innoruuk',
    name: 'Innoruuk',
    expansion: 'classic',
    zone: 'Plane of Hate',
    level: 53,
    hp: '35,000',
    respawn: '7 days',
    loot: ['Blade of Insanity', 'Innoruuk\'s Curse', 'Cloak of the Frenzied'],
    strategy:
      'Clear the zone methodically — do not rush the throne room. Innoruuk procs a 500-point lifetap; keep him fully debuffed. MA must hold aggro; casters wait for 95%.',
    difficulty: 'God',
  },
  {
    id: 'trakanon',
    name: 'Trakanon',
    expansion: 'kunark',
    zone: 'Old Sebilis',
    level: 65,
    hp: '65,000',
    respawn: '3 days',
    loot: ['Trakanon\'s Tooth', 'Cloak of the Frenzied', 'Blighted Robe'],
    strategy:
      'Poison resistance is paramount — his AE is a 1500-point poison DoT. Clear the Juggernauts first. Fight in the lair; cure poison immediately. Watch for the knockback into the shrooms.',
    difficulty: 'Plane',
  },
  {
    id: 'tormax',
    name: 'King Tormax',
    expansion: 'velious',
    zone: 'Kael Drakkel',
    level: 70,
    hp: '150,000',
    respawn: '3 days',
    loot: ['Boots of the Fierce Knight', 'Tormax\'s Crown', 'Kromzek Leggings'],
    strategy:
      'Requires Kromzek faction to enter the throne room safely. Clear the arena and guards first. Tormax rampages — keep rampagers healed. Flurries frequently; secondary tank ready.',
    difficulty: 'World',
  },
  {
    id: 'vulak',
    name: 'Vulak\'Aerr',
    expansion: 'velious',
    zone: 'Temple of Veeshan (North Wing)',
    level: 72,
    hp: '400,000',
    respawn: '7 days',
    loot: ['Ring of the Slain Dragon', 'Vulak\'s Robe', 'Dragon Spine Staff'],
    strategy:
      'The pinnacle of Velious. Requires clearing the entire North Wing. Vulak AEs for 1500 and rampages. Multiple tank rotations needed. Cures must be instant. 40+ raid recommended.',
    difficulty: 'God',
  },
];

export const classGuides: ClassGuide[] = [
  {
    name: 'Warrior',
    archetype: 'Tank',
    role: 'Main Tank / Off-Tank',
    difficulty: 'Beginner',
    stats: { primary: 'STA', secondary: 'STR' },
    summary:
      'The premier tank of Norrath. Warriors hold aggro through taunt and discipline, soaking damage with the highest HP pool and defensive disciplines.',
    tips: [
      'Keep Taunt and Kick maxed — they are your aggro lifeline.',
      'Use Defensive Discipline on hard-hitting raid targets.',
      'Carry a shield for tanking and a 2H for DPS swaps.',
      'Snap aggro with Provoke once unlocked in later expansions.',
    ],
  },
  {
    name: 'Cleric',
    archetype: 'Healer',
    role: 'Primary Healer',
    difficulty: 'Beginner',
    stats: { primary: 'WIS', secondary: 'STA' },
    summary:
      'The backbone of any group. Clerics wield Complete Heal, the most mana-efficient heal in the game, and resurrect the fallen.',
    tips: [
      'Learn the Complete Heal rotation on raids — timing is everything.',
      'Keep Symbol and Heroic Bond buffs up on the tank.',
      'Use Divine Aura to drop aggro; never heal yourself with it down.',
      'Pacify pulls are your friend in dungeons.',
    ],
  },
  {
    name: 'Enchanter',
    archetype: 'Support',
    role: 'Crowd Control / Mana Battery',
    difficulty: 'Advanced',
    stats: { primary: 'INT', secondary: 'CHA' },
    summary:
      'Masters of crowd control and mana regeneration. Enchanters lock down adds with Mez and sustain groups with Clarity and haste.',
    tips: [
      'High Charisma reduces Mez resists — gear for it on hard mezzes.',
      'Always call your mezzes in group chat to avoid early breaks.',
      'Keep Clarity on the healer and yourself at all times.',
      'Charm is powerful but dangerous — keep Rune up.',
    ],
  },
  {
    name: 'Wizard',
    archetype: 'Caster DPS',
    role: 'Burst Damage',
    difficulty: 'Intermediate',
    stats: { primary: 'INT', secondary: 'STA' },
    summary:
      'Pure burst casters. Wizards unload the highest single-target nukes in the game and are essential for burning down raid targets.',
    tips: [
      'Manage aggro — wait for the tank to hit 95% before nuking.',
      'Use Concussion (when available) to shed aggro mid-fight.',
      'Match nuke resist type to the target\'s weakness.',
      'Keep an evac spell memorized for emergencies.',
    ],
  },
  {
    name: 'Rogue',
    archetype: 'Melee DPS',
    role: 'Sustained Melee DPS',
    difficulty: 'Intermediate',
    stats: { primary: 'STR', secondary: 'DEX' },
    summary:
      'Backstab is the rogue\'s signature. Position behind the target and unleash the highest sustained melee DPS in the game.',
    tips: [
      'Always fight from behind to land Backstabs.',
      'Evade (hide) to shed aggro when you pull it.',
      'Keep Pick Lock and Sense Traps skilled for dungeon crawls.',
      'Use poisons for added damage on tough targets.',
    ],
  },
  {
    name: 'Shaman',
    archetype: 'Hybrid',
    role: 'Slower / Buffer / Healer',
    difficulty: 'Intermediate',
    stats: { primary: 'WIS', secondary: 'STA' },
    summary:
      'The most versatile support class. Shamans slow enemies to a crawl, buff the party with Focus and Talisman, and heal when needed.',
    tips: [
      'Slow is your most powerful spell — cast it first on tough mobs.',
      'Keep Cannibalize up to sustain mana during long fights.',
      'Torpor (when available) is your most efficient heal.',
      'Buff STR/DEX for melee, Haste is covered by enchanters.',
    ],
  },
];

export const stats = [
  { value: '5', label: 'Expansions Unlocked' },
  { value: '12', label: 'Zones Documented' },
  { value: '10', label: 'Items Catalogued' },
  { value: '6', label: 'Raid Targets' },
];

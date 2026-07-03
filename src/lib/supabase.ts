import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type KronoPrice = {
  id: string;
  price_pp: number;
  note: string | null;
  created_at: string;
};

export type Guild = {
  id: string;
  name: string;
  tag: string | null;
  created_at: string;
};

export type GuildKill = {
  id: string;
  guild_id: string;
  boss_name: string;
  expansion: string;
  killed_at: string;
  notes: string | null;
  created_at: string;
};

export type RaidLoot = {
  id: string;
  boss_name: string;
  expansion: string;
  item_name: string;
  slot: string;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  classes: string[];
  stats: { label: string; value: string }[];
  drop_notes: string | null;
  created_at: string;
};

export type Comment = {
  id: string;
  content_type: 'raid' | 'zone' | 'item' | 'quest' | 'general';
  content_id: string;
  author_name: string | null;
  body: string;
  created_at: string;
};

export type RaidStrategy = {
  id: string;
  boss_name: string;
  expansion: string;
  min_raid_size: number | null;
  resist_notes: string | null;
  preparation: string | null;
  positioning: string | null;
  mechanics: string | null;
  roles_tank: string | null;
  roles_healer: string | null;
  roles_dps: string | null;
  roles_support: string | null;
  tips: string[];
  updated_at: string;
  created_at: string;
};

export type AuctionListing = {
  id: string;
  type: 'WTS' | 'WTB';
  item_name: string;
  price_pp: number | null;
  seller_name: string;
  note: string | null;
  expires_at: string;
  created_at: string;
};

export type ItemImage = {
  id: string;
  item_name: string;
  storage_path: string;
  caption: string | null;
  uploader_name: string | null;
  created_at: string;
};

export type HunterAchievement = {
  id: string;
  zone_name: string;
  zone_id: string;
  expansion: string;
  mob_names: string[];
  reward_title: string;
  reward_aa: number;
  reward_notes: string | null;
  difficulty: 'Easy' | 'Moderate' | 'Hard' | 'Extreme';
  created_at: string;
};

export type HunterKillReport = {
  id: string;
  achievement_id: string;
  mob_name: string;
  reporter_name: string | null;
  spawn_notes: string | null;
  created_at: string;
};

export type RaidVideo = {
  id: string;
  boss_name: string;
  title: string;
  url: string;
  video_type: 'youtube' | 'other';
  video_id: string | null;
  submitter_name: string | null;
  notes: string | null;
  created_at: string;
};

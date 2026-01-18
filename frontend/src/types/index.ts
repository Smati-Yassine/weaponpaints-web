/**
 * Frontend TypeScript type definitions
 */

// Domain types
export type SteamID = string;
export type TeamValue = 2 | 3; // 2 = T, 3 = CT

// User types
export interface User {
  steamId: SteamID;
  displayName: string;
  avatar: string;
}

// Sticker configuration
export interface Sticker {
  id: number;
  schema: number;
  x: number;
  y: number;
  wear: number;
  scale: number;
  rotation: number;
}

// Keychain configuration
export interface Keychain {
  id: number;
  x: number;
  y: number;
  z: number;
  seed: number;
}

// Weapon configuration
export interface WeaponConfig {
  steamid: SteamID;
  weaponTeam: TeamValue;
  weaponDefindex: number;
  paintId: number;
  wear: number;
  seed: number;
  nametag: string | null;
  stattrak: boolean;
  stattrakCount: number;
  stickers: Sticker[];
  keychain: Keychain | null;
}

// Knife configuration
export interface KnifeConfig {
  steamid: SteamID;
  team: TeamValue;
  knife: string;
}

// Glove configuration
export interface GloveConfig {
  steamid: SteamID;
  team: TeamValue;
  defindex: number;
}

// Agent configuration
export interface AgentConfig {
  steamid: SteamID;
  agentCT: string | null;
  agentT: string | null;
}

// Music kit configuration
export interface MusicConfig {
  steamid: SteamID;
  team: TeamValue;
  musicId: number;
}

// Pin configuration
export interface PinConfig {
  steamid: SteamID;
  team: TeamValue;
  pinId: number;
}

// Item data types
export interface WeaponSkin {
  id: number;
  paintId: number;
  name: string;
  imageUrl: string;
  rarity?: string;
  collection?: string;
  weaponType?: string;
}

export interface Glove {
  id: number;
  defindex: number;
  name: string;
  imageUrl: string;
}

export interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  team?: 'T' | 'CT' | 'Both';
}

export interface MusicKit {
  id: number;
  name: string;
  artist?: string;
  previewUrl?: string;
}

export interface Pin {
  id: number;
  name: string;
  imageUrl: string;
  series?: string;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface WeaponsResponse {
  weapons: WeaponConfig[];
}

export interface ItemsResponse<T> {
  [key: string]: T[];
}

/**
 * Database type definitions for CS2 WeaponPaints
 */

// Domain types
export type SteamID = string; // 64-bit Steam ID as string (e.g., "76561198001234567")
export type TeamValue = 2 | 3; // 2 = Terrorist, 3 = Counter-Terrorist

/**
 * Sticker configuration
 * Format: id;schema;x;y;wear;scale;rotation
 */
export interface Sticker {
  id: number;
  schema: number;
  x: number;
  y: number;
  wear: number;
  scale: number;
  rotation: number;
}

/**
 * Keychain configuration
 * Format: id;x;y;z;seed
 */
export interface Keychain {
  id: number;
  x: number;
  y: number;
  z: number;
  seed: number;
}

/**
 * Database table: wp_player_skins
 * Stores weapon skin configurations per player
 */
export interface PlayerSkin {
  steamid: SteamID;
  weapon_team: TeamValue;
  weapon_defindex: number;
  weapon_paint_id: number;
  weapon_wear: number;
  weapon_seed: number;
  weapon_nametag: string | null;
  weapon_stattrak: boolean;
  weapon_stattrak_count: number;
  weapon_sticker_0: string; // Delimited string format
  weapon_sticker_1: string;
  weapon_sticker_2: string;
  weapon_sticker_3: string;
  weapon_sticker_4: string;
  weapon_keychain: string; // Delimited string format
}

/**
 * Database table: wp_player_knife
 * Stores knife selection per player and team
 */
export interface PlayerKnife {
  steamid: SteamID;
  weapon_team: TeamValue;
  knife: string; // e.g., "weapon_knife_butterfly"
}

/**
 * Database table: wp_player_gloves
 * Stores glove selection per player and team
 */
export interface PlayerGloves {
  steamid: SteamID;
  weapon_team: TeamValue;
  weapon_defindex: number; // Glove defindex
}

/**
 * Database table: wp_player_agents
 * Stores agent/player model selection
 */
export interface PlayerAgents {
  steamid: SteamID;
  agent_ct: string | null; // CT agent model path
  agent_t: string | null; // T agent model path
}

/**
 * Database table: wp_player_music
 * Stores music kit selection per player and team
 */
export interface PlayerMusic {
  steamid: SteamID;
  weapon_team: TeamValue;
  music_id: number;
}

/**
 * Database table: wp_player_pins
 * Stores pin selection per player and team
 */
export interface PlayerPins {
  steamid: SteamID;
  weapon_team: TeamValue;
  id: number; // Pin ID
}

/**
 * API-friendly weapon configuration (with parsed stickers/keychains)
 */
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

/**
 * API-friendly knife configuration
 */
export interface KnifeConfig {
  steamid: SteamID;
  team: TeamValue;
  knife: string;
}

/**
 * API-friendly glove configuration
 */
export interface GloveConfig {
  steamid: SteamID;
  team: TeamValue;
  defindex: number;
}

/**
 * API-friendly agent configuration
 */
export interface AgentConfig {
  steamid: SteamID;
  agentCT: string | null;
  agentT: string | null;
}

/**
 * API-friendly music kit configuration
 */
export interface MusicConfig {
  steamid: SteamID;
  team: TeamValue;
  musicId: number;
}

/**
 * API-friendly pin configuration
 */
export interface PinConfig {
  steamid: SteamID;
  team: TeamValue;
  pinId: number;
}

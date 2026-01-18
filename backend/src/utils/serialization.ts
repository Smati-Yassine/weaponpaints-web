import { Sticker, Keychain } from '../types/database';

/**
 * Serialize an array of stickers to database format
 * Format: id;schema;x;y;wear;scale;rotation
 * Multiple stickers are separated by commas
 * 
 * @param stickers - Array of sticker objects
 * @returns Delimited string representation
 */
export function serializeStickers(stickers: Sticker[]): string {
  if (!stickers || stickers.length === 0) {
    return '0;0;0;0;0;0;0';
  }

  return stickers
    .map(
      (s) =>
        `${s.id};${s.schema};${s.x};${s.y};${s.wear};${s.scale};${s.rotation}`
    )
    .join(',');
}

/**
 * Deserialize a sticker string from database format to array of sticker objects
 * Format: id;schema;x;y;wear;scale;rotation
 * Multiple stickers are separated by commas
 * 
 * @param stickerString - Delimited string from database
 * @returns Array of sticker objects
 */
export function deserializeStickers(stickerString: string): Sticker[] {
  if (!stickerString || stickerString === '0;0;0;0;0;0;0') {
    return [];
  }

  return stickerString.split(',').map((s) => {
    const parts = s.split(';');
    if (parts.length !== 7) {
      throw new Error(`Invalid sticker format: ${s}`);
    }

    const [id, schema, x, y, wear, scale, rotation] = parts.map(Number);

    // Validate all parts are valid numbers
    if ([id, schema, x, y, wear, scale, rotation].some(isNaN)) {
      throw new Error(`Invalid sticker values: ${s}`);
    }

    return { id, schema, x, y, wear, scale, rotation };
  });
}

/**
 * Serialize a keychain object to database format
 * Format: id;x;y;z;seed
 * 
 * @param keychain - Keychain object
 * @returns Delimited string representation
 */
export function serializeKeychain(keychain: Keychain | null): string {
  if (!keychain) {
    return '0;0;0;0;0';
  }

  return `${keychain.id};${keychain.x};${keychain.y};${keychain.z};${keychain.seed}`;
}

/**
 * Deserialize a keychain string from database format to keychain object
 * Format: id;x;y;z;seed
 * 
 * @param keychainString - Delimited string from database
 * @returns Keychain object or null if empty
 */
export function deserializeKeychain(keychainString: string): Keychain | null {
  if (!keychainString || keychainString === '0;0;0;0;0') {
    return null;
  }

  const parts = keychainString.split(';');
  if (parts.length !== 5) {
    throw new Error(`Invalid keychain format: ${keychainString}`);
  }

  const [id, x, y, z, seed] = parts.map(Number);

  // Validate all parts are valid numbers
  if ([id, x, y, z, seed].some(isNaN)) {
    throw new Error(`Invalid keychain values: ${keychainString}`);
  }

  // If id is 0, treat as no keychain
  if (id === 0) {
    return null;
  }

  return { id, x, y, z, seed };
}

/**
 * Serialize multiple sticker slots (weapon has 5 sticker slots)
 * Returns an array of 5 strings for database storage
 * 
 * @param stickers - Array of stickers (max 5)
 * @returns Array of 5 serialized sticker strings
 */
export function serializeStickerSlots(stickers: Sticker[]): string[] {
  const slots: string[] = [];
  const defaultSlot = '0;0;0;0;0;0;0';

  for (let i = 0; i < 5; i++) {
    if (i < stickers.length) {
      const s = stickers[i];
      slots.push(`${s.id};${s.schema};${s.x};${s.y};${s.wear};${s.scale};${s.rotation}`);
    } else {
      slots.push(defaultSlot);
    }
  }

  return slots;
}

/**
 * Deserialize sticker slots from database (5 separate columns)
 * 
 * @param slots - Array of 5 sticker slot strings from database
 * @returns Array of sticker objects (excluding empty slots)
 */
export function deserializeStickerSlots(slots: string[]): Sticker[] {
  if (!slots || slots.length !== 5) {
    return [];
  }

  const stickers: Sticker[] = [];

  for (const slot of slots) {
    if (!slot || slot === '0;0;0;0;0;0;0') {
      continue;
    }

    const parts = slot.split(';');
    if (parts.length !== 7) {
      continue; // Skip invalid slots
    }

    const [id, schema, x, y, wear, scale, rotation] = parts.map(Number);

    // Skip if any value is NaN or id is 0
    if ([id, schema, x, y, wear, scale, rotation].some(isNaN) || id === 0) {
      continue;
    }

    stickers.push({ id, schema, x, y, wear, scale, rotation });
  }

  return stickers;
}

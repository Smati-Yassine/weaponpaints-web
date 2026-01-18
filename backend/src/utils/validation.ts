import { Sticker } from '../types/database';

/**
 * Validation error class
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Validate wear value (0.00 - 1.00 inclusive)
 * @param wear - Wear value to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateWear(wear: number): boolean {
  if (typeof wear !== 'number' || isNaN(wear)) {
    throw new ValidationError('Wear value must be a number');
  }

  if (wear < 0.0 || wear > 1.0) {
    throw new ValidationError('Wear value must be between 0.00 and 1.00');
  }

  return true;
}

/**
 * Validate seed value (0 - 1000 inclusive)
 * @param seed - Seed value to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateSeed(seed: number): boolean {
  if (typeof seed !== 'number' || isNaN(seed)) {
    throw new ValidationError('Seed value must be a number');
  }

  if (!Number.isInteger(seed)) {
    throw new ValidationError('Seed value must be an integer');
  }

  if (seed < 0 || seed > 1000) {
    throw new ValidationError('Seed value must be between 0 and 1000');
  }

  return true;
}

/**
 * Validate nametag text
 * @param nametag - Nametag text to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateNametag(nametag: string | null): boolean {
  if (nametag === null || nametag === undefined) {
    return true; // Null/undefined is valid (no nametag)
  }

  if (typeof nametag !== 'string') {
    throw new ValidationError('Nametag must be a string');
  }

  // Check length (max 128 characters based on database schema)
  if (nametag.length > 128) {
    throw new ValidationError('Nametag contains invalid characters or exceeds length limit');
  }

  // Check for invalid characters (allow alphanumeric, spaces, and common punctuation)
  const validPattern = /^[a-zA-Z0-9\s\-_!@#$%^&*()\[\]{}+=|\\:;"'<>,.?/~`]*$/;
  if (!validPattern.test(nametag)) {
    throw new ValidationError('Nametag contains invalid characters or exceeds length limit');
  }

  return true;
}

/**
 * Validate StatTrak counter value (non-negative integer)
 * @param counter - StatTrak counter value to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateStatTrakCounter(counter: number): boolean {
  if (typeof counter !== 'number' || isNaN(counter)) {
    throw new ValidationError('StatTrak counter must be a non-negative integer');
  }

  if (!Number.isInteger(counter)) {
    throw new ValidationError('StatTrak counter must be a non-negative integer');
  }

  if (counter < 0) {
    throw new ValidationError('StatTrak counter must be a non-negative integer');
  }

  return true;
}

/**
 * Validate a single sticker configuration
 * @param sticker - Sticker object to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateSticker(sticker: Sticker): boolean {
  if (!sticker || typeof sticker !== 'object') {
    throw new ValidationError('Sticker must be an object');
  }

  // Validate id
  if (typeof sticker.id !== 'number' || isNaN(sticker.id) || !Number.isInteger(sticker.id)) {
    throw new ValidationError('Sticker id must be an integer');
  }

  if (sticker.id < 0) {
    throw new ValidationError('Sticker id must be non-negative');
  }

  // Validate schema
  if (typeof sticker.schema !== 'number' || isNaN(sticker.schema) || !Number.isInteger(sticker.schema)) {
    throw new ValidationError('Sticker schema must be an integer');
  }

  // Validate position (x, y should be between 0 and 1)
  if (typeof sticker.x !== 'number' || isNaN(sticker.x) || sticker.x < 0 || sticker.x > 1) {
    throw new ValidationError('Sticker x position must be between 0 and 1');
  }

  if (typeof sticker.y !== 'number' || isNaN(sticker.y) || sticker.y < 0 || sticker.y > 1) {
    throw new ValidationError('Sticker y position must be between 0 and 1');
  }

  // Validate wear (0 to 1)
  if (typeof sticker.wear !== 'number' || isNaN(sticker.wear) || sticker.wear < 0 || sticker.wear > 1) {
    throw new ValidationError('Sticker wear must be between 0 and 1');
  }

  // Validate scale (reasonable range 0.1 to 5)
  if (typeof sticker.scale !== 'number' || isNaN(sticker.scale) || sticker.scale < 0.1 || sticker.scale > 5) {
    throw new ValidationError('Sticker scale must be between 0.1 and 5');
  }

  // Validate rotation (0 to 360 degrees)
  if (typeof sticker.rotation !== 'number' || isNaN(sticker.rotation) || sticker.rotation < 0 || sticker.rotation > 360) {
    throw new ValidationError('Sticker rotation must be between 0 and 360');
  }

  return true;
}

/**
 * Validate array of stickers (max 5)
 * @param stickers - Array of stickers to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateStickers(stickers: Sticker[]): boolean {
  if (!Array.isArray(stickers)) {
    throw new ValidationError('Stickers must be an array');
  }

  if (stickers.length > 5) {
    throw new ValidationError('Maximum 5 stickers allowed per weapon');
  }

  // Validate each sticker
  stickers.forEach((sticker, index) => {
    try {
      validateSticker(sticker);
    } catch (error) {
      if (error instanceof ValidationError) {
        throw new ValidationError(`Sticker ${index + 1}: ${error.message}`);
      }
      throw error;
    }
  });

  return true;
}

/**
 * Validate team value (2 or 3)
 * @param team - Team value to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateTeam(team: number): boolean {
  if (typeof team !== 'number' || isNaN(team)) {
    throw new ValidationError('Team value must be a number');
  }

  if (!Number.isInteger(team)) {
    throw new ValidationError('Team value must be an integer');
  }

  if (team !== 2 && team !== 3) {
    throw new ValidationError('Team value must be 2 (Terrorist) or 3 (Counter-Terrorist)');
  }

  return true;
}

/**
 * Validate Steam ID format (64-bit string)
 * @param steamId - Steam ID to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateSteamId(steamId: string): boolean {
  if (typeof steamId !== 'string') {
    throw new ValidationError('Steam ID must be a string');
  }

  // Steam ID should be 17 digits
  if (!/^\d{17}$/.test(steamId)) {
    throw new ValidationError('Steam ID must be a 17-digit string');
  }

  return true;
}

/**
 * Validate weapon defindex
 * @param defindex - Weapon defindex to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validateWeaponDefindex(defindex: number): boolean {
  if (typeof defindex !== 'number' || isNaN(defindex)) {
    throw new ValidationError('Weapon defindex must be a number');
  }

  if (!Number.isInteger(defindex)) {
    throw new ValidationError('Weapon defindex must be an integer');
  }

  if (defindex < 0) {
    throw new ValidationError('Weapon defindex must be non-negative');
  }

  return true;
}

/**
 * Validate paint ID
 * @param paintId - Paint ID to validate
 * @returns true if valid
 * @throws ValidationError if invalid
 */
export function validatePaintId(paintId: number): boolean {
  if (typeof paintId !== 'number' || isNaN(paintId)) {
    throw new ValidationError('Paint ID must be a number');
  }

  if (!Number.isInteger(paintId)) {
    throw new ValidationError('Paint ID must be an integer');
  }

  if (paintId < 0) {
    throw new ValidationError('Paint ID must be non-negative');
  }

  return true;
}

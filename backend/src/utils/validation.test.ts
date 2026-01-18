import * as fc from 'fast-check';
import {
  validateWear,
  validateSeed,
  validateNametag,
  validateStatTrakCounter,
  validateSticker,
  validateStickers,
  validateTeam,
  validateSteamId,
  validateWeaponDefindex,
  validatePaintId,
  ValidationError,
} from './validation';
import { Sticker } from '../types/database';

describe('Validation Utils', () => {
  describe('Wear Value Validation', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 6: Wear Value Validation
    it('should accept valid wear values between 0.00 and 1.00', () => {
      fc.assert(
        fc.property(fc.float({ min: 0.0, max: 1.0 }), (wear) => {
          expect(validateWear(wear)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: cs2-weaponpaints-web-interface, Property 28: Input Validation Rejection
    it('should reject wear values outside valid range', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.float({ min: -1000, max: -0.01 }),
            fc.float({ min: 1.01, max: 1000 })
          ),
          (wear) => {
            expect(() => validateWear(wear)).toThrow(ValidationError);
            expect(() => validateWear(wear)).toThrow('Wear value must be between 0.00 and 1.00');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept boundary values', () => {
      expect(validateWear(0.0)).toBe(true);
      expect(validateWear(1.0)).toBe(true);
    });

    it('should reject non-numeric values', () => {
      expect(() => validateWear(NaN)).toThrow('Wear value must be a number');
      expect(() => validateWear('0.5' as any)).toThrow('Wear value must be a number');
    });
  });

  describe('Seed Value Validation', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 7: Seed Value Validation
    it('should accept valid seed values between 0 and 1000', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000 }), (seed) => {
          expect(validateSeed(seed)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: cs2-weaponpaints-web-interface, Property 28: Input Validation Rejection
    it('should reject seed values outside valid range', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -1000, max: -1 }),
            fc.integer({ min: 1001, max: 10000 })
          ),
          (seed) => {
            expect(() => validateSeed(seed)).toThrow(ValidationError);
            expect(() => validateSeed(seed)).toThrow('Seed value must be between 0 and 1000');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept boundary values', () => {
      expect(validateSeed(0)).toBe(true);
      expect(validateSeed(1000)).toBe(true);
    });

    it('should reject non-integer values', () => {
      expect(() => validateSeed(0.5)).toThrow('Seed value must be an integer');
      expect(() => validateSeed(NaN)).toThrow('Seed value must be a number');
    });
  });

  describe('StatTrak Counter Validation', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 16: StatTrak Counter Validation
    it('should accept non-negative integer values', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 1000000 }), (counter) => {
          expect(validateStatTrakCounter(counter)).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    // Feature: cs2-weaponpaints-web-interface, Property 28: Input Validation Rejection
    it('should reject negative values', () => {
      fc.assert(
        fc.property(fc.integer({ min: -1000, max: -1 }), (counter) => {
          expect(() => validateStatTrakCounter(counter)).toThrow(ValidationError);
          expect(() => validateStatTrakCounter(counter)).toThrow('StatTrak counter must be a non-negative integer');
        }),
        { numRuns: 100 }
      );
    });

    it('should reject non-integer values', () => {
      expect(() => validateStatTrakCounter(10.5)).toThrow('StatTrak counter must be a non-negative integer');
      expect(() => validateStatTrakCounter(NaN)).toThrow('StatTrak counter must be a non-negative integer');
    });

    it('should accept zero', () => {
      expect(validateStatTrakCounter(0)).toBe(true);
    });
  });

  describe('Nametag Validation', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 17: Nametag Validation and Persistence
    it('should accept valid nametag strings', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 128 }).filter(s => /^[a-zA-Z0-9\s\-_!@#$%^&*()\[\]{}+=|\\:;"'<>,.?/~`]*$/.test(s)),
          (nametag) => {
            expect(validateNametag(nametag)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept null or undefined nametag', () => {
      expect(validateNametag(null)).toBe(true);
      expect(validateNametag(undefined as any)).toBe(true);
    });

    // Feature: cs2-weaponpaints-web-interface, Property 28: Input Validation Rejection
    it('should reject nametags exceeding length limit', () => {
      const longNametag = 'a'.repeat(129);
      expect(() => validateNametag(longNametag)).toThrow(ValidationError);
      expect(() => validateNametag(longNametag)).toThrow('Nametag contains invalid characters or exceeds length limit');
    });

    it('should accept nametag at max length', () => {
      const maxLengthNametag = 'a'.repeat(128);
      expect(validateNametag(maxLengthNametag)).toBe(true);
    });

    it('should reject non-string values', () => {
      expect(() => validateNametag(123 as any)).toThrow('Nametag must be a string');
    });
  });

  describe('Sticker Validation', () => {
    const validSticker: Sticker = {
      id: 1,
      schema: 0,
      x: 0.5,
      y: 0.5,
      wear: 0.0,
      scale: 1.0,
      rotation: 0.0,
    };

    it('should accept valid sticker configuration', () => {
      expect(validateSticker(validSticker)).toBe(true);
    });

    it('should reject sticker with invalid id', () => {
      expect(() => validateSticker({ ...validSticker, id: -1 })).toThrow('Sticker id must be non-negative');
      expect(() => validateSticker({ ...validSticker, id: 1.5 })).toThrow('Sticker id must be an integer');
    });

    it('should reject sticker with invalid position', () => {
      expect(() => validateSticker({ ...validSticker, x: -0.1 })).toThrow('Sticker x position must be between 0 and 1');
      expect(() => validateSticker({ ...validSticker, x: 1.1 })).toThrow('Sticker x position must be between 0 and 1');
      expect(() => validateSticker({ ...validSticker, y: -0.1 })).toThrow('Sticker y position must be between 0 and 1');
      expect(() => validateSticker({ ...validSticker, y: 1.1 })).toThrow('Sticker y position must be between 0 and 1');
    });

    it('should reject sticker with invalid wear', () => {
      expect(() => validateSticker({ ...validSticker, wear: -0.1 })).toThrow('Sticker wear must be between 0 and 1');
      expect(() => validateSticker({ ...validSticker, wear: 1.1 })).toThrow('Sticker wear must be between 0 and 1');
    });

    it('should reject sticker with invalid scale', () => {
      expect(() => validateSticker({ ...validSticker, scale: 0.05 })).toThrow('Sticker scale must be between 0.1 and 5');
      expect(() => validateSticker({ ...validSticker, scale: 6 })).toThrow('Sticker scale must be between 0.1 and 5');
    });

    it('should reject sticker with invalid rotation', () => {
      expect(() => validateSticker({ ...validSticker, rotation: -1 })).toThrow('Sticker rotation must be between 0 and 360');
      expect(() => validateSticker({ ...validSticker, rotation: 361 })).toThrow('Sticker rotation must be between 0 and 360');
    });
  });

  describe('Stickers Array Validation', () => {
    const validSticker: Sticker = {
      id: 1,
      schema: 0,
      x: 0.5,
      y: 0.5,
      wear: 0.0,
      scale: 1.0,
      rotation: 0.0,
    };

    it('should accept array with up to 5 stickers', () => {
      expect(validateStickers([])).toBe(true);
      expect(validateStickers([validSticker])).toBe(true);
      expect(validateStickers([validSticker, validSticker, validSticker, validSticker, validSticker])).toBe(true);
    });

    // Feature: cs2-weaponpaints-web-interface, Property 28: Input Validation Rejection
    it('should reject array with more than 5 stickers', () => {
      const sixStickers = Array(6).fill(validSticker);
      expect(() => validateStickers(sixStickers)).toThrow('Maximum 5 stickers allowed per weapon');
    });

    it('should reject non-array input', () => {
      expect(() => validateStickers('not an array' as any)).toThrow('Stickers must be an array');
    });

    it('should reject array with invalid sticker', () => {
      const invalidSticker = { ...validSticker, x: 2.0 };
      expect(() => validateStickers([validSticker, invalidSticker])).toThrow('Sticker 2');
    });
  });

  describe('Team Validation', () => {
    it('should accept valid team values', () => {
      expect(validateTeam(2)).toBe(true);
      expect(validateTeam(3)).toBe(true);
    });

    it('should reject invalid team values', () => {
      expect(() => validateTeam(0)).toThrow('Team value must be 2 (Terrorist) or 3 (Counter-Terrorist)');
      expect(() => validateTeam(1)).toThrow('Team value must be 2 (Terrorist) or 3 (Counter-Terrorist)');
      expect(() => validateTeam(4)).toThrow('Team value must be 2 (Terrorist) or 3 (Counter-Terrorist)');
    });

    it('should reject non-integer values', () => {
      expect(() => validateTeam(2.5)).toThrow('Team value must be an integer');
    });
  });

  describe('Steam ID Validation', () => {
    it('should accept valid 17-digit Steam ID', () => {
      expect(validateSteamId('76561198001234567')).toBe(true);
      expect(validateSteamId('12345678901234567')).toBe(true);
    });

    it('should reject invalid Steam ID formats', () => {
      expect(() => validateSteamId('123')).toThrow('Steam ID must be a 17-digit string');
      expect(() => validateSteamId('1234567890123456')).toThrow('Steam ID must be a 17-digit string');
      expect(() => validateSteamId('123456789012345678')).toThrow('Steam ID must be a 17-digit string');
      expect(() => validateSteamId('abcdefghijk123456')).toThrow('Steam ID must be a 17-digit string');
    });

    it('should reject non-string values', () => {
      expect(() => validateSteamId(123 as any)).toThrow('Steam ID must be a string');
    });
  });

  describe('Weapon Defindex Validation', () => {
    it('should accept valid weapon defindex', () => {
      expect(validateWeaponDefindex(0)).toBe(true);
      expect(validateWeaponDefindex(7)).toBe(true);
      expect(validateWeaponDefindex(500)).toBe(true);
    });

    it('should reject negative values', () => {
      expect(() => validateWeaponDefindex(-1)).toThrow('Weapon defindex must be non-negative');
    });

    it('should reject non-integer values', () => {
      expect(() => validateWeaponDefindex(7.5)).toThrow('Weapon defindex must be an integer');
    });
  });

  describe('Paint ID Validation', () => {
    it('should accept valid paint ID', () => {
      expect(validatePaintId(0)).toBe(true);
      expect(validatePaintId(123)).toBe(true);
      expect(validatePaintId(9999)).toBe(true);
    });

    it('should reject negative values', () => {
      expect(() => validatePaintId(-1)).toThrow('Paint ID must be non-negative');
    });

    it('should reject non-integer values', () => {
      expect(() => validatePaintId(123.5)).toThrow('Paint ID must be an integer');
    });
  });

  describe('Edge Cases', () => {
    describe('Wear Value Edge Cases', () => {
      it('should handle exact boundary values', () => {
        expect(validateWear(0.0)).toBe(true);
        expect(validateWear(1.0)).toBe(true);
      });

      it('should handle very small valid values', () => {
        expect(validateWear(0.000001)).toBe(true);
        expect(validateWear(0.999999)).toBe(true);
      });

      it('should reject values just outside boundaries', () => {
        expect(() => validateWear(-0.000001)).toThrow();
        expect(() => validateWear(1.000001)).toThrow();
      });

      it('should handle null and undefined', () => {
        expect(() => validateWear(null as any)).toThrow('Wear value must be a number');
        expect(() => validateWear(undefined as any)).toThrow('Wear value must be a number');
      });
    });

    describe('Seed Value Edge Cases', () => {
      it('should handle exact boundary values', () => {
        expect(validateSeed(0)).toBe(true);
        expect(validateSeed(1000)).toBe(true);
      });

      it('should reject values just outside boundaries', () => {
        expect(() => validateSeed(-1)).toThrow();
        expect(() => validateSeed(1001)).toThrow();
      });

      it('should handle null and undefined', () => {
        expect(() => validateSeed(null as any)).toThrow('Seed value must be a number');
        expect(() => validateSeed(undefined as any)).toThrow('Seed value must be a number');
      });

      it('should reject floating point numbers', () => {
        expect(() => validateSeed(500.5)).toThrow('Seed value must be an integer');
      });
    });

    describe('Nametag Edge Cases', () => {
      it('should handle empty string', () => {
        expect(validateNametag('')).toBe(true);
      });

      it('should handle string with only spaces', () => {
        expect(validateNametag('   ')).toBe(true);
      });

      it('should handle special characters', () => {
        expect(validateNametag('My-Weapon_123!')).toBe(true);
        expect(validateNametag('Test@#$%')).toBe(true);
      });

      it('should handle unicode characters gracefully', () => {
        // Unicode characters should be rejected
        expect(() => validateNametag('Test™')).toThrow();
        expect(() => validateNametag('Test😀')).toThrow();
      });
    });

    describe('StatTrak Counter Edge Cases', () => {
      it('should handle zero', () => {
        expect(validateStatTrakCounter(0)).toBe(true);
      });

      it('should handle large numbers', () => {
        expect(validateStatTrakCounter(999999)).toBe(true);
        expect(validateStatTrakCounter(Number.MAX_SAFE_INTEGER)).toBe(true);
      });

      it('should reject Infinity', () => {
        expect(() => validateStatTrakCounter(Infinity)).toThrow();
      });

      it('should handle null and undefined', () => {
        expect(() => validateStatTrakCounter(null as any)).toThrow();
        expect(() => validateStatTrakCounter(undefined as any)).toThrow();
      });
    });

    describe('Sticker Edge Cases', () => {
      it('should handle empty stickers array', () => {
        expect(validateStickers([])).toBe(true);
      });

      it('should handle exactly 5 stickers', () => {
        const stickers = Array(5).fill({
          id: 1,
          schema: 0,
          x: 0.5,
          y: 0.5,
          wear: 0.0,
          scale: 1.0,
          rotation: 0.0,
        });
        expect(validateStickers(stickers)).toBe(true);
      });

      it('should reject null or undefined stickers array', () => {
        expect(() => validateStickers(null as any)).toThrow('Stickers must be an array');
        expect(() => validateStickers(undefined as any)).toThrow('Stickers must be an array');
      });

      it('should handle sticker with boundary values', () => {
        const sticker = {
          id: 0,
          schema: 0,
          x: 0.0,
          y: 0.0,
          wear: 0.0,
          scale: 0.1,
          rotation: 0.0,
        };
        expect(validateSticker(sticker)).toBe(true);

        const maxSticker = {
          id: 10000,
          schema: 100,
          x: 1.0,
          y: 1.0,
          wear: 1.0,
          scale: 5.0,
          rotation: 360.0,
        };
        expect(validateSticker(maxSticker)).toBe(true);
      });
    });
  });
});

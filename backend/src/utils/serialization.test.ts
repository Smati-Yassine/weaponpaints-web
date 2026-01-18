import * as fc from 'fast-check';
import {
  serializeStickers,
  deserializeStickers,
  serializeKeychain,
  deserializeKeychain,
  serializeStickerSlots,
  deserializeStickerSlots,
} from './serialization';
import { Sticker, Keychain } from '../types/database';

// Arbitraries for property-based testing
const stickerArbitrary = (): fc.Arbitrary<Sticker> =>
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    schema: fc.integer({ min: 0, max: 100 }),
    x: fc.float({ min: 0, max: 1 }),
    y: fc.float({ min: 0, max: 1 }),
    wear: fc.float({ min: 0, max: 1 }),
    scale: fc.float({ min: 0.1, max: 2 }),
    rotation: fc.float({ min: 0, max: 360 }),
  });

const keychainArbitrary = (): fc.Arbitrary<Keychain> =>
  fc.record({
    id: fc.integer({ min: 1, max: 10000 }),
    x: fc.float({ min: -10, max: 10 }),
    y: fc.float({ min: -10, max: 10 }),
    z: fc.float({ min: -10, max: 10 }),
    seed: fc.integer({ min: 0, max: 1000 }),
  });

describe('Serialization Utils', () => {
  describe('Sticker Serialization', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 19: Sticker Serialization Round-Trip
    it('should serialize and deserialize stickers maintaining data integrity', () => {
      fc.assert(
        fc.property(fc.array(stickerArbitrary(), { maxLength: 5 }), (stickers) => {
          const serialized = serializeStickers(stickers);
          const deserialized = deserializeStickers(serialized);

          expect(deserialized).toHaveLength(stickers.length);

          deserialized.forEach((sticker, index) => {
            expect(sticker.id).toBe(stickers[index].id);
            expect(sticker.schema).toBe(stickers[index].schema);
            expect(sticker.x).toBeCloseTo(stickers[index].x, 10);
            expect(sticker.y).toBeCloseTo(stickers[index].y, 10);
            expect(sticker.wear).toBeCloseTo(stickers[index].wear, 10);
            expect(sticker.scale).toBeCloseTo(stickers[index].scale, 10);
            expect(sticker.rotation).toBeCloseTo(stickers[index].rotation, 10);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should handle empty sticker array', () => {
      const serialized = serializeStickers([]);
      expect(serialized).toBe('0;0;0;0;0;0;0');

      const deserialized = deserializeStickers(serialized);
      expect(deserialized).toEqual([]);
    });

    it('should serialize single sticker correctly', () => {
      const sticker: Sticker = {
        id: 123,
        schema: 0,
        x: 0.5,
        y: 0.3,
        wear: 0.0,
        scale: 1.0,
        rotation: 0.0,
      };

      const serialized = serializeStickers([sticker]);
      expect(serialized).toBe('123;0;0.5;0.3;0;1;0');

      const deserialized = deserializeStickers(serialized);
      expect(deserialized).toHaveLength(1);
      expect(deserialized[0]).toEqual(sticker);
    });

    it('should serialize multiple stickers with comma separator', () => {
      const stickers: Sticker[] = [
        { id: 1, schema: 0, x: 0.1, y: 0.2, wear: 0.0, scale: 1.0, rotation: 0.0 },
        { id: 2, schema: 0, x: 0.3, y: 0.4, wear: 0.0, scale: 1.0, rotation: 0.0 },
      ];

      const serialized = serializeStickers(stickers);
      expect(serialized).toContain(',');
      expect(serialized.split(',')).toHaveLength(2);
    });

    it('should throw error for invalid sticker format', () => {
      expect(() => deserializeStickers('invalid')).toThrow('Invalid sticker format');
      expect(() => deserializeStickers('1;2;3')).toThrow('Invalid sticker format');
    });

    it('should throw error for non-numeric sticker values', () => {
      expect(() => deserializeStickers('abc;0;0;0;0;0;0')).toThrow('Invalid sticker values');
    });
  });

  describe('Keychain Serialization', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 20: Keychain Serialization Round-Trip
    it('should serialize and deserialize keychain maintaining data integrity', () => {
      fc.assert(
        fc.property(keychainArbitrary(), (keychain) => {
          const serialized = serializeKeychain(keychain);
          const deserialized = deserializeKeychain(serialized);

          expect(deserialized).not.toBeNull();
          expect(deserialized!.id).toBe(keychain.id);
          expect(deserialized!.x).toBeCloseTo(keychain.x, 10);
          expect(deserialized!.y).toBeCloseTo(keychain.y, 10);
          expect(deserialized!.z).toBeCloseTo(keychain.z, 10);
          expect(deserialized!.seed).toBe(keychain.seed);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle null keychain', () => {
      const serialized = serializeKeychain(null);
      expect(serialized).toBe('0;0;0;0;0');

      const deserialized = deserializeKeychain(serialized);
      expect(deserialized).toBeNull();
    });

    it('should serialize keychain correctly', () => {
      const keychain: Keychain = {
        id: 456,
        x: 0.0,
        y: 0.0,
        z: 0.0,
        seed: 123,
      };

      const serialized = serializeKeychain(keychain);
      expect(serialized).toBe('456;0;0;0;123');

      const deserialized = deserializeKeychain(serialized);
      expect(deserialized).toEqual(keychain);
    });

    it('should return null for keychain with id 0', () => {
      const deserialized = deserializeKeychain('0;1;2;3;4');
      expect(deserialized).toBeNull();
    });

    it('should throw error for invalid keychain format', () => {
      expect(() => deserializeKeychain('invalid')).toThrow('Invalid keychain format');
      expect(() => deserializeKeychain('1;2;3')).toThrow('Invalid keychain format');
    });

    it('should throw error for non-numeric keychain values', () => {
      expect(() => deserializeKeychain('abc;0;0;0;0')).toThrow('Invalid keychain values');
    });
  });

  describe('Sticker Slots Serialization', () => {
    it('should serialize stickers into 5 slots', () => {
      const stickers: Sticker[] = [
        { id: 1, schema: 0, x: 0.1, y: 0.2, wear: 0.0, scale: 1.0, rotation: 0.0 },
        { id: 2, schema: 0, x: 0.3, y: 0.4, wear: 0.0, scale: 1.0, rotation: 0.0 },
      ];

      const slots = serializeStickerSlots(stickers);
      expect(slots).toHaveLength(5);
      expect(slots[0]).toBe('1;0;0.1;0.2;0;1;0');
      expect(slots[1]).toBe('2;0;0.3;0.4;0;1;0');
      expect(slots[2]).toBe('0;0;0;0;0;0;0');
      expect(slots[3]).toBe('0;0;0;0;0;0;0');
      expect(slots[4]).toBe('0;0;0;0;0;0;0');
    });

    it('should deserialize sticker slots correctly', () => {
      const slots = [
        '1;0;0.1;0.2;0;1;0',
        '2;0;0.3;0.4;0;1;0',
        '0;0;0;0;0;0;0',
        '0;0;0;0;0;0;0',
        '0;0;0;0;0;0;0',
      ];

      const stickers = deserializeStickerSlots(slots);
      expect(stickers).toHaveLength(2);
      expect(stickers[0].id).toBe(1);
      expect(stickers[1].id).toBe(2);
    });

    it('should handle empty slots array', () => {
      const stickers = deserializeStickerSlots([]);
      expect(stickers).toEqual([]);
    });

    it('should skip invalid slots gracefully', () => {
      const slots = [
        '1;0;0.1;0.2;0;1;0',
        'invalid',
        '0;0;0;0;0;0;0',
        '0;0;0;0;0;0;0',
        '0;0;0;0;0;0;0',
      ];

      const stickers = deserializeStickerSlots(slots);
      expect(stickers).toHaveLength(1);
      expect(stickers[0].id).toBe(1);
    });

    it('should round-trip through slots serialization', () => {
      fc.assert(
        fc.property(fc.array(stickerArbitrary(), { maxLength: 5 }), (stickers) => {
          const slots = serializeStickerSlots(stickers);
          const deserialized = deserializeStickerSlots(slots);

          expect(deserialized).toHaveLength(stickers.length);
        }),
        { numRuns: 100 }
      );
    });
  });
});

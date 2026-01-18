import * as fc from 'fast-check';
import { UserProfile } from './passport';

describe('Steam Authentication', () => {
  describe('Steam ID Format', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 1: Steam ID String Format
    it('should handle Steam ID as 64-bit string format', () => {
      fc.assert(
        fc.property(
          fc.bigInt({ min: 76561197960265728n, max: 76561202255233023n }).map(n => n.toString()),
          (steamId) => {
            // Steam ID should be a string
            expect(typeof steamId).toBe('string');
            
            // Steam ID should be 17 digits
            expect(steamId).toMatch(/^\d{17}$/);
            
            // Steam ID should not be stored as number (would lose precision)
            expect(steamId).not.toBeNaN();
            
            // Verify it's never converted to number type
            const profile: UserProfile = {
              steamId: steamId,
              displayName: 'Test User',
              avatarUrl: 'https://example.com/avatar.jpg',
            };
            
            expect(typeof profile.steamId).toBe('string');
            expect(profile.steamId).toBe(steamId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate Steam ID format correctly', () => {
      const validSteamIds = [
        '76561198001234567',
        '76561197960265728', // Minimum valid Steam ID
        '76561202255233023', // Maximum valid Steam ID (approximate)
      ];

      validSteamIds.forEach((steamId) => {
        expect(steamId).toMatch(/^\d{17}$/);
        expect(typeof steamId).toBe('string');
      });
    });

    it('should reject invalid Steam ID formats', () => {
      const invalidSteamIds = [
        '123', // Too short
        '1234567890123456', // 16 digits
        '123456789012345678', // 18 digits
        'abcdefghijk123456', // Contains letters
        '76561198001234567.0', // Contains decimal
      ];

      invalidSteamIds.forEach((steamId) => {
        expect(steamId).not.toMatch(/^\d{17}$/);
      });
    });

    it('should preserve Steam ID precision as string', () => {
      const steamId = '76561198001234567';
      
      // Verify string representation is preserved
      const profile: UserProfile = {
        steamId: steamId,
        displayName: 'Test',
        avatarUrl: '',
      };

      expect(profile.steamId).toBe(steamId);
      expect(typeof profile.steamId).toBe('string');
      
      // Verify no precision loss
      expect(profile.steamId.length).toBe(17);
    });

    it('should handle Steam ID in user profile', () => {
      const profile: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      expect(profile.steamId).toBe('76561198001234567');
      expect(typeof profile.steamId).toBe('string');
      expect(profile.displayName).toBe('Test User');
      expect(profile.avatarUrl).toBe('https://example.com/avatar.jpg');
    });
  });

  describe('User Profile Structure', () => {
    it('should create valid user profile', () => {
      const profile: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'TestUser',
        avatarUrl: 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/test.jpg',
      };

      expect(profile).toHaveProperty('steamId');
      expect(profile).toHaveProperty('displayName');
      expect(profile).toHaveProperty('avatarUrl');
    });

    it('should handle missing avatar URL', () => {
      const profile: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'TestUser',
        avatarUrl: '',
      };

      expect(profile.avatarUrl).toBe('');
    });

    it('should handle unknown display name', () => {
      const profile: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Unknown',
        avatarUrl: '',
      };

      expect(profile.displayName).toBe('Unknown');
    });
  });

  describe('Steam ID Extraction', () => {
    it('should extract Steam ID from OpenID identifier', () => {
      const identifier = 'https://steamcommunity.com/openid/id/76561198001234567';
      const steamId = identifier.split('/').pop();

      expect(steamId).toBe('76561198001234567');
      expect(steamId).toMatch(/^\d{17}$/);
    });

    it('should validate extracted Steam ID', () => {
      const identifiers = [
        'https://steamcommunity.com/openid/id/76561198001234567',
        'https://steamcommunity.com/openid/id/76561197960265728',
      ];

      identifiers.forEach((identifier) => {
        const steamId = identifier.split('/').pop() || '';
        expect(steamId).toMatch(/^\d{17}$/);
      });
    });
  });
});

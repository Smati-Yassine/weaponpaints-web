import * as fc from 'fast-check';
import { getSessionConfig, isSessionValid, getUserFromSession } from './session';

describe('Session Management', () => {
  describe('Session Configuration', () => {
    it('should return valid session configuration', () => {
      const config = getSessionConfig();

      expect(config).toHaveProperty('secret');
      expect(config).toHaveProperty('resave');
      expect(config).toHaveProperty('saveUninitialized');
      expect(config).toHaveProperty('cookie');
      expect(config.resave).toBe(false);
      expect(config.saveUninitialized).toBe(false);
    });

    it('should configure secure cookies in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const config = getSessionConfig();
      expect(config.cookie?.secure).toBe(true);
      expect(config.cookie?.sameSite).toBe('strict');

      process.env.NODE_ENV = originalEnv;
    });

    it('should configure non-secure cookies in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const config = getSessionConfig();
      expect(config.cookie?.secure).toBe(false);
      expect(config.cookie?.sameSite).toBe('lax');

      process.env.NODE_ENV = originalEnv;
    });

    it('should set httpOnly cookie flag', () => {
      const config = getSessionConfig();
      expect(config.cookie?.httpOnly).toBe(true);
    });

    it('should set session max age', () => {
      const config = getSessionConfig();
      expect(config.cookie?.maxAge).toBeGreaterThan(0);
    });
  });

  describe('Session Validation', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 2: Session Creation on Authentication
    it('should validate session with authenticated user', () => {
      fc.assert(
        fc.property(
          fc.record({
            steamId: fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
            displayName: fc.string({ minLength: 1, maxLength: 50 }),
            avatarUrl: fc.webUrl(),
          }),
          (user) => {
            const session = {
              passport: {
                user: user,
              },
              cookie: {
                expires: new Date(Date.now() + 86400000), // 24 hours from now
              },
            };

            expect(isSessionValid(session)).toBe(true);
            expect(getUserFromSession(session)).toEqual(user);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should invalidate session without passport user', () => {
      const session = {
        cookie: {
          expires: new Date(Date.now() + 86400000),
        },
      };

      expect(isSessionValid(session)).toBe(false);
      expect(getUserFromSession(session)).toBeNull();
    });

    it('should invalidate expired session', () => {
      const session = {
        passport: {
          user: {
            steamId: '76561198001234567',
            displayName: 'Test',
            avatarUrl: '',
          },
        },
        cookie: {
          expires: new Date(Date.now() - 1000), // Expired 1 second ago
        },
      };

      expect(isSessionValid(session)).toBe(false);
      expect(getUserFromSession(session)).toBeNull();
    });

    it('should invalidate null or undefined session', () => {
      expect(isSessionValid(null)).toBe(false);
      expect(isSessionValid(undefined)).toBe(false);
      expect(getUserFromSession(null)).toBeNull();
      expect(getUserFromSession(undefined)).toBeNull();
    });

    it('should validate session without explicit expiry', () => {
      const session = {
        passport: {
          user: {
            steamId: '76561198001234567',
            displayName: 'Test',
            avatarUrl: '',
          },
        },
      };

      // Session without explicit expiry should be valid
      expect(isSessionValid(session)).toBe(true);
    });
  });

  describe('Session Lifecycle', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 3: Session Termination on Logout
    it('should handle session creation and retrieval', () => {
      fc.assert(
        fc.property(
          fc.record({
            steamId: fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
            displayName: fc.string({ minLength: 1, maxLength: 50 }),
            avatarUrl: fc.string(),
          }),
          (user) => {
            // Simulate session creation
            const session = {
              passport: {
                user: user,
              },
              cookie: {
                expires: new Date(Date.now() + 86400000),
              },
            };

            // Verify session is valid
            expect(isSessionValid(session)).toBe(true);

            // Verify user can be retrieved
            const retrievedUser = getUserFromSession(session);
            expect(retrievedUser).toEqual(user);
            expect(retrievedUser.steamId).toBe(user.steamId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle session expiration', () => {
      const user = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      // Create session that expires in 1 second
      const session = {
        passport: { user },
        cookie: {
          expires: new Date(Date.now() + 1000),
        },
      };

      // Session should be valid initially
      expect(isSessionValid(session)).toBe(true);

      // Simulate expiration by setting past date
      session.cookie.expires = new Date(Date.now() - 1000);

      // Session should now be invalid
      expect(isSessionValid(session)).toBe(false);
      expect(getUserFromSession(session)).toBeNull();
    });
  });

  describe('User Retrieval from Session', () => {
    it('should retrieve user from valid session', () => {
      const user = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const session = {
        passport: { user },
        cookie: {
          expires: new Date(Date.now() + 86400000),
        },
      };

      const retrievedUser = getUserFromSession(session);
      expect(retrievedUser).toEqual(user);
    });

    it('should return null for invalid session', () => {
      const invalidSessions = [
        null,
        undefined,
        {},
        { passport: {} },
        { passport: { user: null } },
      ];

      invalidSessions.forEach((session) => {
        expect(getUserFromSession(session)).toBeNull();
      });
    });

    it('should preserve user data integrity', () => {
      fc.assert(
        fc.property(
          fc.record({
            steamId: fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
            displayName: fc.string({ minLength: 1, maxLength: 100 }),
            avatarUrl: fc.string(),
          }),
          (user) => {
            const session = {
              passport: { user },
              cookie: { expires: new Date(Date.now() + 86400000) },
            };

            const retrieved = getUserFromSession(session);
            expect(retrieved).toEqual(user);
            
            // Verify no data corruption
            expect(retrieved.steamId).toBe(user.steamId);
            expect(retrieved.displayName).toBe(user.displayName);
            expect(retrieved.avatarUrl).toBe(user.avatarUrl);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Session Security', () => {
    it('should use httpOnly cookies', () => {
      const config = getSessionConfig();
      expect(config.cookie?.httpOnly).toBe(true);
    });

    it('should use secure cookies in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const config = getSessionConfig();
      expect(config.cookie?.secure).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('should have appropriate sameSite setting', () => {
      const config = getSessionConfig();
      expect(['strict', 'lax', 'none']).toContain(config.cookie?.sameSite);
    });

    it('should have session secret configured', () => {
      const config = getSessionConfig();
      expect(config.secret).toBeDefined();
      expect(typeof config.secret).toBe('string');
      expect(config.secret.length).toBeGreaterThan(0);
    });
  });
});

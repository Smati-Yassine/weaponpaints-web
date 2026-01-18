import * as fc from 'fast-check';
import { Request, Response } from 'express';
import { verifySteamId, requireOwnResource, isAuthorized } from './authorization';
import { UserProfile } from '../config/passport';

// Mock Request and Response
function createMockRequest(user?: UserProfile, params?: any, body?: any, query?: any): Partial<Request> {
  return {
    user,
    params: params || {},
    body: body || {},
    query: query || {},
    path: '/test',
    method: 'GET',
    ip: '127.0.0.1',
    get: (header: string) => 'test-user-agent',
    isAuthenticated: () => !!user,
    session: user ? { passport: { user } } : undefined,
  };
}

function createMockResponse(): Partial<Response> {
  const res: any = {
    statusCode: 200,
    jsonData: null,
  };
  res.status = jest.fn((code: number) => {
    res.statusCode = code;
    return res;
  });
  res.json = jest.fn((data: any) => {
    res.jsonData = data;
    return res;
  });
  return res;
}

describe('Authorization Middleware', () => {
  describe('verifySteamId', () => {
    // Feature: cs2-weaponpaints-web-interface, Property 29: Authorization Enforcement
    it('should allow access when Steam IDs match', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
          (steamId) => {
            const user: UserProfile = {
              steamId,
              displayName: 'Test User',
              avatarUrl: '',
            };

            const req = createMockRequest(user, { steamId });
            const res = createMockResponse();
            const next = jest.fn();

            verifySteamId(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
          }
        ),
        { numRuns: 100 }
      );
    });

    // Feature: cs2-weaponpaints-web-interface, Property 29: Authorization Enforcement
    it('should deny access when Steam IDs do not match', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
            fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s))
          ).filter(([id1, id2]) => id1 !== id2),
          ([authenticatedId, requestedId]) => {
            const user: UserProfile = {
              steamId: authenticatedId,
              displayName: 'Test User',
              avatarUrl: '',
            };

            const req = createMockRequest(user, { steamId: requestedId });
            const res = createMockResponse();
            const next = jest.fn();

            verifySteamId(req as Request, res as Response, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
              expect.objectContaining({
                error: 'Access denied',
              })
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 401 for unauthenticated requests', () => {
      const req = createMockRequest(undefined, { steamId: '76561198001234567' });
      const res = createMockResponse();
      const next = jest.fn();

      verifySteamId(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication required',
        })
      );
    });

    it('should inject Steam ID when not provided in request', () => {
      const steamId = '76561198001234567';
      const user: UserProfile = {
        steamId,
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user);
      const res = createMockResponse();
      const next = jest.fn();

      verifySteamId(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).params.steamId).toBe(steamId);
    });

    it('should check Steam ID from params, body, or query', () => {
      const steamId = '76561198001234567';
      const user: UserProfile = { steamId, displayName: 'Test', avatarUrl: '' };

      // Test params
      let req = createMockRequest(user, { steamId });
      let res = createMockResponse();
      let next = jest.fn();
      verifySteamId(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();

      // Test body
      req = createMockRequest(user, {}, { steamId });
      res = createMockResponse();
      next = jest.fn();
      verifySteamId(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();

      // Test query
      req = createMockRequest(user, {}, {}, { steamId });
      res = createMockResponse();
      next = jest.fn();
      verifySteamId(req as Request, res as Response, next);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requireOwnResource', () => {
    it('should inject authenticated Steam ID into request', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
          (steamId) => {
            const user: UserProfile = {
              steamId,
              displayName: 'Test User',
              avatarUrl: '',
            };

            const req = createMockRequest(user);
            const res = createMockResponse();
            const next = jest.fn();

            requireOwnResource(req as Request, res as Response, next);

            expect(next).toHaveBeenCalled();
            expect((req as any).params.steamId).toBe(steamId);
            expect((req as any).body.steamId).toBe(steamId);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return 401 for unauthenticated requests', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      requireOwnResource(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe('isAuthorized', () => {
    it('should return true when Steam IDs match', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
          (steamId) => {
            const user: UserProfile = {
              steamId,
              displayName: 'Test User',
              avatarUrl: '',
            };

            const req = createMockRequest(user);
            const result = isAuthorized(req as Request, steamId);

            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false when Steam IDs do not match', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s)),
            fc.string({ minLength: 17, maxLength: 17 }).filter(s => /^\d{17}$/.test(s))
          ).filter(([id1, id2]) => id1 !== id2),
          ([authenticatedId, resourceId]) => {
            const user: UserProfile = {
              steamId: authenticatedId,
              displayName: 'Test User',
              avatarUrl: '',
            };

            const req = createMockRequest(user);
            const result = isAuthorized(req as Request, resourceId);

            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return false for unauthenticated requests', () => {
      const req = createMockRequest();
      const result = isAuthorized(req as Request, '76561198001234567');

      expect(result).toBe(false);
    });
  });

  describe('Security', () => {
    it('should log authorization failures', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user, { steamId: '76561198999999999' });
      const res = createMockResponse();
      const next = jest.fn();

      verifySteamId(req as Request, res as Response, next);

      expect(consoleSpy).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Authorization failed:',
        expect.objectContaining({
          authenticatedSteamId: '76561198001234567',
          requestedSteamId: '76561198999999999',
        })
      );

      consoleSpy.mockRestore();
    });

    it('should not expose sensitive information in error messages', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user, { steamId: '76561198999999999' });
      const res = createMockResponse();
      const next = jest.fn();

      verifySteamId(req as Request, res as Response, next);

      expect((res as any).jsonData).not.toHaveProperty('steamId');
      expect((res as any).jsonData).not.toHaveProperty('user');
      expect((res as any).jsonData).not.toHaveProperty('session');
    });
  });
});

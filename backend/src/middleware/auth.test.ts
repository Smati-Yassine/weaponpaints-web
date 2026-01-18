import { Request, Response } from 'express';
import { requireAuth, optionalAuth, hasValidSession, getAuthenticatedUser, getSteamId } from './auth';
import { UserProfile } from '../config/passport';

// Mock Request and Response
function createMockRequest(user?: UserProfile, session?: any): Partial<Request> {
  return {
    user,
    session: session || (user ? { passport: { user } } : undefined),
    isAuthenticated: () => !!user,
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

describe('Authentication Middleware', () => {
  describe('requireAuth', () => {
    it('should allow authenticated requests', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const req = createMockRequest(user);
      const res = createMockResponse();
      const next = jest.fn();

      requireAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated requests with 401', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      requireAuth(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Authentication required',
        })
      );
    });

    it('should reject requests with invalid session', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user, null); // No session
      const res = createMockResponse();
      const next = jest.fn();

      requireAuth(req as Request, res as Response, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should provide descriptive error messages', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      requireAuth(req as Request, res as Response, next);

      expect((res as any).jsonData).toHaveProperty('error');
      expect((res as any).jsonData).toHaveProperty('message');
      expect(typeof (res as any).jsonData.message).toBe('string');
    });
  });

  describe('optionalAuth', () => {
    it('should allow authenticated requests', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user);
      const res = createMockResponse();
      const next = jest.fn();

      optionalAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should allow unauthenticated requests', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      optionalAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('hasValidSession', () => {
    it('should return true for valid session', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user);
      const result = hasValidSession(req as Request);

      expect(result).toBe(true);
    });

    it('should return false for invalid session', () => {
      const req = createMockRequest();
      const result = hasValidSession(req as Request);

      expect(result).toBe(false);
    });

    it('should return false when user is missing', () => {
      const req = createMockRequest(undefined, { passport: {} });
      const result = hasValidSession(req as Request);

      expect(result).toBe(false);
    });

    it('should return false when session is missing', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user, null);
      const result = hasValidSession(req as Request);

      expect(result).toBe(false);
    });
  });

  describe('getAuthenticatedUser', () => {
    it('should return user for authenticated request', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      };

      const req = createMockRequest(user);
      const result = getAuthenticatedUser(req as Request);

      expect(result).toEqual(user);
    });

    it('should return null for unauthenticated request', () => {
      const req = createMockRequest();
      const result = getAuthenticatedUser(req as Request);

      expect(result).toBeNull();
    });

    it('should return null for invalid session', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user, null);
      const result = getAuthenticatedUser(req as Request);

      expect(result).toBeNull();
    });
  });

  describe('getSteamId', () => {
    it('should return Steam ID for authenticated user', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user);
      const result = getSteamId(req as Request);

      expect(result).toBe('76561198001234567');
    });

    it('should return null for unauthenticated request', () => {
      const req = createMockRequest();
      const result = getSteamId(req as Request);

      expect(result).toBeNull();
    });

    it('should return null when user has no Steam ID', () => {
      const user: any = {
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user);
      const result = getSteamId(req as Request);

      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing request object gracefully', () => {
      const req = {} as Request;
      const result = hasValidSession(req);

      expect(result).toBe(false);
    });

    it('should handle malformed session data', () => {
      const req = {
        isAuthenticated: () => false,
        session: { invalid: 'data' },
      } as any;

      const result = hasValidSession(req);
      expect(result).toBe(false);
    });

    it('should not expose sensitive data in error responses', () => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = jest.fn();

      requireAuth(req as Request, res as Response, next);

      expect((res as any).jsonData).not.toHaveProperty('session');
      expect((res as any).jsonData).not.toHaveProperty('user');
      expect((res as any).jsonData).not.toHaveProperty('steamId');
    });
  });

  describe('Integration', () => {
    it('should work with requireAuth and getSteamId together', () => {
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      const req = createMockRequest(user);
      const res = createMockResponse();
      const next = jest.fn();

      requireAuth(req as Request, res as Response, next);

      expect(next).toHaveBeenCalled();

      const steamId = getSteamId(req as Request);
      expect(steamId).toBe('76561198001234567');
    });

    it('should handle authentication flow correctly', () => {
      // Unauthenticated request
      let req = createMockRequest();
      expect(hasValidSession(req as Request)).toBe(false);
      expect(getAuthenticatedUser(req as Request)).toBeNull();
      expect(getSteamId(req as Request)).toBeNull();

      // Authenticated request
      const user: UserProfile = {
        steamId: '76561198001234567',
        displayName: 'Test User',
        avatarUrl: '',
      };

      req = createMockRequest(user);
      expect(hasValidSession(req as Request)).toBe(true);
      expect(getAuthenticatedUser(req as Request)).toEqual(user);
      expect(getSteamId(req as Request)).toBe('76561198001234567');
    });
  });
});

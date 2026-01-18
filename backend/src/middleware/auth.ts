import { Request, Response, NextFunction } from 'express';
import { UserProfile } from '../config/passport';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: UserProfile;
    }
  }
}

/**
 * Authentication middleware
 * Checks if user is authenticated via session
 * Returns 401 Unauthorized if not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
    return;
  }

  // Check if session is still valid
  if (!req.session || !req.user) {
    res.status(401).json({
      error: 'Invalid session',
      message: 'Your session has expired. Please log in again.',
    });
    return;
  }

  // User is authenticated, proceed to next middleware
  next();
}

/**
 * Optional authentication middleware
 * Allows both authenticated and unauthenticated requests
 * Useful for endpoints that have different behavior based on auth status
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  // Simply proceed, authentication is optional
  next();
}

/**
 * Check if request has valid session
 */
export function hasValidSession(req: Request): boolean {
  return req.isAuthenticated() && !!req.user && !!req.session;
}

/**
 * Get authenticated user from request
 * Returns null if not authenticated
 */
export function getAuthenticatedUser(req: Request): UserProfile | null {
  if (!hasValidSession(req)) {
    return null;
  }
  return req.user || null;
}

/**
 * Get Steam ID from authenticated request
 * Returns null if not authenticated
 */
export function getSteamId(req: Request): string | null {
  const user = getAuthenticatedUser(req);
  return user?.steamId || null;
}

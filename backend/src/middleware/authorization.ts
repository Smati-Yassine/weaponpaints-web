import { Request, Response, NextFunction } from 'express';
import { getSteamId } from './auth';

/**
 * Authorization middleware
 * Verifies that the authenticated user's Steam ID matches the requested resource's Steam ID
 * Returns 403 Forbidden if Steam IDs don't match
 * 
 * Usage: Apply after requireAuth middleware
 * The Steam ID to verify against can come from:
 * - req.params.steamId
 * - req.body.steamId
 * - req.query.steamId
 */
export function verifySteamId(req: Request, res: Response, next: NextFunction): void {
  // Get authenticated user's Steam ID
  const authenticatedSteamId = getSteamId(req);

  if (!authenticatedSteamId) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
    return;
  }

  // Get requested Steam ID from params, body, or query
  const requestedSteamId = req.params.steamId || req.body.steamId || req.query.steamId;

  // If no Steam ID in request, assume user is accessing their own data
  if (!requestedSteamId) {
    // Attach authenticated Steam ID to request for use in route handlers
    req.params.steamId = authenticatedSteamId;
    next();
    return;
  }

  // Verify Steam IDs match
  if (authenticatedSteamId !== requestedSteamId) {
    // Log security event
    console.warn('Authorization failed:', {
      authenticatedSteamId,
      requestedSteamId,
      path: req.path,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    });

    res.status(403).json({
      error: 'Access denied',
      message: 'You do not have permission to access this resource',
    });
    return;
  }

  // Authorization successful, proceed to next middleware
  next();
}

/**
 * Middleware to verify user owns the resource
 * Automatically injects authenticated user's Steam ID into request
 * Use this for endpoints that should only access the authenticated user's data
 */
export function requireOwnResource(req: Request, res: Response, next: NextFunction): void {
  const steamId = getSteamId(req);

  if (!steamId) {
    res.status(401).json({
      error: 'Authentication required',
      message: 'You must be logged in to access this resource',
    });
    return;
  }

  // Inject Steam ID into request for route handlers
  req.params.steamId = steamId;
  req.body.steamId = steamId;

  next();
}

/**
 * Check if user is authorized to access a resource
 * Returns true if authorized, false otherwise
 */
export function isAuthorized(req: Request, resourceSteamId: string): boolean {
  const authenticatedSteamId = getSteamId(req);

  if (!authenticatedSteamId) {
    return false;
  }

  return authenticatedSteamId === resourceSteamId;
}

/**
 * Log authorization failure for security monitoring
 */
export function logAuthorizationFailure(
  req: Request,
  authenticatedSteamId: string,
  requestedSteamId: string,
  reason: string
): void {
  console.warn('Authorization failure:', {
    reason,
    authenticatedSteamId,
    requestedSteamId,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    timestamp: new Date().toISOString(),
  });
}

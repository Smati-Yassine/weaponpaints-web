import { Request, Response, NextFunction } from 'express';
import { ValidationError } from '../utils/validation';

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  timestamp: string;
}

/**
 * Sanitize error message to prevent sensitive data exposure
 */
function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive patterns
  const sanitized = message
    .replace(/password[=:]\s*\S+/gi, 'password=***')
    .replace(/token[=:]\s*\S+/gi, 'token=***')
    .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=***')
    .replace(/secret[=:]\s*\S+/gi, 'secret=***')
    .replace(/\b\d{13,19}\b/g, '***') // Potential Steam IDs or tokens
    .replace(/Bearer\s+\S+/gi, 'Bearer ***');

  return sanitized;
}

/**
 * Global error handling middleware
 * Should be registered last in middleware chain
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log error details
  console.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    user: (req as any).user?.steamId || 'anonymous',
  });

  // Handle validation errors
  if (error instanceof ValidationError) {
    const response: ErrorResponse = {
      error: 'Validation error',
      message: sanitizeErrorMessage(error.message),
      timestamp: new Date().toISOString(),
    };
    res.status(400).json(response);
    return;
  }

  // Handle database errors
  if (error.name === 'SequelizeError' || error.name === 'QueryError') {
    const response: ErrorResponse = {
      error: 'Database error',
      message: 'A database error occurred. Please try again later.',
      timestamp: new Date().toISOString(),
    };
    res.status(500).json(response);
    return;
  }

  // Handle authentication errors
  if (error.message.includes('authentication') || error.message.includes('unauthorized')) {
    const response: ErrorResponse = {
      error: 'Authentication error',
      message: 'Authentication failed. Please log in again.',
      timestamp: new Date().toISOString(),
    };
    res.status(401).json(response);
    return;
  }

  // Handle authorization errors
  if (error.message.includes('authorization') || error.message.includes('forbidden')) {
    const response: ErrorResponse = {
      error: 'Authorization error',
      message: 'You do not have permission to access this resource.',
      timestamp: new Date().toISOString(),
    };
    res.status(403).json(response);
    return;
  }

  // Default error response
  const response: ErrorResponse = {
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again later.'
      : sanitizeErrorMessage(error.message),
    timestamp: new Date().toISOString(),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV !== 'production') {
    (response as any).stack = error.stack;
  }

  res.status(500).json(response);
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  const response: ErrorResponse = {
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  };

  res.status(404).json(response);
}

/**
 * Async route wrapper to catch errors
 * Use this to wrap async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

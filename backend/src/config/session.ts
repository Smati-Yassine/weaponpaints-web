import session from 'express-session';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Session configuration options
 */
export function getSessionConfig(): session.SessionOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  const sessionSecret = process.env.SESSION_SECRET;
  const sessionMaxAge = parseInt(process.env.SESSION_MAX_AGE || '86400000', 10);

  if (!sessionSecret) {
    console.warn('⚠ SESSION_SECRET not set, using default (not secure for production)');
  }

  return {
    secret: sessionSecret || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction, // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      maxAge: sessionMaxAge, // Session duration in milliseconds
      sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    },
    name: 'connect.sid', // Session cookie name
  };
}

/**
 * Check if session is valid and not expired
 */
export function isSessionValid(session: any): boolean {
  if (!session) {
    return false;
  }

  // Check if session has passport user
  if (!session.passport || !session.passport.user) {
    return false;
  }

  // Check if session has expired
  if (session.cookie && session.cookie.expires) {
    const expiryDate = new Date(session.cookie.expires);
    if (expiryDate < new Date()) {
      return false;
    }
  }

  return true;
}

/**
 * Get user from session
 */
export function getUserFromSession(session: any): any | null {
  if (!isSessionValid(session)) {
    return null;
  }

  return session.passport.user;
}

/**
 * Destroy session and clear cookie
 */
export function destroySession(req: any, res: any): Promise<void> {
  return new Promise((resolve, reject) => {
    req.logout((logoutErr: any) => {
      if (logoutErr) {
        return reject(logoutErr);
      }

      req.session.destroy((destroyErr: any) => {
        if (destroyErr) {
          return reject(destroyErr);
        }

        res.clearCookie('connect.sid');
        resolve();
      });
    });
  });
}

export default getSessionConfig;

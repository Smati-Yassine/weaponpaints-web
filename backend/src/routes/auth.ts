import { Router } from 'express';
import passport from '../config/passport';
import { destroySession } from '../config/session';

const router = Router();

/**
 * GET /api/auth/steam
 * Initiate Steam OpenID authentication
 */
router.get('/steam', passport.authenticate('steam', { failureRedirect: '/' }));

/**
 * GET /api/auth/steam/callback
 * Handle Steam authentication callback
 */
router.get(
  '/steam/callback',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(frontendUrl);
  }
);

/**
 * GET /api/auth/user
 * Get current authenticated user
 */
router.get('/user', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  res.json({ user: req.user });
});

/**
 * POST /api/auth/logout
 * Logout and destroy session
 */
router.post('/logout', async (req, res) => {
  try {
    await destroySession(req, res);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

export default router;

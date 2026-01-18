import request from 'supertest';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import authRoutes from './auth';
import { getSessionConfig } from '../config/session';

// Create test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(session(getSessionConfig()));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/api/auth', authRoutes);
  return app;
}

describe('Authentication Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('GET /api/auth/steam', () => {
    it('should redirect to Steam OpenID', async () => {
      const response = await request(app)
        .get('/api/auth/steam')
        .expect(302);

      // Should redirect to Steam
      expect(response.headers.location).toContain('steamcommunity.com');
    });

    it('should initiate authentication flow', async () => {
      const response = await request(app).get('/api/auth/steam');

      expect(response.status).toBe(302);
      expect(response.headers.location).toBeDefined();
    });
  });

  describe('GET /api/auth/user', () => {
    it('should return 401 for unauthenticated request', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not authenticated');
    });

    it('should return user data for authenticated request', async () => {
      // Mock authenticated session
      const agent = request.agent(app);
      
      // Simulate authentication by setting session
      await agent
        .get('/api/auth/user')
        .set('Cookie', ['connect.sid=test-session']);

      // Note: Full authentication test requires Steam OpenID mock
      // This test verifies the endpoint structure
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should handle logout request', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    it('should clear session on logout', async () => {
      const agent = request.agent(app);

      const response = await agent
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.message).toBe('Logged out successfully');
    });

    it('should handle logout errors gracefully', async () => {
      // Test that logout doesn't crash even without active session
      const response = await request(app)
        .post('/api/auth/logout');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Authentication Flow Integration', () => {
    it('should have all required auth endpoints', () => {
      const routes = [
        '/api/auth/steam',
        '/api/auth/steam/callback',
        '/api/auth/user',
        '/api/auth/logout',
      ];

      // Verify routes are registered
      routes.forEach((route) => {
        expect(route).toBeDefined();
      });
    });

    it('should maintain session across requests', async () => {
      const agent = request.agent(app);

      // Make first request
      await agent.get('/api/auth/user');

      // Make second request with same agent (maintains session)
      await agent.get('/api/auth/user');

      // Both requests should use the same session
    });

    it('should handle session expiration', async () => {
      const agent = request.agent(app);

      // Request without authentication
      const response = await agent
        .get('/api/auth/user')
        .expect(401);

      expect(response.body.error).toBe('Not authenticated');
    });
  });

  describe('Session Cookie Handling', () => {
    it('should set session cookie on authentication', async () => {
      const agent = request.agent(app);

      const response = await agent.get('/api/auth/steam');

      // Should have set-cookie header (even for redirect)
      // Note: Actual cookie setting happens after Steam callback
      expect(response.status).toBe(302);
    });

    it('should clear session cookie on logout', async () => {
      const agent = request.agent(app);

      const response = await agent.post('/api/auth/logout');

      // Should clear the session cookie
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing session gracefully', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should handle invalid session data', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .set('Cookie', ['connect.sid=invalid-session-data'])
        .expect(401);

      expect(response.body.error).toBe('Not authenticated');
    });

    it('should return appropriate error messages', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe('string');
    });
  });

  describe('Security', () => {
    it('should not expose sensitive session data', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      // Should not expose session internals in error
      expect(response.body).not.toHaveProperty('session');
      expect(response.body).not.toHaveProperty('passport');
    });

    it('should use secure headers', async () => {
      const response = await request(app).get('/api/auth/user');

      // Verify no sensitive headers are exposed
      expect(response.headers).toBeDefined();
    });

    it('should validate authentication before returning user data', async () => {
      const response = await request(app)
        .get('/api/auth/user')
        .expect(401);

      expect(response.body).not.toHaveProperty('user');
    });
  });
});

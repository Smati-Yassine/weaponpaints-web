import passport from 'passport';
import { Strategy as SteamStrategy } from 'passport-steam';
import dotenv from 'dotenv';

dotenv.config();

/**
 * User profile interface
 */
export interface UserProfile {
  steamId: string;
  displayName: string;
  avatarUrl: string;
}

/**
 * Configure Passport with Steam OpenID strategy
 */
export function configurePassport() {
  const steamApiKey = process.env.STEAM_API_KEY;
  const returnUrl = process.env.STEAM_RETURN_URL || 'http://localhost:5000/api/auth/steam/callback';
  const realm = process.env.STEAM_REALM || 'http://localhost:5000';

  if (!steamApiKey) {
    throw new Error('STEAM_API_KEY environment variable is required');
  }

  // Configure Steam strategy
  passport.use(
    new SteamStrategy(
      {
        returnURL: returnUrl,
        realm: realm,
        apiKey: steamApiKey,
      },
      (identifier: string, profile: any, done: (error: any, user?: any) => void) => {
        // Extract Steam ID from identifier
        // Identifier format: https://steamcommunity.com/openid/id/[STEAM_ID]
        const steamId = identifier.split('/').pop() || '';

        // Validate Steam ID format (should be 17 digits)
        if (!/^\d{17}$/.test(steamId)) {
          return done(new Error('Invalid Steam ID format'));
        }

        // Create user profile
        const user: UserProfile = {
          steamId: steamId,
          displayName: profile.displayName || 'Unknown',
          avatarUrl: profile.photos && profile.photos.length > 0 
            ? profile.photos[2].value // Large avatar
            : '',
        };

        return done(null, user);
      }
    )
  );

  // Serialize user to session
  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  console.log('✓ Passport configured with Steam OpenID strategy');
}

export default passport;

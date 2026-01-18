import { UserProfile } from '../config/passport';

declare global {
  namespace Express {
    interface User extends UserProfile {}
  }
}

export {};

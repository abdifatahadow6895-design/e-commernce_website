import type { IUser } from '../models/User.js';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {};

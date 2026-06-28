import { GENERATION_QUOTA_MONTHLY } from '../config/constants.js';

/** In-memory store when Supabase is not configured (local dev). */
export const devStore = {
  children: new Map(),
  films: new Map(),
  quota: { used: 0, limit: GENERATION_QUOTA_MONTHLY }
};

export function isDevStore() {
  return devStore;
}

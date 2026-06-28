import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { isPlaceholderEnvValue } from './env.js';

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  url && serviceKey && !isPlaceholderEnvValue(url) && !isPlaceholderEnvValue(serviceKey)
    ? createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;

export function isSupabaseConfigured() {
  return Boolean(supabaseAdmin);
}

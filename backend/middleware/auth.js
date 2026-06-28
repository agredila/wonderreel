import { isSupabaseConfigured, supabaseAdmin } from '../services/supabase.js';

export async function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  // Local dev only — no Supabase at all (in-memory store)
  if (!isSupabaseConfigured()) {
    req.user = { id: 'dev-account', email: 'dev@wonderreel.local' };
    req.accountId = 'dev-account';
    return next();
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing auth token. Please sign in again.' }
    });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired session. Please sign in again.' }
    });
  }

  req.user = data.user;
  req.accountId = data.user.id;
  next();
}

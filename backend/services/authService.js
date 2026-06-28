import { supabaseAdmin, isSupabaseConfigured } from './supabase.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_INVITE_CODE = (process.env.DEFAULT_INVITE_CODE || 'TRYWONDERREEL').toUpperCase();

function normalizeCode(code) {
  return String(code || '').trim().toUpperCase();
}

function validateSignupInput({ displayName, email, invitationCode, password }) {
  const name = String(displayName || '').trim();
  const mail = String(email || '').trim().toLowerCase();
  const code = normalizeCode(invitationCode);
  const pass = String(password || '');

  if (name.length < 2 || name.length > 80) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Name must be 2–80 characters.' };
  }
  if (!EMAIL_RE.test(mail)) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Enter a valid email address.' };
  }
  if (!code) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Invitation code is required.' };
  }
  if (pass.length < 8) {
    return { ok: false, code: 'VALIDATION_ERROR', message: 'Password must be at least 8 characters.' };
  }

  return { ok: true, displayName: name, email: mail, invitationCode: code, password: pass };
}

async function findValidInvitation(code) {
  const { data, error } = await supabaseAdmin
    .from('invitation_codes')
    .select('id, code, max_uses, use_count, expires_at')
    .eq('code', code)
    .maybeSingle();

  if (error) throw error;

  if (data) {
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }
    if (data.max_uses != null && data.use_count >= data.max_uses) {
      return null;
    }
    return data;
  }

  if (code === DEFAULT_INVITE_CODE) {
    return { id: null, code: DEFAULT_INVITE_CODE, max_uses: null, use_count: 0, expires_at: null, envFallback: true };
  }

  return null;
}

async function recordRedemption(invitation, accountId, email) {
  if (invitation.envFallback || !invitation.id) return;

  const { error: incError } = await supabaseAdmin
    .from('invitation_codes')
    .update({ use_count: invitation.use_count + 1 })
    .eq('id', invitation.id);

  if (incError) throw incError;

  const { error: redeemError } = await supabaseAdmin.from('invitation_redemptions').insert({
    invitation_code_id: invitation.id,
    account_id: accountId,
    email
  });

  if (redeemError) throw redeemError;
}

export async function signUpParent(body) {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: 'AUTH_UNAVAILABLE', message: 'Sign-up is not available in this environment.' };
  }

  const validated = validateSignupInput(body);
  if (!validated.ok) {
    return { ok: false, code: validated.code, message: validated.message };
  }

  const { displayName, email, invitationCode, password } = validated;

  const invitation = await findValidInvitation(invitationCode);
  if (!invitation) {
    return { ok: false, code: 'INVALID_INVITATION', message: 'Invalid or expired invitation code.' };
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { display_name: displayName }
  });

  if (createError) {
    console.error('Supabase createUser failed:', createError.message, createError.code);
    const msg = createError.message?.toLowerCase() || '';
    if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
      return { ok: false, code: 'EMAIL_TAKEN', message: 'An account with this email already exists.' };
    }
    if (msg.includes('password') || msg.includes('weak') || msg.includes('characters')) {
      return { ok: false, code: 'VALIDATION_ERROR', message: createError.message };
    }
    if (msg.includes('database error')) {
      return {
        ok: false,
        code: 'SIGNUP_FAILED',
        message: 'Account setup failed in the database. Run supabase/migrations/004_signup_trigger_fix.sql in the Supabase SQL editor, then try again.'
      };
    }
    return { ok: false, code: 'SIGNUP_FAILED', message: createError.message || 'Could not create account. Please try again.' };
  }

  const userId = created.user?.id;
  if (!userId) {
    return { ok: false, code: 'SIGNUP_FAILED', message: 'Could not create account. Please try again.' };
  }

  const { error: accountError } = await supabaseAdmin.from('parent_accounts').upsert(
    {
      id: userId,
      email,
      display_name: displayName,
      last_login_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  if (accountError) {
    console.error('parent_accounts upsert failed:', accountError.message);
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return {
      ok: false,
      code: 'SIGNUP_FAILED',
      message: 'Account was created but profile setup failed. Please contact support or try again.'
    };
  }

  try {
    await recordRedemption(invitation, userId, email);
  } catch (err) {
    console.error('Invitation redemption record failed:', err.message);
  }

  try {
    await supabaseAdmin.from('audit_logs').insert({
      account_id: userId,
      actor: 'parent',
      action: 'auth.signup',
      entity_type: 'account',
      entity_id: userId,
      metadata: { invitation_code: invitationCode }
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }

  return { ok: true, userId, email };
}

import { GENERATION_QUOTA_MONTHLY, GENERATION_QUOTA_UNLIMITED } from '../config/constants.js';
import { isSupabaseConfigured, supabaseAdmin } from './supabase.js';
import { devStore } from './devStore.js';

const UNLIMITED_STATUS = { used: 0, limit: 999, remaining: 999, unlimited: true };

export async function checkAndIncrementQuota(accountId) {
  if (GENERATION_QUOTA_UNLIMITED) {
    return { allowed: true, remaining: UNLIMITED_STATUS.remaining, unlimited: true };
  }
  if (!isSupabaseConfigured()) {
    if (devStore.quota.used >= devStore.quota.limit) {
      return { allowed: false, remaining: 0, error: 'Monthly generation quota exceeded' };
    }
    devStore.quota.used += 1;
    return { allowed: true, remaining: devStore.quota.limit - devStore.quota.used };
  }
  const { data: account, error } = await supabaseAdmin
    .from('parent_accounts')
    .select('generation_quota_used, generation_quota_limit, quota_reset_at')
    .eq('id', accountId)
    .single();

  if (error || !account) {
    return { allowed: false, remaining: 0, error: 'Account not found' };
  }

  let used = account.generation_quota_used;
  let limit = account.generation_quota_limit ?? GENERATION_QUOTA_MONTHLY;
  const resetAt = new Date(account.quota_reset_at);

  if (resetAt <= new Date()) {
    used = 0;
    const nextReset = new Date();
    nextReset.setMonth(nextReset.getMonth() + 1, 1);
    await supabaseAdmin.from('parent_accounts').update({
      generation_quota_used: 0,
      quota_reset_at: nextReset.toISOString()
    }).eq('id', accountId);
  }

  if (used >= limit) {
    return { allowed: false, remaining: 0, error: 'Monthly generation quota exceeded' };
  }

  await supabaseAdmin.from('parent_accounts').update({
    generation_quota_used: used + 1
  }).eq('id', accountId);

  return { allowed: true, remaining: limit - used - 1 };
}

export async function getQuotaStatus(accountId) {
  if (GENERATION_QUOTA_UNLIMITED) {
    return UNLIMITED_STATUS;
  }
  if (!isSupabaseConfigured()) {
    return { used: devStore.quota.used, limit: devStore.quota.limit, remaining: devStore.quota.limit - devStore.quota.used };
  }
  const { data } = await supabaseAdmin
    .from('parent_accounts')
    .select('generation_quota_used, generation_quota_limit')
    .eq('id', accountId)
    .single();
  const used = data?.generation_quota_used ?? 0;
  const limit = data?.generation_quota_limit ?? GENERATION_QUOTA_MONTHLY;
  return { used, limit, remaining: Math.max(0, limit - used) };
}

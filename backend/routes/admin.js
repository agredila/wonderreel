import { Router } from 'express';
import { requireAdmin } from '../middleware/admin.js';
import { isSupabaseConfigured, supabaseAdmin } from '../services/supabase.js';
import { devStore } from '../services/devStore.js';

const router = Router();

router.use(requireAdmin);

router.get('/films', async (_req, res) => {
  if (!isSupabaseConfigured()) {
    const data = Array.from(devStore.films.values()).map((film) => ({
      ...film,
      creator: { email: 'dev@wonderreel.local', displayName: 'Dev account' }
    }));
    return res.json({ success: true, data });
  }

  const { data: films, error } = await supabaseAdmin
    .from('films')
    .select('id, account_id, child_id, story_id, title, status, video_url, duration_sec, is_starter, created_at, updated_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
  }

  const accountIds = [...new Set((films || []).map((f) => f.account_id))];
  let accounts = [];
  if (accountIds.length > 0) {
    const { data, error: accountError } = await supabaseAdmin
      .from('parent_accounts')
      .select('id, email, display_name')
      .in('id', accountIds);
    if (accountError) {
      return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: accountError.message } });
    }
    accounts = data || [];
  }

  const byAccountId = Object.fromEntries(accounts.map((a) => [a.id, a]));
  const data = (films || []).map((film) => {
    const parent = byAccountId[film.account_id];
    return {
      ...film,
      creator: parent
        ? { email: parent.email, displayName: parent.display_name || '' }
        : null
    };
  });

  res.json({ success: true, data });
});

router.get('/overview', async (_req, res) => {
  if (!isSupabaseConfigured()) {
    return res.json({
      success: true,
      data: {
        parentAccounts: 1,
        films: devStore.films.size,
        generationJobs: devStore.quota.used,
        recentFilms: Array.from(devStore.films.values()).slice(0, 10)
      }
    });
  }

  const [parents, films, jobs] = await Promise.all([
    supabaseAdmin.from('parent_accounts').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('films').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('generation_jobs').select('*', { count: 'exact', head: true })
  ]);

  res.json({
    success: true,
    data: {
      parentAccounts: parents.count || 0,
      films: films.count || 0,
      generationJobs: jobs.count || 0
    }
  });
});

export default router;

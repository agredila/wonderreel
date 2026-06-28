import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth } from './middleware/auth.js';
import authRouter from './routes/auth.js';
import adminRouter from './routes/admin.js';
import { rateLimit } from './middleware/rateLimit.js';
import { sanitizeStoryInput } from './middleware/sanitize.js';
import { getTaskStatus, isPixverseConfigured } from './services/pixverse.js';
import {
  approveFilm,
  discardFilm,
  getMemoryTasks,
  listDevFilms,
  runCreationPipeline,
  seedStarterFilms
} from './services/pipeline.js';
import { devStore } from './services/devStore.js';
import { getQuotaStatus } from './services/quota.js';
import { isSupabaseConfigured, supabaseAdmin } from './services/supabase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ASSETS_DIR = path.join(__dirname, '..', 'assets');

app.use(cors());
app.use(express.json());
app.use('/assets', express.static(ASSETS_DIR));

const memoryTasks = getMemoryTasks();

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      supabase: isSupabaseConfigured(),
      gemini: Boolean(process.env.GEMINI_API_KEY),
      pixverse: isPixverseConfigured()
    }
  });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api', requireAuth, rateLimit);

app.post('/api/stories/create', async (req, res) => {
  try {
    const { childId, rawText, language = 'en', structure = 'single' } = req.body;
    const sanitized = sanitizeStoryInput(rawText);
    if (!sanitized.ok) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: sanitized.error } });
    }
    if (!childId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'childId required' } });
    }
    const { checkAndIncrementQuota } = await import('./services/quota.js');
    const quota = await checkAndIncrementQuota(req.accountId);
    if (!quota.allowed) {
      return res.status(429).json({ success: false, error: { code: 'QUOTA_EXCEEDED', message: quota.error } });
    }
    const result = await runCreationPipeline({
      accountId: req.accountId,
      childId,
      rawText: sanitized.text,
      language,
      structure
    });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({ ...result, quotaRemaining: quota.remaining });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } });
  }
});

app.get('/api/generate/:taskId', (req, res) => {
  const task = getTaskStatus(req.params.taskId, memoryTasks);
  if (!task || task.accountId !== req.accountId) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } });
  }
  res.json({
    success: true,
    data: {
      taskId: task.id,
      filmId: task.filmId,
      status: task.status,
      progress: task.progress,
      videoUrl: task.videoUrl,
      error: task.error,
      prompt: task.prompt,
      themeCategory: task.themeCategory,
      suggestedBgColor: task.suggestedBgColor,
      createdAt: task.createdAt
    }
  });
});

app.get('/api/films', async (req, res) => {
  const { childId, status } = req.query;
  if (!isSupabaseConfigured()) {
    const data = listDevFilms(req.accountId, childId, status);
    return res.json({ success: true, data });
  }
  let query = supabaseAdmin.from('films').select('*').eq('account_id', req.accountId).order('created_at', { ascending: false });
  if (childId) query = query.eq('child_id', childId);
  if (status) query = query.eq('status', status);
  const { data, error } = await query;
  if (error) return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
  res.json({ success: true, data });
});

app.post('/api/films/:filmId/approve', async (req, res) => {
  const result = await approveFilm(req.accountId, req.params.filmId);
  if (!result.success) return res.status(400).json(result);
  res.json(result);
});

app.post('/api/films/:filmId/discard', async (req, res) => {
  const result = await discardFilm(req.accountId, req.params.filmId);
  res.json(result);
});

app.patch('/api/films/:filmId', async (req, res) => {
  const { title, status } = req.body;
  if (!isSupabaseConfigured()) {
    const film = devStore.films.get(req.params.filmId);
    if (!film || film.account_id !== req.accountId) return res.status(404).json({ success: false });
    if (title) film.title = title;
    if (status === 'hidden') film.status = 'hidden';
    devStore.films.set(req.params.filmId, film);
    return res.json({ success: true, data: film });
  }
  const updates = { updated_at: new Date().toISOString() };
  if (title) updates.title = title;
  if (status === 'hidden') updates.status = 'hidden';
  const { data, error } = await supabaseAdmin.from('films').update(updates).eq('id', req.params.filmId).eq('account_id', req.accountId).select().single();
  if (error) return res.status(400).json({ success: false, error: { code: 'UPDATE_FAILED', message: error.message } });
  res.json({ success: true, data });
});

app.delete('/api/films/:filmId', async (req, res) => {
  if (!isSupabaseConfigured()) {
    devStore.films.delete(req.params.filmId);
    return res.json({ success: true });
  }
  await supabaseAdmin.from('films').delete().eq('id', req.params.filmId).eq('account_id', req.accountId);
  await supabaseAdmin.from('audit_logs').insert({
    account_id: req.accountId,
    actor: 'parent',
    action: 'delete',
    entity_type: 'film',
    entity_id: req.params.filmId
  });
  res.json({ success: true });
});

app.get('/api/children', async (req, res) => {
  if (!isSupabaseConfigured()) {
    const data = Array.from(devStore.children.values()).filter((c) => c.account_id === req.accountId);
    return res.json({ success: true, data });
  }
  const { data, error } = await supabaseAdmin.from('child_profiles').select('*').eq('account_id', req.accountId);
  if (error) return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
  res.json({ success: true, data });
});

app.post('/api/children', async (req, res) => {
  const { displayName, avatarEmoji, ageBand, allowedLanguages } = req.body;
  if (!displayName?.trim()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'displayName required' } });
  }
  if (!isSupabaseConfigured()) {
    const id = `child_${Date.now()}`;
    const child = {
      id,
      account_id: req.accountId,
      display_name: displayName.trim(),
      avatar_emoji: avatarEmoji || '🧒',
      age_band: ageBand || '3-5',
      allowed_languages: allowedLanguages || ['en']
    };
    devStore.children.set(id, child);
    await seedStarterFilms(req.accountId, id);
    return res.json({ success: true, data: child });
  }
  const { data, error } = await supabaseAdmin.from('child_profiles').insert({
    account_id: req.accountId,
    display_name: displayName.trim(),
    avatar_emoji: avatarEmoji || '🧒',
    age_band: ageBand || '3-5',
    allowed_languages: allowedLanguages || ['en']
  }).select().single();
  if (error) return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
  await seedStarterFilms(req.accountId, data.id);
  res.json({ success: true, data });
});

app.patch('/api/children/:id', async (req, res) => {
  const { id } = req.params;
  const { displayName, avatarEmoji, ageBand } = req.body;
  if (!isSupabaseConfigured()) {
    const child = devStore.children.get(id);
    if (!child || child.account_id !== req.accountId) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Child not found' } });
    }
    if (displayName?.trim()) child.display_name = displayName.trim();
    if (avatarEmoji) child.avatar_emoji = avatarEmoji;
    if (ageBand) child.age_band = ageBand;
    devStore.children.set(id, child);
    return res.json({ success: true, data: child });
  }
  const updates = {};
  if (displayName?.trim()) updates.display_name = displayName.trim();
  if (avatarEmoji) updates.avatar_emoji = avatarEmoji;
  if (ageBand) updates.age_band = ageBand;
  const { data, error } = await supabaseAdmin.from('child_profiles').update(updates).eq('id', id).eq('account_id', req.accountId).select().single();
  if (error) return res.status(500).json({ success: false, error: { code: 'DB_ERROR', message: error.message } });
  res.json({ success: true, data });
});

app.get('/api/quota', async (req, res) => {
  const status = await getQuotaStatus(req.accountId);
  res.json({ success: true, data: status });
});

app.get('/api/admin/costs', async (req, res) => {
  if (!isSupabaseConfigured()) {
    const totalGenerations = devStore.quota.used;
    const costPerGen = 0.15;
    return res.json({ success: true, data: { totalGenerations, estimatedCostUsd: (totalGenerations * costPerGen).toFixed(2) } });
  }
  const { count } = await supabaseAdmin.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('account_id', req.accountId);
  const costPerGen = 0.15;
  res.json({ success: true, data: { totalGenerations: count || 0, estimatedCostUsd: ((count || 0) * costPerGen).toFixed(2) } });
});

app.post('/api/progress', async (req, res) => {
  if (!isSupabaseConfigured()) return res.json({ success: true });
  const { childId, filmId, event } = req.body;
  await supabaseAdmin.from('progress_events').insert({
    child_id: childId,
    account_id: req.accountId,
    film_id: filmId,
    event
  });
  res.json({ success: true });
});

app.use((err, _req, res, _next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
});

app.listen(PORT, () => {
  console.log(`WonderReel Backend v2.0 on http://localhost:${PORT}`);
});

'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ParentalGate, useGateUnlocked } from '@/components/ParentalGate';
import { ProtectedVideo } from '@/components/ProtectedVideo';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useNotification } from '@/components/NotificationProvider';
import { useAuthToken, useActiveChild, signOut } from '@/lib/auth';
import {
  approveFilm,
  createStory,
  deleteFilm,
  discardFilm,
  fetchCosts,
  fetchFilms,
  fetchQuota,
  getGenerationStatus,
  updateFilm,
  type Film,
  type QuotaStatus
} from '@/lib/api';

export function StudioPageClient() {
  const t = useTranslations('studio');
  const tNotify = useTranslations('notification');
  const { notifyError, notifySuccess } = useNotification();
  const locale = useLocale();
  const router = useRouter();
  const { token } = useAuthToken();
  const { childId } = useActiveChild();
  const { unlocked, unlock, lock } = useGateUnlocked();

  const [story, setStory] = React.useState('');
  const [structure, setStructure] = React.useState<'single' | 'three_part'>('single');
  const [generating, setGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [films, setFilms] = React.useState<Film[]>([]);
  const [quota, setQuota] = React.useState<QuotaStatus | null>(null);
  const [costs, setCosts] = React.useState<{ totalGenerations: number; estimatedCostUsd: string } | null>(null);
  const [tab, setTab] = React.useState<'create' | 'library' | 'costs'>('create');
  const [previewFilm, setPreviewFilm] = React.useState<Film | null>(null);
  const [renameId, setRenameId] = React.useState<string | null>(null);
  const [renameTitle, setRenameTitle] = React.useState('');

  const loadData = React.useCallback(async () => {
    if (!childId) return;
    const [f, q, c] = await Promise.all([
      fetchFilms(token, childId),
      fetchQuota(token),
      fetchCosts(token)
    ]);
    setFilms(f.data || []);
    setQuota(q.data || null);
    setCosts(c.data || null);
  }, [token, childId]);

  React.useEffect(() => {
    if (!childId) {
      router.replace(`/${locale}/onboarding`);
      return;
    }
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [childId, locale, router, loadData]);

  function showError(message: string) {
    const isQuota = /quota/i.test(message);
    notifyError(
      isQuota ? tNotify('quotaExceededTitle') : tNotify('genFailedTitle'),
      isQuota ? tNotify('quotaExceededHint') : message || tNotify('genFailedHint')
    );
  }

  async function handleGenerate() {
    if (!childId || !story.trim()) return;
    setGenerating(true);
    setProgress(0);
    const res = await createStory(token, { childId, rawText: story.trim(), language: locale, structure });
    if (!res.success || !res.data?.taskId) {
      showError(res.error?.message || tNotify('genFailedHint'));
      setGenerating(false);
      return;
    }
    const taskId = res.data.taskId;
    let done = false;
    while (!done) {
      const status = await getGenerationStatus(token, taskId);
      if (status.data) {
        setProgress(status.data.progress);
        if (status.data.status === 'completed') {
          done = true;
          await loadData();
          const pending = (await fetchFilms(token, childId, 'needs_review')).data?.[0];
          if (pending) setPreviewFilm(pending);
          notifySuccess(tNotify('filmReadyTitle'), tNotify('filmReadyHint'));
        } else if (status.data.status === 'failed') {
          showError(status.data.error || tNotify('genFailedHint'));
          done = true;
        }
      }
      if (!done) await new Promise((r) => setTimeout(r, 2000));
    }
    setGenerating(false);
    setStory('');
  }

  if (!unlocked) {
    return <ParentalGate onUnlock={unlock} />;
  }

  const pending = films.filter((f) => f.status === 'needs_review');
  const approved = films.filter((f) => f.status === 'approved');

  return (
    <div className="min-h-screen p-6">
      <header className="mx-auto mb-8 flex max-w-4xl flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <LanguageSwitcher />
          <Link href={`/${locale}/kid`} className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold" onClick={lock}>
            {t('kidMode')}
          </Link>
          <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={() => signOut().then(() => router.push(`/${locale}/login`))}>
            {t('logout')}
          </button>
        </div>
      </header>

      {quota && (
        <p className="mx-auto mb-4 max-w-4xl text-sm text-black/60">
          {t('quota', { remaining: quota.remaining, limit: quota.limit })}
        </p>
      )}

      <div className="mx-auto mb-6 flex max-w-4xl gap-2">
        {(['create', 'library', 'costs'] as const).map((k) => (
          <button key={k} type="button" className={`rounded-full px-4 py-2 text-sm font-semibold ${tab === k ? 'bg-black text-white' : 'bg-black/5'}`} onClick={() => setTab(k)}>
            {k === 'create' ? t('generate') : k === 'library' ? t('library') : 'Costs'}
          </button>
        ))}
      </div>

      {tab === 'create' && (
        <section className="mx-auto max-w-4xl rounded-2xl border p-6">
          <p className="mb-4 text-sm text-amber-700">{t('disclaimer')}</p>
          <label className="text-sm font-semibold">{t('storyLabel')}</label>
          <textarea
            className="mt-2 min-h-[140px] w-full rounded-xl border px-4 py-3"
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder={t('storyPlaceholder')}
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          />
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={structure === 'single'} onChange={() => setStructure('single')} />
              {t('structureSingle')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={structure === 'three_part'} onChange={() => setStructure('three_part')} />
              {t('structureMulti')}
            </label>
          </div>
          <button type="button" disabled={generating} className="mt-4 rounded-full bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-50" onClick={handleGenerate}>
            {t('generate')}
          </button>
        </section>
      )}

      {tab === 'library' && (
        <section className="mx-auto max-w-4xl space-y-6">
          {pending.length > 0 && (
            <div>
              <h2 className="mb-3 font-semibold">{t('pending')}</h2>
              <div className="space-y-3">
                {pending.map((f) => (
                  <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                    <span>{f.title[locale] || f.title.en || 'Film'}</span>
                    <div className="flex gap-2">
                      <button type="button" className="rounded-full bg-black px-4 py-2 text-sm text-white" onClick={() => setPreviewFilm(f)}>{t('preview')}</button>
                      <button type="button" className="rounded-full border px-4 py-2 text-sm" onClick={async () => { await approveFilm(token, f.id); loadData(); }}>{t('approve')}</button>
                      <button type="button" className="rounded-full border px-4 py-2 text-sm text-red-600" onClick={async () => { await discardFilm(token, f.id); loadData(); }}>{t('discard')}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="mb-3 font-semibold">{t('approved')}</h2>
            <div className="space-y-3">
              {approved.map((f) => (
                <div key={f.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  {renameId === f.id ? (
                    <input className="rounded border px-2 py-1" value={renameTitle} onChange={(e) => setRenameTitle(e.target.value)} />
                  ) : (
                    <span>{f.title[locale] || f.title.en || 'Film'}</span>
                  )}
                  <div className="flex gap-2">
                    {renameId === f.id ? (
                      <button type="button" className="text-sm underline" onClick={async () => {
                        await updateFilm(token, f.id, { title: { ...f.title, [locale]: renameTitle } });
                        setRenameId(null);
                        loadData();
                      }}>Save</button>
                    ) : (
                      <button type="button" className="text-sm underline" onClick={() => { setRenameId(f.id); setRenameTitle(f.title[locale] || f.title.en || ''); }}>{t('rename')}</button>
                    )}
                    <button type="button" className="text-sm underline" onClick={async () => { await updateFilm(token, f.id, { status: 'hidden' }); loadData(); }}>{t('hide')}</button>
                    <button type="button" className="text-sm text-red-600 underline" onClick={async () => { await deleteFilm(token, f.id); loadData(); }}>{t('delete')}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'costs' && costs && (
        <section className="mx-auto max-w-4xl rounded-2xl border p-6">
          <p>Total generations: {costs.totalGenerations}</p>
          <p>Estimated cost: ${costs.estimatedCostUsd}</p>
        </section>
      )}

      {generating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="text-lg font-bold">{t('generating')}</div>
            <p className="mt-1 text-sm text-black/60">{t('generatingHint')}</p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/10">
              <div className="h-full bg-black transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      )}

      {previewFilm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold">{t('preview')}</h3>
            {previewFilm.video_url ? (
              <ProtectedVideo className="mt-4 aspect-video w-full rounded-xl bg-black" controls src={previewFilm.video_url.startsWith('http') ? previewFilm.video_url : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${previewFilm.video_url}`} />
            ) : (
              <p className="mt-4 text-black/60">No video URL yet</p>
            )}
            <div className="mt-4 flex gap-3">
              <button type="button" className="rounded-full bg-black px-5 py-2 text-sm text-white" onClick={async () => { await approveFilm(token, previewFilm.id); setPreviewFilm(null); loadData(); }}>{t('approve')}</button>
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={async () => { await discardFilm(token, previewFilm.id); setPreviewFilm(null); loadData(); }}>{t('discard')}</button>
              <button type="button" className="rounded-full border px-5 py-2 text-sm" onClick={() => setPreviewFilm(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

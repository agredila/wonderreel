'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { DotPattern } from '@/components/ui/dot-pattern';
import { getGenerationStatus, startGeneration, toAbsoluteAssetUrl } from '@/lib/api';
import { LANGS, t } from '@/lib/i18n';
import type { Lang, PromptCategory } from '@/lib/prompts';
import { cn } from '@/lib/utils';
import { loadStore, setLang, updateMeta, upsertVideo, type VideoItem } from '@/lib/storage';

const DEFAULT_DURATION_SECONDS = 30;
const DEFAULT_CATEGORY: PromptCategory = 'general';

export default function HomePage() {
  const [activeTab, setActiveTab] = React.useState<'create' | 'mylist'>('create');
  const [lang, setLangState] = React.useState<Lang>('en');

  const [prompt, setPrompt] = React.useState('');

  const [videos, setVideos] = React.useState<VideoItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const store = loadStore();
    const storedLang = (store.lang as Lang) || 'en';
    setLangState(storedLang);
    setVideos(loadStore().videos);
  }, []);

  React.useEffect(() => {
    const def = LANGS.find((l) => l.key === lang) || LANGS[0];
    document.documentElement.dir = def.dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const myList = React.useMemo(() => {
    const store = loadStore();
    return videos.filter((v) => store.metaById[v.id]?.saved ?? false);
  }, [videos]);

  async function handleGenerate() {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const start = await startGeneration({
        prompt: trimmed,
        duration: DEFAULT_DURATION_SECONDS,
        category: DEFAULT_CATEGORY
      });
      if (!start.success || !start.data?.taskId) {
        throw new Error(start.error?.message || 'Failed to start generation');
      }

      const taskId = start.data.taskId;
      let keepPolling = true;

      while (keepPolling) {
        const status = await getGenerationStatus(taskId);
        if (!status.success || !status.data) {
          throw new Error(status.error?.message || 'Failed to fetch status');
        }

        setProgress(status.data.progress);

        if (status.data.status === 'completed' && status.data.videoUrl) {
          const item: VideoItem = {
            id: taskId,
            title: `Video • ${DEFAULT_DURATION_SECONDS}s`,
            prompt: status.data.prompt,
            category: DEFAULT_CATEGORY,
            duration: DEFAULT_DURATION_SECONDS,
            videoUrl: toAbsoluteAssetUrl(status.data.videoUrl),
            createdAt: status.data.createdAt,
            source: 'generated'
          };

          upsertVideo(item);
          updateMeta(item.id, (prev) => ({ ...prev, saved: true }));
          setVideos(loadStore().videos);
          setActiveTab('mylist');
          keepPolling = false;
          continue;
        }

        if (status.data.status === 'failed') {
          throw new Error(status.data.error || 'Generation failed');
        }

        await new Promise((r) => setTimeout(r, 2000));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-white p-8 text-black dark:bg-background dark:text-foreground">
      <DotPattern className={cn('[mask-image:radial-gradient(300px_circle_at_center,white,transparent)]')} />

      <header className="mx-auto mb-10 max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl xl:text-5xl/none">{t(lang, 'headline')}</h1>
            <p className="mt-2 text-sm text-black/60 sm:text-base">{t(lang, 'subtitle')}</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center">
            <label className="text-sm font-semibold text-black/70">{t(lang, 'label_language')}</label>
            <select
              className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
              value={lang}
              onChange={(e) => {
                const next = e.target.value as Lang;
                setLangState(next);
                setLang(next);
              }}
            >
              {LANGS.map((l) => (
                <option key={l.key} value={l.key}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
          <button
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold',
              activeTab === 'create' ? 'bg-black text-white' : 'bg-black/[0.04] text-black'
            )}
            onClick={() => setActiveTab('create')}
          >
            {t(lang, 'tab_create')}
          </button>
          <button
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold',
              activeTab === 'mylist' ? 'bg-black text-white' : 'bg-black/[0.04] text-black'
            )}
            onClick={() => setActiveTab('mylist')}
          >
            {t(lang, 'tab_mylist')}
          </button>
        </div>
      </header>

      {activeTab === 'create' && (
        <section className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-black/10 bg-white p-5">
              <div className="mt-4">
                <div className="text-sm font-semibold">Prompt</div>
                <textarea
                  className="mt-2 min-h-[180px] w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black outline-none focus:ring-2 focus:ring-black/10"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the scene you want (16:9). Example: a cute turtle swimming past a coral reef, soft 3D style."
                />
              </div>

              {error && <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-black/60">Aspect ratio: 16:9</div>
                <button
                  className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/85 disabled:opacity-50"
                  disabled={loading}
                  onClick={handleGenerate}
                >
                  {t(lang, 'btn_generate')}
                </button>
              </div>
          </div>
        </section>
      )}

      {activeTab === 'mylist' && (
        <section className="mx-auto max-w-6xl">
          <h2 className="mb-6 text-2xl font-semibold">
            {t(lang, 'tab_mylist')}
          </h2>

          {myList.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/60">
              No generated videos yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {myList.map((v) => (
              <Link key={v.id} href={`/video/${encodeURIComponent(v.id)}`} className="group">
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <div className="relative">
                    <div className="aspect-video w-full bg-black">
                      <video className="h-full w-full object-cover" src={v.videoUrl} muted playsInline preload="metadata" />
                    </div>
                    <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white">
                      <Image width={14} height={14} src="https://www.lovart.ai/assets/play-s.svg" alt={t(lang, 'btn_view')} />
                      {t(lang, 'btn_view')}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold">{v.title}</div>
                    <div className="mt-1 text-xs text-black/60">
                      {v.category} • {v.duration}s • {v.source}
                    </div>
                  </div>
                </div>
              </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-md rounded-2xl bg-white p-6">
            <div className="text-lg font-bold">{t(lang, 'loading_title')}</div>
            <div className="mt-1 text-sm text-black/60">{t(lang, 'loading_hint')}</div>
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/[0.08]">
              <div className="h-full bg-black" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-2 text-xs text-black/60">Progress: {progress}%</div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import type { VideoItem } from '@/lib/storage';
import { ensureMeta, loadStore, updateMeta } from '@/lib/storage';
import { LANGS, t } from '@/lib/i18n';
import type { Lang } from '@/lib/prompts';

export default function VideoDetailPage() {
  const params = useParams<{ id: string }>();
  const videoId = params?.id;
  const [lang, setLangState] = React.useState<Lang>('en');
  const [video, setVideo] = React.useState<VideoItem | null>(null);
  const [meta, setMeta] = React.useState(() => (videoId ? ensureMeta(videoId) : ensureMeta('unknown')));
  const [commentText, setCommentText] = React.useState('');
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!videoId) return;
    const store = loadStore();
    const storedLang = store.lang as Lang;
    setLangState(storedLang || 'en');
    const found = store.videos.find((v) => v.id === videoId) || null;
    setVideo(found);
    setMeta(ensureMeta(videoId));
  }, [videoId]);

  React.useEffect(() => {
    const def = LANGS.find((l) => l.key === lang) || LANGS[0];
    document.documentElement.dir = def.dir;
    document.documentElement.lang = lang;
  }, [lang]);

  if (!hydrated || !videoId) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link className="text-sm font-semibold underline" href="/">
          Back
        </Link>
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">Loading…</div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Link className="text-sm font-semibold underline" href="/">
          Back
        </Link>
        <div className="mt-6 rounded-2xl border border-black/10 bg-white p-6">
          Video not found.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link className="text-sm font-semibold underline" href="/">
            Back
          </Link>
          <div className="text-sm text-black/60">
            {video.category} • {video.duration}s
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-black/70">{t(lang, 'label_language')}</label>
          <select
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-sm font-semibold"
            value={lang}
            onChange={(e) => setLangState(e.target.value as Lang)}
          >
            {LANGS.map((l) => (
              <option key={l.key} value={l.key}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight">{video.title}</h1>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black">
        <video className="aspect-video w-full" controls src={video.videoUrl} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/[0.04]"
          onClick={() => {
            const next = updateMeta(videoId, (prev) => ({ ...prev, saved: !prev.saved }));
            setMeta(next);
          }}
        >
          {meta.saved ? 'Saved' : 'Save to My List'}
        </button>
        <button
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/[0.04]"
          onClick={() => {
            const next = updateMeta(videoId, (prev) => ({ ...prev, likes: prev.likes + 1 }));
            setMeta(next);
          }}
        >
          Like ({meta.likes})
        </button>
        <button
          className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold hover:bg-black/[0.04]"
          onClick={() => {
            const next = updateMeta(videoId, (prev) => ({ ...prev, purchased: !prev.purchased }));
            setMeta(next);
          }}
        >
          {meta.purchased ? 'Purchased' : 'Purchase'}
        </button>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
        <div className="text-sm font-semibold">Prompt</div>
        <pre className="mt-2 whitespace-pre-wrap break-words rounded-xl bg-black/[0.04] p-3 text-xs text-black/80">
          {video.prompt}
        </pre>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-4">
        <div className="text-sm font-semibold">Comments</div>
        <div className="mt-3 flex flex-col gap-2">
          <textarea
            className="min-h-[84px] w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black outline-none focus:ring-2 focus:ring-black/10"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a comment…"
          />
          <button
            className="self-end rounded-full bg-black px-5 py-2 text-sm font-semibold text-white hover:bg-black/85"
            onClick={() => {
              const text = commentText.trim();
              if (!text) return;
              const next = updateMeta(videoId, (prev) => ({
                ...prev,
                comments: [
                  { id: `c_${Date.now()}`, text, createdAt: new Date().toISOString() },
                  ...prev.comments
                ]
              }));
              setMeta(next);
              setCommentText('');
            }}
          >
            Send
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {meta.comments.length === 0 ? (
            <div className="text-sm text-black/60">No comments yet.</div>
          ) : (
            meta.comments.map((c) => (
              <div key={c.id} className="rounded-xl bg-black/[0.04] p-3">
                <div className="text-xs text-black/50">{new Date(c.createdAt).toLocaleString()}</div>
                <div className="mt-1 text-sm">{c.text}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

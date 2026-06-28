'use client';

import * as React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { ParentalGate, useGateUnlocked } from '@/components/ParentalGate';
import { SignUpModal } from '@/components/SignUpModal';
import { useNotification } from '@/components/NotificationProvider';
import { createStory, getGenerationStatus } from '@/lib/api';
import { useParentAccess } from '@/lib/useParentAccess';
import { useActiveChild } from '@/lib/auth';
import { ensureViewerProfile } from '@/application/ensureViewer';
import { loadCreateIntent, saveCreateIntent } from '@/lib/pendingPrompt';

function CreatePageContent() {
  const t = useTranslations('home');
  const tStudio = useTranslations('studio');
  const tNotify = useTranslations('notification');
  const { notifyError, notifySuccess } = useNotification();
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const { token, childId, needsLogin } = useParentAccess();
  const { setChildId } = useActiveChild();
  const { unlocked, unlock } = useGateUnlocked();

  const saved = loadCreateIntent();
  const [story, setStory] = React.useState(params.get('prompt') || saved?.prompt || '');
  const [generating, setGenerating] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [showSignUp, setShowSignUp] = React.useState(false);
  const [activeChildId, setActiveChildId] = React.useState<string | null>(childId);

  function showError(message: string) {
    const isQuota = /quota/i.test(message);
    notifyError(
      isQuota ? tNotify('quotaExceededTitle') : tNotify('genFailedTitle'),
      isQuota ? tNotify('quotaExceededHint') : message || tNotify('genFailedHint')
    );
  }

  React.useEffect(() => {
    if (needsLogin) setShowSignUp(true);
  }, [needsLogin]);

  React.useEffect(() => {
    setActiveChildId(childId);
  }, [childId]);

  if (needsLogin) {
    const q = new URLSearchParams({ prompt: story.trim(), structure: 'single' });
    return (
      <>
        <section className="section active">
          <div className="container" style={{ padding: 48, textAlign: 'center' }}>
            <h1 className="page-title">{t('create_title')}</h1>
            <p className="page-subtitle">{t('signup_prompt')}</p>
            <button type="button" className="btn btn-primary" onClick={() => setShowSignUp(true)}>
              {t('sign_in_create')}
            </button>
          </div>
        </section>
        <SignUpModal
          open={showSignUp}
          onClose={() => router.push(`/${locale}/dashboard`)}
          postAuthPath={`/${locale}/create?${q.toString()}`}
        />
      </>
    );
  }

  if (!unlocked) {
    return (
      <section className="section active">
        <div className="container">
          <ParentalGate onUnlock={unlock} />
        </div>
      </section>
    );
  }

  async function handleGenerate() {
    if (!story.trim()) return;
    setGenerating(true);
    setProgress(0);

    const viewer = await ensureViewerProfile({ token, locale, existingChildId: activeChildId });
    if (!viewer.ok) {
      showError(viewer.error);
      setGenerating(false);
      return;
    }
    setActiveChildId(viewer.child.id);
    setChildId(viewer.child.id);

    const res = await createStory(token, {
      childId: viewer.child.id,
      rawText: story.trim(),
      language: locale,
      structure: 'single'
    });
    if (!res.success || !res.data?.taskId) {
      showError(res.error?.message || tNotify('genFailedHint'));
      setGenerating(false);
      return;
    }
    saveCreateIntent({ prompt: '', structure: 'single', category: 'general' });
    const taskId = res.data.taskId;
    let done = false;
    while (!done) {
      const status = await getGenerationStatus(token, taskId);
      if (status.data) {
        setProgress(status.data.progress);
        if (status.data.status === 'completed') {
          done = true;
          notifySuccess(tNotify('filmReadyTitle'), tNotify('filmReadyHint'), {
            confirmLabel: tNotify('viewReview'),
            onConfirm: () => router.push(`/${locale}/review`)
          });
        } else if (status.data.status === 'failed') {
          showError(status.data.error || tNotify('genFailedHint'));
          done = true;
        }
      }
      if (!done) await new Promise((r) => setTimeout(r, 2000));
    }
    setGenerating(false);
  }

  return (
    <section className="section active">
      <div className="container">
        <div className="section-header fade-in">
          <h1 className="page-title">{t('create_title')}</h1>
          <p className="page-subtitle">{t('create_subtitle')}</p>
        </div>
        <div className="generator-card fade-in delay-1">
          <p className="form-hint" style={{ marginBottom: 12 }}>{tStudio('disclaimer')}</p>
          <div className="form-group">
            <label className="form-label">{t('prompt_label')}</label>
            <textarea className="form-textarea" rows={4} value={story} onChange={(e) => setStory(e.target.value)} placeholder={t('prompt_placeholder')} />
            <p className="form-hint">{t('prompt_hint')}</p>
          </div>
          <button type="button" className="btn btn-primary btn-lg btn-block" disabled={generating} onClick={handleGenerate}>
            {t('generate_btn')}
          </button>
          <Link href={`/${locale}/review`} className="btn btn-secondary btn-block generator-card-review-link">
            {t('review_pending')}
          </Link>
        </div>
        {generating && (
          <div className="progress-card fade-in">
            <div className="progress-header">
              <h3>{t('gen_title')}</h3>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p className="progress-text">{t('gen_preparing')} {progress}%</p>
            <p className="progress-hint">{t('gen_eta')}</p>
          </div>
        )}
      </div>
    </section>
  );
}

export function CreatePageClient() {
  return <CreatePageContent />;
}

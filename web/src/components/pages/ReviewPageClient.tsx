'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ParentalGate, useGateUnlocked } from '@/components/ParentalGate';
import { ProtectedVideo } from '@/components/ProtectedVideo';
import { useNotification } from '@/components/NotificationProvider';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import {
  approveFilm,
  deleteFilm,
  discardFilm,
  fetchFilms,
  fetchQuota,
  updateFilm,
  type Film,
  type QuotaStatus
} from '@/lib/api';
import { enterKidMode } from '@/lib/kidMode';
import { ensureViewerProfile } from '@/application/ensureViewer';

export function ReviewPageClient() {
  const t = useTranslations('studio');
  const tHome = useTranslations('home');
  const tNotify = useTranslations('notification');
  const { notifySuccess } = useNotification();
  const locale = useLocale();
  const router = useRouter();
  const { token } = useAuthToken();
  const { childId, setChildId } = useActiveChild();
  const { unlocked, unlock, lock } = useGateUnlocked();

  const [films, setFilms] = React.useState<Film[]>([]);
  const [quota, setQuota] = React.useState<QuotaStatus | null>(null);
  const [activeChildId, setActiveChildId] = React.useState<string | null>(childId);
  const [tab, setTab] = React.useState<'pending' | 'approved'>('pending');
  const [previewFilm, setPreviewFilm] = React.useState<Film | null>(null);
  const [renameId, setRenameId] = React.useState<string | null>(null);
  const [renameTitle, setRenameTitle] = React.useState('');

  const loadData = React.useCallback(async () => {
    if (!activeChildId) return;
    const [f, q] = await Promise.all([fetchFilms(token, activeChildId), fetchQuota(token)]);
    setFilms(f.data || []);
    setQuota(q.data || null);
  }, [token, activeChildId]);

  React.useEffect(() => {
    if (!token) {
      router.replace(`/${locale}/dashboard`);
      return;
    }
    ensureViewerProfile({ token, locale, existingChildId: childId }).then((res) => {
      if (res.ok) {
        setActiveChildId(res.child.id);
        setChildId(res.child.id);
      }
    });
  }, [token, locale, childId, setChildId, router]);

  React.useEffect(() => {
    if (!activeChildId) return;
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [activeChildId, loadData]);

  if (!unlocked) {
    return (
      <section className="section active">
        <div className="container">
          <ParentalGate onUnlock={unlock} />
        </div>
      </section>
    );
  }

  const pending = films.filter((f) => f.status === 'needs_review');
  const approved = films.filter((f) => f.status === 'approved');

  async function handleApprove(f: Film) {
    await approveFilm(token, f.id);
    setPreviewFilm(null);
    await loadData();
    notifySuccess(tNotify('approvedTitle'), tNotify('approvedHint'), {
      actions: [
        {
          label: tNotify('handToChild'),
          onClick: handleHandToChild,
          variant: 'primary'
        },
        {
          label: tNotify('close'),
          variant: 'secondary'
        }
      ]
    });
  }

  function handleHandToChild() {
    enterKidMode();
    lock();
    router.push(`/${locale}/kid`);
  }

  return (
    <section className="section active">
      <div className="container">
        <div className="section-header fade-in">
          <h1 className="page-title">{tHome('nav_review')}</h1>
          <p className="page-subtitle">{tHome('review_subtitle')}</p>
          {quota && (
            <p className="form-hint">
              {quota.unlimited
                ? t('quota_unlimited')
                : t('quota', { remaining: quota.remaining, limit: quota.limit })}
            </p>
          )}
        </div>

        <div className="review-tabs fade-in delay-1">
          <button
            type="button"
            className={`review-tab${tab === 'pending' ? ' active' : ''}`}
            onClick={() => setTab('pending')}
          >
            {t('pending')}
            {pending.length > 0 && <span className="nav-badge">{pending.length}</span>}
          </button>
          <button
            type="button"
            className={`review-tab${tab === 'approved' ? ' active' : ''}`}
            onClick={() => setTab('approved')}
          >
            {t('approved')}
          </button>
        </div>

        {tab === 'pending' && (
          <div className="review-list fade-in delay-2">
            {pending.length === 0 ? (
              <div className="empty-state-card">
                <span className="empty-state-icon">✅</span>
                <p>{tHome('review_all_clear')}</p>
                <Link href={`/${locale}/create`} className="btn btn-primary">{tHome('nav_create')}</Link>
              </div>
            ) : (
              pending.map((f) => (
                <div key={f.id} className="review-item">
                  <span className="review-item-title">{f.title[locale] || f.title.en || 'Film'}</span>
                  <div className="review-item-actions">
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => setPreviewFilm(f)}>
                      {t('preview')}
                    </button>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={() => handleApprove(f)}>
                      {t('approve')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary review-discard"
                      onClick={async () => { await discardFilm(token, f.id); loadData(); }}
                    >
                      {t('discard')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'approved' && (
          <div className="review-list fade-in delay-2">
            {approved.length === 0 ? (
              <div className="empty-state-card">
                <p>{tHome('review_no_approved')}</p>
              </div>
            ) : (
              <>
                <div className="review-handoff-row">
                  <button type="button" className="btn btn-primary" onClick={handleHandToChild}>
                    {t('kidMode')}
                  </button>
                </div>
                {approved.map((f) => (
                  <div key={f.id} className="review-item">
                    {renameId === f.id ? (
                      <input className="form-input" value={renameTitle} onChange={(e) => setRenameTitle(e.target.value)} />
                    ) : (
                      <span className="review-item-title">{f.title[locale] || f.title.en || 'Film'}</span>
                    )}
                    <div className="review-item-actions">
                      {renameId === f.id ? (
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={async () => {
                            await updateFilm(token, f.id, { title: { ...f.title, [locale]: renameTitle } });
                            setRenameId(null);
                            loadData();
                          }}
                        >
                          Save
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-sm btn-secondary"
                          onClick={() => { setRenameId(f.id); setRenameTitle(f.title[locale] || f.title.en || ''); }}
                        >
                          {t('rename')}
                        </button>
                      )}
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        onClick={async () => { await updateFilm(token, f.id, { status: 'hidden' }); loadData(); }}
                      >
                        {t('hide')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary review-discard"
                        onClick={async () => { await deleteFilm(token, f.id); loadData(); }}
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {previewFilm && (
        <div className="modal active" role="dialog" aria-modal="true">
          <div className="modal-content review-preview-modal">
            <button type="button" className="modal-close" onClick={() => setPreviewFilm(null)} aria-label="Close">&times;</button>
            <h3 className="page-title">{t('preview')}</h3>
            <p className="form-hint">{t('disclaimer')}</p>
            {previewFilm.video_url ? (
              <ProtectedVideo
                className="review-preview-video"
                controls
                src={previewFilm.video_url.startsWith('http') ? previewFilm.video_url : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}${previewFilm.video_url}`}
              />
            ) : (
              <p className="form-hint">No video URL yet</p>
            )}
            <div className="review-preview-actions">
              <button type="button" className="btn btn-primary" onClick={() => handleApprove(previewFilm)}>
                {t('approve')}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={async () => { await discardFilm(token, previewFilm.id); setPreviewFilm(null); loadData(); }}
              >
                {t('discard')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { VideoModal } from '@/components/VideoModal';
import { FilmCatalogGrid, PublicSampleCatalog } from '@/components/FilmCatalogGrid';
import { SignUpModal } from '@/components/SignUpModal';
import { HeroVideoBackground } from '@/components/HeroVideoBackground';
import { CATALOG_LESSONS, filmToLesson, withPlayableVideo, type CatalogLesson } from '@/lib/catalog';
import { fetchFilms } from '@/lib/api';
import { useParentAccess } from '@/lib/useParentAccess';
import { usePendingReviewCount } from '@/lib/usePendingReviewCount';
import { useParentDisplayName } from '@/lib/auth';
import { saveCreateIntent } from '@/lib/pendingPrompt';

type FilmsTab = 'wonderreel' | 'yours';

export function DashboardPageClient() {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const { token, childId, ready, needsLogin } = useParentAccess();
  const { displayName } = useParentDisplayName();
  const { count: pendingCount } = usePendingReviewCount();
  const [userFilms, setUserFilms] = React.useState<CatalogLesson[]>([]);
  const [activeTab, setActiveTab] = React.useState<FilmsTab>('wonderreel');
  const [prompt, setPrompt] = React.useState('');
  const [modal, setModal] = React.useState<CatalogLesson | null>(null);
  const [showSignUp, setShowSignUp] = React.useState(false);

  React.useEffect(() => {
    if (!ready || !childId || needsLogin) {
      setUserFilms([]);
      return;
    }
    fetchFilms(token, childId, 'approved').then((res) => {
      setUserFilms(withPlayableVideo((res.data || []).map(filmToLesson)));
    });
  }, [ready, token, childId, needsLogin]);

  function buildCreatePath() {
    const q = new URLSearchParams({ prompt: prompt.trim(), structure: 'single' });
    return `/${locale}/create?${q.toString()}`;
  }

  function handleHeroCreate() {
    if (!prompt.trim()) return;
    saveCreateIntent({ prompt: prompt.trim(), structure: 'single', category: 'general' });
    if (needsLogin) {
      setShowSignUp(true);
      return;
    }
    router.push(buildCreatePath());
  }

  return (
    <section className="section active landing-page">
      {!needsLogin && pendingCount > 0 && (
        <Link href={`/${locale}/review`} className="pending-review-banner fade-in">
          <span>{t('pending_review_banner', { count: pendingCount })}</span>
          <span className="pending-review-cta">{t('nav_review')} →</span>
        </Link>
      )}

      <div className="hero hero-netflix landing-hero hero-netflix--video">
        <HeroVideoBackground />
        <div className="hero-netflix-inner">
          <div className="hero-netflix-copy fade-in">
            <div className="brand-badge">
              {!needsLogin && displayName ? t('welcome_user', { name: displayName }) : t('brand_badge')}
            </div>
            <h1 className="hero-netflix-title">{t('headline')}</h1>
            <p className="hero-netflix-subtitle">{t('subtitle')}</p>

            <div className="hero-prompt fade-in delay-1">
              <div className="prompt-box prompt-box-large landing-prompt-box">
                <textarea
                  className="prompt-textarea"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={t('hero_placeholder')}
                  rows={3}
                />
                <div className="prompt-actions">
                  <div className="prompt-actions-right">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleHeroCreate}
                    >
                      {t('hero_create')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container landing-films-section">
        <div className="landing-film-tabs" role="tablist" aria-label={t('films_tabs_label')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'wonderreel'}
            className={`landing-film-tab${activeTab === 'wonderreel' ? ' active' : ''}`}
            onClick={() => setActiveTab('wonderreel')}
          >
            {t('tab_wonderreel_films')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'yours'}
            className={`landing-film-tab${activeTab === 'yours' ? ' active' : ''}`}
            onClick={() => setActiveTab('yours')}
          >
            {t('tab_your_films')}
          </button>
        </div>

        {activeTab === 'wonderreel' ? (
          <PublicSampleCatalog
            locale={locale}
            onSelect={setModal}
            subtitle={t('catalog_subtitle')}
          />
        ) : (
          <FilmCatalogGrid
            lessons={userFilms}
            locale={locale}
            onSelect={setModal}
            variant="yours"
            channelLabel={displayName || t('catalog_your_channel')}
            subtitle={t('your_films_subtitle')}
            emptyTitle={needsLogin ? t('your_films_sign_in') : t('your_films_empty')}
            emptyDescription={needsLogin ? t('signup_prompt') : t('your_films_empty_hint')}
          />
        )}
      </div>

      <VideoModal lesson={modal} locale={locale} onClose={() => setModal(null)} />

      <SignUpModal
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        postAuthPath={buildCreatePath()}
      />
    </section>
  );
}

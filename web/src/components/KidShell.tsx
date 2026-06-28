'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ParentalGate } from '@/components/ParentalGate';
import { HandoffScreen } from '@/components/HandoffScreen';
import { ViewerSetupScreen } from '@/components/ViewerSetupScreen';
import { useChildProfile } from '@/lib/useChildProfile';
import { enterKidMode, exitKidMode, isKidModeActive } from '@/lib/kidMode';
import { useGateUnlocked } from '@/components/ParentalGate';
import { isDefaultViewerName } from '@/shared/viewerDefaults';
import { useAuthToken } from '@/lib/auth';

type Props = {
  children: React.ReactNode;
};

export function KidShell({ children }: Props) {
  const t = useTranslations('handoff');
  const locale = useLocale();
  const router = useRouter();
  const { token, loading: authLoading } = useAuthToken();
  const { profile, childName, loading } = useChildProfile();
  const { lock } = useGateUnlocked();
  const [active, setActive] = React.useState(false);
  const [showExitGate, setShowExitGate] = React.useState(false);
  const [showViewerSetup, setShowViewerSetup] = React.useState(false);
  const [displayName, setDisplayName] = React.useState<string | null>(null);

  React.useEffect(() => {
    setActive(isKidModeActive());
  }, []);

  React.useEffect(() => {
    if (!authLoading && !token) {
      router.replace(`/${locale}/dashboard`);
    }
  }, [authLoading, token, locale, router]);

  React.useEffect(() => {
    if (loading || active) return;
    if (childName && isDefaultViewerName(childName) && !displayName) {
      setShowViewerSetup(true);
    }
  }, [loading, childName, active, displayName]);

  function handleEnter() {
    enterKidMode();
    lock();
    setActive(true);
  }

  function handleExitUnlock() {
    exitKidMode();
    setShowExitGate(false);
    router.push(`/${locale}/dashboard`);
  }

  if (authLoading || loading) {
    return (
      <div className="kid-mode-page">
        <p className="kid-mode-loading">{t('loading')}</p>
      </div>
    );
  }

  if (showViewerSetup) {
    return (
      <ViewerSetupScreen
        onComplete={(name) => {
          setDisplayName(name);
          setShowViewerSetup(false);
        }}
        onCancel={() => router.push(`/${locale}/dashboard`)}
      />
    );
  }

  if (!active) {
    const name = displayName || childName || 'My child';
    return (
      <HandoffScreen
        childName={name}
        childAvatar={profile?.avatar_emoji}
        onConfirm={handleEnter}
        onCancel={() => router.push(`/${locale}/dashboard`)}
      />
    );
  }

  return (
    <div className="kid-mode-page">
      <button
        type="button"
        className="kid-exit-btn"
        aria-label={t('exit_parent')}
        onClick={() => setShowExitGate(true)}
      >
        🔒
      </button>
      {children}
      {showExitGate && (
        <div className="kid-exit-overlay">
          <div className="auth-card kid-exit-gate">
            <ParentalGate onUnlock={handleExitUnlock} />
          </div>
        </div>
      )}
    </div>
  );
}

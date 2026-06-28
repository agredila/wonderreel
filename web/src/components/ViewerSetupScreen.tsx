'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import { ensureViewerProfile } from '@/application/ensureViewer';
import { updateViewerProfile } from '@/application/updateViewer';
import { useNotification } from '@/components/NotificationProvider';
import { DEFAULT_VIEWER_NAME } from '@/shared/viewerDefaults';

const AVATARS = ['🧒', '👧', '👦', '🐻', '🦊', '🐰'];

type Props = {
  onComplete: (displayName: string) => void;
  onCancel?: () => void;
};

export function ViewerSetupScreen({ onComplete, onCancel }: Props) {
  const t = useTranslations('viewer');
  const tNotify = useTranslations('notification');
  const { notifyError } = useNotification();
  const locale = useLocale();
  const { token } = useAuthToken();
  const { childId, setChildId } = useActiveChild();
  const [nickname, setNickname] = React.useState('');
  const [avatar, setAvatar] = React.useState('🧒');
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!token) return;
    ensureViewerProfile({ token, locale, existingChildId: childId }).then((res) => {
      if (res.ok) {
        setChildId(res.child.id);
        setNickname(res.child.display_name === DEFAULT_VIEWER_NAME ? '' : res.child.display_name);
        setAvatar(res.child.avatar_emoji || '🧒');
      }
    });
  }, [token, locale, childId, setChildId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const label = nickname.trim() || DEFAULT_VIEWER_NAME;
    const ensured = await ensureViewerProfile({ token, locale, existingChildId: childId });
    if (!ensured.ok) {
      notifyError(tNotify('errorTitle'), ensured.error);
      setBusy(false);
      return;
    }
    setChildId(ensured.child.id);
    const updated = await updateViewerProfile({
      token,
      child: ensured.child,
      displayName: label,
      avatarEmoji: avatar
    });
    if (!updated.success) {
      notifyError(tNotify('errorTitle'), updated.error?.message || tNotify('genFailedHint'));
      setBusy(false);
      return;
    }
    onComplete(label);
    setBusy(false);
  }

  return (
    <div className="handoff-screen">
      <div className="handoff-card fade-in">
        <div className="handoff-avatar">{avatar}</div>
        <h1 className="handoff-title">{t('title')}</h1>
        <p className="handoff-subtitle">{t('subtitle')}</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('nickname')}</label>
            <input
              className="form-input"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('nickname_placeholder')}
            />
            <p className="form-hint">{t('privacy_hint')}</p>
          </div>
          <div className="form-group">
            <label className="form-label">{t('avatar')}</label>
            <div className="avatar-picker">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  className={`avatar-option${avatar === a ? ' active' : ''}`}
                  onClick={() => setAvatar(a)}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={busy}>
            {t('continue')}
          </button>
          {onCancel && (
            <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={onCancel}>
              {t('cancel')}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

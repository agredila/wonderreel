'use client';

import { useTranslations } from 'next-intl';

type Props = {
  childName: string;
  childAvatar?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function HandoffScreen({ childName, childAvatar = '🧒', onConfirm, onCancel }: Props) {
  const t = useTranslations('handoff');

  return (
    <div className="handoff-screen">
      <div className="handoff-card fade-in">
        <div className="handoff-avatar">{childAvatar}</div>
        <h1 className="handoff-title">{t('title', { name: childName })}</h1>
        <p className="handoff-subtitle">{t('subtitle')}</p>
        <ul className="handoff-rules">
          <li>{t('rule_watch')}</li>
          <li>{t('rule_approved')}</li>
          <li>{t('rule_exit')}</li>
        </ul>
        <button type="button" className="btn btn-primary btn-lg btn-block handoff-confirm" onClick={onConfirm}>
          {t('confirm', { name: childName })}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary btn-block" style={{ marginTop: 12 }} onClick={onCancel}>
            {t('cancel')}
          </button>
        )}
      </div>
    </div>
  );
}

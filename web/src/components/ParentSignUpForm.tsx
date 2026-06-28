'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { authSignUp } from '@/lib/api';
import { signInWithPassword } from '@/lib/auth';
import { useNotification } from '@/components/NotificationProvider';

import { setPostAuthPath } from '@/lib/pendingPrompt';

type Props = {
  onSuccess: () => void;
  submitLabel?: string;
};

export function ParentSignUpForm({ onSuccess, submitLabel }: Props) {
  const t = useTranslations('login');
  const tNotify = useTranslations('notification');
  const { notifyError } = useNotification();
  const [displayName, setDisplayName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [invitationCode, setInvitationCode] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      notifyError(tNotify('signUpFailedTitle'), t('passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      const res = await authSignUp({
        displayName: displayName.trim(),
        email: email.trim(),
        invitationCode: invitationCode.trim(),
        password
      });

      if (!res.success) {
        const code = res.error?.code;
        if (code === 'INVALID_INVITATION') notifyError(tNotify('signUpFailedTitle'), t('invalidInvitation'));
        else if (code === 'EMAIL_TAKEN') notifyError(tNotify('signUpFailedTitle'), t('emailTaken'));
        else notifyError(tNotify('signUpFailedTitle'), res.error?.message || t('signUpFailed'));
        return;
      }

      const { error: signInError } = await signInWithPassword(email.trim(), password);
      if (signInError) {
        notifyError(tNotify('loginFailedTitle'), signInError.message);
        return;
      }

      onSuccess();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label" htmlFor="signup-name">{t('displayName')}</label>
        <input
          id="signup-name"
          type="text"
          required
          minLength={2}
          maxLength={80}
          className="form-input"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="signup-email">{t('email')}</label>
        <input
          id="signup-email"
          type="email"
          required
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="signup-code">{t('invitationCode')}</label>
        <input
          id="signup-code"
          type="text"
          required
          className="form-input"
          value={invitationCode}
          onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
          placeholder={t('invitationCodePlaceholder')}
          autoComplete="off"
          spellCheck={false}
        />
        <p className="form-hint">{t('invitationCodeHint')}</p>
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="signup-password">{t('password')}</label>
        <input
          id="signup-password"
          type="password"
          required
          minLength={8}
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="signup-confirm">{t('confirmPassword')}</label>
        <input
          id="signup-confirm"
          type="password"
          required
          minLength={8}
          className="form-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
        {submitLabel || t('signUp')}
      </button>
    </form>
  );
}

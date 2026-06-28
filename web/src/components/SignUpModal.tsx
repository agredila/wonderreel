'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ParentSignUpForm } from '@/components/ParentSignUpForm';
import { useNotification } from '@/components/NotificationProvider';
import { signInWithPassword } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { consumePostAuthPath, setPostAuthPath } from '@/lib/pendingPrompt';

type Props = {
  open: boolean;
  onClose: () => void;
  postAuthPath?: string;
};

export function SignUpModal({ open, onClose, postAuthPath }: Props) {
  const tHome = useTranslations('home');
  const tLogin = useTranslations('login');
  const tNotify = useTranslations('notification');
  const { notifyError } = useNotification();
  const locale = useLocale();
  const [mode, setMode] = React.useState<'login' | 'signup'>('signup');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setMode('signup');
    setEmail('');
    setPassword('');
  }, [open]);

  if (!open) return null;

  function resumeAfterAuth() {
    const fallback = postAuthPath || `/${locale}/dashboard`;
    if (postAuthPath) setPostAuthPath(postAuthPath);
    window.location.href = consumePostAuthPath(fallback);
  }

  function handleDevContinue() {
    if (postAuthPath) setPostAuthPath(postAuthPath);
    window.location.href = postAuthPath || `/${locale}/auth/resume`;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: err } = await signInWithPassword(email.trim(), password);
      if (err) {
        notifyError(tNotify('loginFailedTitle'), err.message);
        return;
      }
      resumeAfterAuth();
    } finally {
      setLoading(false);
    }
  }

  function handleSignUpSuccess() {
    resumeAfterAuth();
  }

  return (
    <div className="signup-modal-overlay" role="presentation" onClick={onClose}>
      <div className="signup-modal auth-card" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="signup-modal-close" onClick={onClose} aria-label="Close">&times;</button>

        {!isSupabaseConfigured() ? (
          <>
            <h2 className="auth-card-title">{tHome('signup_modal_title')}</h2>
            <p className="auth-card-subtitle">{tHome('signup_modal_dev_hint')}</p>
            <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleDevContinue}>
              {tHome('signup_modal_dev')}
            </button>
          </>
        ) : mode === 'signup' ? (
          <>
            <h2 className="auth-card-title">{tHome('signup_modal_title')}</h2>
            <p className="auth-card-subtitle">{tHome('signup_modal_subtitle')}</p>
            <ParentSignUpForm onSuccess={handleSignUpSuccess} />
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ marginTop: 12 }}
              onClick={() => setMode('login')}
            >
              {tHome('signup_modal_sign_in')}
            </button>
          </>
        ) : (
          <>
            <h2 className="auth-card-title">{tLogin('title')}</h2>
            <p className="auth-card-subtitle">{tLogin('subtitle')}</p>
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-login-email">{tLogin('email')}</label>
                <input
                  id="modal-login-email"
                  type="email"
                  required
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="modal-login-password">{tLogin('password')}</label>
                <input
                  id="modal-login-password"
                  type="password"
                  required
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {tLogin('signIn')}
              </button>
            </form>
            <button
              type="button"
              className="btn btn-ghost btn-block"
              style={{ marginTop: 12 }}
              onClick={() => setMode('signup')}
            >
              {tLogin('switchToSignUp')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

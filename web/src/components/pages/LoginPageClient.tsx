'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { AuthBrandLayout } from '@/components/AuthBrandLayout';
import { ParentSignUpForm } from '@/components/ParentSignUpForm';
import { useNotification } from '@/components/NotificationProvider';
import { signInWithPassword } from '@/lib/auth';
import { consumePostAuthPath } from '@/lib/pendingPrompt';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export function LoginPageClient() {
  const t = useTranslations('login');
  const tNotify = useTranslations('notification');
  const { notifyError } = useNotification();
  const router = useRouter();
  const locale = useLocale();
  const [mode, setMode] = React.useState<'login' | 'signup'>('login');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (data.user) router.replace(`/${locale}/dashboard`);
      })
      .catch(() => undefined);
  }, [locale, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error: err } = await signInWithPassword(email.trim(), password);
      if (err) {
        notifyError(tNotify('loginFailedTitle'), err.message);
        return;
      }
      router.replace(consumePostAuthPath(`/${locale}/dashboard`));
    } finally {
      setLoading(false);
    }
  }

  function handleSignUpSuccess() {
    router.replace(consumePostAuthPath(`/${locale}/dashboard`));
  }

  function handleDevContinue() {
    router.replace(`/${locale}/dashboard`);
  }

  if (!isSupabaseConfigured()) {
    return (
      <AuthBrandLayout>
        <h1 className="auth-card-title">{t('devTitle')}</h1>
        <p className="auth-card-subtitle">{t('devSubtitle')}</p>
        <button type="button" className="btn btn-primary btn-block btn-lg" onClick={handleDevContinue}>
          {t('devContinue')}
        </button>
      </AuthBrandLayout>
    );
  }

  return (
    <AuthBrandLayout>
      <h1 className="auth-card-title">{mode === 'login' ? t('title') : t('signUpTitle')}</h1>
      <p className="auth-card-subtitle">{mode === 'login' ? t('subtitle') : t('signUpSubtitle')}</p>

      {mode === 'login' ? (
        <>
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">{t('email')}</label>
              <input
                id="login-email"
                type="email"
                required
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">{t('password')}</label>
              <input
                id="login-password"
                type="password"
                required
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {t('signIn')}
            </button>
          </form>
          <button
            type="button"
            className="btn btn-ghost btn-block"
            style={{ marginTop: 12 }}
            onClick={() => setMode('signup')}
          >
            {t('switchToSignUp')}
          </button>
        </>
      ) : (
        <>
          <ParentSignUpForm onSuccess={handleSignUpSuccess} />
          <button
            type="button"
            className="btn btn-ghost btn-block"
            style={{ marginTop: 12 }}
            onClick={() => setMode('login')}
          >
            {t('switchToSignIn')}
          </button>
        </>
      )}
    </AuthBrandLayout>
  );
}

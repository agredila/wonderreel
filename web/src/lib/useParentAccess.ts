'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import { fetchChildren } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export function useParentAccess() {
  const locale = useLocale();
  const router = useRouter();
  const { token, loading: authLoading } = useAuthToken();
  const { childId, setChildId } = useActiveChild();
  const [ready, setReady] = React.useState(false);

  const needsLogin = isSupabaseConfigured() ? !token : false;

  React.useEffect(() => {
    if (authLoading) return;
    if (needsLogin) {
      setReady(true);
      return;
    }
    fetchChildren(token).then((res) => {
      if (res.data?.length && !childId) {
        setChildId(res.data[0].id);
      }
      setReady(true);
    });
  }, [authLoading, token, needsLogin, childId, setChildId]);

  /** Returns false if login required — caller shows SignUpModal instead of redirecting. */
  function requireLogin(): boolean {
    if (needsLogin) return false;
    return true;
  }

  function goToLogin() {
    router.push(`/${locale}/login`);
  }

  return { token, childId, authLoading, ready, needsLogin, requireLogin, goToLogin };
}

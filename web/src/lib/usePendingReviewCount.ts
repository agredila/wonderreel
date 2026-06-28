'use client';

import * as React from 'react';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import { fetchFilms } from '@/lib/api';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export function usePendingReviewCount() {
  const { token, loading: authLoading } = useAuthToken();
  const { childId } = useActiveChild();
  const [count, setCount] = React.useState(0);

  const refresh = React.useCallback(async () => {
    if (!childId) {
      setCount(0);
      return;
    }
    const res = await fetchFilms(token, childId, 'needs_review');
    setCount(res.data?.length ?? 0);
  }, [token, childId]);

  React.useEffect(() => {
    if (authLoading) return;
    const authed = isSupabaseConfigured() ? Boolean(token) : true;
    if (!authed || !childId) {
      setCount(0);
      return;
    }
    refresh();
    const interval = setInterval(refresh, 15000);
    return () => clearInterval(interval);
  }, [authLoading, token, childId, refresh]);

  return { count, refresh };
}

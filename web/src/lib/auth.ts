'use client';

import * as React from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured, clearSupabaseLocalSession } from '@/lib/supabase/config';

const CHILD_KEY = 'wonderreel_active_child';

export function useAuthToken() {
  const [token, setToken] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      clearSupabaseLocalSession();
      setToken(null);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    supabase.auth
      .getSession()
      .then(({ data }) => {
        setToken(data.session?.access_token ?? null);
        setLoading(false);
      })
      .catch(() => {
        setToken(null);
        setLoading(false);
      });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setToken(session?.access_token ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { token, loading };
}

export function useParentDisplayName() {
  const { token, loading: authLoading } = useAuthToken();
  const [displayName, setDisplayName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isSupabaseConfigured()) {
      setDisplayName(null);
      return;
    }
    if (authLoading) return;

    if (!token) {
      setDisplayName(null);
      return;
    }

    const supabase = createClient();

    function readName(user: { user_metadata?: Record<string, unknown>; email?: string } | null) {
      if (!user) return null;
      const fromMeta = String(user.user_metadata?.display_name || '').trim();
      if (fromMeta) return fromMeta;
      const fromEmail = user.email?.split('@')[0]?.trim();
      return fromEmail || null;
    }

    supabase.auth
      .getUser()
      .then(({ data }) => {
        setDisplayName(readName(data.user));
      })
      .catch(() => {
        setDisplayName(null);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setDisplayName(readName(session?.user ?? null));
    });

    return () => sub.subscription.unsubscribe();
  }, [token, authLoading]);

  return { displayName, loading: authLoading };
}

export function useActiveChild() {
  const [childId, setChildIdState] = React.useState<string | null>(null);

  React.useEffect(() => {
    setChildIdState(localStorage.getItem(CHILD_KEY));
  }, []);

  const setChildId = (id: string) => {
    localStorage.setItem(CHILD_KEY, id);
    setChildIdState(id);
  };

  return { childId, setChildId };
}

export async function signInWithPassword(email: string, password: string) {
  if (!isSupabaseConfigured()) return { error: null, data: null };
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(CHILD_KEY);
  }
  if (!isSupabaseConfigured()) return;
  const supabase = createClient();
  await supabase.auth.signOut({ scope: 'local' });
}

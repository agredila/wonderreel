'use client';

import * as React from 'react';
import { useAuthToken, useActiveChild } from '@/lib/auth';
import { fetchChildren, type ChildProfile } from '@/lib/api';

export function useChildProfile() {
  const { token, loading: authLoading } = useAuthToken();
  const { childId } = useActiveChild();
  const [profile, setProfile] = React.useState<ChildProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (authLoading) return;
    if (!childId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchChildren(token).then((res) => {
      const match = res.data?.find((c) => c.id === childId) ?? null;
      setProfile(match);
      setLoading(false);
    });
  }, [authLoading, token, childId]);

  return { profile, loading, childName: profile?.display_name ?? null };
}

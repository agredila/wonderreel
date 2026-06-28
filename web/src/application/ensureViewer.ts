import { createChild, fetchChildren, type ChildProfile } from '@/lib/api';
import { DEFAULT_VIEWER_NAME } from '@/shared/viewerDefaults';

type EnsureViewerInput = {
  token: string | null;
  locale: string;
  existingChildId?: string | null;
};

type EnsureViewerResult =
  | { ok: true; child: ChildProfile }
  | { ok: false; error: string };

/** Ensures account has a viewer profile for film scoping. Creates a privacy-minimal default if none. */
export async function ensureViewerProfile(input: EnsureViewerInput): Promise<EnsureViewerResult> {
  const list = await fetchChildren(input.token);
  if (!list.success) {
    return { ok: false, error: list.error?.message || 'Could not load viewer profiles' };
  }

  const children = list.data || [];
  if (children.length > 0) {
    const match = input.existingChildId
      ? children.find((c) => c.id === input.existingChildId) ?? children[0]
      : children[0];
    return { ok: true, child: match };
  }

  const created = await createChild(input.token, {
    displayName: DEFAULT_VIEWER_NAME,
    avatarEmoji: '🧒',
    ageBand: '3-5',
    allowedLanguages: [input.locale]
  });

  if (!created.success || !created.data) {
    return { ok: false, error: created.error?.message || 'Could not create viewer profile' };
  }

  return { ok: true, child: created.data };
}

export type ApiError = { message: string; code?: string };

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: ApiError;
};

export type Film = {
  id: string;
  account_id: string;
  child_id: string;
  story_id?: string;
  title: Record<string, string>;
  duration_sec: number;
  thumbnail_url?: string;
  video_url?: string;
  status: 'generating' | 'needs_review' | 'approved' | 'hidden' | 'discarded';
  is_starter: boolean;
  approved_by_parent_at?: string;
  created_at: string;
};

export type ChildProfile = {
  id: string;
  account_id: string;
  display_name: string;
  avatar_emoji: string;
  age_band: string;
  allowed_languages: string[];
};

export type QuotaStatus = {
  used: number;
  limit: number;
  remaining: number;
  unlimited?: boolean;
};

export function getApiBaseUrl() {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  // Browser: same-origin — Next.js rewrites proxy /api → backend
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.BACKEND_URL || 'http://localhost:3001';
}

/** Paths served same-origin (public/ or /assets rewrite) — must match on SSR and client. */
function isSameOriginAsset(path: string) {
  return path.startsWith('/videos/') || path.startsWith('/images/') || path.startsWith('/assets/');
}

export function toAbsoluteAssetUrl(maybeRelativeUrl: string) {
  if (!maybeRelativeUrl) return '';
  if (/^https?:\/\//i.test(maybeRelativeUrl)) return maybeRelativeUrl;
  const path = maybeRelativeUrl.startsWith('/') ? maybeRelativeUrl : `/${maybeRelativeUrl}`;
  if (isSameOriginAsset(path)) return path;
  const base = getApiBaseUrl().replace(/\/+$/, '');
  return base ? `${base}${path}` : path;
}

async function apiFetch<T>(path: string, token: string | null, init?: RequestInit): Promise<T> {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers
      }
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      let message = body?.error?.message || res.statusText;
      if (res.status >= 500 && (!body?.error || message === 'Internal Server Error')) {
        message = 'Backend not running on port 3001';
      }
      return { success: false, error: { message }, data: undefined } as T;
    }
    return res.json() as Promise<T>;
  } catch {
    return { success: false, error: { message: 'Backend not running on port 3001' }, data: undefined } as T;
  }
}

export type SignUpPayload = {
  displayName: string;
  email: string;
  invitationCode: string;
  password: string;
};

export async function authSignUp(payload: SignUpPayload): Promise<ApiResponse<{ userId: string; email: string }>> {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  try {
    const res = await fetch(`${base}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await res.json();
    if (!res.ok && body?.error) {
      return { success: false, error: body.error };
    }
    return body;
  } catch {
    return { success: false, error: { message: 'Backend not running on port 3001', code: 'NETWORK_ERROR' } };
  }
}

export async function createStory(
  token: string | null,
  payload: { childId: string; rawText: string; language: string; structure: 'single' | 'three_part' }
) {
  return apiFetch<{ success: boolean; data?: { taskId: string; filmId: string }; error?: { message: string }; quotaRemaining?: number }>(
    '/api/stories/create',
    token,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

export async function getGenerationStatus(token: string | null, taskId: string) {
  return apiFetch<{ success: boolean; data?: { taskId: string; status: string; progress: number; videoUrl?: string; filmId?: string; error?: string } }>(
    `/api/generate/${encodeURIComponent(taskId)}`,
    token
  );
}

export async function fetchFilms(token: string | null, childId: string, status?: string) {
  const params = new URLSearchParams({ childId });
  if (status) params.set('status', status);
  return apiFetch<{ success: boolean; data: Film[] }>(`/api/films?${params}`, token);
}

export async function approveFilm(token: string | null, filmId: string) {
  return apiFetch<{ success: boolean }>(`/api/films/${filmId}/approve`, token, { method: 'POST' });
}

export async function discardFilm(token: string | null, filmId: string) {
  return apiFetch<{ success: boolean }>(`/api/films/${filmId}/discard`, token, { method: 'POST' });
}

export async function updateFilm(token: string | null, filmId: string, body: { title?: Record<string, string>; status?: string }) {
  return apiFetch<{ success: boolean; data: Film }>(`/api/films/${filmId}`, token, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteFilm(token: string | null, filmId: string) {
  return apiFetch<{ success: boolean }>(`/api/films/${filmId}`, token, { method: 'DELETE' });
}

export async function fetchChildren(token: string | null) {
  return apiFetch<ApiResponse<ChildProfile[]>>('/api/children', token);
}

export async function createChild(
  token: string | null,
  payload: { displayName: string; avatarEmoji?: string; ageBand?: string; allowedLanguages?: string[] }
) {
  return apiFetch<ApiResponse<ChildProfile>>('/api/children', token, { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateChild(
  token: string | null,
  childId: string,
  payload: { displayName?: string; avatarEmoji?: string; ageBand?: string }
) {
  return apiFetch<ApiResponse<ChildProfile>>(`/api/children/${childId}`, token, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function fetchQuota(token: string | null) {
  return apiFetch<{ success: boolean; data: QuotaStatus }>('/api/quota', token);
}

export async function fetchCosts(token: string | null) {
  return apiFetch<{ success: boolean; data: { totalGenerations: number; estimatedCostUsd: string } }>('/api/admin/costs', token);
}

export async function trackProgress(token: string | null, payload: { childId: string; filmId: string; event: string }) {
  return apiFetch<{ success: boolean }>('/api/progress', token, { method: 'POST', body: JSON.stringify(payload) });
}

export type GenerationStatus = 'processing' | 'completed' | 'failed';

export type GenerateResponse = {
  success: boolean;
  data?: {
    taskId: string;
    status: GenerationStatus;
    progress: number;
  };
  message?: string;
  error?: {
    code: string;
    message: string;
  };
};

export type StatusResponse = {
  success: boolean;
  data?: {
    taskId: string;
    status: GenerationStatus;
    progress: number;
    videoUrl: string | null;
    error: string | null;
    prompt: string;
    duration: number;
    createdAt: string;
  };
  error?: {
    code: string;
    message: string;
  };
};

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
}

export function toAbsoluteAssetUrl(maybeRelativeUrl: string) {
  if (/^https?:\/\//i.test(maybeRelativeUrl)) return maybeRelativeUrl;
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const path = maybeRelativeUrl.startsWith('/') ? maybeRelativeUrl : `/${maybeRelativeUrl}`;
  return `${base}${path}`;
}

export async function startGeneration(payload: { prompt: string; duration: number; category: string }) {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const res = await fetch(`${base}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const json = (await res.json()) as GenerateResponse;
  return json;
}

export async function getGenerationStatus(taskId: string) {
  const base = getApiBaseUrl().replace(/\/+$/, '');
  const res = await fetch(`${base}/api/generate/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const json = (await res.json()) as StatusResponse;
  return json;
}


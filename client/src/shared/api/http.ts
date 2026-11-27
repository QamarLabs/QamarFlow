import { env } from '@/shared/config/env';

/**
 * Fetch wrapper for the QamarFlow API.
 * - prefixes the base URL (/api, proxied to the server in dev)
 * - attaches the in-memory access token as a Bearer header
 * - on 401, calls POST /auth/refresh once (httpOnly cookie) and retries
 */
type TokenListener = (token: string | null) => void;

let accessToken: string | null = null;
let onTokenChange: TokenListener = () => undefined;
let refreshing: Promise<string | null> | null = null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body?: unknown
  ) {
    super(message);
  }
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function subscribeToken(listener: TokenListener) {
  onTokenChange = listener;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = fetch(`${env.apiUrl}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async res => {
        if (!res.ok) return null;
        const body = (await res.json()) as { accessToken?: string };
        return body.accessToken ?? null;
      })
      .catch(() => null)
      .then(token => {
        accessToken = token;
        onTokenChange(token);
        return token;
      })
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

type RequestOptions = { method?: string; body?: unknown; auth?: boolean; retry?: boolean };

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(`${env.apiUrl}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  if (res.status === 401 && auth && retry) {
    const token = await refreshAccessToken();
    if (token) return request<T>(path, { ...opts, retry: false });
  }

  const text = await res.text();
  const data = text ? safeJson(text) : undefined;
  if (!res.ok) {
    const obj = (data && typeof data === 'object' ? data : {}) as {
      message?: unknown;
      error?: unknown;
    };
    const fromError =
      obj.error && typeof obj.error === 'object' && 'message' in obj.error
        ? (obj.error as { message?: unknown }).message
        : obj.error;
    const message = String(obj.message ?? fromError ?? (res.statusText || 'Request failed'));
    throw new ApiError(res.status, message, data);
  }
  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const http = {
  get: <T>(path: string, auth = true) => request<T>(path, { auth }),
  post: <T>(path: string, body?: unknown, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, request, setAccessToken, subscribeToken } from './http';

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type Init = { headers: Record<string, string> };

describe('http request', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    setAccessToken('old');
  });
  afterEach(() => vi.unstubAllGlobals());

  it('refreshes on 401 and retries with the new token', async () => {
    const listener = vi.fn();
    subscribeToken(listener);
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'expired' }))
      .mockResolvedValueOnce(json(200, { accessToken: 'new' }))
      .mockResolvedValueOnce(json(200, { ok: true }));

    await expect(request('/boards')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect((fetchMock.mock.calls[0][1] as Init).headers.Authorization).toBe('Bearer old');
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/refresh');
    expect((fetchMock.mock.calls[2][1] as Init).headers.Authorization).toBe('Bearer new');
    expect(listener).toHaveBeenCalledWith('new');
  });

  it('throws ApiError when the refresh fails', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, { message: 'expired' }))
      .mockResolvedValueOnce(json(401, {}));
    await expect(request('/boards')).rejects.toBeInstanceOf(ApiError);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries only once', async () => {
    fetchMock
      .mockResolvedValueOnce(json(401, {}))
      .mockResolvedValueOnce(json(200, { accessToken: 'new' }))
      .mockResolvedValueOnce(json(401, { message: 'still no' }));
    await expect(request('/boards')).rejects.toMatchObject({ status: 401, message: 'still no' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not refresh for unauthenticated calls', async () => {
    fetchMock.mockResolvedValueOnce(json(401, { message: 'nope' }));
    await expect(request('/auth/login', { method: 'POST', auth: false })).rejects.toBeInstanceOf(
      ApiError
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

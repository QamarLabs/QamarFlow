import { http } from '@/shared/api/http';

export type ImageRef = { id: string; url: string; thumbUrl: string; author: string; authorLink: string };

/** Unsplash is proxied by the server; no API key reaches the browser. */
export const backgroundsApi = {
  search: async (query: string, page = 1) =>
    (
      await http.get<{ images: ImageRef[] }>(
        `/media/backgrounds?query=${encodeURIComponent(query)}&page=${page}`
      )
    ).images,
  random: async () => (await http.get<{ image: ImageRef }>('/media/backgrounds/random')).image
};

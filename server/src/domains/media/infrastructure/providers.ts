import { randomInt } from 'node:crypto';
import { DomainError } from '../../../shared/errors.js';
import type { ImageRef } from '../domain/image-ref.js';
import type { ImageSearch, RandomImageProvider } from '../application/media.service.js';

interface UnsplashPhoto {
  id: string;
  urls: { regular: string; small: string };
  user: { name: string; links: { html: string } };
}

/** Unsplash adapter: the access key stays on the server. */
export class UnsplashImageSearch implements ImageSearch {
  constructor(private accessKey: string, private fetchFn: typeof fetch = fetch) {}
  async search(query: string, page: number): Promise<ImageRef[]> {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.search = new URLSearchParams({ query, page: String(page), per_page: '20', orientation: 'landscape' }).toString();
    const res = await this.fetchFn(url, {
      headers: { Authorization: `Client-ID ${this.accessKey}`, 'Accept-Version': 'v1' },
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);
    if (!res || !res.ok) throw new DomainError('UPSTREAM_ERROR', 'Image search is unavailable');
    const body = (await res.json()) as { results: UnsplashPhoto[] };
    return body.results.map((p) => ({
      id: p.id, url: p.urls.regular, thumbUrl: p.urls.small, author: p.user.name,
      authorLink: `${p.user.links.html}?utm_source=qamarflow&utm_medium=referral`,
    }));
  }
}

/** Picsum provider (replaces getRandomImageUrl in util/index.ts). */
export class PicsumProvider implements RandomImageProvider, ImageSearch {
  private ref(id: number): ImageRef {
    return {
      id: `picsum-${id}`, url: `https://picsum.photos/id/${id}/1920/1080`,
      thumbUrl: `https://picsum.photos/id/${id}/400/225`, author: 'Lorem Picsum', authorLink: 'https://picsum.photos',
    };
  }
  random() { return this.ref(randomInt(0, 1000)); }
  async search(_query: string, page: number) {
    return Array.from({ length: 20 }, (_, i) => this.ref(((page - 1) * 20 + i) % 1000));
  }
}

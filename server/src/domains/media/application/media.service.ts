import { searchQuery, type ImageRef } from '../domain/image-ref.js';

export interface ImageSearch { search(query: string, page: number): Promise<ImageRef[]> }
export interface RandomImageProvider { random(): ImageRef }

export class MediaService {
  constructor(private search: ImageSearch, private randomProvider: RandomImageProvider) {}
  backgrounds(query: string | undefined, page: number) {
    return this.search.search(searchQuery(query), Math.max(1, Math.min(page, 50)));
  }
  random() { return this.randomProvider.random(); }
}

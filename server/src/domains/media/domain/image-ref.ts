export interface ImageRef { id: string; url: string; thumbUrl: string; author: string; authorLink: string }

/** SearchQuery value object. */
export const searchQuery = (raw: string | undefined): string => (raw ?? '').trim().slice(0, 100) || 'nature';

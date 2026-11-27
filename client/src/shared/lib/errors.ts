export const errorMessage = (e: unknown): string =>
  e instanceof Error ? e.message : typeof e === 'string' ? e : 'Something went wrong';

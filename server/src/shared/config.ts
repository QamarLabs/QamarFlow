import { z } from 'zod';

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_PATH: z.string().default('./data/qamarflow.db'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().min(16).default('dev-access-secret-change-me'),
  JWT_REFRESH_SECRET: z.string().min(16).default('dev-refresh-secret-change-me'),
  SENDGRID_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().default('no-reply@qamarflow.local'),
  UNSPLASH_ACCESS_KEY: z.string().optional(),
});
export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const cleaned = Object.fromEntries(Object.entries(env).filter(([, v]) => v !== ''));
  const cfg = schema.parse(cleaned);
  if (cfg.NODE_ENV === 'production' && cfg.JWT_SECRET.startsWith('dev-')) {
    throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be set in production');
  }
  return cfg;
}

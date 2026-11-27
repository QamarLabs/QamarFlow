import request from 'supertest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/shared/config.js';
import { openDatabase } from '../src/infrastructure/db/connection.js';
import { MemoryMailer } from '../src/domains/mail/infrastructure/mailers.js';

export function makeApp() {
  const db = openDatabase(':memory:');
  const mailer = new MemoryMailer();
  const config = loadConfig({ NODE_ENV: 'test', CLIENT_URL: 'http://localhost:5173' });
  const app = createApp({ db, config, mailer });
  return { app, db, mailer };
}

export async function register(app: ReturnType<typeof makeApp>['app'], email: string, password = 'password123') {
  const res = await request(app).post('/api/auth/register').send({ email, password });
  if (res.status !== 201) throw new Error(`register failed: ${res.status} ${JSON.stringify(res.body)}`);
  return { token: res.body.accessToken as string, user: res.body.user, auth: { Authorization: `Bearer ${res.body.accessToken}` } };
}

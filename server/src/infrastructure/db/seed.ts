/**
 * Seeds a demo account with one board. Idempotent: skips if the demo user exists.
 * Usage: npm run seed   (login: demo@qamarflow.local / password123)
 */
import 'dotenv/config';
import request from 'supertest';
import { createApp } from '../../app.js';
import { loadConfig } from '../../shared/config.js';
import { openDatabase } from './connection.js';

const config = loadConfig();
const db = openDatabase(config.DATABASE_PATH);
const app = createApp({ db, config, mailer: { send: async () => ({ providerId: null }) } });

const EMAIL = 'demo@qamarflow.local';
const PASSWORD = 'password123';

async function main() {
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(EMAIL)) {
    console.log(`Seed skipped: ${EMAIL} already exists`);
    return;
  }
  // Goes through the real use cases so every invariant (membership, sequences, sanitising) holds.
  const reg = await request(app).post('/api/auth/register').send({ email: EMAIL, password: PASSWORD, fullName: 'Demo User' });
  const token = reg.body.accessToken as string;
  const auth = { Authorization: `Bearer ${token}` };
  const board = (await request(app).post('/api/boards').set(auth)
    .send({ name: 'Product roadmap', backgroundImage: 'https://picsum.photos/id/1018/1920/1080' })).body.board;
  const cols: Record<string, string> = {};
  for (const name of ['To do', 'In progress', 'Done']) {
    cols[name] = (await request(app).post(`/api/boards/${board.id}/columns`).set(auth).send({ name })).body.column.id;
  }
  const cards: [string, string, string?][] = [
    ['To do', 'Write onboarding docs'], ['To do', 'Design invite email', 'Design'],
    ['In progress', 'Migrate API to Express'], ['Done', 'Pick SQLite schema'],
  ];
  for (const [col, title, labelType] of cards) {
    await request(app).post(`/api/boards/${board.id}/columns/${cols[col]}/cards`).set(auth).send({
      title, description: `<p>${title}</p>`, label: labelType ? { type: labelType, bg: 'purple' } : null,
    });
  }
  console.log(`Seeded ${EMAIL} / ${PASSWORD} with board "${board.name}"`);
}

main().finally(() => db.close());

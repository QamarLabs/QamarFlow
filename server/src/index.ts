import 'dotenv/config';
import { createApp } from './app.js';
import { loadConfig } from './shared/config.js';
import { openDatabase } from './infrastructure/db/connection.js';

const config = loadConfig();
const db = openDatabase(config.DATABASE_PATH);
const app = createApp({ db, config });

const server = app.listen(config.PORT, () => {
  console.log(`QamarFlow API listening on http://localhost:${config.PORT} (db: ${config.DATABASE_PATH})`);
  if (!config.SENDGRID_API_KEY) console.log('SENDGRID_API_KEY not set: mail is printed to the console');
});

const shutdown = () => server.close(() => { db.close(); process.exit(0); });
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

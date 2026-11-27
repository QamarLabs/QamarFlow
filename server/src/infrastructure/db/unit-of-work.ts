import type { Db } from './connection.js';
import type { UnitOfWork } from '../../shared/unit-of-work.js';

export const sqliteUnitOfWork = (db: Db): UnitOfWork => (fn) => db.transaction(fn)();

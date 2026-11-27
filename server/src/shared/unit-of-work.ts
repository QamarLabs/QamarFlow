/** Runs fn atomically (better-sqlite3 db.transaction under the hood). */
export type UnitOfWork = <T>(fn: () => T) => T;

import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & {
  __orrPgPool?: Pool;
};

/**
 * Pool creation is deferred to first query. This keeps `next build` hermetic
 * (no DATABASE_URL required at build time) while pages/APIs that touch the
 * database still fail fast — and their callers already fall back gracefully.
 */
function getPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  globalForDb.__orrPgPool ??= new Pool({ connectionString: databaseUrl });
  return globalForDb.__orrPgPool;
}

type Db = NodePgDatabase<Record<string, never>>;

export function getDb(): Db {
  return drizzle(getPool());
}

export function getPoolRef(): Pool {
  return getPool();
}

/**
 * Lazy proxy so `import { db } from "@/db"` keeps working everywhere without
 * touching the database until a query is actually executed.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? (value as (...args: unknown[]) => unknown).bind(real) : value;
  },
});


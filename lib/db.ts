// lib/db.ts
import { Pool } from "pg";

declare global {
  // dev дээр HMR-ээс pool олон үүсэхээс хамгаалж cache хийнэ
  // eslint-disable-next-line no-var
  var __pgPool: Pool | undefined;
}

export const pool =
  global.__pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon/Supabase дээр ихэнхдээ SSL шаарддаг
    ssl: { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") global.__pgPool = pool;

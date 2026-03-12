import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const { rows } = await pool.query(`
    SELECT
      COUNT(*)::int AS n,
      AVG(crt_accuracy) AS avg_crt_accuracy,
      AVG(crt_mean_rt_ms) AS avg_crt_mean_rt_ms,
      AVG(stroop_accuracy) AS avg_stroop_accuracy,
      AVG(stroop_mean_rt_ms) AS avg_stroop_mean_rt_ms
    FROM test_sessions_summary;
  `);

  return NextResponse.json({ ok: true, ...rows[0] });
}
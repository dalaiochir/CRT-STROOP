import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  const { rows } = await pool.query(`
    select
      count(*)::int as n,
      avg(crt_accuracy) as avg_crt_accuracy,
      avg(crt_mean_rt_ms) as avg_crt_mean_rt_ms,
      avg(stroop_accuracy) as avg_stroop_accuracy,
      avg(stroop_mean_rt_ms) as avg_stroop_mean_rt_ms
      avg(cerq_adaptive_mean) as avg_cerq_adaptive_mean,
      avg(cerq_maladaptive_mean) as avg_cerq_maladaptive_mean
    from test_sessions_summary
  `);

  return NextResponse.json({ ok: true, ...rows[0] });
}

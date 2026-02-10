import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type SubmitBody = {
  participantId: string; // uuid
  totalTrials: number;
  crt: { accuracy: number; meanRtMs: number };
  stroop: { accuracy: number; meanRtMs: number };
  meta?: { userAgent?: string; screenW?: number; screenH?: number };
};

export async function POST(req: Request) {
  const body = (await req.json()) as SubmitBody;

  if (!body.participantId || !body.totalTrials) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  await pool.query(
    `insert into test_sessions_summary
      (participant_id, total_trials, crt_accuracy, crt_mean_rt_ms, stroop_accuracy, stroop_mean_rt_ms, user_agent, screen_w, screen_h)
     values
      ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [
      body.participantId,
      body.totalTrials,
      body.crt?.accuracy ?? null,
      body.crt?.meanRtMs ?? null,
      body.stroop?.accuracy ?? null,
      body.stroop?.meanRtMs ?? null,
      body.meta?.userAgent ?? null,
      body.meta?.screenW ?? null,
      body.meta?.screenH ?? null,
    ]
  );

  return NextResponse.json({ ok: true });
}

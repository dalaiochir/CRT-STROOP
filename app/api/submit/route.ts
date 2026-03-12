import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type SubmitBody = {
  participantId: string;
  totalTrials: number;
  crt: { accuracy: number; meanRtMs: number };
  stroop: { accuracy: number; meanRtMs: number };
  age?: number;
  gender?: string;
  education?: string;
  cerq?: {
    selfBlameMean: number;
    acceptanceMean: number;
    ruminationMean: number;
    positiveRefocusingMean: number;
    refocusPlanningMean: number;
    positiveReappraisalMean: number;
    puttingPerspectiveMean: number;
    catastrophizingMean: number;
    blamingOthersMean: number;
    adaptiveMean: number;
    maladaptiveMean: number;
  };
  meta?: { userAgent?: string; screenW?: number; screenH?: number };
};

export async function POST(req: Request) {
  const body = (await req.json()) as SubmitBody;

  if (!body.participantId || !body.totalTrials) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  await pool.query(
  `insert into test_sessions_summary
    (participant_id, total_trials, crt_accuracy, crt_mean_rt_ms, stroop_accuracy, stroop_mean_rt_ms,
     age, gender, education
     cerq_self_blame_mean, cerq_acceptance_mean, cerq_rumination_mean,
     cerq_positive_refocusing_mean, cerq_refocus_planning_mean, cerq_positive_reappraisal_mean,
     cerq_putting_perspective_mean, cerq_catastrophizing_mean, cerq_blaming_others_mean,
     cerq_adaptive_mean, cerq_maladaptive_mean,
     user_agent, screen_w, screen_h)
   values
    ($1,$2,$3,$4,$5,$6,
     $7,$8, $9
     $10,$11,$12,
     $13,$14,$15,
     $16,$17,$18,
     $19,$20,
     $21,$22,$23)`,
  [
    body.participantId,
    body.totalTrials,
    body.crt?.accuracy ?? null,
    body.crt?.meanRtMs ?? null,
    body.stroop?.accuracy ?? null,
    body.stroop?.meanRtMs ?? null,

    body.age ?? null,
    body.gender ?? null,
    body.education ?? null,

    body.cerq?.selfBlameMean ?? null,
    body.cerq?.acceptanceMean ?? null,
    body.cerq?.ruminationMean ?? null,

    body.cerq?.positiveRefocusingMean ?? null,
    body.cerq?.refocusPlanningMean ?? null,
    body.cerq?.positiveReappraisalMean ?? null,

    body.cerq?.puttingPerspectiveMean ?? null,
    body.cerq?.catastrophizingMean ?? null,
    body.cerq?.blamingOthersMean ?? null,

    body.cerq?.adaptiveMean ?? null,
    body.cerq?.maladaptiveMean ?? null,

    body.meta?.userAgent ?? null,
    body.meta?.screenW ?? null,
    body.meta?.screenH ?? null,
  ]
);

  return NextResponse.json({ ok: true });
}

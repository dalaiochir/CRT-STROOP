import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type SubmitBody = {
  crt: { accuracy: number; meanRtMs: number };
  stroop: { accuracy: number; meanRtMs: number };
  age?: number | null;
  gender?: string | null;
  education?: string | null;
  cerqAnswers?: number[];
  temperamentAnswers?: Record<string, number>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SubmitBody;

    const cerq = Array.isArray(body.cerqAnswers) ? body.cerqAnswers : [];
    if (cerq.length !== 36) {
      return NextResponse.json(
        { ok: false, error: "CERQ answers must contain exactly 36 values." },
        { status: 400 }
      );
    }

    await pool.query(
      `
      INSERT INTO test_sessions_summary (
        crt_accuracy,
        crt_mean_rt_ms,
        stroop_accuracy,
        stroop_mean_rt_ms,
        age,
        gender,
        education,
        cerq_q1,
        cerq_q2,
        cerq_q3,
        cerq_q4,
        cerq_q5,
        cerq_q6,
        cerq_q7,
        cerq_q8,
        cerq_q9,
        cerq_q10,
        cerq_q11,
        cerq_q12,
        cerq_q13,
        cerq_q14,
        cerq_q15,
        cerq_q16,
        cerq_q17,
        cerq_q18,
        cerq_q19,
        cerq_q20,
        cerq_q21,
        cerq_q22,
        cerq_q23,
        cerq_q24,
        cerq_q25,
        cerq_q26,
        cerq_q27,
        cerq_q28,
        cerq_q29,
        cerq_q30,
        cerq_q31,
        cerq_q32,
        cerq_q33,
        cerq_q34,
        cerq_q35,
        cerq_q36,
        p1, p2, p3, p4, p5, p6,
    m1, m2, m3, m4, m5, m6,
    s1, s2, s3, s4, s5, s6,
    c1, c2, c3, c4, c5, c6
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, $24, $25, $26, $27,
        $28, $29, $30, $31, $32, $33, $34, $35, $36, $37,
        $38, $39, $40, $41, $42, $43,
        $44, $45, $46, $47, $48, $49,
    $50, $51, $52, $53, $54, $55,
    $56, $57, $58, $59, $60, $61,
    $62, $63, $64, $65, $66, $67
      )
      `,
      [
        body.crt?.accuracy ?? null,
        body.crt?.meanRtMs ?? null,
        body.stroop?.accuracy ?? null,
        body.stroop?.meanRtMs ?? null,
        body.age ?? null,
        body.gender ?? null,
        body.education ?? null,
        cerq[0] ?? null,
        cerq[1] ?? null,
        cerq[2] ?? null,
        cerq[3] ?? null,
        cerq[4] ?? null,
        cerq[5] ?? null,
        cerq[6] ?? null,
        cerq[7] ?? null,
        cerq[8] ?? null,
        cerq[9] ?? null,
        cerq[10] ?? null,
        cerq[11] ?? null,
        cerq[12] ?? null,
        cerq[13] ?? null,
        cerq[14] ?? null,
        cerq[15] ?? null,
        cerq[16] ?? null,
        cerq[17] ?? null,
        cerq[18] ?? null,
        cerq[19] ?? null,
        cerq[20] ?? null,
        cerq[21] ?? null,
        cerq[22] ?? null,
        cerq[23] ?? null,
        cerq[24] ?? null,
        cerq[25] ?? null,
        cerq[26] ?? null,
        cerq[27] ?? null,
        cerq[28] ?? null,
        cerq[29] ?? null,
        cerq[30] ?? null,
        cerq[31] ?? null,
        cerq[32] ?? null,
        cerq[33] ?? null,
        cerq[34] ?? null,
        cerq[35] ?? null,
        body.temperamentAnswers?.P1 ?? null,
    body.temperamentAnswers?.P2 ?? null,
    body.temperamentAnswers?.P3 ?? null,
    body.temperamentAnswers?.P4 ?? null,
    body.temperamentAnswers?.P5 ?? null,
    body.temperamentAnswers?.P6 ?? null,

    body.temperamentAnswers?.M1 ?? null,
    body.temperamentAnswers?.M2 ?? null,
    body.temperamentAnswers?.M3 ?? null,
    body.temperamentAnswers?.M4 ?? null,
    body.temperamentAnswers?.M5 ?? null,
    body.temperamentAnswers?.M6 ?? null,

    body.temperamentAnswers?.S1 ?? null,
    body.temperamentAnswers?.S2 ?? null,
    body.temperamentAnswers?.S3 ?? null,
    body.temperamentAnswers?.S4 ?? null,
    body.temperamentAnswers?.S5 ?? null,
    body.temperamentAnswers?.S6 ?? null,

    body.temperamentAnswers?.C1 ?? null,
    body.temperamentAnswers?.C2 ?? null,
    body.temperamentAnswers?.C3 ?? null,
    body.temperamentAnswers?.C4 ?? null,
    body.temperamentAnswers?.C5 ?? null,
    body.temperamentAnswers?.C6 ?? null,
      ]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Submit API error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to save session." },
      { status: 500 }
    );
  }
}
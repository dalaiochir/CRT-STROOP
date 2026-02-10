export type CRTStage =
  | "CRT1" | "CRT2" | "CRT3" | "CRT4" | "CRT5" | "CRT6" | "CRT7" | "CRT8";

export type StroopCondition = "congruent" | "incongruent" | "neutral";

export type TrialRecord = {
  trialIndex: number;
  stimulus: string;         // displayed text or encoded payload
  correctAnswer: string;    // e.g., "Амьтан"
  userAnswer: string;       // e.g., "Ургамал"
  correct: boolean;
  rtMs: number;
  startedAt: number;        // epoch ms
};

export type SectionResult = {
  section: CRTStage | "STROOP";
  startedAt: number;
  endedAt: number;
  trials: TrialRecord[];
  summary: {
    n: number;
    accuracy: number;        // 0..1
    meanRtMs: number;        // correct-only
    medianRtMs: number;      // correct-only
    errors: number;
  };
};

export type TestSession = {
  id: string;
  createdAt: number;
  version: string;
  crt: SectionResult[];
  stroop: SectionResult | null;
  notes?: string;
};

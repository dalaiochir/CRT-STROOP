"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Arrow from "@/components/Arrow";
import Grid33 from "@/components/Grid33";

import { addSession } from "@/lib/storage";
import { mean, median, formatMs } from "@/lib/stats";
import type { CRTStimulus, StroopStimulus } from "@/lib/stimuli";
import { makeCRT, makeStroopTrials, STROOP_COLORS } from "@/lib/stimuli";
import type { CRTStage, SectionResult, TestSession, TrialRecord } from "@/lib/types";

import { CERQ_QUESTIONS, computeCerqScores } from "@/lib/cerq";
import { getParticipantId } from "@/lib/participant";

type Phase =
  | "idle"
  | "participant"
  | "cerq"
  | "intro"
  | "crt"
  | "break"
  | "stroop"
  | "done";

const CRT_ORDER: CRTStage[] = [
  "CRT1",
  "CRT2",
  "CRT3",
  "CRT4",
  "CRT5",
  "CRT6",
  "CRT7",
  "CRT8",
];

type IntroState =
  | { kind: "crt"; stage: CRTStage; title: string; body: string }
  | { kind: "stroop"; title: string; body: string }
  | null;

function sessionId() {
  return crypto.randomUUID();
}

function summarize(trials: TrialRecord[]) {
  const n = trials.length;
  const correct = trials.filter((t) => t.correct);
  const rts = correct.map((t) => t.rtMs);
  const acc = n === 0 ? 0 : correct.length / n;
  return {
    n,
    accuracy: acc,
    meanRtMs: mean(rts),
    medianRtMs: median(rts),
    errors: n - correct.length,
  };
}

const CRT_LABELS: Record<CRTStage, [string, string]> = {
  CRT1: ["Ургамал", "Амьтан"],
  CRT2: ["Нэг үетэй", "Хоёр үетэй"],
  CRT3: ["Тэгш", "Сондгой"],
  CRT4: ["500-с бага", "500-с их"],
  CRT5: ["Дээш чиглэсэн", "Доош чиглэсэн"],
  CRT6: ["Дээд", "Доод"],
  CRT7: ["Холбогдсон", "Холбогдоогүй"],
  CRT8: ["Босоо тэнхлэг", "Хэвтээ тэнхлэг"],
};

const CRT_INTRO_TEXT: Record<CRTStage, { title: string; body: string }> = {
  CRT1: {
    title: "CRT1 — Ургамал vs Амьтан",
    body: "Гарч ирэх үгийг ангилаад аль болох хурдан сонгоно.\n← Ургамал  |  → Амьтан\nНийт 40 (20/20).",
  },
  CRT2: {
    title: "CRT2 — Нэг үетэй vs Хоёр үетэй",
    body: "Гарч ирэх үгийг нэг/хоёр үетэй гэж ангилна.\n← Нэг үетэй  |  → Хоёр үетэй\nНийт 40 (20/20).",
  },
  CRT3: {
    title: "CRT3 — Тэгш vs Сондгой",
    body: "3 оронтой тоог тэгш/сондгой гэж ангилна.\n← Тэгш  |  → Сондгой\nНийт 40 (20/20).",
  },
  CRT4: {
    title: "CRT4 — 500-с бага vs 500-с их",
    body: "3 оронтой тоог 500-с бага/их гэж ангилна.\n← 500-с бага  |  → 500-с их\nНийт 40 (20/20).",
  },
  CRT5: {
    title: "CRT5 — Дээш vs Доош (өнцгөөр)",
    body: "Сумны чиглэлийг (өнцгийн дагуу) ангилна.\n← Дээш чиглэсэн  |  → Доош чиглэсэн\nНийт 40 (20/20).",
  },
  CRT6: {
    title: "CRT6 — Дээд vs Доод (дэлгэцийн хагас)",
    body: "Сум дэлгэцийн ДЭЭД эсвэл ДООД хагас дээр гарна.\n← Дээд  |  → Доод\nНийт 40 (20/20).",
  },
  CRT7: {
    title: "CRT7 — Холбогдсон vs Холбогдоогүй",
    body: "3×3 grid доторх нүднүүд холбоотой эсэхийг ангилна.\n← Холбогдсон  |  → Холбогдоогүй\nНийт 40 (20/20).",
  },
  CRT8: {
    title: "CRT8 — Босоо vs Хэвтээ (мөр/багана)",
    body: "3×3 дээр зөвхөн нэг мөр эсвэл нэг багана бөглөгдөнө.\n← Босоо (багана)  |  → Хэвтээ (мөр)\nНийт 40 (20/20).",
  },
};

const STROOP_INTRO = {
  title: "STROOP — Өнгийг нэрлэнэ",
  body: "Үгийн УТГЫГ БИШ, зөвхөн ӨНГИЙГ сонгоно.\nТовч: 1-Улаан, 2-Цэнхэр, 3-Ногоон, 4-Шар\nХугацаа: 60 секунд.",
};

export default function TestPage() {
  const [phase, setPhase] = useState<Phase>("idle");

  // Participant
  const [age, setAge] = useState<number | "">("");
  const [gender, setGender] = useState<string>("");

  // CERQ
  const [cerqIndex, setCerqIndex] = useState(0);
  const [cerqAnswers, setCerqAnswers] = useState<number[]>(Array(36).fill(0));
  const cerqDone = useMemo(
    () => cerqAnswers.length === 36 && cerqAnswers.every((x) => x >= 1 && x <= 5),
    [cerqAnswers]
  );

  // Intro
  const [intro, setIntro] = useState<IntroState>(null);
  const pendingStartRef = useRef<null | (() => void)>(null);

  // CRT
  const [crtIndex, setCrtIndex] = useState(0);
  const [crtStimuli, setCrtStimuli] = useState<CRTStimulus[]>([]);
  const [crtTrial, setCrtTrial] = useState(0);

  // Stroop
  const [stroopStimuli, setStroopStimuli] = useState<StroopStimulus[]>([]);
  const [stroopTrial, setStroopTrial] = useState(0);

  // UI
  const [leftLabel, setLeftLabel] = useState("Зүүн");
  const [rightLabel, setRightLabel] = useState("Баруун");
  const [message, setMessage] = useState<string | null>(null);

  // Results
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [stroopResult, setStroopResult] = useState<SectionResult | null>(null);

  // Timing + records
  const trialStartRef = useRef<number>(0);
  const sectionStartRef = useRef<number>(0);
  const trialsRef = useRef<TrialRecord[]>([]);
  const savedRef = useRef(false);

  // Feedback flash
  const [flash, setFlash] = useState<null | "good" | "bad">(null);
  const flashTimerRef = useRef<number | null>(null);

  function triggerFeedback(isCorrect: boolean) {
    if (flashTimerRef.current !== null) {
      window.clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
    setFlash(isCorrect ? "good" : "bad");
    flashTimerRef.current = window.setTimeout(() => {
      setFlash(null);
      flashTimerRef.current = null;
    }, 180);
  }

  // Stroop 60s timer
  const [stroopTimeLeft, setStroopTimeLeft] = useState<number>(60);
  const stroopEndAtRef = useRef<number>(0);
  const stroopTimerRef = useRef<number | null>(null);

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (flashTimerRef.current !== null) {
        window.clearTimeout(flashTimerRef.current);
        flashTimerRef.current = null;
      }
      if (stroopTimerRef.current !== null) {
        window.clearInterval(stroopTimerRef.current);
        stroopTimerRef.current = null;
      }
    };
  }, []);

  const currentStage = CRT_ORDER[crtIndex] ?? null;
  const currentCRTStimulus = phase === "crt" ? crtStimuli[crtTrial] : null;
  const currentStroop = phase === "stroop" ? stroopStimuli[stroopTrial] : null;

  function openCRTIntro(stage: CRTStage) {
    const t = CRT_INTRO_TEXT[stage];
    setIntro({ kind: "crt", stage, title: t.title, body: t.body });
    setPhase("intro");
    setMessage(null);
    pendingStartRef.current = () => startCRTSection(stage);
  }

  function openStroopIntro() {
    setIntro({ kind: "stroop", title: STROOP_INTRO.title, body: STROOP_INTRO.body });
    setPhase("intro");
    setMessage(null);
    pendingStartRef.current = () => startStroop();
  }

  function startCRTSection(stage: CRTStage) {
    const stim = makeCRT(stage);
    setCrtStimuli(stim);
    setCrtTrial(0);
    trialsRef.current = [];
    sectionStartRef.current = Date.now();
    setPhase("crt");
    setMessage(null);

    const [l, r] = CRT_LABELS[stage];
    setLeftLabel(l);
    setRightLabel(r);

    setTimeout(() => {
      trialStartRef.current = performance.now();
    }, 50);
  }

  function finishCRTSection(stage: CRTStage) {
    const endedAt = Date.now();
    const trials = trialsRef.current;
    const summary = summarize(trials);
    const res: SectionResult = {
      section: stage,
      startedAt: sectionStartRef.current,
      endedAt,
      trials,
      summary,
    };
    setSectionResults((prev) => [...prev, res]);
  }

  function startBreak() {
    setPhase("break");
    setMessage("CRT дууслаа. 10 секунд амраад Stroop эхэлнэ...");
    let t = 10;
    const interval = window.setInterval(() => {
      t -= 1;
      setMessage(`CRT дууслаа. ${t} секундийн дараа Stroop эхэлнэ...`);
      if (t <= 0) {
        window.clearInterval(interval);
        openStroopIntro();
      }
    }, 1000);
  }

  function startStroop() {
    // Generate a lot; we'll stop by time (60s) not by count
    const trials = makeStroopTrials(240);
    setStroopStimuli(trials);
    setStroopTrial(0);

    trialsRef.current = [];
    sectionStartRef.current = Date.now();

    setPhase("stroop");
    setMessage(null);
    setLeftLabel("—");
    setRightLabel("—");

    // Timer
    setStroopTimeLeft(60);
    stroopEndAtRef.current = Date.now() + 60_000;

    if (stroopTimerRef.current !== null) {
      window.clearInterval(stroopTimerRef.current);
      stroopTimerRef.current = null;
    }

    stroopTimerRef.current = window.setInterval(() => {
      const leftMs = stroopEndAtRef.current - Date.now();
      const leftSec = Math.max(0, Math.ceil(leftMs / 1000));
      setStroopTimeLeft(leftSec);

      if (leftMs <= 0) {
        if (stroopTimerRef.current !== null) {
          window.clearInterval(stroopTimerRef.current);
          stroopTimerRef.current = null;
        }

        // Time over vibration
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate([80, 40, 80]);
        }

        finalizeStroop();
      }
    }, 200);

    setTimeout(() => {
      trialStartRef.current = performance.now();
    }, 50);
  }

  function finalizeStroop() {
    const endedAt = Date.now();
    const trials = trialsRef.current;
    const summary = summarize(trials);
    const res: SectionResult = {
      section: "STROOP",
      startedAt: sectionStartRef.current,
      endedAt,
      trials,
      summary,
    };
    setStroopResult(res);
    setPhase("done");
    setMessage("Дууслаа. Үр дүн History дээр хадгалагдлаа.");
  }

  function recordAnswer(answer: string, correctAnswer: string, stimulusLabel: string) {
    const rt = performance.now() - trialStartRef.current;
    const startedAt = Date.now();
    const correct = answer === correctAnswer;
    const rec: TrialRecord = {
      trialIndex: trialsRef.current.length,
      stimulus: stimulusLabel,
      correctAnswer,
      userAnswer: answer,
      correct,
      rtMs: Math.max(0, rt),
      startedAt,
    };
    trialsRef.current.push(rec);
  }

  function handleCRTAnswer(answer: string) {
    if (!currentStage || !currentCRTStimulus) return;

    const correctAnswer = currentCRTStimulus.correct;
    const stimulusLabel =
      currentCRTStimulus.type === "word" || currentCRTStimulus.type === "number"
        ? currentCRTStimulus.text
        : currentCRTStimulus.type === "arrowAngle"
          ? `angle:${currentCRTStimulus.angleDeg.toFixed(1)}`
          : currentCRTStimulus.type === "arrowPos"
            ? `angle:${currentCRTStimulus.angleDeg.toFixed(1)} y:${currentCRTStimulus.y}`
            : `grid:${currentCRTStimulus.cells.map((v) => (v ? 1 : 0)).join("")}`;

    recordAnswer(answer, correctAnswer, stimulusLabel);
    triggerFeedback(answer === correctAnswer);

    const next = crtTrial + 1;
    if (next >= crtStimuli.length) {
      finishCRTSection(currentStage);

      if (crtIndex + 1 < CRT_ORDER.length) {
        const nextStage = CRT_ORDER[crtIndex + 1];
        setCrtIndex(crtIndex + 1);
        setPhase("idle");
        setMessage(`${currentStage} дууслаа. Дараагийн заавар гарч ирнэ...`);
        setTimeout(() => openCRTIntro(nextStage), 600);
      } else {
        setPhase("idle");
        setMessage("CRT.8 дууслаа. Амралт эхэлж байна...");
        setTimeout(() => startBreak(), 700);
      }
    } else {
      setCrtTrial(next);
      setTimeout(() => {
        trialStartRef.current = performance.now();
      }, 50);
    }
  }

  function handleStroopAnswer(inkName: string) {
    if (phase !== "stroop") return;
    if (Date.now() >= stroopEndAtRef.current) return;
    if (!currentStroop) return;

    const correctAnswer = currentStroop.inkName;
    const stimulusLabel = `${currentStroop.word}|${currentStroop.inkName}|${currentStroop.condition}`;

    recordAnswer(inkName, correctAnswer, stimulusLabel);
    triggerFeedback(inkName === correctAnswer);

    const next = stroopTrial + 1;

    // If we run out of pre-generated items before time ends, generate more
    if (next >= stroopStimuli.length) {
      const more = makeStroopTrials(240);
      setStroopStimuli((prev) => [...prev, ...more]);
      setStroopTrial(next);
    } else {
      setStroopTrial(next);
    }

    setTimeout(() => {
      trialStartRef.current = performance.now();
    }, 50);
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === "crt") {
        if (e.key === "ArrowLeft") handleCRTAnswer(leftLabel);
        if (e.key === "ArrowRight") handleCRTAnswer(rightLabel);
      }
      if (phase === "stroop") {
        if (e.key === "1") handleStroopAnswer(STROOP_COLORS[0].name);
        if (e.key === "2") handleStroopAnswer(STROOP_COLORS[1].name);
        if (e.key === "3") handleStroopAnswer(STROOP_COLORS[2].name);
        if (e.key === "4") handleStroopAnswer(STROOP_COLORS[3].name);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, leftLabel, rightLabel, stroopTrial, crtTrial]);

  // Save + submit once when completed
  useEffect(() => {
    if (phase !== "done") return;
    if (!stroopResult) return;
    if (savedRef.current) return;
    savedRef.current = true;

    const session: TestSession = {
      id: sessionId(),
      createdAt: Date.now(),
      version: "1.0.0",
      crt: sectionResults,
      stroop: stroopResult,
    };

    // Local history (browser)
    addSession(session);

    // Server submit (summary only)
    try {
      const participantId = getParticipantId();

      const crtAll = sectionResults;
      const crtAcc =
        crtAll.reduce((a, s) => a + s.summary.accuracy, 0) / Math.max(1, crtAll.length);
      const crtMeanRt =
        crtAll.reduce((a, s) => a + s.summary.meanRtMs, 0) / Math.max(1, crtAll.length);

      const stroopAcc = stroopResult.summary.accuracy;
      const stroopMeanRt = stroopResult.summary.meanRtMs;

      const cerqScores = cerqDone ? computeCerqScores(cerqAnswers as any) : null;

      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId,
          totalTrials: 380,
          age: age === "" ? null : age,
          gender: gender || null,
          cerq: cerqScores,
          crt: { accuracy: crtAcc, meanRtMs: crtMeanRt },
          stroop: { accuracy: stroopAcc, meanRtMs: stroopMeanRt },
          meta: {
            userAgent: navigator.userAgent,
            screenW: window.innerWidth,
            screenH: window.innerHeight,
          },
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  }, [phase, stroopResult, sectionResults, age, gender, cerqAnswers, cerqDone]);

  // Start flow (now goes to participant form)
  const start = () => {
    savedRef.current = false;
    setSectionResults([]);
    setStroopResult(null);

    // reset participant + cerq
    setAge("");
    setGender("");
    setCerqIndex(0);
    setCerqAnswers(Array(36).fill(0));

    // reset tasks
    setCrtIndex(0);
    setCrtStimuli([]);
    setCrtTrial(0);
    setStroopStimuli([]);
    setStroopTrial(0);

    setIntro(null);
    pendingStartRef.current = null;

    setMessage(null);
    setPhase("participant");
  };

  const currentTitle = (() => {
    if (phase === "participant") return "Оролцогчийн мэдээлэл";
    if (phase === "cerq") return "36 Асуулга (CERQ)";
    if (phase === "intro") return "Заавар";
    if (phase === "crt" && currentStage) return currentStage;
    if (phase === "break") return "Амралт";
    if (phase === "stroop") return "STROOP";
    if (phase === "done") return "Дууссан";
    return "Тест";
  })();

  const progress = (() => {
    if (phase === "crt") {
      const sectionProg = (crtTrial + 1) / Math.max(1, crtStimuli.length);
      const overall = (crtIndex + sectionProg) / CRT_ORDER.length;
      return Math.round(overall * 100);
    }
    if (phase === "stroop") return 100;
    return 0;
  })();

  return (
    <div className="card">
      <div className="testHeader">
        <div>
          <h1 className="h1">{currentTitle}</h1>
          <div className="pill">
            <span>Progress</span>
            <b>{progress}%</b>
            <span className="mono">•</span>
            <span className="smallNote">
              {phase === "crt"
                ? `Trial ${crtTrial + 1}/${crtStimuli.length}`
                : phase === "stroop"
                  ? `Time: ${stroopTimeLeft}s`
                  : "—"}
            </span>
          </div>
        </div>

        {(phase === "idle" || phase === "done") && (
          <button className="btn btnPrimary" onClick={start}>
            {phase === "done" ? "Дахин эхлэх" : "Эхлэх"}
          </button>
        )}
      </div>

      {message && <div className="toast">{message}</div>}

<div className="testShell">
      <div
        className={
          "stimulusBox " +
          (flash === "good" ? "flashGood" : flash === "bad" ? "flashBad" : "")
        }
      >
        {/* IDLE */}
        {phase === "idle" && !message && !intro && (
          <div>
            <div className="bigText">Бэлэн үү?</div>
            <div className="smallNote">Эхлэх дээр дарна уу.</div>
          </div>
        )}

        {/* PARTICIPANT */}
        {phase === "participant" && (
          <div style={{ width: "100%", maxWidth: 520 }}>
            <div className="toast" style={{ marginBottom: 10 }}>
              Нас, хүйсээ оруулаад үргэлжлүүлнэ үү.
            </div>

            <div className="card" style={{ padding: 14 }}>
              <label className="p">Нас</label>
              <input
                className="input"
                type="number"
                value={age}
                min={10}
                max={99}
                onChange={(e) => setAge(e.target.value ? Number(e.target.value) : "")}
              />

              <div style={{ height: 12 }} />

              <label className="p">Хүйс</label>
              <select
                className="input"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Сонгох</option>
                <option value="male">Эр</option>
                <option value="female">Эм</option>
                <option value="other">Бусад</option>
                <option value="na">Хэлэхгүй</option>
              </select>

              <div className="btnRow" style={{ justifyContent: "center", marginTop: 16 }}>
                <button
                  className="btn btnPrimary"
                  disabled={age === "" || !gender}
                  onClick={() => setPhase("cerq")}
                >
                  Дараагийн алхам
                </button>
              </div>

              <p className="smallNote" style={{ marginTop: 10 }}>
                Мэдээлэл зөвхөн судалгааны үр дүн тооцоололд ашиглагдана.
              </p>
            </div>
          </div>
        )}

        {/* CERQ */}
        {phase === "cerq" && (
          <div style={{ width: "100%", maxWidth: 820 }}>
            <div className="pill" style={{ justifyContent: "center" }}>
              <span>Асуулт</span>
              <b>
                {Math.min(cerqIndex + 1, 36)}/36
              </b>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <div className="smallNote" style={{ marginBottom: 10 }}>
                1-Хэзээ ч үгүй · 2-Ховор · 3-Заримдаа · 4-Ихэвчлэн · 5-Үргэлж
              </div>

              <div className="bigText" style={{ fontSize: 22, lineHeight: 1.25 }}>
                {CERQ_QUESTIONS[cerqIndex]}
              </div>

              <div className="btnRow" style={{ justifyContent: "center", marginTop: 16 }}>
                {[1, 2, 3, 4, 5].map((v) => (
                  <button
                    key={v}
                    className={"btn " + (cerqAnswers[cerqIndex] === v ? "btnPrimary" : "")}
                    onClick={() => {
                      const next = [...cerqAnswers];
                      next[cerqIndex] = v;
                      setCerqAnswers(next);

                      if (cerqIndex < 35) setCerqIndex(cerqIndex + 1);
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className="btnRow" style={{ justifyContent: "space-between", marginTop: 16 }}>
                <button
                  className="btn"
                  disabled={cerqIndex === 0}
                  onClick={() => setCerqIndex(cerqIndex - 1)}
                >
                  ← Өмнөх
                </button>

                <button
                  className="btn btnPrimary"
                  disabled={!cerqDone}
                  onClick={() => {
                    setMessage("Туршилт удахгүй эхэлнэ...");
                    setPhase("idle");
                    setTimeout(() => openCRTIntro("CRT1"), 1200);
                  }}
                >
                  Туршилт эхлэх
                </button>
              </div>

              {!cerqDone && (
                <p className="smallNote" style={{ marginTop: 10 }}>
                  Бүх 36 асуултад хариулсны дараа “Туршилт эхлэх” идэвхжинэ.
                </p>
              )}
            </div>
          </div>
        )}

        {/* INTRO */}
        {phase === "intro" && intro && (
          <div style={{ textAlign: "center", maxWidth: 720 }}>
            <div className="bigText" style={{ fontSize: 34 }}>
              {intro.title}
            </div>
            <div className="toast" style={{ whiteSpace: "pre-line", marginTop: 12 }}>
              {intro.body}
            </div>
            <div className="btnRow" style={{ justifyContent: "center", marginTop: 16 }}>
              <button
                className="btn btnPrimary"
                onClick={() => {
                  const fn = pendingStartRef.current;
                  setIntro(null);
                  pendingStartRef.current = null;
                  fn?.();
                }}
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </div>
        )}

        {/* CRT */}
        {phase === "crt" && currentCRTStimulus && (
          <>
            {currentCRTStimulus.type === "word" && (
              <div className="bigText">{currentCRTStimulus.text}</div>
            )}
            {currentCRTStimulus.type === "number" && (
              <div className="bigText mono">{currentCRTStimulus.text}</div>
            )}
            {currentCRTStimulus.type === "arrowAngle" && (
              <Arrow angleDeg={currentCRTStimulus.angleDeg} />
            )}
            {currentCRTStimulus.type === "arrowPos" && (
              <div style={{ width: "100%", height: "100%", position: "relative" }}>
                {/* CRT6-д зааг шугам харагдах (dividerLine CSS байх ёстой) */}
                {currentStage === "CRT6" && <div className="dividerLine" />}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: currentCRTStimulus.y === "top" ? "25%" : "75%",
                    transform: "translate(-50%,-50%)",
                  }}
                >
                  <Arrow angleDeg={currentCRTStimulus.angleDeg} />
                </div>
              </div>
            )}
            {currentCRTStimulus.type === "grid" && <Grid33 cells={currentCRTStimulus.cells} />}
          </>
        )}

        {/* STROOP */}
        {phase === "stroop" && currentStroop && (
          <div className="bigText" style={{ color: currentStroop.ink }}>
            {currentStroop.word}
            <div
              className="smallNote"
              style={{ marginTop: 10, color: "rgba(255,255,255,.65)" }}
            >
              Өнгийг сонгоно уу (үгний утгыг бус) • Үлдсэн:{" "}
              <b className="mono">{stroopTimeLeft}s</b>
            </div>
          </div>
        )}

        {/* DONE */}
        {phase === "done" && (
          <div style={{ textAlign: "center" }}>
            <div className="bigText">Дууслаа ✅</div>
            <div className="smallNote" style={{ marginTop: 8 }}>
              History хуудас руу орж үр дүнгээ харна уу.
            </div>

            {stroopResult && (
              <div className="toast" style={{ marginTop: 12 }}>
                Stroop: Acc <b>{(stroopResult.summary.accuracy * 100).toFixed(1)}%</b> • Mean RT{" "}
                <b>{formatMs(stroopResult.summary.meanRtMs)}</b>
              </div>
            )}

            <div className="btnRow" style={{ justifyContent: "center", marginTop: 14 }}>
              <Link className="btn btnGhost" href="/history">
                Түүх рүү очих
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Controls
      {phase === "crt" && (
        <div className="btnRow" style={{ justifyContent: "center" }}>
          <button className="btn" onClick={() => handleCRTAnswer(leftLabel)}>
            ← {leftLabel}
          </button>
          <button className="btn" onClick={() => handleCRTAnswer(rightLabel)}>
            {rightLabel} →
          </button>
        </div>
      )}

      {phase === "stroop" && (
        <div className="btnRow" style={{ justifyContent: "center" }}>
          {STROOP_COLORS.map((c, i) => (
            <button
              key={c.name}
              className="btn"
              onClick={() => handleStroopAnswer(c.name)}
              title={`Key ${i + 1}`}
            >
              <span className="kbd">{i + 1}</span> {c.name}
            </button>
          ))}
        </div>
      )}

      <hr className="hr" /> */}

      {/* Controls */}
      <div className="mobileControls">
        {phase === "crt" && (
          <div className="crtControls">
            <button className="btn" onClick={() => handleCRTAnswer(leftLabel)}>
              ← {leftLabel}
            </button>
            <button className="btn" onClick={() => handleCRTAnswer(rightLabel)}>
              {rightLabel} →
            </button>
          </div>
        )}

        {phase === "stroop" && (
          <div className="stroopGrid">
            {STROOP_COLORS.map((c, i) => (
              <button
                key={c.name}
                className="btn"
                onClick={() => handleStroopAnswer(c.name)}
                title={`Key ${i + 1}`}
              >
                <span className="kbd">{i + 1}</span> {c.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>

    <hr className="hr" />
    
      <p className="smallNote">
        CRT: <span className="kbd">←</span>/<span className="kbd">→</span> • Stroop:{" "}
        <span className="kbd">1</span>-<span className="kbd">4</span>
      </p>
    </div>
  );
}
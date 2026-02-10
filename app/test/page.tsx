"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Arrow from "@/components/Arrow";
import Grid33 from "@/components/Grid33";
import { addSession } from "@/lib/storage";
import { mean, median } from "@/lib/stats";
import type { CRTStimulus, StroopStimulus } from "@/lib/stimuli";
import { makeCRT, makeStroopTrials, STROOP_COLORS } from "@/lib/stimuli";
import type { CRTStage, SectionResult, TestSession, TrialRecord } from "@/lib/types";

type Phase = "idle" | "intro" | "crt" | "break" | "stroop" | "done";


const CRT_ORDER: CRTStage[] = ["CRT1","CRT2","CRT3","CRT4","CRT5","CRT6","CRT7","CRT8"];

function sessionId() {
  return crypto.randomUUID();
}

function summarize(trials: TrialRecord[]) {
  const n = trials.length;
  const correct = trials.filter(t => t.correct);
  const rts = correct.map(t => t.rtMs);
  const acc = n === 0 ? 0 : correct.length / n;
  return {
    n,
    accuracy: acc,
    meanRtMs: mean(rts),
    medianRtMs: median(rts),
    errors: n - correct.length,
  };
}

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
  body: "Үгийн УТГЫГ БИШ, зөвхөн ӨНГИЙГ сонгоно.\nТовч: 1-Улаан, 2-Цэнхэр, 3-Ногоон, 4-Шар\nНийт 60.",
};


export default function TestPage() {

  type IntroState =
  | { kind: "crt"; stage: CRTStage; title: string; body: string }
  | { kind: "stroop"; title: string; body: string }
  | null;

  const [intro, setIntro] = useState<IntroState>(null);
  const pendingStartRef = useRef<null | (() => void)>(null);

  const [phase, setPhase] = useState<Phase>("idle");
  const [crtIndex, setCrtIndex] = useState(0);
  const [crtStimuli, setCrtStimuli] = useState<CRTStimulus[]>([]);
  const [crtTrial, setCrtTrial] = useState(0);

  const [stroopStimuli, setStroopStimuli] = useState<StroopStimulus[]>([]);
  const [stroopTrial, setStroopTrial] = useState(0);

  const [leftLabel, setLeftLabel] = useState("Зүүн");
  const [rightLabel, setRightLabel] = useState("Баруун");
  const [message, setMessage] = useState<string | null>(null);

  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [stroopResult, setStroopResult] = useState<SectionResult | null>(null);

  const trialStartRef = useRef<number>(0);
  const sectionStartRef = useRef<number>(0);
  const trialsRef = useRef<TrialRecord[]>([]);
  const savedRef = useRef(false);

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

    // labels per stage
    const labels: Record<CRTStage, [string, string]> = {
      CRT1: ["Ургамал", "Амьтан"],
      CRT2: ["Нэг үетэй", "Хоёр үетэй"],
      CRT3: ["Тэгш", "Сондгой"],
      CRT4: ["500-с бага", "500-с их"],
      CRT5: ["Дээш чиглэсэн", "Доош чиглэсэн"],
      CRT6: ["Дээд", "Доод"],
      CRT7: ["Холбогдсон", "Холбогдоогүй"],
      CRT8: ["Босоо тэнхлэг", "Хэвтээ тэнхлэг"],
    };
    const [l, r] = labels[stage];
    setLeftLabel(l);
    setRightLabel(r);

    // start timing after short delay so user sees stimulus
    setTimeout(() => { trialStartRef.current = performance.now(); }, 50);
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
    setSectionResults(prev => [...prev, res]);
  }

  function startBreak() {
    setPhase("break");
    setMessage("CRT дууслаа. 10 секунд амраад Stroop эхэлнэ...");
    let t = 10;
    const interval = setInterval(() => {
      t -= 1;
      setMessage(`CRT дууслаа. ${t} секундийн дараа Stroop эхэлнэ...`);
      if (t <= 0) {
        clearInterval(interval);
        //startStroop();
        openStroopIntro();

      }
    }, 1000);
  }

  function startStroop() {
    const trials = makeStroopTrials(60);
    setStroopStimuli(trials);
    setStroopTrial(0);
    trialsRef.current = [];
    sectionStartRef.current = Date.now();
    setPhase("stroop");
    setMessage(null);
    setLeftLabel("—");
    setRightLabel("—");
    setTimeout(() => { trialStartRef.current = performance.now(); }, 50);
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
    const stimulusLabel = currentCRTStimulus.type === "word" || currentCRTStimulus.type === "number"
      ? currentCRTStimulus.text
      : currentCRTStimulus.type === "arrowAngle"
        ? `angle:${currentCRTStimulus.angleDeg.toFixed(1)}`
        : currentCRTStimulus.type === "arrowPos"
          ? `angle:${currentCRTStimulus.angleDeg.toFixed(1)} y:${currentCRTStimulus.y}`
          : `grid:${currentCRTStimulus.cells.map(v=>v?1:0).join("")}`;

    recordAnswer(answer, correctAnswer, stimulusLabel);

    const next = crtTrial + 1;
    if (next >= crtStimuli.length) {
      finishCRTSection(currentStage);
      // next section or break
      if (crtIndex + 1 < CRT_ORDER.length) {
        setCrtIndex(crtIndex + 1);
        // small pause between sections
        setPhase("idle");
        setMessage(`${currentStage} дууслаа. Дараагийн хэсэг эхлэх гэж байна...`);
        setTimeout(() => openCRTIntro(CRT_ORDER[crtIndex + 1]), 600);

      } else {
        // done CRT
        setPhase("idle");
        setMessage("CRT.8 дууслаа. Амралт эхэлж байна...");
        setTimeout(() => startBreak(), 700);
      }
    } else {
      setCrtTrial(next);
      setTimeout(() => { trialStartRef.current = performance.now(); }, 50);
    }
  }

  function handleStroopAnswer(inkName: string) {
    if (!currentStroop) return;
    const correctAnswer = currentStroop.inkName;
    const stimulusLabel = `${currentStroop.word}|${currentStroop.inkName}|${currentStroop.condition}`;
    recordAnswer(inkName, correctAnswer, stimulusLabel);

    const next = stroopTrial + 1;
    if (next >= stroopStimuli.length) {
      // finalize stroop
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
    } else {
      setStroopTrial(next);
      setTimeout(() => { trialStartRef.current = performance.now(); }, 50);
    }
  }

  // Keyboard support
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === "crt") {
        if (e.key === "ArrowLeft") handleCRTAnswer(leftLabel);
        if (e.key === "ArrowRight") handleCRTAnswer(rightLabel);
      }
      // Stroop: keys 1-4 for colors
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

// Save session once when completed
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
  addSession(session);
}, [phase, stroopResult, sectionResults]);


  // Initial start

  const start = () => {
  savedRef.current = false;
  setSectionResults([]);
  setStroopResult(null);
  setCrtIndex(0);
  openCRTIntro("CRT1");
};

  // const start = () => {
  //   savedRef.current = false;
  //   setSectionResults([]);
  //   setStroopResult(null);
  //   setCrtIndex(0);
  //   startCRTSection("CRT1");
  // };

  const currentTitle = (() => {
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
    if (phase === "stroop") {
      return 100;
    }
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
              {phase === "crt" ? `Trial ${crtTrial + 1}/${crtStimuli.length}` : phase === "stroop" ? `Trial ${stroopTrial + 1}/${stroopStimuli.length}` : "—"}
            </span>
          </div>
        </div>
        {phase === "idle" && (
  <button
    className="btn btnPrimary"
    onClick={start}
    style={{
      fontSize: "20px",
      padding: "20px 36px",
    }}
  >
    Эхлэх
  </button>
)}

      </div>

      {message && <div className="toast">{message}</div>}

      <div className="stimulusBox">

        {phase === "intro" && intro && (
  <div style={{ textAlign: "center", maxWidth: 700 }}>
    <div className="bigText" style={{ fontSize: 34 }}>{intro.title}</div>
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

        {phase === "idle" && !message && !intro && (

          <div>
            <div className="bigText">Бэлэн үү?</div>
            <div className="smallNote">Эхлэх дээр дарна уу.</div>
          </div>
        )}

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
    
    {/* === Дээд / Доод зааг === */}
    <div className="dividerLine" />

    {/* === Сум === */}
    <div
      style={{
        position: "absolute",
        left: "50%",
        top: currentCRTStimulus.y === "top" ? "25%" : "75%",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Arrow angleDeg={currentCRTStimulus.angleDeg} />
    </div>
  </div>
)}

            {currentCRTStimulus.type === "grid" && (
              <Grid33 cells={currentCRTStimulus.cells} />
            )}
          </>
        )}

        {phase === "stroop" && currentStroop && (
          <div className="bigText" style={{ color: currentStroop.ink }}>
            {currentStroop.word}
            <div className="smallNote" style={{ marginTop: 10, color: "rgba(255,255,255,.65)" }}>
              Өнгийг сонгоно уу (үгний утгыг бус)
            </div>
          </div>
        )}

        {phase === "done" && (
          <div>
            <div className="bigText">Дууслаа ✅</div>
            <div className="smallNote">History хуудас руу орж үр дүнгээ харна уу.</div>
          </div>
        )}
      </div>

      {/* Controls */}
      {phase === "crt" && (
  <div
    className="btnRow"
    style={{
      justifyContent: "center",
      alignItems: "center",
      marginTop: "24px",
    }}
  >
    <button className="btn" onClick={() => handleCRTAnswer(leftLabel)}>
      ← {leftLabel}
    </button>
    <button className="btn" onClick={() => handleCRTAnswer(rightLabel)}>
      {rightLabel} →
    </button>
  </div>
)}


      {phase === "stroop" && (
  <div
    className="btnRow"
    style={{
      justifyContent: "center",
      alignItems: "center",
      marginTop: "24px",
    }}
  >
    {STROOP_COLORS.map((c, i) => (
      <button
        key={c.name}
        className="btn"
        onClick={() => handleStroopAnswer(c.name)}
      >
        <span className="kbd">{i + 1}</span> {c.name}
      </button>
    ))}
  </div>
)}


      <hr className="hr" />
      <p className="smallNote">
        CRT: <span className="kbd">←</span>/<span className="kbd">→</span> • Stroop: <span className="kbd">1</span>-<span className="kbd">4</span>
      </p>
    </div>
  );
}

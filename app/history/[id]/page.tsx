"use client";
// test 
import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { loadHistory } from "@/lib/storage";
import { formatDate, formatMs } from "@/lib/stats";
import type { TestSession, SectionResult, TrialRecord } from "@/lib/types";

function sectionLabel(s: SectionResult["section"]) {
  return s === "STROOP" ? "STROOP" : s;
}

function renderStimulus(trial: TrialRecord) {
  const s = trial.stimulus;
  if (s.startsWith("grid:")) return "grid";
  if (s.startsWith("angle:")) return s;
  return s; // word/number/stroop label
}

export default function HistoryDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const session: TestSession | null = useMemo(() => {
    const all = loadHistory();
    return all.find((x) => x.id === id) ?? null;
  }, [id]);

  if (!id) {
    return (
      <div className="card">
        <h1 className="h1">Дэлгэрэнгүй</h1>
        <p className="p">Session ID олдсонгүй.</p>
        <Link className="btn" href="/history">Буцах</Link>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="card">
        <h1 className="h1">Дэлгэрэнгүй</h1>
        <p className="p">Тухайн түүх олдсонгүй (localStorage цэвэрлэгдсэн байж магадгүй).</p>
        <Link className="btn" href="/history">Буцах</Link>
      </div>
    );
  }

  const sections: SectionResult[] = [
    ...session.crt,
    ...(session.stroop ? [session.stroop] : []),
  ];

  const totalTrials = sections.reduce((a, s) => a + s.trials.length, 0); // 380
  const totalTimeMs = sections.reduce((a, s) => a + (s.endedAt - s.startedAt), 0);

  return (
    <div className="card">
      <div className="testHeader">
        <div>
          <h1 className="h1">Дэлгэрэнгүй үр дүн</h1>
          <p className="p">
            Огноо: <span className="mono">{formatDate(session.createdAt)}</span> •
            Trials: <b>{totalTrials}</b> •
            Нийт хугацаа: <b>{formatMs(totalTimeMs)}</b>
          </p>
          <p className="smallNote mono">ID: {session.id}</p>
        </div>
        <Link className="btn" href="/history">← Түүх рүү буцах</Link>
      </div>

      <hr className="hr" />

      {sections.map((sec) => {
        const secTime = sec.endedAt - sec.startedAt;
        return (
          <div key={sec.section} style={{ marginBottom: 22 }}>
            <div className="testHeader">
              <div>
                <h2 className="h2">{sectionLabel(sec.section)}</h2>
                <div className="pill">
                  <span>Trials</span><b>{sec.trials.length}</b>
                  <span className="mono">•</span>
                  <span>Acc</span><b>{(sec.summary.accuracy * 100).toFixed(1)}%</b>
                  <span className="mono">•</span>
                  <span>Mean RT</span><b>{formatMs(sec.summary.meanRtMs)}</b>
                  <span className="mono">•</span>
                  <span>Хугацаа</span><b>{formatMs(secTime)}</b>
                </div>
              </div>
            </div>

            <div style={{ overflowX: "auto", marginTop: 10 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Хэсэг</th>
                    <th>Stimulus</th>
                    <th>Зөв хариу</th>
                    <th>Таны хариу</th>
                    <th>Зөв/Буруу</th>
                    <th>RT</th>
                  </tr>
                </thead>
                <tbody>
                  {sec.trials.map((t) => (
                    <tr key={t.trialIndex}>
                      <td className="mono">{t.trialIndex + 1}</td>
                      <td className="mono">{sectionLabel(sec.section)}</td>
                      <td className="mono">{renderStimulus(t)}</td>
                      <td>{t.correctAnswer}</td>
                      <td>{t.userAnswer}</td>
                      <td>
                        {t.correct
                          ? <span className="good">Зөв</span>
                          : <span className="bad">Буруу</span>}
                      </td>
                      <td className="mono">{formatMs(t.rtMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <hr className="hr" />
          </div>
        );
      })}
    </div>
  );
}

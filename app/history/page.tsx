"use client";

import { useEffect, useMemo, useState } from "react";
import { clearHistory, loadHistory } from "@/lib/storage";
import { formatDate, formatMs } from "@/lib/stats";
import type { TestSession } from "@/lib/types";
import Link from "next/link";

//aaaaaa
export default function HistoryPage() {
  const [sessions, setSessions] = useState<TestSession[]>([]);

  useEffect(() => {
    setSessions(loadHistory());
  }, []);

  const totalSessions = sessions.length;

  const onClear = () => {
    clearHistory();
    setSessions([]);
  };

  return (
    <div className="card">
      <div className="testHeader">
        <div>
          <h1 className="h1">Тестийн түүх</h1>
          <p className="p">Нийт хадгалсан: <b>{totalSessions}</b></p>
        </div>
        <button className="btn btnDanger" onClick={onClear}>Бүгдийг устгах</button>
      </div>

      <hr className="hr" />

      {sessions.length === 0 ? (
        <p className="p">Одоогоор хадгалсан үр дүн алга байна.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Огноо</th>
              <th>CRT (8 хэсэг)</th>
              <th>Stroop</th>
              <th>Дэлгэрэнгүй</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => {
              const crtAcc = s.crt.reduce((a, sec) => a + sec.summary.accuracy, 0) / s.crt.length;
              const crtMean = s.crt.reduce((a, sec) => a + sec.summary.meanRtMs, 0) / s.crt.length;
              const stroop = s.stroop?.summary;
              return (
                <tr key={s.id}>
                  <td className="mono">{formatDate(s.createdAt)}</td>
                  <td>
                    <div><b>Acc:</b> {(crtAcc * 100).toFixed(1)}%</div>
                    <div><b>Mean RT:</b> {formatMs(crtMean)}</div>
                  </td>
                  <td>
                    {stroop ? (
                      <>
                        <div><b>Acc:</b> {(stroop.accuracy * 100).toFixed(1)}%</div>
                        <div><b>Mean RT:</b> {formatMs(stroop.meanRtMs)}</div>
                      </>
                    ) : (
                      <span className="p">—</span>
                    )}
                  <td>
  <Link className="btn btnGhost" href={`/history/${s.id}`}>
    Дэлгэрэнгүй харах
  </Link>
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <hr className="hr" />
      <p className="smallNote">
        Сануулга: History өгөгдөл нь зөвхөн таны браузерт хадгалагдана (server рүү илгээгдэхгүй).
      </p>
    </div>
  );
}

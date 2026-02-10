import { TestSession } from "./types";

const KEY = "crt_stroop_history_v1";

export function loadHistory(): TestSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TestSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(sessions: TestSession[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function addSession(session: TestSession) {
  const all = loadHistory();
  all.unshift(session);
  saveHistory(all);
}

export function clearHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
